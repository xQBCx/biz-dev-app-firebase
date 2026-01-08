import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AgentRequest {
  deal_room_id: string;
  participant_id?: string | null;
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
        deal_room_participants(
          id,
          user_id,
          name,
          email,
          is_company,
          role_type,
          display_mode,
          display_name_override,
          company_display_name,
          wallet_address
        ),
        deal_room_formulations(id, name, description, status, version_number),
        deal_room_terms(id, title, content, section_type, is_required, agreed_by)
      `)
      .eq('id', deal_room_id)
      .maybeSingle();

    if (roomError) {
      console.error('Error fetching deal room:', roomError);
      return new Response(JSON.stringify({ error: 'Failed to load deal data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!dealRoom) {
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
    const participantDisplayName = (p: any) =>
      p.display_name_override ||
      p.company_display_name ||
      p.name ||
      p.email ||
      (p.wallet_address ? `Wallet ${String(p.wallet_address).slice(0, 6)}…` : 'Anonymous');

    const agreedCount = (agreedBy: unknown) => {
      if (Array.isArray(agreedBy)) return agreedBy.length;
      if (agreedBy && typeof agreedBy === 'object') return Object.keys(agreedBy as Record<string, unknown>).length;
      return 0;
    };

    const dealContext = {
      deal_name: dealRoom.name,
      deal_description: dealRoom.description,
      deal_category: dealRoom.category,
      deal_status: dealRoom.status,
      expected_deal_size_min: dealRoom.expected_deal_size_min,
      expected_deal_size_max: dealRoom.expected_deal_size_max,
      time_horizon: dealRoom.time_horizon,
      voting_rule: dealRoom.voting_rule,
      contract_locked: dealRoom.contract_locked,
      participant_count: dealRoom.deal_room_participants?.length || 0,
      participants:
        dealRoom.deal_room_participants?.map((p: any) => ({
          name: participantDisplayName(p),
          role: p.role_type,
        })) || [],
      formulations:
        dealRoom.deal_room_formulations?.map((f: any) => ({
          name: f.name,
          description: f.description,
          status: f.status,
          version_number: f.version_number,
        })) || [],
      terms:
        dealRoom.deal_room_terms?.map((t: any) => ({
          title: t.title,
          content: t.content,
          section_type: t.section_type,
          required: t.is_required,
          agreed_count: agreedCount(t.agreed_by),
        })) || [],
    };

    const dealSizeText =
      dealContext.expected_deal_size_min || dealContext.expected_deal_size_max
        ? `${dealContext.expected_deal_size_min ? `$${Number(dealContext.expected_deal_size_min).toLocaleString()}` : '—'} to ${dealContext.expected_deal_size_max ? `$${Number(dealContext.expected_deal_size_max).toLocaleString()}` : '—'}`
        : 'Not specified';

    // Build system prompt with full deal context
    const systemPrompt = `You are an AI assistant for a Deal Room. You help participants understand the SMART contract (deal terms), answer questions about the deal, and clarify what each section means.

Current Deal Information:
- Deal Name: ${dealContext.deal_name}
- Description: ${dealContext.deal_description || 'No description provided'}
- Category: ${dealContext.deal_category || 'Not specified'}
- Status: ${dealContext.deal_status}
- Expected Deal Size: ${dealSizeText}
- Time Horizon: ${dealContext.time_horizon || 'Not specified'}
- Voting Rule: ${dealContext.voting_rule || 'Not specified'}
- Contract Locked: ${dealContext.contract_locked ? 'Yes' : 'No'}

Participants (${dealContext.participant_count}):
${dealContext.participants.map((p: any) => `- ${p.name} (${p.role || 'participant'})`).join('\n') || 'No participants yet'}

Contract Terms (${dealContext.terms.length}):
${dealContext.terms.map((t: any) => `- ${t.title}: ${String(t.content || '').substring(0, 220)}${t.required ? ' [REQUIRED]' : ''}`).join('\n') || 'No terms defined yet'}

Formulations (${dealContext.formulations.length}):
${dealContext.formulations.map((f: any) => `- ${f.name}: ${f.description || 'No description'} (status: ${f.status || 'unknown'}, v${f.version_number ?? '—'})`).join('\n') || 'No formulations defined yet'}

Guidelines:
1. Answer questions clearly and concisely based on the deal information above.
2. If asked about getting a copy of the contract, explain they can open the Terms area and use the export/download option to save a copy.
3. If you detect a change proposal, acknowledge it and note it will be flagged for admin review.
4. Never make decisions — only explain and clarify.
5. If something is not present in the deal data, say so and suggest asking the deal admin.`;

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
