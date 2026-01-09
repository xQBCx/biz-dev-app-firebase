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
  confirm_action?: boolean;
  pending_action?: DealAction | null;
}

interface DealAction {
  type: 'add_terms' | 'add_deliverables' | 'add_participants' | 'set_governance' | 'add_ingredients' | 'full_setup';
  data: {
    terms?: TermData[];
    deliverables?: DeliverableData[];
    participants?: ParticipantData[];
    ingredients?: IngredientData[];
    governance?: GovernanceData;
  };
}

interface TermData {
  title: string;
  content: string;
  section_type: string;
  is_required: boolean;
}

interface DeliverableData {
  name: string;
  description: string;
  assigned_to_email?: string;
  due_date?: string;
  priority?: string;
  verification_criteria?: string;
}

interface ParticipantData {
  name: string;
  email: string;
  role?: string;
  ownership_percent?: number;
  company?: string;
}

interface IngredientData {
  type: string;
  contributor: string;
  contributor_type: string;
  value_weight: number;
  description?: string;
  ownership_percent?: number;
}

interface GovernanceData {
  voting_rule?: string;
  time_horizon?: string;
  category?: string;
}

// Full platform documentation for AI context
const PLATFORM_KNOWLEDGE = `
## Deal Room Platform Documentation

### Available Tabs and Features

**Overview Tab**
- Displays deal summary: name, description, status, expected size, time horizon
- Shows participant count and key metrics
- Quick access to recent activity

**Participants Tab**
- Manage deal parties: add, remove, set roles
- Role types: creator, partner, advisor, observer
- Identity display modes: Full Name, First Name Only, Company, Anonymous, Wallet Address
- Participant permissions and access levels

**Ingredients Tab (Chemical Blender Model)**
- Define contribution types that make up the deal
- Types: capital, intellectual_property, network_access, expertise, infrastructure, time_commitment, media_production, security_infrastructure, content_creation, distribution_network
- Each ingredient has: contributor, type, value_weight (1.0 default), ownership_percent
- Credit multipliers for different contribution values

**Contributions Tab**
- Log contribution events as they happen
- Track value attribution per participant
- XODIAK anchoring status for blockchain proof

**Credits Tab**
- Three-tier credit model: Compute, Action, Outcome
- Credit allocation based on contribution value
- Payout calculations and previews

**Structures Tab**
- Define deal payout structures
- Revenue split configurations
- Milestone-based payment triggers

**Settlement Tab**
- Settlement mechanisms and timelines
- Payment rails configuration (Stripe, Coinbase Commerce)
- Escrow release conditions

**Formulations Tab**
- Version-controlled deal configurations
- Snapshot deal state at key milestones
- Compare formulation versions

**Analytics Tab**
- Deal performance metrics
- Contribution maps and fairness scoring
- AI-powered insights

**Payouts Tab**
- Distribution calculations
- Payment history
- Automated payout triggers

**Chat Tab (AI Assistant - This Feature)**
- Ask questions about the deal
- Get AI-powered answers based on deal context
- Submit change proposals for admin review
- **NEW: Parse and add terms, deliverables, participants from natural language**

**Messaging Tab**
- Direct communication between participants
- Thread-based conversations
- File sharing

**Deliverables Tab**
- Task assignments with verification criteria
- Status: pending, in_progress, completed, verified
- Priority: low, medium, high, critical
- Due dates and completion tracking
- Verification workflow

**Terms Tab (Smart Contract Clauses)**
- Contract terms and conditions
- Section types: general, financial, legal, operational, confidentiality, intellectual_property
- Required vs optional terms
- Agreement tracking per participant
- Digital signature with audit trail (IP, timestamp, user agent)
- Export as PDF with verification certificate

**Invites Tab**
- Participant invitation management
- Pending/accepted/cancelled status
- Access level configuration per invite
- Platform permissions pre-staging

**Governance Tab**
- Voting rules: majority, unanimous, weighted
- Quorum requirements
- Decision thresholds
- Amendment procedures

**Escrow Tab**
- Digital escrow configuration
- Escrow accounts: platform-based, multisig, smart contract
- Release conditions and triggers
- Escrow status tracking

**Agents Tab**
- External agent registration (Lindy.ai, Airia integration)
- Agent attribution rules and payout configuration
- Activity feed and contribution viewer
- Sandbox/shadow mode for testing
- HubSpot CRM sync configuration

**AI Analysis Tab**
- Contribution maps visualization
- Fairness scoring algorithms
- AI-generated recommendations
`;

