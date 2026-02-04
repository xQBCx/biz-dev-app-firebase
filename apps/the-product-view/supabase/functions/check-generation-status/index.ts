import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's Luma AI API key
    const { data: apiKeyData, error: keyError } = await supabase
      .from("user_api_keys")
      .select("api_key")
      .eq("user_id", user.id)
      .eq("provider", "luma_ai")
      .single();

    if (keyError || !apiKeyData) {
      return new Response(JSON.stringify({ 
        error: "Luma AI API key not configured",
        code: "NO_API_KEY"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { generationId } = await req.json();

    if (!generationId) {
      return new Response(JSON.stringify({ error: "Generation ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Checking generation status:", generationId);

    const lumaResponse = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKeyData.api_key}`,
      },
    });

    if (!lumaResponse.ok) {
      const errorText = await lumaResponse.text();
      console.error("Luma AI status check error:", lumaResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: `Luma AI error: ${lumaResponse.status}`,
        details: errorText
      }), {
        status: lumaResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await lumaResponse.json();
    console.log("Generation status:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in check-generation-status function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
