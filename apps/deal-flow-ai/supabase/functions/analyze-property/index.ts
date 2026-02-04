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
    const { propertyId } = await req.json();
    
    if (!propertyId) {
      return new Response(JSON.stringify({ error: "propertyId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch the property
    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (fetchError || !property) {
      console.error("Property fetch error:", fetchError);
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Analyzing property:", property.address);

    const prompt = `You are a real estate deal analyzer for wholesaling operations. Analyze this property and provide estimates.

Property Details:
- Address: ${property.address}, ${property.city || ""}, ${property.state || ""} ${property.zip || ""}
- County: ${property.county || "Unknown"}
- List Price: ${property.list_price ? `$${property.list_price}` : "Not provided"}
- Notes: ${property.notes || "None"}

Based on the information provided, estimate the following:
1. ARV (After Repair Value) - If no list price, estimate based on area/notes
2. Seller offer price (target 60% of ARV for motivated sellers)
3. Buyer ask price (target 70% of ARV)
4. Motivation score (1-10, based on keywords like "as-is", "fixer", "quick sale", "motivated")
5. Deal score (1-10, based on potential spread and viability)

If list_price is provided, use it as a baseline for ARV unless notes suggest otherwise.

Respond in this exact JSON format only:
{
  "arv_estimate": <number>,
  "seller_offer_price": <number>,
  "buyer_ask_price": <number>,
  "motivation_score": <number 1-10>,
  "deal_score": <number 1-10>,
  "spread": <number>,
  "analysis_notes": "<brief explanation>"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a real estate deal analyzer. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    console.log("AI response:", content);

    // Parse JSON from response (handle potential markdown wrapping)
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(JSON.stringify({ error: "Failed to parse AI analysis" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update the property with analysis
    const { error: updateError } = await supabase
      .from("properties")
      .update({
        arv_estimate: analysis.arv_estimate,
        seller_offer_price: analysis.seller_offer_price,
        buyer_ask_price: analysis.buyer_ask_price,
        motivation_score: analysis.motivation_score,
        deal_score: analysis.deal_score,
        spread: analysis.spread,
        status: "ANALYZED",
      })
      .eq("id", propertyId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to update property");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis,
      message: "Property analyzed successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in analyze-property:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
