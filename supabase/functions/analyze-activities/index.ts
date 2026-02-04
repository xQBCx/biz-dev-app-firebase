import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from auth token
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Fetch recent activities
    const { data: activities, error: fetchError } = await supabaseClient
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(100);

    if (fetchError) throw fetchError;

    // Group activities by type and find patterns
    const activityPatterns: { [key: string]: any[] } = {};
    activities?.forEach((activity) => {
      const key = `${activity.activity_type}-${activity.title}`;
      if (!activityPatterns[key]) {
        activityPatterns[key] = [];
      }
      activityPatterns[key].push(activity);
    });

    // Identify recurring patterns (appeared 3+ times)
    const recurringPatterns = Object.entries(activityPatterns)
      .filter(([_, acts]) => acts.length >= 3)
      .map(([key, acts]) => ({
        pattern: key,
        activities: acts,
        frequency: acts.length,
        type: acts[0].activity_type,
      }));

    if (recurringPatterns.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No recurring patterns found yet. Log more activities to generate SOPs.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to generate SOPs from patterns
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const generatedSOPs = [];

    for (const pattern of recurringPatterns.slice(0, 5)) {
      const prompt = `Based on these ${pattern.frequency} similar activities, generate a standard operating procedure (SOP):

Activity Type: ${pattern.type}
Activities performed:
${pattern.activities.map((a: any, i: number) => `${i + 1}. ${a.title}${a.description ? ` - ${a.description}` : ''}`).join('\n')}

Generate a clear SOP with:
1. A concise title
2. A brief description of when to use this SOP
3. Step-by-step instructions (as an array of steps)
4. Category (e.g., "Sales", "Support", "Operations")

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{
  "title": "string",
  "description": "string", 
  "steps": ["step 1", "step 2", ...],
  "category": "string"
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
            { role: 'system', content: 'You are an expert at creating standard operating procedures. Always return valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!aiResponse.ok) {
        console.error('AI API error:', await aiResponse.text());
        continue;
      }

      const aiData = await aiResponse.json();
      const sopText = aiData.choices[0].message.content.trim();
      
      // Parse the JSON response
      let sopData;
      try {
        // Remove markdown code blocks if present
        const cleanedText = sopText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        sopData = JSON.parse(cleanedText);
      } catch (e) {
        console.error('Failed to parse SOP JSON:', sopText);
        continue;
      }

      // Calculate confidence score based on frequency
      const confidence = Math.min(pattern.frequency / 10, 1) * 100;

      generatedSOPs.push({
        user_id: user.id,
        title: sopData.title,
        description: sopData.description,
        steps: sopData.steps,
        category: sopData.category,
        frequency: `${pattern.frequency} times`,
        confidence_score: confidence,
        based_on_activities: pattern.activities.map((a: any) => a.id),
        is_approved: false,
      });
    }

    // Insert generated SOPs
    if (generatedSOPs.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('sops')
        .insert(generatedSOPs);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        generated: generatedSOPs.length,
        sops: generatedSOPs 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-activities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});