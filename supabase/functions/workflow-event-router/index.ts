import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key, x-webhook-signature",
};

interface NormalizedEvent {
  event_type: string;
  source_platform: string;
  deal_room_id?: string;
  agent_id?: string;
  workflow_id?: string;
  entity_type?: string;
  entity_id?: string;
  outcome_type?: string;
  value_amount?: number;
  metadata: Record<string, unknown>;
  attribution_chain: Array<{
    type: string;
    id: string;
    timestamp: string;
  }>;
  raw_payload: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientAny = SupabaseClient<any, any, any>;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    const sourcePlatform = req.headers.get("x-source-platform") || payload.source || "unknown";

    console.log(`Workflow event received from: ${sourcePlatform}`);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    // Normalize the event based on source platform
    const normalizedEvent = normalizeEvent(sourcePlatform, payload);

    // Store the raw event for audit
    const { data: eventLog, error: logError } = await supabase
      .from("ai_audit_logs")
      .insert({
        action: "workflow_event_received",
        entity_type: "workflow_event",
        entity_id: normalizedEvent.workflow_id || normalizedEvent.agent_id,
        new_values: {
          source_platform: normalizedEvent.source_platform,
          event_type: normalizedEvent.event_type,
          deal_room_id: normalizedEvent.deal_room_id,
          outcome_type: normalizedEvent.outcome_type,
          value_amount: normalizedEvent.value_amount,
        },
      })
      .select()
      .single();

    if (logError) {
      console.error("Error logging event:", logError);
    }

    const routingResults: Array<{ handler: string; success: boolean; result?: unknown; error?: string }> = [];

    // Route 1: Attribution & Credits
    if (normalizedEvent.outcome_type && normalizedEvent.deal_room_id) {
      try {
        const attributionResult = await handleAttribution(supabase, normalizedEvent);
        routingResults.push({ handler: "attribution", success: true, result: attributionResult });
      } catch (error) {
        console.error("Attribution handler error:", error);
        routingResults.push({ handler: "attribution", success: false, error: (error as Error).message });
      }
    }

    // Route 2: Settlement Contracts
    if (normalizedEvent.deal_room_id && normalizedEvent.value_amount && normalizedEvent.value_amount > 0) {
      try {
        const settlementResult = await triggerSettlements(supabase, normalizedEvent);
        routingResults.push({ handler: "settlement", success: true, result: settlementResult });
      } catch (error) {
        console.error("Settlement handler error:", error);
        routingResults.push({ handler: "settlement", success: false, error: (error as Error).message });
      }
    }

    // Route 3: Credit Metering
    if (normalizedEvent.deal_room_id && normalizedEvent.source_platform !== "unknown") {
      try {
        const meteringResult = await recordCreditUsage(supabase, normalizedEvent);
        routingResults.push({ handler: "credit_metering", success: true, result: meteringResult });
      } catch (error) {
        console.error("Credit metering error:", error);
        routingResults.push({ handler: "credit_metering", success: false, error: (error as Error).message });
      }
    }

    // Route 4: HubSpot Sync (if configured)
    if (normalizedEvent.entity_type && normalizedEvent.entity_id) {
      try {
        const hubspotResult = await syncToHubSpot(supabase, normalizedEvent);
        routingResults.push({ handler: "hubspot_sync", success: true, result: hubspotResult });
      } catch (error) {
        console.error("HubSpot sync error:", error);
        routingResults.push({ handler: "hubspot_sync", success: false, error: (error as Error).message });
      }
    }

    // Route 5: Contribution Events
    if (normalizedEvent.agent_id && normalizedEvent.outcome_type) {
      try {
        const contributionResult = await createContributionEvent(supabase, normalizedEvent);
        routingResults.push({ handler: "contribution", success: true, result: contributionResult });
      } catch (error) {
        console.error("Contribution handler error:", error);
        routingResults.push({ handler: "contribution", success: false, error: (error as Error).message });
      }
    }

    console.log("Routing complete:", routingResults);

