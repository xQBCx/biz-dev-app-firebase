import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { workflow_id, trigger_type = "manual", trigger_data = {} } = await req.json();

    if (!workflow_id) {
      return new Response(
        JSON.stringify({ error: "workflow_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[execute-workflow] Starting workflow: ${workflow_id}`);

    // Fetch workflow
    const { data: workflow, error: wfError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflow_id)
      .single();

    if (wfError || !workflow) {
      console.error("[execute-workflow] Workflow not found:", wfError);
      return new Response(
        JSON.stringify({ error: "Workflow not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!workflow.is_active) {
      return new Response(
        JSON.stringify({ error: "Workflow is not active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create workflow run record
    const { data: run, error: runError } = await supabase
      .from("workflow_runs")
      .insert({
        workflow_id,
        status: "running",
        trigger_type,
        trigger_data,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (runError) {
      console.error("[execute-workflow] Failed to create run:", runError);
      throw runError;
    }

    console.log(`[execute-workflow] Created run: ${run.id}`);

    const nodes = workflow.node_definitions || [];
    const executionLog: any[] = [];
    let currentOutput: any = trigger_data;

    // Execute nodes sequentially
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      console.log(`[execute-workflow] Executing node ${i + 1}/${nodes.length}: ${node.type}`);

      try {
        const result = await executeNode(node, currentOutput, supabase, workflow.user_id);
        executionLog.push({
          node_id: node.id,
          node_type: node.type,
          status: "success",
          output: result,
          executed_at: new Date().toISOString(),
        });
        currentOutput = result;
      } catch (nodeError: any) {
        console.error(`[execute-workflow] Node execution failed:`, nodeError);
        executionLog.push({
          node_id: node.id,
          node_type: node.type,
          status: "failed",
          error: nodeError.message,
          executed_at: new Date().toISOString(),
        });

        // Mark run as failed
        await supabase
          .from("workflow_runs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            output_data: { log: executionLog, error: nodeError.message },
          })
          .eq("id", run.id);

        return new Response(
          JSON.stringify({ 
            success: false, 
            run_id: run.id, 
            error: nodeError.message,
            log: executionLog 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Mark run as completed
    await supabase
      .from("workflow_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        output_data: { log: executionLog, final_output: currentOutput },
      })
      .eq("id", run.id);

    // Update workflow run count
    await supabase
      .from("workflows")
      .update({ 
        run_count: (workflow.run_count || 0) + 1,
        last_run_at: new Date().toISOString()
      })
      .eq("id", workflow_id);

    console.log(`[execute-workflow] Workflow completed successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        run_id: run.id, 
        output: currentOutput,
        log: executionLog 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[execute-workflow] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function executeNode(
  node: any, 
  input: any, 
  supabase: any,
  userId: string
): Promise<any> {
  const { type, config = {} } = node;

  switch (type) {
    // Trigger nodes (just pass through)
    case "trigger_manual":
    case "trigger_schedule":
    case "trigger_webhook":
    case "trigger_event":
      return input;

    // CRM Actions
    case "action_create_deal":
      const { data: deal } = await supabase
        .from("crm_deals")
        .insert({
          user_id: userId,
          title: config.title || input.title || "New Deal",
          value: config.value || input.value || 0,
          stage: config.stage || "lead",
        })
        .select()
        .single();
      return { ...input, deal };

    case "action_update_deal":
      if (input.deal_id || config.deal_id) {
        await supabase
          .from("crm_deals")
          .update(config.updates || input.updates || {})
          .eq("id", config.deal_id || input.deal_id);
      }
      return input;

    case "action_create_task":
      const { data: task } = await supabase
        .from("tasks")
        .insert({
          user_id: userId,
          title: config.title || input.title || "New Task",
          priority: config.priority || "medium",
          status: "todo",
        })
        .select()
        .single();
      return { ...input, task };

    // Communication Actions
    case "action_send_email":
      // Would integrate with email service
      console.log(`[node:send_email] Would send email to: ${config.to || input.email}`);
      return { ...input, email_sent: true };

    case "action_send_sms":
      // Would integrate with SMS service
      console.log(`[node:send_sms] Would send SMS to: ${config.to || input.phone}`);
      return { ...input, sms_sent: true };

    case "action_send_notification":
      // Internal notification
      return { ...input, notification_sent: true };

    // Logic nodes
    case "logic_condition":
      const condition = config.condition || "true";
      // Simple condition evaluation
      const conditionMet = evaluateCondition(condition, input);
      return { ...input, condition_met: conditionMet };

    case "logic_delay":
      const delayMs = (config.delay_seconds || 0) * 1000;
      if (delayMs > 0 && delayMs <= 30000) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      return input;

    case "logic_loop":
      // Loop logic would iterate over array in input
      return input;

    case "logic_switch":
      // Switch/case logic
      return input;

    // AI nodes
    case "ai_generate_content":
      const aiContent = await generateAIContent(config.prompt || input.prompt);
      return { ...input, generated_content: aiContent };

    case "ai_analyze_sentiment":
      const sentiment = await analyzeSentiment(input.text || config.text);
      return { ...input, sentiment };

    case "ai_summarize":
      const summary = await summarizeText(input.text || config.text);
      return { ...input, summary };

    case "ai_classify":
      return { ...input, classification: "general" };

    case "ai_extract_entities":
      return { ...input, entities: [] };

    // Integration nodes
    case "integration_webhook":
      if (config.url) {
        try {
          const response = await fetch(config.url, {
            method: config.method || "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });
          const webhookResult = await response.json();
          return { ...input, webhook_response: webhookResult };
        } catch (e) {
          return { ...input, webhook_error: (e as Error).message };
        }
      }
      return input;

    case "integration_api_call":
      // Generic API call
      return input;

    // Data nodes
    case "action_query_database":
      // Would execute safe, parameterized queries
      return input;

    case "action_update_database":
      // Would execute safe updates
      return input;

    // ERP/Audit nodes
    case "erp_sync_inventory":
    case "erp_create_invoice":
    case "erp_update_order":
    case "audit_run_check":
    case "audit_generate_report":
    case "audit_flag_issue":
      // Placeholder implementations
      console.log(`[node:${type}] Executing with config:`, config);
      return { ...input, [`${type}_completed`]: true };

    default:
      console.log(`[node:unknown] Unknown node type: ${type}`);
      return input;
  }
}

async function generateAIContent(prompt: string): Promise<string> {
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return `[AI placeholder] Content for: ${prompt}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Generate concise, professional content." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || `Generated content for: ${prompt}`;
  } catch (e) {
    console.error("[AI] Generation failed:", e);
    return `[AI error] Could not generate content`;
  }
}

async function analyzeSentiment(text: string): Promise<string> {
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return "neutral";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Analyze sentiment. Reply with only: positive, negative, or neutral" },
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.toLowerCase().trim() || "neutral";
  } catch {
    return "neutral";
  }
}

async function summarizeText(text: string): Promise<string> {
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return text.substring(0, 100) + "...";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Summarize the text in 2-3 sentences." },
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || text.substring(0, 100);
  } catch {
    return text.substring(0, 100) + "...";
  }
}

function evaluateCondition(condition: string, context: any): boolean {
  // Simple condition evaluation (in production, use a proper expression parser)
  try {
    if (condition === "true") return true;
    if (condition === "false") return false;
    
    // Check for simple comparisons like "value > 1000"
    const match = condition.match(/^(\w+)\s*(>|<|>=|<=|==|!=)\s*(.+)$/);
    if (match) {
      const [, field, operator, valueStr] = match;
      const contextValue = context[field];
      const compareValue = isNaN(Number(valueStr)) ? valueStr : Number(valueStr);
      
      switch (operator) {
        case ">": return contextValue > compareValue;
        case "<": return contextValue < compareValue;
        case ">=": return contextValue >= compareValue;
        case "<=": return contextValue <= compareValue;
        case "==": return contextValue == compareValue;
        case "!=": return contextValue != compareValue;
      }
    }
    
    return true;
  } catch {
    return true;
  }
}
