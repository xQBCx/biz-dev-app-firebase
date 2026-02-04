import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FUND-CONTRIBUTION-CHECKOUT] ${step}${detailsStr}`);
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

    const { fund_request_id, payment_method = "stripe" } = await req.json();

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
        JSON.stringify({ error: "This request has already been paid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amount = parseFloat(fundRequest.amount);
    const currency = fundRequest.currency || "USD";
    const dealRoomName = fundRequest.deal_rooms?.name || "Deal Room";

    logStep("Processing fund contribution", { 
      fundRequestId: fund_request_id, 
      amount, 
      currency, 
      paymentMethod: payment_method 
    });

    if (payment_method === "xdk") {
      // Handle XDK payment
      // Get user's XDK account
      const { data: xdkAccount } = await supabase
        .from("xodiak_accounts")
        .select("address, balance")
        .eq("user_id", user.id)
        .eq("account_type", "user")
        .single();

      if (!xdkAccount) {
        return new Response(
          JSON.stringify({ error: "No XDK wallet found. Please set up your wallet first." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get XDK exchange rate
      const { data: exchangeRate } = await supabase
        .from("xdk_exchange_rates")
        .select("xdk_rate")
        .eq("base_currency", "USD")
        .order("effective_from", { ascending: false })
        .limit(1)
        .single();

      const rate = exchangeRate?.xdk_rate || 1;
      const xdkAmount = amount * rate;

      if ((xdkAccount.balance || 0) < xdkAmount) {
        return new Response(
          JSON.stringify({ 
            error: `Insufficient XDK balance. Required: ${xdkAmount.toFixed(2)} XDK, Available: ${(xdkAccount.balance || 0).toFixed(2)} XDK` 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get deal room treasury address
      const { data: treasuryAccount } = await supabase
        .from("xodiak_accounts")
        .select("address")
        .eq("deal_room_id", fundRequest.deal_room_id)
        .eq("account_type", "treasury")
        .single();

      let treasuryAddress = treasuryAccount?.address;

      // Create treasury if not exists
      if (!treasuryAddress) {
        const { data: newAddress } = await supabase.rpc("generate_xdk_address");
        treasuryAddress = newAddress || `xdk1treasury${fundRequest.deal_room_id.replace(/-/g, "").slice(0, 26)}`;
        
        await supabase.from("xodiak_accounts").insert({
          deal_room_id: fundRequest.deal_room_id,
          address: treasuryAddress,
          balance: 0,
          account_type: "treasury",
        });
      }

      // Execute XDK transfer
      const txHash = `0x${crypto.randomUUID().replace(/-/g, "")}`;

      await supabase.from("xodiak_transactions").insert({
        tx_hash: txHash,
        from_address: xdkAccount.address,
        to_address: treasuryAddress,
        amount: xdkAmount,
        tx_type: "fund_contribution",
        status: "confirmed",
        data: {
          fund_request_id,
          deal_room_id: fundRequest.deal_room_id,
          usd_amount: amount,
          exchange_rate: rate,
        },
      });

      // Update balances
      await supabase.rpc("increment_xdk_balance", { p_address: xdkAccount.address, p_amount: -xdkAmount });
      await supabase.rpc("increment_xdk_balance", { p_address: treasuryAddress, p_amount: xdkAmount });

      // Update fund request
      await supabase
        .from("fund_contribution_requests")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_method: "xdk",
          xdk_amount: xdkAmount,
          xdk_tx_hash: txHash,
        })
        .eq("id", fund_request_id);

      logStep("XDK contribution completed", { txHash, xdkAmount });

      return new Response(
        JSON.stringify({
          success: true,
          payment_method: "xdk",
          xdk_amount: xdkAmount,
          tx_hash: txHash,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle Stripe payment
    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create Stripe Checkout Session
    const origin = req.headers.get("origin") || "https://biz-dev-app.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "Deal Room Fund Contribution",
              description: `Contribution to ${dealRoomName} treasury`,
              metadata: {
                deal_room_id: fundRequest.deal_room_id,
                fund_request_id,
              },
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/deal-rooms/${fundRequest.deal_room_id}?contribution=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/deal-rooms/${fundRequest.deal_room_id}?contribution=cancelled`,
      metadata: {
        deal_room_id: fundRequest.deal_room_id,
        fund_request_id,
        user_id: user.id,
        type: "fund_contribution",
      },
    });

    // Update fund request with Stripe session
    await supabase
      .from("fund_contribution_requests")
      .update({
        stripe_session_id: session.id,
        payment_method: "stripe",
      })
      .eq("id", fund_request_id);

    logStep("Stripe checkout session created", { sessionId: session.id });

    return new Response(
      JSON.stringify({
        url: session.url,
        session_id: session.id,
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
