import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lindy-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log('Received Lindy.ai webhook:', payload);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract webhook data
    const { 
      event_type, 
      workflow_id, 
      user_id, 
      action, 
      data,
      lindy_integration_id 
    } = payload;

    console.log('Processing webhook event:', event_type);

    // Store webhook event
    const { error: webhookError } = await supabase
      .from('lindy_webhooks')
      .insert({
        event_type,
        workflow_id,
        integration_id: lindy_integration_id,
        payload: payload,
        processed: false,
      });

    if (webhookError) {
      console.error('Error storing webhook:', webhookError);
      throw webhookError;
    }

    // Map Lindy.ai action to MCP agent
    let agentId = 'general:assistant';
    let taskInput: any = { action, data };

    // Route to appropriate agent based on action type
    if (action?.includes('crm') || action?.includes('contact')) {
      agentId = 'crm:sync';
      taskInput = {
        action: 'sync_data',
        entity_type: data?.entity_type || 'contact',
        data: data
      };
    } else if (action?.includes('email') || action?.includes('message')) {
      agentId = 'email:assistant';
      taskInput = {
        action: 'process_email',
        data: data
      };
    } else if (action?.includes('generate') || action?.includes('create')) {
      agentId = 'kb:rag';
      taskInput = {
        action: 'generate_content',
        requirement: data?.requirement || data?.description,
        context: data?.context
      };
    }

    // Create MCP task
    const { data: task, error: taskError } = await supabase
      .from('mcp_tasks')
      .insert({
        agent_id: agentId,
        status: 'queued',
        input: taskInput,
        created_by: user_id || '00000000-0000-0000-0000-000000000000', // System user if no user_id
      })
      .select()
      .single();

    if (taskError) {
      console.error('Error creating MCP task:', taskError);
      throw taskError;
    }

    console.log('Created MCP task:', task.task_id);

    // Log the webhook processing
    await supabase.from('ai_audit_logs').insert({
      user_id: user_id || null,
      action: 'lindy_webhook_received',
      entity_type: 'mcp_task',
      entity_id: task.task_id,
      new_values: {
        event_type,
        workflow_id,
        agent_id: agentId,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        task_id: task.task_id,
        agent_id: agentId,
        message: 'Webhook received and task queued',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing Lindy webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
