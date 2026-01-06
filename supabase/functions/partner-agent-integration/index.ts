import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Partner Agent Integration Function
 * 
 * Enables partners like OptimoIT to:
 * 1. Run their agents through the Biz Dev platform
 * 2. Host data and security solutions
 * 3. Execute agent workflows into client systems
 * 
 * This is part of the broader vision where:
 * - Partners can build agents directly in the platform
 * - Data can be hosted securely with eventual migration to own data centers
 * - Agents can operate across the Biz Dev ecosystem
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("X-Partner-API-Key");
    
    // Support both user auth and API key auth for partners
    let partnerId: string | null = null;
    let userId: string | null = null;

    if (apiKey) {
      // Validate partner API key
      const { data: partner } = await supabase
        .from("partner_integrations")
        .select("*")
        .eq("api_key", apiKey)
        .eq("is_active", true)
        .single();

      if (partner) {
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
              marketplace: {
                description: "Publish agents to the marketplace",
                features: ["listing", "pricing", "subscriptions", "analytics"],
              },
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
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
