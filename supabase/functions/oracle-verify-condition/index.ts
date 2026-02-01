import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyConditionRequest {
  condition_id?: string;
  deal_room_id?: string;
  settlement_contract_id?: string;
  check_all?: boolean;
}

interface ConditionResult {
  condition_id: string;
  name: string;
  is_met: boolean;
  met_at?: string;
  expression: string;
  feed_value?: unknown;
  attestation_count?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: VerifyConditionRequest = await req.json();

    // Build query for conditions
    let conditionsQuery = serviceClient.from("oracle_conditions").select("*");

    if (body.condition_id) {
      conditionsQuery = conditionsQuery.eq("id", body.condition_id);
    } else if (body.deal_room_id) {
      conditionsQuery = conditionsQuery.eq("deal_room_id", body.deal_room_id);
    } else if (body.settlement_contract_id) {
      conditionsQuery = conditionsQuery.eq("settlement_contract_id", body.settlement_contract_id);
    } else {
      return new Response(JSON.stringify({ 
        error: "condition_id, deal_room_id, or settlement_contract_id required" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: conditions, error: conditionsError } = await conditionsQuery;

    if (conditionsError) {
      return new Response(JSON.stringify({ error: conditionsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: ConditionResult[] = [];

    for (const condition of conditions || []) {
      let isMet = condition.is_met;
      let feedValue: unknown = null;
      let attestationCount = 0;

      // If condition has a feed_id, check the feed value
      if (condition.feed_id && !isMet) {
        const { data: feed } = await serviceClient
          .from("oracle_data_feeds")
          .select("last_value, last_updated")
          .eq("id", condition.feed_id)
          .single();

        if (feed?.last_value) {
          feedValue = feed.last_value;
          
          // Evaluate condition expression (simplified evaluation)
          // In production, use a proper expression parser
          try {
            const expression = condition.condition_expression;
            const value = typeof feed.last_value === "object" 
              ? (feed.last_value as Record<string, unknown>).value 
              : feed.last_value;
            
            // Simple evaluation for common patterns
            if (expression.includes(">=")) {
              const threshold = parseFloat(expression.split(">=")[1].trim());
              isMet = Number(value) >= threshold;
            } else if (expression.includes("<=")) {
              const threshold = parseFloat(expression.split("<=")[1].trim());
              isMet = Number(value) <= threshold;
            } else if (expression.includes(">")) {
              const threshold = parseFloat(expression.split(">")[1].trim());
              isMet = Number(value) > threshold;
            } else if (expression.includes("<")) {
              const threshold = parseFloat(expression.split("<")[1].trim());
              isMet = Number(value) < threshold;
            } else if (expression.includes("=")) {
              const target = expression.split("=")[1].trim().replace(/['"]/g, "");
              isMet = String(value) === target;
            }
          } catch (e) {
            console.error("Error evaluating condition:", e);
          }
        }
      }

      // If condition requires attestation, count attestations
      if (condition.attestation_type && !isMet) {
        const attestationQuery = serviceClient
          .from("oracle_attestations")
          .select("id", { count: "exact" })
          .eq("attestation_type", condition.attestation_type)
          .eq("is_verified", false)
          .is("revoked_at", null);

        if (condition.deal_room_id) {
          attestationQuery.eq("deal_room_id", condition.deal_room_id);
        }

        const { count } = await attestationQuery;
        attestationCount = count || 0;
        
        // Check if attestation exists (basic check - can be extended)
        if (attestationCount > 0) {
          isMet = true;
        }
      }

      // Update condition if status changed
      if (isMet !== condition.is_met) {
        await serviceClient
          .from("oracle_conditions")
          .update({
            is_met: isMet,
            met_at: isMet ? new Date().toISOString() : null,
            last_checked_at: new Date().toISOString(),
          })
          .eq("id", condition.id);
      } else {
        await serviceClient
          .from("oracle_conditions")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", condition.id);
      }

      results.push({
        condition_id: condition.id,
        name: condition.name,
        is_met: isMet,
        met_at: isMet ? (condition.met_at || new Date().toISOString()) : undefined,
        expression: condition.condition_expression,
        feed_value: feedValue,
        attestation_count: attestationCount,
      });
    }

    const allMet = results.every(r => r.is_met);
    const anyMet = results.some(r => r.is_met);

    return new Response(
      JSON.stringify({
        success: true,
        all_conditions_met: allMet,
        any_condition_met: anyMet,
        conditions: results,
        checked_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in oracle-verify-condition:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
