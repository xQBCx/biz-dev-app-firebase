import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegisterEndpointRequest {
  entity_id: string;
  endpoint_name: string;
  endpoint_type?: string;
  http_method?: string;
  endpoint_path: string;
  base_url: string;
  request_schema?: Record<string, unknown>;
  response_schema?: Record<string, unknown>;
  auth_type?: string;
  auth_config?: Record<string, unknown>;
  webhook_url?: string;
  headers_template?: Record<string, unknown>;
  timeout_seconds?: number;
  retry_config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
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

    const body: RegisterEndpointRequest = await req.json();

    // Validate required fields
    if (!body.entity_id || !body.endpoint_name || !body.endpoint_path || !body.base_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: entity_id, endpoint_name, endpoint_path, base_url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has access to the entity
    const { data: participant, error: participantError } = await supabase
      .from("deal_room_participants")
      .select("id, user_id")
      .eq("id", body.entity_id)
      .single();

    if (participantError || !participant) {
      return new Response(
        JSON.stringify({ error: "Entity not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user owns this entity or is admin
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (participant.user_id !== user.id && !userRole) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the endpoint
    const { data: endpoint, error: insertError } = await supabase
      .from("entity_api_endpoints")
      .insert({
        entity_id: body.entity_id,
        endpoint_name: body.endpoint_name,
        endpoint_type: body.endpoint_type || "custom",
        http_method: body.http_method || "POST",
        endpoint_path: body.endpoint_path,
        base_url: body.base_url,
        request_schema: body.request_schema || {},
        response_schema: body.response_schema || {},
        auth_type: body.auth_type || "api_key",
        auth_config: body.auth_config || {},
        webhook_url: body.webhook_url,
        headers_template: body.headers_template || {},
        timeout_seconds: body.timeout_seconds || 30,
        retry_config: body.retry_config || { max_retries: 3, backoff_ms: 1000 },
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to register endpoint", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, endpoint }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
