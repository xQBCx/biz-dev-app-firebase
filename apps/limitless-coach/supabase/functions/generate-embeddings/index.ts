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
    const { entity_type, entity_id } = await req.json();
    
    if (!entity_type || !entity_id) {
      return new Response(
        JSON.stringify({ error: "entity_type and entity_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let profileData: Record<string, unknown> = {};
    let embeddingTable = "";
    let idColumn = "";

    // Fetch entity data based on type
    switch (entity_type) {
      case "user": {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", entity_id)
          .single();
        
        const { data: goals } = await supabase
          .from("health_goals")
          .select("title, goal_type, body_area")
          .eq("user_id", entity_id)
          .eq("status", "active");

        profileData = {
          ...profile,
          active_goals: goals || [],
        };
        embeddingTable = "user_embeddings";
        idColumn = "user_id";
        break;
      }
      case "coach": {
        const { data: coach } = await supabase
          .from("coach_profiles")
          .select("*")
          .eq("id", entity_id)
          .single();
        
        profileData = coach || {};
        embeddingTable = "coach_embeddings";
        idColumn = "coach_id";
        break;
      }
      case "gym": {
        const { data: gym } = await supabase
          .from("gym_locations")
          .select("*, gym_brands(name, affiliate_program_type)")
          .eq("id", entity_id)
          .single();
        
        profileData = gym || {};
        embeddingTable = "gym_embeddings";
        idColumn = "gym_location_id";
        break;
      }
      case "partner": {
        const { data: business } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", entity_id)
          .single();
        
        profileData = business || {};
        embeddingTable = "partner_embeddings";
        idColumn = "business_id";
        break;
      }
      default:
        return new Response(
          JSON.stringify({ error: "Invalid entity_type. Must be user, coach, gym, or partner" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Generate text description for embedding
    const profileDescription = generateDescription(entity_type, profileData);
    console.log(`Generating embedding for ${entity_type}:`, entity_id);
    console.log("Profile description:", profileDescription);

    // Call Lovable AI to generate embedding representation
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an embedding generator. Given a profile description, output a JSON array of 32 floating point numbers between -1 and 1 that represent semantic features of this entity. Focus on:
- For users: fitness goals, experience level, preferences, location
- For coaches: specialties, experience, training style, certifications
- For gyms: amenities, price range, atmosphere, location
- For partners: services, target market, capacity

Output ONLY a valid JSON array of exactly 32 numbers, nothing else.`,
          },
          {
            role: "user",
            content: profileDescription,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const embeddingText = aiData.choices?.[0]?.message?.content || "[]";
    
    // Parse the embedding vector
    let embeddingVector: number[];
    try {
      embeddingVector = JSON.parse(embeddingText.replace(/```json\n?|\n?```/g, "").trim());
      if (!Array.isArray(embeddingVector) || embeddingVector.length !== 32) {
        throw new Error("Invalid embedding format");
      }
    } catch (parseError) {
      console.error("Failed to parse embedding:", embeddingText);
      // Generate a fallback random embedding
      embeddingVector = Array.from({ length: 32 }, () => Math.random() * 2 - 1);
    }

    // Upsert the embedding
    const { error: upsertError } = await supabase
      .from(embeddingTable)
      .upsert({
        [idColumn]: entity_id,
        embedding_vector: embeddingVector,
        profile_snapshot: profileData,
        generated_at: new Date().toISOString(),
        version: 1,
      }, {
        onConflict: idColumn,
      });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      throw upsertError;
    }

    console.log(`Successfully generated embedding for ${entity_type}:`, entity_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        entity_type, 
        entity_id,
        embedding_dimensions: embeddingVector.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateDescription(entityType: string, data: Record<string, unknown>): string {
  switch (entityType) {
    case "user":
      const goals = (data.active_goals as Array<{ title: string; goal_type: string }>) || [];
      return `User profile:
Name: ${data.full_name || "Unknown"}
Location: ${data.city || "Unknown"}
Fitness Goals: ${goals.map(g => g.title).join(", ") || "Not specified"}
Goal Types: ${[...new Set(goals.map(g => g.goal_type))].join(", ") || "General fitness"}
Experience: ${data.experience_level || "Not specified"}
Preferences: ${data.preferences || "Not specified"}`;

    case "coach":
      return `Coach profile:
Name: ${data.full_name || "Unknown"}
Specialties: ${(data.specialties as string[])?.join(", ") || "General fitness"}
Certifications: ${data.certifications || "Not specified"}
Experience: ${data.experience || "Not specified"}
Location: ${data.location || "Unknown"}
Bio: ${data.bio || "Not provided"}
Rating: ${data.rating || 5}/5
Session Price: $${data.session_price || 75}`;

    case "gym":
      const brand = data.gym_brands as { name: string } | null;
      return `Gym location:
Name: ${data.name || "Unknown"}
Brand: ${brand?.name || "Independent"}
Location: ${data.city}, ${data.state} ${data.zip_code}
Address: ${data.address || "Not provided"}
Amenities: ${(data.amenities as string[])?.join(", ") || "Standard equipment"}
Monthly Price: $${data.monthly_price_estimate || "Unknown"}
Personal Training: ${data.has_personal_training ? "Available" : "Not available"}
Featured: ${data.featured ? "Yes" : "No"}`;

    case "partner":
      return `Business partner:
Name: ${data.business_name || "Unknown"}
Location: ${data.city}, ${data.state}
Services: Car detailing and related services
Contact: ${data.business_email || "Not provided"}`;

    default:
      return JSON.stringify(data);
  }
}
