import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get endpoint ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const endpointId = pathParts[pathParts.length - 1] || url.searchParams.get("endpoint_id");

    if (!endpointId) {
      return new Response(
        JSON.stringify({ error: "Missing endpoint_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch endpoint configuration
    const { data: endpoint, error: endpointError } = await supabase
      .from("entity_api_endpoints")
      .select("*, deal_room_participants!inner(user_id, deal_room_id)")
      .eq("id", endpointId)
      .eq("is_active", true)
      .single();

    if (endpointError || !endpoint) {
      return new Response(
        JSON.stringify({ error: "Endpoint not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify webhook secret if configured
    const authConfig = endpoint.auth_config as Record<string, string> || {};
    if (authConfig.webhook_secret) {
      const providedSecret = req.headers.get("x-webhook-secret");
      if (providedSecret !== authConfig.webhook_secret) {
        return new Response(
          JSON.stringify({ error: "Invalid webhook secret" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Parse webhook payload
    let payload: Record<string, unknown>;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());
    } else {
      payload = { raw_body: await req.text() };
    }

    const startTime = Date.now();

    // Log the webhook receipt
    const { data: logEntry } = await supabase
      .from("entity_api_call_logs")
      .insert({
        endpoint_id: endpointId,
        deal_room_id: endpoint.deal_room_participants.deal_room_id,
        invoked_by: endpoint.deal_room_participants.user_id, // Entity owner
        request_payload: payload,
        response_payload: { webhook_received: true },
        response_status_code: 200,
        response_time_ms: Date.now() - startTime,
        success: true,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "webhook",
      })
      .select("id")
      .single();

    // Update endpoint statistics
    await supabase
      .from("entity_api_endpoints")
      .update({
        last_invoked_at: new Date().toISOString(),
        invocation_count: endpoint.invocation_count + 1,
        success_count: endpoint.success_count + 1,
      })
      .eq("id", endpointId);

    // Check for smart contract bindings
    const triggeredBindings: string[] = [];
    const { data: bindings } = await supabase
      .from("smart_contract_bindings")
      .select("*")
      .eq("binding_source_type", "entity_api")
      .eq("binding_source_id", endpointId)
      .eq("is_active", true);

    if (bindings && bindings.length > 0) {
      for (const binding of bindings) {
        // Update binding evaluation stats
        await supabase
          .from("smart_contract_bindings")
          .update({
            last_evaluated_at: new Date().toISOString(),
            evaluation_count: binding.evaluation_count + 1,
          })
          .eq("id", binding.id);

        // Evaluate condition against webhook payload
        // Simple check - in production use a proper expression parser
        let conditionMet = false;
        try {
          // Create a simple evaluation context
          const context = { response: payload, payload };
          const expression = binding.condition_expression;
          
          // Basic pattern matching for common conditions
          if (expression.includes("status") && payload.status) {
            if (expression.includes("approved") && payload.status === "approved") {
              conditionMet = true;
            } else if (expression.includes("completed") && payload.status === "completed") {
              conditionMet = true;
            }
          }
          
          // Check for "true" expression (always trigger)
          if (expression === "true" || expression === "1") {
            conditionMet = true;
          }
        } catch (evalError) {
          console.error("Condition evaluation error:", evalError);
        }

        if (conditionMet) {
          triggeredBindings.push(binding.id);
          
          await supabase
            .from("smart_contract_bindings")
            .update({
              last_triggered_at: new Date().toISOString(),
              trigger_count: binding.trigger_count + 1,
            })
            .eq("id", binding.id);

          // Optionally trigger settlement execution
          if (binding.action_on_trigger === "execute_settlement" && binding.settlement_contract_id) {
            // Queue settlement execution
            console.log(`Triggering settlement for contract: ${binding.settlement_contract_id}`);
          }
        }
      }

      // Update log with triggered bindings
      if (triggeredBindings.length > 0 && logEntry) {
        await supabase
          .from("entity_api_call_logs")
          .update({ triggered_bindings: triggeredBindings })
          .eq("id", logEntry.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook received",
        triggered_bindings: triggeredBindings,
        log_id: logEntry?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const err = error instanceof Error ? error : new Error(String(error));
    return new Response(
      JSON.stringify({ error: "Internal server error", details: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