    return new Response(
      JSON.stringify({
        success: true,
        event_id: eventLog?.id,
        source_platform: normalizedEvent.source_platform,
        event_type: normalizedEvent.event_type,
        routing_results: routingResults,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Workflow event router error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function normalizeEvent(source: string, payload: Record<string, unknown>): NormalizedEvent {
  const baseEvent: NormalizedEvent = {
    event_type: "unknown",
    source_platform: source,
    metadata: {},
    attribution_chain: [],
    raw_payload: payload,
  };

  switch (source.toLowerCase()) {
    case "lindy":
    case "lindy.ai":
      return {
        ...baseEvent,
        event_type: payload.event_type as string || payload.action as string || "lindy_event",
        source_platform: "lindy.ai",
        deal_room_id: payload.deal_room_id as string,
        agent_id: payload.lindy_agent_id as string || payload.agent_id as string,
        workflow_id: payload.workflow_id as string,
        entity_type: payload.entity_type as string || (payload.data as Record<string, unknown>)?.entity_type as string,
        entity_id: payload.entity_id as string || (payload.data as Record<string, unknown>)?.entity_id as string,
        outcome_type: mapLindyOutcome(payload.action as string || payload.event_type as string),
        value_amount: payload.value_amount as number || (payload.data as Record<string, unknown>)?.amount as number,
        metadata: {
          lindy_integration_id: payload.lindy_integration_id,
          user_id: payload.user_id,
          ...(payload.data as Record<string, unknown> || {}),
        },
        attribution_chain: [
          {
            type: "workflow",
            id: payload.workflow_id as string || "unknown",
            timestamp: new Date().toISOString(),
          },
        ],
      };

    case "n8n":
      return {
        ...baseEvent,
        event_type: payload.event as string || "n8n_event",
        source_platform: "n8n",
        deal_room_id: payload.deal_room_id as string || payload.dealRoomId as string,
        agent_id: payload.agent_id as string,
        workflow_id: payload.workflowId as string,
        entity_type: payload.entityType as string,
        entity_id: payload.entityId as string,
        outcome_type: payload.outcomeType as string,
        value_amount: payload.amount as number || payload.value as number,
        metadata: payload.metadata as Record<string, unknown> || {},
        attribution_chain: payload.attributionChain as NormalizedEvent["attribution_chain"] || [],
      };

    case "hubspot":
      return {
        ...baseEvent,
        event_type: payload.subscriptionType as string || "hubspot_event",
        source_platform: "hubspot",
        deal_room_id: findDealRoomFromHubSpot(payload),
        entity_type: payload.objectType as string,
        entity_id: String(payload.objectId),
        outcome_type: mapHubSpotOutcome(payload),
        value_amount: extractHubSpotValue(payload),
        metadata: {
          portal_id: payload.portalId,
          change_source: payload.changeSource,
          property_name: payload.propertyName,
          property_value: payload.propertyValue,
        },
        attribution_chain: [],
      };

    default:
      return {
        ...baseEvent,
        event_type: payload.event_type as string || payload.type as string || "unknown",
        deal_room_id: payload.deal_room_id as string,
        agent_id: payload.agent_id as string,
        workflow_id: payload.workflow_id as string,
        entity_type: payload.entity_type as string,
        entity_id: payload.entity_id as string,
        outcome_type: payload.outcome_type as string,
        value_amount: payload.value_amount as number || payload.amount as number,
        metadata: payload.metadata as Record<string, unknown> || {},
        attribution_chain: payload.attribution_chain as NormalizedEvent["attribution_chain"] || [],
      };
  }
}

function mapLindyOutcome(action: string): string | undefined {
  const outcomeMap: Record<string, string> = {
    email_sent: "outreach",
    email_replied: "reply_received",
    meeting_booked: "meeting_set",
    meeting_confirmed: "meeting_confirmed",
    contact_created: "lead_created",
    deal_created: "deal_created",
    deal_closed: "deal_closed",
    task_completed: "task_completed",
  };
  return outcomeMap[action?.toLowerCase()] || action;
}

function mapHubSpotOutcome(payload: Record<string, unknown>): string | undefined {
  if (payload.objectType === "MEETING" && payload.subscriptionType === "meeting.creation") {
    return "meeting_set";
  }
  if (payload.objectType === "DEAL") {
    if (payload.propertyName === "dealstage" && String(payload.propertyValue).includes("closedwon")) {
      return "deal_closed";
    }
  }
  return undefined;
}

function findDealRoomFromHubSpot(_payload: Record<string, unknown>): string | undefined {
  // TODO: Implement lookup from HubSpot metadata or custom properties
  return undefined;
}

function extractHubSpotValue(payload: Record<string, unknown>): number | undefined {
  if (payload.objectType === "DEAL" && payload.propertyName === "amount") {
    return Number(payload.propertyValue) || undefined;
  }
  return undefined;
}

interface AttributionRule {
  id: string;
  base_amount?: number;
  percentage_of_deal?: number;
  agent_id?: string;
}

async function handleAttribution(
  supabase: SupabaseClientAny,
  event: NormalizedEvent
): Promise<{ rules_matched: number; credits_assigned: number }> {
  if (!event.deal_room_id || !event.outcome_type) {
    return { rules_matched: 0, credits_assigned: 0 };
  }

  // Find applicable attribution rules
  const { data: rules, error } = await supabase
    .from("agent_attribution_rules")
    .select("*")
    .eq("deal_room_id", event.deal_room_id)
    .eq("outcome_type", event.outcome_type)
    .eq("is_active", true);

  if (error) throw error;

  let creditsAssigned = 0;

  for (const rule of (rules || []) as AttributionRule[]) {
    const baseAmount = rule.base_amount || 0;
    const percentageAmount = event.value_amount && rule.percentage_of_deal
      ? (event.value_amount * rule.percentage_of_deal) / 100
      : 0;

    const totalCredits = baseAmount + percentageAmount;
    creditsAssigned += totalCredits;

    // Log attribution
    await supabase.from("ai_audit_logs").insert({
      action: "attribution_applied",
      entity_type: "agent_attribution_rule",
      entity_id: rule.id,
      new_values: {
        outcome_type: event.outcome_type,
        base_amount: baseAmount,
        percentage_amount: percentageAmount,
        total_credits: totalCredits,
        agent_id: rule.agent_id,
      },
    });
  }

  return { rules_matched: rules?.length || 0, credits_assigned: creditsAssigned };
}

interface SettlementContract {
  id: string;
  trigger_type: string;
  revenue_source_type?: string;
}

async function triggerSettlements(
  supabase: SupabaseClientAny,
  event: NormalizedEvent
): Promise<{ contracts_triggered: number; pending_confirmations: number }> {
  if (!event.deal_room_id) {
    return { contracts_triggered: 0, pending_confirmations: 0 };
  }

  // Find applicable settlement contracts, ordered by priority
  const { data: contracts, error } = await supabase
    .from("settlement_contracts")
    .select("*")
    .eq("deal_room_id", event.deal_room_id)
    .eq("is_active", true)
    .order("payout_priority", { ascending: true });

  if (error) throw error;

  let contractsTriggered = 0;
  let pendingConfirmations = 0;

  for (const contract of (contracts || []) as SettlementContract[]) {
    // Check if this contract's trigger matches the event
    if (shouldTriggerContract(contract, event)) {
      // Call settlement-execute
      const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/settlement-execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          contract_id: contract.id,
          trigger_event: event.outcome_type || event.event_type,
          trigger_data: {
            amount: event.value_amount,
            entity_type: event.entity_type,
            entity_id: event.entity_id,
            source_platform: event.source_platform,
          },
          attribution_chain: event.attribution_chain,
        }),
      });

      const result = await response.json();

      if (result.success) {
        contractsTriggered++;
        if (result.confirmation_required) {
          pendingConfirmations++;
        }
      }
    }
  }

