import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { CORE_PLATFORM_KNOWLEDGE, getDetailedKnowledge } from './platformKnowledge.ts';

// Model Router - Smart model selection for cost optimization
type ModelTier = 'nano' | 'fast' | 'pro' | 'premium';
type TaskType = 'classification' | 'extraction' | 'routing' | 'summary' | 'translation' | 'general_qa' | 'content_generation' | 'complex_reasoning' | 'tool_calling' | 'research' | 'erp_generation' | 'website_generation' | 'business_analysis' | 'critical_decision';

const MODELS = {
  nano: { name: 'google/gemini-2.5-flash-lite', costPer1K: 0.0001, maxTokens: 2000 },
  fast: { name: 'google/gemini-2.5-flash', costPer1K: 0.0003, maxTokens: 4000 },
  pro: { name: 'google/gemini-2.5-pro', costPer1K: 0.003, maxTokens: 8000 },
  premium: { name: 'google/gemini-3-pro-preview', costPer1K: 0.006, maxTokens: 8000 }
} as const;

function selectModelForTask(hasToolCalls: boolean, messageLength: number, historyLength: number): { model: string; tier: ModelTier; costPer1K: number } {
  // Tool calling always needs Pro tier for reliability
  if (hasToolCalls) {
    return { model: MODELS.pro.name, tier: 'pro', costPer1K: MODELS.pro.costPer1K };
  }
  // Long context or complex conversations need Pro
  if (messageLength > 1500 || historyLength > 20) {
    return { model: MODELS.pro.name, tier: 'pro', costPer1K: MODELS.pro.costPer1K };
  }
  // Default to Fast tier for most conversations (cost optimization)
  return { model: MODELS.fast.name, tier: 'fast', costPer1K: MODELS.fast.costPer1K };
}

