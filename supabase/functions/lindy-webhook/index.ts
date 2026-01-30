import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lindy-signature',
};

interface LindyPayload {
  event_type?: string;
  workflow_id?: string;
  user_id?: string;
  action?: string;
  data?: Record<string, unknown>;
  lindy_integration_id?: string;
  deal_room_id?: string;
  lindy_agent_id?: string;
  outcome_type?: string;
  value_amount?: number;
  entity_type?: string;
  entity_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: LindyPayload = await req.json();
    console.log('Received Lindy.ai webhook:', payload);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      event_type, 
      workflow_id, 
      user_id, 
      action, 
      data,
      lindy_integration_id,
      deal_room_id,
      lindy_agent_id,
      outcome_type,
      value_amount,
      entity_type,
      entity_id,
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

    // Determine outcome type from action, event_type, or subscriptionType if not provided
    const eventTypeForMapping = event_type || (payload as Record<string, unknown>).subscriptionType as string;
    const resolvedOutcomeType = outcome_type || mapActionToOutcome(action) || mapActionToOutcome(eventTypeForMapping);
    
    console.log('Resolved outcome type:', resolvedOutcomeType, 'from action:', action, 'event_type:', eventTypeForMapping);

    // Handle Signal Scout / trigger detection events - store in discovered_opportunities
    if (resolvedOutcomeType === 'trigger_detected' && deal_room_id) {
      try {
        const signalData = data || (payload as Record<string, unknown>).customData as Record<string, unknown> || {};
        
        const { data: opportunity, error: oppError } = await supabase
          .from('discovered_opportunities')
          .insert({
            deal_room_id,
            headline: signalData.signal_title as string || signalData.title as string || `Signal detected: ${signalData.company_name || 'Unknown'}`,
            source_type: 'lindy_signal_scout',
            source_url: signalData.source_url as string || null,
            relevance_score: typeof signalData.confidence === 'number' ? signalData.confidence : 50,
            opportunity_type: signalData.priority as string || 'medium',
            entities_mentioned: {
              company_name: signalData.company_name,
              contact_email: signalData.contact_email,
              talking_point: signalData.talking_point,
              signal_type: signalData.event_type || signalData.signal_type,
            },
            raw_content: JSON.stringify(signalData),
            status: 'new',
          })
          .select()
          .single();

        if (oppError) {
          console.error('Error storing discovered opportunity:', oppError);
        } else {
          console.log('Created discovered opportunity:', opportunity?.id);
        }
      } catch (oppErr) {
        console.error('Error in signal processing:', oppErr);
      }
    }

    // Route to workflow-event-router for unified processing
    if (deal_room_id || lindy_agent_id || resolvedOutcomeType) {
      try {
        const routerResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/workflow-event-router`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'x-source-platform': 'lindy.ai',
            },
            body: JSON.stringify({
              event_type: eventTypeForMapping,
              workflow_id,
              user_id,
              action,
              data,
              lindy_integration_id,
              deal_room_id,
              agent_id: lindy_agent_id,
              lindy_agent_id,
              outcome_type: resolvedOutcomeType,
              value_amount,
              entity_type: entity_type || data?.entity_type,
              entity_id: entity_id || data?.entity_id,
              source: 'lindy.ai',
            }),
          }
        );

        const routerResult = await routerResponse.json();
        console.log('Workflow router result:', routerResult);

        // Return combined result
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Webhook processed through unified router',
            outcome_type: resolvedOutcomeType,
            routing_results: routerResult.routing_results,
            event_id: routerResult.event_id,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (routerError) {
        console.error('Router error (continuing with legacy flow):', routerError);
      }
    }

    // Legacy MCP task creation for backwards compatibility
    let agentId = 'general:assistant';
    let taskInput: Record<string, unknown> = { action, data };

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
    } else if (action?.includes('meeting') || resolvedOutcomeType === 'meeting_set') {
      agentId = 'deals:meeting';
      taskInput = {
        action: 'process_meeting',
        deal_room_id,
        entity_type,
        entity_id,
        data
      };
    }

    const { data: task, error: taskError } = await supabase
      .from('mcp_tasks')
      .insert({
        agent_id: agentId,
        status: 'queued',
        input: taskInput,
        created_by: user_id || '00000000-0000-0000-0000-000000000000',
      })
      .select()
      .single();

    if (taskError) {
      console.error('Error creating MCP task:', taskError);
      throw taskError;
    }

    console.log('Created MCP task:', task.task_id);

    await supabase.from('ai_audit_logs').insert({
      user_id: user_id || null,
      action: 'lindy_webhook_received',
      entity_type: 'mcp_task',
      entity_id: task.task_id,
      new_values: {
        event_type,
        workflow_id,
        agent_id: agentId,
        deal_room_id,
        outcome_type: resolvedOutcomeType,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        task_id: task.task_id,
        agent_id: agentId,
        outcome_type: resolvedOutcomeType,
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

function mapActionToOutcome(action?: string): string | undefined {
  if (!action) return undefined;
  
  const actionLower = action.toLowerCase();
  const outcomeMap: Record<string, string> = {
    'email_sent': 'outreach',
    'email_replied': 'reply_received',
    'meeting_booked': 'meeting_set',
    'meeting_scheduled': 'meeting_set',
    'meeting_confirmed': 'meeting_confirmed',
    'contact_created': 'lead_created',
    'deal_created': 'deal_created',
    'deal_closed': 'deal_closed',
    'deal_won': 'deal_closed',
    'task_completed': 'task_completed',
    // Signal Scout / Agent workflow events
    'signal.detected': 'trigger_detected',
    'signal_detected': 'trigger_detected',
    'trigger_detected': 'trigger_detected',
    'enrichment_complete': 'enrichment_complete',
    'enrichment.complete': 'enrichment_complete',
    'draft_created': 'draft_created',
    'draft.created': 'draft_created',
    'sequence_drafted': 'draft_created',
  };
  
  // Direct match first
  if (outcomeMap[actionLower]) {
    return outcomeMap[actionLower];
  }
  
  for (const [key, value] of Object.entries(outcomeMap)) {
    if (actionLower.includes(key.replace('_', '')) || actionLower.includes(key) || actionLower.includes(key.replace('.', ''))) {
      return value;
    }
  }
  
  return undefined;
}
