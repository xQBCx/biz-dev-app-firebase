import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Available models via Lovable AI Gateway
const AVAILABLE_MODELS = {
  "gemini-flash": "google/gemini-2.5-flash",
  "gemini-pro": "google/gemini-2.5-pro",
  "gpt-5": "openai/gpt-5",
  "gpt-5-mini": "openai/gpt-5-mini",
  "gpt-5-nano": "openai/gpt-5-nano",
} as const;

type ModelKey = keyof typeof AVAILABLE_MODELS;

interface AnalysisRequest {
  billId: string;
  analysisType: "extraction" | "optimization" | "comparison" | "forecast";
  models?: ModelKey[];
  billContent?: string;
  extractedData?: Record<string, unknown>;
}

async function callModel(
  modelKey: ModelKey,
  systemPrompt: string,
  userPrompt: string,
  apiKey: string
): Promise<{ result: unknown; tokens: number; timeMs: number }> {
  const startTime = Date.now();
  const modelName = AVAILABLE_MODELS[modelKey];

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_bill",
              description: "Analyze bill data and return structured insights",
              parameters: {
                type: "object",
                properties: {
                  vendor_name: { type: "string", description: "Name of the vendor/provider" },
                  bill_type: { type: "string", enum: ["utility", "telecom", "saas", "materials", "ingredients", "construction", "other"] },
                  amount: { type: "number", description: "Total bill amount" },
                  currency: { type: "string", description: "Currency code" },
                  billing_period: { type: "string", description: "Billing period (e.g., 'Jan 2024')" },
                  line_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        quantity: { type: "number" },
                        unit_price: { type: "number" },
                        total: { type: "number" }
                      }
                    }
                  },
                  optimization_opportunities: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["switch_provider", "reduce_usage", "negotiate", "consolidate", "eliminate"] },
                        description: { type: "string" },
                        estimated_savings: { type: "number" },
                        confidence: { type: "number" },
                        action_steps: { type: "array", items: { type: "string" } }
                      }
                    }
                  },
                  risk_factors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        description: { type: "string" },
                        severity: { type: "string", enum: ["low", "medium", "high"] }
                      }
                    }
                  },
                  industry_benchmark: {
                    type: "object",
                    properties: {
                      average_cost: { type: "number" },
                      percentile: { type: "number" },
                      comparison_note: { type: "string" }
                    }
                  },
                  summary: { type: "string", description: "Brief analysis summary" },
                  confidence_score: { type: "number", description: "Overall confidence 0-1" }
                },
                required: ["summary", "confidence_score"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_bill" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Model ${modelKey} error:`, response.status, errorText);
      throw new Error(`Model ${modelKey} failed: ${response.status}`);
    }

    const data = await response.json();
    const timeMs = Date.now() - startTime;
    const tokens = data.usage?.total_tokens || 0;

    // Extract function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      return {
        result: JSON.parse(toolCall.function.arguments),
        tokens,
        timeMs,
      };
    }

    // Fallback to content
    return {
      result: { summary: data.choices?.[0]?.message?.content || "Analysis complete", confidence_score: 0.5 },
      tokens,
      timeMs,
    };
  } catch (error) {
    console.error(`Error calling ${modelKey}:`, error);
    return {
      result: { error: String(error), summary: `${modelKey} analysis failed`, confidence_score: 0 },
      tokens: 0,
      timeMs: Date.now() - startTime,
    };
  }
}