// Usage tracking helper
async function trackUsage(supabase: any, model: string, tier: string, tokensEstimate: number, costPer1K: number, feature: string) {
  const today = new Date().toISOString().split('T')[0];
  const estimatedCost = (tokensEstimate / 1000) * costPer1K;
  
  try {
    // Upsert to ai_model_usage
    const { data: existing } = await supabase
      .from('ai_model_usage')
      .select('id, tokens_input, tokens_output, requests_count, total_cost')
      .eq('model_name', model)
      .eq('usage_date', today)
      .single();

    if (existing) {
      await supabase.from('ai_model_usage').update({
        tokens_input: (existing.tokens_input || 0) + tokensEstimate,
        requests_count: (existing.requests_count || 0) + 1,
        total_cost: (existing.total_cost || 0) + estimatedCost
      }).eq('id', existing.id);
    } else {
      await supabase.from('ai_model_usage').insert({
        model_name: model,
        model_provider: model.split('/')[0] || 'google',
        tokens_input: tokensEstimate,
        tokens_output: 0,
        requests_count: 1,
        total_cost: estimatedCost,
        usage_date: today,
        metadata: { feature, tier }
      });
    }
  } catch (e) {
    console.error('Usage tracking error:', e);
  }
}

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
  businessspawn: { path: '/business-spawn', title: 'Business Spawn', description: 'AGI-powered business creation wizard' },
  archiveimports: { path: '/archive-imports', title: 'Archive Imports', description: 'Import and process OpenAI/ChatGPT data exports' },
  archivereview: { path: '/archive-review', title: 'Archive Review', description: 'Review and approve extracted entities from archives' },
  usermanagement: { path: '/user-management', title: 'User Management', description: 'Manage users, roles, and permissions (Admin only)' },
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

    // Get current date/time for context
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    const currentDateTime = now.toLocaleDateString('en-US', dateOptions);
    const currentDateSimple = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

    // Build comprehensive system prompt with platform knowledge
    const systemPrompt = `You are Biz and Dev, the AI assistant for Biz Dev App - a comprehensive multi-tenant business development platform. You have COMPLETE knowledge and capabilities across the entire platform AND can execute powerful actions.

${CORE_PLATFORM_KNOWLEDGE}

## CURRENT DATE & TIME
**Today is ${currentDateSimple}** (${dayOfWeek})
**Current time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}**
**Full timestamp: ${currentDateTime}**

You ALWAYS know the current date and time. When asked "what day is it?", "what's the date?", "what time is it?", or similar questions, respond with the accurate current date/time information above.

## CRITICAL RULES - READ CAREFULLY

1. **MAINTAIN CONVERSATION CONTEXT** - You have access to the full conversation history. ALWAYS refer back to what was discussed. If you said you would do something, DO IT immediately.

2. **NEVER LOSE CONTEXT** - If you're in the middle of a task, COMPLETE IT. Don't reset or start over. You remember everything from this conversation.

3. **EXECUTE TOOLS IMMEDIATELY** - When a task requires a tool (search, create, query, generate), USE IT RIGHT AWAY. Don't just say you'll do it - actually do it.

4. **ALWAYS PROVIDE A MEANINGFUL RESPONSE** - Never leave an empty message. If you completed a task, confirm what you did. If you can't complete a task, explain why.

5. **LEARN FROM CORRECTIONS** - If the user corrects you or points out a mistake, acknowledge it, learn from it, and improve immediately.

6. **BE PROACTIVE** - If you detect a URL, company name, or entity, automatically look it up in the CRM. Don't ask permission for lookups - just do it.

7. **FOLLOW THROUGH** - When you say "Let me check for X", you MUST actually check for X and report the results in the same response or immediately after.

8. **NAVIGATION RULES - CRITICAL**:
   - ONLY suggest navigation when the user EXPLICITLY asks to go somewhere (e.g., "take me to...", "go to...", "show me the...")
   - NEVER mention navigation when answering research questions, searches, or general inquiries
   - NEVER mention "User Management" - this feature does not exist
   - For research/search questions, focus ONLY on delivering the research results
   - Do NOT suggest related pages or modules unless explicitly asked

9. **RESEARCH FLOW**:
   - When asked to research something, perform the web_research tool IMMEDIATELY
   - After research completes, ALWAYS display the results clearly
   - Present follow-up options: "Add to CRM", "Search for more", "Ask a follow-up question"
   - NEVER say you're doing research and then provide no results - the research tool will return results that must be shown

## PLATFORM MODULES (All navigable)

${Object.entries(ROUTES).map(([key, route]) => `- **${route.title}** (${route.path}): ${route.description}`).join('\n')}

## ACTION CAPABILITIES - USE THESE TOOLS

### URL-Based Business Import (CRITICAL - DETECT THESE PATTERNS)
When users paste a URL along with import commands like:
- "import this business", "import this company"
- "spawn from this URL", "spawn from this site"  
- "add this company to platform"
- "create workspace for this"
- "onboard this business"

USE **analyze_business_url** to scrape the site and offer to spawn a workspace. This is a high-priority detection pattern.

### URL Scraping (REAL CONTENT EXTRACTION)
- **scrape_url**: Fetch and extract actual content from a specific URL. USE THIS when a user provides a link/URL and wants you to analyze it.
- This actually fetches the webpage and extracts text content
- NOTE: Some platforms (TikTok, Instagram) block scraping - inform user if blocked

### Business URL Analysis & Import
- **analyze_business_url**: Scrape a company website and offer to spawn a workspace for it on the platform. This is for IMPORTING EXISTING BUSINESSES from their website URL.
- USE THIS when users paste a URL with import intent (import, spawn, add company, create workspace, onboard)
- The tool will scrape the site, extract business info, and ask if user wants to create a platform workspace for it

### Web Research (GENERAL KNOWLEDGE)
- **web_research**: Search for general information on topics (NOT specific URLs)
- USE THIS for general questions about trends, news, concepts - NOT for specific links

### ERP Generation
- **generate_erp**: Create complete ERP structures for companies with folder hierarchies, workflows, integrations, and AI assessments
- USE THIS when users ask to set up company infrastructure, organizational structure, or business systems

### Website Generation
- **generate_website**: Create professional landing pages with sections, content, themes, and styling
- USE THIS when users ask to build websites, landing pages, or web presence

### Business Spawning (AGI-POWERED)
- **spawn_business**: Launch a complete new business through the AGI system. This orchestrates research, ERP generation, website creation, and workspace provisioning all at once.
- USE THIS when users want to start a new business, create a company, launch a venture, or spawn an organization. This is the most powerful tool for business creation.
- NOTE: For importing EXISTING businesses from a URL, use analyze_business_url first

### Content Generation
- **generate_content**: Create emails, social media posts, articles, and scripts
- USE THIS when users ask to write, draft, compose, or create any content

### CRM Operations
- **search_crm**: ALWAYS search first when users ask about companies/contacts
- **create_contact**, **create_company**, **create_deal**: Add new records
- **log_activity**: Track time and activities
- **create_meeting**, **create_task**: Schedule meetings and tasks

### Navigation
- **navigate_to**: Take users anywhere in the platform instantly

### Data & Analytics  
- **query_analytics**, **get_insights**: Generate visualizations and insights from platform data

### Content Processing
- **extract_from_content**: Analyze uploaded images (business cards, documents, screenshots)

### OpenAI/ChatGPT Archive Import (IMPORTANT - THIS FEATURE EXISTS!)
Users CAN upload their ChatGPT/OpenAI data export archives to the platform. Here's how:

**Option 1 - Direct Upload in Dashboard Chat:**
- Users can DRAG AND DROP their OpenAI export ZIP file directly onto this chat bar
- The system will detect the ZIP file and initiate the archive import wizard
- This is the easiest way to import archives

**Option 2 - Archive Imports Module:**
- Navigate to /archive-imports or say "go to archive imports"
- Click "New Import" to start the import wizard
- Upload the ZIP file, select workspace, and configure permissions
- The system will process the archive and extract:
  - Conversations and messages
  - Business entities mentioned
  - Contacts and relationships
  - Strategies and insights
  - Knowledge items

**After Import:**
- Navigate to /archive-review to review and approve extracted entities
- Entities are committed to the appropriate modules (CRM, Research Studio, etc.)
- Full provenance tracking back to source messages

When users ask about uploading ChatGPT archives, OpenAI exports, or importing their AI conversation history, EXPLAIN THIS FEATURE and offer to navigate them to /archive-imports/new to start importing.

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

When generating content/ERP/website, confirm what was created and offer next steps.

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

    // Define comprehensive tools for all modules
    const tools = [
      {
        type: "function",
        function: {
          name: "search_platform",
          description: "Universal search across ALL platform data. Use this for any search query - it searches CRM, tasks, deals, activities, clients, workflows, fleet, construction, and more. ALWAYS use this when user asks about anything that could be stored in the system.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query - name, keyword, ID, or description"
              },
              modules: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["crm_contacts", "crm_companies", "crm_deals", "crm_activities", "clients", "tasks", "deal_rooms", "workflows", "fleet_work_orders", "fleet_partners", "construction_projects", "knowledge_items", "communications", "events", "all"]
                },
                description: "Which modules to search. Use 'all' to search everything."
              },
              limit: {
                type: "number",
                description: "Max results per module (default 10)"
              }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
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
          name: "search_tasks",
          description: "Search tasks and activities. Use when user asks about tasks, to-dos, follow-ups, or scheduled activities.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search keywords" },
              status: { type: "string", enum: ["pending", "in_progress", "completed", "all"], description: "Filter by status" },
              priority: { type: "string", enum: ["low", "medium", "high", "all"], description: "Filter by priority" }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_deals",
          description: "Search deals and opportunities. Use when user asks about deals, pipeline, revenue, opportunities, or sales.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Deal name, company, or keywords" },
              stage: { type: "string", enum: ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost", "all"], description: "Filter by stage" },
              min_value: { type: "number", description: "Minimum deal value" }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_deal_rooms",
          description: "Search collaborative deal rooms. Use when user asks about deal rooms, collaborations, or joint ventures.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Deal room name or description" },
              status: { type: "string", enum: ["draft", "active", "completed", "archived", "all"] }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_fleet",
          description: "Search fleet management data - work orders, partners, vehicles, drivers. Use when user asks about fleet, vehicles, drivers, work orders, or service.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search keywords" },
              search_type: { type: "string", enum: ["work_orders", "partners", "all"], description: "What to search" }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_construction",
          description: "Search construction projects, bids, estimates. Use when user asks about projects, construction, bids, or estimates.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Project name, client, or keywords" },
              status: { type: "string", enum: ["bidding", "awarded", "in_progress", "completed", "all"] }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_workflows",
          description: "Search automation workflows. Use when user asks about workflows, automations, or processes.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Workflow name or description" },
              status: { type: "string", enum: ["active", "inactive", "draft", "all"] }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_knowledge",
          description: "Search knowledge items, documents, notes, and research. Use when user asks about documents, notes, research, or knowledge.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search keywords" },
              source_type: { type: "string", enum: ["document", "text", "url", "video", "audio", "all"] }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_communications",
          description: "Search emails, messages, and communication history. Use when user asks about emails, messages, or communication.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Subject, sender, or content keywords" },
              communication_type: { type: "string", enum: ["email", "sms", "call", "notification", "all"] }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_clients",
          description: "Search client accounts. Use when user asks about clients, accounts, or customer organizations.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Client name or keywords" }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_insights",
          description: "Get intelligent insights and summaries about data. Use when user asks 'how many', 'what is the total', 'summarize', or any analytical question.",
          parameters: {
            type: "object",
            properties: {
              insight_type: {
                type: "string",
                enum: ["pipeline_summary", "task_status", "activity_summary", "deal_metrics", "contact_stats", "revenue_analysis", "general"],
                description: "Type of insight to generate"
              },
              timeframe: {
                type: "string",
                enum: ["today", "this_week", "this_month", "this_quarter", "this_year", "all_time"],
                description: "Time period for the analysis"
              },
              question: {
                type: "string",
                description: "The natural language question being answered"
              }
            },
            required: ["insight_type", "question"],
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
          description: "Add a new contact to the CRM. Requires first name, last name, and email.",
          parameters: {
            type: "object",
            properties: {
              first_name: { type: "string", description: "Contact's first name (required)" },
              last_name: { type: "string", description: "Contact's last name (required)" },
              name: { type: "string", description: "Full name - will be parsed into first/last if provided instead of separate names" },
              email: { type: "string", description: "Email address (required)" },
              phone: { type: "string", description: "Phone number" },
              company_name: { type: "string", description: "Company name (will be looked up or created)" },
              title: { type: "string", description: "Job title" },
              notes: { type: "string", description: "Additional notes" },
              linkedin_url: { type: "string", description: "LinkedIn profile URL" }
            },
            required: ["email"],
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
      },
      {
        type: "function",
        function: {
          name: "scrape_url",
          description: "Fetch and extract content from a specific URL. Use this when user provides a URL/link and wants you to analyze, learn from, or understand the content. This actually fetches the page content. NOTE: Some social media platforms (TikTok, Instagram) block scraping - inform user if this happens.",
          parameters: {
            type: "object",
            properties: {
              url: { type: "string", description: "The full URL to scrape and analyze" }
            },
            required: ["url"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "web_research",
          description: "Search the web for real-time information using AI-powered search. Use this for general research topics, current events, market trends, news. Do NOT use this for specific URLs - use scrape_url instead.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "The research query or topic to search for" },
              focus: { 
                type: "string", 
                enum: ["general", "news", "academic", "business", "technical"],
                description: "Focus area for the search"
              }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generate_erp",
          description: "Generate a comprehensive ERP (Enterprise Resource Planning) structure for a company. Creates folder structures, workflows, integrations, and AI assessments. Use when user asks to build, create, or set up an ERP, organizational structure, or company infrastructure.",
          parameters: {
            type: "object",
            properties: {
              companyName: { type: "string", description: "Name of the company" },
              industry: { type: "string", description: "Industry sector (e.g., technology, manufacturing, healthcare)" },
              strategy: { type: "string", description: "Business strategy or focus (e.g., growth, efficiency, innovation)" },
              customDetails: { type: "string", description: "Additional requirements or specific needs" }
            },
            required: ["companyName", "industry"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generate_website",
          description: "Generate a professional landing page or website for a business. Creates sections, content, themes, and visual structure. Use when user asks to build, create, or design a website, landing page, or web presence.",
          parameters: {
            type: "object",
            properties: {
              businessName: { type: "string", description: "Name of the business" },
              businessDescription: { type: "string", description: "Description of the business, its services, and value proposition" },
              industry: { type: "string", description: "Industry or sector" },
              targetAudience: { type: "string", description: "Who the website is targeting" }
            },
            required: ["businessName", "businessDescription"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generate_content",
          description: "Generate professional content such as emails, social media posts, articles, or scripts. Use when user asks to write, create, draft, or compose any type of content.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "The topic or title for the content" },
              type: { 
                type: "string", 
                enum: ["email", "post", "article", "script"],
                description: "Type of content to generate"
              },
              additionalContext: { type: "string", description: "Additional context, tone, or requirements" }
            },
            required: ["title", "type"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_deal",
          description: "Create a new deal/opportunity in the CRM pipeline. Use when user asks to create a deal, add an opportunity, or track a potential sale.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Deal title or name" },
              value: { type: "number", description: "Deal value in dollars" },
              stage: { 
                type: "string", 
                enum: ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"],
                description: "Current stage of the deal"
              },
              company_name: { type: "string", description: "Associated company name" },
              probability: { type: "number", description: "Probability of closing (0-100)" },
              notes: { type: "string", description: "Additional notes about the deal" }
            },
            required: ["title", "stage"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "spawn_business",
          description: "Spawn a new business/company through the AGI-powered Business Spawning system. This initiates research, ERP generation, website creation, and workspace provisioning. Use when user wants to create a new business, start a company, launch a venture, or spawn an organization. The system will orchestrate all aspects of company creation.",
          parameters: {
            type: "object",
            properties: {
              businessName: { type: "string", description: "Name of the business to create" },
              description: { type: "string", description: "Description of what the business does, its products/services, and value proposition" },
              industry: { type: "string", description: "Industry or sector (e.g., technology, retail, healthcare, construction)" },
              targetMarket: { type: "string", description: "Target market or customer segment" },
              businessModel: { type: "string", description: "How the business will make money (e.g., SaaS, services, products, marketplace)" },
              runResearch: { type: "boolean", description: "Whether to run market research (default true)" },
              generateERP: { type: "boolean", description: "Whether to generate ERP structure (default true)" },
              generateWebsite: { type: "boolean", description: "Whether to generate a landing page (default true)" }
            },
            required: ["businessName", "description"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "analyze_business_url",
          description: "Scrape and analyze a company/business website URL to offer importing it as a workspace on the platform. USE THIS when user pastes a URL with import intent (e.g., 'import this business', 'spawn from this URL', 'add this company', 'create workspace for this', 'onboard this business'). This tool will fetch the website, extract business information, and present an offer to create a platform workspace.",
          parameters: {
            type: "object",
            properties: {
              url: { type: "string", description: "The URL of the business/company website to analyze" },
              intent: { type: "string", description: "The user's stated intent (import, spawn, add, onboard, etc.)" }
            },
            required: ["url"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "lookup_platform_help",
          description: "Look up detailed platform documentation for a specific feature, concept, or module. Use when users ask 'how does X work?', 'what is Y?', 'explain Z', 'how do I use...', or need guidance on platform features. This gives you comprehensive knowledge to answer their question.",
          parameters: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "The platform feature, concept, or module to look up (e.g., 'deal room', 'business spawning', 'xodiak', 'archive import', 'crm', 'workflows', 'credits')"
              },
              detail_level: {
                type: "string",
                enum: ["overview", "detailed", "how_to"],
                description: "Level of detail: overview (quick explanation), detailed (comprehensive), how_to (step-by-step guide)"
              }
            },
            required: ["topic"],
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

    console.log('Sending to AI gateway with', allMessages.length, 'messages');
    console.log('Last user message:', allMessages[allMessages.length - 1]?.content?.substring?.(0, 200) || allMessages[allMessages.length - 1]?.content);

    // Smart model selection - use Pro only when needed, Fast for general conversation
    const lastMessageLength = typeof allMessages[allMessages.length - 1]?.content === 'string' 
      ? allMessages[allMessages.length - 1].content.length 
      : 0;
    const hasToolsEnabled = tools && tools.length > 0;
    const selectedModel = selectModelForTask(hasToolsEnabled, lastMessageLength, allMessages.length);
    
    console.log(`Selected model: ${selectedModel.model} (tier: ${selectedModel.tier}) for ${allMessages.length} messages`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...allMessages
        ],
        tools: tools,
        stream: true,
      }),
    });

    // Track usage asynchronously (don't wait)
    trackUsage(supabaseClient, selectedModel.model, selectedModel.tier, lastMessageLength + 500, selectedModel.costPer1K, 'ai-assistant');

    console.log('AI gateway response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit hit');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
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
                  console.log('Invalid JSON in stream:', e);
                }
              }
            }
          }

          console.log('Stream complete. hasContent:', hasContent, 'toolCalls:', toolCalls.length, 'fullResponse length:', fullResponse.length);

          // If stream returned empty, make a non-streaming fallback call
          if (!hasContent && toolCalls.length === 0) {
            console.log('Stream empty, making fallback non-streaming call');
            try {
              // Use Flash for fallback - fast and cost-effective
              const fallbackResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                  stream: false,
                }),
              });
              
              // Track fallback usage
              trackUsage(supabaseClient, 'google/gemini-2.5-flash', 'fast', 500, 0.0003, 'ai-assistant-fallback');

              if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                const fallbackContent = fallbackData.choices?.[0]?.message?.content;
                const fallbackToolCalls = fallbackData.choices?.[0]?.message?.tool_calls;

                if (fallbackContent) {
                  hasContent = true;
                  fullResponse = fallbackContent;
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({
                        choices: [{ delta: { content: fallbackContent } }]
                      })}\n\n`
                    )
                  );
                }

                if (fallbackToolCalls && fallbackToolCalls.length > 0) {
                  toolCalls = fallbackToolCalls;
                  console.log('Fallback got', toolCalls.length, 'tool calls');
                }
              }
            } catch (fallbackError) {
              console.error('Fallback call failed:', fallbackError);
            }
          }

          // Process tool calls after streaming
          if (user && toolCalls.length > 0) {
            console.log('Processing', toolCalls.length, 'tool calls');
            for (const toolCall of toolCalls) {
              const funcName = toolCall.function.name;
              
              try {
                const args = JSON.parse(toolCall.function.arguments);
                console.log(`Executing tool: ${funcName}`, args);

                if (funcName === 'search_platform') {
                  // Universal search across all modules
                  const searchQuery = args.query.toLowerCase();
                  const modules = args.modules || ['all'];
                  const limit = args.limit || 10;
                  const results: any = {};
                  
                  const searchAll = modules.includes('all');

                  if (searchAll || modules.includes('crm_contacts')) {
                    const { data } = await supabaseClient
                      .from('crm_contacts')
                      .select('id, name, email, phone, company, title')
                      .eq('user_id', user.id)
                      .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.contacts = data;
                  }

                  if (searchAll || modules.includes('crm_companies')) {
                    const { data } = await supabaseClient
                      .from('crm_companies')
                      .select('id, name, website, industry, phone')
                      .eq('user_id', user.id)
                      .or(`name.ilike.%${searchQuery}%,website.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.companies = data;
                  }

                  if (searchAll || modules.includes('crm_deals')) {
                    const { data } = await supabaseClient
                      .from('crm_deals')
                      .select('id, title, value, stage, company_id')
                      .eq('user_id', user.id)
                      .ilike('title', `%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.deals = data;
                  }

                  if (searchAll || modules.includes('crm_activities')) {
                    const { data } = await supabaseClient
                      .from('crm_activities')
                      .select('id, subject, description, activity_type, status, priority, due_date')
                      .eq('user_id', user.id)
                      .or(`subject.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.activities = data;
                  }

                  if (searchAll || modules.includes('clients')) {
                    const { data } = await supabaseClient
                      .from('clients')
                      .select('id, company_name, industry, status')
                      .eq('user_id', user.id)
                      .ilike('company_name', `%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.clients = data;
                  }

                  if (searchAll || modules.includes('deal_rooms')) {
                    const { data } = await supabaseClient
                      .from('deal_rooms')
                      .select('id, name, description, status, deal_value')
                      .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.deal_rooms = data;
                  }

                  if (searchAll || modules.includes('fleet_work_orders')) {
                    const { data } = await supabaseClient
                      .from('fleet_work_orders')
                      .select('id, order_number, description, status, priority')
                      .or(`order_number.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.work_orders = data;
                  }

                  if (searchAll || modules.includes('fleet_partners')) {
                    const { data } = await supabaseClient
                      .from('fleet_partners')
                      .select('id, name, partner_type, status')
                      .ilike('name', `%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.fleet_partners = data;
                  }

                  if (searchAll || modules.includes('construction_projects')) {
                    const { data } = await supabaseClient
                      .from('construction_projects')
                      .select('id, name, client_name, status, estimated_value')
                      .or(`name.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.construction_projects = data;
                  }

                  if (searchAll || modules.includes('knowledge_items')) {
                    const { data } = await supabaseClient
                      .from('knowledge_items')
                      .select('id, title, content, source_type, processing_status')
                      .eq('user_id', user.id)
                      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.knowledge = data;
                  }

                  if (searchAll || modules.includes('communications')) {
                    const { data } = await supabaseClient
                      .from('communications')
                      .select('id, subject, body, communication_type, status')
                      .eq('user_id', user.id)
                      .or(`subject.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`)
                      .limit(limit);
                    if (data?.length) results.communications = data;
                  }

                  const totalResults = Object.values(results).reduce((sum: number, arr: any) => sum + arr.length, 0);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'platform_search_result',
                        query: args.query,
                        results: results,
                        total_found: totalResults,
                        modules_searched: searchAll ? 'all' : modules,
                        message: totalResults > 0 
                          ? `Found ${totalResults} result(s) across ${Object.keys(results).length} module(s)` 
                          : `No results found for "${args.query}"`
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'search_crm') {
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

                else if (funcName === 'search_tasks') {
                  let query = supabaseClient
                    .from('crm_activities')
                    .select('id, subject, description, activity_type, status, priority, due_date')
                    .eq('user_id', user.id)
                    .or(`subject.ilike.%${args.query}%,description.ilike.%${args.query}%`);
                  
                  if (args.status && args.status !== 'all') {
                    query = query.eq('status', args.status);
                  }
                  if (args.priority && args.priority !== 'all') {
                    query = query.eq('priority', args.priority);
                  }
                  
                  const { data: tasks } = await query.limit(20);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'tasks_search_result',
                        query: args.query,
                        results: tasks || [],
                        found: (tasks?.length || 0) > 0,
                        message: tasks?.length ? `Found ${tasks.length} task(s)` : 'No tasks found'
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'search_deals') {
                  let query = supabaseClient
                    .from('crm_deals')
                    .select('id, title, value, stage, company_id, probability, expected_close_date')
                    .eq('user_id', user.id)
                    .ilike('title', `%${args.query}%`);
                  
                  if (args.stage && args.stage !== 'all') {
                    query = query.eq('stage', args.stage);
                  }
                  if (args.min_value) {
                    query = query.gte('value', args.min_value);
                  }
                  
                  const { data: deals } = await query.limit(20);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'deals_search_result',
                        query: args.query,
                        results: deals || [],
                        found: (deals?.length || 0) > 0,
                        total_value: deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0,
                        message: deals?.length ? `Found ${deals.length} deal(s) worth $${deals.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString()}` : 'No deals found'
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'search_deal_rooms') {
                  let query = supabaseClient
                    .from('deal_rooms')
                    .select('id, name, description, status, deal_value, created_at')
                    .or(`name.ilike.%${args.query}%,description.ilike.%${args.query}%`);
                  
                  if (args.status && args.status !== 'all') {
                    query = query.eq('status', args.status);
                  }
                  
                  const { data: rooms } = await query.limit(20);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'deal_rooms_search_result',
                        query: args.query,
                        results: rooms || [],
                        found: (rooms?.length || 0) > 0,
                        message: rooms?.length ? `Found ${rooms.length} deal room(s)` : 'No deal rooms found'
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'search_fleet') {
                  const results: any = {};
                  
                  if (args.search_type === 'work_orders' || args.search_type === 'all') {
                    const { data } = await supabaseClient
                      .from('fleet_work_orders')
                      .select('id, order_number, description, status, priority, created_at')
                      .or(`order_number.ilike.%${args.query}%,description.ilike.%${args.query}%`)
                      .limit(20);
                    if (data?.length) results.work_orders = data;
                  }
                  
                  if (args.search_type === 'partners' || args.search_type === 'all') {
                    const { data } = await supabaseClient
                      .from('fleet_partners')
                      .select('id, name, partner_type, status, contact_email')
                      .ilike('name', `%${args.query}%`)
                      .limit(20);
                    if (data?.length) results.partners = data;
                  }
                  
                  const totalResults = Object.values(results).reduce((sum: number, arr: any) => sum + arr.length, 0);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'fleet_search_result',
                        query: args.query,
                        results: results,
                        found: totalResults > 0,
                        message: totalResults > 0 ? `Found ${totalResults} fleet record(s)` : 'No fleet records found'
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'search_construction') {
                  let query = supabaseClient
                    .from('construction_projects')
                    .select('id, name, client_name, status, estimated_value, bid_due_date')
                    .or(`name.ilike.%${args.query}%,client_name.ilike.%${args.query}%`);
                  
                  if (args.status && args.status !== 'all') {
                    query = query.eq('status', args.status);
                  }
                  
                  const { data: projects } = await query.limit(20);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'construction_search_result',
                        query: args.query,
                        results: projects || [],
                        found: (projects?.length || 0) > 0,
                        message: projects?.length ? `Found ${projects.length} construction project(s)` : 'No construction projects found'
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'search_workflows') {
                  let query = supabaseClient
                    .from('workflows')
                    .select('id, name, description, status, trigger_type, created_at')
                    .eq('user_id', user.id)
                    .or(`name.ilike.%${args.query}%,description.ilike.%${args.query}%`);
                  
                  if (args.status && args.status !== 'all') {
                    query = query.eq('status', args.status);
                  }
                  
                  const { data: workflows } = await query.limit(20);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'workflows_search_result',
                        query: args.query,
                        results: workflows || [],
                        found: (workflows?.length || 0) > 0,
                        message: workflows?.length ? `Found ${workflows.length} workflow(s)` : 'No workflows found'
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'search_knowledge') {
                  let query = supabaseClient
                    .from('knowledge_items')
                    .select('id, title, content, source_type, processing_status, created_at')
                    .eq('user_id', user.id)
                    .or(`title.ilike.%${args.query}%,content.ilike.%${args.query}%`);
                  
                  if (args.source_type && args.source_type !== 'all') {
                    query = query.eq('source_type', args.source_type);
                  }
                  
                  const { data: items } = await query.limit(20);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'knowledge_search_result',
                        query: args.query,
                        results: items || [],
                        found: (items?.length || 0) > 0,
                        message: items?.length ? `Found ${items.length} knowledge item(s)` : 'No knowledge items found'
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'search_communications') {
                  let query = supabaseClient
                    .from('communications')
                    .select('id, subject, body, communication_type, status, created_at')
                    .eq('user_id', user.id)
                    .or(`subject.ilike.%${args.query}%,body.ilike.%${args.query}%`);
                  
                  if (args.communication_type && args.communication_type !== 'all') {
                    query = query.eq('communication_type', args.communication_type);
                  }
                  
                  const { data: comms } = await query.order('created_at', { ascending: false }).limit(20);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'communications_search_result',
                        query: args.query,
                        results: comms || [],
                        found: (comms?.length || 0) > 0,
                        message: comms?.length ? `Found ${comms.length} communication(s)` : 'No communications found'
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'search_clients') {
                  const { data: clients } = await supabaseClient
                    .from('clients')
                    .select('id, company_name, industry, status, website')
                    .eq('user_id', user.id)
                    .ilike('company_name', `%${args.query}%`)
                    .limit(20);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'clients_search_result',
                        query: args.query,
                        results: clients || [],
                        found: (clients?.length || 0) > 0,
                        message: clients?.length ? `Found ${clients.length} client(s)` : 'No clients found'
                      })}\n\n`
                    )
                  );
                }

                else if (funcName === 'get_insights') {
                  let insight: any = { summary: '', data: [], visualization: 'none' };
                  
                  if (args.insight_type === 'pipeline_summary' || args.insight_type === 'deal_metrics') {
                    const { data: deals } = await supabaseClient
                      .from('crm_deals')
                      .select('stage, value, probability')
                      .eq('user_id', user.id);
                    
                    const stages = deals?.reduce((acc: any, d) => {
                      acc[d.stage] = (acc[d.stage] || 0) + 1;
                      return acc;
                    }, {}) || {};
                    
                    const totalValue = deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
                    const weightedValue = deals?.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0) || 0;
                    
                    insight = {
                      summary: `Pipeline: ${deals?.length || 0} deals worth $${totalValue.toLocaleString()}. Weighted value: $${weightedValue.toLocaleString()}`,
                      data: Object.entries(stages).map(([stage, count]) => ({ label: stage, value: count })),
                      visualization: 'bar',
                      metrics: { total_deals: deals?.length || 0, total_value: totalValue, weighted_value: weightedValue }
                    };
                  }
                  
                  else if (args.insight_type === 'task_status') {
                    const { data: tasks } = await supabaseClient
                      .from('crm_activities')
                      .select('status, priority')
                      .eq('user_id', user.id);
                    
                    const statusCounts = tasks?.reduce((acc: any, t) => {
                      acc[t.status] = (acc[t.status] || 0) + 1;
                      return acc;
                    }, {}) || {};
                    
                    insight = {
                      summary: `Tasks: ${statusCounts.pending || 0} pending, ${statusCounts.completed || 0} completed, ${statusCounts.in_progress || 0} in progress`,
                      data: Object.entries(statusCounts).map(([status, count]) => ({ label: status, value: count })),
                      visualization: 'pie',
                      metrics: statusCounts
                    };
                  }
                  
                  else if (args.insight_type === 'contact_stats') {
                    const { count: contactCount } = await supabaseClient
                      .from('crm_contacts')
                      .select('*', { count: 'exact', head: true })
                      .eq('user_id', user.id);
                    
                    const { count: companyCount } = await supabaseClient
                      .from('crm_companies')
                      .select('*', { count: 'exact', head: true })
                      .eq('user_id', user.id);
                    
                    insight = {
                      summary: `CRM: ${contactCount || 0} contacts across ${companyCount || 0} companies`,
                      data: [
                        { label: 'Contacts', value: contactCount || 0 },
                        { label: 'Companies', value: companyCount || 0 }
                      ],
                      visualization: 'kpi',
                      metrics: { contacts: contactCount, companies: companyCount }
                    };
                  }
                  
                  else if (args.insight_type === 'activity_summary') {
                    const { data: activities } = await supabaseClient
                      .from('crm_activities')
                      .select('activity_type')
                      .eq('user_id', user.id);
                    
                    const typeCounts = activities?.reduce((acc: any, a) => {
                      acc[a.activity_type] = (acc[a.activity_type] || 0) + 1;
                      return acc;
                    }, {}) || {};
                    
                    insight = {
                      summary: `Activities: ${activities?.length || 0} total across ${Object.keys(typeCounts).length} types`,
                      data: Object.entries(typeCounts).map(([type, count]) => ({ label: type, value: count })),
                      visualization: 'bar',
                      metrics: typeCounts
                    };
                  }
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'insights_result',
                        insight_type: args.insight_type,
                        question: args.question,
                        result: insight
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
                  if (args.suggested_action === 'create_contact' && args.extracted_data.email) {
                    // Parse name into first/last
                    let firstName = args.extracted_data.first_name || '';
                    let lastName = args.extracted_data.last_name || '';
                    if (!firstName && args.extracted_data.name) {
                      const nameParts = args.extracted_data.name.trim().split(/\s+/);
                      firstName = nameParts[0] || '';
                      lastName = nameParts.slice(1).join(' ') || '';
                    }
                    
                    if (!firstName) {
                      console.error('Auto-create contact: No first name available');
                    } else {
                      // Look up or create company
                      let companyId: string | null = null;
                      const companyName = args.extracted_data.company;
                      if (companyName) {
                        const { data: existingCompany } = await supabaseClient
                          .from('crm_companies')
                          .select('id')
                          .eq('user_id', user.id)
                          .ilike('name', companyName)
                          .limit(1)
                          .maybeSingle();
                        
                        if (existingCompany) {
                          companyId = existingCompany.id;
                        } else {
                          const { data: newCompany } = await supabaseClient
                            .from('crm_companies')
                            .insert({ user_id: user.id, name: companyName, tags: ['ai-extracted'] })
                            .select('id')
                            .single();
                          if (newCompany) companyId = newCompany.id;
                        }
                      }
                      
                      const { data: contactData, error: contactError } = await supabaseClient
                        .from('crm_contacts')
                        .insert({
                          user_id: user.id,
                          first_name: firstName,
                          last_name: lastName || '',
                          email: args.extracted_data.email,
                          phone: args.extracted_data.phone || null,
                          company_id: companyId,
                          title: args.extracted_data.title || null,
                          tags: ['ai-extracted'],
                          lead_status: 'new',
                          lead_score: 0
                        })
                        .select()
                        .single();

                      if (contactError) {
                        console.error('Error auto-creating contact:', contactError);
                      } else if (contactData) {
                        controller.enqueue(
                          new TextEncoder().encode(
                            `data: ${JSON.stringify({ 
                              type: 'contact_created', 
                              contact: {
                                ...contactData,
                                full_name: `${firstName} ${lastName}`.trim()
                              }
                            })}\n\n`
                          )
                        );
                      }
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

                    if (companyError) {
                      console.error('Error auto-creating company:', companyError);
                    } else if (companyData) {
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
                  // Parse name into first/last if separate names not provided
                  let firstName = args.first_name || '';
                  let lastName = args.last_name || '';
                  
                  // If full name provided but not first/last, parse it
                  if (!firstName && args.name) {
                    const nameParts = args.name.trim().split(/\s+/);
                    firstName = nameParts[0] || '';
                    lastName = nameParts.slice(1).join(' ') || '';
                  }
                  
                  // Validate required fields
                  if (!firstName) {
                    console.error('create_contact error: First name is required');
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'tool_error', 
                          tool: 'create_contact',
                          error: 'First name is required. Please provide the contact\'s first name.' 
                        })}\n\n`
                      )
                    );
                    continue;
                  }
                  
                  if (!args.email) {
                    console.error('create_contact error: Email is required');
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'tool_error', 
                          tool: 'create_contact',
                          error: 'Email is required. Please provide the contact\'s email address.' 
                        })}\n\n`
                      )
                    );
                    continue;
                  }
                  
                  // Look up or create company if provided
                  let companyId: string | null = null;
                  const companyName = args.company_name || args.company;
                  if (companyName) {
                    // Try to find existing company
                    const { data: existingCompany } = await supabaseClient
                      .from('crm_companies')
                      .select('id')
                      .eq('user_id', user.id)
                      .ilike('name', companyName)
                      .limit(1)
                      .maybeSingle();
                    
                    if (existingCompany) {
                      companyId = existingCompany.id;
                    } else {
                      // Create the company
                      const { data: newCompany, error: newCompanyError } = await supabaseClient
                        .from('crm_companies')
                        .insert({ 
                          user_id: user.id, 
                          name: companyName,
                          tags: ['ai-created']
                        })
                        .select('id')
                        .single();
                      
                      if (newCompany) {
                        companyId = newCompany.id;
                        console.log(`Created new company: ${companyName} with id: ${companyId}`);
                      } else if (newCompanyError) {
                        console.error('Error creating company:', newCompanyError);
                      }
                    }
                  }
                  
                  // Insert contact with correct column names matching database schema
                  const { data: contactData, error: contactError } = await supabaseClient
                    .from('crm_contacts')
                    .insert({
                      user_id: user.id,
                      first_name: firstName,
                      last_name: lastName || '',
                      email: args.email,
                      phone: args.phone || null,
                      company_id: companyId,
                      title: args.title || null,
                      notes: args.notes || null,
                      linkedin_url: args.linkedin_url || null,
                      tags: ['ai-created'],
                      lead_status: 'new',
                      lead_score: 0
                    })
                    .select()
                    .single();

                  if (contactError) {
                    console.error('Error creating contact:', contactError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'tool_error', 
                          tool: 'create_contact',
                          error: `Failed to create contact: ${contactError.message}` 
                        })}\n\n`
                      )
                    );
                  } else if (contactData) {
                    console.log('Contact created successfully:', contactData.id);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'contact_created', 
                          contact: {
                            ...contactData,
                            full_name: `${firstName} ${lastName}`.trim(),
                            company_name: companyName || null
                          }
                        })}\n\n`
                      )
                    );

                    // Trigger async research and embedding for the new contact
                    const supabaseUrl = Deno.env.get('SUPABASE_URL');
                    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
                    
                    if (supabaseUrl && serviceRoleKey) {
                      // Fire and forget - don't await, let it run in background
                      fetch(`${supabaseUrl}/functions/v1/research-and-embed-contact`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${serviceRoleKey}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ contactId: contactData.id })
                      }).then(res => {
                        if (res.ok) {
                          console.log(`Research triggered for contact ${contactData.id}`);
                        } else {
                          console.error(`Failed to trigger research for contact ${contactData.id}`);
                        }
                      }).catch(err => {
                        console.error('Error triggering contact research:', err);
                      });

                      // Notify user that research is queued
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'research_queued', 
                            message: `Researching ${args.email} and their company via Perplexity AI...`,
                            contactId: contactData.id
                          })}\n\n`
                        )
                      );
                    }
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

                // SCRAPE URL - Fetch and extract content from a specific URL
                else if (funcName === 'scrape_url') {
                  try {
                    console.log('[AI Assistant] Scraping URL:', args.url);
                    const scrapeResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/scrape-url`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ url: args.url }),
                    });

                    const scrapeData = await scrapeResponse.json();
                    
                    if (scrapeData.success && scrapeData.scraped) {
                      // Successfully scraped - now analyze with AI
                      const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          model: 'google/gemini-2.5-flash',
                          messages: [
                            { 
                              role: 'system', 
                              content: `You are analyzing content from a webpage. Provide a clear, accurate summary of what the page contains. Be specific about the actual content. If it's a video page, describe what the video is about based on the page content.` 
                            },
                            { 
                              role: 'user', 
                              content: `Analyze this webpage content:\n\nTitle: ${scrapeData.title}\nDescription: ${scrapeData.description}\n\nContent:\n${scrapeData.text.substring(0, 15000)}\n\nProvide a concise analysis of what this page is about.` 
                            }
                          ],
                        }),
                      });

                      const analysisData = await analysisResponse.json();
                      const analysis = analysisData.choices?.[0]?.message?.content || 'Could not analyze content.';
                      
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'url_scraped',
                            url: args.url,
                            title: scrapeData.title,
                            description: scrapeData.description,
                            analysis: analysis,
                            linkCount: scrapeData.links?.length || 0,
                            timestamp: new Date().toISOString()
                          })}\n\n`
                        )
                      );
                    } else {
                      // Could not scrape - might be blocked
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'url_scrape_blocked',
                            url: args.url,
                            note: scrapeData.note || scrapeData.error || 'Unable to access this URL. The website may block automated requests.',
                            timestamp: new Date().toISOString()
                          })}\n\n`
                        )
                      );
                    }
                  } catch (scrapeError) {
                    console.error('[AI Assistant] Scrape error:', scrapeError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'url_scrape_error',
                          url: args.url,
                          error: 'Failed to fetch URL content'
                        })}\n\n`
                      )
                    );
                  }
                }

                // WEB RESEARCH - Real-time web search using Perplexity AI
                else if (funcName === 'web_research') {
                  try {
                    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
                    let researchContent = '';
                    let citations: string[] = [];
                    let usedPerplexity = false;

                    // Try Perplexity first for real-time web search
                    if (PERPLEXITY_API_KEY) {
                      console.log('[AI Assistant] Using Perplexity for web research:', args.query);
                      
                      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          model: 'sonar',
                          messages: [
                            { 
                              role: 'system', 
                              content: `You are a research assistant providing accurate, up-to-date information. Focus on: ${args.focus || 'general'} information. Include specific data, sources, and actionable insights. Today is ${new Date().toISOString().split('T')[0]}.` 
                            },
                            { role: 'user', content: args.query }
                          ],
                        }),
                      });

                      if (perplexityResponse.ok) {
                        const perplexityData = await perplexityResponse.json();
                        researchContent = perplexityData.choices?.[0]?.message?.content || '';
                        citations = perplexityData.citations || [];
                        usedPerplexity = true;
                        console.log('[AI Assistant] Perplexity search successful, citations:', citations.length);
                      } else {
                        console.error('[AI Assistant] Perplexity error:', perplexityResponse.status);
                      }
                    }

                    // Fallback to Lovable AI if Perplexity unavailable
                    if (!researchContent) {
                      console.log('[AI Assistant] Falling back to Lovable AI for research');
                      const searchResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          model: 'google/gemini-2.5-flash',
                          messages: [
                            { 
                              role: 'system', 
                              content: `You are a research assistant. Provide comprehensive, accurate information. Focus on: ${args.focus || 'general'} information. Today is ${new Date().toISOString().split('T')[0]}.` 
                            },
                            { role: 'user', content: args.query }
                          ],
                        }),
                      });

                      if (searchResponse.ok) {
                        const searchData = await searchResponse.json();
                        researchContent = searchData.choices?.[0]?.message?.content || 'No research results found.';
                      }
                    }

                    if (researchContent) {
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'web_research_result',
                            query: args.query,
                            focus: args.focus || 'general',
                            result: researchContent,
                            citations: citations,
                            source: usedPerplexity ? 'perplexity' : 'lovable_ai',
                            timestamp: new Date().toISOString()
                          })}\n\n`
                        )
                      );
                    } else {
                      throw new Error('Research service unavailable');
                    }
                  } catch (researchError) {
                    console.error('[AI Assistant] Web research error:', researchError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'web_research_error',
                          error: 'Unable to complete research at this time'
                        })}\n\n`
                      )
                    );
                  }
                }

                // GENERATE ERP - Create company ERP structure
                else if (funcName === 'generate_erp') {
                  try {
                    const erpResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/erp-generate`, {
                      method: 'POST',
                      headers: {
                        'Authorization': authHeader!,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        companyName: args.companyName,
                        industry: args.industry,
                        strategy: args.strategy || 'general',
                        customDetails: args.customDetails || ''
                      }),
                    });

                    if (erpResponse.ok) {
                      const erpData = await erpResponse.json();
                      
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'erp_generated',
                            configId: erpData.configId,
                            company: args.companyName,
                            industry: args.industry,
                            structure: erpData.structure,
                            message: `Successfully created ERP structure for ${args.companyName}. Navigate to the ERP module to view and customize.`
                          })}\n\n`
                        )
                      );
                    } else {
                      const errorData = await erpResponse.json();
                      throw new Error(errorData.error || 'Failed to generate ERP');
                    }
                  } catch (erpError) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'erp_generation_error',
                          error: erpError instanceof Error ? erpError.message : 'Unable to generate ERP'
                        })}\n\n`
                      )
                    );
                  }
                }

                // GENERATE WEBSITE - Create landing pages
                else if (funcName === 'generate_website') {
                  try {
                    const webResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-webpage`, {
                      method: 'POST',
                      headers: {
                        'Authorization': authHeader!,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        businessName: args.businessName,
                        businessDescription: args.businessDescription,
                        industry: args.industry || '',
                        targetAudience: args.targetAudience || ''
                      }),
                    });

                    if (webResponse.ok) {
                      const webData = await webResponse.json();
                      
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'website_generated',
                            business: args.businessName,
                            title: webData.title,
                            sections: webData.sections?.length || 0,
                            theme: webData.theme,
                            content: webData,
                            message: `Successfully generated a ${webData.sections?.length || 0}-section landing page for ${args.businessName}. Navigate to Website Builder to preview and publish.`
                          })}\n\n`
                        )
                      );
                    } else {
                      const errorData = await webResponse.json();
                      throw new Error(errorData.error || 'Failed to generate website');
                    }
                  } catch (webError) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'website_generation_error',
                          error: webError instanceof Error ? webError.message : 'Unable to generate website'
                        })}\n\n`
                      )
                    );
                  }
                }

                // GENERATE CONTENT - Create emails, posts, articles, scripts
                else if (funcName === 'generate_content') {
                  try {
                    const contentResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-content`, {
                      method: 'POST',
                      headers: {
                        'Authorization': authHeader!,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        title: args.title,
                        type: args.type,
                        additionalContext: args.additionalContext || ''
                      }),
                    });

                    if (contentResponse.ok) {
                      const contentData = await contentResponse.json();
                      
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'content_generated',
                            contentType: args.type,
                            title: args.title,
                            content: contentData.content,
                            message: `Generated ${args.type}: "${args.title}"`
                          })}\n\n`
                        )
                      );
                    } else {
                      const errorData = await contentResponse.json();
                      throw new Error(errorData.error || 'Failed to generate content');
                    }
                  } catch (contentError) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'content_generation_error',
                          error: contentError instanceof Error ? contentError.message : 'Unable to generate content'
                        })}\n\n`
                      )
                    );
                  }
                }

                // SPAWN BUSINESS - AGI-powered business creation
                else if (funcName === 'spawn_business') {
                  try {
                    // Step 1: Start the business spawning process
                    const startResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/business-spawn`, {
                      method: 'POST',
                      headers: {
                        'Authorization': authHeader!,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ action: 'start' }),
                    });

                    if (!startResponse.ok) {
                      const errorData = await startResponse.json();
                      throw new Error(errorData.error || 'Failed to start business spawn');
                    }

                    const startData = await startResponse.json();
                    
                    if (startData.requiresApproval) {
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'business_spawn_requires_approval',
                            message: 'You already have a business. Please request admin approval to create additional businesses.'
                          })}\n\n`
                        )
                      );
                    } else if (startData.businessId) {
                      // Step 2: Chat with business context to set up the business
                      const chatResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/business-spawn`, {
                        method: 'POST',
                        headers: {
                          'Authorization': authHeader!,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          action: 'chat',
                          businessId: startData.businessId,
                          message: `I want to create a business called "${args.businessName}". Description: ${args.description}. Industry: ${args.industry || 'general'}. Target market: ${args.targetMarket || 'general'}. Business model: ${args.businessModel || 'consulting/services'}. Please proceed with research, generate the ERP structure, and create a professional website.`,
                          phase: 'discovery'
                        }),
                      });

                      const chatData = chatResponse.ok ? await chatResponse.json() : { message: 'Business creation started' };
                      
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'business_spawned',
                            businessId: startData.businessId,
                            businessName: args.businessName,
                            status: 'spawning',
                            research: args.runResearch !== false,
                            erp: args.generateERP !== false,
                            website: args.generateWebsite !== false,
                            business: chatData.business || null,
                            aiResponse: chatData.message,
                            message: `🚀 Business "${args.businessName}" is being spawned! AGI agents are conducting research, building ERP structure, and creating your website. Navigate to Business Spawn to see the progress in real-time.`
                          })}\n\n`
                        )
                      );
                    }
                  } catch (spawnError) {
                    console.error('Spawn business error:', spawnError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'business_spawn_error',
                          error: spawnError instanceof Error ? spawnError.message : 'Unable to spawn business'
                        })}\n\n`
                      )
                    );
                  }
                }

                // ANALYZE BUSINESS URL - Scrape company website and offer to import
                else if (funcName === 'analyze_business_url') {
                  try {
                    console.log('[AI Assistant] Analyzing business URL:', args.url);
                    
                    // Step 1: Scrape the URL
                    const scrapeResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/scrape-url`, {
                      method: 'POST',
                      headers: {
                        'Authorization': authHeader!,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ url: args.url }),
                    });

                    const scrapeData = await scrapeResponse.json();
                    
                    if (!scrapeData.success) {
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'business_url_analysis_error',
                            url: args.url,
                            error: scrapeData.error || 'Unable to fetch the website'
                          })}\n\n`
                        )
                      );
                    } else {
                      // Step 2: Use AI to analyze the business from scraped content
                      const analysisPrompt = `Analyze this website content and extract business information:

