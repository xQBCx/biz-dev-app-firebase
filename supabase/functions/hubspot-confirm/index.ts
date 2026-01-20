import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * HubSpot Confirmation Webhook
 * 
 * Handles incoming webhooks from HubSpot to confirm outcomes
 * and trigger settlement contract payouts.
 * 
 * Webhook Target URL: https://eoskcsbytaurtqrnuraw.supabase.co/functions/v1/hubspot-confirm
 */

interface HubSpotWebhookEvent {
  subscriptionType: string;
  objectId: number;
  propertyName?: string;
  propertyValue?: string;
  occurredAt: number;
  eventId: number;
  portalId: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientAny = any;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const events: HubSpotWebhookEvent[] = await req.json();
    
    console.log(`[hubspot-confirm] Received ${events.length} webhook events`);

    const results: Array<{ eventId: number; processed: boolean; message: string }> = [];

    for (const event of events) {
      // Log event to audit table first
      await logWebhookEvent(supabase, event);

      try {
        const result = await processHubSpotEvent(supabase, event);
        
        // Update audit log with result
        await updateWebhookEventStatus(supabase, event.eventId, true, result);
        
        results.push({
          eventId: event.eventId,
          processed: result.processed,
          message: result.message
        });
      } catch (err) {
        console.error(`[hubspot-confirm] Error processing event ${event.eventId}:`, err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        
        // Update audit log with error
        await updateWebhookEventStatus(supabase, event.eventId, false, null, errorMessage);
        
        results.push({
          eventId: event.eventId,
          processed: false,
          message: errorMessage
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[hubspot-confirm] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function logWebhookEvent(supabase: SupabaseClientAny, event: HubSpotWebhookEvent): Promise<void> {
  await supabase
    .from("hubspot_webhook_events")
    .insert({
      event_id: event.eventId,
      subscription_type: event.subscriptionType,
      object_id: event.objectId,
      portal_id: event.portalId,
      property_name: event.propertyName || null,
      property_value: event.propertyValue || null,
      occurred_at: new Date(event.occurredAt).toISOString(),
      processed: false
    });
}

async function updateWebhookEventStatus(
  supabase: SupabaseClientAny,
  eventId: number,
  processed: boolean,
  result?: { processed: boolean; message: string } | null,
  errorMessage?: string
): Promise<void> {
  await supabase
    .from("hubspot_webhook_events")
    .update({
      processed,
      processed_at: new Date().toISOString(),
      processing_result: result || null,
      error_message: errorMessage || null
    })
    .eq("event_id", eventId);
}

async function processHubSpotEvent(
  supabase: SupabaseClientAny,
  event: HubSpotWebhookEvent
): Promise<{ processed: boolean; message: string }> {
  
  const { subscriptionType, objectId, propertyName, propertyValue } = event;

  console.log(`[hubspot-confirm] Processing: ${subscriptionType}, objectId: ${objectId}, property: ${propertyName}=${propertyValue}`);

  // Handle contact creation (lead attribution)
  if (subscriptionType === "contact.creation") {
    return await handleContactCreation(supabase, objectId, event.portalId);
  }

  // Handle deal creation
  if (subscriptionType === "deal.creation") {
    return await handleDealCreation(supabase, objectId, event.portalId);
  }

  // Handle deal stage changes (closed-won triggers commission payout)
  if (subscriptionType === "deal.propertyChange" && propertyName === "dealstage") {
    return await handleDealStageChange(supabase, objectId, propertyValue || "");
  }

  // Handle meeting creation
  if (subscriptionType === "meeting.creation") {
    return await handleMeetingCreation(supabase, objectId, event.portalId);
  }

  // Handle meeting outcome (completed = $250 fee trigger)
  if (subscriptionType === "meeting.propertyChange" && propertyName === "hs_meeting_outcome") {
    return await handleMeetingConfirmation(supabase, objectId, propertyValue || "completed");
  }

  // Handle company creation (for attribution tracking)
  if (subscriptionType === "company.creation") {
    return await handleCompanyCreation(supabase, objectId, event.portalId);
  }

  // Handle contact/company association (for attribution)
  if (subscriptionType.includes("association")) {
    return await handleAssociationEvent(supabase, event);
  }

  return { processed: false, message: `Unhandled event type: ${subscriptionType}` };
}

async function handleContactCreation(
  supabase: SupabaseClientAny,
  contactId: number,
  portalId: number
): Promise<{ processed: boolean; message: string }> {
  console.log(`[hubspot-confirm] New contact created: ${contactId}`);
  
  // Log for attribution tracking
  await supabase
    .from("ai_cross_module_links")
    .insert({
      source_module: "hubspot",
      source_entity_id: contactId.toString(),
      target_module: "crm",
      target_entity_id: contactId.toString(),
      link_type: "contact_created",
      discovered_by: "hubspot_webhook",
      metadata: { portal_id: portalId, event_type: "contact.creation" }
    });

  return { processed: true, message: `Contact ${contactId} logged for attribution` };
}

async function handleDealCreation(
  supabase: SupabaseClientAny,
  dealId: number,
  portalId: number
): Promise<{ processed: boolean; message: string }> {
  console.log(`[hubspot-confirm] New deal created: ${dealId}`);

  // Create a pending confirmation record for this deal
  const { data: contracts } = await supabase
    .from("settlement_contracts")
    .select("id")
    .eq("external_confirmation_source", "hubspot")
    .eq("external_confirmation_required", true)
    .eq("is_active", true);

  if (contracts && contracts.length > 0) {
    for (const contract of contracts) {
      await supabase
        .from("settlement_pending_confirmations")
        .insert({
          contract_id: contract.id,
          confirmation_source: "hubspot",
          trigger_event: { hubspot_deal_id: dealId, portal_id: portalId },
          status: "pending"
        });
    }
  }

  return { processed: true, message: `Deal ${dealId} pending confirmation created` };
}

async function handleDealStageChange(
  supabase: SupabaseClientAny,
  dealId: number,
  newStage: string
): Promise<{ processed: boolean; message: string }> {
  
  console.log(`[hubspot-confirm] Deal ${dealId} stage changed to: ${newStage}`);

  // Check if stage indicates closed-won (commission trigger)
  const closedWonStages = ["closedwon", "closed_won", "won", "closed - won", "qualifiedtobuy"];
  const isClosedWon = closedWonStages.some(s => 
    newStage.toLowerCase().includes(s) || newStage.toLowerCase() === s
  );

  if (!isClosedWon) {
    return { processed: false, message: `Stage "${newStage}" does not trigger payout` };
  }

  // Look for pending confirmations waiting for this deal
  const { data: pendingConfirmations } = await supabase
    .from("settlement_pending_confirmations")
    .select("*, settlement_contracts(*)")
    .eq("confirmation_source", "hubspot")
    .eq("status", "pending");

  const matchingConfirmations = (pendingConfirmations || []).filter((c: Record<string, unknown>) => {
    const triggerEvent = c.trigger_event as Record<string, unknown> | null;
    return triggerEvent?.hubspot_deal_id?.toString() === dealId.toString();
  });

  // If no pending confirmations, find matching contracts directly
  if (matchingConfirmations.length === 0) {
    const { data: contracts } = await supabase
      .from("settlement_contracts")
      .select("*")
      .eq("external_confirmation_source", "hubspot")
      .eq("external_confirmation_required", true)
      .eq("is_active", true);

    if (contracts && contracts.length > 0) {
      for (const contract of contracts) {
        const contractData = contract as Record<string, unknown>;
        const triggerType = contractData.trigger_type;
        const triggerConditions = contractData.trigger_conditions as Record<string, unknown> | null;
        
        if (triggerType === "revenue_received" || triggerConditions?.deal_stage === "closedwon") {
          await triggerSettlement(contractData.id as string, {
            source: "hubspot",
            event_type: "deal_closed_won",
            hubspot_deal_id: dealId,
            stage: newStage
          });
        }
      }
      return { processed: true, message: `Triggered settlements for closed-won deal ${dealId}` };
    }
    return { processed: false, message: `No pending confirmations for deal ${dealId}` };
  }

  // Update pending confirmations and trigger settlements
  for (const confirmation of matchingConfirmations) {
    const confirmationData = confirmation as Record<string, unknown>;
    
    await supabase
      .from("settlement_pending_confirmations")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmation_data: { stage: newStage, confirmed_by: "hubspot_webhook" }
      })
      .eq("id", confirmationData.id);

    await triggerSettlement(confirmationData.contract_id as string, {
      source: "hubspot",
      event_type: "deal_stage_confirmed",
      hubspot_deal_id: dealId,
      stage: newStage,
      confirmation_id: confirmationData.id
    });
  }

  return { processed: true, message: `Confirmed ${matchingConfirmations.length} settlements for deal ${dealId}` };
}

async function handleMeetingCreation(
  supabase: SupabaseClientAny,
  meetingId: number,
  portalId: number
): Promise<{ processed: boolean; message: string }> {
  console.log(`[hubspot-confirm] New meeting created: ${meetingId}`);

  // Create pending confirmation for meeting-based contracts
  const { data: contracts } = await supabase
    .from("settlement_contracts")
    .select("id")
    .eq("external_confirmation_source", "hubspot")
    .eq("external_confirmation_required", true)
    .eq("revenue_source_type", "meeting_fee")
    .eq("is_active", true);

  if (contracts && contracts.length > 0) {
    for (const contract of contracts) {
      await supabase
        .from("settlement_pending_confirmations")
        .insert({
          contract_id: contract.id,
          confirmation_source: "hubspot",
          trigger_event: { hubspot_meeting_id: meetingId, portal_id: portalId },
          status: "pending"
        });
    }
  }

  return { processed: true, message: `Meeting ${meetingId} pending confirmation created` };
}

async function handleMeetingConfirmation(
  supabase: SupabaseClientAny,
  meetingId: number,
  outcome: string
): Promise<{ processed: boolean; message: string }> {
  
  console.log(`[hubspot-confirm] Meeting ${meetingId} outcome: ${outcome}`);

  // Only trigger for completed/successful meetings
  const successOutcomes = ["completed", "scheduled", "showed", "attended", "rescheduled"];
  const isSuccessful = successOutcomes.some(s => outcome.toLowerCase().includes(s));

  if (!isSuccessful) {
    return { processed: false, message: `Meeting outcome "${outcome}" does not trigger payout` };
  }

  // Find contracts triggered by meetings
  const { data: contracts } = await supabase
    .from("settlement_contracts")
    .select("*")
    .eq("external_confirmation_source", "hubspot")
    .eq("external_confirmation_required", true)
    .eq("revenue_source_type", "meeting_fee")
    .eq("is_active", true);

  if (!contracts || contracts.length === 0) {
    return { processed: false, message: "No meeting-based contracts found" };
  }

  let triggeredCount = 0;
  for (const contract of contracts) {
    const contractId = (contract as Record<string, unknown>).id as string;
    await triggerSettlement(contractId, {
      source: "hubspot",
      event_type: "meeting_confirmed",
      hubspot_meeting_id: meetingId,
      outcome
    });
    triggeredCount++;
  }

  return { processed: true, message: `Triggered ${triggeredCount} meeting-based settlements ($250 fee)` };
}

async function handleCompanyCreation(
  supabase: SupabaseClientAny,
  companyId: number,
  portalId: number
): Promise<{ processed: boolean; message: string }> {
  console.log(`[hubspot-confirm] New company created: ${companyId}`);
  
  await supabase
    .from("ai_cross_module_links")
    .insert({
      source_module: "hubspot",
      source_entity_id: companyId.toString(),
      target_module: "crm",
      target_entity_id: companyId.toString(),
      link_type: "company_created",
      discovered_by: "hubspot_webhook",
      metadata: { portal_id: portalId, event_type: "company.creation" }
    });

  return { processed: true, message: `Company ${companyId} logged for attribution` };
}

async function handleAssociationEvent(
  supabase: SupabaseClientAny,
  event: HubSpotWebhookEvent
): Promise<{ processed: boolean; message: string }> {
  
  console.log(`[hubspot-confirm] Association event:`, event.subscriptionType);

  await supabase
    .from("ai_cross_module_links")
    .insert({
      source_module: "hubspot",
      source_entity_id: event.objectId.toString(),
      target_module: "crm",
      target_entity_id: event.objectId.toString(),
      link_type: event.subscriptionType,
      discovered_by: "hubspot_webhook",
      metadata: {
        portal_id: event.portalId,
        event_id: event.eventId,
        occurred_at: new Date(event.occurredAt).toISOString()
      }
    });

  return { processed: true, message: "Association logged for attribution" };
}

async function triggerSettlement(
  contractId: string,
  triggerEvent: Record<string, unknown>
): Promise<void> {
  
  console.log(`[hubspot-confirm] Triggering settlement for contract ${contractId}`);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const response = await fetch(`${supabaseUrl}/functions/v1/settlement-execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({
      contract_id: contractId,
      trigger_event: triggerEvent,
      external_confirmed: true
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`[hubspot-confirm] Settlement execution failed:`, error);
    throw new Error(`Settlement execution failed: ${error}`);
  }

  const result = await response.json();
  console.log(`[hubspot-confirm] Settlement result:`, result);
}
