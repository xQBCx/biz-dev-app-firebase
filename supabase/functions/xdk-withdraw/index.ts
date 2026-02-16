import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WithdrawalRequest {
  amount: number;
  withdrawal_method: "manual" | "stripe_connect";
  bank_account_id?: string;
  deal_room_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !userData.user) {
      throw new Error("Unauthorized");
    }

    const userId = userData.user.id;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const body: WithdrawalRequest = await req.json();
    const { amount, withdrawal_method, bank_account_id, deal_room_id } = body;

    if (!amount || amount <= 0) {
      throw new Error("Invalid withdrawal amount");
    }

    // Get user's XDK account
    const { data: xdkAccount, error: accountError } = await supabase
      .from("xodiak_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("account_type", "user")
      .single();

    if (accountError || !xdkAccount) {
      throw new Error("XDK account not found. Please set up your wallet first.");
    }

    // Check sufficient balance
    if (Number(xdkAccount.balance) < amount) {
      throw new Error(`Insufficient balance. Available: ${xdkAccount.balance} XDK`);
    }

    // Get current exchange rate
    const { data: rateData } = await supabase
      .from("xdk_exchange_rates")
      .select("rate")
      .eq("from_currency", "XDK")
      .eq("to_currency", "USD")
      .eq("is_active", true)
      .order("effective_from", { ascending: false })
      .limit(1)
      .single();

    const exchangeRate = rateData?.rate || 1.0;
    const usdAmount = amount * exchangeRate;

    // Begin transaction: Create withdrawal request and debit balance
    // 1. Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("xdk_withdrawal_requests")
      .insert({
        user_id: userId,
        xdk_amount: amount,
        usd_amount: usdAmount,
        exchange_rate: exchangeRate,
        withdrawal_method: withdrawal_method || "manual",
        status: "pending",
        bank_account_last4: bank_account_id ? bank_account_id.slice(-4) : null
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error("Failed to create withdrawal request:", withdrawalError);
      throw new Error("Failed to create withdrawal request");
    }

    // 2. Debit XDK balance
    const newBalance = Number(xdkAccount.balance) - amount;
    const { error: balanceError } = await supabase
      .from("xodiak_accounts")
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq("address", xdkAccount.address);

    if (balanceError) {
      // Rollback: delete the withdrawal request
      await supabase
        .from("xdk_withdrawal_requests")
        .delete()
        .eq("id", withdrawal.id);
      
      console.error("Failed to update balance:", balanceError);
      throw new Error("Failed to process withdrawal");
    }

    // 3. Create XODIAK transaction record
    const { error: txError } = await supabase
      .from("xodiak_transactions")
      .insert({
        from_address: xdkAccount.address,
        to_address: "xdk1withdraw_treasury",
        amount: amount,
        tx_type: "withdrawal",
        status: "pending",
      data: {
          withdrawal_request_id: withdrawal.id,
          usd_amount: usdAmount,
          exchange_rate: exchangeRate,
          deal_room_id: deal_room_id || null
        }
      });

    if (txError) {
      console.error("Failed to create transaction record:", txError);
      // Non-critical error - withdrawal still succeeds
    }

    // 4. Log for admin notification (could trigger email/webhook)
    console.log(`[XDK-WITHDRAW] New withdrawal request:`, {
      withdrawal_id: withdrawal.id,
      user_id: userId,
      xdk_amount: amount,
      usd_amount: usdAmount,
      method: withdrawal_method
    });

    // 5. Auto-process payout for Stripe Connect users
    let payoutStatus = "pending";
    let payoutMessage = "Withdrawal request submitted successfully. An admin will process your request.";
    let transferId = null;

    if (withdrawal_method === "stripe_connect") {
      // Check if user has Stripe Connect enabled
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_connect_account_id, stripe_connect_payouts_enabled")
        .eq("id", userId)
        .single();

      if (profile?.stripe_connect_payouts_enabled && profile?.stripe_connect_account_id) {
        console.log(`[XDK-WITHDRAW] Auto-processing payout for Stripe Connect user:`, {
          user_id: userId,
          stripe_account: profile.stripe_connect_account_id
        });

        try {
          const payoutResponse = await fetch(
            `${supabaseUrl}/functions/v1/process-stripe-payout`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${supabaseServiceKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ withdrawal_request_id: withdrawal.id })
            }
          );

          const payoutResult = await payoutResponse.json();
          
          if (payoutResult.success) {
            payoutStatus = "processing";
            payoutMessage = "Payout initiated via Stripe Connect. Funds will arrive in 1-2 business days.";
            transferId = payoutResult.transfer_id;
            console.log(`[XDK-WITHDRAW] Auto-payout successful:`, payoutResult);
          } else {
            const errorMsg = payoutResult.error || "Auto-payout failed — unknown reason";
            console.error(`[XDK-WITHDRAW] Auto-payout failed:`, payoutResult);
            payoutMessage = "Withdrawal recorded. Payout will be processed manually.";
            // Write error to withdrawal request for admin visibility
            await supabase
              .from("xdk_withdrawal_requests")
              .update({ payout_error: errorMsg })
              .eq("id", withdrawal.id);
          }
        } catch (payoutError) {
          console.error(`[XDK-WITHDRAW] Auto-payout error:`, payoutError);
          // Non-critical - withdrawal still recorded, will need manual processing
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal_id: withdrawal.id,
        xdk_amount: amount,
        usd_amount: usdAmount,
        exchange_rate: exchangeRate,
        status: payoutStatus,
        transfer_id: transferId,
        estimated_arrival: payoutStatus === "processing" ? "1-2 business days" : "2-3 business days",
        message: payoutMessage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("[XDK-WITHDRAW] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
