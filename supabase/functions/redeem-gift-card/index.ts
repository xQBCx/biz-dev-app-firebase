import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { card_code, email } = await req.json();

    if (!card_code || !email) {
      throw new Error("Card code and email are required");
    }

    // Find the gift card
    const { data: giftCard, error: cardError } = await supabase
      .from("ai_gift_cards")
      .select(`
        *,
        ai_products (
          *,
          ai_providers (*)
        ),
        ai_orders (*)
      `)
      .eq("card_code", card_code)
      .single();

    if (cardError || !giftCard) {
      throw new Error("Invalid card code");
    }

    // Check if already redeemed
    if (giftCard.status !== "pending" && giftCard.status !== "active") {
      throw new Error("This card has already been redeemed or is inactive");
    }

    // Check if expired
    if (new Date(giftCard.expires_at) < new Date()) {
      throw new Error("This card has expired");
    }

    // Check if there's remaining value
    if (giftCard.remaining_value <= 0) {
      throw new Error("This card has no remaining value");
    }

    // Create redemption record
    const { data: redemption, error: redemptionError } = await supabase
      .from("ai_redemptions")
      .insert({
        gift_card_id: giftCard.id,
        amount_redeemed: giftCard.remaining_value,
        redeemed_email: email,
        provider_account_created: false,
        affiliate_eligible: true,
      })
      .select()
      .single();

    if (redemptionError) throw redemptionError;

    // Update gift card status
    const { error: updateError } = await supabase
      .from("ai_gift_cards")
      .update({
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
        remaining_value: 0,
        last_activity_at: new Date().toISOString(),
        redemption_count: (giftCard.redemption_count || 0) + 1,
      })
      .eq("id", giftCard.id);

    if (updateError) throw updateError;

    // Log the redemption
    await supabase.from("ai_audit_logs").insert({
      entity_type: "gift_card",
      entity_id: giftCard.id,
      action: "redeemed",
      new_values: {
        card_code,
        email,
        amount: giftCard.remaining_value,
      },
    });

    // Return redemption info
    return new Response(
      JSON.stringify({
        success: true,
        amount: giftCard.remaining_value,
        provider_name: giftCard.ai_products.ai_providers.display_name,
        redemption_url: giftCard.redemption_url || giftCard.ai_products.ai_providers.redemption_url,
        provider_account_id: giftCard.provider_account_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Redemption error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
