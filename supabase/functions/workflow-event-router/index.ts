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

// UUID validation helper
function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Format agent slug to display name
function formatAgentName(slug: string): string {
  return slug
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Resolve agent slug to UUID, auto-registering if needed
async function resolveAgentUuid(
  supabase: SupabaseClientAny,
  agentRef: string,
  sourcePlatform: string
): Promise<{ uuid: string; slug: string; isNew: boolean }> {
  // If already a UUID, return it
  if (isUuid(agentRef)) {
    return { uuid: agentRef, slug: agentRef, isNew: false };
  }

  const slug = agentRef.toLowerCase().replace(/[^a-z0-9_-]/g, '_');

  // Look up existing agent
  const { data: existing } = await supabase
    .from('instincts_agents')
    .select('id, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    return { uuid: existing.id, slug: existing.slug, isNew: false };
  }

  // Auto-register new agent
  const { data: newAgent, error } = await supabase
    .from('instincts_agents')
    .insert({
      slug,
      name: formatAgentName(slug),
      category: 'sales',
      is_active: true,
      capabilities: [sourcePlatform],
      config_schema: { auto_registered: true, source_platform: sourcePlatform }
    })
    .select('id, slug')
    .single();

  if (error) {
    console.error('Failed to auto-register agent:', error);
    throw new Error(`Cannot resolve agent: ${agentRef}`);
  }

  console.log(`Auto-registered new agent: ${slug} -> ${newAgent.id}`);
  return { uuid: newAgent.id, slug: newAgent.slug, isNew: true };
}

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

    // Route 4: Enrich talking point + HubSpot Sync (Signal Scout detections or entity updates)
    if (normalizedEvent.outcome_type === "trigger_detected" || (normalizedEvent.entity_type && normalizedEvent.entity_id)) {
      try {
        // Enrich the talking point using knowledge docs before syncing to HubSpot
        if (normalizedEvent.outcome_type === "trigger_detected" && normalizedEvent.deal_room_id) {
          const enrichedTalkingPoint = await enrichTalkingPoint(supabase, normalizedEvent);
          if (enrichedTalkingPoint) {
            normalizedEvent.metadata.enriched_talking_point = enrichedTalkingPoint;
            console.log("Enriched talking point:", enrichedTalkingPoint);
          }
        }
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
    // Signal Scout / Agent workflow events
    "signal.detected": "trigger_detected",
    signal_detected: "trigger_detected",
    trigger_detected: "trigger_detected",
    enrichment_complete: "enrichment_complete",
    "enrichment.complete": "enrichment_complete",
    draft_created: "draft_created",
    "draft.created": "draft_created",
    sequence_drafted: "draft_created",
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
): Promise<{ synced: boolean; reason?: string; hubspot_note_id?: string }> {
  const hubspotToken = Deno.env.get("HUBSPOT_ACCESS_TOKEN");
  if (!hubspotToken) {
    console.warn("HUBSPOT_ACCESS_TOKEN not configured, skipping sync");
    return { synced: false, reason: "HUBSPOT_ACCESS_TOKEN not configured" };
  }

  // Only sync trigger_detected events (Signal Scout signals)
  if (event.outcome_type !== "trigger_detected") {
    return { synced: false, reason: `Skipping non-signal event: ${event.outcome_type}` };
  }

  // Extract signal data from metadata
  const companyName = (event.metadata.company_name as string) ||
    (event.metadata.company as string) ||
    (event.raw_payload.company_name as string) ||
    (event.raw_payload.company as string);

  if (!companyName) {
    console.warn("No company name found in signal data, skipping HubSpot sync");
    return { synced: false, reason: "No company name in signal data" };
  }

  const signalType = (event.metadata.signal_type as string) || (event.metadata.trigger_type as string) || "Unknown Signal";
  const talkingPoint = (event.metadata.talking_point as string) || (event.metadata.talking_points as string) || "";
  const confidenceScore = (event.metadata.confidence_score as number) || (event.metadata.confidence as number) || 0;
  const additionalContext = (event.metadata.context as string) || (event.metadata.summary as string) || "";

  // Find the external_agent_activity record to update sync status
  let activityId: string | null = null;
  if (event.metadata.activity_id) {
    activityId = event.metadata.activity_id as string;
  } else if (event.entity_id) {
    activityId = event.entity_id;
  }

  try {
    // Step 1: Search for company in HubSpot
    const searchResponse = await fetch("https://api.hubapi.com/crm/v3/objects/companies/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hubspotToken}`,
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: "name",
            operator: "CONTAINS_TOKEN",
            value: companyName,
          }],
        }],
        properties: ["name", "domain", "hs_object_id"],
        limit: 1,
      }),
    });

    if (!searchResponse.ok) {
      const errText = await searchResponse.text();
      throw new Error(`HubSpot company search failed (${searchResponse.status}): ${errText}`);
    }

    const searchData = await searchResponse.json();
    const hubspotCompany = searchData.results?.[0];

    if (!hubspotCompany) {
      console.warn(`Company "${companyName}" not found in HubSpot`);
      if (activityId) {
        await supabase.from("external_agent_activities").update({
          synced_to_hubspot: false,
          hubspot_sync_error: `Company "${companyName}" not found in HubSpot`,
        }).eq("id", activityId);
      }
      return { synced: false, reason: `Company "${companyName}" not found in HubSpot` };
    }

    const hubspotCompanyId = hubspotCompany.id;
    console.log(`Found HubSpot company: ${hubspotCompany.properties?.name} (ID: ${hubspotCompanyId})`);

    // Step 2: Create a note on the company — prefer enriched talking point
    const now = new Date();
    const enrichedTalkingPoint = event.metadata.enriched_talking_point as string;
    
    let noteBody: string;
    if (enrichedTalkingPoint) {
      // Use the AI-enriched talking point from knowledge docs
      noteBody = [
        "🎯 Signal Scout — Enriched Outreach",
        "─────────────────────",
        `Company: ${companyName}`,
        `Signal Type: ${signalType}`,
        ``,
        enrichedTalkingPoint,
        ``,
        confidenceScore ? `Confidence: ${confidenceScore}%` : null,
        `Source: Signal Scout v3.0 + Knowledge Enrichment`,
        `Detected: ${now.toISOString()}`,
      ].filter(Boolean).join("\n");
    } else {
      // Fallback to basic note format
      noteBody = [
        "Signal Scout Detection",
        "─────────────────────",
        `Company: ${companyName}`,
        `Signal Type: ${signalType}`,
        talkingPoint ? `Talking Point: ${talkingPoint}` : null,
        confidenceScore ? `Confidence: ${confidenceScore}%` : null,
        `Source: Signal Scout v3.0`,
        `Detected: ${now.toISOString()}`,
        additionalContext ? `\n${additionalContext}` : null,
      ].filter(Boolean).join("\n");
    }

    const noteResponse = await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hubspotToken}`,
      },
      body: JSON.stringify({
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: now.toISOString(),
        },
        associations: [{
          to: { id: hubspotCompanyId },
          types: [{
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 190, // note-to-company association
          }],
        }],
      }),
    });

    if (!noteResponse.ok) {
      const errText = await noteResponse.text();
      throw new Error(`HubSpot note creation failed (${noteResponse.status}): ${errText}`);
    }

    const noteData = await noteResponse.json();
    const hubspotNoteId = noteData.id;
    console.log(`Created HubSpot note: ${hubspotNoteId}`);

    // Step 3: Update signal_scout_last_scanned on the company
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    try {
      const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/companies/${hubspotCompanyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hubspotToken}`,
        },
        body: JSON.stringify({
          properties: {
            signal_scout_last_scanned: todayStr,
          },
        }),
      });

      if (!updateResponse.ok) {
        const errText = await updateResponse.text();
        console.warn(`Failed to update signal_scout_last_scanned (non-fatal): ${errText}`);
      } else {
        console.log(`Updated signal_scout_last_scanned to ${todayStr} on company ${hubspotCompanyId}`);
      }
    } catch (propError) {
      console.warn("Failed to update signal_scout_last_scanned (non-fatal):", propError);
    }

    // Step 4: Update activity record with sync status
    if (activityId) {
      await supabase.from("external_agent_activities").update({
        synced_to_hubspot: true,
        hubspot_sync_id: hubspotNoteId,
        hubspot_sync_error: null,
      }).eq("id", activityId);
    }

    return { synced: true, hubspot_note_id: hubspotNoteId };

  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("HubSpot sync error:", errorMessage);

    if (activityId) {
      await supabase.from("external_agent_activities").update({
        synced_to_hubspot: false,
        hubspot_sync_error: errorMessage,
      }).eq("id", activityId);
    }

    return { synced: false, reason: errorMessage };
  }
}