URL: ${args.url}
Title: ${scrapeData.title || 'Unknown'}
Description: ${scrapeData.description || 'None'}
Content: ${scrapeData.text?.substring(0, 3000) || 'No content extracted'}

Extract and return:
1. Business name
2. Industry/sector
3. Main products or services
4. Target market (if discernible)
5. Business model (SaaS, services, products, marketplace, etc.)
6. Key value proposition

Format as a brief JSON-like summary.`;

                      // Use AI to analyze
                      const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          model: 'google/gemini-2.5-flash',
                          messages: [
                            { role: 'user', content: analysisPrompt }
                          ],
                          max_tokens: 1000
                        }),
                      });

                      let businessAnalysis = '';
                      if (analysisResponse.ok) {
                        const analysisResult = await analysisResponse.json();
                        businessAnalysis = analysisResult.choices?.[0]?.message?.content || '';
                      }

                      // Send the analysis result with import offer
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'business_url_analyzed',
                            url: args.url,
                            scraped: {
                              title: scrapeData.title,
                              description: scrapeData.description,
                              text: scrapeData.text?.substring(0, 2000),
                              links: scrapeData.links?.slice(0, 10) || []
                            },
                            analysis: businessAnalysis,
                            offer: {
                              action: 'spawn_workspace',
                              message: "I've analyzed the website for " + (scrapeData.title || args.url) + ". Would you like me to create a workspace for this business on the platform? This will set up a dedicated workspace with ERP structure and optional integrations. You can also connect knowledge sources like GitHub repos, documentation, or manual notes to help the platform learn about this business."
                            }
                          })}\n\n`
                        )
                      );
                    }
                  } catch (analyzeError) {
                    console.error('Analyze business URL error:', analyzeError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'business_url_analysis_error',
                          url: args.url,
                          error: analyzeError instanceof Error ? analyzeError.message : 'Unable to analyze business website'
                        })}\n\n`
                      )
                    );
                  }
                }

                // LOOKUP PLATFORM HELP - Answer platform questions
                else if (funcName === 'lookup_platform_help') {
                  const topic = args.topic || '';
                  const detailLevel = args.detail_level || 'detailed';
                  
                  const knowledge = getDetailedKnowledge(topic, detailLevel);
                  
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'platform_help_result',
                        topic: topic,
                        detail_level: detailLevel,
                        content: knowledge,
                        message: `Here's information about ${topic}`
                      })}\n\n`
                    )
                  );
                }

                // CREATE DEAL - Add opportunity to CRM
                else if (funcName === 'create_deal') {
                  let companyId = null;
                  
                  // Find or create company
                  if (args.company_name) {
                    const { data: existingCompany } = await supabaseClient
                      .from('crm_companies')
                      .select('id')
                      .eq('user_id', user.id)
                      .ilike('name', args.company_name)
                      .limit(1)
                      .single();
                    
                    if (existingCompany) {
                      companyId = existingCompany.id;
                    } else {
                      // Create the company
                      const { data: newCompany } = await supabaseClient
                        .from('crm_companies')
                        .insert({
                          user_id: user.id,
                          name: args.company_name,
                          tags: ['ai-created']
                        })
                        .select()
                        .single();
                      companyId = newCompany?.id;
                    }
                  }

                  const { data: dealData, error: dealError } = await supabaseClient
                    .from('crm_deals')
                    .insert({
                      user_id: user.id,
                      title: args.title,
                      value: args.value || 0,
                      stage: args.stage || 'lead',
                      probability: args.probability || 10,
                      company_id: companyId,
                      description: args.notes || null,
                      tags: ['ai-created']
                    })
                    .select()
                    .single();

                  if (!dealError && dealData) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'deal_created', 
                          deal: dealData,
                          company_id: companyId,
                          message: `Created deal: "${args.title}" worth $${args.value?.toLocaleString() || 0}`
                        })}\n\n`
                      )
                    );
                  } else {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'deal_creation_error',
                          error: dealError?.message || 'Failed to create deal'
                        })}\n\n`
                      )
                    );
                  }
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
                      content: "I'm Biz and Dev, your AI business assistant! I can:\n\n**Research & Analysis**\n- Search the web for current events, market trends, and industry news\n- Analyze your CRM data and generate insights\n\n**Create & Build**\n- Generate complete ERP structures for companies\n- Build professional landing pages and websites\n- Write emails, articles, social posts, and scripts\n\n**Manage Your Business**\n- Add contacts, companies, and deals to your CRM\n- Schedule meetings and create tasks\n- Log activities and track time\n\n**Navigate & Explore**\n- Take you anywhere in the platform instantly\n\nWhat would you like me to help you with?" 
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
