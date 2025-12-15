import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { card_code, email } = await req.json();

    if (!card_code || !email) {
      return new Response(
        JSON.stringify({ error: "Card code and email are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Verifying gift card: ${card_code} for email: ${email}`);

    // Fetch gift card with product and provider details
    const { data: giftCard, error: fetchError } = await supabase
      .from("ai_gift_cards")
      .select(`
        *,
        product:ai_products!ai_gift_cards_product_id_fkey(name, description),
        provider:ai_providers!ai_gift_cards_provider_id_fkey(display_name, logo_url, redemption_url, primary_color)
      `)
      .eq("card_code", card_code.toUpperCase())
      .single();

    if (fetchError || !giftCard) {
      console.error("Gift card not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Gift card not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Verify email matches (if recipient_email is set)
    if (giftCard.recipient_email && giftCard.recipient_email.toLowerCase() !== email.toLowerCase()) {
      console.log("Email mismatch");
      return new Response(
        JSON.stringify({ error: "Email does not match the gift card recipient" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Check if already fully redeemed
    if (giftCard.remaining_value <= 0) {
      return new Response(
        JSON.stringify({ error: "This gift card has already been fully redeemed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check expiration
    if (new Date(giftCard.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This gift card has expired" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Return card details for redemption flow
    const cardDetails = {
      card_code: giftCard.card_code,
      face_value: giftCard.face_value,
      remaining_value: giftCard.remaining_value,
      expires_at: giftCard.expires_at,
      status: giftCard.status,
      product_name: giftCard.product?.name,
      product_description: giftCard.product?.description,
      provider_name: giftCard.provider?.display_name,
      provider_logo: giftCard.provider?.logo_url,
      provider_color: giftCard.provider?.primary_color,
      redemption_url: giftCard.provider?.redemption_url,
      flexible_redemption_enabled: giftCard.flexible_redemption_enabled ?? true,
      occasion_title: giftCard.occasion_title,
      occasion_message: giftCard.occasion_message,
      sender_name: giftCard.sender_name,
    };

    console.log("Gift card verified successfully");

    return new Response(
      JSON.stringify({ card: cardDetails }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    console.error("Verification error:", error);
    const message = error instanceof Error ? error.message : "Failed to verify gift card";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});