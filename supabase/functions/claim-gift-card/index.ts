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

    const { claim_url, email } = await req.json();

    if (!claim_url) {
      throw new Error("Claim URL is required");
    }

    console.log('Processing claim for:', claim_url);

    // Get gift card by claim URL
    const { data: card, error: cardError } = await supabase
      .from("ai_gift_cards")
      .select(`
        *,
        ai_products (
          name,
          description,
          face_value,
          ai_providers (
            display_name,
            logo_url,
            redemption_url
          )
        ),
        ai_orders (
          customer_name,
          brand_name,
          brand_logo_url,
          campaign_name
        )
      `)
      .eq("claim_url", claim_url)
      .single();

    if (cardError || !card) {
      console.error('Card not found:', cardError);
      throw new Error("Gift card not found");
    }

    // Check if already claimed
    if (card.claimed_at) {
      return new Response(
        JSON.stringify({ 
          error: "Gift card has already been claimed",
          claimed_at: card.claimed_at
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Check if expired
    if (new Date(card.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          error: "Gift card has expired",
          expires_at: card.expires_at
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Update card as claimed
    const { error: updateError } = await supabase
      .from("ai_gift_cards")
      .update({
        claimed_at: new Date().toISOString(),
        status: 'active',
        recipient_email: email || card.recipient_email
      })
      .eq("id", card.id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Release escrow funds (mark order as claimable)
    await supabase
      .from("ai_orders")
      .update({ escrow_status: 'claimable' })
      .eq("id", card.order_id);

    // Log the claim event
    await supabase.from("ai_audit_logs").insert({
      entity_type: "gift_card",
      entity_id: card.id,
      action: "claimed",
      new_values: {
        claimed_at: new Date().toISOString(),
        recipient_email: email || card.recipient_email
      },
    });

    console.log(`Gift card ${card.card_code} claimed successfully`);

    // Return gift card details for display
    return new Response(
      JSON.stringify({
        success: true,
        card: {
          card_code: card.card_code,
          face_value: card.face_value,
          remaining_value: card.remaining_value,
          expires_at: card.expires_at,
          provider_name: card.ai_products.ai_providers.display_name,
          provider_logo: card.ai_products.ai_providers.logo_url,
          redemption_url: card.ai_products.ai_providers.redemption_url,
          product_name: card.ai_products.name,
          occasion_title: card.occasion_title,
          occasion_message: card.occasion_message,
          sender_name: card.sender_name,
          brand_name: card.ai_orders.brand_name,
          brand_logo_url: card.ai_orders.brand_logo_url,
          campaign_name: card.ai_orders.campaign_name
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Claim error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
