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

// Generate a deterministic signature for system-initiated transactions
const generateSignature = (signerType: string, txHash: string): string => {
  const timestamp = Date.now();
  const signatureData = `${signerType}:${txHash}:${timestamp}`;
  // Create a hex-encoded signature (simulating a cryptographic signature)
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureData);
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `0x${Math.abs(hash).toString(16).padStart(16, '0')}${timestamp.toString(16)}`;
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

    // Get deal room treasury from the correct table
    const { data: treasuryData } = await supabase
      .from("deal_room_xdk_treasury")
      .select("xdk_address, balance")
      .eq("deal_room_id", deal_room_id)
      .single();

    if (!treasuryData) {
      return new Response(
        JSON.stringify({ error: "Deal room treasury not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map to consistent naming
    const treasuryAccount = {
      address: treasuryData.xdk_address,
      balance: treasuryData.balance || 0,
    };

    if (treasuryAccount.balance < amount) {
      return new Response(
        JSON.stringify({ 
          error: `Insufficient treasury balance. Available: ${treasuryAccount.balance.toFixed(2)} XDK, Requested: ${amount.toFixed(2)} XDK` 
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
        .select("full_name")
        .eq("id", destination_user_id)
        .single();

      destinationEntityName = profile?.full_name || "User";
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
        .select("full_name")
        .eq("id", user.id)
        .single();

      destinationEntityName = profile?.full_name || "User";
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

    // Ensure treasury account exists in xodiak_accounts (satisfies FK constraint)
    const { error: treasuryUpsertError } = await supabase
      .from("xodiak_accounts")
      .upsert({
        address: treasuryAccount.address,
        balance: treasuryAccount.balance,
        account_type: "treasury",
        metadata: { deal_room_id },
      }, { onConflict: "address" });

    if (treasuryUpsertError) {
      logStep("Treasury account upsert error", { error: treasuryUpsertError });
      // Non-fatal - continue if already exists
    }

    // Execute the transfer
    const txHash = `0x${crypto.randomUUID().replace(/-/g, "")}`;
    const signature = generateSignature("system", txHash);

    const { error: txError } = await supabase.from("xodiak_transactions").insert({
      tx_hash: txHash,
      from_address: treasuryAccount.address,
      to_address: toAddress,
      amount,
      tx_type: "transfer",
      status: "confirmed",
      signature,
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
      throw new Error(txError.message || "Failed to create transaction record");
    }

    // Update treasury balance in deal_room_xdk_treasury table
    const newTreasuryBalance = treasuryAccount.balance - amount;
    const { error: treasuryUpdateError } = await supabase
      .from("deal_room_xdk_treasury")
      .update({ 
        balance: newTreasuryBalance,
        updated_at: new Date().toISOString()
      })
      .eq("deal_room_id", deal_room_id);

    if (treasuryUpdateError) {
      logStep("Treasury balance update error", { error: treasuryUpdateError });
      throw new Error(treasuryUpdateError.message || "Failed to update treasury balance");
    }

    // Also update the mirrored treasury balance in xodiak_accounts for consistency
    await supabase
      .from("xodiak_accounts")
      .update({ balance: newTreasuryBalance })
      .eq("address", treasuryAccount.address);

    // Increment destination wallet balance using RPC
    const { error: incrementError } = await supabase.rpc("increment_xdk_balance", { 
      p_address: toAddress, 
      p_amount: amount 
    });

    if (incrementError) {
      logStep("Balance increment error", { error: incrementError });
      throw new Error(incrementError.message || "Failed to increment destination balance");
    }

    // Create value ledger entry
    const { data: initiatorProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const initiatorName = initiatorProfile?.full_name || "Admin";
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
    const errorMessage = error instanceof Error 
      ? error.message 
      : (typeof error === 'object' && error !== null && 'message' in error) 
        ? String((error as { message: unknown }).message)
        : "An unexpected error occurred";
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
