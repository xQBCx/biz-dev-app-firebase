import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EscrowAction {
  action: "deposit" | "release" | "resume_workflows" | "pause_workflows" | "check_health";
  deal_room_id: string;
  amount?: number;
  reason?: string;
  settlement_id?: string;
  recipient_id?: string;
  attribution_chain?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const body: EscrowAction = await req.json();
    const { action, deal_room_id, amount, reason, settlement_id, recipient_id, attribution_chain } = body;

    if (!deal_room_id) {
      return new Response(
        JSON.stringify({ error: "deal_room_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch or create escrow
    let { data: escrow, error: escrowError } = await supabase
      .from("deal_room_escrow")
      .select("*")
      .eq("deal_room_id", deal_room_id)
      .single();

    if (escrowError && escrowError.code === "PGRST116") {
      // Create escrow if it doesn't exist
      const { data: newEscrow, error: createError } = await supabase
        .from("deal_room_escrow")
        .insert({
          deal_room_id,
          escrow_type: "internal",
          currency: "USD",
          status: "active",
          total_deposited: 0,
          total_released: 0,
          minimum_balance_threshold: 1000, // Default $1000 threshold
          workflows_paused: false
        })
        .select()
        .single();

      if (createError) throw createError;
      escrow = newEscrow;
    } else if (escrowError) {
      throw escrowError;
    }

    const currentBalance = (escrow.total_deposited || 0) - (escrow.total_released || 0);

    switch (action) {
      case "deposit": {
        if (!amount || amount <= 0) {
          return new Response(
            JSON.stringify({ error: "Valid amount required for deposit" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create transaction
        const { error: txError } = await supabase
          .from("escrow_transactions")
          .insert({
            escrow_id: escrow.id,
            transaction_type: "deposit",
            amount,
            status: "completed",
            initiated_by: userId,
            attribution_chain: attribution_chain || null,
            metadata: { reason: reason || "Manual deposit" }
          });

        if (txError) throw txError;

        // Update escrow balance
        const newTotal = (escrow.total_deposited || 0) + amount;
        const { error: updateError } = await supabase
          .from("deal_room_escrow")
          .update({ 
            total_deposited: newTotal,
            updated_at: new Date().toISOString()
          })
          .eq("id", escrow.id);

        if (updateError) throw updateError;

        // Check if we should resume workflows
        const newBalance = newTotal - (escrow.total_released || 0);
        if (escrow.workflows_paused && newBalance >= (escrow.minimum_balance_threshold || 0)) {
          await supabase
            .from("deal_room_escrow")
            .update({
              workflows_paused: false,
              paused_at: null,
              paused_reason: null
            })
            .eq("id", escrow.id);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            new_balance: newBalance,
            message: `Deposited $${amount.toFixed(2)}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "release": {
        if (!amount || amount <= 0) {
          return new Response(
            JSON.stringify({ error: "Valid amount required for release" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (amount > currentBalance) {
          return new Response(
            JSON.stringify({ 
              error: "Insufficient escrow balance",
              available: currentBalance,
              requested: amount
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create transaction
        const { error: txError } = await supabase
          .from("escrow_transactions")
          .insert({
            escrow_id: escrow.id,
            transaction_type: "release",
            amount,
            status: "completed",
            initiated_by: userId,
            recipient_id: recipient_id || null,
            settlement_id: settlement_id || null,
            attribution_chain: attribution_chain || null,
            metadata: { reason: reason || "Settlement payout" }
          });

        if (txError) throw txError;

        // Update escrow balance
        const newReleased = (escrow.total_released || 0) + amount;
        const { error: updateError } = await supabase
          .from("deal_room_escrow")
          .update({ 
            total_released: newReleased,
            updated_at: new Date().toISOString()
          })
          .eq("id", escrow.id);

        if (updateError) throw updateError;

        // Check if we need to pause workflows (kill switch)
        const newBalance = (escrow.total_deposited || 0) - newReleased;
        if (newBalance < (escrow.minimum_balance_threshold || 0)) {
          await supabase
            .from("deal_room_escrow")
            .update({
              workflows_paused: true,
              paused_at: new Date().toISOString(),
              paused_reason: `Balance dropped below threshold ($${newBalance.toFixed(2)} < $${escrow.minimum_balance_threshold})`
            })
            .eq("id", escrow.id);

          console.log(`[escrow-manage] Kill switch triggered for deal room ${deal_room_id}`);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            new_balance: newBalance,
            workflows_paused: newBalance < (escrow.minimum_balance_threshold || 0),
            message: `Released $${amount.toFixed(2)}${recipient_id ? ` to ${recipient_id}` : ''}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "resume_workflows": {
        if (currentBalance < (escrow.minimum_balance_threshold || 0)) {
          return new Response(
            JSON.stringify({ 
              error: "Cannot resume - balance still below threshold",
              current: currentBalance,
              required: escrow.minimum_balance_threshold
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateError } = await supabase
          .from("deal_room_escrow")
          .update({
            workflows_paused: false,
            paused_at: null,
            paused_reason: null
          })
          .eq("id", escrow.id);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true, message: "Workflows resumed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "pause_workflows": {
        const { error: updateError } = await supabase
          .from("deal_room_escrow")
          .update({
            workflows_paused: true,
            paused_at: new Date().toISOString(),
            paused_reason: reason || "Manual pause"
          })
          .eq("id", escrow.id);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true, message: "Workflows paused" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "check_health": {
        const threshold = escrow.minimum_balance_threshold || 0;
        const healthPercent = threshold > 0 ? (currentBalance / threshold) * 100 : 100;
        
        return new Response(
          JSON.stringify({
            escrow_id: escrow.id,
            deal_room_id,
            current_balance: currentBalance,
            total_deposited: escrow.total_deposited,
            total_released: escrow.total_released,
            minimum_threshold: threshold,
            health_percent: healthPercent,
            workflows_paused: escrow.workflows_paused,
            status: healthPercent >= 100 ? "healthy" : healthPercent >= 50 ? "moderate" : healthPercent >= 25 ? "low" : "critical"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error("[escrow-manage] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
