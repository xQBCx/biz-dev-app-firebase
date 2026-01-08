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
    const { deal_room_id, participant_id, question } = body;

    console.log(`Deal Room Agent: Processing question for room ${deal_room_id}`);
    console.log(`Question: ${question}`);

    // Fetch deal room context including terms, participants, formulations
    const { data: dealRoom, error: roomError } = await supabase
      .from('deal_rooms')
      .select(`
        *,
        deal_room_participants(id, display_mode, role, user_id, participant_name, company_name),
        deal_room_formulations(id, name, description, formula_type, base_split_percentage),
        deal_room_terms(id, term_title, term_content, term_type, is_required, agreed_by)
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

    // Build comprehensive deal context for AI
    const dealContext = {
      deal_name: dealRoom.name,
      deal_description: dealRoom.description,
      deal_category: dealRoom.category,
      deal_status: dealRoom.status,
      deal_size: dealRoom.deal_size,
      time_horizon: dealRoom.time_horizon,
      voting_rule: dealRoom.voting_rule,
      contract_locked: dealRoom.contract_locked,
      participant_count: dealRoom.deal_room_participants?.length || 0,
      participants: dealRoom.deal_room_participants?.map((p: any) => ({
        name: p.participant_name || p.company_name || 'Anonymous',
        role: p.role
      })) || [],
      formulations: dealRoom.deal_room_formulations?.map((f: any) => ({
        name: f.name,
        description: f.description,
        type: f.formula_type,
        split_percentage: f.base_split_percentage
      })) || [],
      terms: dealRoom.deal_room_terms?.map((t: any) => ({
        title: t.term_title,
        content: t.term_content,
        type: t.term_type,
        required: t.is_required,
        agreed_count: Array.isArray(t.agreed_by) ? t.agreed_by.length : 0
      })) || [],
    };

    // Build system prompt with full deal context
    const systemPrompt = `You are an AI assistant for Deal Room negotiations. You help participants understand deal terms, answer questions about the contract, formulations, and provide clarifications.

Current Deal Information:
- Deal Name: ${dealContext.deal_name}
- Description: ${dealContext.deal_description || 'No description provided'}
- Category: ${dealContext.deal_category || 'Not specified'}
- Status: ${dealContext.deal_status}
- Deal Size: ${dealContext.deal_size ? '$' + dealContext.deal_size.toLocaleString() : 'Not specified'}
- Time Horizon: ${dealContext.time_horizon || 'Not specified'}
- Voting Rule: ${dealContext.voting_rule || 'Not specified'}
- Contract Locked: ${dealContext.contract_locked ? 'Yes' : 'No'}

Participants (${dealContext.participant_count}):
${dealContext.participants.map((p: any) => `- ${p.name || 'Anonymous'} (${p.role})`).join('\n') || 'No participants yet'}

Contract Terms (${dealContext.terms.length}):
${dealContext.terms.map((t: any) => `- ${t.title}: ${t.content?.substring(0, 200) || 'No content'}${t.required ? ' [REQUIRED]' : ''}`).join('\n') || 'No terms defined yet'}

Formulations (${dealContext.formulations.length}):
${dealContext.formulations.map((f: any) => `- ${f.name}: ${f.description || 'No description'} (${f.type}, ${f.split_percentage}% base split)`).join('\n') || 'No formulations defined yet'}

Guidelines:
1. Answer questions clearly and concisely based on the deal information above
2. If asked about getting a copy of the contract, explain they can go to the "Terms" tab to view all contract terms, and use the export/download buttons to save a copy
3. If you detect a change proposal, acknowledge it and note it will be flagged for admin review
4. Explain financial terms and splits in simple language
5. Never make decisions - only explain and clarify
6. If unsure about something not in the deal data, say so and recommend asking the deal admin
7. Be helpful, neutral, and focused on ensuring all parties understand the deal structure`;

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'AI service not configured. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Calling Lovable AI Gateway...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`
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

    let aiAnswer = "";
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      aiAnswer = aiData.choices?.[0]?.message?.content || "";
      console.log('AI response received successfully');
    } else {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'AI service is busy. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI service credits exhausted. Please contact support.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Failed to get AI response. Please try again.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!aiAnswer) {
      aiAnswer = "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
    }

    // Log the interaction as an AI agent message
    const { data: message, error: messageError } = await supabase
      .from('deal_room_messages')
      .insert({
        deal_room_id,
        participant_id: participant_id || null,
        sender_type: 'participant',
        message_type: isChangeProposal ? 'change_proposal' : 'question',
        content: question,
        ai_response: aiAnswer,
        visibility: 'visible_to_all',
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
