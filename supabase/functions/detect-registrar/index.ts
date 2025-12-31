import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Known registrar patterns from WHOIS data
const registrarPatterns: Record<string, { name: string; slug: string }> = {
  'godaddy': { name: 'GoDaddy', slug: 'godaddy' },
  'namecheap': { name: 'Namecheap', slug: 'namecheap' },
  'cloudflare': { name: 'Cloudflare', slug: 'cloudflare' },
  'google': { name: 'Google Domains', slug: 'google_domains' },
  'route 53': { name: 'AWS Route 53', slug: 'route53' },
  'amazon': { name: 'AWS Route 53', slug: 'route53' },
  'hover': { name: 'Hover', slug: 'hover' },
  'porkbun': { name: 'Porkbun', slug: 'porkbun' },
  'name.com': { name: 'Name.com', slug: 'namecom' },
  'dynadot': { name: 'Dynadot', slug: 'dynadot' },
  'gandi': { name: 'Gandi', slug: 'gandi' },
  'enom': { name: 'eNom', slug: 'enom' },
  'network solutions': { name: 'Network Solutions', slug: 'networksolutions' },
  'bluehost': { name: 'Bluehost', slug: 'bluehost' },
  'hostgator': { name: 'HostGator', slug: 'hostgator' },
  'squarespace': { name: 'Squarespace Domains', slug: 'squarespace' },
};

async function detectRegistrarFromWhois(domain: string): Promise<{ registrar: string | null; raw: string | null }> {
  try {
    // Use a WHOIS API service - we'll use a public one for now
    // In production, you'd use a paid service like WhoisXML API
    const response = await fetch(`https://rdap.org/domain/${domain}`, {
      headers: { 'Accept': 'application/rdap+json' }
    });
    
    if (!response.ok) {
      return { registrar: null, raw: null };
    }
    
    const data = await response.json();
    
    // Extract registrar from RDAP response
    const registrarEntity = data.entities?.find((e: any) => 
      e.roles?.includes('registrar')
    );
    
    const registrarName = registrarEntity?.vcardArray?.[1]?.find(
      (v: any) => v[0] === 'fn'
    )?.[3] || data.entities?.[0]?.handle || null;
    
    return { registrar: registrarName, raw: JSON.stringify(data) };
  } catch (error) {
    console.error('WHOIS lookup failed:', error);
    return { registrar: null, raw: null };
  }
}

function matchRegistrar(registrarName: string | null): { name: string; slug: string } | null {
  if (!registrarName) return null;
  
  const lowerName = registrarName.toLowerCase();
  
  for (const [pattern, info] of Object.entries(registrarPatterns)) {
    if (lowerName.includes(pattern)) {
      return info;
    }
  }
  
  return null;
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

    const { domain, domainId } = await req.json();

    if (!domain) {
      return new Response(JSON.stringify({ error: 'Domain is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Detect registrar from WHOIS
    const { registrar: whoisRegistrar, raw } = await detectRegistrarFromWhois(domain);
    const matchedRegistrar = matchRegistrar(whoisRegistrar);
    
    // Get registrar info from our registry if matched
    let registrarInfo = null;
    if (matchedRegistrar) {
      const { data: regData } = await supabase
        .from('registrar_registry')
        .select('*')
        .eq('registrar_name', matchedRegistrar.slug)
        .single();
      
      registrarInfo = regData;
    }

    // Check if user already has a connection to this registrar
    let existingConnection = null;
    if (registrarInfo) {
      const { data: connData } = await supabase
        .from('domain_registrar_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('registrar_id', registrarInfo.id)
        .eq('is_active', true)
        .single();
      
      existingConnection = connData;
    }

    // Update the domain record with detected registrar
    if (domainId && matchedRegistrar) {
      await supabase
        .from('business_domains')
        .update({ registrar_detected: matchedRegistrar.slug })
        .eq('id', domainId);
    }

    // Generate OAuth URL if supported
    let oauthUrl = null;
    if (registrarInfo?.oauth_enabled && registrarInfo?.oauth_authorize_url && matchedRegistrar) {
      const state = crypto.randomUUID();
      const redirectUri = `${supabaseUrl}/functions/v1/registrar-oauth/callback`;
      
      // Store state for verification
      if (domainId) {
        await supabase
          .from('business_domains')
          .update({ oauth_state: state })
          .eq('id', domainId);
      }

      const params = new URLSearchParams({
        client_id: Deno.env.get(`${matchedRegistrar.slug.toUpperCase()}_CLIENT_ID`) || 'bizdev-platform',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: registrarInfo.required_scopes?.join(' ') || '',
        state: JSON.stringify({ state, domainId, userId: user.id }),
      });

      oauthUrl = `${registrarInfo.oauth_authorize_url}?${params.toString()}`;
    }

    return new Response(JSON.stringify({
      success: true,
      domain,
      detected: {
        registrarName: whoisRegistrar,
        matched: matchedRegistrar,
        registrarInfo,
        hasExistingConnection: !!existingConnection,
        connectionId: existingConnection?.id
      },
      oauth: {
        enabled: registrarInfo?.oauth_enabled || false,
        url: oauthUrl
      },
      manualSetupRequired: !registrarInfo?.oauth_enabled
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error detecting registrar:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
