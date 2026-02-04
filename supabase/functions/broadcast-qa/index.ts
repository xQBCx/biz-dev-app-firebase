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
    const authHeader = req.headers.get('authorization');
    const { segmentId, question } = await req.json();
    
    if (!segmentId || !question) {
      return new Response(JSON.stringify({ error: "segmentId and question are required" }), {
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

    // Get user ID from auth
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Fetch the segment
    const { data: segment, error: segmentError } = await supabase
      .from('broadcast_segments')
      .select('*')
      .eq('id', segmentId)
      .single();

    if (segmentError || !segment) {
      return new Response(JSON.stringify({ error: "Segment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing Q&A for segment: ${segment.title}`);

    // Build context from segment
    const context = `
BROADCAST SEGMENT: ${segment.title}

SUMMARY:
${segment.summary || 'No summary available'}

FULL CONTENT:
${segment.content || 'No content available'}

SECTOR: ${segment.sector || 'General'}
TAGS: ${(segment.tags || []).join(', ')}

ADDITIONAL DATA:
${segment.source_data ? JSON.stringify(segment.source_data, null, 2) : 'None'}
`;

    const systemPrompt = `You are an AI assistant for UPN Broadcast, answering questions about news segments.

IMPORTANT RULES:
1. ONLY answer based on the provided segment content
2. If the answer isn't in the segment, say "This information isn't covered in this segment"
3. Cite the specific part of the segment when answering
4. Be concise and professional
5. If asked about implications or analysis, refer to any risk/opportunity notes in the segment data

SEGMENT CONTEXT:
${context}`;

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
          { role: "user", content: question }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again" }), {
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
    const answer = data.choices?.[0]?.message?.content || "Unable to generate answer";

    // Log the interaction for behavioral tracking
    if (userId) {
      await supabase.from('broadcast_interactions').insert({
        user_id: userId,
        segment_id: segmentId,
        interaction_type: 'qa',
        question_text: question,
        answer_text: answer,
        answer_sources: { segment_id: segmentId, segment_title: segment.title },
      });
    }

    return new Response(JSON.stringify({ 
      answer,
      sources: [{
        type: 'broadcast_segment',
        id: segment.id,
        title: segment.title,
      }]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Broadcast Q&A error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});