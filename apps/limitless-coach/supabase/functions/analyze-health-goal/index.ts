import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are an AI health and fitness assistant for the Limitless Coach platform. You help users identify potential causes of pain, discomfort, or mobility issues and suggest actionable solutions.

Your expertise includes:
- Understanding common musculoskeletal issues (knee pain, hip tightness, back pain, etc.)
- Recognizing how related areas affect each other (e.g., tight hips causing hamstring issues)
- Suggesting stretches, exercises, and mobility work
- Knowing when to recommend professional help (chiropractor, physical therapist, doctor)

CRITICAL GUIDELINES:
1. Always include the disclaimer that you are not a medical professional
2. If something sounds serious (sharp pain, numbness, swelling), recommend seeing a professional immediately
3. Focus on common, safe stretches and exercises that are widely recommended
4. Explain the connection between body parts (e.g., "Knee pain during basketball can often be related to hip mobility, glute weakness, or tight IT band")
5. Be encouraging but realistic - improvements take time and consistency
6. Ask follow-up questions to better understand the issue

When analyzing images:
- Look for posture, alignment, and any visible indicators
- Ask about when pain occurs, intensity (1-10), and duration
- Consider activity level and history

Response format for recommendations:
1. Acknowledge the issue
2. Explain possible causes (be thorough but accessible)
3. Suggest 2-4 specific stretches or exercises with clear instructions
4. Note warning signs that require professional attention
5. Recommend a timeline for trying these solutions before escalating`;

const EXERCISE_IMAGE_PROMPT = `Generate a simple, clean black and white instructional diagram showing multiple angles of the exercise/stretch in a single image. Style should be minimalist line art, similar to medical or fitness textbook illustrations. Show:
1. Starting position
2. Movement direction with arrows
3. End position
4. Key form cues labeled

Keep it simple and clear - no shading, just clean lines on white background.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, goalId, generateExerciseImage, exerciseName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // If generating exercise image
    if (generateExerciseImage && exerciseName) {
      const imagePrompt = `${EXERCISE_IMAGE_PROMPT}\n\nExercise: ${exerciseName}`;
      
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            { role: 'user', content: imagePrompt }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!imageResponse.ok) {
        console.error('Image generation error:', await imageResponse.text());
        return new Response(JSON.stringify({ error: 'Failed to generate exercise image' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const imageData = await imageResponse.json();
      const generatedImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      return new Response(JSON.stringify({ 
        imageUrl: generatedImage,
        exerciseName 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Regular chat analysis
    const formattedMessages = messages.map((msg: any) => {
      if (msg.imageUrl) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            { type: 'image_url', image_url: { url: msg.imageUrl } }
          ]
        };
      }
      return { role: msg.role, content: msg.content };
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedMessages
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "I'm here to help. Could you tell me more about what you're experiencing?";

    // Extract any recommended exercises for image generation
    const exerciseMatches = assistantResponse.match(/(?:try|recommend|do|perform)\s+(?:the\s+)?([A-Za-z\s]+(?:stretch|exercise|hold|pose|raise|extension|curl|squat|lunge|bridge|plank))/gi) || [];
    const suggestedExercises = exerciseMatches.map((match: string) => 
      match.replace(/^(try|recommend|do|perform)\s+(the\s+)?/i, '').trim()
    ).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).slice(0, 4);

    return new Response(JSON.stringify({ 
      response: assistantResponse,
      suggestedExercises,
      goalId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Health goal analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      response: "I'm having trouble processing that. Let's try again - can you describe your concern?"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
