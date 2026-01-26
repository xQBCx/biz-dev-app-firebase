import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ESCROW-PAYMENT-INTENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      logStep("ERROR: Stripe not configured");
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("Authentication failed", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { deal_room_id, amount, currency = "USD", xdk_conversion = true, description } = await req.json();

    if (!deal_room_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: deal_room_id and amount required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (amount < 10) {
      return new Response(
        JSON.stringify({ error: "Minimum funding amount is $10" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Creating payment intent", { dealRoomId: deal_room_id, amount });

    // Verify user has access to this deal room
    const { data: participant } = await supabase
      .from("deal_room_participants")
      .select("id")
      .eq("deal_room_id", deal_room_id)
      .eq("user_id", user.id)
      .single();

    const { data: dealRoom } = await supabase
      .from("deal_rooms")
      .select("id, name, created_by")
      .eq("id", deal_room_id)
      .single();

    if (!participant && dealRoom?.created_by !== user.id) {
      logStep("Access denied", { userId: user.id, dealRoomId: deal_room_id });
      return new Response(
        JSON.stringify({ error: "Access denied to this deal room" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create escrow funding request record
    const { data: fundingRequest, error: fundingError } = await supabase
      .from("escrow_funding_requests")
      .insert({
        deal_room_id,
        user_id: user.id,
        amount,
        currency,
        xdk_conversion,
        status: "pending",
        metadata: {
          description: description || `Escrow funding for ${dealRoom?.name || 'Deal Room'}`,
          initiated_at: new Date().toISOString(),
          payment_method: "payment_intent",
        },
      })
      .select()
      .single();

    if (fundingError) {
      logStep("Failed to create funding request", { error: fundingError });
      throw fundingError;
    }

    logStep("Funding request created", { fundingRequestId: fundingRequest.id });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        deal_room_id,
        funding_request_id: fundingRequest.id,
        user_id: user.id,
        xdk_conversion: xdk_conversion.toString(),
        type: "escrow_funding",
      },
      description: `Escrow funding for ${dealRoom?.name || 'Deal Room'}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logStep("Payment intent created", { 
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret ? "present" : "missing"
    });

    // Update funding request with payment intent ID
    await supabase
      .from("escrow_funding_requests")
      .update({ 
        stripe_session_id: paymentIntent.id,
        metadata: {
          ...fundingRequest.metadata,
          payment_intent_id: paymentIntent.id,
        }
      })
      .eq("id", fundingRequest.id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        fundingRequestId: fundingRequest.id,
        amount,
        currency,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
