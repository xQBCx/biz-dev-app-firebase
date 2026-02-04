import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AGI System Prompt for business spawning
const AGI_SYSTEM_PROMPT = `You are an AGI-powered Business Development Architect. Your role is to help users create and launch successful businesses by:

1. **Discovery Phase**: Understanding their goals, expertise, resources, target market, and unique value proposition through conversational dialogue.

2. **Research Phase**: Conducting market research, competitive analysis, identifying opportunities, and validating the business concept.

3. **ERP Design Phase**: Creating an optimal organizational structure including:
   - Department/folder hierarchy
   - Key workflows and processes
   - Required integrations
   - Data schemas and relationships
   - Compliance and documentation needs

4. **Website Generation Phase**: Designing and generating website content including:
   - Brand messaging and positioning
   - Page structure and content
   - SEO optimization
   - Call-to-actions

5. **Content Creation Phase**: Generating initial business content:
   - Marketing materials
   - Pitch decks
   - Social media content
   - Email templates

You have access to these tools:
- web_research: Search the web for market data, competitors, trends
- generate_erp: Create ERP structure based on business profile
- generate_website: Create website structure and content
- generate_content: Create marketing and business content
- save_business_data: Persist business information
- compute_network_matches: Find potential business connections

IMPORTANT PRINCIPLES:
- Ask clarifying questions to deeply understand the business
- Provide actionable, specific recommendations
- Track costs and resource usage for transparency
- Extract insights from every interaction for continuous learning
- Connect businesses to complementary partners in the ecosystem

Current phase will be provided. Focus on that phase while maintaining context from previous phases.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, businessId, message, phase } = await req.json();

    switch (action) {
      case 'start': {
        // Check if user can spawn a new business
        const { data: canSpawn } = await supabase.rpc('can_spawn_business', {
          p_user_id: user.id
        });

        if (!canSpawn) {
          // User already has a business, check if they're admin
          const { data: isAdmin } = await supabase.rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
          });

          if (!isAdmin) {
            return new Response(JSON.stringify({
              success: false,
              requiresApproval: true,
              message: 'You already have a business. Please submit a request to create additional businesses.'
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }

        // Create new business draft
        const { data: business, error: createError } = await supabase
          .from('spawned_businesses')
          .insert({
            user_id: user.id,
            business_name: 'New Business',
            status: 'draft',
            spawn_progress: 0,
            spawn_log: [{ phase: 'started', timestamp: new Date().toISOString() }]
          })
          .select()
          .single();

        if (createError) throw createError;

        // Log usage
        await logUsage(supabase, user.id, business.id, 'api_calls', 'business_spawn_start', 1);

        return new Response(JSON.stringify({
          success: true,
          businessId: business.id,
          message: "Let's build your business! Tell me about your vision - what problem do you want to solve, who is your target customer, and what makes your approach unique?"
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'chat': {
        if (!businessId || !message) {
          throw new Error('businessId and message required for chat');
        }

        // Get business and conversation history
        const { data: business } = await supabase
          .from('spawned_businesses')
          .select('*')
          .eq('id', businessId)
          .single();

        if (!business) throw new Error('Business not found');

        const { data: history } = await supabase
          .from('business_spawn_conversations')
          .select('*')
          .eq('spawned_business_id', businessId)
          .order('created_at', { ascending: true });

        // Save user message
        await supabase.from('business_spawn_conversations').insert({
          spawned_business_id: businessId,
          user_id: user.id,
          role: 'user',
          content: message,
          phase: phase || 'discovery'
        });

        // Build messages array for AI
        const messages = [
          { role: 'system', content: AGI_SYSTEM_PROMPT + `\n\nCurrent phase: ${phase || 'discovery'}\n\nBusiness context: ${JSON.stringify(business)}` },
          ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ];

        // Define tools for AGI
        const tools = [
          {
            type: 'function',
            function: {
              name: 'web_research',
              description: 'Search the web for market research, competitor analysis, industry trends',
              parameters: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Search query' },
                  focus: { type: 'string', enum: ['competitors', 'market_size', 'trends', 'regulations', 'best_practices'] }
                },
                required: ['query']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'update_business_profile',
              description: 'Update business information based on conversation',
              parameters: {
                type: 'object',
                properties: {
                  business_name: { type: 'string' },
                  business_type: { type: 'string' },
                  industry: { type: 'string' },
                  description: { type: 'string' },
                  mission_statement: { type: 'string' },
                  products_services: { type: 'array', items: { type: 'string' } },
                  target_market: { type: 'array', items: { type: 'string' } },
                  offers_tags: { type: 'array', items: { type: 'string' } },
                  needs_tags: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'generate_erp_structure',
              description: 'Generate ERP/organizational structure for the business',
              parameters: {
                type: 'object',
                properties: {
                  business_type: { type: 'string' },
                  industry: { type: 'string' },
                  size: { type: 'string', enum: ['solo', 'small', 'medium', 'enterprise'] },
                  focus_areas: { type: 'array', items: { type: 'string' } }
                },
                required: ['business_type', 'industry']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'generate_website',
              description: 'Generate website structure and content',
              parameters: {
                type: 'object',
                properties: {
                  business_name: { type: 'string' },
                  industry: { type: 'string' },
                  description: { type: 'string' },
                  pages: { type: 'array', items: { type: 'string' } },
                  style: { type: 'string', enum: ['professional', 'creative', 'minimal', 'bold'] }
                },
                required: ['business_name', 'description']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'advance_phase',
              description: 'Move to the next phase of business creation',
              parameters: {
                type: 'object',
                properties: {
                  next_phase: { 
                    type: 'string', 
                    enum: ['discovery', 'research', 'erp_design', 'website', 'content', 'review', 'launch'] 
                  },
                  summary: { type: 'string', description: 'Summary of what was accomplished in current phase' }
                },
                required: ['next_phase', 'summary']
              }
            }
          }
        ];

        // Call AI
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'google/gemini-3-pro-preview',
            messages,
            tools,
            tool_choice: 'auto',
            max_tokens: 4000
          })
        });

        if (!aiResponse.ok) {
          throw new Error(`AI API error: ${aiResponse.status}`);
        }

        const aiData = await aiResponse.json();
        const aiMessage = aiData.choices?.[0]?.message;

        // Track token usage
        const tokensUsed = aiData.usage?.total_tokens || 1000;
        await logUsage(supabase, user.id, businessId, 'ai_tokens', 'gemini-3-pro', tokensUsed, tokensUsed * 0.000003);

        let responseContent = aiMessage?.content || '';
        let toolResults: any[] = [];
        let extractedInsights: any = {};

        // Process tool calls
        if (aiMessage?.tool_calls) {
          for (const toolCall of aiMessage.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments);
            let result: any;

            switch (toolCall.function.name) {
              case 'web_research':
                result = await executeWebResearch(lovableApiKey!, args);
                extractedInsights.research = args;
                break;

              case 'update_business_profile':
                result = await updateBusinessProfile(supabase, businessId, args);
                extractedInsights.profile_update = args;
                break;

              case 'generate_erp_structure':
                result = await generateERPStructure(supabase, businessId, args, lovableApiKey!);
                extractedInsights.erp = args;
                await logUsage(supabase, user.id, businessId, 'ai_tokens', 'erp_generation', 2000, 0.006);
                break;

              case 'generate_website':
                result = await generateWebsite(supabase, businessId, args, lovableApiKey!);
                extractedInsights.website = args;
                await logUsage(supabase, user.id, businessId, 'ai_tokens', 'website_generation', 3000, 0.009);
                break;

              case 'advance_phase':
                result = await advancePhase(supabase, businessId, args);
                extractedInsights.phase_change = args;
                break;

              default:
                result = { error: 'Unknown tool' };
            }

            toolResults.push({
              tool_call_id: toolCall.id,
              function_name: toolCall.function.name,
              result
            });
          }

          // If tools were called, get final response
          if (toolResults.length > 0) {
            const finalMessages = [
              ...messages,
              aiMessage,
              ...toolResults.map(tr => ({
                role: 'tool',
                tool_call_id: tr.tool_call_id,
                content: JSON.stringify(tr.result)
              }))
            ];

            const finalResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'google/gemini-3-pro-preview',
                messages: finalMessages,
                max_tokens: 2000
              })
            });

            if (finalResponse.ok) {
              const finalData = await finalResponse.json();
              responseContent = finalData.choices?.[0]?.message?.content || responseContent;
              await logUsage(supabase, user.id, businessId, 'ai_tokens', 'gemini-3-pro', finalData.usage?.total_tokens || 500, (finalData.usage?.total_tokens || 500) * 0.000003);
            }
          }
        }

        // Save assistant message
        await supabase.from('business_spawn_conversations').insert({
          spawned_business_id: businessId,
          user_id: user.id,
          role: 'assistant',
          content: responseContent,
          tool_calls: aiMessage?.tool_calls || null,
          tool_results: toolResults.length > 0 ? toolResults : null,
          phase: phase || 'discovery',
          extracted_insights: Object.keys(extractedInsights).length > 0 ? extractedInsights : null
        });

        // Get updated business
        const { data: updatedBusiness } = await supabase
          .from('spawned_businesses')
          .select('*')
          .eq('id', businessId)
          .single();

        return new Response(JSON.stringify({
          success: true,
          message: responseContent,
          business: updatedBusiness,
          toolResults: toolResults.length > 0 ? toolResults : undefined
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'find_matches': {
        if (!businessId) throw new Error('businessId required');

        const matches = await findNetworkMatches(supabase, businessId);

        return new Response(JSON.stringify({
          success: true,
          matches
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'launch': {
        if (!businessId) throw new Error('businessId required');

        const { data: business } = await supabase
          .from('spawned_businesses')
          .update({
            status: 'active',
            launched_at: new Date().toISOString()
          })
          .eq('id', businessId)
          .select()
          .single();

        // Trigger network matching
        await findNetworkMatches(supabase, businessId);

        return new Response(JSON.stringify({
          success: true,
          business,
          message: 'Congratulations! Your business is now live.'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error('Business spawn error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Unknown error'
    }), {
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

// Helper functions

async function logUsage(
  supabase: any, 
  userId: string, 
  businessId: string, 
  resourceType: string, 
  subtype: string, 
  quantity: number,
  cost?: number
) {
  await supabase.rpc('log_platform_usage', {
    p_user_id: userId,
    p_business_id: businessId,
    p_resource_type: resourceType,
    p_resource_subtype: subtype,
    p_quantity: quantity,
    p_unit: resourceType === 'ai_tokens' ? 'tokens' : 'calls',
    p_cost_usd: cost || null,
    p_metadata: {}
  });
}

async function executeWebResearch(apiKey: string, args: any) {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a market research analyst. Provide comprehensive, actionable market research. Include specific data points, competitor names, market sizes, and trends where possible.'
          },
          {
            role: 'user',
            content: `Conduct market research on: ${args.query}. Focus area: ${args.focus || 'general'}. Provide specific, actionable insights.`
          }
        ],
        max_tokens: 2000
      })
    });

    if (!response.ok) throw new Error('Research failed');
    
    const data = await response.json();
    return {
      success: true,
      research: data.choices?.[0]?.message?.content,
      query: args.query,
      focus: args.focus
    };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Research failed' };
  }
}

async function updateBusinessProfile(supabase: any, businessId: string, args: any) {
  const updates: any = {};
  
  if (args.business_name) updates.business_name = args.business_name;
  if (args.business_type) updates.business_type = args.business_type;
  if (args.industry) updates.industry = args.industry;
  if (args.description) updates.description = args.description;
  if (args.mission_statement) updates.mission_statement = args.mission_statement;
  if (args.products_services) updates.products_services = args.products_services;
  if (args.target_market) updates.target_market = args.target_market;
  if (args.offers_tags) updates.offers_tags = args.offers_tags;
  if (args.needs_tags) updates.needs_tags = args.needs_tags;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('spawned_businesses')
      .update(updates)
      .eq('id', businessId);

    if (error) return { success: false, error: error.message };
  }

  return { success: true, updated: Object.keys(updates) };
}

async function generateERPStructure(supabase: any, businessId: string, args: any, apiKey: string) {
  try {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-3-pro-preview',
      messages: [
        {
          role: 'system',
          content: `You are an ERP architecture expert. Generate a comprehensive organizational structure in JSON format including:
          - departments (with sub-folders)
          - workflows (automated processes)
          - integrations (recommended tools/APIs)
          - data_schemas (key data structures)
          - compliance_docs (required documentation)
          - kpis (key performance indicators)
          
          Return ONLY valid JSON, no markdown.`
        },
        {
          role: 'user',
          content: `Generate ERP structure for: 
          Business Type: ${args.business_type}
          Industry: ${args.industry}
          Size: ${args.size || 'small'}
          Focus Areas: ${args.focus_areas?.join(', ') || 'general operations'}`
        }
      ],
      max_tokens: 3000
    })
  });

  if (!response.ok) return { success: false, error: 'ERP generation failed' };

  const data = await response.json();
  let erpStructure;
  
  try {
    const content = data.choices?.[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    erpStructure = JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch {
    erpStructure = { raw: data.choices?.[0]?.message?.content };
  }

  await supabase
    .from('spawned_businesses')
    .update({ 
      erp_structure: erpStructure,
      status: 'generating_erp',
      spawn_progress: 40
    })
    .eq('id', businessId);

  return { success: true, erp_structure: erpStructure };
  } catch (error: any) {
    return { success: false, error: error?.message || 'ERP generation failed' };
  }
}

async function generateWebsite(supabase: any, businessId: string, args: any, apiKey: string) {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-3-pro-preview',
      messages: [
        {
          role: 'system',
          content: `You are a website content strategist. Generate comprehensive website content in JSON format including:
          - hero (headline, subheadline, cta)
          - about (mission, story, values)
          - services (list of offerings with descriptions)
          - features (key benefits/features)
          - testimonials (placeholder testimonials)
          - contact (form fields, contact info placeholders)
          - seo (meta title, description, keywords)
          - pages (array of page structures)
          
          Return ONLY valid JSON, no markdown.`
        },
        {
          role: 'user',
          content: `Generate website content for:
          Business: ${args.business_name}
          Industry: ${args.industry || 'general'}
          Description: ${args.description}
          Style: ${args.style || 'professional'}
          Pages: ${args.pages?.join(', ') || 'Home, About, Services, Contact'}`
        }
      ],
      max_tokens: 4000
    })
  });

  if (!response.ok) return { success: false, error: 'Website generation failed' };

  const data = await response.json();
  let websiteData;
  
  try {
    const content = data.choices?.[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    websiteData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
  } catch {
    websiteData = { raw: data.choices?.[0]?.message?.content };
  }

  await supabase
    .from('spawned_businesses')
    .update({ 
      website_data: websiteData,
      status: 'generating_website',
      spawn_progress: 70
    })
    .eq('id', businessId);

  return { success: true, website_data: websiteData };
}

async function advancePhase(supabase: any, businessId: string, args: any) {
  const phaseProgress: Record<string, number> = {
    discovery: 10,
    research: 25,
    erp_design: 40,
    website: 70,
    content: 85,
    review: 95,
    launch: 100
  };

  const statusMap: Record<string, string> = {
    discovery: 'draft',
    research: 'researching',
    erp_design: 'generating_erp',
    website: 'generating_website',
    content: 'generating_content',
    review: 'pending_approval',
    launch: 'active'
  };

  const { data: business } = await supabase
    .from('spawned_businesses')
    .select('spawn_log')
    .eq('id', businessId)
    .single();

  const spawnLog = business?.spawn_log || [];
  spawnLog.push({
    phase: args.next_phase,
    summary: args.summary,
    timestamp: new Date().toISOString()
  });

  await supabase
    .from('spawned_businesses')
    .update({
      spawn_progress: phaseProgress[args.next_phase] || 50,
      status: statusMap[args.next_phase] || 'draft',
      spawn_log: spawnLog
    })
    .eq('id', businessId);

  return { success: true, new_phase: args.next_phase, progress: phaseProgress[args.next_phase] };
}

async function findNetworkMatches(supabase: any, businessId: string) {
  // Get the business
  const { data: business } = await supabase
    .from('spawned_businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (!business) return [];

  // Find businesses with complementary tags
  const offersTags = business.offers_tags || [];
  const needsTags = business.needs_tags || [];

  // Find businesses that offer what this business needs
  const { data: suppliers } = await supabase
    .from('spawned_businesses')
    .select('id, business_name, offers_tags, needs_tags, industry')
    .neq('id', businessId)
    .contains('offers_tags', needsTags.length > 0 ? needsTags : ['__none__']);

  // Find businesses that need what this business offers  
  const { data: customers } = await supabase
    .from('spawned_businesses')
    .select('id, business_name, offers_tags, needs_tags, industry')
    .neq('id', businessId)
    .contains('needs_tags', offersTags.length > 0 ? offersTags : ['__none__']);

  const matches: any[] = [];

  // Calculate match scores and create edges
  for (const supplier of (suppliers || [])) {
    const matchingTags = supplier.offers_tags?.filter((t: string) => needsTags.includes(t)) || [];
    if (matchingTags.length > 0) {
      const matchScore = matchingTags.length / Math.max(needsTags.length, 1);
      matches.push({
        business: supplier,
        type: 'supplier',
        score: matchScore,
        reasons: matchingTags
      });

      // Create network edge
      await supabase.from('business_network_edges').upsert({
        source_business_id: businessId,
        target_business_id: supplier.id,
        edge_type: 'supplier',
        match_score: matchScore,
        match_reasons: matchingTags
      }, { onConflict: 'source_business_id,target_business_id,edge_type' });
    }
  }

  for (const customer of (customers || [])) {
    const matchingTags = customer.needs_tags?.filter((t: string) => offersTags.includes(t)) || [];
    if (matchingTags.length > 0) {
      const matchScore = matchingTags.length / Math.max(offersTags.length, 1);
      matches.push({
        business: customer,
        type: 'customer',
        score: matchScore,
        reasons: matchingTags
      });

      await supabase.from('business_network_edges').upsert({
        source_business_id: businessId,
        target_business_id: customer.id,
        edge_type: 'customer',
        match_score: matchScore,
        match_reasons: matchingTags
      }, { onConflict: 'source_business_id,target_business_id,edge_type' });
    }
  }

  return matches;
}
