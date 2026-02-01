import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FUND-CONTRIBUTION-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !webhookSecret) {
    logStep("ERROR: Missing Stripe configuration");
    return new Response(
      JSON.stringify({ error: "Stripe not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: err instanceof Error ? err.message : "Unknown" });
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle payment_intent.succeeded for fund contributions
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Check if this is a fund contribution
      if (paymentIntent.metadata?.type !== "fund_contribution") {
        logStep("Skipping non-fund-contribution payment intent", { type: paymentIntent.metadata?.type });
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const fundRequestId = paymentIntent.metadata.fund_request_id;
      const dealRoomId = paymentIntent.metadata.deal_room_id;
      const userId = paymentIntent.metadata.user_id;
      const amountReceived = paymentIntent.amount_received / 100; // Convert from cents

      logStep("Processing fund contribution", { 
        fundRequestId, 
        dealRoomId, 
        userId, 
        amountReceived 
      });

      // Get the fund request to verify it exists
      const { data: fundRequest, error: fundRequestError } = await supabase
        .from("fund_contribution_requests")
        .select("*, deal_rooms(name)")
        .eq("id", fundRequestId)
        .single();

      if (fundRequestError || !fundRequest) {
        logStep("Fund request not found", { fundRequestId, error: fundRequestError });
        return new Response(
          JSON.stringify({ error: "Fund request not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if already processed
      if (fundRequest.status === "paid") {
        logStep("Fund request already processed", { fundRequestId });
        return new Response(JSON.stringify({ received: true, already_processed: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get XDK exchange rate (default 1:1)
      const { data: exchangeRate } = await supabase
        .from("xdk_exchange_rates")
        .select("xdk_rate")
        .eq("base_currency", "USD")
        .order("effective_from", { ascending: false })
        .limit(1)
        .single();

      const rate = exchangeRate?.xdk_rate || 1;
      const xdkAmount = amountReceived * rate;

      logStep("XDK conversion", { usdAmount: amountReceived, rate, xdkAmount });

      // Get or create treasury account for deal room
      let treasuryAddress: string;
      let { data: treasuryAccount } = await supabase
        .from("xodiak_accounts")
        .select("address, balance")
        .eq("deal_room_id", dealRoomId)
        .eq("account_type", "treasury")
        .single();

      if (!treasuryAccount) {
        // Create treasury account
        const { data: newAddress } = await supabase.rpc("generate_xdk_address");
        treasuryAddress = newAddress || `xdk1treasury${dealRoomId.replace(/-/g, "").slice(0, 26)}`;

        const { error: treasuryError } = await supabase
          .from("xodiak_accounts")
          .insert({
            deal_room_id: dealRoomId,
            address: treasuryAddress,
            balance: 0,
            account_type: "treasury",
          });

        if (treasuryError) {
          logStep("ERROR: Failed to create treasury", { error: treasuryError });
          throw new Error("Failed to create treasury account");
        }

        logStep("Treasury account created", { address: treasuryAddress });
      } else {
        treasuryAddress = treasuryAccount.address;
      }

      // Create XDK transaction record
      const txHash = `0x${crypto.randomUUID().replace(/-/g, "")}`;

      await supabase.from("xodiak_transactions").insert({
        tx_hash: txHash,
        from_address: "stripe_payment",
        to_address: treasuryAddress,
        amount: xdkAmount,
        tx_type: "fund_contribution",
        status: "confirmed",
        data: {
          fund_request_id: fundRequestId,
          deal_room_id: dealRoomId,
          user_id: userId,
          usd_amount: amountReceived,
          exchange_rate: rate,
          stripe_payment_intent_id: paymentIntent.id,
        },
      });

      logStep("XDK transaction created", { txHash, xdkAmount });

      // Increment treasury balance
      await supabase.rpc("increment_xdk_balance", { 
        p_address: treasuryAddress, 
        p_amount: xdkAmount 
      });

      // Update fund contribution request status
      await supabase
        .from("fund_contribution_requests")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          xdk_amount: xdkAmount,
          xdk_tx_hash: txHash,
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq("id", fundRequestId);

      // Get user's profile for ledger entry
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", userId)
        .single();

      const userName = userProfile 
        ? `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim() || userProfile.email
        : "Unknown User";

      // Create value ledger entry
      await supabase.from("value_ledger_entries").insert({
        deal_room_id: dealRoomId,
        entity_type: "user",
        entity_id: userId,
        entry_type: "fund_contribution",
        amount: xdkAmount,
        currency: "XDK",
        narrative: `${userName} contributed $${amountReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${xdkAmount.toFixed(2)} XDK) to the treasury`,
        metadata: {
          fund_request_id: fundRequestId,
          purpose: fundRequest.purpose,
          usd_amount: amountReceived,
          xdk_amount: xdkAmount,
          exchange_rate: rate,
          stripe_payment_intent_id: paymentIntent.id,
          tx_hash: txHash,
        },
      });

      logStep("Value ledger entry created");

      // Create notification for deal room admin
      const dealRoomCreatorId = fundRequest.deal_rooms?.created_by;
      if (dealRoomCreatorId) {
        await supabase.from("notifications").insert({
          user_id: dealRoomCreatorId,
          type: "fund_contribution_received",
          title: "Fund Contribution Received",
          message: `${userName} contributed $${amountReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })} to ${fundRequest.deal_rooms?.name || "your deal room"} treasury`,
          metadata: {
            deal_room_id: dealRoomId,
            fund_request_id: fundRequestId,
            amount: amountReceived,
            xdk_amount: xdkAmount,
            contributor_id: userId,
          },
        });

        logStep("Admin notification created", { adminId: dealRoomCreatorId });
      }

      logStep("Fund contribution processed successfully", {
        fundRequestId,
        xdkAmount,
        txHash,
      });

      return new Response(
        JSON.stringify({ 
          received: true, 
          processed: true,
          xdk_minted: xdkAmount,
          tx_hash: txHash,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For other events, just acknowledge receipt
    logStep("Event type not handled", { type: event.type });
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
