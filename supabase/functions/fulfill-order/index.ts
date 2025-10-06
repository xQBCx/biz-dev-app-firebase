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

    // Send email with gift cards
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      
      const cardsList = cards.map((card: any) => `
        <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">${order.ai_products.name}</h3>
          <p><strong>Card Code:</strong> ${card.card_code}</p>
          <p><strong>Value:</strong> $${card.face_value}</p>
          <p><strong>Expires:</strong> ${new Date(card.expires_at).toLocaleDateString()}</p>
          <p><a href="${card.redemption_url}" style="color: #4A90E2; text-decoration: none; font-weight: bold;">Redeem Now →</a></p>
        </div>
      `).join('');

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AI Gift Cards <onboarding@resend.dev>',
          to: [order.customer_email],
          subject: `Your AI Gift Cards - Order ${order.order_number}`,
          html: `
            <h1>Thank you for your purchase!</h1>
            <p>Hi ${order.customer_name || 'there'},</p>
            <p>Your AI gift cards are ready! Here are your ${cards.length} gift card(s):</p>
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
              ${cardsList}
            </div>
            <p style="color: #666;">Keep these codes safe! You can redeem them at any time before the expiration date.</p>
            <p>Best regards,<br>The AI Gift Cards Team</p>
          `,
        }),
      });

      if (emailResponse.ok) {
        console.log('Gift card email sent successfully to', order.customer_email);
      } else {
        const errorData = await emailResponse.text();
        console.error('Resend API error:', errorData);
      }
    } catch (emailError) {
      console.error('Failed to send gift card email:', emailError);
      // Don't fail the whole fulfillment if email fails
    }

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
