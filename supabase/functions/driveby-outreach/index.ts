import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();

    if (!leadId) {
      throw new Error('Lead ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the lead with assignments
    const { data: lead, error: leadError } = await supabase
      .from('driveby_lead')
      .select(`
        *,
        lead_assignment (
          id,
          company_id,
          bundle_id,
          rationale,
          biz_company (
            name,
            description
          ),
          product_bundle (
            name,
            category,
            pain_points,
            benefits,
            script_checkpoints
          )
        ),
        field_capture (
          address,
          notes,
          raw_ocr
        )
      `)
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error('Lead not found');
    }

    const tasksCreated: string[] = [];
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    // Generate tasks for each assignment
    for (const assignment of lead.lead_assignment || []) {
      const company = assignment.biz_company;
      const bundle = assignment.product_bundle;
      
      if (!company) continue;

      // Generate email draft using Lovable AI
      let emailPayload = {
        subject: `Opportunity: ${lead.place_name || 'Your Business'}`,
        body: `Hello,\n\nI noticed your business and wanted to reach out about how ${company.name} can help.\n\nBest regards`,
        to: lead.place_name || 'Business Owner',
      };

      if (lovableApiKey && bundle) {
        try {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content: `You are an SDR for ${company.name}. 
                  Write a 120-160 word plain email referencing one observed detail and one measurable benefit.
                  End with one CTA to schedule a short call.
                  Avoid hype or technical jargon.
                  
                  Company: ${company.name}
                  Product/Service: ${bundle.name}
                  Pain points we solve: ${bundle.pain_points?.join(', ') || 'various business challenges'}
                  Benefits: ${bundle.benefits?.join(', ') || 'improved efficiency and cost savings'}
                  
                  Respond ONLY in valid JSON: {"subject": "...", "body": "..."}`
                },
                {
                  role: 'user',
                  content: `Write an email for:
                  Business: ${lead.place_name || 'Unknown'}
                  Category: ${lead.category || 'General'}
                  Location: ${lead.field_capture?.address || 'Not specified'}
                  Observations: ${lead.notes || 'None'}`
                }
              ],
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const content = data.choices[0]?.message?.content || '';
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              emailPayload = {
                ...emailPayload,
                subject: parsed.subject || emailPayload.subject,
                body: parsed.body || emailPayload.body,
              };
            }
          } else if (response.status === 429) {
            console.error('Lovable AI rate limited');
          } else if (response.status === 402) {
            console.error('Lovable AI credits exhausted');
          }
        } catch (e) {
          console.error('AI email generation failed:', e);
        }
      }

      // Create email work item
      const { data: emailTask } = await supabase
        .from('driveby_work_item')
        .insert({
          lead_id: leadId,
          assignee_type: 'human',
          kind: 'email',
          payload: emailPayload,
          due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Due tomorrow
          status: 'open',
        })
        .select()
        .single();

      if (emailTask) tasksCreated.push(emailTask.id);

      // Create call work item
      const callScript = bundle?.script_checkpoints?.join('\n- ') || 
        'Ask about: current solution, main challenges, timeline, decision process';

      const { data: callTask } = await supabase
        .from('driveby_work_item')
        .insert({
          lead_id: leadId,
          assignee_type: 'agent',
          kind: 'call',
          payload: {
            script: `Call script for ${company.name}:\n- ${callScript}`,
            objective: `Book a meeting to discuss ${bundle?.name || 'our services'}`,
            qualifiers: ['environment', 'current solution', 'main pain', 'timing'],
          },
          due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Due in 2 days
          status: 'open',
        })
        .select()
        .single();

      if (callTask) tasksCreated.push(callTask.id);

      // Create follow-up work item
      const { data: followUpTask } = await supabase
        .from('driveby_work_item')
        .insert({
          lead_id: leadId,
          assignee_type: 'human',
          kind: 'follow_up',
          payload: {
            action: 'Review response and schedule site visit if interested',
            context: `Lead for ${company.name} - ${bundle?.name || 'general inquiry'}`,
          },
          due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 1 week
          status: 'open',
        })
        .select()
        .single();

      if (followUpTask) tasksCreated.push(followUpTask.id);
    }

    // Update lead status to contacted
    await supabase
      .from('driveby_lead')
      .update({ status: 'contacted' })
      .eq('id', leadId);

    console.log(`Generated ${tasksCreated.length} outreach tasks for lead ${leadId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        leadId,
        tasksCreated: tasksCreated.length,
        taskIds: tasksCreated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Drive-by outreach error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
