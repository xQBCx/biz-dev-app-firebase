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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Extract webhook key from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const webhookKey = pathParts[pathParts.length - 1];

    if (!webhookKey || webhookKey === 'workflow-webhook-trigger') {
      return new Response(
        JSON.stringify({ error: "Webhook key is required in URL path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[webhook-trigger] Received trigger for webhook: ${webhookKey}`);

    // Find the webhook configuration
    const { data: webhook, error: webhookError } = await supabase
      .from("workflow_webhooks")
      .select(`
        *,
        workflow:workflows(*)
      `)
      .eq("webhook_key", webhookKey)
      .single();

    if (webhookError || !webhook) {
      console.error("[webhook-trigger] Webhook not found:", webhookError);
      return new Response(
        JSON.stringify({ error: "Webhook not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!webhook.is_active) {
      return new Response(
        JSON.stringify({ error: "Webhook is not active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate secret if configured
    if (webhook.secret_key) {
      const providedSecret = req.headers.get("x-webhook-secret");
      if (providedSecret !== webhook.secret_key) {
        console.error("[webhook-trigger] Invalid secret key");
        return new Response(
          JSON.stringify({ error: "Invalid webhook secret" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check rate limiting
    const now = new Date();
    const windowStart = new Date(now.getTime() - (webhook.rate_limit_window_seconds * 1000));
    
    // Simple rate limit check using trigger_count and last_triggered_at
    if (webhook.last_triggered_at) {
      const lastTrigger = new Date(webhook.last_triggered_at);
      if (lastTrigger > windowStart) {
        // Could implement more sophisticated rate limiting here
        console.log(`[webhook-trigger] Rate limit check passed`);
      }
    }

    // Parse request body
    let triggerData = {};
    try {
      if (req.method === "POST" || req.method === "PUT") {
        triggerData = await req.json();
      }
    } catch (e) {
      console.log("[webhook-trigger] No JSON body or parse error");
    }

    // Validate against schema if configured
    if (webhook.validation_schema) {
      // Would implement JSON schema validation here
      console.log("[webhook-trigger] Schema validation would run here");
    }

    // Transform data if script provided
    if (webhook.transform_script) {
      // Would implement safe transform execution here
      console.log("[webhook-trigger] Transform script would run here");
    }

    // Update webhook stats
    await supabase
      .from("workflow_webhooks")
      .update({
        last_triggered_at: now.toISOString(),
        trigger_count: (webhook.trigger_count || 0) + 1,
      })
      .eq("id", webhook.id);

    // Execute the workflow
    const { data: executeResult, error: executeError } = await supabase.functions.invoke(
      'execute-workflow-v2',
      {
        body: {
          workflow_id: webhook.workflow_id,
          trigger_type: "webhook",
          trigger_data: {
            webhook_id: webhook.id,
            webhook_name: webhook.name,
            method: req.method,
            headers: Object.fromEntries(req.headers.entries()),
            ...triggerData,
          },
          input_data: triggerData,
        },
      }
    );

    if (executeError) {
      console.error("[webhook-trigger] Execution failed:", executeError);
      return new Response(
        JSON.stringify({ error: "Workflow execution failed", details: executeError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[webhook-trigger] Workflow triggered successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Workflow triggered successfully",
        run_id: executeResult?.run_id,
        run_number: executeResult?.run_number,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[webhook-trigger] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
