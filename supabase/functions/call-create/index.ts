import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallCreateRequest {
  to_addr: string;
  from_addr?: string;
  modality: 'webrtc' | 'pstn' | 'hybrid';
  direction: 'outbound' | 'inbound';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: CallCreateRequest = await req.json();

    // Generate SFU room ID for WebRTC calls
    const sfu_room_id = body.modality === 'webrtc' || body.modality === 'hybrid'
      ? `room_${crypto.randomUUID()}`
      : null;

    // Create call record
    const { data: call, error: callError } = await supabase
      .from('calls')
      .insert({
        owner_user_id: user.id,
        direction: body.direction,
        modality: body.modality,
        from_addr: body.from_addr || user.email,
        to_addr: body.to_addr,
        sfu_room_id,
        status: 'init',
      })
      .select()
      .single();

    if (callError) {
      console.error('Error creating call:', callError);
      return new Response(
        JSON.stringify({ error: 'Failed to create call', details: callError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate TURN credentials (short-lived)
    const timestamp = Math.floor(Date.now() / 1000) + 600; // 10 min expiry
    const turnSecret = Deno.env.get('TURN_SHARED_SECRET') || 'default-secret';
    const username = `${timestamp}:${user.id}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(username);
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(turnSecret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, data);
    const credential = btoa(String.fromCharCode(...new Uint8Array(signature)));

    const turnServers = [
      {
        urls: 'stun:stun.l.google.com:19302',
      },
      {
        urls: Deno.env.get('TURN_SERVER_URL') || 'turn:turn.example.com:3478',
        username,
        credential,
      },
    ];

    console.log(`Call created: ${call.id}, direction: ${body.direction}, modality: ${body.modality}`);

    return new Response(
      JSON.stringify({
        call,
        iceServers: turnServers,
        sfuConfig: body.modality !== 'pstn' ? {
          roomId: sfu_room_id,
          endpoint: Deno.env.get('SFU_ENDPOINT') || 'wss://sfu.example.com',
        } : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in call-create function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
