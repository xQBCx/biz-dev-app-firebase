import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, worksheetId, extractedData } = await req.json();

    if (!projectId || !worksheetId) {
      return new Response(
        JSON.stringify({ error: "Project ID and worksheet ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch assemblies and cost items
    const { data: assemblies } = await supabase
      .from("assemblies")
      .select("*")
      .eq("is_template", true);

    const { data: costItems } = await supabase
      .from("cost_items")
      .select("*");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // System prompt for estimation
    const systemPrompt = `You are an expert construction estimator with deep knowledge of:
- CSI divisions and cost breakdowns
- Material quantities and waste factors
- Labor rates and productivity
- Equipment costs and overhead
- Regional pricing variations

Your task is to convert extracted plan quantities into detailed cost estimates.`;

    const userPrompt = `Generate a detailed construction estimate from this data:

Extracted Quantities:
${JSON.stringify(extractedData, null, 2)}

Available Assemblies:
${JSON.stringify(assemblies?.slice(0, 5), null, 2)}

Available Cost Items:
${JSON.stringify(costItems?.slice(0, 20), null, 2)}

For each quantity, identify:
1. Matching assembly or cost item
2. Apply appropriate waste factor
3. Break down into material + labor + equipment
4. Assign CSI division
5. Calculate extended price

Return structured bid line items ready for insertion.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
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
            name: "generate_bid_items",
            description: "Generate bid line items from quantities",
            parameters: {
              type: "object",
              properties: {
                lineItems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      quantity: { type: "number" },
                      unit: { type: "string" },
                      unitPrice: { type: "number" },
                      extendedPrice: { type: "number" },
                      costType: { type: "string", enum: ["material", "labor", "subcontractor", "equipment", "overhead"] },
                      csiDivision: { type: "string" },
                      notes: { type: "string" }
                    },
                    required: ["description", "quantity", "unit", "unitPrice", "extendedPrice", "costType"]
                  }
                }
              },
              required: ["lineItems"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_bid_items" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    let lineItems = [];
    if (toolCall) {
      const parsed = JSON.parse(toolCall.function.arguments);
      lineItems = parsed.lineItems;
    }

    // Insert line items into database
    const itemsToInsert = lineItems.map((item: any, index: number) => ({
      worksheet_id: worksheetId,
      cost_type: item.costType,
      csi_division: item.csiDivision,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_price: item.unitPrice,
      extended_price: item.extendedPrice,
      sort_order: index,
      notes: item.notes
    }));

    const { data: insertedItems, error: insertError } = await supabase
      .from("bid_line_items")
      .insert(itemsToInsert)
      .select();

    if (insertError) throw insertError;

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.extendedPrice, 0);

    // Update worksheet totals
    await supabase
      .from("estimate_worksheets")
      .update({ subtotal })
      .eq("id", worksheetId);

    return new Response(
      JSON.stringify({
        success: true,
        lineItemsCreated: insertedItems?.length || 0,
        subtotal,
        lineItems: insertedItems
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in auto-estimate:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
