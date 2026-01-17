import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WatchlistItem {
  id: string;
  user_id: string;
  keywords: string[];
  industries: string[];
  regions: string[];
  opportunity_types: string[];
  min_value: number | null;
  is_active: boolean;
}

interface DiscoveredOpportunity {
  title: string;
  description: string;
  opportunity_type: string;
  source_url: string | null;
  relevance_score: number;
  estimated_value: number | null;
  key_contacts: string[];
  next_steps: string[];
  expires_at: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { watchlist_id, user_id, manual_query } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'AI API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch watchlist item or use manual query
    let searchCriteria: string;
    let watchlist: WatchlistItem | null = null;

    if (watchlist_id) {
      const { data, error } = await supabase
        .from('opportunity_watchlist')
        .select('*')
        .eq('id', watchlist_id)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Watchlist item not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      watchlist = data;
      searchCriteria = buildSearchCriteria(data);
    } else if (manual_query) {
      searchCriteria = manual_query;
    } else {
      return new Response(
        JSON.stringify({ error: 'Either watchlist_id or manual_query required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scanning for opportunities: ${searchCriteria.substring(0, 100)}...`);

    // Use Lovable AI to discover opportunities
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a business intelligence agent that discovers business opportunities based on user criteria.
Analyze the search criteria and generate 3-5 realistic, actionable business opportunities.

Return a JSON array of opportunities with this structure:
[{
  "title": "Clear opportunity title",
  "description": "2-3 sentence description of the opportunity",
  "opportunity_type": "one of: partnership, investment, contract, acquisition, talent, real_estate, consulting",
  "source_url": null,
  "relevance_score": 0-100,
  "estimated_value": number or null,
  "key_contacts": ["Person/role to contact"],
  "next_steps": ["Actionable step 1", "Step 2"],
  "industry": "Primary industry",
  "region": "Geographic region"
}]

Focus on realistic, current opportunities based on market trends and the specified criteria.
Return ONLY valid JSON array, no markdown or explanation.`
          },
          {
            role: 'user',
            content: `Find business opportunities matching: ${searchCriteria}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to scan for opportunities');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '[]';

    let opportunities: DiscoveredOpportunity[] = [];
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      opportunities = JSON.parse(cleanContent);
    } catch {
      console.error('Failed to parse AI response:', content);
      opportunities = [];
    }

    // Store discovered opportunities
    const insertedOpportunities = [];
    for (const opp of opportunities) {
      const { data, error } = await supabase
        .from('discovered_opportunities')
        .insert({
          user_id: user_id || watchlist?.user_id,
          watchlist_id: watchlist_id,
          title: opp.title,
          description: opp.description,
          opportunity_type: opp.opportunity_type || 'partnership',
          source_url: opp.source_url,
          relevance_score: Math.min(100, Math.max(0, opp.relevance_score || 50)),
          estimated_value: opp.estimated_value,
          metadata: {
            key_contacts: opp.key_contacts,
            next_steps: opp.next_steps,
            discovered_at: new Date().toISOString()
          },
          status: 'new',
          expires_at: opp.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (!error && data) {
        insertedOpportunities.push(data);
      }
    }

    // Update last_scanned_at if using watchlist
    if (watchlist_id) {
      await supabase
        .from('opportunity_watchlist')
        .update({ last_scanned_at: new Date().toISOString() })
        .eq('id', watchlist_id);
    }

    console.log(`Discovered ${insertedOpportunities.length} opportunities`);

    return new Response(
      JSON.stringify({
        success: true,
        opportunities_found: insertedOpportunities.length,
        opportunities: insertedOpportunities
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in opportunity-scanner:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildSearchCriteria(watchlist: WatchlistItem): string {
  const parts: string[] = [];

  if (watchlist.keywords?.length) {
    parts.push(`Keywords: ${watchlist.keywords.join(', ')}`);
  }
  if (watchlist.industries?.length) {
    parts.push(`Industries: ${watchlist.industries.join(', ')}`);
  }
  if (watchlist.regions?.length) {
    parts.push(`Regions: ${watchlist.regions.join(', ')}`);
  }
  if (watchlist.opportunity_types?.length) {
    parts.push(`Types: ${watchlist.opportunity_types.join(', ')}`);
  }
  if (watchlist.min_value) {
    parts.push(`Minimum value: $${watchlist.min_value.toLocaleString()}`);
  }

  return parts.join('\n') || 'General business opportunities';
}