// Action detection keywords
const ACTION_INDICATORS = {
  add_terms: [
    'add these terms', 'add the following terms', 'include these terms',
    'new terms:', 'terms:', 'add term:', 'contract terms:',
    'add this clause', 'add clause:', 'add the clause',
    'confidentiality:', 'indemnification:', 'liability:',
    'here are the terms', 'these are the terms'
  ],
  add_deliverables: [
    'add deliverable', 'create deliverable', 'new deliverable',
    'deliverables:', 'add task:', 'create task:',
    'assign to', 'due date:', 'milestone:'
  ],
  add_participants: [
    'add participant', 'invite participant', 'add party',
    'participants:', 'invite:', 'add member:',
    'partner:', 'add partner'
  ],
  set_governance: [
    'set voting', 'voting rule:', 'governance:',
    'quorum:', 'decision threshold'
  ],
  add_ingredients: [
    'add ingredient', 'contribution:', 'ingredients:',
    'ownership split:', 'value weight:', 'add contribution'
  ],
  full_setup: [
    'set up this deal', 'setup this deal', 'configure this deal',
    'deal breakdown:', 'deal structure:', 'full deal:',
    'create this deal from', 'here is the deal:'
  ]
};

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
    const { deal_room_id, participant_id, question, confirm_action, pending_action } = body;

    console.log(`Deal Room Agent: Processing for room ${deal_room_id}`);
    console.log(`Question: ${question}`);
    console.log(`Confirm action: ${confirm_action}, Pending action: ${pending_action?.type}`);

    // Handle action confirmation
    if (confirm_action && pending_action) {
      console.log('Executing confirmed action:', pending_action.type);
      const result = await executeAction(supabase, deal_room_id, pending_action, participant_id);
      return new Response(JSON.stringify({
        success: true,
        response: result.message,
        action_executed: true,
        action_type: pending_action.type,
        action_result: result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch deal room context
    const { data: dealRoom, error: roomError } = await supabase
      .from('deal_rooms')
      .select(`
        *,
        deal_room_participants(
          id, user_id, name, email, is_company, role_type,
          display_mode, display_name_override, company_display_name, wallet_address
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

    // Fetch additional context
    const [deliverablesRes, ingredientsRes, invitationsRes] = await Promise.all([
      supabase.from('deal_room_participant_deliverables')
        .select('*').eq('deal_room_id', deal_room_id),
      supabase.from('deal_room_ingredients')
        .select('*').eq('formulation_id', dealRoom.deal_room_formulations?.[0]?.id || ''),
      supabase.from('deal_room_invitations')
        .select('*').eq('deal_room_id', deal_room_id)
    ]);

    // Detect action intent
    const detectedAction = detectActionIntent(question);
    console.log('Detected action intent:', detectedAction);

    // Build comprehensive deal context
    const participantDisplayName = (p: any) =>
      p.display_name_override || p.company_display_name || p.name || p.email ||
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
      participants: dealRoom.deal_room_participants?.map((p: any) => ({
        name: participantDisplayName(p),
        email: p.email,
        role: p.role_type,
      })) || [],
      formulations: dealRoom.deal_room_formulations?.map((f: any) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        status: f.status,
        version_number: f.version_number,
      })) || [],
      terms: dealRoom.deal_room_terms?.map((t: any) => ({
        title: t.title,
        content: t.content,
        section_type: t.section_type,
        required: t.is_required,
        agreed_count: agreedCount(t.agreed_by),
      })) || [],
      deliverables: deliverablesRes.data?.map((d: any) => ({
        name: d.deliverable_name,
        description: d.description,
        status: d.status,
        due_date: d.due_date,
        priority: d.priority,
      })) || [],
      ingredients: ingredientsRes.data?.map((i: any) => ({
        type: i.ingredient_type,
        contributor: i.contributor_id,
        value_weight: i.value_weight,
        ownership_percent: i.ownership_percent,
      })) || [],
      pending_invitations: invitationsRes.data?.filter((i: any) => i.status === 'pending').length || 0,
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If action detected, use extraction prompt
    if (detectedAction) {
      console.log('Processing action extraction for:', detectedAction);
      const extractedAction = await extractActionData(LOVABLE_API_KEY, question, detectedAction, dealContext);
      
      if (extractedAction && extractedAction.data && Object.keys(extractedAction.data).length > 0) {
        // Generate preview message
        const previewMessage = generateActionPreview(extractedAction);
        
        // Log the interaction
        await supabase.from('deal_room_messages').insert({
          deal_room_id,
          participant_id: participant_id || null,
          sender_type: 'participant',
          message_type: 'action_request',
          content: question,
          ai_response: previewMessage,
          visibility: 'visible_to_all',
          requires_admin_approval: true,
        });

        return new Response(JSON.stringify({
          success: true,
          response: previewMessage,
          action_detected: true,
          action_type: extractedAction.type,
          pending_action: extractedAction,
          requires_confirmation: true,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Standard Q&A flow
    const dealSizeText = dealContext.expected_deal_size_min || dealContext.expected_deal_size_max
      ? `${dealContext.expected_deal_size_min ? `$${Number(dealContext.expected_deal_size_min).toLocaleString()}` : '—'} to ${dealContext.expected_deal_size_max ? `$${Number(dealContext.expected_deal_size_max).toLocaleString()}` : '—'}`
      : 'Not specified';

    const systemPrompt = `You are the Deal Room AI Assistant for the xCOMMODITYx platform. You help participants understand and manage their deals.

${PLATFORM_KNOWLEDGE}

## Current Deal Information

**Deal Name:** ${dealContext.deal_name}
**Description:** ${dealContext.deal_description || 'No description provided'}
**Category:** ${dealContext.deal_category || 'Not specified'}
**Status:** ${dealContext.deal_status}
**Expected Deal Size:** ${dealSizeText}
**Time Horizon:** ${dealContext.time_horizon || 'Not specified'}
**Voting Rule:** ${dealContext.voting_rule || 'Not specified'}
**Contract Locked:** ${dealContext.contract_locked ? 'Yes' : 'No'}

**Participants (${dealContext.participant_count}):**
${dealContext.participants.map((p: any) => `- ${p.name} (${p.role || 'participant'}) - ${p.email}`).join('\n') || 'No participants yet'}

**Contract Terms (${dealContext.terms.length}):**
${dealContext.terms.map((t: any) => `- ${t.title} [${t.section_type}]${t.required ? ' (REQUIRED)' : ''}: ${String(t.content || '').substring(0, 200)}...`).join('\n') || 'No terms defined yet'}

**Deliverables (${dealContext.deliverables.length}):**
${dealContext.deliverables.map((d: any) => `- ${d.name} [${d.status}] - ${d.description || 'No description'}`).join('\n') || 'No deliverables defined yet'}

**Ingredients (${dealContext.ingredients.length}):**
${dealContext.ingredients.map((i: any) => `- ${i.type}: ${i.contributor} (weight: ${i.value_weight}, ownership: ${i.ownership_percent || 'N/A'}%)`).join('\n') || 'No ingredients defined yet'}

**Formulations (${dealContext.formulations.length}):**
${dealContext.formulations.map((f: any) => `- ${f.name} v${f.version_number ?? '—'} [${f.status || 'draft'}]`).join('\n') || 'No formulations defined yet'}

**Pending Invitations:** ${dealContext.pending_invitations}

## Your Capabilities

1. **Answer Questions**: Explain any aspect of the deal, platform features, or contract terms
2. **Explain Platform Features**: Describe how each tab works (Agents, Escrow, Terms, etc.)
3. **Parse and Add Terms**: Users can paste contract terms and you'll extract and add them
4. **Set Up Deals**: Users can provide a deal breakdown prompt and you'll configure deliverables, participants, ingredients
5. **Invite Participants**: Extract names and emails to send invitations

## Guidelines

1. Be helpful and concise
2. If you detect a request to modify the deal (add terms, deliverables, participants), extract the structured data and present a preview for confirmation
3. For change proposals that require negotiation, flag for admin review
4. Never make final decisions - present options and seek confirmation
5. If information is missing, ask for clarification
6. Reference specific platform features when relevant`;

    // Check for change proposals
    const changeProposalIndicators = [
      'can we change', 'i want to change', 'modify the',
      'update the', 'different split', 'adjust the', 'revise the', 'propose that'
    ];
    const isChangeProposal = changeProposalIndicators.some(
      indicator => question.toLowerCase().includes(indicator)
    );

    console.log('Calling Lovable AI Gateway for Q&A...');
    
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
        max_tokens: 1500,
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
        return new Response(JSON.stringify({ error: 'AI service is busy. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ error: 'Failed to get AI response. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!aiAnswer) {
      aiAnswer = "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
    }

    // Log the interaction
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
      await supabase.from('deal_room_change_proposals').insert({
        deal_room_id,
        proposed_by_participant_id: participant_id,
        proposal_type: 'other',
        title: 'Change Request from Chat',
        description: question,
        supporting_message_id: message.id,
        status: 'pending_admin_review',
      });
      console.log('Created change proposal for admin review');
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

// Detect action intent from user message
function detectActionIntent(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Check each action type
  for (const [actionType, indicators] of Object.entries(ACTION_INDICATORS)) {
    for (const indicator of indicators) {
      if (lowerMessage.includes(indicator)) {
        return actionType;
      }
    }
  }
  
  // Check for numbered lists that look like terms
  if (/^\d+\.\s*[A-Z]/m.test(message) && message.length > 200) {
    return 'add_terms';
  }
  
  return null;
}

// Extract structured action data using AI
async function extractActionData(
  apiKey: string,
  userMessage: string,
  actionType: string,
  dealContext: any
): Promise<DealAction | null> {
  const extractionPrompt = `You are a structured data extractor. Extract data from the user's message for a Deal Room action.

Action Type: ${actionType}

User Message:
"""
${userMessage}
"""

Current Deal Context:
- Existing Participants: ${dealContext.participants.map((p: any) => `${p.name} (${p.email})`).join(', ') || 'None'}
- Existing Terms: ${dealContext.terms.map((t: any) => t.title).join(', ') || 'None'}

Extract the relevant data and return ONLY valid JSON in this format:

For add_terms:
{
  "type": "add_terms",
  "data": {
    "terms": [
      {
        "title": "Term Title",
        "content": "Full term content",
        "section_type": "general|financial|legal|operational|confidentiality|intellectual_property",
        "is_required": true
      }
    ]
  }
}

For add_deliverables:
{
  "type": "add_deliverables",
  "data": {
    "deliverables": [
      {
        "name": "Deliverable Name",
        "description": "Description",
        "assigned_to_email": "email@example.com",
        "due_date": "YYYY-MM-DD",
        "priority": "low|medium|high|critical",
        "verification_criteria": "How to verify completion"
      }
    ]
  }
}

For add_participants:
{
  "type": "add_participants",
  "data": {
    "participants": [
      {
        "name": "Full Name",
        "email": "email@example.com",
        "role": "partner|advisor|observer",
        "company": "Company Name",
        "ownership_percent": 0
      }
    ]
  }
}

For add_ingredients:
{
  "type": "add_ingredients",
  "data": {
    "ingredients": [
      {
        "type": "capital|intellectual_property|network_access|expertise|infrastructure|time_commitment|media_production|security_infrastructure",
        "contributor": "Contributor Name",
        "contributor_type": "individual|company",
        "value_weight": 1.0,
        "description": "Description of contribution",
        "ownership_percent": 0
      }
    ]
  }
}

For full_setup (combine multiple types):
{
  "type": "full_setup",
  "data": {
    "participants": [...],
    "deliverables": [...],
    "ingredients": [...],
    "governance": {
      "voting_rule": "majority|unanimous|weighted",
      "time_horizon": "short|medium|long",
      "category": "partnership|revenue_share|project"
    }
  }
}

Return ONLY the JSON object, no additional text or markdown.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a JSON extraction assistant. Return only valid JSON.' },
          { role: 'user', content: extractionPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      console.error('Extraction API error:', response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('Extracted action data:', JSON.stringify(parsed, null, 2));
      return parsed as DealAction;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting action data:', error);
    return null;
  }
}

// Generate human-readable preview of the action
function generateActionPreview(action: DealAction): string {
  let preview = `📋 **I've parsed your request. Here's what I'll set up:**\n\n`;
  
  if (action.data.terms && action.data.terms.length > 0) {
    preview += `**Contract Terms (${action.data.terms.length}):**\n`;
    action.data.terms.forEach((t, i) => {
      preview += `${i + 1}. **${t.title}** [${t.section_type}]${t.is_required ? ' (Required)' : ''}\n`;
      preview += `   ${t.content.substring(0, 150)}${t.content.length > 150 ? '...' : ''}\n`;
    });
    preview += '\n';
  }
  
  if (action.data.participants && action.data.participants.length > 0) {
    preview += `**Participants (${action.data.participants.length}):**\n`;
    action.data.participants.forEach((p, i) => {
      preview += `${i + 1}. ${p.name} (${p.email}) - ${p.role || 'participant'}`;
      if (p.ownership_percent) preview += ` - ${p.ownership_percent}% ownership`;
      if (p.company) preview += ` - ${p.company}`;
      preview += '\n';
    });
    preview += '\n';
  }
  
  if (action.data.deliverables && action.data.deliverables.length > 0) {
    preview += `**Deliverables (${action.data.deliverables.length}):**\n`;
    action.data.deliverables.forEach((d, i) => {
      preview += `${i + 1}. **${d.name}**`;
      if (d.assigned_to_email) preview += ` → ${d.assigned_to_email}`;
      if (d.due_date) preview += ` (Due: ${d.due_date})`;
      preview += '\n';
      if (d.description) preview += `   ${d.description}\n`;
    });
    preview += '\n';
  }
  
  if (action.data.ingredients && action.data.ingredients.length > 0) {
    preview += `**Ingredients (${action.data.ingredients.length}):**\n`;
    action.data.ingredients.forEach((ing, i) => {
      preview += `${i + 1}. ${ing.type} - ${ing.contributor}`;
      if (ing.value_weight) preview += ` (Weight: ${ing.value_weight})`;
      if (ing.ownership_percent) preview += ` (${ing.ownership_percent}%)`;
      preview += '\n';
    });
    preview += '\n';
  }
  
  if (action.data.governance) {
    preview += `**Governance:**\n`;
    if (action.data.governance.voting_rule) preview += `- Voting Rule: ${action.data.governance.voting_rule}\n`;
    if (action.data.governance.time_horizon) preview += `- Time Horizon: ${action.data.governance.time_horizon}\n`;
    if (action.data.governance.category) preview += `- Category: ${action.data.governance.category}\n`;
    preview += '\n';
  }
  
  preview += `\n⚡ **Would you like me to apply these changes?**\n`;
  preview += `Click "Confirm & Apply" to proceed, or "Cancel" to make changes.`;
  
  return preview;
}

// Execute the confirmed action
async function executeAction(
  supabase: any,
  dealRoomId: string,
  action: DealAction,
  participantId?: string | null
): Promise<{ success: boolean; message: string; details?: any }> {
  const results: string[] = [];
  const errors: string[] = [];
  
  try {
    // Get the active formulation for ingredients
    let formulationId: string | null = null;
    if (action.data.ingredients && action.data.ingredients.length > 0) {
      const { data: formulation } = await supabase
        .from('deal_room_formulations')
        .select('id')
        .eq('deal_room_id', dealRoomId)
        .order('version_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      formulationId = formulation?.id;
      
      if (!formulationId) {
        // Create a default formulation
        const { data: newForm, error: formError } = await supabase
          .from('deal_room_formulations')
          .insert({
            deal_room_id: dealRoomId,
            name: 'Primary Formulation',
            description: 'Auto-created formulation',
            status: 'draft',
            version_number: 1
          })
          .select()
          .single();
        
        if (formError) {
          errors.push(`Failed to create formulation: ${formError.message}`);
        } else {
          formulationId = newForm.id;
          results.push('Created default formulation');
        }
      }
    }
    
    // Add Terms
    if (action.data.terms && action.data.terms.length > 0) {
      const termsToInsert = action.data.terms.map(t => ({
        deal_room_id: dealRoomId,
        title: t.title,
        content: t.content,
        section_type: t.section_type || 'general',
        is_required: t.is_required ?? true,
      }));
      
      const { error: termsError } = await supabase
        .from('deal_room_terms')
        .insert(termsToInsert);
      
      if (termsError) {
        errors.push(`Failed to add terms: ${termsError.message}`);
      } else {
        results.push(`Added ${action.data.terms.length} contract term(s)`);
      }
    }
    
    // Add Participants (as invitations)
    if (action.data.participants && action.data.participants.length > 0) {
      const { data: currentUser } = await supabase.auth.getUser();
      
      for (const p of action.data.participants) {
        const { error: inviteError } = await supabase
          .from('deal_room_invitations')
          .insert({
            deal_room_id: dealRoomId,
            invited_by: currentUser?.user?.id || participantId,
            email: p.email,
            name: p.name,
            company: p.company,
            role_in_deal: p.role || 'partner',
            status: 'pending',
          });
        
        if (inviteError) {
          errors.push(`Failed to invite ${p.email}: ${inviteError.message}`);
        } else {
          results.push(`Sent invitation to ${p.name} (${p.email})`);
        }
      }
    }
    
    // Add Deliverables
    if (action.data.deliverables && action.data.deliverables.length > 0) {
      // Get participant by email for assignment
      const { data: participants } = await supabase
        .from('deal_room_participants')
        .select('id, email')
        .eq('deal_room_id', dealRoomId);
      
      const emailToParticipant = new Map(
        participants?.map((p: any) => [p.email.toLowerCase(), p.id]) || []
      );
      
      for (const d of action.data.deliverables) {
        const assignedToId = d.assigned_to_email 
          ? emailToParticipant.get(d.assigned_to_email.toLowerCase()) 
          : null;
        
        const { error: delError } = await supabase
          .from('deal_room_participant_deliverables')
          .insert({
            deal_room_id: dealRoomId,
            participant_id: assignedToId || participantId,
            deliverable_name: d.name,
            description: d.description,
            due_date: d.due_date ? new Date(d.due_date).toISOString() : null,
            priority: d.priority || 'medium',
            verification_criteria: d.verification_criteria,
            status: 'pending',
          });
        
        if (delError) {
          errors.push(`Failed to add deliverable "${d.name}": ${delError.message}`);
        } else {
          results.push(`Created deliverable: ${d.name}`);
        }
      }
    }
    
    // Add Ingredients
    if (action.data.ingredients && action.data.ingredients.length > 0 && formulationId) {
      const ingredientsToInsert = action.data.ingredients.map(ing => ({
        formulation_id: formulationId,
        contributor_id: ing.contributor,
        contributor_type: ing.contributor_type || 'individual',
        ingredient_type: ing.type,
        description: ing.description,
        value_weight: ing.value_weight || 1.0,
        ownership_percent: ing.ownership_percent,
      }));
      
      const { error: ingError } = await supabase
        .from('deal_room_ingredients')
        .insert(ingredientsToInsert);
      
      if (ingError) {
        errors.push(`Failed to add ingredients: ${ingError.message}`);
      } else {
        results.push(`Added ${action.data.ingredients.length} ingredient(s)`);
      }
    }
    
    // Update Governance
    if (action.data.governance) {
      const updates: any = {};
      if (action.data.governance.voting_rule) updates.voting_rule = action.data.governance.voting_rule;
      if (action.data.governance.time_horizon) updates.time_horizon = action.data.governance.time_horizon;
      if (action.data.governance.category) updates.category = action.data.governance.category;
      
      if (Object.keys(updates).length > 0) {
        const { error: govError } = await supabase
          .from('deal_rooms')
          .update(updates)
          .eq('id', dealRoomId);
        
        if (govError) {
          errors.push(`Failed to update governance: ${govError.message}`);
        } else {
          results.push('Updated governance settings');
        }
      }
    }
    
    // Generate summary message
    const success = errors.length === 0;
    let message = success 
      ? `✅ **Changes Applied Successfully!**\n\n${results.map(r => `• ${r}`).join('\n')}`
      : `⚠️ **Completed with some issues:**\n\n**Succeeded:**\n${results.map(r => `• ${r}`).join('\n') || 'None'}\n\n**Errors:**\n${errors.map(e => `• ${e}`).join('\n')}`;
    
    return { success, message, details: { results, errors } };
    
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Action execution error:', error);
    return { 
      success: false, 
      message: `❌ **Failed to apply changes:** ${errorMsg}`,
      details: { results, errors: [...errors, errorMsg] }
    };
  }
}
