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
    const { itemId } = await req.json();

    if (!itemId) {
      return new Response(
        JSON.stringify({ error: 'itemId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the knowledge item
    const { data: item, error: itemError } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      throw new Error('Knowledge item not found');
    }

    // Update status to processing
    await supabase
      .from('knowledge_items')
      .update({ processing_status: 'processing' })
      .eq('id', itemId);

    // Prepare content for AI analysis
    let contentToAnalyze = item.content || '';
    
    // If it's a URL, we'd fetch content (simplified for now)
    if (item.source_url && !contentToAnalyze) {
      contentToAnalyze = `URL: ${item.source_url}\nTitle: ${item.title}`;
    }

    // If it's a file, we'd extract content (simplified for now)
    if (item.file_path && !contentToAnalyze) {
      contentToAnalyze = `File: ${item.title}\nType: ${item.file_type || item.source_type}`;
    }

    // Call Lovable AI for analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a knowledge management AI. Analyze the provided content and extract:
1. A concise summary (2-3 sentences)
2. Key points (3-5 bullet points)
3. Relevant tags (5-10 single words)
4. Categories (2-3 broad topic areas)
5. Named entities (people, companies, concepts mentioned)

Respond with a JSON object in this exact format:
{
  "summary": "string",
  "key_points": ["point1", "point2", "point3"],
  "tags": ["tag1", "tag2", "tag3"],
  "categories": ["category1", "category2"],
  "entities": [{"name": "entity name", "type": "person|company|concept|location"}]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this content:\n\nTitle: ${item.title}\n\n${contentToAnalyze}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      // Handle rate limits
      if (aiResponse.status === 429) {
        await supabase
          .from('knowledge_items')
          .update({ processing_status: 'pending' })
          .eq('id', itemId);
        
        return new Response(
          JSON.stringify({ error: 'Rate limited, will retry later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || '';

    console.log('AI response:', aiContent);

    // Parse the AI response
    let analysis;
    try {
      // Extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      analysis = {
        summary: item.title,
        key_points: [],
        tags: [item.source_type],
        categories: ['Uncategorized'],
        entities: []
      };
    }

    // Update the knowledge item with AI analysis
    const { error: updateError } = await supabase
      .from('knowledge_items')
      .update({
        summary: analysis.summary || null,
        key_points: analysis.key_points || [],
        ai_tags: analysis.tags || [],
        ai_categories: analysis.categories || [],
        entities: analysis.entities || [],
        processing_status: 'completed',
        // Set initial review schedule (tomorrow)
        next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', itemId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully processed knowledge item: ${itemId}`);

    return new Response(
      JSON.stringify({ success: true, itemId, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing knowledge item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Try to update status to failed
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { itemId } = await req.json().catch(() => ({ itemId: null }));
      if (itemId) {
        await supabase
          .from('knowledge_items')
          .update({ processing_status: 'failed' })
          .eq('id', itemId);
      }
    } catch {}

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});