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
    const { filePaths, sourceType } = await req.json();

    if (!filePaths || filePaths.length === 0) {
      return new Response(
        JSON.stringify({ error: "No files provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[parse-funnel-intake] Processing ${filePaths.length} files of type: ${sourceType}`);

    // Build content for AI based on source type
    const contentParts: any[] = [];
    
    for (const filePath of filePaths) {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('funnel-uploads')
        .download(filePath);

      if (downloadError) {
        console.error(`[parse-funnel-intake] Download error for ${filePath}:`, downloadError);
        continue;
      }

      if (sourceType === 'screenshot' || filePath.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
        // Convert image to base64
        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const mimeType = filePath.endsWith('.png') ? 'image/png' : 
                        filePath.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
        
        contentParts.push({
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64}` }
        });
      } else if (sourceType === 'voice' || filePath.match(/\.(webm|mp3|wav|m4a)$/i)) {
        // For voice, we'd need to transcribe first - using a placeholder for now
        // In production, you'd call a transcription service here
        contentParts.push({
          type: "text",
          text: `[Voice memo file: ${filePath}]`
        });
      } else {
        // Text/document content
        const text = await fileData.text();
        contentParts.push({
          type: "text",
          text: `Document content from ${filePath}:\n${text}`
        });
      }
    }

    // Add the analysis prompt
    contentParts.push({
      type: "text",
      text: `Analyze the above content (screenshots/documents/voice transcription) which shows a sales funnel or automation workflow.

Extract and structure the workflow into a clear funnel with stages. For each stage, identify:
1. The stage name
2. What action happens at this stage
3. What integrations/tools are needed (e.g., email service, CRM, calendar, etc.)
4. Any conditions or logic involved

Respond with a JSON object:
{
  "name": "Name of the funnel/workflow",
  "description": "Brief description of what this funnel accomplishes",
  "category": "sales|marketing|lead_gen|onboarding|support|operations",
  "stages": [
    {
      "name": "Stage Name",
      "description": "What happens at this stage",
      "action_type": "trigger|action|condition|delay|notification",
      "integrations": ["integration1", "integration2"],
      "conditions": ["optional conditions"]
    }
  ],
  "integrations_needed": ["list of all integrations needed"]
}

Be thorough in extracting ALL steps shown in the content. Focus on creating actionable, implementable stages.`
    });

    console.log(`[parse-funnel-intake] Sending ${contentParts.length} content parts to AI`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: contentParts
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[parse-funnel-intake] AI error:", errorText);
      throw new Error("Failed to analyze content");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    console.log(`[parse-funnel-intake] Parsed funnel: ${parsed.name} with ${parsed.stages?.length || 0} stages`);

    return new Response(
      JSON.stringify({ parsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[parse-funnel-intake] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
