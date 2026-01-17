import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScaffoldedProject {
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
  };
  tasks: Array<{
    title: string;
    description: string;
    priority: string;
    due_offset_days: number;
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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { initiative_id, goal_statement, initiative_type } = await req.json();

    if (!initiative_id || !goal_statement) {
      return new Response(
        JSON.stringify({ error: 'initiative_id and goal_statement are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
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
      return new Response(
        JSON.stringify({ error: 'Initiative not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Architecting initiative: ${goal_statement.substring(0, 50)}...`);

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
            content: `You are an AGI project architect for Business Development LLC. Given a natural language goal, you scaffold complete operational projects.

Analyze the user's goal and create a comprehensive project scaffold with:
1. CRM contacts to create (stakeholders, partners, clients)
2. CRM companies to create or reference
3. A deal room if collaboration/negotiation is needed
4. Tasks with priorities and relative due dates
5. ERP folder structure for document organization
6. Calendar events for meetings/milestones
7. Automation workflows if applicable

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
    "participants": ["role1", "role2"]
  },
  "tasks": [
    { "title": "", "description": "", "priority": "high|medium|low", "due_offset_days": 7 }
  ],
  "erp_folders": ["folder/subfolder", "folder2"],
  "calendar_events": [
    { "title": "", "description": "", "offset_days": 0, "duration_hours": 1 }
  ],
  "workflows": [
    { "name": "", "description": "", "trigger": "", "steps": ["step1", "step2"] }
  ]
}

Be specific and actionable. Extract real names if mentioned. Use realistic timeframes.
Return ONLY valid JSON, no markdown wrapper.`
          },
          {
            role: 'user',
            content: `Goal: ${goal_statement}

Initiative Type: ${initiative_type || 'general'}

Scaffold this into a complete operational project.`
          }
        ],
        max_tokens: 4000,
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

    let scaffold: ScaffoldedProject & { summary?: string };
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
      tasks_created: 0,
      erp_folders_created: 0,
      events_created: 0
    };

    // Create CRM contacts
    if (scaffold.crm_contacts?.length) {
      for (const contact of scaffold.crm_contacts) {
        const { error } = await supabase.from('crm_contacts').insert({
          user_id: userId,
          first_name: contact.first_name,
          last_name: contact.last_name,
          email: contact.email,
          title: contact.title,
          tags: ['initiative', initiative_type || 'project', 'ai-scaffolded'],
          notes: `Role: ${contact.role_in_initiative}\nInitiative: ${initiative.name}`
        });
        if (!error) results.contacts_created++;
      }
    }

    // Create CRM companies
    if (scaffold.crm_companies?.length) {
      for (const company of scaffold.crm_companies) {
        const { error } = await supabase.from('crm_companies').insert({
          user_id: userId,
          name: company.name,
          industry: company.industry,
          tags: ['initiative', initiative_type || 'project', 'ai-scaffolded'],
          description: `Role: ${company.role_in_initiative}`
        });
        if (!error) results.companies_created++;
      }
    }

    // Create deal room if specified
    if (scaffold.deal_room) {
      const { error } = await supabase.from('deal_rooms').insert({
        creator_id: userId,
        name: scaffold.deal_room.name,
        description: scaffold.deal_room.description,
        deal_value: scaffold.deal_room.deal_value,
        status: 'draft',
        terms_json: {
          initiative_id: initiative_id,
          scaffolded: true,
          participants: scaffold.deal_room.participants
        }
      });
      if (!error) results.deal_room_created = true;
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
          tags: ['initiative', initiative.name.substring(0, 30)]
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

    // Update initiative with scaffold results
    await supabase
      .from('initiatives')
      .update({
        status: 'ready',
        scaffold_data: scaffold,
        scaffold_results: results,
        updated_at: new Date().toISOString()
      })
      .eq('id', initiative_id);

    console.log(`Initiative scaffolded successfully:`, results);

    return new Response(
      JSON.stringify({
        success: true,
        initiative_id,
        summary: scaffold.summary,
        results
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
