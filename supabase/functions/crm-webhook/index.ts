import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify API key matches user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", apiKey)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = profile.id;
    const { action, type, data } = await req.json();

    let result;

    switch (type) {
      case "contact":
        if (action === "create") {
          result = await supabase
            .from("crm_contacts")
            .insert({ ...data, user_id: userId });
        } else if (action === "update" && data.id) {
          result = await supabase
            .from("crm_contacts")
            .update(data)
            .eq("id", data.id)
            .eq("user_id", userId);
        }
        break;

      case "company":
        if (action === "create") {
          result = await supabase
            .from("crm_companies")
            .insert({ ...data, user_id: userId });
        } else if (action === "update" && data.id) {
          result = await supabase
            .from("crm_companies")
            .update(data)
            .eq("id", data.id)
            .eq("user_id", userId);
        }
        break;

      case "deal":
        if (action === "create") {
          result = await supabase
            .from("crm_deals")
            .insert({ ...data, user_id: userId });
        } else if (action === "update" && data.id) {
          result = await supabase
            .from("crm_deals")
            .update(data)
            .eq("id", data.id)
            .eq("user_id", userId);
        }
        break;

      case "activity":
        if (action === "create") {
          result = await supabase
            .from("crm_activities")
            .insert({ ...data, user_id: userId });
        }
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    if (result?.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data: result?.data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
