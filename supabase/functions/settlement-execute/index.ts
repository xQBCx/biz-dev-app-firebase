import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SettlementContract {
  id: string;
  deal_room_id: string;
  contract_name: string;
  trigger_type: string;
  trigger_conditions: Record<string, unknown>;
  payout_rules: Record<string, unknown>;
  is_active: boolean;
  payout_priority: number;
  total_distributed?: number;
  execution_count?: number;
  external_confirmation_required: boolean;
  external_confirmation_source: string | null;
  minimum_escrow_required: number;
  revenue_source_type: string | null;
}

interface PayoutRule {
  participant_id: string;
  percentage: number;
  minimum_amount?: number;
  maximum_amount?: number;
}

interface EscrowData {
  id: string;
  current_balance: number;
  minimum_balance_threshold: number;
  workflows_paused: boolean;
  total_released?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { contract_id, trigger_event, trigger_data, attribution_chain } = await req.json();

    console.log(`Processing settlement for contract: ${contract_id}`);
    console.log(`Trigger event: ${trigger_event}`);
    console.log(`Trigger data:`, trigger_data);

    // Fetch the contract with new fields
    const { data: contract, error: contractError } = await supabase
      .from("settlement_contracts")
      .select("*")
      .eq("id", contract_id)
      .eq("is_active", true)
      .single();

