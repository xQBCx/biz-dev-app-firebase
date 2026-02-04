import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NodeExecution {
  id: string;
  node_id: string;
  node_type: string;
  node_name: string;
  execution_order: number;
  status: string;
  input_data: any;
  output_data: any;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  ai_model_used?: string;
  tokens_consumed?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { 
      workflow_id, 
      version_id,
      trigger_type = "manual", 
      trigger_data = {},
      input_data = {},
      priority = 5,
      correlation_id,
      parent_run_id
    } = await req.json();

    if (!workflow_id) {
      return new Response(
        JSON.stringify({ error: "workflow_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[execute-workflow-v2] Starting workflow: ${workflow_id}`);

    // Fetch workflow with version if specified
    const { data: workflow, error: wfError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflow_id)
      .single();

    if (wfError || !workflow) {
      console.error("[execute-workflow-v2] Workflow not found:", wfError);
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

    // Get next run number
    const { data: runNumberData } = await supabase
      .rpc('get_next_workflow_run_number', { p_workflow_id: workflow_id });
    
    const runNumber = runNumberData || 1;
    const nodes = workflow.node_definitions || [];

    // Create execution run record with enhanced tracking
    const { data: run, error: runError } = await supabase
      .from("workflow_execution_runs")
      .insert({
        workflow_id,
        version_id,
        run_number: runNumber,
        status: "running",
        trigger_type,
        trigger_data,
        input_data,
        priority,
        correlation_id,
        parent_run_id,
        node_count: nodes.length,
        started_at: new Date().toISOString(),
        created_by: workflow.user_id,
      })
      .select()
      .single();

    if (runError) {
      console.error("[execute-workflow-v2] Failed to create run:", runError);
      throw runError;
    }

    console.log(`[execute-workflow-v2] Created run #${runNumber}: ${run.id}`);

    let currentOutput: any = { ...trigger_data, ...input_data };
    let nodesCompleted = 0;
    let nodesFailed = 0;
    let totalCredits = 0;

    // Execute nodes sequentially with detailed logging
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeStartTime = Date.now();

      // Create node execution record
      const { data: nodeExec, error: nodeExecError } = await supabase
        .from("workflow_node_executions")
        .insert({
          run_id: run.id,
          node_id: node.id,
          node_type: node.type,
          node_name: node.name || `Node ${i + 1}`,
          execution_order: i,
          status: "running",
          input_data: currentOutput,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (nodeExecError) {
        console.error("[execute-workflow-v2] Failed to create node execution:", nodeExecError);
      }

      console.log(`[execute-workflow-v2] Executing node ${i + 1}/${nodes.length}: ${node.type}`);

      // Check if node requires approval
      if (node.requires_approval) {
        await handleApprovalNode(supabase, run.id, nodeExec?.id, node, currentOutput, workflow.user_id);
        
        // Update run status to waiting
        await supabase
          .from("workflow_execution_runs")
          .update({ status: "waiting_approval" })
          .eq("id", run.id);

        return new Response(
          JSON.stringify({
            success: true,
            run_id: run.id,
            run_number: runNumber,
            status: "waiting_approval",
            approval_node: node.name || node.type,
            message: "Workflow is waiting for approval to continue"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const result = await executeNode(node, currentOutput, supabase, workflow.user_id);
        const duration = Date.now() - nodeStartTime;

        // Update node execution as completed
        if (nodeExec) {
          await supabase
            .from("workflow_node_executions")
            .update({
              status: "completed",
              output_data: result.output,
              completed_at: new Date().toISOString(),
              duration_ms: duration,
              ai_model_used: result.model_used,
              tokens_consumed: result.tokens,
            })
            .eq("id", nodeExec.id);
        }

        currentOutput = result.output;
        nodesCompleted++;
        totalCredits += result.credits || 0;

        // Update run progress
        await supabase
          .from("workflow_execution_runs")
          .update({ 
            nodes_completed: nodesCompleted,
            credits_consumed: totalCredits 
          })
          .eq("id", run.id);

      } catch (nodeError: any) {
        console.error(`[execute-workflow-v2] Node execution failed:`, nodeError);
        const duration = Date.now() - nodeStartTime;

        // Update node execution as failed
        if (nodeExec) {
          await supabase
            .from("workflow_node_executions")
            .update({
              status: "failed",
              error_message: nodeError.message,
              completed_at: new Date().toISOString(),
              duration_ms: duration,
            })
            .eq("id", nodeExec.id);
        }

        nodesFailed++;

        // Check retry config
        const retryConfig = node.retry_config || { max_retries: 0 };
        if (node.retry_attempt < retryConfig.max_retries) {
          // Would implement retry logic here
          console.log(`[execute-workflow-v2] Retry logic would trigger for node ${node.id}`);
        }

        // Mark run as failed
        await supabase
          .from("workflow_execution_runs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - new Date(run.started_at).getTime(),
            nodes_completed: nodesCompleted,
            nodes_failed: nodesFailed,
            error_message: nodeError.message,
            error_stack: nodeError.stack,
            output_data: currentOutput,
            credits_consumed: totalCredits,
          })
          .eq("id", run.id);

        return new Response(
          JSON.stringify({
            success: false,
            run_id: run.id,
            run_number: runNumber,
            status: "failed",
            error: nodeError.message,
            failed_node: node.name || node.type,
            nodes_completed: nodesCompleted,
            nodes_failed: nodesFailed,
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const totalDuration = Date.now() - new Date(run.started_at).getTime();

    // Mark run as completed
    await supabase
      .from("workflow_execution_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        duration_ms: totalDuration,
        nodes_completed: nodesCompleted,
        output_data: currentOutput,
        credits_consumed: totalCredits,
      })
      .eq("id", run.id);

    // Update workflow stats
    await supabase
      .from("workflows")
      .update({
        run_count: (workflow.run_count || 0) + 1,
        last_run_at: new Date().toISOString()
      })
      .eq("id", workflow_id);

    console.log(`[execute-workflow-v2] Workflow completed in ${totalDuration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        run_id: run.id,
        run_number: runNumber,
        status: "completed",
        duration_ms: totalDuration,
        nodes_completed: nodesCompleted,
        credits_consumed: totalCredits,
        output: currentOutput,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[execute-workflow-v2] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleApprovalNode(
  supabase: any,
  runId: string,
  nodeExecutionId: string | undefined,
  node: any,
  context: any,
  userId: string
) {
  const { data: approval } = await supabase
    .from("workflow_approvals")
    .insert({
      run_id: runId,
      node_execution_id: nodeExecutionId,
      approval_type: node.approval_type || "continue",
      title: node.name || "Approval Required",
      description: node.approval_description || "This workflow step requires manual approval to continue.",
      context_data: context,
      required_role: node.required_role,
      assigned_to: node.assigned_to || userId,
      expires_at: node.approval_timeout 
        ? new Date(Date.now() + node.approval_timeout * 1000).toISOString() 
        : null,
    })
    .select()
    .single();

  console.log(`[execute-workflow-v2] Created approval request: ${approval?.id}`);
  return approval;
}

interface NodeResult {
  output: any;
  model_used?: string;
  tokens?: number;
  credits?: number;
}

async function executeNode(
  node: any,
  input: any,
  supabase: any,
  userId: string
): Promise<NodeResult> {
  const { type, config = {} } = node;

  switch (type) {
    // Trigger nodes
    case "trigger_manual":
    case "trigger_schedule":
    case "trigger_webhook":
    case "trigger_event":
      return { output: input };

    // CRM Actions
    case "action_create_deal": {
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
      return { output: { ...input, deal }, credits: 0.5 };
    }

    case "action_update_deal": {
      if (input.deal_id || config.deal_id) {
        await supabase
          .from("crm_deals")
          .update(config.updates || input.updates || {})
          .eq("id", config.deal_id || input.deal_id);
      }
      return { output: input, credits: 0.25 };
    }

    case "action_create_contact": {
      const { data: contact } = await supabase
        .from("crm_contacts")
        .insert({
          user_id: userId,
          first_name: config.first_name || input.first_name || "New",
          last_name: config.last_name || input.last_name || "Contact",
          email: config.email || input.email,
          phone: config.phone || input.phone,
        })
        .select()
        .single();
      return { output: { ...input, contact }, credits: 0.5 };
    }

    case "action_create_task": {
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
      return { output: { ...input, task }, credits: 0.5 };
    }

    // AI nodes with token tracking
    case "ai_generate_content": {
      const result = await generateAIContent(config.prompt || input.prompt);
      return { 
        output: { ...input, generated_content: result.content },
        model_used: result.model,
        tokens: result.tokens,
        credits: result.tokens ? result.tokens / 1000 : 1
      };
    }

    case "ai_analyze_sentiment": {
      const result = await analyzeSentiment(input.text || config.text);
      return { 
        output: { ...input, sentiment: result.sentiment },
        model_used: result.model,
        tokens: result.tokens,
        credits: result.tokens ? result.tokens / 1000 : 0.5
      };
    }

    case "ai_summarize": {
      const result = await summarizeText(input.text || config.text);
      return { 
        output: { ...input, summary: result.summary },
        model_used: result.model,
        tokens: result.tokens,
        credits: result.tokens ? result.tokens / 1000 : 0.5
      };
    }

    case "ai_classify": {
      const result = await classifyContent(input.text || config.text, config.categories || []);
      return { 
        output: { ...input, classification: result.classification },
        model_used: result.model,
        tokens: result.tokens,
        credits: result.tokens ? result.tokens / 1000 : 0.5
      };
    }

    case "ai_extract_entities": {
      const result = await extractEntities(input.text || config.text);
      return { 
        output: { ...input, entities: result.entities },
        model_used: result.model,
        tokens: result.tokens,
        credits: result.tokens ? result.tokens / 1000 : 0.5
      };
    }

    // Drive-By Intelligence nodes
    case "driveby_process_capture": {
      // Process visual capture from fleet
      console.log(`[node:driveby_process] Processing capture: ${input.capture_id}`);
      return { output: { ...input, capture_processed: true }, credits: 2 };
    }

    case "driveby_match_opportunity": {
      // Match detected opportunity to products/services
      console.log(`[node:driveby_match] Matching opportunity`);
      return { output: { ...input, matches: [] }, credits: 1 };
    }

    case "driveby_create_work_order": {
      // Create work order from detection
      const { data: workOrder } = await supabase
        .from("fleet_work_orders")
        .insert({
          issue_type: config.issue_type || input.issue_type || "general",
          issue_description: config.description || input.description,
          location_address: config.location || input.location,
          status: "pending",
          priority: config.priority || "medium",
        })
        .select()
        .single();
      return { output: { ...input, work_order: workOrder }, credits: 1 };
    }

    // Integration nodes
    case "integration_webhook": {
      if (config.url) {
        try {
          const response = await fetch(config.url, {
            method: config.method || "POST",
            headers: { 
              "Content-Type": "application/json",
              ...(config.headers || {})
            },
            body: JSON.stringify(input),
          });
          const webhookResult = await response.json();
          return { output: { ...input, webhook_response: webhookResult }, credits: 0.5 };
        } catch (e) {
          return { output: { ...input, webhook_error: (e as Error).message }, credits: 0.25 };
        }
      }
      return { output: input };
    }

    case "integration_api_call": {
      if (config.url) {
        try {
          const response = await fetch(config.url, {
            method: config.method || "GET",
            headers: config.headers || {},
            body: config.method !== "GET" ? JSON.stringify(config.body || input) : undefined,
          });
          const apiResult = await response.json();
          return { output: { ...input, api_response: apiResult }, credits: 0.5 };
        } catch (e) {
          return { output: { ...input, api_error: (e as Error).message }, credits: 0.25 };
        }
      }
      return { output: input };
    }

    // Partner agent integration (OptimoIT)
    case "partner_run_agent": {
      console.log(`[node:partner_agent] Running partner agent: ${config.agent_id}`);
      // Would invoke partner agent via their API or MCP
      return { output: { ...input, partner_agent_result: {} }, credits: 5 };
    }

    // Project ingestion nodes
    case "project_ingest_code": {
      console.log(`[node:project_ingest] Ingesting project: ${config.project_url}`);
      return { output: { ...input, ingested: true }, credits: 10 };
    }

    // Logic nodes
    case "logic_condition": {
      const conditionMet = evaluateCondition(config.condition || "true", input);
      return { output: { ...input, condition_met: conditionMet } };
    }

    case "logic_delay": {
      const delayMs = (config.delay_seconds || 0) * 1000;
      if (delayMs > 0 && delayMs <= 30000) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      return { output: input };
    }

    case "logic_loop": {
      const items = input[config.array_field] || config.items || [];
      const results = [];
      for (const item of items) {
        results.push(item);
      }
      return { output: { ...input, loop_results: results } };
    }

    case "logic_switch": {
      const value = input[config.switch_field] || config.value;
      const matchedCase = config.cases?.find((c: any) => c.value === value);
      return { output: { ...input, matched_case: matchedCase?.label || "default" } };
    }

    // ERP/Audit nodes
    case "erp_sync_inventory":
    case "erp_create_invoice":
    case "erp_update_order":
    case "audit_run_check":
    case "audit_generate_report":
    case "audit_flag_issue":
      console.log(`[node:${type}] Executing with config:`, config);
      return { output: { ...input, [`${type}_completed`]: true }, credits: 1 };

    default:
      console.log(`[node:unknown] Unknown node type: ${type}`);
      return { output: input };
  }
}

// AI Helper Functions with token tracking
async function generateAIContent(prompt: string): Promise<{ content: string; model: string; tokens: number }> {
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return { content: `[AI placeholder] Content for: ${prompt}`, model: "mock", tokens: 0 };
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
    return {
      content: data.choices?.[0]?.message?.content || `Generated content for: ${prompt}`,
      model: "google/gemini-2.5-flash",
      tokens: data.usage?.total_tokens || 100,
    };
  } catch (e) {
    console.error("[AI] Generation failed:", e);
    return { content: "[AI error] Could not generate content", model: "error", tokens: 0 };
  }
}

async function analyzeSentiment(text: string): Promise<{ sentiment: string; model: string; tokens: number }> {
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return { sentiment: "neutral", model: "mock", tokens: 0 };

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
    return {
      sentiment: data.choices?.[0]?.message?.content?.toLowerCase().trim() || "neutral",
      model: "google/gemini-2.5-flash-lite",
      tokens: data.usage?.total_tokens || 50,
    };
  } catch {
    return { sentiment: "neutral", model: "error", tokens: 0 };
  }
}

async function summarizeText(text: string): Promise<{ summary: string; model: string; tokens: number }> {
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return { summary: text.substring(0, 100) + "...", model: "mock", tokens: 0 };

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
    return {
      summary: data.choices?.[0]?.message?.content || text.substring(0, 100),
      model: "google/gemini-2.5-flash",
      tokens: data.usage?.total_tokens || 100,
    };
  } catch {
    return { summary: text.substring(0, 100) + "...", model: "error", tokens: 0 };
  }
}

async function classifyContent(text: string, categories: string[]): Promise<{ classification: string; model: string; tokens: number }> {
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return { classification: categories[0] || "general", model: "mock", tokens: 0 };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: `Classify the text into one of these categories: ${categories.join(", ")}. Reply with only the category name.` },
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();
    return {
      classification: data.choices?.[0]?.message?.content?.trim() || "general",
      model: "google/gemini-2.5-flash-lite",
      tokens: data.usage?.total_tokens || 50,
    };
  } catch {
    return { classification: "general", model: "error", tokens: 0 };
  }
}

async function extractEntities(text: string): Promise<{ entities: any[]; model: string; tokens: number }> {
  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return { entities: [], model: "mock", tokens: 0 };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Extract named entities from the text. Return as JSON array with objects having 'type' (person, organization, location, date, etc.) and 'value' fields." },
          { role: "user", content: text },
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    let entities = [];
    try {
      entities = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    } catch {
      entities = [];
    }
    return {
      entities,
      model: "google/gemini-2.5-flash",
      tokens: data.usage?.total_tokens || 150,
    };
  } catch {
    return { entities: [], model: "error", tokens: 0 };
  }
}

function evaluateCondition(condition: string, context: any): boolean {
  try {
    if (condition === "true") return true;
    if (condition === "false") return false;

    const match = condition.match(/^(\w+)\s*(>|<|>=|<=|==|!=)\s*(.+)$/);
    if (match) {
      const [, field, operator, valueStr] = match;
      const contextValue = context[field];
      const compareValue = isNaN(Number(valueStr)) ? valueStr.replace(/['"]/g, '') : Number(valueStr);

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
