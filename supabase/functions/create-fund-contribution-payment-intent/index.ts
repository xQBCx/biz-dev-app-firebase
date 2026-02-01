import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-FUND-CONTRIBUTION-PAYMENT-INTENT] ${step}${detailsStr}`);
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

    const { fund_request_id } = await req.json();

    if (!fund_request_id) {
      return new Response(
        JSON.stringify({ error: "fund_request_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the fund request
    const { data: fundRequest, error: fundRequestError } = await supabase
      .from("fund_contribution_requests")
      .select("*, deal_rooms(id, name, created_by)")
      .eq("id", fund_request_id)
      .single();

    if (fundRequestError || !fundRequest) {
      logStep("Fund request not found", { id: fund_request_id, error: fundRequestError });
      return new Response(
        JSON.stringify({ error: "Fund request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify this request is for the current user
    if (fundRequest.requested_from_user_id !== user.id) {
      logStep("User mismatch", { requestUserId: fundRequest.requested_from_user_id, userId: user.id });
      return new Response(
        JSON.stringify({ error: "This fund request is not for you" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already paid
    if (fundRequest.status === "paid") {
      return new Response(
        JSON.stringify({ status: "paid", error: "This request has already been paid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amount = parseFloat(fundRequest.amount);
    const currency = (fundRequest.currency || "USD").toLowerCase();
    const dealRoomName = fundRequest.deal_rooms?.name || "Deal Room";

    logStep("Creating payment intent", { 
      fundRequestId: fund_request_id, 
      amount, 
      currency
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Create PaymentIntent for embedded payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      description: `Fund Contribution to ${dealRoomName}`,
      metadata: {
        type: "fund_contribution",
        fund_request_id,
        deal_room_id: fundRequest.deal_room_id,
        user_id: user.id,
        purpose: fundRequest.purpose || "Fund Contribution",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update fund request with payment intent ID
    await supabase
      .from("fund_contribution_requests")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_method: "stripe",
      })
      .eq("id", fund_request_id);

    logStep("Payment intent created", { 
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret ? "present" : "missing"
    });

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount,
        currency: currency.toUpperCase(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
