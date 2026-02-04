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
    const { question, itemIds } = await req.json();

    if (!question) {
      return new Response(
        JSON.stringify({ error: 'question is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get knowledge items to use as context
    let query = supabase
      .from('knowledge_items')
      .select('id, title, summary, content, ai_tags, key_points')
      .eq('processing_status', 'completed');

    if (itemIds && itemIds.length > 0) {
      query = query.in('id', itemIds);
    }

    const { data: items, error: itemsError } = await query.limit(20);

    if (itemsError) {
      throw itemsError;
    }

    // Build context from knowledge items
    const context = items.map(item => {
      let itemContext = `### ${item.title}\n`;
      if (item.summary) itemContext += `Summary: ${item.summary}\n`;
      if (item.key_points && item.key_points.length > 0) {
        itemContext += `Key Points:\n${item.key_points.map((p: any) => `- ${typeof p === 'string' ? p : p.text || JSON.stringify(p)}`).join('\n')}\n`;
      }
      if (item.content) {
        itemContext += `Content: ${item.content.substring(0, 1000)}...\n`;
      }
      return itemContext;
    }).join('\n---\n');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a helpful knowledge assistant. You have access to the user's knowledge base containing articles, notes, and saved content. Answer questions based on this knowledge.

If the answer is found in the knowledge base, cite which source(s) you used.
If the question cannot be answered from the knowledge base, say so and offer to help with general knowledge.

Knowledge Base:
${context}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limited, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error: unknown) {
    console.error('Error in knowledge chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});