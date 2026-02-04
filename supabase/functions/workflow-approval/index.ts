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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { approval_id, action, reason } = await req.json();

    if (!approval_id || !action) {
      return new Response(
        JSON.stringify({ error: "approval_id and action are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["approved", "rejected", "escalated"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "action must be: approved, rejected, or escalated" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[workflow-approval] Processing ${action} for approval: ${approval_id}`);

    // Fetch the approval
    const { data: approval, error: approvalError } = await supabase
      .from("workflow_approvals")
      .select(`
        *,
        run:workflow_execution_runs(
          *,
          workflow:workflows(*)
        )
      `)
      .eq("id", approval_id)
      .single();

    if (approvalError || !approval) {
      return new Response(
        JSON.stringify({ error: "Approval not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (approval.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Approval has already been processed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is authorized
    if (approval.assigned_to && approval.assigned_to !== user.id) {
      // Check if user has admin role or is workflow owner
      const isOwner = approval.run?.workflow?.user_id === user.id;
      if (!isOwner) {
        return new Response(
          JSON.stringify({ error: "You are not authorized to process this approval" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check expiration
    if (approval.expires_at && new Date(approval.expires_at) < new Date()) {
      await supabase
        .from("workflow_approvals")
        .update({ status: "expired" })
        .eq("id", approval_id);

      return new Response(
        JSON.stringify({ error: "Approval has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update approval
    await supabase
      .from("workflow_approvals")
      .update({
        status: action,
        decision_reason: reason,
        decided_by: user.id,
        decided_at: new Date().toISOString(),
        ...(action === "escalated" ? { escalated_at: new Date().toISOString() } : {}),
      })
      .eq("id", approval_id);

    if (action === "approved") {
      // Resume workflow execution
      const run = approval.run;
      if (run && run.workflow) {
        // Find the node that was waiting and continue from there
        const { data: nodeExec } = await supabase
          .from("workflow_node_executions")
          .select("*")
          .eq("id", approval.node_execution_id)
          .single();

        if (nodeExec) {
          // Mark the approval node as completed
          await supabase
            .from("workflow_node_executions")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              output_data: { approved: true, approved_by: user.id, reason },
            })
            .eq("id", nodeExec.id);
        }

        // Resume the workflow from the next node
        // This would trigger continuation of workflow execution
        console.log(`[workflow-approval] Resuming workflow from node ${nodeExec?.execution_order}`);

        // Update run status
        await supabase
          .from("workflow_execution_runs")
          .update({ status: "running" })
          .eq("id", run.id);

        // TODO: Implement workflow continuation from approval point
        // This would involve re-invoking execute-workflow-v2 with start_from_node parameter
      }
    } else if (action === "rejected") {
      // Mark workflow run as cancelled
      if (approval.run) {
        await supabase
          .from("workflow_execution_runs")
          .update({
            status: "cancelled",
            completed_at: new Date().toISOString(),
            error_message: `Approval rejected: ${reason || 'No reason provided'}`,
          })
          .eq("id", approval.run.id);
      }
    } else if (action === "escalated") {
      // Handle escalation - would notify escalate_to user
      console.log(`[workflow-approval] Escalated to: ${approval.escalate_to}`);
    }

    console.log(`[workflow-approval] Successfully processed: ${action}`);

    return new Response(
      JSON.stringify({
        success: true,
        approval_id,
        action,
        message: `Approval ${action} successfully`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[workflow-approval] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
