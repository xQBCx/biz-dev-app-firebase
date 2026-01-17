import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProposalSection {
  title: string;
  content: string;
  order: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      proposal_id, 
      template_type, 
      custom_prompt,
      target_company_id,
      target_contact_id,
      deal_room_id
    } = await req.json();

    if (!proposal_id) {
      return new Response(
        JSON.stringify({ error: 'proposal_id is required' }),
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

    // Fetch proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('generated_proposals')
      .select('*')
      .eq('id', proposal_id)
      .single();

    if (proposalError || !proposal) {
      return new Response(
        JSON.stringify({ error: 'Proposal not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gather context
    let context = {
      company: null as any,
      contact: null as any,
      dealRoom: null as any
    };

    if (target_company_id) {
      const { data } = await supabase
        .from('crm_companies')
        .select('name, industry, description, website, research_data')
        .eq('id', target_company_id)
        .single();
      context.company = data;
    }

    if (target_contact_id) {
      const { data } = await supabase
        .from('crm_contacts')
        .select('first_name, last_name, title, email, research_data')
        .eq('id', target_contact_id)
        .single();
      context.contact = data;
    }

    if (deal_room_id) {
      const { data } = await supabase
        .from('deal_rooms')
        .select('name, description, deal_value, terms_json')
        .eq('id', deal_room_id)
        .single();
      context.dealRoom = data;
    }

    console.log(`Generating ${template_type} proposal for: ${proposal.title}`);

    // Build the prompt based on template type
    const templatePrompts: Record<string, string> = {
      executive_landing: `Create an executive landing package proposal for international business executives visiting a region. Include: welcome letter, itinerary overview, accommodation options, business meeting facilitation, cultural experiences, and VIP services.`,
      investment_tour: `Create an investment tour proposal showcasing regional opportunities. Include: investment landscape overview, key sectors, site visits, stakeholder meetings, regulatory guidance, and support services.`,
      consulting: `Create a consulting engagement proposal. Include: executive summary, scope of work, methodology, deliverables, timeline, team qualifications, and investment summary.`,
      property: `Create a property/real estate proposal. Include: property overview, location benefits, amenities, pricing, terms, comparable analysis, and next steps.`,
      workshop: `Create a workshop/training proposal. Include: program overview, learning objectives, curriculum outline, facilitator bios, logistics, and pricing.`,
      partnership: `Create a strategic partnership proposal. Include: partnership overview, value proposition, mutual benefits, partnership structure, responsibilities, and terms.`,
      service: `Create a professional services proposal. Include: service overview, scope, deliverables, pricing, timeline, and terms of engagement.`,
      custom: `Create a professional business proposal based on the provided context and instructions.`
    };

    const templateInstruction = templatePrompts[template_type] || templatePrompts.custom;

    // Generate proposal content
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
            content: `You are a professional proposal writer for Business Development LLC, a Houston-based business development and consulting firm.
Write compelling, boardroom-quality proposals that are professional yet personable.

${templateInstruction}

Return a JSON object with this structure:
{
  "executive_summary": "2-3 paragraph executive summary",
  "sections": [
    {
      "title": "Section Title",
      "content": "Section content in markdown format",
      "order": 1
    }
  ],
  "pricing": {
    "line_items": [
      { "description": "Item", "amount": 0, "notes": "" }
    ],
    "total": 0,
    "terms": "Payment terms"
  },
  "next_steps": ["Step 1", "Step 2"],
  "validity_period": "30 days"
}

Make the proposal specific to the target company/contact if provided.
Return ONLY valid JSON, no markdown wrapper.`
          },
          {
            role: 'user',
            content: `Generate a proposal for: "${proposal.title}"

Template Type: ${template_type}

${context.company ? `Target Company: ${context.company.name}
Industry: ${context.company.industry || 'Not specified'}
Description: ${context.company.description || 'Not available'}
Research: ${JSON.stringify(context.company.research_data || {})}` : ''}

${context.contact ? `Target Contact: ${context.contact.first_name} ${context.contact.last_name}
Title: ${context.contact.title || 'Not specified'}` : ''}

${context.dealRoom ? `Deal Room Context: ${context.dealRoom.name}
Deal Value: $${context.dealRoom.deal_value?.toLocaleString() || 'TBD'}
Terms: ${JSON.stringify(context.dealRoom.terms_json || {})}` : ''}

${custom_prompt ? `Additional Instructions: ${custom_prompt}` : ''}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to generate proposal');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';

    let generatedContent;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      generatedContent = JSON.parse(cleanContent);
    } catch {
      console.error('Failed to parse AI response:', content);
      generatedContent = {
        executive_summary: content,
        sections: [],
        pricing: null,
        next_steps: [],
        validity_period: '30 days'
      };
    }

    // Update the proposal with generated content
    const { error: updateError } = await supabase
      .from('generated_proposals')
      .update({
        generated_content: generatedContent,
        pricing: generatedContent.pricing,
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', proposal_id);

    if (updateError) {
      console.error('Error updating proposal:', updateError);
      throw updateError;
    }

    console.log(`Proposal generated successfully: ${proposal_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        proposal_id,
        sections_generated: generatedContent.sections?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-proposal:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
