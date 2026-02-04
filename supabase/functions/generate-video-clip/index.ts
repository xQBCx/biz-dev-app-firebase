import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { scene_id, visual_prompt, duration_seconds } = await req.json();

    if (!scene_id || !visual_prompt) {
      throw new Error("scene_id and visual_prompt are required");
    }

    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    
    if (!REPLICATE_API_TOKEN) {
      // Mark scene as pending with placeholder - will generate when API key is added
      await supabaseClient
        .from("commercial_scenes")
        .update({
          status: "pending_api_key",
          video_clip_url: null,
        })
        .eq("id", scene_id);

      return new Response(
        JSON.stringify({
          success: false,
          status: "pending_api_key",
          message: "Replicate API token not configured. Video generation will be available once configured.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update scene status to generating
    await supabaseClient
      .from("commercial_scenes")
      .update({ status: "generating" })
      .eq("id", scene_id);

    // Call Replicate API to generate video
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "luma/ray-2-flash", // Fast video generation model
        input: {
          prompt: visual_prompt,
          duration: Math.min(duration_seconds || 5, 10), // Max 10 seconds per clip
          aspect_ratio: "16:9",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate API error: ${errorText}`);
    }

    const prediction = await response.json();

    // Store prediction ID for polling
    await supabaseClient
      .from("commercial_scenes")
      .update({
        status: "processing",
        metadata: { prediction_id: prediction.id },
      })
      .eq("id", scene_id);

    return new Response(
      JSON.stringify({
        success: true,
        prediction_id: prediction.id,
        status: prediction.status,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating video clip:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
