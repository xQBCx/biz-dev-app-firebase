/**
 * Sanity Check Cron
 * 
 * This edge function is designed to be called by pg_cron or external scheduler
 * to prove that the workflow engine runs autonomously in the cloud.
 * 
 * What it does:
 * 1. Calls model-gateway with task_type="summary" to generate a status message
 * 2. Inserts the result into test_automation_logs
 * 3. Returns success/failure status
 * 
 * This uses the same infrastructure as production workflows:
 * - Model Gateway for AI calls
 * - Supabase for persistence
 * - Service role for authentication (no user session required)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Static workflow ID for the sanity check workflow
const SANITY_CHECK_WORKFLOW_ID = "00000000-0000-0000-0000-000000000001";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log("[sanity-check-cron] Starting automated sanity check...");

    // Step 1: Call model-gateway to generate status message
    const timestamp = new Date().toISOString();
    const prompt = `Generate a one-sentence status update for Biz Dev cloud automation test with the current timestamp: ${timestamp}. Be concise and include the exact timestamp in your response.`;

    let aiMessage = "";
    let modelUsed = "";
    let tokensUsed = 0;

    try {
      // Call model-gateway directly
      const gatewayResponse = await fetch(`${supabaseUrl}/functions/v1/model-gateway`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_type: "summary",
          prompt,
          system_prompt: "You are a system status reporter. Generate brief, professional status updates.",
          max_tokens: 100,
          temperature: 0.3,
        }),
      });

      if (gatewayResponse.ok) {
        const gatewayData = await gatewayResponse.json();
        aiMessage = gatewayData.content || `[Fallback] Sanity check executed at ${timestamp}`;
        modelUsed = gatewayData.model || "unknown";
        tokensUsed = gatewayData.usage?.total_tokens || 0;
        console.log(`[sanity-check-cron] Model gateway success: ${modelUsed}`);
      } else {
        const errorText = await gatewayResponse.text();
        console.error("[sanity-check-cron] Model gateway error:", errorText);
        aiMessage = `[Gateway Error] Sanity check fallback at ${timestamp}`;
        modelUsed = "fallback";
      }
    } catch (gatewayError) {
      console.error("[sanity-check-cron] Gateway call failed:", gatewayError);
      aiMessage = `[Network Error] Sanity check fallback at ${timestamp}`;
      modelUsed = "fallback";
    }

    // Step 2: Insert into test_automation_logs
    const executionMetadata = {
      trigger: "cron",
      model_used: modelUsed,
      tokens_used: tokensUsed,
      duration_ms: Date.now() - startTime,
      environment: "production",
      timestamp_utc: timestamp,
    };

    const { data: logEntry, error: insertError } = await supabase
      .from("test_automation_logs")
      .insert({
        message: aiMessage,
        workflow_id: SANITY_CHECK_WORKFLOW_ID,
        agent_id: null, // No agent for this simple test
        execution_metadata: executionMetadata,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[sanity-check-cron] Failed to insert log:", insertError);
      throw insertError;
    }

    const duration = Date.now() - startTime;
    console.log(`[sanity-check-cron] Complete in ${duration}ms. Log ID: ${logEntry.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        log_id: logEntry.id,
        message: aiMessage,
        model_used: modelUsed,
        duration_ms: duration,
        run_time: timestamp,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[sanity-check-cron] Error:", error);
    
    // Try to log the failure
    try {
      await supabase.from("test_automation_logs").insert({
        message: `[ERROR] ${error.message}`,
        workflow_id: SANITY_CHECK_WORKFLOW_ID,
        execution_metadata: {
          error: error.message,
          stack: error.stack,
          duration_ms: Date.now() - startTime,
        },
      });
    } catch (logError) {
      console.error("[sanity-check-cron] Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        duration_ms: Date.now() - startTime,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
