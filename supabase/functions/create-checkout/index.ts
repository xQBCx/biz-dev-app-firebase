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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { product_id, quantity } = await req.json();

    if (!product_id || !quantity) {
      throw new Error("Product ID and quantity are required");
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from("ai_products")
      .select(`
        *,
        ai_providers (*)
      `)
      .eq("id", product_id)
      .eq("status", "active")
      .single();

    if (productError || !product) {
      throw new Error("Product not found or not active");
    }

    // Check stock
    if (product.stock_quantity < quantity) {
      throw new Error("Insufficient stock");
    }

    // Get or create Stripe customer
    const authHeader = req.headers.get("Authorization");
    let email: string | undefined;
    let userId: string | undefined;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData.user) {
        email = userData.user.email;
        userId = userData.user.id;
      }
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Calculate amounts
    const unitPrice = Number(product.retail_price);
    const subtotal = unitPrice * quantity;
    const taxAmount = 0; // Add tax logic if needed
    const totalAmount = subtotal + taxAmount;

    // Create order first
    const { data: order, error: orderError } = await supabase
      .from("ai_orders")
      .insert({
        user_id: userId,
        product_id: product.id,
        quantity,
        unit_price: unitPrice,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: "pending",
        customer_email: email || "guest@checkout.com",
        currency: "USD",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${product.name} - ${product.ai_providers.display_name}`,
              description: product.description || undefined,
            },
            unit_amount: Math.round(unitPrice * 100), // Convert to cents
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/ai-gift-cards`,
      metadata: {
        order_id: order.id,
        product_id: product.id,
      },
    });

    console.log(`Checkout session created: ${session.id} for order ${order.id}`);

    return new Response(
      JSON.stringify({
        url: session.url,
        session_id: session.id,
        order_id: order.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
