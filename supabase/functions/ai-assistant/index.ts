import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Complete route mapping for navigation
const ROUTES = {
  dashboard: { path: '/', title: 'Dashboard', description: 'Main dashboard with AI agents' },
  crm: { path: '/crm', title: 'CRM', description: 'Customer relationship management' },
  contacts: { path: '/crm', title: 'Contacts', description: 'Manage contacts' },
  companies: { path: '/crm', title: 'Companies', description: 'Manage companies' },
  deals: { path: '/crm', title: 'Deals', description: 'Manage deals and pipeline' },
  calendar: { path: '/calendar', title: 'Calendar', description: 'Schedule and meetings' },
  tasks: { path: '/tasks', title: 'Tasks', description: 'Task management' },
  messages: { path: '/messages', title: 'Messages', description: 'Email and messaging' },
  entity: { path: '/create-entity', title: 'Create Entity', description: 'Form a business entity' },
  directory: { path: '/directory', title: 'Directory', description: 'Business directory' },
  funding: { path: '/funding', title: 'Funding', description: 'Funding opportunities' },
  earnings: { path: '/earnings', title: 'Earnings', description: 'Revenue and earnings tracking' },
  research: { path: '/research-studio', title: 'Research Studio', description: 'Knowledge hub and research' },
  social: { path: '/social', title: 'Social Media', description: 'Social media management' },
  brand: { path: '/brand-command-center', title: 'Brand Center', description: 'Brand management' },
  workflows: { path: '/workflows', title: 'Workflows', description: 'Automation workflows' },
  tools: { path: '/tools', title: 'Tools', description: 'Business tools' },
  ip: { path: '/ip-launch', title: 'IP Launch', description: 'Patents and trademarks' },
  marketplace: { path: '/marketplace', title: 'Marketplace', description: 'Marketplace listings' },
  fleet: { path: '/fleet-intelligence', title: 'Fleet Intelligence', description: 'Fleet management' },
  broadcast: { path: '/broadcast', title: 'Broadcast', description: 'Content broadcasting' },
  xbuilderx: { path: '/xbuilderx', title: 'xBUILDERx', description: 'Construction management' },
  xodiak: { path: '/xodiak', title: 'XODIAK', description: 'Financial operations' },
  dealrooms: { path: '/deal-rooms', title: 'Deal Rooms', description: 'Collaborative deal rooms' },
  portfolio: { path: '/portfolio', title: 'Portfolio', description: 'Portfolio companies' },
  clients: { path: '/clients', title: 'Clients', description: 'Client management' },
  profile: { path: '/profile', title: 'Profile', description: 'Your profile settings' },
  integrations: { path: '/integrations', title: 'Integrations', description: 'Third-party integrations' },
  giftcards: { path: '/ai-gift-cards', title: 'AI Gift Cards', description: 'Purchase AI credits' },
  franchises: { path: '/franchises', title: 'Franchises', description: 'Franchise opportunities' },
  appstore: { path: '/app-store', title: 'App Store', description: 'Browse apps' },
  launchpad: { path: '/launchpad', title: 'Launchpad', description: 'Platform modules' },
  driveby: { path: '/driveby-intelligence', title: 'DriveBy Intelligence', description: 'Mobile lead capture' },
  sytuation: { path: '/sytuation', title: 'Sytuation', description: 'Situation monitoring' },
  trueodds: { path: '/true-odds', title: 'TrueOdds', description: 'Sports analytics' },
  geo: { path: '/geo-tools', title: 'GEO Tools', description: 'Geographic optimization' },
  erp: { path: '/erp', title: 'ERP', description: 'Enterprise resource planning' },
  analytics: { path: '/activity-dashboard', title: 'Analytics', description: 'Activity analytics' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, files, conversation_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const authHeader = req.headers.get('authorization');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
    }

    // Load or create conversation for persistence
    let activeConversationId = conversation_id;
    let conversationHistory: any[] = [];
    let userPreferences: any = null;
    let learnings: any[] = [];

    if (user) {
      // Load user preferences
      const { data: prefs } = await supabaseClient
        .from('ai_user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      userPreferences = prefs;

      // Load relevant learnings for context
      const { data: userLearnings } = await supabaseClient
        .from('ai_learnings')
        .select('pattern, resolution, category, confidence')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false })
        .limit(20);
      learnings = userLearnings || [];

      // If no conversation_id, get or create active conversation
      if (!activeConversationId) {
        const { data: activeConv } = await supabaseClient
          .from('ai_conversations')
          .select('id')
          .eq('user_id', user.id)
          .eq('active', true)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (activeConv) {
          activeConversationId = activeConv.id;
        } else {
          // Create new conversation
          const { data: newConv } = await supabaseClient
            .from('ai_conversations')
            .insert({
              user_id: user.id,
              title: 'New Conversation',
              active: true,
              context: context || {}
            })
            .select()
            .single();
          
          if (newConv) {
            activeConversationId = newConv.id;
          }
        }
      }

      // Load conversation history for context
      if (activeConversationId) {
        const { data: historyMsgs } = await supabaseClient
          .from('ai_messages')
          .select('role, content, tool_calls, tool_results')
          .eq('conversation_id', activeConversationId)
          .order('created_at', { ascending: true })
          .limit(50);
        
        if (historyMsgs) {
          conversationHistory = historyMsgs;
        }
      }

      // Save the incoming user message
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg && lastUserMsg.role === 'user' && activeConversationId) {
        await supabaseClient
          .from('ai_messages')
          .insert({
            conversation_id: activeConversationId,
            user_id: user.id,
            role: 'user',
            content: lastUserMsg.content,
            images: lastUserMsg.images || null
          });

        // Update conversation
        await supabaseClient
          .from('ai_conversations')
          .update({
            last_message_at: new Date().toISOString(),
            message_count: (conversationHistory.length + 1)
          })
          .eq('id', activeConversationId);
      }
    }

    // Build learning context
    const learningContext = learnings.length > 0 
      ? `\n\n## LEARNED PATTERNS FROM PAST INTERACTIONS\n${learnings.map(l => `- When user asks about "${l.pattern}", they typically want: ${l.resolution} (confidence: ${l.confidence})`).join('\n')}`
      : '';

    const preferenceContext = userPreferences
      ? `\n\n## USER PREFERENCES\n- Communication style: ${userPreferences.communication_style}\n- Auto-execute tools: ${userPreferences.auto_execute_tools}\n- Favorite modules: ${(userPreferences.favorite_modules || []).join(', ') || 'None set'}`
      : '';

    // Build comprehensive system prompt
    const systemPrompt = `You are Biz and Dev, the AI assistant for Biz Dev App - a comprehensive multi-tenant business development platform. You have COMPLETE knowledge and capabilities across the entire platform.

## CRITICAL RULES - READ CAREFULLY

1. **MAINTAIN CONVERSATION CONTEXT** - You have access to the full conversation history. ALWAYS refer back to what was discussed. If you said you would do something, DO IT immediately.

2. **NEVER LOSE CONTEXT** - If you're in the middle of a task, COMPLETE IT. Don't reset or start over. You remember everything from this conversation.

3. **EXECUTE TOOLS IMMEDIATELY** - When a task requires a tool (search, create, query), USE IT RIGHT AWAY. Don't just say you'll do it - actually do it.

4. **ALWAYS PROVIDE A MEANINGFUL RESPONSE** - Never leave an empty message. If you completed a task, confirm what you did. If you can't complete a task, explain why.

5. **LEARN FROM CORRECTIONS** - If the user corrects you or points out a mistake, acknowledge it, learn from it, and improve immediately.

6. **BE PROACTIVE** - If you detect a URL, company name, or entity, automatically look it up in the CRM. Don't ask permission for lookups - just do it.

7. **FOLLOW THROUGH** - When you say "Let me check for X", you MUST actually check for X and report the results in the same response or immediately after.

## PLATFORM MODULES (All navigable)

${Object.entries(ROUTES).map(([key, route]) => `- **${route.title}** (${route.path}): ${route.description}`).join('\n')}

## ACTION CAPABILITIES

### CRM Operations
- **CRITICAL**: When users ask about companies/contacts, ALWAYS use search_crm first
- Create/update contacts, companies, deals
- Log activities and time
- Schedule meetings

### Navigation
- Take users anywhere instantly
- Remember their favorite destinations

### Data & Analytics  
- Query data with natural language
- Create visualizations on demand

### Content Processing
- Analyze uploaded images (business cards, documents, screenshots)
- Extract text and data from images
- Process URLs and links

## RESPONSE FORMAT

When returning visualizations, use this format in your response:
\`\`\`visualization
{
  "type": "bar|line|pie|kpi|table",
  "title": "Chart Title",
  "data": [...],
  "config": {...}
}
\`\`\`

When navigating, confirm the action:
"I'll take you to [destination]. Navigating now..."

## ERROR HANDLING

If something fails:
1. Explain what went wrong in simple terms
2. Suggest an alternative approach
3. Offer to help with something related
4. NEVER return an empty response

## CONVERSATION HISTORY

You have access to the full conversation. Here's what we've discussed so far:
${conversationHistory.map(m => `${m.role}: ${m.content}`).slice(-10).join('\n\n')}

## CURRENT CONTEXT
${context ? `Current context: ${JSON.stringify(context)}` : 'No specific context provided.'}
${preferenceContext}
${learningContext}

## FILES/IMAGES
${files && files.length > 0 ? `The user has uploaded ${files.length} file(s). Analyze them carefully and extract any relevant information.` : 'No files uploaded in this message.'}`;

    // Define tools
    const tools = [
      {
        type: "function",
        function: {
          name: "search_crm",
          description: "Search the CRM for contacts, companies, or deals. ALWAYS use this when a user mentions a company name, person name, or asks if something is in the CRM. Execute immediately without asking permission.",
          parameters: {
            type: "object",
            properties: {
              search_type: {
                type: "string",
                enum: ["contact", "company", "deal", "all"],
                description: "Type of record to search for"
              },
              query: {
                type: "string",
                description: "Search query - company name, person name, or keywords"
              }
            },
            required: ["search_type", "query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "navigate_to",
          description: "Navigate the user to a specific page or module in the platform.",
          parameters: {
            type: "object",
            properties: {
              destination: {
                type: "string",
                description: "The destination path or module name"
              },
              reason: {
                type: "string",
                description: "Brief explanation of why navigating there"
              }
            },
            required: ["destination"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "query_analytics",
          description: "Query platform data and return analytics/visualizations.",
          parameters: {
            type: "object",
            properties: {
              query_type: {
                type: "string",
                enum: ["contacts", "companies", "deals", "activities", "tasks", "emails", "revenue", "custom"],
                description: "Type of data to query"
              },
              visualization: {
                type: "string",
                enum: ["bar", "line", "pie", "kpi", "table", "none"],
                description: "Type of visualization to generate"
              },
              filters: {
                type: "object",
                description: "Optional filters"
              },
              question: {
                type: "string",
                description: "The natural language question being answered"
              }
            },
            required: ["query_type", "question"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "extract_from_content",
          description: "Extract structured information from images, URLs, or text content.",
          parameters: {
            type: "object",
            properties: {
              content_type: {
                type: "string",
                enum: ["business_card", "document", "website", "screenshot", "text"],
                description: "Type of content being analyzed"
              },
              extracted_data: {
                type: "object",
                description: "The extracted structured data"
              },
              suggested_action: {
                type: "string",
                enum: ["create_contact", "create_company", "save_note", "create_task", "none"],
                description: "Recommended action"
              }
            },
            required: ["content_type", "extracted_data"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "log_activity",
          description: "Log an activity with time tracking.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Brief title for the activity" },
              description: { type: "string", description: "Detailed description" },
              duration_hours: { type: "number", description: "Duration in hours" },
              company_name: { type: "string", description: "Related company" },
              activity_type: { 
                type: "string", 
                enum: ["general", "meeting", "call", "email", "development", "research"] 
              }
            },
            required: ["title", "duration_hours", "activity_type"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_company",
          description: "Add a new company to the CRM.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Company name" },
              website: { type: "string", description: "Company website URL" },
              phone: { type: "string", description: "Company phone number" },
              industry: { type: "string", description: "Industry or sector" },
              notes: { type: "string", description: "Additional notes" }
            },
            required: ["name"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_contact",
          description: "Add a new contact to the CRM.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Contact's full name" },
              email: { type: "string", description: "Email address" },
              phone: { type: "string", description: "Phone number" },
              company: { type: "string", description: "Company name" },
              title: { type: "string", description: "Job title" },
              notes: { type: "string", description: "Additional notes" }
            },
            required: ["name"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_task",
          description: "Create a task or reminder.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Task title" },
              description: { type: "string", description: "Task description" },
              priority: { type: "string", enum: ["low", "medium", "high"] },
              due_date: { type: "string", description: "Due date in ISO format" },
              activity_type: { type: "string", enum: ["task", "call", "email", "meeting", "follow_up"] }
            },
            required: ["title", "priority", "activity_type"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_meeting",
          description: "Schedule a meeting.",
          parameters: {
            type: "object",
            properties: {
              subject: { type: "string", description: "Meeting title" },
              description: { type: "string", description: "Meeting agenda" },
              start_time: { type: "string", description: "Start time in ISO format" },
              end_time: { type: "string", description: "End time in ISO format" },
              attendee_names: { type: "array", items: { type: "string" }, description: "Attendee names" },
              location: { type: "string", description: "Meeting location" },
              meeting_link: { type: "string", description: "Virtual meeting link" }
            },
            required: ["subject", "start_time", "end_time", "attendee_names"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "record_learning",
          description: "Record a learning or correction from user feedback to improve future responses.",
          parameters: {
            type: "object",
            properties: {
              learning_type: {
                type: "string",
                enum: ["pattern", "correction", "preference"],
                description: "Type of learning"
              },
              category: { type: "string", description: "Category like 'crm', 'navigation', etc." },
              pattern: { type: "string", description: "What the user asked or corrected" },
              resolution: { type: "string", description: "What the correct action/response should be" }
            },
            required: ["learning_type", "pattern", "resolution"],
            additionalProperties: false
          }
        }
      }
    ];

    // Build messages with potential image content and history
    const historyMessages = conversationHistory.slice(-10).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    const currentMessages = messages.map((m: any) => {
      if (m.images && m.images.length > 0) {
        return {
          role: m.role === 'user' ? 'user' : 'assistant',
          content: [
            { type: 'text', text: m.content },
            ...m.images.map((img: string) => ({
              type: 'image_url',
              image_url: { url: img }
            }))
          ]
        };
      }
      return {
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      };
    });

    // Combine history with current messages, avoiding duplicates
    const allMessages = [...historyMessages];
    for (const msg of currentMessages) {
      const isDuplicate = allMessages.some(h => 
        h.role === msg.role && 
        (typeof h.content === 'string' ? h.content : JSON.stringify(h.content)) === 
        (typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content))
      );
      if (!isDuplicate) {
        allMessages.push(msg);
      }
    }

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
          ...allMessages
        ],
        tools: tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let toolCalls: any[] = [];
    let hasContent = false;
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    hasContent = true;
                    fullResponse += content;
                  }
                  
                  const toolCallDelta = parsed.choices?.[0]?.delta?.tool_calls;
                  if (toolCallDelta) {
                    for (const tc of toolCallDelta) {
                      if (tc.index !== undefined) {
                        if (!toolCalls[tc.index]) {
                          toolCalls[tc.index] = {
                            id: tc.id,
                            type: tc.type,
                            function: { name: tc.function?.name || '', arguments: '' }
                          };
                        }
                        if (tc.function?.arguments) {
                          toolCalls[tc.index].function.arguments += tc.function.arguments;
                        }
                      }
                    }
                  }

                  controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                } catch (e) {
                  // Invalid JSON, skip
                }
              }
            }
          }

          // Process tool calls after streaming
          if (user && toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              const funcName = toolCall.function.name;
              
              try {
                const args = JSON.parse(toolCall.function.arguments);
                console.log(`Executing tool: ${funcName}`, args);

                if (funcName === 'search_crm') {
                  // Actually search the CRM
                  let results: any[] = [];
                  const searchQuery = args.query.toLowerCase();
                  
                  if (args.search_type === 'company' || args.search_type === 'all') {
                    const { data: companies } = await supabaseClient
                      .from('crm_companies')
                      .select('id, name, website, industry, phone')
                      .eq('user_id', user.id)
                      .or(`name.ilike.%${searchQuery}%,website.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`)
                      .limit(10);
                    
                    if (companies && companies.length > 0) {
                      results.push(...companies.map(c => ({ type: 'company', ...c })));
                    }
                  }
                  
                  if (args.search_type === 'contact' || args.search_type === 'all') {
                    const { data: contacts } = await supabaseClient
                      .from('crm_contacts')
                      .select('id, name, email, phone, company, title')
                      .eq('user_id', user.id)
                      .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
                      .limit(10);
                    
                    if (contacts && contacts.length > 0) {
                      results.push(...contacts.map(c => ({ type: 'contact', ...c })));
                    }
                  }
                  
                  if (args.search_type === 'deal' || args.search_type === 'all') {
                    const { data: deals } = await supabaseClient
                      .from('crm_deals')
                      .select('id, title, value, stage, company_id')
                      .eq('user_id', user.id)
                      .ilike('title', `%${searchQuery}%`)
                      .limit(10);
                    
                    if (deals && deals.length > 0) {
                      results.push(...deals.map(d => ({ type: 'deal', ...d })));
                    }
                  }

                  // Record successful search
                  if (activeConversationId) {
                    await supabaseClient
                      .from('ai_learnings')
                      .insert({
                        user_id: user.id,
                        learning_type: 'successful_execution',
                        category: 'crm_search',
                        pattern: args.query,
                        resolution: `Found ${results.length} results`,
                        metadata: { search_type: args.search_type, result_count: results.length }
                      });
                  }

                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'search_result', 
                        query: args.query,
                        search_type: args.search_type,
                        results: results,
                        found: results.length > 0,
                        message: results.length > 0 
                          ? `Found ${results.length} result(s) for "${args.query}"` 
                          : `No results found for "${args.query}" in your CRM`
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'navigate_to') {
                  let targetPath = args.destination;
                  const routeKey = Object.keys(ROUTES).find(k => 
                    k === args.destination.toLowerCase() || 
                    ROUTES[k as keyof typeof ROUTES].path === args.destination ||
                    ROUTES[k as keyof typeof ROUTES].title.toLowerCase() === args.destination.toLowerCase()
                  );
                  
                  if (routeKey) {
                    targetPath = ROUTES[routeKey as keyof typeof ROUTES].path;
                  }

                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'navigation', 
                        path: targetPath,
                        title: routeKey ? ROUTES[routeKey as keyof typeof ROUTES].title : args.destination,
                        reason: args.reason 
                      })}\n\n`
                    )
                  );
                }
                
                else if (funcName === 'query_analytics') {
                  let queryResult: any = { data: [], summary: '' };
                  
                  if (args.query_type === 'contacts') {
                    const { count } = await supabaseClient
                      .from('crm_contacts')
                      .select('*', { count: 'exact', head: true })
                      .eq('user_id', user.id);
                    queryResult = { 
                      data: [{ label: 'Total Contacts', value: count || 0 }],
                      summary: `You have ${count || 0} contacts in your CRM.`
                    };
                  } else if (args.query_type === 'companies') {
                    const { count } = await supabaseClient
                      .from('crm_companies')
                      .select('*', { count: 'exact', head: true })
                      .eq('user_id', user.id);
                    queryResult = { 
                      data: [{ label: 'Total Companies', value: count || 0 }],
                      summary: `You have ${count || 0} companies in your CRM.`
                    };
                  } else if (args.query_type === 'deals') {
                    const { data: deals } = await supabaseClient
                      .from('crm_deals')
                      .select('stage, value')
                      .eq('user_id', user.id);
                    
                    const stages = deals?.reduce((acc: any, d: any) => {
                      acc[d.stage] = (acc[d.stage] || 0) + 1;
                      return acc;
                    }, {}) || {};
                    
                    const totalValue = deals?.reduce((sum: number, d: any) => sum + (d.value || 0), 0) || 0;
                    
                    queryResult = { 
                      data: Object.entries(stages).map(([stage, count]) => ({ label: stage, value: count })),
                      summary: `You have ${deals?.length || 0} deals worth $${totalValue.toLocaleString()} total.`,
                      visualization: args.visualization || 'bar'
                    };
                  } else if (args.query_type === 'activities' || args.query_type === 'tasks') {
                    const { data: activities } = await supabaseClient
                      .from('crm_activities')
                      .select('activity_type, status')
                      .eq('user_id', user.id)
                      .order('created_at', { ascending: false })
                      .limit(100);
                    
                    const pending = activities?.filter(a => a.status === 'pending').length || 0;
                    const completed = activities?.filter(a => a.status === 'completed').length || 0;
                    
                    queryResult = { 
                      data: [
                        { label: 'Pending', value: pending },
                        { label: 'Completed', value: completed }
                      ],
                      summary: `You have ${pending} pending and ${completed} completed tasks.`
                    };
                  }

                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'analytics_result', 
                        query: args.question,
                        result: queryResult
                      })}\n\n`
                    )
                  );
                }
                
                else if (funcName === 'extract_from_content') {
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'extraction_result', 
                        content_type: args.content_type,
                        extracted_data: args.extracted_data,
                        suggested_action: args.suggested_action
                      })}\n\n`
                    )
                  );
                  
                  // Auto-execute suggested action
                  if (args.suggested_action === 'create_contact' && args.extracted_data.name) {
                    const { data: contactData, error: contactError } = await supabaseClient
                      .from('crm_contacts')
                      .insert({
                        user_id: user.id,
                        name: args.extracted_data.name,
                        email: args.extracted_data.email || null,
                        phone: args.extracted_data.phone || null,
                        company: args.extracted_data.company || null,
                        title: args.extracted_data.title || null,
                        tags: ['ai-extracted']
                      })
                      .select()
                      .single();

                    if (!contactError && contactData) {
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'contact_created', 
                            contact: contactData 
                          })}\n\n`
                        )
                      );
                    }
                  } else if (args.suggested_action === 'create_company' && args.extracted_data.name) {
                    const { data: companyData, error: companyError } = await supabaseClient
                      .from('crm_companies')
                      .insert({
                        user_id: user.id,
                        name: args.extracted_data.name,
                        website: args.extracted_data.website || null,
                        phone: args.extracted_data.phone || null,
                        industry: args.extracted_data.industry || null,
                        tags: ['ai-extracted']
                      })
                      .select()
                      .single();

                    if (!companyError && companyData) {
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'company_created', 
                            company: companyData 
                          })}\n\n`
                        )
                      );
                    }
                  }
                }
                
                else if (funcName === 'create_task') {
                  const { data: taskData, error: insertError } = await supabaseClient
                    .from('crm_activities')
                    .insert({
                      user_id: user.id,
                      subject: args.title,
                      description: args.description || null,
                      activity_type: args.activity_type || 'task',
                      status: 'pending',
                      priority: args.priority || 'medium',
                      due_date: args.due_date || null,
                      tags: ['ai-created']
                    })
                    .select()
                    .single();

                  if (!insertError && taskData) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'task_created', task: taskData })}\n\n`
                      )
                    );
                  }
                }
                
                else if (funcName === 'create_contact') {
                  const { data: contactData, error: contactError } = await supabaseClient
                    .from('crm_contacts')
                    .insert({
                      user_id: user.id,
                      name: args.name,
                      email: args.email || null,
                      phone: args.phone || null,
                      company: args.company || null,
                      title: args.title || null,
                      notes: args.notes || null,
                      tags: ['ai-created']
                    })
                    .select()
                    .single();

                  if (!contactError && contactData) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'contact_created', contact: contactData })}\n\n`
                      )
                    );
                  }
                }
                
                else if (funcName === 'create_company') {
                  const { data: companyData, error: companyError } = await supabaseClient
                    .from('crm_companies')
                    .insert({
                      user_id: user.id,
                      name: args.name,
                      website: args.website || null,
                      phone: args.phone || null,
                      industry: args.industry || null,
                      description: args.notes || null,
                      tags: ['ai-created']
                    })
                    .select()
                    .single();

                  if (!companyError && companyData) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'company_created', company: companyData })}\n\n`
                      )
                    );
                  }
                }
                
                else if (funcName === 'log_activity') {
                  const now = new Date();
                  const startTime = new Date(now.getTime() - (args.duration_hours * 60 * 60 * 1000));
                  
                  const { data: activityData, error: activityError } = await supabaseClient
                    .from('crm_activities')
                    .insert({
                      user_id: user.id,
                      subject: args.title,
                      description: args.description || `Worked on ${args.company_name || 'general activities'}`,
                      activity_type: args.activity_type || 'general',
                      status: 'completed',
                      priority: 'medium',
                      start_time: startTime.toISOString(),
                      end_time: now.toISOString(),
                      tags: ['ai-created']
                    })
                    .select()
                    .single();

                  if (!activityError && activityData) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'activity_logged', activity: activityData })}\n\n`
                      )
                    );
                  }
                }
                
                else if (funcName === 'create_meeting') {
                  const attendeeEmails: string[] = [];
                  for (const name of args.attendee_names || []) {
                    const { data: contacts } = await supabaseClient
                      .from('crm_contacts')
                      .select('email')
                      .eq('user_id', user.id)
                      .ilike('name', `%${name}%`)
                      .limit(1);
                    
                    if (contacts && contacts.length > 0 && contacts[0].email) {
                      attendeeEmails.push(contacts[0].email);
                    }
                  }

                  const startTime = new Date(args.start_time);
                  const endTime = new Date(args.end_time);
                  
                  const { data: meetingData, error: meetingError } = await supabaseClient
                    .from('crm_activities')
                    .insert({
                      user_id: user.id,
                      subject: args.subject,
                      description: args.description || null,
                      activity_type: 'meeting',
                      status: 'scheduled',
                      priority: 'medium',
                      due_date: startTime.toISOString(),
                      start_time: startTime.toISOString(),
                      end_time: endTime.toISOString(),
                      location: args.location || null,
                      meeting_link: args.meeting_link || null,
                      attendee_emails: attendeeEmails,
                      tags: ['ai-created']
                    })
                    .select()
                    .single();

                  if (!meetingError && meetingData) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'meeting_created', meeting: meetingData, attendees: attendeeEmails })}\n\n`
                      )
                    );
                  }
                }

                else if (funcName === 'record_learning') {
                  // Record the learning for future use
                  await supabaseClient
                    .from('ai_learnings')
                    .insert({
                      user_id: user.id,
                      learning_type: args.learning_type,
                      category: args.category || 'general',
                      pattern: args.pattern,
                      resolution: args.resolution,
                      confidence: 0.7
                    });

                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'learning_recorded',
                        message: `I've noted that preference and will apply it in future interactions.`
                      })}\n\n`
                    )
                  );
                }

              } catch (e) {
                console.error(`Error executing tool ${funcName}:`, e);
                
                // Record failed execution for learning
                if (activeConversationId) {
                  await supabaseClient
                    .from('ai_learnings')
                    .insert({
                      user_id: user.id,
                      learning_type: 'failed_execution',
                      category: funcName,
                      pattern: JSON.stringify(toolCall.function.arguments),
                      resolution: e instanceof Error ? e.message : 'Unknown error',
                      confidence: 0.3
                    });
                }

                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify({ 
                      type: 'tool_error', 
                      tool: funcName,
                      error: e instanceof Error ? e.message : 'Unknown error' 
                    })}\n\n`
                  )
                );
              }
            }
          }

          // Save assistant response to conversation
          if (user && activeConversationId && (fullResponse || toolCalls.length > 0)) {
            await supabaseClient
              .from('ai_messages')
              .insert({
                conversation_id: activeConversationId,
                user_id: user.id,
                role: 'assistant',
                content: fullResponse || 'Executed tools successfully.',
                tool_calls: toolCalls.length > 0 ? toolCalls : null,
                tool_results: toolCalls.length > 0 ? { executed: true } : null
              });

            // Update user interaction count
            await supabaseClient
              .from('ai_user_preferences')
              .upsert({
                user_id: user.id,
                interaction_count: (userPreferences?.interaction_count || 0) + 1,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });
          }

          // Ensure we always send something if no content was generated
          if (!hasContent && toolCalls.length === 0) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({
                  choices: [{
                    delta: { 
                      content: "I'm here to help! You can ask me to navigate anywhere in the platform, search your CRM, query your data, create contacts or companies, schedule meetings, or analyze uploaded images. I maintain context throughout our conversation and learn from our interactions. What would you like to do?" 
                    }
                  }]
                })}\n\n`
              )
            );
          }

          // Send conversation_id back to client
          if (activeConversationId) {
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ type: 'conversation_id', id: activeConversationId })}\n\n`
              )
            );
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                choices: [{
                  delta: { 
                    content: "I encountered an issue processing your request. Could you try rephrasing or let me know what you'd like help with?" 
                  }
                }]
              })}\n\n`
            )
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in ai-assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        fallback_message: "I'm having trouble connecting right now. Please try again in a moment, or let me know what you need help with."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
