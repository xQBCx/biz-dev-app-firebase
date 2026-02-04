import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, title, body, data }: NotificationPayload = await req.json();

    console.log('Sending notification to user:', userId);

    // Get user's device tokens
    const { data: tokens, error: tokenError } = await supabase
      .from('device_tokens')
      .select('*')
      .eq('user_id', userId);

    if (tokenError) {
      console.error('Error fetching device tokens:', tokenError);
      throw tokenError;
    }

    if (!tokens || tokens.length === 0) {
      console.log('No device tokens found for user:', userId);
      return new Response(
        JSON.stringify({ message: 'No device tokens found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${tokens.length} device token(s) for user`);

    // Store notification in database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        data: data || {},
      });

    if (notificationError) {
      console.error('Error storing notification:', notificationError);
    }

    // Note: In a production environment, you would send push notifications here
    // using Firebase Cloud Messaging (FCM) for Android and Apple Push Notification Service (APNS) for iOS
    // This requires additional setup and API keys
    
    // Example FCM implementation (commented out - requires setup):
    /*
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    
    for (const token of tokens) {
      if (token.platform === 'android' || token.platform === 'ios') {
        const fcmPayload = {
          to: token.token,
          notification: {
            title,
            body,
          },
          data: data || {},
        };

        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${fcmServerKey}`,
          },
          body: JSON.stringify(fcmPayload),
        });

        const result = await response.json();
        console.log('FCM result:', result);
      }
    }
    */

    console.log('Notification processing completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent',
        tokenCount: tokens.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in send-notification function:', error);
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
