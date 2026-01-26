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

    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verifying escrow funding for session: ${session_id}`);

    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Payment not completed", status: session.payment_status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dealRoomId = session.metadata?.deal_room_id;
    const fundingRequestId = session.metadata?.funding_request_id;
    const xdkConversion = session.metadata?.xdk_conversion === "true";
    const userId = session.metadata?.user_id;

    if (!dealRoomId || !fundingRequestId) {
      return new Response(
        JSON.stringify({ error: "Invalid session metadata" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already processed
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

    const amountInCents = session.amount_total || 0;
    const amount = amountInCents / 100;
    const currency = (session.currency || "usd").toUpperCase();

    console.log(`Processing escrow deposit: $${amount} for Deal Room: ${dealRoomId}`);

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
          escrow_type: xdkConversion ? "xdk_backed" : "internal",
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

    // Create escrow transaction
    const { error: txError } = await supabase
      .from("escrow_transactions")
      .insert({
        escrow_id: escrow.id,
        transaction_type: "deposit",
        amount,
        status: "completed",
        initiated_by: userId,
        metadata: {
          stripe_session_id: session_id,
          stripe_payment_intent: session.payment_intent,
          xdk_conversion: xdkConversion,
          source: "stripe_checkout",
        },
        attribution_chain: {
          source: "stripe",
          session_id,
          timestamp: new Date().toISOString(),
        },
      });

    if (txError) throw txError;

    // Update escrow balance
    const newBalance = (escrow.total_deposited || 0) + amount;
    await supabase
      .from("deal_room_escrow")
      .update({
        total_deposited: newBalance,
        workflows_paused: false, // Resume workflows if they were paused
        paused_at: null,
        paused_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", escrow.id);

    let xdkTxHash: string | null = null;
    let xdkAmount = 0;

    // Handle XDK conversion if enabled
    if (xdkConversion) {
      // Get current exchange rate
      const { data: exchangeRate } = await supabase
        .from("xdk_exchange_rates")
        .select("xdk_rate")
        .eq("base_currency", "USD")
        .order("effective_from", { ascending: false })
        .limit(1)
        .single();

      const rate = exchangeRate?.xdk_rate || 1;
      xdkAmount = amount * rate;

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

      // Create XDK mint transaction (from treasury to deal room wallet)
      const txHash = `0x${crypto.randomUUID().replace(/-/g, "")}`;
      
      const { error: xdkTxError } = await supabase
        .from("xodiak_transactions")
        .insert({
          tx_hash: txHash,
          from_address: "xdk1treasury000000000000000000000000000000",
          to_address: treasury.xdk_address,
          amount: xdkAmount,
          tx_type: "mint_funding",
          status: "confirmed",
          data: {
            deal_room_id: dealRoomId,
            stripe_session_id: session_id,
            usd_amount: amount,
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

    // Update funding request to completed
    await supabase
      .from("escrow_funding_requests")
      .update({
        status: "completed",
        verified_at: new Date().toISOString(),
        xdk_tx_hash: xdkTxHash,
        metadata: {
          stripe_payment_intent: session.payment_intent,
          amount_received: amount,
          xdk_amount: xdkAmount,
          processed_at: new Date().toISOString(),
        },
      })
      .eq("id", fundingRequestId);

    console.log(`Escrow funding verified: $${amount} deposited, ${xdkAmount} XDK minted`);

    return new Response(
      JSON.stringify({
        success: true,
        escrow_id: escrow.id,
        amount_deposited: amount,
        new_balance: newBalance,
        xdk_conversion: xdkConversion,
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
