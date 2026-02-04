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

    const { 
      product_id, 
      quantity,
      delivery_method = 'email',
      occasion_title,
      occasion_message,
      occasion_theme = 'custom',
      sender_name,
      recipient_name,
      recipient_email,
      recipient_phone,
      brand_name,
      brand_logo_url,
      campaign_name
    } = await req.json();

    if (!product_id || !quantity) {
      throw new Error("Product ID and quantity are required");
    }

    console.log('Creating checkout for product:', product_id, 'quantity:', quantity, 'delivery:', delivery_method);

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
      console.error('Product error:', productError);
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

    // Get dynamic pricing from database function
    const { data: pricingData, error: pricingError } = await supabase
      .rpc('calculate_gift_card_price', {
        face_value: Number(product.face_value),
        delivery_method: delivery_method,
        config_name: 'default'
      });

    if (pricingError || !pricingData) {
      console.error('Pricing calculation error:', pricingError);
      throw new Error('Failed to calculate pricing');
    }

    console.log('Dynamic pricing calculated:', pricingData);

    // Calculate order amounts using dynamic pricing
    const unitPrice = Number(pricingData.total_price);
    const subtotal = unitPrice * quantity;
    const taxAmount = 0; // Calculate based on jurisdiction if needed
    const totalAmount = subtotal + taxAmount;
    
    // Check if Black Friday promo is active
    const isBlackFriday = pricingData.is_black_friday || false;

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

    // Get pricing config for reference
    const { data: pricingConfig } = await supabase
      .from("ai_pricing_config")
      .select("id")
      .eq("config_name", "default")
      .eq("is_active", true)
      .single();

    // Generate unique order number
    const orderNumber = `AIG${new Date().toISOString().slice(0,10).replace(/-/g,'')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Create order record with personalization and branding
    const { data: order, error: orderError } = await supabase
      .from("ai_orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        customer_email: email || recipient_email || "guest@checkout.com",
        product_id: product_id,
        quantity: quantity,
        unit_price: unitPrice,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: "USD",
        status: "pending",
        delivery_method: delivery_method,
        delivery_email: recipient_email || email,
        delivery_phone: recipient_phone,
        brand_name: brand_name,
        brand_logo_url: brand_logo_url,
        campaign_name: campaign_name,
        is_black_friday_promo: isBlackFriday,
        pricing_config_id: pricingConfig?.id,
        calculated_fees: pricingData,
        metadata: {
          occasion_title,
          occasion_message,
          occasion_theme,
          sender_name,
          recipient_name,
          recipient_email,
          recipient_phone
        }
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw orderError;
    }

    console.log('Order created:', order.id);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : (email || recipient_email),
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${product.name} ${brand_name ? `- ${brand_name}` : ''}`,
              description: occasion_title ? `Gift Card: ${occasion_title}` : product.description || undefined,
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
        delivery_method: delivery_method,
        occasion_title: occasion_title || '',
        campaign_name: campaign_name || ''
      },
    });

    console.log(`Checkout session created: ${session.id} for order ${order.id}`);

    return new Response(
      JSON.stringify({
        url: session.url,
        session_id: session.id,
        order_id: order.id,
        total_amount: totalAmount,
        is_black_friday: isBlackFriday
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
