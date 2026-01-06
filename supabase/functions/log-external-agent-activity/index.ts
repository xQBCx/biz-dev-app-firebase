import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface ExternalAgentActivity {
  agent_slug: string;
  platform: 'lindy_ai' | 'airia' | 'zapier' | 'make' | 'n8n' | 'custom';
  activity_type: string;
  outcome_type?: 'meeting_set' | 'reply_received' | 'trigger_detected' | 'enrichment_complete' | 'draft_created' | 'other';
  target?: {
    contact_email?: string;
    company_domain?: string;
    deal_id?: string;
  };
  metadata?: Record<string, unknown>;
  deal_room_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key for external agents
    const apiKey = req.headers.get('x-api-key');
    // In production, validate against stored API keys
    // For now, we accept any key but log for auditing
    console.log('External agent activity received with key:', apiKey ? 'present' : 'missing');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: ExternalAgentActivity = await req.json();
    const { agent_slug, platform, activity_type, outcome_type, target, metadata, deal_room_id } = body;

    console.log(`Logging external agent activity: ${agent_slug} on ${platform} - ${activity_type}`);

    // Look up the agent
    const { data: agent } = await supabase
      .from('instincts_agents')
      .select('id, owner_user_id')
      .eq('slug', agent_slug)
      .maybeSingle();

    // Look up target contact if provided
    let targetContactId = null;
    let targetCompanyId = null;

    if (target?.contact_email) {
      const { data: contact } = await supabase
        .from('crm_contacts')
        .select('id, company_id')
        .eq('email', target.contact_email)
        .maybeSingle();
      
      if (contact) {
        targetContactId = contact.id;
        targetCompanyId = contact.company_id;
      }
    }

    if (!targetCompanyId && target?.company_domain) {
      const { data: company } = await supabase
        .from('crm_companies')
        .select('id')
        .eq('domain', target.company_domain)
        .maybeSingle();
      
      if (company) {
        targetCompanyId = company.id;
      }
    }

    // Calculate outcome value based on attribution rules
    let outcomeValue = null;
    if (deal_room_id && outcome_type) {
      const { data: rule } = await supabase
        .from('agent_attribution_rules')
        .select('*')
        .eq('deal_room_id', deal_room_id)
        .eq('outcome_type', outcome_type)
        .eq('is_active', true)
        .maybeSingle();

      if (rule) {
        outcomeValue = rule.base_amount || 0;
      } else if (outcome_type === 'meeting_set') {
        outcomeValue = 250; // Default meeting fee
      }
    }

    // Log the activity
    const { data: activity, error: activityError } = await supabase
      .from('external_agent_activities')
      .insert({
        agent_id: agent?.id,
        agent_slug,
        external_platform: platform,
        activity_type,
        activity_data: metadata || {},
        target_contact_id: targetContactId,
        target_company_id: targetCompanyId,
        target_deal_id: target?.deal_id,
        outcome_type: outcome_type || null,
        outcome_value: outcomeValue,
        attributed_to_user_id: agent?.owner_user_id,
        deal_room_id: deal_room_id || null,
      })
      .select()
      .single();

    if (activityError) {
      console.error('Error logging activity:', activityError);
      return new Response(JSON.stringify({ error: activityError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Also log as a CRM activity if we have a contact
    if (targetContactId) {
      await supabase
        .from('crm_activities')
        .insert({
          contact_id: targetContactId,
          company_id: targetCompanyId,
          activity_type: 'agent_action',
          subject: `${agent_slug}: ${activity_type}`,
          description: `Agent "${agent_slug}" on ${platform} performed: ${activity_type}${outcome_type ? ` (Outcome: ${outcome_type})` : ''}`,
          activity_date: new Date().toISOString(),
          status: 'completed',
          metadata: {
            external_agent_activity_id: activity.id,
            platform,
            outcome_type,
            outcome_value: outcomeValue,
          }
        });
    }

    // If there's an outcome value, create a contribution event
    if (outcomeValue && deal_room_id && agent?.owner_user_id) {
      await supabase
        .from('contribution_events')
        .insert({
          user_id: agent.owner_user_id,
          actor_type: 'agent',
          event_type: 'agent_attribution',
          description: `Agent ${agent_slug} - ${outcome_type}`,
          value_category: 'action',
          action_credits: outcomeValue,
          metadata_json: {
            agent_slug,
            platform,
            outcome_type,
            deal_room_id,
            activity_id: activity.id,
          }
        });
    }

    console.log(`Activity logged successfully: ${activity.id}`);

    return new Response(JSON.stringify({
      success: true,
      activity_id: activity.id,
      outcome_value: outcomeValue,
      attribution_applied: !!outcomeValue,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Log external agent activity error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