// Enrich talking point using client knowledge docs + AI
async function enrichTalkingPoint(
  supabase: SupabaseClientAny,
  event: NormalizedEvent
): Promise<string | null> {
  if (!event.deal_room_id) return null;

  try {
    // Query knowledge docs directly by deal_room_id (no client_id needed)
    const { data: knowledgeDocs } = await supabase
      .from("client_knowledge_docs")
      .select("doc_type, title, content, structured_data, is_internal_only")
      .eq("deal_room_id", event.deal_room_id);

    if (!knowledgeDocs || knowledgeDocs.length === 0) {
      console.log("No knowledge docs found for deal room, skipping enrichment");
      return null;
    }

    // Separate docs by type (exclude pricing/internal-only from outreach)
    const knowledgeBase = knowledgeDocs.find((d: { doc_type: string; is_internal_only: boolean }) => d.doc_type === "knowledge_base" && !d.is_internal_only);
    const projectLocations = knowledgeDocs.find((d: { doc_type: string }) => d.doc_type === "project_locations");
    const guidelines = knowledgeDocs.find((d: { doc_type: string; is_internal_only: boolean }) => d.doc_type === "guidelines" && !d.is_internal_only);

    // Extract signal data
    const companyName = (event.metadata.company_name as string) || "Unknown";
    const signalType = (event.metadata.signal_type as string) || "Unknown";
    const signalTitle = (event.metadata.signal_title as string) || (event.metadata.talking_point as string) || "";
    const companyDomain = (event.metadata.company_domain as string) || "";

    // Intelligent project matching: filter by state or product type when possible
    let relevantProjects = "";
    if (projectLocations?.structured_data) {
      const projects = projectLocations.structured_data as Array<Record<string, unknown>>;
      
      // Try to infer state from signal data (company domain, title, etc.)
      const stateHints = extractStateHints(signalTitle, companyDomain, companyName);
      
      let matched: Array<Record<string, unknown>> = [];
      
      // 1. First try: same state
      if (stateHints.length > 0) {
        matched = projects.filter((p: Record<string, unknown>) => {
          const pState = ((p.state as string) || "").toUpperCase();
          return stateHints.some(s => s === pState);
        });
      }
      
      // 2. Fallback: match by product type keywords in signal
      if (matched.length === 0) {
        const productKeywords = ["virtual tour", "rendering", "animation", "photography", "staging", "drone", "floor plan"];
        const signalLower = signalTitle.toLowerCase();
        const matchedKeyword = productKeywords.find(k => signalLower.includes(k));
        if (matchedKeyword) {
          matched = projects.filter((p: Record<string, unknown>) => {
            const mix = ((p.product_mix as string) || "").toLowerCase();
            return mix.includes(matchedKeyword);
          });
        }
      }
      
      // 3. Final fallback: diverse sample across states
      if (matched.length === 0) {
        const seenStates = new Set<string>();
        matched = projects.filter((p: Record<string, unknown>) => {
          const st = (p.state as string) || "";
          if (seenStates.has(st)) return false;
          seenStates.add(st);
          return true;
        });
      }
      
      // Take top 3
      const topProjects = matched.slice(0, 3);
      relevantProjects = topProjects.map((p: Record<string, unknown>) =>
        `- ${p.property_name || "Project"} for ${p.client_name || "client"} in ${p.city || ""}${p.state ? ", " + p.state : ""} (${p.product_mix || "N/A"})`
      ).join("\n");
    }

    // Build the enrichment prompt
    const prompt = `You are writing a professional outreach talking point for a real estate prospect.

SIGNAL: ${companyName} just announced: ${signalTitle}
SIGNAL TYPE: ${signalType}

${knowledgeBase?.content ? `THE VIEW PRO SERVICES:\n${knowledgeBase.content.substring(0, 1500)}` : ""}

${relevantProjects ? `RELEVANT PROJECT EXAMPLES:\n${relevantProjects}` : ""}

${guidelines?.content ? `COMMUNICATION GUIDELINES:\n${guidelines.content}` : ""}

Write a 2-sentence professional talking point that:
1. References their specific news/signal
2. Connects it to a specific View Pro service or project example from the list above
3. Does NOT mention pricing
4. Sounds conversational, not generic — mention real project names and cities

Return ONLY the 2 sentences, no prefix/suffix.`;

    // Call Lovable AI (Gemini) for enrichment
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.warn("LOVABLE_API_KEY not configured, falling back to basic talking point");
      return null;
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      console.warn("AI enrichment call failed:", await aiResponse.text());
      return null;
    }

    const aiResult = await aiResponse.json();
    const enrichedText = aiResult.choices?.[0]?.message?.content;

    if (enrichedText && typeof enrichedText === "string" && enrichedText.length > 20) {
      console.log("Successfully enriched talking point via AI");
      return enrichedText.trim();
    }

    return null;
  } catch (error) {
    console.error("Enrichment error (non-fatal):", error);
    return null;
  }
}

