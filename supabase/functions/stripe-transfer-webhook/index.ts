import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-TRANSFER-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_TRANSFER_WEBHOOK_SECRET") || Deno.env.get("STRIPE_WEBHOOK_SECRET");

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

    if (event.type === "transfer.paid" || event.type === "transfer.failed" || event.type === "transfer.reversed") {
      const transfer = event.data.object as Stripe.Transfer;
      const withdrawalRequestId = transfer.metadata?.withdrawal_request_id;

      logStep("Processing transfer event", {
        transfer_id: transfer.id,
        status: event.type,
        withdrawal_request_id: withdrawalRequestId,
        amount: transfer.amount,
      });

      // Find the withdrawal request by either metadata or external_payout_id
      let withdrawalId = withdrawalRequestId;

      if (!withdrawalId) {
        // Fallback: look up by Stripe transfer ID
        const { data: matchedWithdrawal } = await supabase
          .from("xdk_withdrawal_requests")
          .select("id")
          .eq("external_payout_id", transfer.id)
          .single();

        if (matchedWithdrawal) {
          withdrawalId = matchedWithdrawal.id;
        }
      }

      if (!withdrawalId) {
        logStep("No matching withdrawal request found for transfer", { transfer_id: transfer.id });
        return new Response(JSON.stringify({ received: true, matched: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Map Stripe event to withdrawal status
      let newStatus: string;
      let updateFields: Record<string, unknown> = {};

      switch (event.type) {
        case "transfer.paid":
          newStatus = "completed";
          updateFields = {
            status: "completed",
            processed_at: new Date().toISOString(),
          };
          break;
        case "transfer.failed":
          newStatus = "failed";
          updateFields = {
            status: "failed",
            payout_error: "Stripe transfer failed",
          };
          break;
        case "transfer.reversed":
          newStatus = "failed";
          updateFields = {
            status: "failed",
            payout_error: "Stripe transfer was reversed",
          };
          break;
        default:
          newStatus = "processing";
          updateFields = {};
      }

      // Update withdrawal request
      const { error: updateError } = await supabase
        .from("xdk_withdrawal_requests")
        .update(updateFields)
        .eq("id", withdrawalId);

      if (updateError) {
        logStep("ERROR: Failed to update withdrawal request", { error: updateError, withdrawalId });
      } else {
        logStep("Withdrawal request updated", { withdrawalId, newStatus });
      }

      // Also update the xodiak_transactions record
      const { error: txUpdateError } = await supabase
        .from("xodiak_transactions")
        .update({ status: newStatus === "completed" ? "confirmed" : "failed" })
        .eq("data->withdrawal_request_id", withdrawalId);

      if (txUpdateError) {
        logStep("WARN: Failed to update xodiak_transaction", { error: txUpdateError });
      }

      // If transfer failed, refund XDK balance back to user
      if (newStatus === "failed") {
        const { data: withdrawal } = await supabase
          .from("xdk_withdrawal_requests")
          .select("user_id, xdk_amount")
          .eq("id", withdrawalId)
          .single();

        if (withdrawal) {
          const { data: userAccount } = await supabase
            .from("xodiak_accounts")
            .select("address")
            .eq("user_id", withdrawal.user_id)
            .eq("account_type", "user")
            .single();

          if (userAccount) {
            await supabase.rpc("increment_xdk_balance", {
              p_address: userAccount.address,
              p_amount: Number(withdrawal.xdk_amount),
            });

            logStep("XDK balance refunded on failed transfer", {
              user_id: withdrawal.user_id,
              amount: withdrawal.xdk_amount,
            });
          }
        }
      }

      return new Response(
        JSON.stringify({ received: true, matched: true, status: newStatus }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Acknowledge unhandled event types
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
