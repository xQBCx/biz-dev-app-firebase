import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const POPULAR_TLDS = ['.com', '.io', '.co', '.app', '.dev', '.net', '.org', '.ai'];

// Generate domain suggestions based on business name
function generateDomainSuggestions(businessName: string, industry?: string): string[] {
  const sanitized = businessName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '');
  
  const words = businessName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const suggestions: string[] = [];
  
  // Exact name variations
  suggestions.push(sanitized);
  suggestions.push(words.join(''));
  suggestions.push(words.join('-'));
  
  // With prefixes
  const prefixes = ['get', 'try', 'use', 'my', 'the', 'go'];
  prefixes.forEach(prefix => {
    suggestions.push(`${prefix}${sanitized}`);
    suggestions.push(`${prefix}-${sanitized}`);
  });
  
  // With suffixes
  const suffixes = ['app', 'hq', 'hub', 'io', 'now', 'pro', 'plus'];
  suffixes.forEach(suffix => {
    suggestions.push(`${sanitized}${suffix}`);
    suggestions.push(`${sanitized}-${suffix}`);
  });
  
  // Industry-specific suggestions
  if (industry) {
    const industryWord = industry.toLowerCase().split(/\s+/)[0];
    suggestions.push(`${sanitized}-${industryWord}`);
    suggestions.push(`${industryWord}-${sanitized}`);
  }
  
  // First letters (acronym)
  if (words.length >= 2) {
    const acronym = words.map(w => w[0]).join('');
    suggestions.push(acronym);
    suggestions.push(`${acronym}${words[words.length - 1]}`);
  }
  
  return [...new Set(suggestions)].filter(s => s.length >= 3 && s.length <= 63);
}

// Check domain availability (mock - in production use registrar APIs)
async function checkDomainAvailability(domains: string[]): Promise<Array<{
  domain: string;
  tld: string;
  fullDomain: string;
  available: boolean;
  price: number;
  premium: boolean;
}>> {
  const results: Array<{
    domain: string;
    tld: string;
    fullDomain: string;
    available: boolean;
    price: number;
    premium: boolean;
  }> = [];
  
  // In production, this would call registrar APIs like GoDaddy or Namecheap
  // For now, we'll simulate availability checks
  for (const domain of domains) {
    for (const tld of POPULAR_TLDS) {
      const fullDomain = `${domain}${tld}`;
      
      // Simulate: shorter domains are less likely available, longer ones more likely
      const availabilityChance = Math.min(0.3 + (domain.length * 0.05), 0.8);
      const isAvailable = Math.random() < availabilityChance;
      
      // Price varies by TLD and perceived value
      const basePrice = tld === '.com' ? 1299 : tld === '.io' ? 4999 : tld === '.ai' ? 7999 : 1499;
      const isPremium = domain.length <= 5 && Math.random() < 0.3;
      const price = isPremium ? basePrice * 10 : basePrice;
      
      results.push({
        domain,
        tld,
        fullDomain,
        available: isAvailable,
        price,
        premium: isPremium,
      });
    }
  }
  
  return results;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { businessId, businessName, industry, customQuery } = await req.json();

    const nameToUse = customQuery || businessName;
    if (!nameToUse) {
      return new Response(JSON.stringify({ error: 'Business name or custom query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate suggestions
    const baseSuggestions = generateDomainSuggestions(nameToUse, industry);
    
    // Check availability for top suggestions
    const topSuggestions = baseSuggestions.slice(0, 10);
    const availabilityResults = await checkDomainAvailability(topSuggestions);
    
    // Sort by: available first, then by price, then by length
    const sortedResults = availabilityResults
      .sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;
        if (a.premium !== b.premium) return a.premium ? 1 : -1;
        if (a.price !== b.price) return a.price - b.price;
        return a.domain.length - b.domain.length;
      });

    // Store suggestions in database
    if (businessId) {
      const suggestionsToStore = sortedResults.slice(0, 20).map(r => ({
        business_id: businessId,
        user_id: user.id,
        domain_name: r.domain,
        tld: r.tld,
        full_domain: r.fullDomain,
        is_available: r.available,
        price_cents: r.price,
        is_premium: r.premium,
        suggestion_type: 'ai_generated',
        checked_at: new Date().toISOString(),
      }));

      await supabase
        .from('domain_suggestions')
        .upsert(suggestionsToStore, { 
          onConflict: 'id',
          ignoreDuplicates: true 
        });
    }

    // Group by availability for cleaner response
    const available = sortedResults.filter(r => r.available);
    const unavailable = sortedResults.filter(r => !r.available);

    return new Response(JSON.stringify({
      success: true,
      suggestions: {
        available: available.slice(0, 15),
        unavailable: unavailable.slice(0, 5),
        total: sortedResults.length,
      },
      query: nameToUse,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error suggesting domains:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
