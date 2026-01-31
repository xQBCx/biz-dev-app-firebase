import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[XDK-INTERNAL-TRANSFER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    logStep("User authenticated", { userId: user.id });

    const { 
      deal_room_id,
      amount, 
      destination_type,
      destination_wallet_address,
      destination_user_id,
      purpose,
      category_id
    } = await req.json();

    if (!deal_room_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "deal_room_id and positive amount required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is admin of the deal room
    const { data: dealRoom } = await supabase
      .from("deal_rooms")
      .select("id, name, created_by")
      .eq("id", deal_room_id)
      .single();

    if (!dealRoom) {
      return new Response(
        JSON.stringify({ error: "Deal room not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: participant } = await supabase
      .from("deal_room_participants")
      .select("role_type")
      .eq("deal_room_id", deal_room_id)
      .eq("user_id", user.id)
      .single();

    const isAdmin = dealRoom.created_by === user.id || 
                   participant?.role_type === "owner" || 
                   participant?.role_type === "admin";

    if (!isAdmin) {
      logStep("Permission denied - not admin", { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Only deal room admins can transfer from treasury" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get deal room treasury
    const { data: treasuryAccount } = await supabase
      .from("xodiak_accounts")
      .select("address, balance")
      .eq("deal_room_id", deal_room_id)
      .eq("account_type", "deal_room_treasury")
      .single();

    if (!treasuryAccount) {
      return new Response(
        JSON.stringify({ error: "Deal room treasury not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if ((treasuryAccount.balance || 0) < amount) {
      return new Response(
        JSON.stringify({ 
          error: `Insufficient treasury balance. Available: ${(treasuryAccount.balance || 0).toFixed(2)} XDK, Requested: ${amount.toFixed(2)} XDK` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine destination address
    let toAddress = destination_wallet_address;
    let destinationUserId = destination_user_id;
    let destinationEntityName = "";

    if (!toAddress && destination_user_id) {
      // Transfer to user's personal wallet
      const { data: userAccount } = await supabase
        .from("xodiak_accounts")
        .select("address")
        .eq("user_id", destination_user_id)
        .eq("account_type", "user")
        .single();

      if (!userAccount) {
        // Create wallet for user
        const { data: newAddress } = await supabase.rpc("generate_xdk_address");
        toAddress = newAddress || `xdk1user${destination_user_id.replace(/-/g, "").slice(0, 30)}`;
        
        await supabase.from("xodiak_accounts").insert({
          user_id: destination_user_id,
          address: toAddress,
          balance: 0,
          account_type: "user",
        });
      } else {
        toAddress = userAccount.address;
      }

      // Get user name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company")
        .eq("id", destination_user_id)
        .single();

      destinationEntityName = profile?.company || profile?.full_name || "User";
    } else if (destination_type === "personal") {
      // Transfer to initiating user's wallet
      const { data: userAccount } = await supabase
        .from("xodiak_accounts")
        .select("address")
        .eq("user_id", user.id)
        .eq("account_type", "user")
        .single();

      if (!userAccount) {
        const { data: newAddress } = await supabase.rpc("generate_xdk_address");
        toAddress = newAddress || `xdk1user${user.id.replace(/-/g, "").slice(0, 30)}`;
        
        await supabase.from("xodiak_accounts").insert({
          user_id: user.id,
          address: toAddress,
          balance: 0,
          account_type: "user",
        });
      } else {
        toAddress = userAccount.address;
      }

      destinationUserId = user.id;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, company")
        .eq("id", user.id)
        .single();

      destinationEntityName = profile?.company || profile?.full_name || "User";
    }

    if (!toAddress) {
      return new Response(
        JSON.stringify({ error: "Could not determine destination wallet address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Executing internal transfer", { 
      from: treasuryAccount.address,
      to: toAddress,
      amount
    });

    // Execute the transfer
    const txHash = `0x${crypto.randomUUID().replace(/-/g, "")}`;

    const { error: txError } = await supabase.from("xodiak_transactions").insert({
      tx_hash: txHash,
      from_address: treasuryAccount.address,
      to_address: toAddress,
      amount,
      tx_type: "internal_transfer",
      status: "confirmed",
      data: {
        deal_room_id,
        initiated_by: user.id,
        purpose: purpose || "Treasury distribution",
        destination_type,
        category_id,
      },
    });

    if (txError) {
      logStep("Transaction insert error", { error: txError });
      throw txError;
    }

    // Update balances atomically using RPC
    const { error: decrementError } = await supabase.rpc("increment_xdk_balance", { 
      p_address: treasuryAccount.address, 
      p_amount: -amount 
    });

    if (decrementError) {
      logStep("Balance decrement error", { error: decrementError });
      throw decrementError;
    }

    const { error: incrementError } = await supabase.rpc("increment_xdk_balance", { 
      p_address: toAddress, 
      p_amount: amount 
    });

    if (incrementError) {
      logStep("Balance increment error", { error: incrementError });
      throw incrementError;
    }

    // Create value ledger entry
    const { data: initiatorProfile } = await supabase
      .from("profiles")
      .select("full_name, company")
      .eq("id", user.id)
      .single();

    const initiatorName = initiatorProfile?.company || initiatorProfile?.full_name || "Admin";
    const timestamp = new Date().toLocaleString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });

    const narrative = `${initiatorName} transferred ${amount.toFixed(2)} XDK from ${dealRoom.name} treasury to ${destinationEntityName} on ${timestamp}. Purpose: ${purpose || "Treasury distribution"}`;

    await supabase.from("value_ledger_entries").insert({
      deal_room_id,
      source_entity_type: "deal_room",
      source_entity_name: dealRoom.name,
      destination_user_id: destinationUserId,
      destination_entity_type: destination_type === "personal" ? "individual" : "entity",
      destination_entity_name: destinationEntityName,
      entry_type: "internal_transfer",
      amount: 0, // No USD amount
      currency: "XDK",
      xdk_amount: amount,
      purpose: purpose || "Treasury distribution",
      reference_type: "xodiak_transaction",
      reference_id: txHash,
      contribution_credits: 0,
      credit_category: "transfer",
      verification_source: "xodiak_chain",
      verification_id: txHash,
      verified_at: new Date().toISOString(),
      xdk_tx_hash: txHash,
      narrative,
      category_id,
      metadata: {
        initiated_by: user.id,
        destination_type,
      },
    });

    logStep("Internal transfer completed", { txHash, amount });

    return new Response(
      JSON.stringify({
        success: true,
        tx_hash: txHash,
        amount,
        from_address: treasuryAccount.address,
        to_address: toAddress,
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
