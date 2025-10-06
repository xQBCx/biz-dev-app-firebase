import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    const { session_id, order_id } = await req.json();

    if (!session_id || !order_id) {
      throw new Error("Session ID and Order ID are required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      // Update order status
      const { error: updateError } = await supabase
        .from("ai_orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", order_id);

      if (updateError) throw updateError;

      // Reduce stock
      const { data: order } = await supabase
        .from("ai_orders")
        .select("product_id, quantity")
        .eq("id", order_id)
        .single();

      if (order) {
        await supabase.rpc("decrement_stock", {
          product_id: order.product_id,
          qty: order.quantity,
        });
      }

      // Trigger fulfillment
      const { data: fulfillmentData, error: fulfillmentError } = await supabase.functions.invoke(
        "fulfill-order",
        {
          body: { order_id },
        }
      );

      if (fulfillmentError) {
        console.error("Fulfillment error:", fulfillmentError);
      }

      console.log(`Payment verified and order ${order_id} fulfilled`);

      return new Response(
        JSON.stringify({
          success: true,
          order_id,
          fulfillment: fulfillmentData,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      throw new Error("Payment not completed");
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
