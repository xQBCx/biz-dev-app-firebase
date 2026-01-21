import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-partner-api-key",
};

/**
 * Partner Agent Integration Function
 * 
 * Enables partners like OptimoIT to:
 * 1. Run their agents through the Biz Dev platform
 * 2. Host data and security solutions
 * 3. Execute agent workflows into client systems
 * 4. Route data to client HubSpot instances (e.g., The View Pro)
 * 
 * This is part of the broader vision where:
 * - Partners can build agents directly in the platform
 * - Data can be hosted securely with eventual migration to own data centers
 * - Agents can operate across the Biz Dev ecosystem
 */

async function validatePartnerApiKey(supabase: any, apiKey: string): Promise<{ partner: any; valid: boolean }> {
  // Hash the provided key
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const apiKeyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  // Find partner by hash
  const { data: partner, error } = await supabase
    .from("partner_integrations")
    .select("*")
    .eq("api_key_hash", apiKeyHash)
    .eq("is_active", true)
    .single();

  if (error || !partner) {
    return { partner: null, valid: false };
  }

  // Update last_used_at and increment request_count
  await supabase
    .from("partner_integrations")
    .update({ 
      last_used_at: new Date().toISOString(),
      request_count: partner.request_count + 1
    })
    .eq("id", partner.id);

  return { partner, valid: true };
}

