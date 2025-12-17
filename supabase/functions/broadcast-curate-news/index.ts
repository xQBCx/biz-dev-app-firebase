import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sector, topic, limit = 5 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Curating news for sector: ${sector}, topic: ${topic}`);

    // Build prompt for news curation
    const systemPrompt = `You are a business news curator for a professional network called UPN (Universal Professional Network). 
Your job is to generate compelling, accurate business news segments that would appeal to professionals.

Focus areas based on xBUILDERx sectors:
- Housing: residential construction, real estate trends, housing policy
- Transportation: infrastructure, logistics, EV, autonomous vehicles
- Energy: renewable energy, grid modernization, utilities
- Utilities: water, telecommunications, smart city infrastructure

Generate news that is:
1. Professional and factual in tone
2. Relevant to business decision-makers
3. Forward-looking and opportunity-focused
4. Includes quantifiable metrics where possible`;

    const userPrompt = `Generate ${limit} business news segments for the ${sector || 'general business'} sector${topic ? ` focusing on: ${topic}` : ''}.

For each segment, provide:
1. A compelling headline (max 100 chars)
2. A brief summary (2-3 sentences)
3. Full content (2-3 paragraphs)
4. Key tags/topics
5. Risk and opportunity implications

Return as JSON array with structure:
[{
  "title": "headline",
  "summary": "brief summary",
  "content": "full content",
  "tags": ["tag1", "tag2"],
  "sector": "${sector || 'general'}",
  "risk_implications": "brief risk note",
  "opportunity_implications": "brief opportunity note"
}]`;

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse the JSON response
    let newsSegments = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        newsSegments = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      newsSegments = [];
    }

    // Insert segments into database
    const insertedSegments = [];
    for (const segment of newsSegments) {
      const { data: inserted, error } = await supabase
        .from('broadcast_segments')
        .insert({
          segment_type: 'news',
          title: segment.title,
          summary: segment.summary,
          content: segment.content,
          sector: segment.sector || sector,
          tags: segment.tags || [],
          source_data: {
            risk_implications: segment.risk_implications,
            opportunity_implications: segment.opportunity_implications,
            generated_at: new Date().toISOString(),
          },
          video_status: 'text_only', // No video without Synthesia
          published: true,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting segment:", error);
      } else {
        insertedSegments.push(inserted);
      }
    }

    console.log(`Created ${insertedSegments.length} news segments`);

    return new Response(JSON.stringify({ 
      success: true, 
      segments: insertedSegments,
      count: insertedSegments.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Broadcast curate error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});