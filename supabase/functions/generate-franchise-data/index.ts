import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { naicsCode, count = 3 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const systemPrompt = `You are a franchise business expert and market analyst. Generate detailed, realistic franchise opportunities with comprehensive SOPs and market insights. Focus on creating diverse, innovative business models across industries.`;

    const userPrompt = naicsCode 
      ? `Generate ${count} innovative franchise opportunities for NAICS code ${naicsCode}. Include:
1. Complete franchise details (name, description, investment ranges, fees)
2. Comprehensive Standard Operating Procedures (SOPs) covering:
   - Daily operations
   - Quality control processes
   - Customer service standards
   - Training protocols
   - Supply chain management
   - Marketing guidelines
3. Territory requirements and growth potential
4. Training and support structure

Format as JSON array with fields: name, brand_name, description, industry, investment_min, investment_max, franchise_fee, royalty_fee_percent, training_duration_weeks, support_provided, territories_available, year_established, franchise_since, sop_content`
      : `Generate ${count} cutting-edge franchise predictions for 1-5 years from now. Focus on:
1. Emerging technologies (AI, robotics, automation)
2. Sustainability and green businesses
3. Remote/hybrid work solutions
4. Health tech and wellness
5. Urban farming and food tech
6. Climate adaptation services

Include complete SOPs for each predicted franchise model.

Format as JSON array with same fields as current franchises plus: future_ready (boolean), predicted_year, innovation_level, market_disruption_potential`;

    console.log("Calling Lovable AI for franchise generation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_franchises",
            description: "Generate franchise data with SOPs",
            parameters: {
              type: "object",
              properties: {
                franchises: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      brand_name: { type: "string" },
                      description: { type: "string" },
                      industry: { type: "string" },
                      investment_min: { type: "number" },
                      investment_max: { type: "number" },
                      franchise_fee: { type: "number" },
                      royalty_fee_percent: { type: "number" },
                      training_duration_weeks: { type: "number" },
                      support_provided: { type: "string" },
                      territories_available: { type: "number" },
                      year_established: { type: "number" },
                      franchise_since: { type: "number" },
                      sop_content: { type: "string" },
                      future_ready: { type: "boolean" },
                      predicted_year: { type: "number" },
                    },
                    required: ["name", "brand_name", "description", "industry", "investment_min", "investment_max", "franchise_fee"]
                  }
                }
              },
              required: ["franchises"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_franchises" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const franchiseData = JSON.parse(toolCall.function.arguments);
    const franchises = franchiseData.franchises;

    console.log(`Generated ${franchises.length} franchises, inserting into database...`);

    // Get a valid user_id (first user in the system for demo purposes)
    const { data: users } = await supabase.from("profiles").select("id").limit(1);
    const userId = users?.[0]?.id;

    if (!userId) {
      throw new Error("No users found in system");
    }

    // Insert franchises into database
    const franchisesToInsert = franchises.map((f: any) => ({
      user_id: userId,
      name: f.name,
      brand_name: f.brand_name,
      description: f.description,
      industry: f.industry,
      investment_min: f.investment_min,
      investment_max: f.investment_max,
      franchise_fee: f.franchise_fee,
      royalty_fee_percent: f.royalty_fee_percent || 5,
      training_provided: true,
      training_duration_weeks: f.training_duration_weeks || 4,
      support_provided: f.support_provided || "Comprehensive training and ongoing support",
      territories_available: f.territories_available || 10,
      year_established: f.year_established || 2020,
      franchise_since: f.franchise_since || 2022,
      status: "active",
      is_featured: Math.random() > 0.7,
      naics_code: naicsCode || null,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("franchises")
      .insert(franchisesToInsert)
      .select();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log(`Successfully inserted ${inserted.length} franchises`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: inserted.length,
        franchises: inserted 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in generate-franchise-data:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
