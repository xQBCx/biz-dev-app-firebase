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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });

    // Parse request
    const body = await req.json();
    const { withdrawal_request_id, admin_action } = body;

    if (!withdrawal_request_id) {
      throw new Error("withdrawal_request_id is required");
    }

    // Get withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("xdk_withdrawal_requests")
      .select("*")
      .eq("id", withdrawal_request_id)
      .single();

    if (withdrawalError || !withdrawal) {
      throw new Error("Withdrawal request not found");
    }

    if (withdrawal.status !== "pending") {
      throw new Error(`Cannot process withdrawal with status: ${withdrawal.status}`);
    }

    // Get user's Stripe Connect account
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_connect_account_id, stripe_connect_payouts_enabled, email, full_name")
      .eq("id", withdrawal.user_id)
      .single();

    if (!profile?.stripe_connect_account_id) {
      // Mark for manual processing
      await supabase
        .from("xdk_withdrawal_requests")
        .update({
          status: "pending",
          payout_processor: "manual",
          payout_error: "User has not set up Stripe Connect. Manual processing required."
        })
        .eq("id", withdrawal_request_id);

      return new Response(
        JSON.stringify({
          success: false,
          requires_manual: true,
          message: "User has not set up Stripe Connect. Marked for manual processing."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (!profile.stripe_connect_payouts_enabled) {
      throw new Error("User's Stripe Connect account is not enabled for payouts");
    }

    // Calculate amount in cents
    const amountCents = Math.round(Number(withdrawal.usd_amount) * 100);

    console.log("[PROCESS-PAYOUT] Processing payout:", {
      withdrawal_id: withdrawal_request_id,
      user_id: withdrawal.user_id,
      amount_usd: withdrawal.usd_amount,
      amount_cents: amountCents,
      stripe_account: profile.stripe_connect_account_id
    });

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: "usd",
      destination: profile.stripe_connect_account_id,
      metadata: {
        withdrawal_request_id: withdrawal_request_id,
        xdk_amount: withdrawal.xdk_amount.toString(),
        user_id: withdrawal.user_id,
        platform: "xodiak"
      },
      description: `XDK Withdrawal - ${withdrawal.xdk_amount} XDK to ${profile.full_name || profile.email}`
    });

    console.log("[PROCESS-PAYOUT] Transfer created:", transfer.id);

    // Update withdrawal request
    await supabase
      .from("xdk_withdrawal_requests")
      .update({
        status: "processing",
        payout_processor: "stripe_connect",
        external_payout_id: transfer.id,
        processed_at: new Date().toISOString()
      })
      .eq("id", withdrawal_request_id);

    // Update XODIAK transaction record
    await supabase
      .from("xodiak_transactions")
      .update({
        status: "confirmed",
        data: {
          ...(withdrawal.data || {}),
          stripe_transfer_id: transfer.id
        }
      })
      .eq("data->withdrawal_request_id", withdrawal_request_id);

    return new Response(
      JSON.stringify({
        success: true,
        transfer_id: transfer.id,
        amount_usd: withdrawal.usd_amount,
        status: "processing",
        message: "Payout initiated via Stripe Connect"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("[PROCESS-PAYOUT] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