  return { contracts_triggered: contractsTriggered, pending_confirmations: pendingConfirmations };
}

function shouldTriggerContract(
  contract: SettlementContract,
  event: NormalizedEvent
): boolean {
  const triggerType = contract.trigger_type;
  const revenueSource = contract.revenue_source_type;

  // Check if revenue source matches
  if (revenueSource && event.outcome_type !== revenueSource) {
    return false;
  }

  // Check trigger type compatibility
  switch (triggerType) {
    case "meeting_set":
      return event.outcome_type === "meeting_set" || event.outcome_type === "meeting_confirmed";
    case "deal_closed":
      return event.outcome_type === "deal_closed";
    case "revenue":
      return event.value_amount !== undefined && event.value_amount > 0;
    default:
      return event.event_type === triggerType;
  }
}

interface CreditMeter {
  id: string;
  cost_per_credit: number;
  markup_percentage?: number;
}

async function recordCreditUsage(
  supabase: SupabaseClientAny,
  event: NormalizedEvent
): Promise<{ meter_id: string | null; credits_logged: number }> {
  if (!event.deal_room_id) {
    return { meter_id: null, credits_logged: 0 };
  }

  // Find or create meter for this platform/deal room
  const { data: meter, error: meterError } = await supabase
    .from("platform_credit_meters")
    .select("*")
    .eq("deal_room_id", event.deal_room_id)
    .eq("platform_name", event.source_platform)
    .maybeSingle();

  if (meterError) throw meterError;

  if (!meter) {
    // No meter configured for this platform - log but don't fail
    console.log(`No credit meter found for platform ${event.source_platform} in deal room ${event.deal_room_id}`);
    return { meter_id: null, credits_logged: 0 };
  }

  const typedMeter = meter as CreditMeter;

  // Estimate credit usage (1 credit per API call by default)
  const creditsUsed = 1;

  // Log the usage
  await supabase.from("platform_credit_usage").insert({
    meter_id: typedMeter.id,
    deal_room_id: event.deal_room_id,
    agent_id: event.agent_id,
    workflow_id: event.workflow_id,
    action_type: event.event_type,
    credits_used: creditsUsed,
    raw_cost: creditsUsed * typedMeter.cost_per_credit,
    billed_cost: creditsUsed * typedMeter.cost_per_credit * (1 + (typedMeter.markup_percentage || 0) / 100),
    external_transaction_id: event.metadata.transaction_id as string || null,
    metadata: {
      outcome_type: event.outcome_type,
      value_amount: event.value_amount,
    },
  });

  return { meter_id: typedMeter.id, credits_logged: creditsUsed };
}

