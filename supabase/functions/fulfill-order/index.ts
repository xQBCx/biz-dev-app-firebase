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

    const { order_id } = await req.json();

    if (!order_id) {
      throw new Error("Order ID is required");
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("ai_orders")
      .select(`
        *,
        ai_products (
          *,
          ai_providers (*)
        )
      `)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    if (order.status !== "paid") {
      throw new Error("Order must be paid before fulfillment");
    }

    // Generate gift cards for this order
    const cards = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + order.ai_products.valid_days);

    for (let i = 0; i < order.quantity; i++) {
      const { data: card, error: cardError } = await supabase
        .from("ai_gift_cards")
        .insert({
          order_id: order.id,
          product_id: order.product_id,
          provider_id: order.ai_products.provider_id,
          face_value: order.ai_products.face_value,
          remaining_value: order.ai_products.face_value,
          card_type: order.ai_products.card_type,
          status: "active",
          expires_at: expiresAt.toISOString(),
          activated_at: new Date().toISOString(),
          redemption_url: order.ai_products.ai_providers.redemption_url,
        })
        .select()
        .single();

      if (cardError) {
        console.error("Error creating card:", cardError);
        continue;
      }

      cards.push(card);
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("ai_orders")
      .update({
        fulfillment_status: "fulfilled",
      })
      .eq("id", order_id);

    if (updateError) throw updateError;

    // Log fulfillment
    await supabase.from("ai_audit_logs").insert({
      entity_type: "order",
      entity_id: order_id,
      action: "fulfilled",
      new_values: {
        cards_generated: cards.length,
      },
    });

    console.log(`Order ${order_id} fulfilled with ${cards.length} cards`);

    return new Response(
      JSON.stringify({
        success: true,
        cards_generated: cards.length,
        cards: cards,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Fulfillment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
