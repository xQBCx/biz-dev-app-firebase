import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLATFORM_IP = '185.158.133.1';
const PLATFORM_BASE_DOMAIN = 'bizdev.app';

// DNS configuration handlers for each registrar
const dnsConfigHandlers: Record<string, (connection: any, domain: string, verificationToken: string) => Promise<{ success: boolean; error?: string }>> = {
  cloudflare: async (connection, domain, verificationToken) => {
    try {
      // First, get the zone ID for this domain
      const zonesResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones?name=${domain}`,
        {
          headers: {
            'Authorization': `Bearer ${connection.access_token_encrypted}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const zonesData = await zonesResponse.json();
      if (!zonesData.success || !zonesData.result?.length) {
        return { success: false, error: 'Domain zone not found in Cloudflare' };
      }
      
      const zoneId = zonesData.result[0].id;
      
      // Create A record for root domain
      const aRecordResponse = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connection.access_token_encrypted}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'A',
            name: '@',
            content: PLATFORM_IP,
            ttl: 1, // Auto
            proxied: false,
          }),
        }
      );
      
      // Create A record for www
      await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connection.access_token_encrypted}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'A',
            name: 'www',
            content: PLATFORM_IP,
            ttl: 1,
            proxied: false,
          }),
        }
      );
      
      // Create TXT verification record
      await fetch(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connection.access_token_encrypted}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'TXT',
            name: '_bizdev',
            content: `bizdev-verify=${verificationToken}`,
            ttl: 1,
          }),
        }
      );
      
      const aRecordData = await aRecordResponse.json();
      if (!aRecordData.success) {
        return { success: false, error: aRecordData.errors?.[0]?.message || 'Failed to create DNS records' };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },
  
  godaddy: async (connection, domain, verificationToken) => {
    try {
      const records = [
        { type: 'A', name: '@', data: PLATFORM_IP, ttl: 600 },
        { type: 'A', name: 'www', data: PLATFORM_IP, ttl: 600 },
        { type: 'TXT', name: '_bizdev', data: `bizdev-verify=${verificationToken}`, ttl: 600 },
      ];
      
      const response = await fetch(
        `https://api.godaddy.com/v1/domains/${domain}/records`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `sso-key ${connection.access_token_encrypted}:${connection.refresh_token_encrypted}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(records),
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to update DNS' };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },
  
  namecheap: async (connection, domain, verificationToken) => {
    // Namecheap uses XML API
    try {
      const [sld, tld] = domain.split('.').slice(-2);
      
      const params = new URLSearchParams({
        ApiUser: connection.account_id || '',
        ApiKey: connection.access_token_encrypted,
        UserName: connection.account_id || '',
        Command: 'namecheap.domains.dns.setHosts',
        ClientIp: '127.0.0.1',
        SLD: sld,
        TLD: tld,
        HostName1: '@',
        RecordType1: 'A',
        Address1: PLATFORM_IP,
        TTL1: '600',
        HostName2: 'www',
        RecordType2: 'A',
        Address2: PLATFORM_IP,
        TTL2: '600',
        HostName3: '_bizdev',
        RecordType3: 'TXT',
        Address3: `bizdev-verify=${verificationToken}`,
        TTL3: '600',
      });
      
      const response = await fetch(
        `https://api.namecheap.com/xml.response?${params.toString()}`
      );
      
      const text = await response.text();
      if (text.includes('Status="ERROR"')) {
        return { success: false, error: 'Failed to update DNS records' };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },
};

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

    const { domainId } = await req.json();

    if (!domainId) {
      return new Response(JSON.stringify({ error: 'Domain ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get domain info with connection
    const { data: domainData, error: domainError } = await supabase
      .from('business_domains')
      .select(`
        *,
        registrar_connection:domain_registrar_connections(
          *,
          registrar:registrar_registry(*)
        )
      `)
      .eq('id', domainId)
      .single();

    if (domainError || !domainData) {
      return new Response(JSON.stringify({ error: 'Domain not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify ownership
    const { data: business } = await supabase
      .from('spawned_businesses')
      .select('user_id')
      .eq('id', domainData.business_id)
      .single();

    if (!business || business.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const connection = domainData.registrar_connection;
    if (!connection) {
      return new Response(JSON.stringify({ 
        error: 'No registrar connection found. Please connect your registrar first.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const registrarSlug = connection.registrar?.registrar_name;
    const handler = dnsConfigHandlers[registrarSlug];

    if (!handler) {
      return new Response(JSON.stringify({ 
        error: `Automatic DNS configuration not supported for ${connection.registrar?.display_name}. Please configure manually.`,
        manualRequired: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update status to configuring
    await supabase
      .from('business_domains')
      .update({ status: 'verifying' })
      .eq('id', domainId);

    // Configure DNS
    const result = await handler(connection, domainData.custom_domain, domainData.verification_token);

    if (!result.success) {
      await supabase
        .from('business_domains')
        .update({ 
          status: 'failed',
          dns_configuration_error: result.error 
        })
        .eq('id', domainId);

      return new Response(JSON.stringify({ 
        success: false,
        error: result.error 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Mark as configured
    await supabase
      .from('business_domains')
      .update({ 
        dns_auto_configured: true,
        dns_configuration_error: null,
        status: 'verifying'
      })
      .eq('id', domainId);

    // Update connection last used
    await supabase
      .from('domain_registrar_connections')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', connection.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'DNS records configured successfully. Verification in progress.',
      dnsConfigured: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error configuring DNS:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
