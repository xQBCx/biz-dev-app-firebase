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

    // Fetch all active buyers
    const { data: buyers, error: buyersError } = await supabase
      .from("buyers")
      .select("*")
      .eq("status", "ACTIVE");

    if (buyersError) {
      console.error("Buyers fetch error:", buyersError);
      throw new Error("Failed to fetch buyers");
    }

    if (!buyers || buyers.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        matches: [],
        message: "No active buyers found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Matching ${buyers.length} buyers for:`, property.address);

    // Filter and rank buyers
    const askPrice = property.buyer_ask_price || property.list_price || 0;
    const propertyCounty = property.county?.toLowerCase() || "";

    const scoredBuyers = buyers.map(buyer => {
      let score = 0;
      
      // County match
      const targetCounties = buyer.target_counties?.toLowerCase() || "";
      if (propertyCounty && targetCounties.includes(propertyCounty)) {
        score += 3;
      }
      
      // Price range match
      if (askPrice) {
        const minPrice = buyer.min_price || 0;
        const maxPrice = buyer.max_price || Infinity;
        if (askPrice >= minPrice && askPrice <= maxPrice) {
          score += 3;
        } else if (askPrice <= maxPrice * 1.1) {
          score += 1; // Close to budget
        }
      }
      
      return { ...buyer, matchScore: score };
    });

    // Sort by score and take top matches
    const topBuyers = scoredBuyers
      .filter(b => b.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    if (topBuyers.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        matches: [],
        message: "No matching buyers found based on criteria" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate outreach drafts for top buyers
    const buyerSummary = topBuyers.map(b => 
      `- ${b.name}: Budget $${b.min_price?.toLocaleString() || 0}-$${b.max_price?.toLocaleString() || "unlimited"}, Areas: ${b.target_counties || "Any"}`
    ).join("\n");

    const prompt = `You are a real estate wholesaler pitching a deal to cash buyers. Create a personalized pitch for this property.

Property Details:
- Address: ${property.address}, ${property.city || ""}, ${property.state || ""} ${property.zip || ""}
- County: ${property.county || "Unknown"}
- ARV Estimate: ${property.arv_estimate ? `$${property.arv_estimate.toLocaleString()}` : "TBD"}
- Asking Price: ${askPrice ? `$${askPrice.toLocaleString()}` : "TBD"}
- Projected Spread: ${property.spread ? `$${property.spread.toLocaleString()}` : "TBD"}
- Notes: ${property.notes || "None"}

Top Matched Buyers:
${buyerSummary}

Create a general pitch template that can be personalized. Be professional and highlight the deal opportunity.

Respond in this exact JSON format only:
{
  "pitch_template": "<General pitch message that can be sent to buyers, mention the property highlights and opportunity>",
  "key_selling_points": ["<point 1>", "<point 2>", "<point 3>"]
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
          { role: "system", content: "You are a real estate deal pitcher. Always respond with valid JSON only, no markdown." },
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

    // Parse JSON from response
    let pitch;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        pitch = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      pitch = { pitch_template: "Deal available - contact for details", key_selling_points: [] };
    }

    // Save outreach messages for each matched buyer
    const outreachMessages = topBuyers.map(buyer => ({
      property_id: propertyId,
      buyer_id: buyer.id,
      message_body: `Hi ${buyer.name},\n\n${pitch.pitch_template}`,
      status: "DRAFT",
    }));

    const { error: insertError } = await supabase
      .from("buyer_outreach_messages")
      .insert(outreachMessages);

    if (insertError) {
      console.error("Insert error:", insertError);
      // Continue anyway, return matches
    }

    // Update property status
    await supabase
      .from("properties")
      .update({ status: "BUYER_MARKETING" })
      .eq("id", propertyId);

    return new Response(JSON.stringify({ 
      success: true, 
      matches: topBuyers.map(b => ({
        id: b.id,
        name: b.name,
        email: b.email,
        phone: b.phone,
        matchScore: b.matchScore,
        targetCounties: b.target_counties,
        priceRange: `$${b.min_price?.toLocaleString() || 0} - $${b.max_price?.toLocaleString() || "unlimited"}`,
      })),
      pitch,
      message: `Found ${topBuyers.length} matching buyers` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in match-buyers:", error);
    const message = error instanceof Error ? error.message : "Failed to match buyers";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
