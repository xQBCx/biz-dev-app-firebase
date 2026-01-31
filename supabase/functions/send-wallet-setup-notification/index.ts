import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { participant_id, deal_room_id, deal_room_name } = await req.json();

    if (!participant_id || !deal_room_id) {
      return new Response(
        JSON.stringify({ error: "Missing participant_id or deal_room_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get participant's user_id
    const { data: participant, error: participantError } = await supabase
      .from("deal_room_participants")
      .select("user_id, profiles:user_id(full_name, email)")
      .eq("id", participant_id)
      .single();

    if (participantError || !participant?.user_id) {
      console.error("Error fetching participant:", participantError);
      return new Response(
        JSON.stringify({ error: "Participant not found or has no user account" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const roomName = deal_room_name || "a Deal Room";

    // Create in-app notification
    const { error: notificationError } = await supabase
      .from("ai_proactive_notifications")
      .insert({
        user_id: participant.user_id,
        notification_type: "wallet_setup_required",
        title: "Set Up Your XDK Wallet",
        message: `You've been added to "${roomName}" to receive payouts. Complete your wallet setup to receive funds.`,
        action_type: "navigate",
        action_payload: { route: "/profile", tab: "wallet" },
        priority: "high",
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      return new Response(
        JSON.stringify({ error: "Failed to create notification" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `Wallet setup notification sent to user ${participant.user_id} for deal room ${deal_room_id}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-wallet-setup-notification:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
