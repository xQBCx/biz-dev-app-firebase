import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentRequest {
  deal_room_id: string;
  participant_id: string;
  question: string;
  context?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body: AgentRequest = await req.json();
    const { deal_room_id, participant_id, question, context } = body;

    console.log(`Deal Room Agent: Processing question for room ${deal_room_id}`);

    // Fetch deal room context
    const { data: dealRoom, error: roomError } = await supabase
      .from('deal_rooms')
      .select(`
        *,
        deal_room_participants(*),
        deal_room_formulations(*)
      `)
      .eq('id', deal_room_id)
      .single();

    if (roomError || !dealRoom) {
      console.error('Error fetching deal room:', roomError);
      return new Response(JSON.stringify({ error: 'Deal room not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Detect if this is a change proposal disguised as a question
    const changeProposalIndicators = [
      'can we change', 'i want to change', 'modify the', 
      'update the', 'different split', 'new terms',
      'adjust the', 'revise the', 'propose that'
    ];
    
    const isChangeProposal = changeProposalIndicators.some(
      indicator => question.toLowerCase().includes(indicator)
    );

    // Build context for AI response
    const dealContext = {
      deal_name: dealRoom.name,
      deal_description: dealRoom.description,
      participant_count: dealRoom.deal_room_participants?.length || 0,
      formulations: dealRoom.deal_room_formulations || [],
      status: dealRoom.status,
    };

    // Generate AI response (using Lovable AI)
    const systemPrompt = `You are an AI assistant for deal room negotiations. You help participants understand deal terms, answer questions about formulations, and provide clarifications. You are helpful, neutral, and focused on ensuring all parties understand the deal structure.

Current Deal Context:
- Deal Name: ${dealContext.deal_name}
- Description: ${dealContext.deal_description}
- Number of Participants: ${dealContext.participant_count}
- Status: ${dealContext.status}
- Formulations: ${JSON.stringify(dealContext.formulations, null, 2)}

Guidelines:
1. Answer questions clearly and concisely
2. If you detect a change proposal, acknowledge it and note it will be flagged for admin review
3. Explain financial terms in simple language
4. Never make decisions - only explain and clarify
5. If unsure, recommend the participant consult with the deal admin or their advisor`;

    // Call Lovable AI endpoint
    const aiResponse = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY') || ''}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    let aiAnswer = "I'm here to help clarify deal terms. Could you please rephrase your question?";
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      aiAnswer = aiData.choices?.[0]?.message?.content || aiAnswer;
    } else {
      console.log('AI response not available, using fallback');
      // Fallback: provide a helpful but generic response
      aiAnswer = `Thank you for your question about the deal "${dealContext.deal_name}". 

This deal currently has ${dealContext.participant_count} participants and is in "${dealContext.status}" status.

For specific questions about terms, revenue splits, or participant roles, I recommend:
1. Reviewing the formulation details in the deal dashboard
2. Asking your deal admin for clarification
3. Consulting with your advisor if you have one connected

Is there anything specific about the deal structure I can help explain?`;
    }

    // Log the interaction
    const { data: message, error: messageError } = await supabase
      .from('deal_room_messages')
      .insert({
        deal_room_id,
        participant_id,
        sender_type: 'participant',
        message_type: isChangeProposal ? 'change_proposal' : 'question',
        content: question,
        ai_response: aiAnswer,
        visibility: 'private',
        requires_admin_approval: isChangeProposal,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error logging message:', messageError);
    }

    // If this is a change proposal, create a proposal record
    if (isChangeProposal && message) {
      const { error: proposalError } = await supabase
        .from('deal_room_change_proposals')
        .insert({
          deal_room_id,
          proposed_by_participant_id: participant_id,
          proposal_type: 'other',
          title: 'Change Request from Chat',
          description: question,
          supporting_message_id: message.id,
          status: 'pending_admin_review',
        });

      if (proposalError) {
        console.error('Error creating proposal:', proposalError);
      } else {
        console.log('Created change proposal for admin review');
      }
    }

    // Evaluate message quality for learning
    const qualityScore = question.length > 50 ? 4 : question.length > 20 ? 3 : 2;
    const isInsightful = question.toLowerCase().includes('fairness') || 
                         question.toLowerCase().includes('risk') ||
                         question.toLowerCase().includes('consider');

    if (message && qualityScore >= 3) {
      await supabase
        .from('deal_room_learning_candidates')
        .insert({
          message_id: message.id,
          deal_room_id,
          pattern_category: isChangeProposal ? 'negotiation' : 'clarification',
          confidence: qualityScore / 5,
          is_approved_for_learning: qualityScore >= 4 && isInsightful,
        });
    }

    return new Response(JSON.stringify({
      success: true,
      response: aiAnswer,
      is_change_proposal: isChangeProposal,
      message_id: message?.id,
      flagged_for_review: isChangeProposal,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Deal Room Agent error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
