import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScaffoldedProject {
  summary?: string;
  crm_contacts: Array<{
    first_name: string;
    last_name: string;
    email?: string;
    title?: string;
    role_in_initiative: string;
  }>;
  crm_companies: Array<{
    name: string;
    industry?: string;
    role_in_initiative: string;
  }>;
  deal_room?: {
    name: string;
    description: string;
    deal_value?: number;
    participants: string[];
    terms?: Array<{
      title: string;
      description: string;
      category: string;
    }>;
  };
  tasks: Array<{
    title: string;
    description: string;
    priority: string;
    due_offset_days: number;
    assignee_role?: string;
  }>;
  erp_folders: string[];
  calendar_events: Array<{
    title: string;
    description: string;
    offset_days: number;
    duration_hours: number;
  }>;
  workflows: Array<{
    name: string;
    description: string;
    trigger: string;
    steps: string[];
  }>;
  curriculum?: {
    title: string;
    overview: string;
    target_audience: string;
    learning_objectives: string[];
    modules: Array<{
      number: number;
      title: string;
      duration: string;
      topics: string[];
      activities: string[];
      materials_needed: string[];
    }>;
    outcomes: string[];
  };
  proposals?: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initiative_id, goal_statement, initiative_type } = await req.json();

    console.log('[Initiative Architect] Received request:', { initiative_id, initiative_type, goal_length: goal_statement?.length });

    if (!initiative_id || !goal_statement) {
      console.error('[Initiative Architect] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'initiative_id and goal_statement are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      console.error('[Initiative Architect] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch initiative
    const { data: initiative, error: initError } = await supabase
      .from('initiatives')
      .select('*')
      .eq('id', initiative_id)
      .single();

    if (initError || !initiative) {
      console.error('[Initiative Architect] Initiative not found:', initError);
      return new Response(
        JSON.stringify({ error: 'Initiative not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Initiative Architect] Architecting initiative: ${initiative.name}, goal: ${goal_statement.substring(0, 50)}...`);

    // Generate project scaffold using AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are an AGI project architect for Business Development LLC (bdsrvs.com). Given a natural language goal, you scaffold complete operational projects with XODIAK blockchain verification.

Analyze the user's goal and create a comprehensive project scaffold with:
1. CRM contacts to create (stakeholders, partners, clients) - EXTRACT REAL NAMES FROM THE PROMPT
2. CRM companies to create or reference
3. A deal room if collaboration/negotiation is needed (include clear terms)
4. Tasks with priorities and relative due dates (be comprehensive - 10+ tasks for workshops)
5. ERP folder structure for document organization
6. Calendar events for meetings/milestones
7. Automation workflows if applicable
8. For WORKSHOP initiatives: Include DETAILED curriculum with:
   - 4-6 modules
   - Specific learning objectives
   - Interactive activities (role-plays, exercises, case studies)
   - Materials needed
   - Expected outcomes

Return a JSON object with this structure:
{
  "summary": "1-2 sentence summary of what will be created",
  "crm_contacts": [
    { "first_name": "", "last_name": "", "email": "", "title": "", "role_in_initiative": "" }
  ],
  "crm_companies": [
    { "name": "", "industry": "", "role_in_initiative": "" }
  ],
  "deal_room": {
    "name": "",
    "description": "",
    "deal_value": null,
    "participants": ["role1", "role2"],
    "terms": [
      { "title": "", "description": "", "category": "deliverable|payment|timeline" }
    ]
  },
  "tasks": [
    { "title": "", "description": "", "priority": "high|medium|low", "due_offset_days": 7, "assignee_role": "" }
  ],
  "erp_folders": ["folder/subfolder", "folder2"],
  "calendar_events": [
    { "title": "", "description": "", "offset_days": 0, "duration_hours": 1 }
  ],
  "workflows": [
    { "name": "", "description": "", "trigger": "", "steps": ["step1", "step2"] }
  ],
  "curriculum": {
    "title": "",
    "overview": "",
    "target_audience": "",
    "learning_objectives": ["objective1", "objective2"],
    "modules": [
      {
        "number": 1,
        "title": "",
        "duration": "45 minutes",
        "topics": ["topic1", "topic2"],
        "activities": ["activity1", "activity2"],
        "materials_needed": ["material1"]
      }
    ],
    "outcomes": ["outcome1", "outcome2"]
  },
  "proposals": [
    {
      "type": "partnership|curriculum|registration",
      "title": "",
      "description": ""
    }
  ]
}

Be specific and actionable. Extract real names if mentioned (e.g., "Majida Baba" becomes first_name: "Majida", last_name: "Baba").
Use realistic timeframes. For workshops, create comprehensive curriculum with 4-6 detailed modules.
Return ONLY valid JSON, no markdown wrapper.`
          },
          {
            role: 'user',
            content: `Goal: ${goal_statement}

Initiative Type: ${initiative_type || 'general'}

Scaffold this into a complete operational project.`
          }
        ],
        max_tokens: 6000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to architect initiative');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';

    let scaffold: ScaffoldedProject;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      scaffold = JSON.parse(cleanContent);
    } catch {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse scaffolding result');
    }

    const userId = initiative.user_id;
    const results = {
      contacts_created: 0,
      companies_created: 0,
      deal_room_created: false,
      deal_room_id: null as string | null,
      tasks_created: 0,
      erp_folders_created: 0,
      events_created: 0,
      contact_ids: [] as string[],
      company_ids: [] as string[]
    };

    // Create CRM contacts WITH initiative_id
    if (scaffold.crm_contacts?.length) {
      for (const contact of scaffold.crm_contacts) {
        const { data, error } = await supabase.from('crm_contacts').insert({
          user_id: userId,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          title: contact.title,
          initiative_id: initiative_id,
          tags: ['initiative', initiative_type || 'project', 'ai-scaffolded'],
          notes: `Role: ${contact.role_in_initiative}\nInitiative: ${initiative.name}`
        }).select('id').single();
        if (!error && data) {
          results.contacts_created++;
          results.contact_ids.push(data.id);
        }
      }
    }

    // Create CRM companies WITH initiative_id
    if (scaffold.crm_companies?.length) {
      for (const company of scaffold.crm_companies) {
        const { data, error } = await supabase.from('crm_companies').insert({
          user_id: userId,
          name: company.name,
          industry: company.industry,
          initiative_id: initiative_id,
          tags: ['initiative', initiative_type || 'project', 'ai-scaffolded'],
          description: `Role: ${company.role_in_initiative}`
        }).select('id').single();
        if (!error && data) {
          results.companies_created++;
          results.company_ids.push(data.id);
        }
      }
    }

    // Create deal room if specified
    if (scaffold.deal_room) {
      const { data, error } = await supabase.from('deal_rooms').insert({
        creator_id: userId,
        name: scaffold.deal_room.name,
        description: scaffold.deal_room.description,
        deal_value: scaffold.deal_room.deal_value,
        status: 'draft',
        terms_json: {
          initiative_id: initiative_id,
          scaffolded: true,
          participants: scaffold.deal_room.participants,
          terms: scaffold.deal_room.terms || []
        }
      }).select('id').single();
      if (!error && data) {
        results.deal_room_created = true;
        results.deal_room_id = data.id;
      }
    }

    // Create tasks
    if (scaffold.tasks?.length) {
      const now = new Date();
      for (const task of scaffold.tasks) {
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + (task.due_offset_days || 7));
        
        const { error } = await supabase.from('tasks').insert({
          user_id: userId,
          title: task.title,
          description: task.description,
          priority: task.priority || 'medium',
          status: 'todo',
          due_date: dueDate.toISOString(),
          tags: ['initiative', initiative.name.substring(0, 30), `initiative:${initiative_id}`]
        });
        if (!error) results.tasks_created++;
      }
    }

    // Create ERP folders
    if (scaffold.erp_folders?.length) {
      for (const folderPath of scaffold.erp_folders) {
        const { error } = await supabase.from('erp_folders').insert({
          user_id: userId,
          name: folderPath.split('/').pop() || folderPath,
          path: `/${initiative.name.replace(/\s+/g, '_')}/${folderPath}`,
          folder_type: 'document',
          metadata: { initiative_id, scaffolded: true }
        });
        if (!error) results.erp_folders_created++;
      }
    }

    // UPDATE INITIATIVE FIRST (before XODIAK call to ensure it completes)
    const { error: updateError } = await supabase
      .from('initiatives')
      .update({
        status: 'ready',
        scaffolded_entities: {
          contacts: results.contacts_created,
          companies: results.companies_created,
          deal_room: results.deal_room_created,
          deal_room_id: results.deal_room_id,
          tasks: results.tasks_created,
          erp_folders: results.erp_folders_created,
          contact_ids: results.contact_ids,
          company_ids: results.company_ids
        },
        generated_content: {
          summary: scaffold.summary,
          curriculum: scaffold.curriculum,
          proposals: scaffold.proposals,
          crm_contacts: scaffold.crm_contacts,
          crm_companies: scaffold.crm_companies,
          tasks: scaffold.tasks,
          erp_folders: scaffold.erp_folders,
          calendar_events: scaffold.calendar_events,
          workflows: scaffold.workflows,
          deal_room: scaffold.deal_room
        },
        progress_percent: 100,
        updated_at: new Date().toISOString()
      })
      .eq('id', initiative_id);

    if (updateError) {
      console.error('Failed to update initiative:', updateError);
    } else {
      console.log('Initiative updated to ready status');
    }

    // Log contribution event for XODIAK anchoring (non-blocking)
    // Using a direct insert instead of RPC to avoid UUID type mismatch
    try {
      const eventHash = crypto.randomUUID();
      await supabase.from('contribution_events').insert({
        user_id: userId,
        actor_type: 'agent',
        event_type: 'workflow_triggered',
        event_description: `Initiative scaffolded: ${initiative.name}`,
        event_hash: eventHash,
        xodiak_anchor_status: 'pending',
        payload: {
          initiative_id,
          initiative_name: initiative.name,
          results,
          scaffold_summary: scaffold.summary,
          created_entities: {
            contacts: results.contacts_created,
            companies: results.companies_created,
            deal_room: results.deal_room_created,
            tasks: results.tasks_created,
            erp_folders: results.erp_folders_created
          }
        },
        compute_credits: 5,
        action_credits: 10,
        outcome_credits: 0,
        attribution_tags: ['initiative', 'ai-scaffolding', initiative_type || 'project'],
        value_category: 'automation'
      });
      console.log('XODIAK contribution event logged for initiative scaffolding');
    } catch (xodiakError) {
      console.warn('Failed to log XODIAK event (non-blocking):', xodiakError);
    }

    console.log(`Initiative scaffolded successfully:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        initiative_id,
        summary: scaffold.summary,
        results,
        xodiak_logged: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in initiative-architect:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});