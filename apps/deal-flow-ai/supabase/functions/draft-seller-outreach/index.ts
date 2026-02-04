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

    console.log("Drafting outreach for:", property.address);

    const prompt = `You are a professional real estate investor reaching out to motivated sellers. Create 3 outreach templates for this property.

Property Details:
- Address: ${property.address}, ${property.city || ""}, ${property.state || ""} ${property.zip || ""}
- List Price: ${property.list_price ? `$${property.list_price.toLocaleString()}` : "Not listed"}
- Our Offer: ${property.seller_offer_price ? `$${property.seller_offer_price.toLocaleString()}` : "TBD"}
- Seller Name: ${property.seller_name || "Property Owner"}
- Notes: ${property.notes || "None"}

Create professional, compliant, and non-pushy outreach messages. Be respectful and emphasize flexibility and quick closing.

Respond in this exact JSON format only:
{
  "sms": "<SMS message under 160 characters, direct and respectful>",
  "email": "<Full email with subject line marked as [SUBJECT: ...] at the start, professional tone, 2-3 paragraphs>",
  "call_script": "<Brief call script with introduction, value proposition, and closing question>"
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
          { role: "system", content: "You are a real estate communication specialist. Always respond with valid JSON only, no markdown." },
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
    let drafts;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        drafts = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save drafts to seller_outreach_messages
    const messages = [
      { property_id: propertyId, channel: "SMS", message_body: drafts.sms, status: "DRAFT" },
      { property_id: propertyId, channel: "EMAIL", message_body: drafts.email, status: "DRAFT" },
      { property_id: propertyId, channel: "CALL_SCRIPT", message_body: drafts.call_script, status: "DRAFT" },
    ];

    const { error: insertError } = await supabase
      .from("seller_outreach_messages")
      .insert(messages);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save outreach drafts");
    }

    // Update property status
    await supabase
      .from("properties")
      .update({ status: "SELLER_OUTREACH" })
      .eq("id", propertyId);

    return new Response(JSON.stringify({ 
      success: true, 
      drafts,
      message: "Outreach drafts created successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in draft-seller-outreach:", error);
    const message = error instanceof Error ? error.message : "Failed to generate drafts";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
