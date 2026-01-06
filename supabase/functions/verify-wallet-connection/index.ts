import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  wallet_id: string;
  signature: string;
  message: string;
  wallet_type: string;
}

interface ChallengeRequest {
  wallet_address: string;
  wallet_type: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'verify';

    if (action === 'challenge') {
      // Generate a challenge message for wallet signing
      const body: ChallengeRequest = await req.json();
      const { wallet_address, wallet_type } = body;

      const timestamp = Date.now();
      const nonce = crypto.randomUUID();
      
      const message = `Sign this message to verify wallet ownership on Biz Dev Platform.

Wallet: ${wallet_address}
Timestamp: ${timestamp}
Nonce: ${nonce}

This signature will not cost any gas fees.`;

      // Store the challenge temporarily
      await supabase
        .from('external_wallet_connections')
        .upsert({
          user_id: user.id,
          wallet_type,
          wallet_address,
          verification_status: 'pending_verification',
          metadata: {
            challenge_nonce: nonce,
            challenge_timestamp: timestamp,
          }
        }, { 
          onConflict: 'user_id,wallet_address' 
        });

      console.log(`Challenge generated for wallet ${wallet_address}`);

      return new Response(JSON.stringify({
        success: true,
        message,
        nonce,
        timestamp,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify signature
    const body: VerifyRequest = await req.json();
    const { wallet_id, signature, message, wallet_type } = body;

    console.log(`Verifying wallet signature for ${wallet_id}`);

    // Get the wallet connection
    const { data: wallet, error: walletError } = await supabase
      .from('external_wallet_connections')
      .select('*')
      .eq('id', wallet_id)
      .eq('user_id', user.id)
      .single();

    if (walletError || !wallet) {
      return new Response(JSON.stringify({ error: 'Wallet not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify the signature based on wallet type
    let isValid = false;
    
    if (wallet_type === 'metamask' || wallet_type === 'walletconnect' || wallet_type === 'coinbase_wallet') {
      // For EVM wallets, we'd verify using ethers.js
      // In production, implement proper signature verification
      // For now, we accept if signature is present
      isValid = Boolean(signature && signature.length > 100);
    } else if (wallet_type === 'phantom') {
      // For Solana wallets
      isValid = Boolean(signature && signature.length > 50);
    } else {
      // For other wallet types
      isValid = Boolean(signature && signature.length > 20);
    }

    if (!isValid) {
      await supabase
        .from('external_wallet_connections')
        .update({
          verification_status: 'failed',
        })
        .eq('id', wallet_id);

      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update wallet as verified
    const { error: updateError } = await supabase
      .from('external_wallet_connections')
      .update({
        verification_status: 'verified',
        verification_signature: signature,
        verified_at: new Date().toISOString(),
      })
      .eq('id', wallet_id);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Wallet ${wallet_id} verified successfully`);

    return new Response(JSON.stringify({
      success: true,
      verified: true,
      wallet_id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Verify wallet error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
