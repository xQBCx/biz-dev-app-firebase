import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, record } = await req.json();
    
    console.log('Processing notification for session update:', type, record);

    let notificationData: {
      userId: string;
      title: string;
      body: string;
      data: Record<string, any>;
    } | null = null;

    // Handle different session update types
    if (type === 'INSERT' && record.status === 'pending') {
      // New session request - notify photographer
      notificationData = {
        userId: record.photographer_id,
        title: 'New Flash Session Request',
        body: 'You have a new session request!',
        data: {
          type: 'session_request',
          sessionId: record.id,
        },
      };
    } else if (type === 'UPDATE' && record.status === 'active') {
      // Session accepted - notify client
      notificationData = {
        userId: record.client_id,
        title: 'Session Accepted',
        body: 'Your photographer has accepted the session!',
        data: {
          type: 'session_accepted',
          sessionId: record.id,
        },
      };
    } else if (type === 'UPDATE' && record.status === 'completed') {
      // Session completed - notify both parties
      // Notify client
      await sendNotification(supabase, {
        userId: record.client_id,
        title: 'Session Completed',
        body: 'Your session has been completed. View your photos!',
        data: {
          type: 'session_completed',
          sessionId: record.id,
        },
      });

      // Notify photographer
      notificationData = {
        userId: record.photographer_id,
        title: 'Session Completed',
        body: 'Session completed successfully!',
        data: {
          type: 'session_completed',
          sessionId: record.id,
        },
      };
    }

    if (notificationData) {
      await sendNotification(supabase, notificationData);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in notify-session-update:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function sendNotification(
  supabase: any,
  payload: {
    userId: string;
    title: string;
    body: string;
    data: Record<string, any>;
  }
) {
  console.log('Calling send-notification function:', payload);
  
  const { error } = await supabase.functions.invoke('send-notification', {
    body: payload,
  });

  if (error) {
    console.error('Error calling send-notification:', error);
  }
}