async function syncToHubSpot(
  supabase: SupabaseClientAny,
  event: NormalizedEvent
): Promise<{ synced: boolean; reason?: string }> {
  // Check if HubSpot sync is configured for this deal room
  if (!event.deal_room_id) {
    return { synced: false, reason: "No deal room ID" };
  }

  const { data: crmConfig } = await supabase
    .from("crm_connections")
    .select("*")
    .eq("entity_id", event.deal_room_id)
    .eq("provider", "hubspot")
    .eq("is_active", true)
    .maybeSingle();

  if (!crmConfig) {
    return { synced: false, reason: "HubSpot not configured for this deal room" };
  }

  // TODO: Implement actual HubSpot API sync
  // For now, just log the intent
  console.log(`Would sync to HubSpot: ${event.entity_type}/${event.entity_id}`);

  return { synced: true, reason: "Queued for sync" };
}

async function createContributionEvent(
  supabase: SupabaseClientAny,
  event: NormalizedEvent
): Promise<{ event_id: string }> {
  // Map outcome to credit values
  const creditMap: Record<string, { compute: number; action: number; outcome: number }> = {
    outreach: { compute: 1, action: 3, outcome: 0 },
    reply_received: { compute: 1, action: 5, outcome: 2 },
    meeting_set: { compute: 2, action: 10, outcome: 15 },
    meeting_confirmed: { compute: 1, action: 5, outcome: 20 },
    deal_created: { compute: 2, action: 15, outcome: 25 },
    deal_closed: { compute: 3, action: 20, outcome: 100 },
  };

  const credits = creditMap[event.outcome_type || ""] || { compute: 1, action: 1, outcome: 0 };

  const { data, error } = await supabase
    .from("contribution_events")
    .insert({
      actor_type: "agent",
      actor_id: event.agent_id,
      event_type: "agent_workflow_completed",
      event_description: `${event.source_platform} workflow: ${event.outcome_type}`,
      deal_room_id: event.deal_room_id,
      compute_credits: credits.compute,
      action_credits: credits.action,
      outcome_credits: credits.outcome,
      payload: {
        source_platform: event.source_platform,
        workflow_id: event.workflow_id,
        entity_type: event.entity_type,
        entity_id: event.entity_id,
        value_amount: event.value_amount,
      },
      attribution_tags: [event.source_platform, event.outcome_type || "unknown"],
    })
    .select()
    .single();

  if (error) throw error;

  return { event_id: data.id };
}
