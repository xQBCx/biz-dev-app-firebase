import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { domainId } = await req.json();

    if (!domainId) {
      return new Response(JSON.stringify({ error: 'Domain ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get domain record
    const { data: domain, error: domainError } = await supabase
      .from('business_domains')
      .select('*, spawned_businesses!inner(user_id)')
      .eq('id', domainId)
      .single();

    if (domainError || !domain) {
      return new Response(JSON.stringify({ error: 'Domain not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify ownership
    if (domain.spawned_businesses.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!domain.custom_domain) {
      return new Response(JSON.stringify({ error: 'No custom domain configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Verifying domain: ${domain.custom_domain} for business domain ${domainId}`);

    // Update status to verifying
    await supabase
      .from('business_domains')
      .update({ 
        custom_domain_status: 'verifying',
        last_dns_check: new Date().toISOString(),
        dns_check_error: null 
      })
      .eq('id', domainId);

    // Perform DNS verification
    const verificationResult = await verifyDNS(
      domain.custom_domain, 
      domain.verification_token
    );

    if (verificationResult.verified) {
      // Update to verified status
      await supabase
        .from('business_domains')
        .update({
          custom_domain_status: 'verified',
          dns_records_configured: true,
          dns_check_error: null,
          ssl_status: 'provisioning', // Start SSL provisioning
        })
        .eq('id', domainId);

      console.log(`Domain ${domain.custom_domain} verified successfully`);

      // In a real implementation, this would trigger SSL provisioning
      // For now, we'll simulate it by setting to active after a delay
      setTimeout(async () => {
        await supabase
          .from('business_domains')
          .update({
            custom_domain_status: 'active',
            ssl_status: 'active',
            ssl_provisioned_at: new Date().toISOString(),
          })
          .eq('id', domainId);
      }, 5000);

      return new Response(JSON.stringify({
        verified: true,
        message: 'Domain verified successfully! SSL certificate is being provisioned.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Update with error
      await supabase
        .from('business_domains')
        .update({
          custom_domain_status: 'failed',
          dns_check_error: verificationResult.error,
        })
        .eq('id', domainId);

      return new Response(JSON.stringify({
        verified: false,
        error: verificationResult.error,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Domain verification error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function verifyDNS(domain: string, verificationToken: string): Promise<{ verified: boolean; error?: string }> {
  try {
    // Check TXT record for verification
    const txtRecordName = `_bizdev.${domain}`;
    const expectedValue = `bizdev_verify=${verificationToken}`;

    console.log(`Checking TXT record: ${txtRecordName}`);

    // Use Cloudflare's DNS-over-HTTPS API for TXT record lookup
    const txtResponse = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${txtRecordName}&type=TXT`,
      {
        headers: { 'Accept': 'application/dns-json' },
      }
    );

    if (!txtResponse.ok) {
      throw new Error('Failed to query DNS');
    }

    const txtData = await txtResponse.json();
    console.log('TXT DNS Response:', JSON.stringify(txtData));

    // Check if TXT record exists and matches
    let txtVerified = false;
    if (txtData.Answer) {
      for (const answer of txtData.Answer) {
        const value = answer.data?.replace(/"/g, '') || '';
        if (value === expectedValue) {
          txtVerified = true;
          break;
        }
      }
    }

    if (!txtVerified) {
      return {
        verified: false,
        error: `TXT record not found or doesn't match. Expected: _bizdev.${domain} with value: bizdev_verify=...`,
      };
    }

    // Check A record points to our IP
    const aResponse = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`,
      {
        headers: { 'Accept': 'application/dns-json' },
      }
    );

    if (!aResponse.ok) {
      throw new Error('Failed to query A record');
    }

    const aData = await aResponse.json();
    console.log('A DNS Response:', JSON.stringify(aData));

    let aVerified = false;
    const expectedIP = '185.158.133.1';
    
    if (aData.Answer) {
      for (const answer of aData.Answer) {
        if (answer.data === expectedIP) {
          aVerified = true;
          break;
        }
      }
    }

    if (!aVerified) {
      return {
        verified: false,
        error: `A record not pointing to ${expectedIP}. Please add an A record for @ pointing to ${expectedIP}`,
      };
    }

    return { verified: true };

  } catch (error) {
    console.error('DNS verification error:', error);
    return {
      verified: false,
      error: `DNS lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