// Extract US state abbreviations from text hints
function extractStateHints(signalTitle: string, domain: string, companyName: string): string[] {
  const usStates = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
    "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
    "VA","WA","WV","WI","WY","DC"
  ];
  
  const cityToState: Record<string, string> = {
    "houston": "TX", "dallas": "TX", "austin": "TX", "san antonio": "TX", "fort worth": "TX",
    "miami": "FL", "orlando": "FL", "tampa": "FL", "jacksonville": "FL", "clearwater": "FL",
    "atlanta": "GA", "charlotte": "NC", "raleigh": "NC", "phoenix": "AZ", "scottsdale": "AZ",
    "denver": "CO", "nashville": "TN", "chicago": "IL", "philadelphia": "PA", "seattle": "WA",
    "los angeles": "CA", "san diego": "CA", "san francisco": "CA", "new york": "NY",
    "las vegas": "NV", "minneapolis": "MN", "st. paul": "MN", "washington": "DC",
  };
  
  const combined = `${signalTitle} ${companyName}`.toLowerCase();
  const hints: string[] = [];
  
  // Check for city names
  for (const [city, state] of Object.entries(cityToState)) {
    if (combined.includes(city)) {
      hints.push(state);
    }
  }
  
  // Check for state abbreviations (word boundary)
  const words = combined.toUpperCase().split(/\W+/);
  for (const word of words) {
    if (usStates.includes(word) && !hints.includes(word)) {
      hints.push(word);
    }
  }
  
  return [...new Set(hints)];
}

