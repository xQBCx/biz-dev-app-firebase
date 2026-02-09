import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.4";

const WEB_CLIENT_URL = Deno.env.get("WEB_CLIENT_URL");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const {
    type,
    payload,
  }: {
    type: "workflow-run.requested";
    payload: {
      id: string;
      prompt: string;
      prompt_data: Record<string, unknown>;
      session_id: string;
      project_id: string;
      status: "requested";
      created_at: string;
      context: {
        lovable_prompt_id?: string;
        lovable_prompt_run_id?: string;
        lovable_project_id?: string;
        lovable_session_id?: string;
        github_pr_id?: number;
      };
    };
  } = await req.json();

  const { id: workflow_run_id, context } = payload;
  const { lovable_project_id, lovable_session_id } = context;

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   return new Response("Not authenticated", { status: 401 });
  // }

  const status = "approved";
  // const status =
  //   prompt_data?.project_owner_id === user.id ? "approved" : "rejected";

  const { error } = await supabaseAdmin
    .from("workflow_runs")
    .update({ status })
    .eq("id", workflow_run_id);

  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Create a new notification
  await supabaseAdmin.from("notifications").insert({
    project_id: lovable_project_id,
    message: `Workflow run ${status}`,
    // You might want to add more context to the notification
  });

  // Create a new event for the event stream
  await supabaseAdmin.from("events").insert({
    project_id: lovable_project_id,
    name: "workflow_run_updated",
    payload: {
      workflow_run_id,
      status,
    },
  });

  return new Response(JSON.stringify({ status }), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
