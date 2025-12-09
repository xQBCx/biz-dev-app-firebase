import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Running ERP auto-evolution cron job...");

    // Get all active ERP configs that haven't evolved in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: configs, error: configError } = await supabaseClient
      .from("company_erp_configs")
      .select("id, user_id, industry, strategy")
      .eq("status", "active")
      .or(`last_evolved_at.is.null,last_evolved_at.lt.${twentyFourHoursAgo}`)
      .limit(10);

    if (configError) {
      console.error("Error fetching configs:", configError);
      throw configError;
    }

    console.log(`Found ${configs?.length || 0} configs to evolve`);

    const results = [];

    for (const config of configs || []) {
      try {
        // Get recent activity for this config
        const { data: recentDocs } = await supabaseClient
          .from("erp_documents")
          .select("file_name, file_type, created_at")
          .eq("erp_config_id", config.id)
          .gte("created_at", twentyFourHoursAgo)
          .limit(20);

        // Only evolve if there's been recent activity
        if (!recentDocs || recentDocs.length < 3) {
          console.log(`Skipping config ${config.id} - insufficient recent activity`);
          continue;
        }

        // Call the evolve function
        const { data, error } = await supabaseClient.functions.invoke("erp-evolve", {
          body: { configId: config.id },
          headers: {
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
        });

        if (error) {
          console.error(`Error evolving config ${config.id}:`, error);
          results.push({ configId: config.id, status: "error", error: error.message });
        } else {
          console.log(`Evolved config ${config.id}:`, data);
          results.push({ configId: config.id, status: "success", ...data });
        }
      } catch (err) {
        console.error(`Exception evolving config ${config.id}:`, err);
        results.push({ configId: config.id, status: "error", error: String(err) });
      }
    }

    console.log("ERP auto-evolution cron complete:", results);

    return new Response(
      JSON.stringify({ 
        processed: results.length, 
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cron error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