async function createContributionEvent(
  supabase: SupabaseClientAny,
  event: NormalizedEvent
): Promise<{ event_id: string }> {
  // Resolve agent slug to UUID (auto-registers if new agent)
  const agentResolution = await resolveAgentUuid(
    supabase,
    event.agent_id || 'unknown_agent',
    event.source_platform
  );

  // Map outcome to credit values
  const creditMap: Record<string, { compute: number; action: number; outcome: number }> = {
    outreach: { compute: 1, action: 3, outcome: 0 },
    reply_received: { compute: 1, action: 5, outcome: 2 },
    meeting_set: { compute: 2, action: 10, outcome: 15 },
    meeting_confirmed: { compute: 1, action: 5, outcome: 20 },
    deal_created: { compute: 2, action: 15, outcome: 25 },
    deal_closed: { compute: 3, action: 20, outcome: 100 },
    // Signal Scout / Agent workflow credit values
    trigger_detected: { compute: 1, action: 2, outcome: 0 },
    enrichment_complete: { compute: 2, action: 3, outcome: 0 },
    draft_created: { compute: 1, action: 2, outcome: 0 },
  };

  const credits = creditMap[event.outcome_type || ""] || { compute: 1, action: 1, outcome: 0 };

  const { data, error } = await supabase
    .from("contribution_events")
    .insert({
      actor_type: "agent",
      actor_id: agentResolution.uuid,  // UUID now, not string slug
      event_type: "agent_executed",     // Valid enum value
      event_description: `${event.source_platform} workflow: ${event.outcome_type}`,
      deal_room_id: event.deal_room_id,
      compute_credits: credits.compute,
      action_credits: credits.action,
      outcome_credits: credits.outcome,
      payload: {
        source_platform: event.source_platform,
        agent_slug: agentResolution.slug,  // Preserve original slug for display
        auto_registered: agentResolution.isNew,
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