    if (contractError || !contract) {
      console.error("Contract not found or inactive:", contractError);
      return new Response(
        JSON.stringify({ error: "Contract not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const typedContract = contract as SettlementContract;

    // Check if escrow is paused (kill switch)
    const { data: escrow, error: escrowError } = await supabase
      .from("deal_room_escrow")
      .select("id, current_balance, minimum_balance_threshold, workflows_paused")
      .eq("deal_room_id", typedContract.deal_room_id)
      .maybeSingle();

    if (escrowError) {
      console.error("Error fetching escrow:", escrowError);
    }

    const typedEscrow = escrow as EscrowData | null;

    if (typedEscrow?.workflows_paused) {
      console.log("Workflows paused for this deal room - escrow below threshold");
      return new Response(
        JSON.stringify({ 
          error: "Workflows paused", 
          reason: "Escrow balance below minimum threshold",
          current_balance: typedEscrow.current_balance,
          minimum_required: typedEscrow.minimum_balance_threshold
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check minimum escrow requirement for this specific contract
    if (typedContract.minimum_escrow_required > 0 && typedEscrow) {
      if (typedEscrow.current_balance < typedContract.minimum_escrow_required) {
        console.log(`Insufficient escrow: ${typedEscrow.current_balance} < ${typedContract.minimum_escrow_required}`);
        return new Response(
          JSON.stringify({ 
            error: "Insufficient escrow balance", 
            current_balance: typedEscrow.current_balance,
            minimum_required: typedContract.minimum_escrow_required
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate trigger conditions
    const triggerConditions = typedContract.trigger_conditions as Record<string, unknown>;
    const isValidTrigger = validateTrigger(typedContract.trigger_type, triggerConditions, trigger_event, trigger_data);

    if (!isValidTrigger) {
      console.log("Trigger conditions not met");
      return new Response(
        JSON.stringify({ message: "Trigger conditions not met" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate payout amounts
    const payoutRules = typedContract.payout_rules as { rules: PayoutRule[] };
    const totalAmount = trigger_data.amount || 0;

    if (totalAmount <= 0) {
      console.log("No amount to distribute");
      return new Response(
        JSON.stringify({ message: "No amount to distribute" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create settlement execution record
    const { data: execution, error: execError } = await supabase
      .from("settlement_executions")
      .insert([
        {
          contract_id: typedContract.id,
          trigger_event,
          trigger_data,
          total_amount: totalAmount,
          status: typedContract.external_confirmation_required ? "pending_confirmation" : "processing",
        },
      ])
      .select()
      .single();

    if (execError) {
      console.error("Failed to create execution:", execError);
      throw execError;
    }

    console.log(`Created execution: ${execution.id}`);

    // If external confirmation is required, create confirmation record and wait
    if (typedContract.external_confirmation_required) {
      const { error: confirmError } = await supabase
        .from("settlement_confirmations")
        .insert({
          execution_id: execution.id,
          contract_id: typedContract.id,
          confirmation_source: typedContract.external_confirmation_source || "manual_verification",
          external_entity_type: trigger_data.entity_type || null,
          external_entity_id: trigger_data.entity_id || null,
          confirmation_status: "pending",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          metadata: {
            trigger_event,
            trigger_data,
            attribution_chain: attribution_chain || [],
          },
        });

      if (confirmError) {
        console.error("Failed to create confirmation:", confirmError);
      }

      console.log(`Settlement requires external confirmation from: ${typedContract.external_confirmation_source}`);
      return new Response(
        JSON.stringify({
          success: true,
          status: "pending_confirmation",
          execution_id: execution.id,
          message: `Awaiting confirmation from ${typedContract.external_confirmation_source}`,
          confirmation_required: true,
        }),
        { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process payouts (sorted by priority if multiple contracts fire)
    const payouts: Array<{
      execution_id: string;
      participant_id: string;
      payout_amount: number;
      payout_percentage: number;
      status: string;
    }> = [];
    let distributedAmount = 0;

    for (const rule of payoutRules.rules || []) {
      let payoutAmount = (totalAmount * rule.percentage) / 100;

      // Apply minimum/maximum constraints
      if (rule.minimum_amount && payoutAmount < rule.minimum_amount) {
        payoutAmount = rule.minimum_amount;
      }
      if (rule.maximum_amount && payoutAmount > rule.maximum_amount) {
        payoutAmount = rule.maximum_amount;
      }

      // Don't exceed remaining amount
      if (distributedAmount + payoutAmount > totalAmount) {
        payoutAmount = totalAmount - distributedAmount;
      }

      if (payoutAmount > 0) {
        payouts.push({
          execution_id: execution.id,
          participant_id: rule.participant_id,
          payout_amount: payoutAmount,
          payout_percentage: rule.percentage,
          status: "pending",
        });
        distributedAmount += payoutAmount;
      }
    }

    // Insert payout records
    if (payouts.length > 0) {
      const { error: payoutError } = await supabase
        .from("settlement_payouts")
        .insert(payouts);

      if (payoutError) {
        console.error("Failed to create payouts:", payoutError);
        throw payoutError;
      }
    }

    // Create escrow transaction with attribution
    if (typedEscrow && distributedAmount > 0) {
      await supabase
        .from("escrow_transactions")
        .insert({
          escrow_id: typedEscrow.id,
          transaction_type: "payout",
          amount: distributedAmount,
          description: `Settlement payout: ${typedContract.contract_name}`,
          revenue_source_type: typedContract.revenue_source_type || trigger_event,
          source_entity_type: trigger_data.entity_type || null,
          source_entity_id: trigger_data.entity_id || null,
          external_reference_id: trigger_data.external_reference_id || null,
          attribution_chain: attribution_chain || [],
          created_by: trigger_data.user_id || null,
        });

      // Update escrow balance
      await supabase
        .from("deal_room_escrow")
        .update({
          current_balance: typedEscrow.current_balance - distributedAmount,
          total_released: (typedEscrow.total_released || 0) + distributedAmount,
        })
        .eq("id", typedEscrow.id);
    }

    // Update execution status
    const { error: updateError } = await supabase
      .from("settlement_executions")
      .update({
        status: "completed",
        executed_at: new Date().toISOString(),
      })
      .eq("id", execution.id);

    if (updateError) {
      console.error("Failed to update execution:", updateError);
      throw updateError;
    }

    // Update contract stats
    await supabase
      .from("settlement_contracts")
      .update({
        total_distributed: (typedContract.total_distributed || 0) + distributedAmount,
        execution_count: (typedContract.execution_count || 0) + 1,
        last_executed_at: new Date().toISOString(),
      })
      .eq("id", typedContract.id);

    console.log(`Settlement completed. Distributed: $${distributedAmount}`);

    return new Response(
      JSON.stringify({
        success: true,
        execution_id: execution.id,
        total_distributed: distributedAmount,
        payout_count: payouts.length,
        revenue_source: typedContract.revenue_source_type,
        priority: typedContract.payout_priority,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Settlement execution error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function validateTrigger(
  triggerType: string,
  conditions: Record<string, unknown>,
  event: string,
  data: Record<string, unknown>
): boolean {
  console.log(`Validating trigger: ${triggerType}, event: ${event}`);

  switch (triggerType) {
    case "revenue":
      if (event !== "revenue_recorded") return false;
      if (conditions.minimum_amount && (data.amount as number) < (conditions.minimum_amount as number)) return false;
      return true;

    case "meeting_set":
      // Trigger when a meeting is confirmed
      if (event !== "meeting_confirmed" && event !== "meeting_set") return false;
      if (conditions.require_crm_confirmation && !data.crm_confirmed) return false;
      return true;

    case "deal_closed":
      // Trigger when a deal is closed
      if (event !== "deal_closed" && event !== "deal_won") return false;
      if (conditions.minimum_deal_value && (data.deal_value as number) < (conditions.minimum_deal_value as number)) return false;
      return true;

    case "retainer":
      // Trigger for scheduled retainer payments
      if (event !== "retainer_due" && event !== "scheduled_execution") return false;
      return true;

    case "milestone":
      if (event !== "milestone_completed") return false;
      if (conditions.milestone_id && data.milestone_id !== conditions.milestone_id) return false;
      return true;

    case "time_based":
      if (event !== "scheduled_execution") return false;
      return true;

    case "value_credit":
      if (event !== "value_credit_verified") return false;
      if (conditions.minimum_value && (data.amount as number) < (conditions.minimum_value as number)) return false;
      return true;

    case "usage_threshold":
      if (event !== "usage_threshold_reached") return false;
      if (conditions.threshold && (data.usage_count as number) < (conditions.threshold as number)) return false;
      return true;

    case "manual":
      return event === "manual_trigger";

    default:
      console.log(`Unknown trigger type: ${triggerType}`);
      return false;
  }
}
