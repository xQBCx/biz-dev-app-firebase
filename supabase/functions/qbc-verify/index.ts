import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate SHA-256 hash
async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

    const { gio, expectedText, expectedHash, sourceContext } = await req.json();

    if (!gio) {
      return new Response(JSON.stringify({ error: 'GIO is required for verification' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const verificationResults: {
      gioIntegrity: boolean;
      hashMatch: boolean;
      textMatch: boolean | null;
      tamperingDetected: boolean;
      details: string[];
    } = {
      gioIntegrity: false,
      hashMatch: false,
      textMatch: null,
      tamperingDetected: false,
      details: [],
    };

    // Check GIO structure integrity
    if (gio.paths && Array.isArray(gio.paths) && gio.vertices && Array.isArray(gio.vertices)) {
      verificationResults.gioIntegrity = true;
      verificationResults.details.push('GIO structure is valid');
    } else {
      verificationResults.details.push('GIO structure is invalid or corrupted');
      verificationResults.tamperingDetected = true;
    }

    // Verify GIO hash if available
    if (gio.gioHash && gio.paths) {
      const computedGioHash = await hashContent(JSON.stringify(gio.paths));
      if (computedGioHash === gio.gioHash) {
        verificationResults.details.push('GIO hash verified successfully');
      } else {
        verificationResults.details.push('GIO hash mismatch - possible tampering');
        verificationResults.tamperingDetected = true;
      }
    }

    // Check against expected hash if provided
    if (expectedHash && gio.contentHash) {
      verificationResults.hashMatch = expectedHash === gio.contentHash;
      if (verificationResults.hashMatch) {
        verificationResults.details.push('Content hash matches expected value');
      } else {
        verificationResults.details.push('Content hash does not match expected value');
        verificationResults.tamperingDetected = true;
      }
    }

    // Check against expected text if provided (requires full decode)
    if (expectedText) {
      const computedHash = await hashContent(expectedText.toUpperCase());
      verificationResults.textMatch = computedHash === gio.contentHash;
      if (verificationResults.textMatch) {
        verificationResults.details.push('Text matches GIO content');
      } else {
        verificationResults.details.push('Text does not match GIO content');
      }
    }

    // Check timestamp validity
    if (gio.timestamp) {
      const gioDate = new Date(gio.timestamp);
      const now = new Date();
      const ageInDays = (now.getTime() - gioDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (ageInDays > 365) {
        verificationResults.details.push(`GIO is ${Math.floor(ageInDays)} days old - consider re-encoding`);
      } else {
        verificationResults.details.push(`GIO created ${Math.floor(ageInDays)} days ago`);
      }
    }

    // Log the verification operation
    const latticeId = gio.latticeId || null;
    await supabase.from('qbc_encoding_log').insert({
      user_id: user.id,
      lattice_id: latticeId,
      content_hash: gio.contentHash || 'unknown',
      gio_hash: gio.gioHash || null,
      encoding_type: 'verification',
      operation: 'verify',
      source_context: sourceContext || 'qbc_studio',
      metadata: {
        integrity_valid: verificationResults.gioIntegrity,
        hash_match: verificationResults.hashMatch,
        tampering_detected: verificationResults.tamperingDetected,
      },
    });

    return new Response(JSON.stringify({
      verified: verificationResults.gioIntegrity && !verificationResults.tamperingDetected,
      ...verificationResults,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('QBC Verify error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
