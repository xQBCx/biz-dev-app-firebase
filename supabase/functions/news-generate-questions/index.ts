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
    const { interviewId, subjectName, subjectTitle, subjectCompany } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Generating interview questions for ${subjectName}`);

    // Gather context from user's platform activity
    const [businessesResult, dealsResult, initiativesResult, crmResult] = await Promise.all([
      supabaseClient.from('spawned_businesses').select('name, description, industry').eq('user_id', user.id).limit(5),
      supabaseClient.from('deal_rooms').select('name, description').eq('creator_id', user.id).limit(5),
      supabaseClient.from('talent_initiatives').select('name, description, status').eq('user_id', user.id).limit(5),
      supabaseClient.from('crm_contacts').select('full_name, company, title').eq('user_id', user.id).limit(10),
    ]);

    const context = {
      businesses: businessesResult.data || [],
      deals: dealsResult.data || [],
      initiatives: initiativesResult.data || [],
      contacts: crmResult.data || [],
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert business journalist for BizDev Magazine, known for conducting insightful, probing interviews that reveal the human story behind business ventures. Your interviews are professional yet personal, uncovering motivations, challenges, and wisdom.

Based on the subject's background and the interviewer's platform activity, generate 8-12 intelligent interview questions that:
1. Start with their background and journey into their current role
2. Explore their current projects, businesses, or initiatives
3. Dig into challenges faced and lessons learned
4. Uncover their vision for the future
5. Extract actionable wisdom for readers
6. Touch on work-life balance and personal philosophy

The questions should feel natural and conversational, not like a corporate checklist. Include follow-up style questions that show genuine curiosity.`;

    const userPrompt = `Generate interview questions for:
Subject: ${subjectName}
Title: ${subjectTitle || 'Business Leader'}
Company: ${subjectCompany || 'Independent'}

Interviewer's Context (their work on the platform):
- Businesses: ${JSON.stringify(context.businesses)}
- Deal Rooms: ${JSON.stringify(context.deals)}
- Talent Initiatives: ${JSON.stringify(context.initiatives)}
- Key Contacts: ${JSON.stringify(context.contacts.slice(0, 5))}

Generate 8-12 thoughtful interview questions that will create a compelling magazine article. Return as a JSON array of objects with "id", "question", and "category" fields. Categories should be: "background", "current_work", "challenges", "vision", "wisdom", "personal".`;

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
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_questions",
            description: "Generate interview questions",
            parameters: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      question: { type: "string" },
                      category: { type: "string", enum: ["background", "current_work", "challenges", "vision", "wisdom", "personal"] }
                    },
                    required: ["id", "question", "category"]
                  }
                }
              },
              required: ["questions"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_questions" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    console.log('AI response received');

    let questions = [];
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      questions = parsed.questions || [];
    }

    // Update interview with questions
    if (interviewId) {
      await supabaseClient
        .from('news_interviews')
        .update({ 
          questions,
          interview_status: 'questions_generated',
          interviewer_context: context
        })
        .eq('id', interviewId);
    }

    return new Response(JSON.stringify({ success: true, questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
