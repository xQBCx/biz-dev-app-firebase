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
    const { initiativeId, contactId } = await req.json();
    
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from auth header
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get initiative and contact
    const [{ data: initiative }, { data: contact }] = await Promise.all([
      supabase.from("talent_initiatives").select("*").eq("id", initiativeId).single(),
      supabase.from("crm_contacts").select("*").eq("id", contactId).single(),
    ]);

    if (!initiative || !contact) {
      throw new Error("Initiative or contact not found");
    }

    // Generate match analysis with AI
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    let matchScore = 50;
    let matchReason = "";
    let proposedRole = contact.talent_type;

    if (apiKey) {
      const prompt = `Analyze the fit between this talent and initiative:

TALENT:
- Name: ${contact.first_name} ${contact.last_name}
- Type: ${contact.talent_type}
- Background: ${contact.research_data?.summary || contact.talent_notes || "Limited info"}

INITIATIVE:
- Name: ${initiative.name}
- Description: ${initiative.description}
- Target roles: ${(initiative.target_roles || []).join(", ")}
- Compensation: ${(initiative.compensation_types || []).join(", ")}

Provide a match analysis in JSON format:
{
  "score": <number 0-100>,
  "reason": "<2-3 sentence explanation of why this is a good/poor fit>",
  "proposedRole": "<specific role suggestion>",
  "proposedCompensation": {"type": "<equity|revenue_share|salary|sweat_equity>", "details": "<specifics>"}
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a business matchmaking AI. Analyze talent-initiative fit and provide structured JSON responses." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            matchScore = analysis.score || 50;
            matchReason = analysis.reason || "";
            proposedRole = analysis.proposedRole || contact.talent_type;
          }
        } catch (e) {
          console.error("Parse error:", e);
        }
      }
    }

    // Create the match
    const { data: newMatch, error: matchError } = await supabase
      .from("talent_initiative_matches")
      .insert({
        initiative_id: initiativeId,
        contact_id: contactId,
        user_id: user.id,
        match_score: matchScore,
        match_reason: matchReason,
        proposed_role: proposedRole,
        status: "proposed",
      })
      .select()
      .single();

    if (matchError) {
      throw matchError;
    }

    return new Response(JSON.stringify({ 
      success: true,
      match: newMatch,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Match creation failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