function getSystemPrompt(analysisType: string): string {
  const basePrompt = `You are an expert financial analyst specializing in business expense optimization. 
You analyze bills and invoices to extract data, identify savings opportunities, and provide actionable recommendations.
Be precise with numbers and provide specific, actionable advice.`;

  switch (analysisType) {
    case "extraction":
      return `${basePrompt}
Focus on accurately extracting all data from the bill including vendor details, line items, amounts, and dates.`;
    case "optimization":
      return `${basePrompt}
Focus on identifying cost reduction opportunities, comparing to industry benchmarks, and suggesting specific actions to reduce expenses.`;
    case "comparison":
      return `${basePrompt}
Compare this bill to similar services in the market. Identify if the company is overpaying and suggest alternatives.`;
    case "forecast":
      return `${basePrompt}
Based on historical patterns in this bill, forecast future costs and identify trends. Suggest preemptive actions.`;
    default:
      return basePrompt;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { billId, analysisType, models = ["gemini-flash"], billContent, extractedData } = await req.json() as AnalysisRequest;

    if (!billId) {
      throw new Error("billId is required");
    }

    // Fetch bill data if not provided
    let billData = extractedData;
    if (!billData) {
      const { data: bill, error } = await supabase
        .from("company_bills")
        .select("*")
        .eq("id", billId)
        .single();

      if (error) throw error;
      billData = {
        name: bill.bill_name,
        type: bill.bill_type,
        vendor: bill.vendor_name,
        amount: bill.amount,
        date: bill.bill_date,
        extracted: bill.extracted_data,
      };
    }

    const systemPrompt = getSystemPrompt(analysisType);
    const userPrompt = `Analyze the following bill data:\n\n${billContent || JSON.stringify(billData, null, 2)}`;

    // Run analysis with selected models
    const analysisPromises = models.map(async (modelKey) => {
      const { result, tokens, timeMs } = await callModel(modelKey, systemPrompt, userPrompt, LOVABLE_API_KEY);

      // Store analysis in database
      const { error: insertError } = await supabase.from("bill_analyses").insert({
        bill_id: billId,
        model_used: AVAILABLE_MODELS[modelKey],
        analysis_type: analysisType,
        analysis_result: result,
        confidence_score: (result as any)?.confidence_score || 0,
        tokens_used: tokens,
        processing_time_ms: timeMs,
        cost_estimate: estimateCost(modelKey, tokens),
      });

      if (insertError) console.error("Error storing analysis:", insertError);

      // Track model usage
      await supabase.from("ai_model_usage").insert({
        model_provider: modelKey.startsWith("gpt") ? "openai" : "google",
        model_name: AVAILABLE_MODELS[modelKey],
        tokens_input: Math.floor(tokens * 0.7),
        tokens_output: Math.floor(tokens * 0.3),
        total_cost: estimateCost(modelKey, tokens),
      });

      return { model: modelKey, result, tokens, timeMs };
    });

    const results = await Promise.all(analysisPromises);

    // If multiple models, create comparison
    if (models.length > 1) {
      const comparison = compareResults(results);
      await supabase.from("bill_model_comparisons").insert({
        bill_id: billId,
        models_used: models.map(m => AVAILABLE_MODELS[m]),
        comparison_result: comparison,
        best_model: comparison.best_model,
      });
    }

    // Generate recommendations from analysis
    const bestResult = results.reduce((best, curr) => 
      ((curr.result as any)?.confidence_score || 0) > ((best.result as any)?.confidence_score || 0) ? curr : best
    );

    const opportunities = (bestResult.result as any)?.optimization_opportunities || [];
    for (const opp of opportunities.slice(0, 3)) {
      // Get auth user from request
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        if (user) {
          await supabase.from("bill_recommendations").insert({
            user_id: user.id,
            bill_id: billId,
            recommendation_type: opp.type,
            current_cost: billData?.amount || (billData as any)?.amount,
            potential_savings: opp.estimated_savings,
            confidence_score: opp.confidence,
            reasoning: opp.description,
            action_steps: opp.action_steps,
          });
        }
      }
    }

    // Update bill status
    await supabase
      .from("company_bills")
      .update({ status: "analyzed", extracted_data: billData })
      .eq("id", billId);

    return new Response(
      JSON.stringify({
        success: true,
        analyses: results,
        recommendations: opportunities,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze-bill error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function estimateCost(model: ModelKey, tokens: number): number {
  // Rough cost estimates per 1K tokens
  const costs: Record<ModelKey, number> = {
    "gemini-flash": 0.0001,
    "gemini-pro": 0.001,
    "gpt-5": 0.01,
    "gpt-5-mini": 0.001,
    "gpt-5-nano": 0.0001,
  };
  return (tokens / 1000) * (costs[model] || 0.001);
}

function compareResults(results: { model: string; result: unknown }[]): {
  best_model: string;
  consensus: string[];
  disagreements: string[];
  confidence_spread: number;
} {
  const confidences = results.map(r => ({
    model: r.model,
    score: (r.result as any)?.confidence_score || 0,
  }));

  const bestModel = confidences.reduce((best, curr) => 
    curr.score > best.score ? curr : best
  ).model;

  const avgConfidence = confidences.reduce((sum, c) => sum + c.score, 0) / confidences.length;
  const confidenceSpread = Math.max(...confidences.map(c => c.score)) - Math.min(...confidences.map(c => c.score));

  // Find consensus on optimization opportunities
  const allOpportunities = results.flatMap(r => 
    ((r.result as any)?.optimization_opportunities || []).map((o: any) => o.type)
  );
  const opportunityCounts = allOpportunities.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const consensus = Object.entries(opportunityCounts)
    .filter(([_, count]) => (count as number) >= results.length / 2)
    .map(([type]) => type);

  const disagreements = Object.entries(opportunityCounts)
    .filter(([_, count]) => (count as number) === 1)
    .map(([type]) => type);

  return {
    best_model: bestModel,
    consensus,
    disagreements,
    confidence_spread: confidenceSpread,
  };
}
