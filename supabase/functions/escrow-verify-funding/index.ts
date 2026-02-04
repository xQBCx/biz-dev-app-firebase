import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.json();
    const { session_id, payment_intent_id, deal_room_id, xdk_conversion } = body;

    // Determine which type of verification we're doing
    const isPaymentIntent = !!payment_intent_id;
    const isCheckoutSession = !!session_id;

    if (!isPaymentIntent && !isCheckoutSession) {
      return new Response(
        JSON.stringify({ error: "session_id or payment_intent_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verifying escrow funding - Type: ${isPaymentIntent ? "PaymentIntent" : "CheckoutSession"}`);

    let grossAmount: number;
    let netAmount: number;
    let stripeFee: number = 0;
    let currency: string;
    let dealRoomId: string;
    let xdkConversionEnabled: boolean;
    let userId: string | null = null;
    let stripeReference: string;
    let fundingRequestId: string | null = null;

    if (isPaymentIntent) {
      // Handle PaymentIntent verification (from EscrowPaymentModal)
      console.log(`Verifying PaymentIntent: ${payment_intent_id}`);
      
      // Retrieve PaymentIntent with balance_transaction expanded to get fee details
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id, {
        expand: ['latest_charge.balance_transaction']
      });
      
      if (paymentIntent.status !== "succeeded") {
        return new Response(
          JSON.stringify({ error: "Payment not completed", status: paymentIntent.status }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Extract fee details from balance_transaction
      grossAmount = paymentIntent.amount / 100;
      currency = (paymentIntent.currency || "usd").toUpperCase();
      
      const charge = paymentIntent.latest_charge as Stripe.Charge | null;
      const balanceTx = charge?.balance_transaction as Stripe.BalanceTransaction | null;
      
      if (balanceTx) {
        stripeFee = balanceTx.fee / 100;
        netAmount = balanceTx.net / 100;
        console.log(`Fee breakdown: Gross $${grossAmount}, Fee $${stripeFee}, Net $${netAmount}`);
      } else {
        // Fallback if balance_transaction not available yet
        netAmount = grossAmount;
        console.log(`Balance transaction not yet available, using gross amount: $${grossAmount}`);
      }
      
      dealRoomId = deal_room_id || paymentIntent.metadata?.deal_room_id;
      xdkConversionEnabled = xdk_conversion ?? paymentIntent.metadata?.xdk_conversion === "true";
      userId = paymentIntent.metadata?.user_id || null;
      stripeReference = payment_intent_id;
      fundingRequestId = paymentIntent.metadata?.funding_request_id || null;

      if (!dealRoomId) {
        return new Response(
          JSON.stringify({ error: "deal_room_id required for PaymentIntent verification" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if this PaymentIntent was already processed
      const { data: existingTx } = await supabase
        .from("escrow_transactions")
        .select("id")
        .eq("metadata->>stripe_payment_intent", payment_intent_id)
        .maybeSingle();

      if (existingTx) {
        console.log(`PaymentIntent ${payment_intent_id} already processed`);
        return new Response(
          JSON.stringify({ message: "Already processed", status: "completed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

    } else {
      // Handle Checkout Session verification (legacy flow)
      console.log(`Verifying CheckoutSession: ${session_id}`);
      
      // Retrieve session with payment_intent expanded to get charge/balance_transaction
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['payment_intent.latest_charge.balance_transaction']
      });

      if (session.payment_status !== "paid") {
        return new Response(
          JSON.stringify({ error: "Payment not completed", status: session.payment_status }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      dealRoomId = session.metadata?.deal_room_id!;
      fundingRequestId = session.metadata?.funding_request_id || null;
      xdkConversionEnabled = session.metadata?.xdk_conversion === "true";
      userId = session.metadata?.user_id || null;

      if (!dealRoomId) {
        return new Response(
          JSON.stringify({ error: "Invalid session metadata" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if already processed via funding request
      if (fundingRequestId) {
        const { data: existingRequest } = await supabase
          .from("escrow_funding_requests")
          .select("status")
          .eq("id", fundingRequestId)
          .single();

        if (existingRequest?.status === "completed") {
          return new Response(
            JSON.stringify({ message: "Already processed", status: "completed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const amountInCents = session.amount_total || 0;
      grossAmount = amountInCents / 100;
      currency = (session.currency || "usd").toUpperCase();
      stripeReference = (session.payment_intent as Stripe.PaymentIntent)?.id || session_id;
      
      // Extract fee details from expanded payment_intent
      const pi = session.payment_intent as Stripe.PaymentIntent | null;
      const charge = pi?.latest_charge as Stripe.Charge | null;
      const balanceTx = charge?.balance_transaction as Stripe.BalanceTransaction | null;
      
      if (balanceTx) {
        stripeFee = balanceTx.fee / 100;
        netAmount = balanceTx.net / 100;
        console.log(`Fee breakdown: Gross $${grossAmount}, Fee $${stripeFee}, Net $${netAmount}`);
      } else {
        netAmount = grossAmount;
        console.log(`Balance transaction not available, using gross amount: $${grossAmount}`);
      }
    }

    // Use NET amount for XDK minting and balance updates
    const amount = netAmount;
    console.log(`Processing escrow deposit: Net $${amount} (Gross $${grossAmount}, Fee $${stripeFee}) for Deal Room: ${dealRoomId}`);

    // Get or create escrow
    let { data: escrow } = await supabase
      .from("deal_room_escrow")
      .select("*")
      .eq("deal_room_id", dealRoomId)
      .single();

    if (!escrow) {
      // Create escrow if doesn't exist
      const { data: newEscrow, error: escrowError } = await supabase
        .from("deal_room_escrow")
        .insert({
          deal_room_id: dealRoomId,
          escrow_type: xdkConversionEnabled ? "xdk_backed" : "internal",
          currency,
          status: "active",
          total_deposited: 0,
          total_released: 0,
          minimum_balance_threshold: 1000,
          workflows_paused: false,
        })
        .select()
        .single();

      if (escrowError) throw escrowError;
      escrow = newEscrow;
    }

    // Create escrow transaction with NET amount
    const { error: txError } = await supabase
      .from("escrow_transactions")
      .insert({
        escrow_id: escrow.id,
        transaction_type: "deposit",
        amount: netAmount, // Store NET amount
        currency,
        status: "confirmed",
        metadata: {
          stripe_payment_intent: stripeReference,
          xdk_conversion: xdkConversionEnabled,
          source: isPaymentIntent ? "payment_element" : "stripe_checkout",
          user_id: userId,
          gross_amount: grossAmount,
          stripe_fee: stripeFee,
          net_amount: netAmount,
        },
        attribution_chain: {
          source: "stripe",
          reference: stripeReference,
          timestamp: new Date().toISOString(),
        },
      });

    if (txError) throw txError;

    // Update escrow balance with NET amount
    const newBalance = (escrow.total_deposited || 0) + netAmount;
    await supabase
      .from("deal_room_escrow")
      .update({
        total_deposited: newBalance,
        workflows_paused: false,
        paused_at: null,
        paused_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", escrow.id);

    let xdkTxHash: string | null = null;
    let xdkAmount = 0;

    // Handle XDK conversion if enabled - use NET amount
    if (xdkConversionEnabled) {
      // Get current exchange rate
      const { data: exchangeRate } = await supabase
        .from("xdk_exchange_rates")
        .select("xdk_rate")
        .eq("base_currency", "USD")
        .order("effective_from", { ascending: false })
        .limit(1)
        .single();

      const rate = exchangeRate?.xdk_rate || 1;
      xdkAmount = netAmount * rate; // Mint XDK based on NET amount

      // Get or create Deal Room XDK treasury
      let { data: treasury } = await supabase
        .from("deal_room_xdk_treasury")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .single();

      if (!treasury) {
        // Generate XDK address for this deal room
        const { data: addressData } = await supabase.rpc("generate_xdk_address");
        const treasuryAddress = addressData || `xdk1dealroom${dealRoomId.replace(/-/g, "").slice(0, 26)}`;

        // Create treasury wallet
        const { data: newTreasury, error: treasuryError } = await supabase
          .from("deal_room_xdk_treasury")
          .insert({
            deal_room_id: dealRoomId,
            xdk_address: treasuryAddress,
            balance: 0,
            is_active: true,
          })
          .select()
          .single();

        if (treasuryError) throw treasuryError;
        treasury = newTreasury;

        // Also create XODIAK account for this treasury
        await supabase.from("xodiak_accounts").insert({
          address: treasuryAddress,
          balance: 0,
          account_type: "escrow",
          metadata: {
            deal_room_id: dealRoomId,
            type: "deal_room_treasury",
          },
        });
      }

      // Create XDK mint transaction
      const txHash = `0x${crypto.randomUUID().replace(/-/g, "")}`;
      // Generate required cryptographic signature for transaction integrity
      const signatureData = `mint_funding:${treasury.xdk_address}:${xdkAmount}:${Date.now()}`;
      const signature = `0x${Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signatureData)))).map(b => b.toString(16).padStart(2, "0")).join("")}`;
      
      const { error: xdkTxError } = await supabase
        .from("xodiak_transactions")
        .insert({
          tx_hash: txHash,
          from_address: "xdk1treasury000000000000000000000000000000",
          to_address: treasury.xdk_address,
          amount: xdkAmount,
          tx_type: "mint_funding",
          status: "confirmed",
          signature, // Required for transaction integrity
          data: {
            deal_room_id: dealRoomId,
            stripe_reference: stripeReference,
            gross_amount: grossAmount,
            stripe_fee: stripeFee,
            net_amount: netAmount,
            exchange_rate: rate,
            funding_request_id: fundingRequestId,
          },
        });

      if (xdkTxError) {
        console.error("XDK transaction error:", xdkTxError);
      } else {
        xdkTxHash = txHash;

        // Update treasury balance
        await supabase
          .from("deal_room_xdk_treasury")
          .update({
            balance: (treasury.balance || 0) + xdkAmount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", treasury.id);

        // Update XODIAK account balance
        await supabase
          .from("xodiak_accounts")
          .update({ balance: (treasury.balance || 0) + xdkAmount })
          .eq("address", treasury.xdk_address);
      }
    }

    // Update funding request to completed (if exists) with fee breakdown
    if (fundingRequestId) {
      await supabase
        .from("escrow_funding_requests")
        .update({
          status: "completed",
          verified_at: new Date().toISOString(),
          xdk_tx_hash: xdkTxHash,
          gross_amount: grossAmount,
          stripe_fee: stripeFee,
          net_amount: netAmount,
          metadata: {
            stripe_reference: stripeReference,
            amount_received: netAmount,
            gross_amount: grossAmount,
            stripe_fee: stripeFee,
            xdk_amount: xdkAmount,
            processed_at: new Date().toISOString(),
          },
        })
        .eq("id", fundingRequestId);
    }

    // Get deal room info for narrative
    const { data: dealRoom } = await supabase
      .from("deal_rooms")
      .select("name")
      .eq("id", dealRoomId)
      .single();

    // Get user profile for attribution
    let userProfile = null;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", userId)
        .single();
      userProfile = profile;
    }

    // Use full_name as primary, email as fallback (profiles table has no 'company' column)
    const sourceName = userProfile?.full_name || userProfile?.email || "Unknown";
    const sourceType = "individual";
    const dealRoomName = dealRoom?.name || "Deal Room";
    const timestamp = new Date().toLocaleString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });

    // Create value ledger entry with fee transparency
    const feeNote = stripeFee > 0 ? ` (Gross: $${grossAmount.toFixed(2)}, Processing Fee: $${stripeFee.toFixed(2)})` : "";
    const narrative = `${sourceName} deposited $${netAmount.toFixed(2)} to ${dealRoomName} escrow on ${timestamp}${feeNote}.${
      xdkConversionEnabled ? ` ${xdkAmount.toFixed(2)} XDK minted to treasury.` : ""
    }`;

    await supabase.from("value_ledger_entries").insert({
      deal_room_id: dealRoomId,
      source_user_id: userId,
      source_entity_type: sourceType,
      source_entity_name: sourceName,
      destination_entity_type: "deal_room",
      destination_entity_name: dealRoomName,
      entry_type: "escrow_deposit",
      amount: netAmount, // Store NET amount
      currency,
      xdk_amount: xdkConversionEnabled ? xdkAmount : null,
      gross_amount: grossAmount,
      processing_fee: stripeFee,
      purpose: "Escrow funding for deal room operations",
      reference_type: isPaymentIntent ? "payment_intent" : "escrow_funding_request",
      reference_id: fundingRequestId || stripeReference,
      contribution_credits: Math.round(netAmount / 10),
      credit_category: "funding",
      verification_source: "stripe",
      verification_id: stripeReference,
      verified_at: new Date().toISOString(),
      xdk_tx_hash: xdkTxHash,
      narrative,
      metadata: {
        stripe_reference: stripeReference,
        user_profile: userProfile,
        verification_type: isPaymentIntent ? "payment_intent" : "checkout_session",
        gross_amount: grossAmount,
        stripe_fee: stripeFee,
        net_amount: netAmount,
      },
    });

    console.log(`Escrow funding verified: Gross $${grossAmount}, Fee $${stripeFee}, Net $${netAmount} deposited, ${xdkAmount} XDK minted`);

    return new Response(
      JSON.stringify({
        success: true,
        escrow_id: escrow.id,
        gross_amount: grossAmount,
        stripe_fee: stripeFee,
        amount_deposited: netAmount,
        new_balance: newBalance,
        xdk_conversion: xdkConversionEnabled,
        xdk_amount: xdkAmount,
        xdk_tx_hash: xdkTxHash,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Escrow verification error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
