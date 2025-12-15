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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { card_code, email, redemption_method = 'platform_credits', payout_details = {} } = await req.json();

    if (!card_code || !email) {
      throw new Error("Card code and email are required");
    }

    console.log(`Processing redemption: ${card_code}, method: ${redemption_method}`);

    // Find the gift card with related data
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
      .eq("card_code", card_code.toUpperCase())
      .single();

    if (cardError || !giftCard) {
      throw new Error("Invalid card code");
    }

    // Verify email matches
    if (giftCard.recipient_email && giftCard.recipient_email.toLowerCase() !== email.toLowerCase()) {
      throw new Error("Email does not match the gift card recipient");
    }

    // Check if already redeemed
    if (giftCard.status === "redeemed" || giftCard.remaining_value <= 0) {
      throw new Error("This card has already been fully redeemed");
    }

    // Check if expired
    if (new Date(giftCard.expires_at) < new Date()) {
      throw new Error("This card has expired");
    }

    const redeemAmount = giftCard.remaining_value;
    const provider = giftCard.ai_products?.ai_providers;

    // Create redemption record with method
    const { data: redemption, error: redemptionError } = await supabase
      .from("ai_redemptions")
      .insert({
        gift_card_id: giftCard.id,
        amount_redeemed: redeemAmount,
        redeemed_email: email,
        redemption_method: redemption_method,
        payout_status: redemption_method === 'platform_credits' ? 'completed' : 'pending',
        recipient_payout_details: payout_details,
        provider_account_created: redemption_method === 'platform_credits',
        affiliate_eligible: true,
      })
      .select()
      .single();

    if (redemptionError) {
      console.error("Redemption insert error:", redemptionError);
      throw redemptionError;
    }

    // If not platform credits, create a payout request
    if (redemption_method !== 'platform_credits') {
      const payoutData: Record<string, unknown> = {
        redemption_id: redemption.id,
        gift_card_id: giftCard.id,
        amount: redeemAmount,
        payout_method: redemption_method,
        recipient_email: email,
        recipient_name: payout_details.shippingName || null,
        status: 'pending',
      };

      // Add method-specific details
      if (redemption_method === 'prepaid_card') {
        payoutData.shipping_address = {
          name: payout_details.shippingName,
          address: payout_details.shippingAddress,
          city: payout_details.shippingCity,
          state: payout_details.shippingState,
          zip: payout_details.shippingZip,
        };
      } else if (redemption_method === 'bank_deposit') {
        payoutData.bank_account_last4 = payout_details.bankAccountLast4;
        payoutData.bank_routing_last4 = payout_details.bankRoutingLast4;
      } else if (redemption_method === 'paypal') {
        payoutData.paypal_email = payout_details.paypalEmail;
      } else if (redemption_method === 'venmo') {
        payoutData.venmo_handle = payout_details.venmoHandle;
      }

      const { error: payoutError } = await supabase
        .from("ai_payout_requests")
        .insert(payoutData);

      if (payoutError) {
        console.error("Payout request error:", payoutError);
        // Don't throw, redemption is still valid
      }
    }

    // Update gift card status
    const { error: updateError } = await supabase
      .from("ai_gift_cards")
      .update({
        status: "redeemed",
        redeemed_at: new Date().toISOString(),
        remaining_value: 0,
        last_activity_at: new Date().toISOString(),
        redemption_count: (giftCard.redemption_count || 0) + 1,
        actual_redemption_method: redemption_method,
      })
      .eq("id", giftCard.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    // Log the redemption
    await supabase.from("ai_audit_logs").insert({
      entity_type: "gift_card",
      entity_id: giftCard.id,
      action: "redeemed",
      new_values: {
        card_code,
        email,
        amount: redeemAmount,
        redemption_method,
        payout_details: redemption_method !== 'platform_credits' ? payout_details : null,
      },
    });

    console.log(`Redemption successful: ${giftCard.id}, method: ${redemption_method}`);

    // Build response based on redemption method
    const response: Record<string, unknown> = {
      success: true,
      amount: redeemAmount,
      redemption_method,
      provider_name: provider?.display_name,
    };

    if (redemption_method === 'platform_credits') {
      response.redemption_url = giftCard.redemption_url || provider?.redemption_url;
      response.provider_account_id = giftCard.provider_account_id;
      response.message = `Your ${provider?.display_name} credits are ready to use!`;
    } else if (redemption_method === 'prepaid_card') {
      response.message = `Your $${redeemAmount} prepaid card will be shipped to your address within 3-5 business days.`;
      response.estimated_delivery = '3-5 business days';
    } else if (redemption_method === 'bank_deposit') {
      response.message = `Your $${redeemAmount} bank deposit is being processed. Check your email for verification.`;
      response.estimated_delivery = '1-2 business days';
    } else if (redemption_method === 'paypal') {
      response.message = `Your $${redeemAmount} has been sent to ${payout_details.paypalEmail}`;
      response.estimated_delivery = 'Instant';
    } else if (redemption_method === 'venmo') {
      response.message = `Your $${redeemAmount} has been sent to @${payout_details.venmoHandle}`;
      response.estimated_delivery = 'Instant';
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Redemption error:", error);
    const message = error instanceof Error ? error.message : "Failed to redeem gift card";
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});