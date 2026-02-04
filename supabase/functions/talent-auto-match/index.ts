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
    const { initiativeId } = await req.json();
    
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get initiative
    const { data: initiative, error: initError } = await supabase
      .from("talent_initiatives")
      .select("*")
      .eq("id", initiativeId)
      .single();

    if (initError || !initiative) {
      throw new Error("Initiative not found");
    }

    // Get all unmatched talent contacts for this user
    const { data: existingMatches } = await supabase
      .from("talent_initiative_matches")
      .select("contact_id")
      .eq("initiative_id", initiativeId);

    const matchedContactIds = (existingMatches || []).map((m: any) => m.contact_id);

    const { data: contacts, error: contactsError } = await supabase
      .from("crm_contacts")
      .select("*")
      .eq("user_id", user.id)
      .not("talent_type", "is", null);

    if (contactsError) {
      throw contactsError;
    }

    const unmatchedContacts = contacts?.filter((c: any) => !matchedContactIds.includes(c.id)) || [];

    // Score and create matches for each unmatched contact
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    let matchesCreated = 0;

    for (const contact of unmatchedContacts) {
      // Simple scoring algorithm
      let score = 40; // Base score
      
      // Role match
      if (initiative.target_roles?.includes(contact.talent_type)) {
        score += 25;
      }

      // Has research data
      if (contact.research_data?.summary) {
        score += 15;
      }

      // Has social presence
      if (contact.linkedin_url) score += 5;
      if (contact.instagram_url) score += 5;
      if (contact.youtube_url) score += 5;

      // Has notes
      if (contact.talent_notes) score += 5;

      // Cap at 100
      score = Math.min(score, 100);

      // Only create matches for score >= 50
      if (score >= 50) {
        let matchReason = `${contact.first_name} is a ${contact.talent_type}`;
        if (initiative.target_roles?.includes(contact.talent_type)) {
          matchReason += ` which matches the target role for ${initiative.name}`;
        }
        if (contact.research_data?.summary) {
          matchReason += `. ${contact.research_data.summary.substring(0, 100)}...`;
        }

        const { error: insertError } = await supabase
          .from("talent_initiative_matches")
          .insert({
            initiative_id: initiativeId,
            contact_id: contact.id,
            user_id: user.id,
            match_score: score,
            match_reason: matchReason,
            proposed_role: contact.talent_type,
            status: "proposed",
          });

        if (!insertError) {
          matchesCreated++;
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      matchesCreated,
      totalCandidates: unmatchedContacts.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Auto-match failed" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
