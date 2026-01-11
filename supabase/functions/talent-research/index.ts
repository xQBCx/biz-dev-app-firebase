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
    const { contactId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get contact details
    const { data: contact, error: contactError } = await supabase
      .from("crm_contacts")
      .select("*")
      .eq("id", contactId)
      .single();

    if (contactError || !contact) {
      throw new Error("Contact not found");
    }

    // Build research query
    const name = `${contact.first_name} ${contact.last_name}`.trim();
    let query = `Research ${name}`;
    
    if (contact.linkedin_url) {
      query += ` LinkedIn profile: ${contact.linkedin_url}`;
    }
    if (contact.instagram_url) {
      query += ` Instagram: ${contact.instagram_url}`;
    }
    if (contact.talent_type) {
      query += `. They are a ${contact.talent_type}.`;
    }
    query += ` Provide a professional summary including their background, expertise, notable achievements, and potential value as a business partner or ambassador.`;

    // Use Perplexity if available, otherwise use Lovable AI
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    let researchData: any = {};
    let summary = "";

    if (perplexityKey) {
      // Use Perplexity for web-grounded research
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${perplexityKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            { role: "system", content: "You are a professional researcher. Provide concise, factual information about the person based on publicly available information." },
            { role: "user", content: query },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        summary = data.choices?.[0]?.message?.content || "";
        researchData = {
          source: "perplexity",
          citations: data.citations || [],
          researched_at: new Date().toISOString(),
          raw_response: data,
        };
      }
    } else if (lovableKey) {
      // Fallback to Lovable AI
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a professional researcher. Based on the name and available information, provide a plausible professional summary. Note that this is based on general knowledge, not real-time web search." },
            { role: "user", content: query },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        summary = data.choices?.[0]?.message?.content || "";
        researchData = {
          source: "lovable_ai",
          researched_at: new Date().toISOString(),
        };
      }
    }

    // Calculate a match score based on available data
    let potentialScore = 50; // Base score
    if (contact.linkedin_url) potentialScore += 15;
    if (contact.instagram_url) potentialScore += 10;
    if (contact.talent_notes) potentialScore += 10;
    if (summary.length > 200) potentialScore += 15;
    potentialScore = Math.min(potentialScore, 100);

    // Update contact with research data
    await supabase
      .from("crm_contacts")
      .update({
        research_data: {
          ...researchData,
          summary,
        },
        potential_match_score: potentialScore,
        perplexity_last_researched: new Date().toISOString(),
      })
      .eq("id", contactId);

    return new Response(JSON.stringify({ 
      success: true, 
      summary,
      score: potentialScore,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Research failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
