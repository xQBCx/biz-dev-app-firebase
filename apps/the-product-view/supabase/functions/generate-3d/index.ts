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

    // Get user's Luma AI API key for 3D generation
    const { data: apiKeyData, error: keyError } = await supabase
      .from("user_api_keys")
      .select("api_key")
      .eq("user_id", user.id)
      .eq("provider", "luma_ai")
      .single();

    if (keyError || !apiKeyData) {
      return new Response(JSON.stringify({ 
        error: "Luma AI API key not configured. Please add your API key in settings.",
        code: "NO_API_KEY"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl, prompt, mode = "image-to-3d" } = await req.json();

    if (mode === "image-to-3d" && !imageUrl) {
      return new Response(JSON.stringify({ error: "Image URL is required for image-to-3d mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "prompt-to-3d" && !prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required for prompt-to-3d mode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating 3D with Luma AI:", mode, imageUrl || prompt);

    // Call Luma AI Genie API for 3D generation
    const requestBody: any = {};
    
    if (mode === "image-to-3d") {
      requestBody.image_url = imageUrl;
    } else {
      requestBody.prompt = prompt;
    }

    const lumaResponse = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations/3d", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKeyData.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!lumaResponse.ok) {
      const errorText = await lumaResponse.text();
      console.error("Luma AI 3D error:", lumaResponse.status, errorText);
      return new Response(JSON.stringify({ 
        error: `Luma AI error: ${lumaResponse.status}`,
        details: errorText
      }), {
        status: lumaResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await lumaResponse.json();
    console.log("Luma AI 3D generation started:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in generate-3d function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
