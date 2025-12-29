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
  trigger_conditions: Record<string, any>;
  payout_rules: Record<string, any>;
  is_active: boolean;
}

interface PayoutRule {
  participant_id: string;
  percentage: number;
  minimum_amount?: number;
  maximum_amount?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { contract_id, trigger_event, trigger_data } = await req.json();

    console.log(`Processing settlement for contract: ${contract_id}`);
    console.log(`Trigger event: ${trigger_event}`);
    console.log(`Trigger data:`, trigger_data);

    // Fetch the contract
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

    // Validate trigger conditions
    const triggerConditions = contract.trigger_conditions as Record<string, any>;
    const isValidTrigger = validateTrigger(contract.trigger_type, triggerConditions, trigger_event, trigger_data);

    if (!isValidTrigger) {
      console.log("Trigger conditions not met");
      return new Response(
        JSON.stringify({ message: "Trigger conditions not met" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate payout amounts
    const payoutRules = contract.payout_rules as { rules: PayoutRule[] };
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
          contract_id: contract.id,
          trigger_event,
          trigger_data,
          total_amount: totalAmount,
          status: "processing",
        },
      ])
      .select()
      .single();

    if (execError) {
      console.error("Failed to create execution:", execError);
      throw execError;
    }

    console.log(`Created execution: ${execution.id}`);

    // Process payouts
    const payouts: any[] = [];
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
        total_distributed: (contract.total_distributed || 0) + distributedAmount,
        execution_count: (contract.execution_count || 0) + 1,
        last_executed_at: new Date().toISOString(),
      })
      .eq("id", contract.id);

    console.log(`Settlement completed. Distributed: $${distributedAmount}`);

    return new Response(
      JSON.stringify({
        success: true,
        execution_id: execution.id,
        total_distributed: distributedAmount,
        payout_count: payouts.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Settlement execution error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function validateTrigger(
  triggerType: string,
  conditions: Record<string, any>,
  event: string,
  data: Record<string, any>
): boolean {
  console.log(`Validating trigger: ${triggerType}, event: ${event}`);

  switch (triggerType) {
    case "revenue":
      // Trigger when revenue is recorded
      if (event !== "revenue_recorded") return false;
      if (conditions.minimum_amount && data.amount < conditions.minimum_amount) return false;
      return true;

    case "milestone":
      // Trigger when a milestone is completed
      if (event !== "milestone_completed") return false;
      if (conditions.milestone_id && data.milestone_id !== conditions.milestone_id) return false;
      return true;

    case "time_based":
      // Trigger based on schedule
      if (event !== "scheduled_execution") return false;
      return true;

    case "value_credit":
      // Trigger when value credits are verified
      if (event !== "value_credit_verified") return false;
      if (conditions.minimum_value && data.amount < conditions.minimum_value) return false;
      return true;

    case "usage_threshold":
      // Trigger when usage reaches threshold
      if (event !== "usage_threshold_reached") return false;
      if (conditions.threshold && data.usage_count < conditions.threshold) return false;
      return true;

    case "manual":
      // Always allow manual triggers from admins
      return event === "manual_trigger";

    default:
      console.log(`Unknown trigger type: ${triggerType}`);
      return false;
  }
}
