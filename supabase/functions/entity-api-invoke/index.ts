import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvokeRequest {
  endpoint_id: string;
  payload?: Record<string, unknown>;
  deal_room_id?: string;
  settlement_contract_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: InvokeRequest = await req.json();
    const startTime = Date.now();

    // Validate required fields
    if (!body.endpoint_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: endpoint_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch endpoint configuration
    const { data: endpoint, error: endpointError } = await supabase
      .from("entity_api_endpoints")
      .select("*, deal_room_participants!inner(user_id, deal_room_id)")
      .eq("id", body.endpoint_id)
      .eq("is_active", true)
      .single();

    if (endpointError || !endpoint) {
      return new Response(
        JSON.stringify({ error: "Endpoint not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has access (entity member or admin)
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isParticipant = await supabase
      .from("deal_room_participants")
      .select("id")
      .eq("deal_room_id", endpoint.deal_room_participants.deal_room_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!isParticipant.data && !userRole) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build request headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(endpoint.headers_template as Record<string, string> || {}),
    };

    // Add authentication based on auth_type
    const authConfig = endpoint.auth_config as Record<string, string> || {};
    if (endpoint.auth_type === "api_key" && authConfig.api_key) {
      headers[authConfig.header_name || "X-API-Key"] = authConfig.api_key;
    } else if (endpoint.auth_type === "bearer" && authConfig.token) {
      headers["Authorization"] = `Bearer ${authConfig.token}`;
    } else if (endpoint.auth_type === "basic" && authConfig.username && authConfig.password) {
      headers["Authorization"] = `Basic ${btoa(`${authConfig.username}:${authConfig.password}`)}`;
    }

    // Build full URL
    const fullUrl = `${endpoint.base_url}${endpoint.endpoint_path}`;

    // Make the external API call
    let response: Response | undefined;
    let responseBody: unknown;
    let success = false;
    let errorMessage: string | undefined;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), (endpoint.timeout_seconds || 30) * 1000);

      response = await fetch(fullUrl, {
        method: endpoint.http_method,
        headers,
        body: endpoint.http_method !== "GET" ? JSON.stringify(body.payload || {}) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      responseBody = await response.json().catch(() => response?.text());
      success = response.ok;
      
      if (!success) {
        errorMessage = `HTTP ${response.status}: ${JSON.stringify(responseBody)}`;
      }
    } catch (fetchError) {
      const err = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
      errorMessage = err.message;
      responseBody = { error: errorMessage };
    }

    const responseTimeMs = Date.now() - startTime;

    // Log the API call
    const { data: logEntry } = await supabase
      .from("entity_api_call_logs")
      .insert({
        endpoint_id: body.endpoint_id,
        deal_room_id: body.deal_room_id,
        settlement_contract_id: body.settlement_contract_id,
        invoked_by: user.id,
        request_payload: body.payload || {},
        response_payload: responseBody as Record<string, unknown>,
        response_status_code: response?.status,
        response_time_ms: responseTimeMs,
        error_message: errorMessage,
        success,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
      })
      .select("id")
      .single();

    // Update endpoint statistics
    await supabase
      .from("entity_api_endpoints")
      .update({
        last_invoked_at: new Date().toISOString(),
        invocation_count: endpoint.invocation_count + 1,
        success_count: success ? endpoint.success_count + 1 : endpoint.success_count,
        failure_count: success ? endpoint.failure_count : endpoint.failure_count + 1,
      })
      .eq("id", body.endpoint_id);

    // Check for smart contract bindings if successful
    const triggeredBindings: string[] = [];
    if (success && (body.deal_room_id || body.settlement_contract_id)) {
      const { data: bindings } = await supabase
        .from("smart_contract_bindings")
        .select("*")
        .eq("binding_source_type", "entity_api")
        .eq("binding_source_id", body.endpoint_id)
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

          // Simple condition evaluation (production would need a proper expression parser)
          // For now, we just mark it as triggered and let the settlement-execute function handle it
          triggeredBindings.push(binding.id);
          
          await supabase
            .from("smart_contract_bindings")
            .update({
              last_triggered_at: new Date().toISOString(),
              trigger_count: binding.trigger_count + 1,
            })
            .eq("id", binding.id);
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
        success,
        response: responseBody,
        response_time_ms: responseTimeMs,
        triggered_bindings: triggeredBindings,
        log_id: logEntry?.id,
      }),
      { 
        status: success ? 200 : 502, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
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
