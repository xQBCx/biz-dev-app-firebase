import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgreementRequest {
  dealRoomId: string;
  termId: string;
  participantId?: string;
  action: 'agreed' | 'revoked' | 'viewed' | 'downloaded' | 'signed';
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify the requesting user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: AgreementRequest = await req.json();
    const { dealRoomId, termId, participantId, action, metadata = {} } = body;

    if (!dealRoomId || !termId || !action) {
      return new Response(JSON.stringify({ error: 'dealRoomId, termId, and action are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Capture verification data from request headers
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || req.headers.get('cf-connecting-ip')
      || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is a participant in this deal room
    const { data: participant, error: participantError } = await adminClient
      .from('deal_room_participants')
      .select('id')
      .eq('deal_room_id', dealRoomId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return new Response(JSON.stringify({ error: 'User is not a participant in this deal room' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the agreement action with verification data
    const { error: auditError } = await adminClient
      .from('deal_agreement_audit_log')
      .insert({
        deal_room_id: dealRoomId,
        term_id: termId,
        user_id: user.id,
        participant_id: participantId || participant.id,
        action,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: {
          ...metadata,
          timestamp_iso: new Date().toISOString(),
          user_email: user.email,
        },
      });

    if (auditError) {
      console.error('Error logging audit:', auditError);
      return new Response(JSON.stringify({ error: 'Failed to log agreement' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If this is an 'agreed' action, also update the term's agreed_by field
    if (action === 'agreed') {
      const { data: term, error: termError } = await adminClient
        .from('deal_room_terms')
        .select('agreed_by')
        .eq('id', termId)
        .single();

      if (termError) {
        console.error('Error fetching term:', termError);
        return new Response(JSON.stringify({ error: 'Failed to fetch term' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const currentAgreedBy = (term.agreed_by as Record<string, boolean>) || {};
      const newAgreedBy = { ...currentAgreedBy, [user.id]: true };

      const { error: updateError } = await adminClient
        .from('deal_room_terms')
        .update({ agreed_by: newAgreedBy })
        .eq('id', termId);

      if (updateError) {
        console.error('Error updating term:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update agreement' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // If this is a 'revoked' action, remove user from agreed_by
    if (action === 'revoked') {
      const { data: term, error: termError } = await adminClient
        .from('deal_room_terms')
        .select('agreed_by')
        .eq('id', termId)
        .single();

      if (!termError && term) {
        const currentAgreedBy = (term.agreed_by as Record<string, boolean>) || {};
        const { [user.id]: _, ...newAgreedBy } = currentAgreedBy;

        await adminClient
          .from('deal_room_terms')
          .update({ agreed_by: newAgreedBy })
          .eq('id', termId);
      }
    }

    console.log(`Agreement action logged: ${action} by ${user.email} for term ${termId} in deal room ${dealRoomId}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Agreement ${action} recorded with verification data`,
      auditData: {
        action,
        timestamp: new Date().toISOString(),
        ipRecorded: ipAddress !== 'unknown',
        userAgentRecorded: userAgent !== 'unknown',
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
