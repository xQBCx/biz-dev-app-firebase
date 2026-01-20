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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const events: HubSpotWebhookEvent[] = await req.json();
    
    console.log(`[hubspot-confirm] Received ${events.length} webhook events`);

    const results: Array<{ eventId: number; processed: boolean; message: string }> = [];

    for (const event of events) {
      try {
        const result = await processHubSpotEvent(supabase, event);
        results.push({
          eventId: event.eventId,
          processed: result.processed,
          message: result.message
        });
      } catch (err) {
        console.error(`[hubspot-confirm] Error processing event ${event.eventId}:`, err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
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

async function processHubSpotEvent(
  supabase: SupabaseClientAny,
  event: HubSpotWebhookEvent
): Promise<{ processed: boolean; message: string }> {
  
  const { subscriptionType, objectId, propertyName, propertyValue } = event;

  // Handle deal stage changes (closed-won, meeting completed, etc.)
  if (subscriptionType === "deal.propertyChange" && propertyName === "dealstage") {
    return await handleDealStageChange(supabase, objectId, propertyValue || "");
  }

  // Handle meeting completion
  if (subscriptionType === "meeting.creation" || 
      (subscriptionType === "deal.propertyChange" && propertyName === "hs_meeting_outcome")) {
    return await handleMeetingConfirmation(supabase, objectId, propertyValue || "completed");
  }

  // Handle contact/company association (for attribution)
  if (subscriptionType.includes("association")) {
    return await handleAssociationEvent(supabase, event);
  }

  return { processed: false, message: `Unhandled event type: ${subscriptionType}` };
}

async function handleDealStageChange(
  supabase: SupabaseClientAny,
  dealId: number,
  newStage: string
): Promise<{ processed: boolean; message: string }> {
  
  console.log(`[hubspot-confirm] Deal ${dealId} stage changed to: ${newStage}`);

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

  if (matchingConfirmations.length === 0) {
    // Check if this matches any contract's trigger conditions
    const { data: contracts } = await supabase
      .from("settlement_contracts")
      .select("*")
      .eq("external_confirmation_source", "hubspot")
      .eq("external_confirmation_required", true)
      .eq("is_active", true);

    if (contracts && contracts.length > 0) {
      // Check if stage indicates closed-won
      const closedWonStages = ["closedwon", "closed_won", "won", "closed - won"];
      const isClosedWon = closedWonStages.some(s => 
        newStage.toLowerCase().includes(s) || newStage.toLowerCase() === s
      );

      if (isClosedWon) {
        // Trigger settlement for matching contracts
        for (const contract of contracts) {
          const triggerType = (contract as Record<string, unknown>).trigger_type;
          const triggerConditions = (contract as Record<string, unknown>).trigger_conditions as Record<string, unknown> | null;
          const contractId = (contract as Record<string, unknown>).id as string;
          
          if (triggerType === "revenue_received" || triggerConditions?.deal_stage === "closedwon") {
            await triggerSettlement(contractId, {
              source: "hubspot",
              event_type: "deal_closed_won",
              hubspot_deal_id: dealId,
              stage: newStage
            });
          }
        }
        return { processed: true, message: `Triggered settlements for closed-won deal ${dealId}` };
      }
    }
    return { processed: false, message: `No pending confirmations for deal ${dealId}` };
  }

  // Update pending confirmations
  for (const confirmation of matchingConfirmations) {
    const confirmationData = confirmation as Record<string, unknown>;
    const confirmationId = confirmationData.id as string;
    const contractId = confirmationData.contract_id as string;

    await supabase
      .from("settlement_pending_confirmations")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmation_data: { stage: newStage, confirmed_by: "hubspot_webhook" }
      })
      .eq("id", confirmationId);

    // Trigger the settlement execution
    await triggerSettlement(contractId, {
      source: "hubspot",
      event_type: "deal_stage_confirmed",
      hubspot_deal_id: dealId,
      stage: newStage,
      confirmation_id: confirmationId
    });
  }

  return { processed: true, message: `Confirmed ${matchingConfirmations.length} settlements for deal ${dealId}` };
}

async function handleMeetingConfirmation(
  supabase: SupabaseClientAny,
  meetingId: number,
  outcome: string
): Promise<{ processed: boolean; message: string }> {
  
  console.log(`[hubspot-confirm] Meeting ${meetingId} outcome: ${outcome}`);

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

  // Only trigger for completed/successful meetings
  const successOutcomes = ["completed", "scheduled", "showed", "attended"];
  const isSuccessful = successOutcomes.some(s => outcome.toLowerCase().includes(s));

  if (!isSuccessful) {
    return { processed: false, message: `Meeting outcome "${outcome}" does not trigger payout` };
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

  return { processed: true, message: `Triggered ${triggeredCount} meeting-based settlements` };
}

async function handleAssociationEvent(
  supabase: SupabaseClientAny,
  event: HubSpotWebhookEvent
): Promise<{ processed: boolean; message: string }> {
  
  // Log for attribution tracking
  console.log(`[hubspot-confirm] Association event:`, event.subscriptionType);

  // Store in attribution log for later use
  await supabase
    .from("ai_cross_module_links")
    .insert([{
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
    }]);

  return { processed: true, message: "Association logged for attribution" };
}

async function triggerSettlement(
  contractId: string,
  triggerEvent: Record<string, unknown>
): Promise<void> {
  
  console.log(`[hubspot-confirm] Triggering settlement for contract ${contractId}`);

  // Call the settlement-execute function
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
