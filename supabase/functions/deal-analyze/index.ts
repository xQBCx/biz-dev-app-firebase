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
    const { dealRoomId } = await req.json();

    if (!dealRoomId) {
      return new Response(JSON.stringify({ error: "dealRoomId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch deal room details
    const { data: dealRoom, error: dealRoomError } = await supabase
      .from("deal_rooms")
      .select("*")
      .eq("id", dealRoomId)
      .single();

    if (dealRoomError || !dealRoom) {
      console.error("Deal room fetch error:", dealRoomError);
      return new Response(JSON.stringify({ error: "Deal room not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch participants
    const { data: participants, error: participantsError } = await supabase
      .from("deal_room_participants")
      .select("*")
      .eq("deal_room_id", dealRoomId);

    if (participantsError) {
      console.error("Participants fetch error:", participantsError);
    }

    // Fetch contributions
    const { data: contributions, error: contributionsError } = await supabase
      .from("deal_contributions")
      .select("*")
      .eq("deal_room_id", dealRoomId);

    if (contributionsError) {
      console.error("Contributions fetch error:", contributionsError);
    }

    // Build comprehensive prompt for AI analysis
    const prompt = `You are an expert deal structure analyst and fairness mediator. Analyze the following deal room data and provide comprehensive insights.

## Deal Room Details
- **Name**: ${dealRoom.deal_name}
- **Category**: ${dealRoom.category}
- **Expected Size**: $${dealRoom.expected_deal_size_min?.toLocaleString() || 'TBD'} - $${dealRoom.expected_deal_size_max?.toLocaleString() || 'TBD'}
- **Time Horizon**: ${dealRoom.time_horizon}
- **Description**: ${dealRoom.description || 'Not provided'}

## Participants (${participants?.length || 0} total)
${participants?.map((p: any, i: number) => `${i + 1}. ${p.entity_name || p.individual_name || 'Unnamed'} (${p.participant_type}) - Status: ${p.status}`).join('\n') || 'No participants yet'}

## Contributions Submitted (${contributions?.length || 0} total)
${contributions?.map((c: any, i: number) => `
### Contribution ${i + 1}
- **Time**: ${c.time_contribution_hours || 0} hours/month (${c.time_contribution_percent || 0}%)
- **Technical**: ${c.technical_contribution || 'None specified'}
- **Capital**: $${c.capital_contribution?.toLocaleString() || 0}
- **Network**: ${c.network_contribution || 'None specified'}
- **Risk Exposure**: ${c.risk_exposure || 'Not assessed'}
- **Pre-existing IP**: ${c.preexisting_ip_involved ? 'Yes - ' + (c.preexisting_ip_description || 'Details not provided') : 'No'}
- **Expected Role**: ${c.expected_role || 'Not specified'}
- **Desired Compensation**: ${c.desired_compensations?.join(', ') || 'Not specified'}
`).join('\n') || 'No contributions submitted yet'}

---

Please provide a JSON response with the following structure:
{
  "contribution_map": {
    "summary": "Brief overview of who is contributing what",
    "overlaps": ["List of contribution overlaps"],
    "gaps": ["List of missing or underrepresented contributions"],
    "participant_breakdown": [{"name": "...", "primary_contribution": "...", "contribution_weight": 0.0-1.0}]
  },
  "risk_analysis": {
    "execution_risk": {"holder": "Who carries it", "level": "low/medium/high", "details": "..."},
    "reputational_risk": {"holder": "...", "level": "...", "details": "..."},
    "capital_risk": {"holder": "...", "level": "...", "details": "..."},
    "ip_risk": {"holder": "...", "level": "...", "details": "..."}
  },
  "fairness_score": {
    "overall": 0-100,
    "breakdown": {
      "contribution_balance": 0-100,
      "risk_reward_alignment": 0-100,
      "compensation_fairness": 0-100
    },
    "flags": ["List of imbalances or concerns"]
  },
  "precedent_analysis": {
    "comparable_deals": ["Similar deal structure examples"],
    "industry_standards": ["Relevant industry norms"],
    "recommendations": ["Suggested adjustments based on precedent"]
  },
  "suggested_structures": [
    {
      "name": "Conservative Structure",
      "description": "...",
      "allocation": [{"participant": "...", "equity_percent": 0, "revenue_share_percent": 0, "upfront_payment": 0}],
      "pros": ["..."],
      "cons": ["..."]
    },
    {
      "name": "Growth-Focused Structure",
      "description": "...",
      "allocation": [...],
      "pros": [...],
      "cons": [...]
    }
  ],
  "executive_summary": "2-3 paragraph summary of the deal state and key recommendations"
}`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert deal structure analyst. Respond ONLY with valid JSON, no markdown or explanation." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const analysisContent = aiData.choices?.[0]?.message?.content;

    if (!analysisContent) {
      console.error("No content in AI response:", aiData);
      return new Response(JSON.stringify({ error: "AI returned empty response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse AI response
    let analysisResult;
    try {
      // Strip markdown code blocks if present
      const cleanContent = analysisContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, analysisContent);
      return new Response(JSON.stringify({ error: "Failed to parse AI analysis", raw: analysisContent }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store analysis in database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("deal_ai_analyses")
      .insert({
        deal_room_id: dealRoomId,
        analysis_type: "comprehensive",
        contribution_map: analysisResult.contribution_map,
        risk_analysis: analysisResult.risk_analysis,
        precedent_modeling: analysisResult.precedent_analysis,
        fairness_score: analysisResult.fairness_score?.overall || null,
        fairness_breakdown: analysisResult.fairness_score,
        suggested_structures: analysisResult.suggested_structures,
        executive_summary: analysisResult.executive_summary,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Failed to save analysis:", saveError);
      // Continue anyway, return the analysis
    }

    console.log("Deal analysis completed successfully for:", dealRoomId);

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysisResult,
      analysisId: savedAnalysis?.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Deal analyze error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
