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
    const { matchId, format } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get match with related data
    const { data: match, error: matchError } = await supabase
      .from("talent_initiative_matches")
      .select(`
        *,
        crm_contacts(*),
        talent_initiatives(*)
      `)
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      throw new Error("Match not found");
    }

    const contact = match.crm_contacts;
    const initiative = match.talent_initiatives;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      throw new Error("AI API key not configured");
    }

    // Build format-specific prompts
    const prompts: Record<string, string> = {
      audio_overview: `Create a podcast-style script (2-3 minutes when read) explaining why ${contact.first_name} ${contact.last_name} would be an excellent ${match.proposed_role || contact.talent_type} for ${initiative.name}. 
      
Initiative: ${initiative.description || initiative.name}
Website: ${initiative.website_url || "Not specified"}
Compensation: ${(initiative.compensation_types || []).join(", ")}

Contact background: ${contact.research_data?.summary || contact.talent_notes || "Limited info available"}

Make it conversational, engaging, and highlight:
1. Why this opportunity is perfect for them
2. The potential impact they could have
3. The compensation structure and how it benefits them
4. Clear next steps`,

      video_script: `Create a video script with scene directions for a 2-minute explainer video about the ${initiative.name} opportunity for ${contact.first_name}.

Structure:
- Opening hook (10 seconds)
- Problem/Opportunity (20 seconds)
- Solution: ${initiative.name} (30 seconds)
- Why ${contact.first_name} is perfect for this (30 seconds)
- Compensation and benefits (20 seconds)
- Call to action (10 seconds)

Include [VISUAL] directions and speaker notes.`,

      slide_deck: `Create a 6-slide presentation deck outline for presenting the ${initiative.name} opportunity to ${contact.first_name}.

Return as JSON with this structure:
{
  "slides": [
    {"title": "Slide title", "bullets": ["Point 1", "Point 2", "Point 3"]}
  ]
}

Slides should cover:
1. The opportunity headline
2. About ${initiative.name}
3. Why ${contact.first_name} is perfect
4. The role and responsibilities
5. Compensation structure (${(initiative.compensation_types || []).join(", ")})
6. Next steps and CTA`,

      infographic: `Create data points and key statistics for an infographic about the ${initiative.name} opportunity.

Return as JSON:
{
  "headline": "Main headline",
  "subheadline": "Supporting text",
  "stats": [
    {"number": "X%", "label": "Description"},
    {"number": "$XM", "label": "Description"}
  ],
  "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "cta": "Call to action text"
}`,

      executive_brief: `Write a concise 1-page executive brief for ${contact.first_name} ${contact.last_name} about the ${initiative.name} partnership opportunity.

Include:
- Executive Summary (2-3 sentences)
- Opportunity Overview
- Role: ${match.proposed_role || contact.talent_type}
- Compensation: ${(initiative.compensation_types || []).join(", ")}
- Key Benefits (3-5 bullets)
- Timeline and Next Steps

Keep it professional and focused on ROI for ${contact.first_name}.`,

      flashcards: `Create 8 Q&A flashcards to help ${contact.first_name} understand the ${initiative.name} opportunity.

Return as JSON:
{
  "cards": [
    {"question": "What is ${initiative.name}?", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}

Cover: what it is, why it matters, compensation, role, benefits, timeline, next steps, FAQs.`,
    };

    const systemPrompt = `You are a professional business development consultant creating personalized pitch materials. 
Your goal is to present opportunities in a compelling, honest way that helps the recipient understand the value proposition quickly.
Always be specific, avoid generic statements, and focus on tangible benefits.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompts[format] || prompts.executive_brief },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Error:", errorText);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Parse JSON content for structured formats
    let parsedContent: any = { text: content };
    if (["slide_deck", "infographic", "flashcards"].includes(format)) {
      try {
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("JSON parse error:", e);
        parsedContent = { text: content };
      }
    }

    // Update match with generated materials
    const existingMaterials = match.vision_materials_generated || {};
    await supabase
      .from("talent_initiative_matches")
      .update({
        vision_materials_generated: {
          ...existingMaterials,
          [format]: {
            generated_at: new Date().toISOString(),
            content: parsedContent,
          },
        },
      })
      .eq("id", matchId);

    return new Response(JSON.stringify({ 
      success: true,
      format,
      content: parsedContent,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Generation failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