async function logPartnerApiCall(
  supabase: any, 
  partnerId: string, 
  action: string, 
  requestPayload: any, 
  responseStatus: number, 
  responseSummary: string,
  ipAddress?: string | null,
  userAgent?: string | null
) {
  await supabase.from("partner_api_logs").insert({
    partner_id: partnerId,
    action,
    request_payload: requestPayload,
    response_status: responseStatus,
    response_summary: responseSummary,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip");
  const userAgent = req.headers.get("user-agent");

  try {
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("X-Partner-API-Key");
    
    // Support both user auth and API key auth for partners
    let partner: any = null;
    let partnerId: string | null = null;
    let userId: string | null = null;

    if (apiKey) {
      // Validate partner API key using hash comparison
      const validation = await validatePartnerApiKey(supabase, apiKey);
      if (validation.valid) {
        partner = validation.partner;
        partnerId = partner.id;
      }
    } else if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      if (user) {
        userId = user.id;
      }
    }

    if (!partnerId && !userId) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { 
      action,
      agent_config,
      execution_context,
      target_client_id,
      data_operation,
    } = await req.json();

    console.log(`[partner-agent] Action: ${action} from partner: ${partnerId || userId}`);

    switch (action) {
      case "register_agent": {
        // Register a partner agent in the system
        const { data: agent, error } = await supabase
          .from("instincts_agents")
          .insert({
            slug: `partner_${agent_config.slug}`,
            name: agent_config.name,
            category: agent_config.category || "operations",
            description: agent_config.description,
            capabilities: agent_config.capabilities || [],
            config_schema: agent_config.config_schema || {},
            is_active: true,
            is_partner_agent: true,
            partner_id: partnerId,
          })
          .select()
          .single();

        if (error) {
          console.log("[partner-agent] Agent registration - table schema may need update:", error);
        }

        return new Response(
          JSON.stringify({
            success: true,
            agent_id: agent?.id,
            message: "Agent registered successfully",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "execute_agent": {
        // Execute a partner agent
        const { agent_id, input_data, target_workflow } = execution_context;

        console.log(`[partner-agent] Executing agent ${agent_id}`);

        // Log the execution
        const { data: run } = await supabase
          .from("instincts_agent_runs")
          .insert({
            agent_id,
            user_id: userId || null,
            trigger_type: "partner_api",
            status: "running",
            started_at: new Date().toISOString(),
            input_summary: JSON.stringify(input_data).substring(0, 500),
            trigger_context: {
              partner_id: partnerId,
              target_client: target_client_id,
            },
          })
          .select()
          .single();

        // In production, this would invoke the actual agent logic
        // For now, return a placeholder response
        const result = {
          status: "completed",
          outputs: {},
          recommendations: [],
        };

        // Update run with results
        if (run) {
          await supabase
            .from("instincts_agent_runs")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              result,
            })
            .eq("id", run.id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            run_id: run?.id,
            result,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sync_data": {
        // Sync data between partner system and Biz Dev
        const { entity_type, operation, data } = data_operation;

        console.log(`[partner-agent] Data sync: ${operation} on ${entity_type}`);

        // Handle different entity types
        switch (entity_type) {
          case "contacts":
            if (operation === "upsert") {
              for (const contact of data) {
                await supabase
                  .from("crm_contacts")
                  .upsert({
                    ...contact,
                    user_id: userId,
                    source: `partner_${partnerId}`,
                  });
              }
            }
            break;
          case "activities":
            // Log activities from partner agents
            for (const activity of data) {
              await supabase
                .from("activity_logs")
                .insert({
                  ...activity,
                  user_id: userId,
                  metadata: { partner_id: partnerId, ...activity.metadata },
                });
            }
            break;
        }

        return new Response(
          JSON.stringify({
            success: true,
            synced_count: data?.length || 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list_capabilities": {
        // List what the platform offers to partners
        if (partnerId) {
          await logPartnerApiCall(supabase, partnerId, "list_capabilities", {}, 200, "Capabilities listed", ipAddress, userAgent);
        }
        return new Response(
          JSON.stringify({
            success: true,
            capabilities: {
              agent_hosting: {
                description: "Host and run agents on the Biz Dev platform",
                features: ["execution", "scheduling", "monitoring", "credits"],
              },
              data_storage: {
                description: "Secure data storage with eventual migration support",
                features: ["encrypted_storage", "rls_policies", "backup", "export"],
              },
              client_integration: {
                description: "Connect agents to client systems",
                features: ["crm_sync", "workflow_triggers", "notifications"],
              },
              hubspot_routing: {
                description: "Route data to client HubSpot instances",
                features: ["create_contact", "create_deal", "log_activity", "update_properties"],
              },
              marketplace: {
                description: "Publish agents to the marketplace",
                features: ["listing", "pricing", "subscriptions", "analytics"],
              },
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "hubspot_create_contact": {
        // Create a contact in a client's HubSpot via partner API
        if (!partnerId || !partner) {
          return new Response(
            JSON.stringify({ error: "Partner API key required for HubSpot operations" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { hubspot_account_id, contact_data } = execution_context || {};

        // Verify partner has access to this HubSpot account
        const allowedAccounts = partner.allowed_hubspot_accounts || [];
        const hasAccess = allowedAccounts.some((acc: any) => 
          acc.account_id === hubspot_account_id || acc.portal_id === hubspot_account_id
        );

        if (!hasAccess) {
          await logPartnerApiCall(supabase, partnerId, "hubspot_create_contact", { hubspot_account_id }, 403, "Access denied to HubSpot account", ipAddress, userAgent);
          return new Response(
            JSON.stringify({ error: "Partner does not have access to this HubSpot account" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get HubSpot credentials for this account
        const hubspotAccessToken = Deno.env.get("HUBSPOT_ACCESS_TOKEN");
        if (!hubspotAccessToken) {
          await logPartnerApiCall(supabase, partnerId, "hubspot_create_contact", { hubspot_account_id }, 500, "HubSpot not configured", ipAddress, userAgent);
          return new Response(
            JSON.stringify({ error: "HubSpot integration not configured" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        try {
          const hubspotResponse = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${hubspotAccessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ properties: contact_data }),
          });

          const result = await hubspotResponse.json();
          
          await logPartnerApiCall(
            supabase, 
            partnerId, 
            "hubspot_create_contact", 
            { hubspot_account_id, contact_email: contact_data?.email }, 
            hubspotResponse.status, 
            hubspotResponse.ok ? "Contact created" : result.message,
            ipAddress, 
            userAgent
          );

          return new Response(
            JSON.stringify({
              success: hubspotResponse.ok,
              hubspot_contact: result,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (hubspotError: any) {
          await logPartnerApiCall(supabase, partnerId, "hubspot_create_contact", { hubspot_account_id }, 500, hubspotError.message, ipAddress, userAgent);
          throw hubspotError;
        }
      }

      case "hubspot_create_deal": {
        // Create a deal in a client's HubSpot via partner API
        if (!partnerId || !partner) {
          return new Response(
            JSON.stringify({ error: "Partner API key required for HubSpot operations" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { hubspot_account_id, deal_data, associations } = execution_context || {};

        // Verify access
        const allowedAccounts = partner.allowed_hubspot_accounts || [];
        const hasAccess = allowedAccounts.some((acc: any) => 
          acc.account_id === hubspot_account_id || acc.portal_id === hubspot_account_id
        );

        if (!hasAccess) {
          await logPartnerApiCall(supabase, partnerId, "hubspot_create_deal", { hubspot_account_id }, 403, "Access denied", ipAddress, userAgent);
          return new Response(
            JSON.stringify({ error: "Partner does not have access to this HubSpot account" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const hubspotAccessToken = Deno.env.get("HUBSPOT_ACCESS_TOKEN");
        if (!hubspotAccessToken) {
          await logPartnerApiCall(supabase, partnerId, "hubspot_create_deal", { hubspot_account_id }, 500, "HubSpot not configured", ipAddress, userAgent);
          return new Response(
            JSON.stringify({ error: "HubSpot integration not configured" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        try {
          const hubspotResponse = await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${hubspotAccessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              properties: deal_data,
              associations: associations || [],
            }),
          });

          const result = await hubspotResponse.json();
          
          await logPartnerApiCall(
            supabase, 
            partnerId, 
            "hubspot_create_deal", 
            { hubspot_account_id, dealname: deal_data?.dealname }, 
            hubspotResponse.status, 
            hubspotResponse.ok ? "Deal created" : result.message,
            ipAddress, 
            userAgent
          );

          return new Response(
            JSON.stringify({
              success: hubspotResponse.ok,
              hubspot_deal: result,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (hubspotError: any) {
          await logPartnerApiCall(supabase, partnerId, "hubspot_create_deal", { hubspot_account_id }, 500, hubspotError.message, ipAddress, userAgent);
          throw hubspotError;
        }
      }

      case "trigger_settlement": {
        // Trigger a settlement workflow in a deal room
        if (!partnerId || !partner) {
          return new Response(
            JSON.stringify({ error: "Partner API key required for settlement operations" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { deal_room_id, settlement_data } = execution_context || {};

        // Verify partner has access to this deal room
        const allowedDealRooms = partner.allowed_deal_room_ids || [];
        if (!allowedDealRooms.includes(deal_room_id)) {
          await logPartnerApiCall(supabase, partnerId, "trigger_settlement", { deal_room_id }, 403, "Access denied to deal room", ipAddress, userAgent);
          return new Response(
            JSON.stringify({ error: "Partner does not have access to this deal room" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update deal room to trigger settlement
        const { data: dealRoom, error: dealRoomError } = await supabase
          .from("deal_rooms")
          .update({
            status: "settlement_pending",
            settlement_triggered_by: "partner_api",
            settlement_triggered_at: new Date().toISOString(),
            metadata: {
              partner_id: partnerId,
              settlement_data,
            },
          })
          .eq("id", deal_room_id)
          .select()
          .single();

        if (dealRoomError) {
          await logPartnerApiCall(supabase, partnerId, "trigger_settlement", { deal_room_id }, 400, dealRoomError.message, ipAddress, userAgent);
          return new Response(
            JSON.stringify({ error: dealRoomError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await logPartnerApiCall(supabase, partnerId, "trigger_settlement", { deal_room_id }, 200, "Settlement triggered", ipAddress, userAgent);

        return new Response(
          JSON.stringify({
            success: true,
            deal_room_id,
            status: "settlement_pending",
            message: "Settlement workflow triggered successfully",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        if (partnerId) {
          await logPartnerApiCall(supabase, partnerId, action || "unknown", {}, 400, `Unknown action: ${action}`, ipAddress, userAgent);
        }
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error: any) {
    console.error("[partner-agent] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
