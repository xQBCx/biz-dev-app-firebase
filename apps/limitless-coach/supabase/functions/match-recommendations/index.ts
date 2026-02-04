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
    const { user_id, match_type, limit = 10, filters } = await req.json();
    
    if (!user_id || !match_type) {
      return new Response(
        JSON.stringify({ error: "user_id and match_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Finding ${match_type} matches for user:`, user_id);

    // Get user embedding
    const { data: userEmbedding, error: userError } = await supabase
      .from("user_embeddings")
      .select("embedding_vector, profile_snapshot")
      .eq("user_id", user_id)
      .single();

  if (userError || !userEmbedding?.embedding_vector) {
      console.log("No user embedding found, returning default recommendations");
      // Return default recommendations without personalization
      const defaultRecs = await getDefaultRecommendationsData(supabase, match_type, limit, filters);
      return new Response(
        JSON.stringify({
          match_type,
          recommendations: defaultRecs.map((item: Record<string, unknown>) => ({
            ...item,
            match_score: 50,
          })),
          personalized: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userVector = userEmbedding.embedding_vector as number[];

    let recommendations: Array<{
      id: string;
      score: number;
      data: Record<string, unknown>;
    }> = [];

    switch (match_type) {
      case "coach": {
        const { data: coachEmbeddings } = await supabase
          .from("coach_embeddings")
          .select("coach_id, embedding_vector, profile_snapshot");

        if (coachEmbeddings) {
          recommendations = coachEmbeddings
            .filter(e => e.embedding_vector)
            .map(embed => ({
              id: embed.coach_id,
              score: cosineSimilarity(userVector, embed.embedding_vector as number[]),
              data: embed.profile_snapshot as Record<string, unknown>,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        }
        break;
      }

      case "gym": {
        let gymQuery = supabase
          .from("gym_locations")
          .select("id, name, city, state, zip_code, amenities, monthly_price_estimate, featured, gym_brands(name)")
          .eq("is_active", true);

        if (filters?.city) {
          gymQuery = gymQuery.ilike("city", `%${filters.city}%`);
        }
        if (filters?.state) {
          gymQuery = gymQuery.eq("state", filters.state);
        }

        const { data: gyms } = await gymQuery;
        const { data: gymEmbeddings } = await supabase
          .from("gym_embeddings")
          .select("gym_location_id, embedding_vector");

        const embeddingMap = new Map(
          (gymEmbeddings || []).map(e => [e.gym_location_id, e.embedding_vector as number[]])
        );

        if (gyms) {
          recommendations = gyms
            .map(gym => {
              const gymVector = embeddingMap.get(gym.id);
              return {
                id: gym.id,
                score: gymVector ? cosineSimilarity(userVector, gymVector) : 0.5,
                data: gym as unknown as Record<string, unknown>,
              };
            })
            .sort((a, b) => {
              // Featured gyms get a boost
              const aFeatured = (a.data as { featured?: boolean }).featured ? 0.2 : 0;
              const bFeatured = (b.data as { featured?: boolean }).featured ? 0.2 : 0;
              return (b.score + bFeatured) - (a.score + aFeatured);
            })
            .slice(0, limit);
        }
        break;
      }

      case "program": {
        const { data: programs } = await supabase
          .from("programs")
          .select("*")
          .eq("is_public", true);

        if (programs) {
          // Simple keyword matching for programs (no embeddings yet)
          const userGoals = (userEmbedding.profile_snapshot as { active_goals?: Array<{ goal_type: string }> })?.active_goals || [];
          const goalTypes = userGoals.map(g => g.goal_type.toLowerCase());

          recommendations = programs
            .map(program => {
              let score = 0.5;
              const programName = (program.name as string).toLowerCase();
              const programDesc = ((program.description as string) || "").toLowerCase();
              
              goalTypes.forEach(goal => {
                if (programName.includes(goal) || programDesc.includes(goal)) {
                  score += 0.2;
                }
              });

              return {
                id: program.id,
                score: Math.min(score, 1),
                data: program as Record<string, unknown>,
              };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        }
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid match_type. Must be coach, gym, or program" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Found ${recommendations.length} ${match_type} recommendations`);

    return new Response(
      JSON.stringify({
        match_type,
        user_id,
        recommendations: recommendations.map(r => ({
          id: r.id,
          match_score: Math.round(r.score * 100),
          ...r.data,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

async function getDefaultRecommendationsData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  matchType: string,
  limit: number,
  filters?: Record<string, string>
): Promise<Record<string, unknown>[]> {
  switch (matchType) {
    case "coach": {
      const { data: coaches } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("status", "approved")
        .order("rating", { ascending: false })
        .limit(limit);
      return (coaches || []) as Record<string, unknown>[];
    }
    case "gym": {
      let query = supabase
        .from("gym_locations")
        .select("*, gym_brands(name)")
        .eq("is_active", true)
        .order("featured", { ascending: false });

      if (filters?.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }

      const { data: gyms } = await query.limit(limit);
      return (gyms || []) as Record<string, unknown>[];
    }
    case "program": {
      const { data: programs } = await supabase
        .from("programs")
        .select("*")
        .eq("is_public", true)
        .limit(limit);
      return (programs || []) as Record<string, unknown>[];
    }
    default:
      return [];
  }
}
