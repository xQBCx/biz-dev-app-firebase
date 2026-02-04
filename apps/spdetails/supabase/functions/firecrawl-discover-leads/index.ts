import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiscoverRequest {
  leadType: string;
  location: string;
  limit?: number;
}

const leadTypeSearchQueries: Record<string, string> = {
  office_building: "office buildings corporate offices business parks",
  golf_course: "golf courses country clubs golf clubs",
  high_income_neighborhood: "HOA homeowners association luxury neighborhoods gated communities",
  dealership_small: "car dealerships auto dealers used car lots",
  dealership_luxury: "luxury car dealership BMW Mercedes Lexus Porsche dealer",
  fleet_company: "fleet management trucking company delivery service logistics company"
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadType, location, limit = 20 }: DiscoverRequest = await req.json();

    if (!leadType || !location) {
      return new Response(
        JSON.stringify({ success: false, error: 'leadType and location are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchTerms = leadTypeSearchQueries[leadType] || leadType;
    const query = `${searchTerms} ${location}`;
    
    console.log('Searching for leads:', query);

    // Use Firecrawl search to find businesses
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: Math.min(limit, 50),
        scrapeOptions: {
          formats: ['markdown']
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Search failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse search results into lead format
    const leads = (data.data || []).map((result: any) => {
      // Extract business info from result
      const title = result.title || '';
      const description = result.description || '';
      const url = result.url || '';
      const markdown = result.markdown || '';
      
      // Try to extract contact info from markdown content
      const emailMatch = markdown.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = markdown.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      
      // Extract address from content if possible
      const addressMatch = markdown.match(/\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)[,\s]+[\w\s]+,?\s*(?:TX|Texas)?\s*\d{5}?/i);

      return {
        business_name: title.replace(/\s*[-|]\s*.*$/, '').trim() || 'Unknown Business',
        source_url: url,
        email: emailMatch ? emailMatch[0] : null,
        phone: phoneMatch ? phoneMatch[0] : null,
        address: addressMatch ? addressMatch[0] : null,
        description: description,
        raw_content: markdown.substring(0, 500)
      };
    }).filter((lead: any) => lead.business_name && lead.business_name !== 'Unknown Business');

    console.log(`Found ${leads.length} potential leads`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        leads,
        query,
        total: leads.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error discovering leads:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to discover leads';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
