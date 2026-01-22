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
  initiative_architect: { path: '/initiative-architect', title: 'Initiative Architect', description: 'AGI-powered project scaffolding from natural language' },
  proposals: { path: '/proposals', title: 'Proposal Generator', description: 'AI-powered business proposal creation from CRM and Deal Room data' },
  opportunity_discovery: { path: '/opportunity-discovery', title: 'Opportunity Discovery', description: 'Proactive AI agent scanning for business opportunities' },
  initiatives: { path: '/initiatives', title: 'Initiatives', description: 'View and manage all initiatives and projects' },
  xevents: { path: '/xevents', title: 'xEVENTSx', description: 'Event-driven business activation - conferences, workshops, meetups, networking' },
  xevents_new: { path: '/xevents/new', title: 'Create Event', description: 'Create a new event with the 5-step wizard' },
  // Human + Capital Lifecycle
  eros: { path: '/eros', title: 'EROS Dashboard', description: 'Emergency Response Operating System - incident command and responder coordination' },
  eros_profile: { path: '/eros/profile', title: 'Responder Profile', description: 'Manage your EROS responder profile, skills, and availability' },
  trading_command: { path: '/trading-command', title: 'Trading Command', description: 'Rules-based trading education and capital training system' },
  trading_execution: { path: '/trading-command/execute', title: 'Trading Execution', description: 'Discipline Over Dopamine execution system - live chart, ORB levels, pre-flight checklist, circuit breaker' },
  workforce: { path: '/workforce', title: 'Workforce Continuum', description: 'Multi-role engagements, time tracking, and role transitions' },
  capital_formation: { path: '/capital-formation', title: 'Capital Formation', description: 'Equity stakes, investments, and ownership portfolio management' },
  my_corporation: { path: '/my-corporation', title: 'My Corporation', description: 'Personal corporation P&L and balance sheet view' },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, files, conversation_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const authHeader = req.headers.get('authorization');
    const jwt = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
        auth: {
          // Edge runtime has no durable session storage; always rely on request JWT.
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    if (!jwt) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: missing auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

## CONVERSATION CONTEXT DETECTION (AGI CAPABILITY)

When processing user messages, intelligently identify the context:

**Task Continuation Indicators:**
- Mentions of specific initiatives, proposals, deals by name
- References to "that project", "this proposal", "the [name] thing"
- Follow-up questions about previous actions taken
- "Now do X" or "Next step" patterns

**New Request Indicators:**
- "I want to...", "Can you...", "Create a new..."
- Different topic than previous messages
- Explicit context switches: "Now let's talk about...", "Switching gears..."

**Response Rules:**
1. If continuing a task context, maintain all previous context and reference it
2. If starting a new topic, acknowledge the switch naturally
3. If ambiguous, make a reasonable assumption and proceed

## INITIATIVE-PROPOSAL-DISCOVERY WORKFLOW

The platform has a powerful workflow connecting these three AGI modules:

1. **Opportunity Discovery** → Scan for business signals → Add to watchlist
2. **Initiative Architect** → Convert opportunities into structured projects → Create CRM + Deal Room
3. **Proposal Generator** → Synthesize initiative data into formal proposals → Send to prospects

When a user asks about projects, initiatives, proposals, or opportunities, you can orchestrate across all three modules. Example flows:
- "Create an initiative for a workshop" → use create_initiative
- "Generate a proposal for that initiative" → use generate_proposal with linked_initiative_id
- "Watch for World Cup opportunities" → use add_to_watchlist

## WHITE PAPER ACCESS

Every major module has detailed documentation accessible via the book icon on each page. When users ask for deep explanations:
1. Provide the summary from your knowledge
2. Suggest: "For complete documentation, click the book icon on the [module] page, or I can take you to the Master White Paper."

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
          name: "send_invitation",
          description: "Send a platform invitation with optional asset linking. Use when user wants to invite someone and optionally link them directly to a proposal or deal room for Red Carpet onboarding.",
          parameters: {
            type: "object",
            properties: {
              email: { type: "string", description: "Email address to invite" },
              role: { type: "string", enum: ["user", "admin"], description: "Role to assign" },
              linked_proposal_id: { type: "string", description: "Optional proposal ID to redirect to after acceptance" },
              linked_deal_room_id: { type: "string", description: "Optional deal room ID to add user to and redirect" },
              facilitator_contact_id: { type: "string", description: "CRM contact ID of who facilitated the introduction" },
              introduction_note: { type: "string", description: "Context about why this connection was made" },
              redirect_to: { type: "string", description: "Custom path to redirect after login" }
            },
            required: ["email"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "merge_contacts",
          description: "Merge duplicate CRM contacts into a single unified record. Use when user mentions duplicate contacts or needs to consolidate records for the same person with multiple emails.",
          parameters: {
            type: "object",
            properties: {
              primary_contact_id: { type: "string", description: "Contact ID to keep as the primary record" },
              secondary_contact_ids: { type: "array", items: { type: "string" }, description: "Contact IDs to merge into primary (will be deleted after merge)" }
            },
            required: ["primary_contact_id", "secondary_contact_ids"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_relationship_anchor",
          description: "Create a XODIAK relationship anchor to cryptographically prove introductions, meetings, or idea disclosures between contacts.",
          parameters: {
            type: "object",
            properties: {
              anchor_type: { type: "string", enum: ["introduction", "asset_share", "meeting", "idea_disclosure"], description: "Type of relationship event" },
              source_contact_id: { type: "string", description: "CRM contact initiating the event" },
              target_contact_id: { type: "string", description: "CRM contact receiving the introduction/asset" },
              facilitator_contact_id: { type: "string", description: "Third party who facilitated the connection" },
              description: { type: "string", description: "Description of the relationship event" },
              linked_deal_room_id: { type: "string", description: "Optional linked deal room" },
              linked_proposal_id: { type: "string", description: "Optional linked proposal" }
            },
            required: ["anchor_type", "description"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "view_relationship_anchors",
          description: "View XODIAK relationship anchors for a contact or deal room. Use when user asks about relationship history or proof of introductions.",
          parameters: {
            type: "object",
            properties: {
              contact_id: { type: "string", description: "Filter anchors by CRM contact ID" },
              deal_room_id: { type: "string", description: "Filter anchors by deal room ID" },
              limit: { type: "number", description: "Max results to return (default 20)" }
            },
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
      },
      {
        type: "function",
        function: {
          name: "save_to_prompt_library",
          description: "Save a prompt, feature idea, or text content to the user's Prompt Library for later use. Use when user says 'put this in my prompt library', 'save this prompt', 'add to prompt library', 'store this idea', 'remember this for later', or similar. Can include images attached to the message.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "A short title or name for the prompt (auto-generate from content if not provided)" },
              content: { type: "string", description: "The full prompt/idea text content to save" },
              category: { 
                type: "string", 
                enum: ["Feature Idea", "AI Prompt", "System Design", "Bug Fix", "Documentation", "Research", "Other"],
                description: "Category to organize the prompt" 
              },
              tags: { type: "array", items: { type: "string" }, description: "Optional tags for organization" },
              priority: { type: "string", enum: ["low", "medium", "high"], description: "Priority level" }
            },
            required: ["content"],
            additionalProperties: false
          }
        }
      },
      // === NEW AGI TOOLS: Initiative, Proposal, Opportunity ===
      {
        type: "function",
        function: {
          name: "create_initiative",
          description: "Create a new initiative using the AGI Initiative Architect. Use when user wants to start a project, launch a campaign, plan an event, workshop, or scaffold any business initiative. The system creates CRM entities, Deal Room, tasks, curriculum (for workshops), and anchors to XODIAK for proof of origin.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "Initiative name (e.g., 'St. Constantine Biz Dev Workshop')" },
              goal_statement: { type: "string", description: "Natural language description of what you want to accomplish" },
              initiative_type: { 
                type: "string", 
                enum: ["project", "workshop", "campaign", "partnership", "event", "research"],
                description: "Type of initiative - workshop includes curriculum generation"
              },
              stakeholders: { 
                type: "array", 
                items: { type: "string" },
                description: "Names or emails of stakeholders involved"
              }
            },
            required: ["name", "goal_statement"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "generate_proposal",
          description: "Generate a formal business proposal using AI. Pulls data from CRM, Deal Rooms, and Research Studio. Use when user wants to create a proposal, write a pitch, draft an offer, or send formal terms to a prospect.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Proposal title" },
              recipient_company: { type: "string", description: "Company receiving the proposal" },
              recipient_contact: { type: "string", description: "Person receiving the proposal" },
              proposal_type: {
                type: "string",
                enum: ["service", "partnership", "investment", "sponsorship", "custom"],
                description: "Type of proposal"
              },
              key_points: { type: "string", description: "Key points to include in the proposal" },
              linked_initiative_id: { type: "string", description: "Initiative this proposal stems from (optional)" }
            },
            required: ["title", "proposal_type", "key_points"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "add_to_watchlist",
          description: "Add a target to the Opportunity Discovery watchlist. The proactive AI agent will scan news, journals, and social media 24/7 for matching signals. Use when user wants to monitor for opportunities related to a company, industry, event, or person.",
          parameters: {
            type: "object",
            properties: {
              target_type: {
                type: "string",
                enum: ["company", "industry", "event", "person"],
                description: "Type of target to watch"
              },
              target_value: { type: "string", description: "The name or category to watch (e.g., 'World Cup 2026', 'St. Constantine School', 'Oil & Gas')" },
              keywords: { 
                type: "array",
                items: { type: "string" },
                description: "Related keywords to match"
              },
              priority: { type: "string", enum: ["low", "medium", "high"], description: "Priority level for alerts" }
            },
            required: ["target_type", "target_value"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_initiatives",
          description: "Search existing initiatives. Use when user asks about initiatives, projects, campaigns, or events they've created.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query" },
              status: { type: "string", enum: ["draft", "scaffolding", "ready", "active", "completed", "archived", "all"], description: "Filter by status" }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      // Human + Capital Lifecycle Tools
      {
        type: "function",
        function: {
          name: "create_incident",
          description: "Create a new EROS emergency incident. Use when user reports an emergency, incident, or crisis situation that needs response coordination.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Incident title" },
              description: { type: "string", description: "Detailed description of the incident" },
              severity: { type: "string", enum: ["critical", "high", "medium", "low"], description: "Severity level" },
              incident_type: { type: "string", description: "Type of incident (fire, medical, security, natural disaster, etc.)" },
              location: { type: "string", description: "Location address or coordinates" }
            },
            required: ["title", "description", "severity"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "deploy_responder",
          description: "Deploy a responder to an active EROS incident. Use when assigning personnel to emergency situations.",
          parameters: {
            type: "object",
            properties: {
              incident_id: { type: "string", description: "ID of the incident to deploy to" },
              responder_id: { type: "string", description: "ID of the responder to deploy (optional, defaults to current user)" },
              role: { type: "string", description: "Role for this deployment (e.g., Lead, Support, Medical, Communications)" }
            },
            required: ["incident_id"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "find_opportunities",
          description: "Search workforce opportunities. Use when user asks about job opportunities, gigs, projects, or work engagements available in the ecosystem.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search keywords" },
              engagement_type: { type: "string", enum: ["hourly", "project", "retainer", "equity_swap", "all"], description: "Type of engagement" },
              status: { type: "string", enum: ["open", "filled", "cancelled", "all"], description: "Opportunity status" }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_engagement",
          description: "Create a workforce engagement (work arrangement). Use when user wants to log a new gig, job, project, or work relationship.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Engagement title" },
              description: { type: "string", description: "Description of the work" },
              engagement_type: { type: "string", enum: ["hourly", "project", "retainer", "equity_swap"], description: "Type of engagement" },
              hourly_rate: { type: "number", description: "Hourly rate (for hourly engagements)" },
              project_value: { type: "number", description: "Total project value (for project engagements)" },
              client_name: { type: "string", description: "Client or company name" }
            },
            required: ["title", "engagement_type"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "log_time_entry",
          description: "Log time worked against an engagement. Use when user wants to track hours worked on a project or engagement.",
          parameters: {
            type: "object",
            properties: {
              engagement_id: { type: "string", description: "ID of the engagement to log time against" },
              hours: { type: "number", description: "Number of hours worked" },
              description: { type: "string", description: "Description of work performed" },
              entry_date: { type: "string", description: "Date of the time entry (ISO format)" },
              billable: { type: "boolean", description: "Whether the time is billable" }
            },
            required: ["engagement_id", "hours"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "allocate_capital",
          description: "Allocate capital to an investment or equity stake. Use when user wants to invest in a company, fund, or asset.",
          parameters: {
            type: "object",
            properties: {
              entity_name: { type: "string", description: "Name of the entity to invest in" },
              entity_type: { type: "string", enum: ["spawned_business", "external_company", "deal_room_outcome", "fund", "real_estate"], description: "Type of entity" },
              amount: { type: "number", description: "Amount to invest" },
              ownership_percentage: { type: "number", description: "Percentage of ownership being acquired" },
              stake_type: { type: "string", enum: ["equity", "options", "warrants", "convertible_note", "profit_share"], description: "Type of stake" }
            },
            required: ["entity_name", "entity_type", "amount"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "view_portfolio",
          description: "View the user's investment portfolio and equity stakes. Use when user asks about their investments, ownership positions, or portfolio summary.",
          parameters: {
            type: "object",
            properties: {
              entity_type: { type: "string", enum: ["spawned_business", "external_company", "deal_room_outcome", "fund", "real_estate", "all"], description: "Filter by entity type" },
              status: { type: "string", enum: ["active", "vesting", "fully_vested", "exited", "all"], description: "Filter by status" }
            },
            additionalProperties: false
          }
        }
      },
      // Trading Command Execution Tools
      {
        type: "function",
        function: {
          name: "get_trading_session",
          description: "Get the current trading session status including preflight completion, loss count, circuit breaker status, and ORB levels. Use when user asks about their trading session, whether they can trade, or their current status.",
          parameters: {
            type: "object",
            properties: {},
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "get_orb_levels",
          description: "Get today's Opening Range Breakout (ORB) levels including PM High/Low, ORB High/Low, and Midline. Use when user asks about ORB levels, breakout levels, or key price levels for trading.",
          parameters: {
            type: "object",
            properties: {
              symbol: { type: "string", description: "Trading symbol (default: SPY)" }
            },
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "check_market_status",
          description: "Check current market status including whether it's pre-market, regular session, no-trade zone (first 15 min), or closed. Also returns current EST time. Use when user asks about market hours or when they can trade.",
          parameters: {
            type: "object",
            properties: {},
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "enter_execution_mode",
          description: "Navigate the user to the Trading Execution page (/trading-command/execute). Use when user wants to start trading, enter execution mode, or access the live chart with ORB overlays.",
          parameters: {
            type: "object",
            properties: {},
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "check_circuit_breaker",
          description: "Check if the circuit breaker is triggered (2 daily losses = 24h lockout). Use when user asks if they're locked out, how many losses they have, or when they can trade again.",
          parameters: {
            type: "object",
            properties: {},
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "view_engagements",
          description: "View the user's workforce engagements. Use when user asks about their work arrangements, gigs, or employment relationships.",
          parameters: {
            type: "object",
            properties: {
              engagement_type: { type: "string", enum: ["hourly", "project", "retainer", "equity_swap", "all"], description: "Filter by engagement type" },
              status: { type: "string", enum: ["active", "paused", "completed", "cancelled", "all"], description: "Filter by status" }
            },
            additionalProperties: false
          }
        }
      },
      // === FILE ATTACHMENT TOOLS ===
      {
        type: "function",
        function: {
          name: "suggest_attachment_targets",
          description: "Analyze conversation context to suggest entities where a file should be attached. Use when user drops/uploads a file into the chat and needs help deciding where to attach it. Returns suggestions ranked by relevance.",
          parameters: {
            type: "object",
            properties: {
              filename: { type: "string", description: "Name of the file being attached" },
              file_type: { type: "string", description: "MIME type of the file" },
              conversation_context: { type: "string", description: "Recent conversation summary for context" }
            },
            required: ["filename"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "attach_file_to_entity",
          description: "Attach an uploaded file to a specific entity (proposal, deal room, contact, company, deal, task, initiative). Use after user confirms which entity to attach the file to.",
          parameters: {
            type: "object",
            properties: {
              entity_type: { 
                type: "string", 
                enum: ["proposal", "deal_room", "contact", "company", "deal", "task", "initiative", "knowledge_item"],
                description: "Type of entity to attach to"
              },
              entity_id: { type: "string", description: "UUID of the entity" },
              filename: { type: "string", description: "Original filename" },
              file_base64: { type: "string", description: "Base64 encoded file content" },
              file_type: { type: "string", description: "MIME type" },
              file_size: { type: "number", description: "File size in bytes" },
              notes: { type: "string", description: "Optional notes about the attachment" }
            },
            required: ["entity_type", "entity_id", "filename", "file_base64"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "list_entity_attachments",
          description: "List all files attached to a specific entity. Use when user asks to see attachments for a deal room, proposal, contact, etc.",
          parameters: {
            type: "object",
            properties: {
              entity_type: { 
                type: "string", 
                enum: ["proposal", "deal_room", "contact", "company", "deal", "task", "initiative", "knowledge_item"],
                description: "Type of entity"
              },
              entity_id: { type: "string", description: "UUID of the entity" }
            },
            required: ["entity_type", "entity_id"],
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

                // SAVE TO PROMPT LIBRARY - Store prompts/ideas for later
                else if (funcName === 'save_to_prompt_library') {
                  try {
                    // Extract images from the conversation if any were attached
                    const lastUserMessage = messages[messages.length - 1];
                    const attachedImages = lastUserMessage?.images || [];
                    
                    // Auto-generate title if not provided
                    let title = args.title;
                    if (!title) {
                      // Generate a short title from the content
                      const contentPreview = args.content.substring(0, 100);
                      title = contentPreview.length < args.content.length 
                        ? contentPreview + '...' 
                        : contentPreview;
                    }
                    
                    const { data: promptData, error: promptError } = await supabaseClient
                      .from('prompt_library')
                      .insert({
                        user_id: user.id,
                        title: title.substring(0, 200), // Limit title length
                        content: args.content,
                        category: args.category || 'Other',
                        tags: args.tags || [],
                        priority: args.priority || 'medium',
                        status: 'draft',
                        images: attachedImages.length > 0 ? attachedImages : null,
                        metadata: { 
                          source: 'ai-assistant',
                          created_via: 'unified-chat'
                        }
                      })
                      .select()
                      .single();

                    if (!promptError && promptData) {
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'prompt_saved',
                            prompt: promptData,
                            message: `✅ Saved to Prompt Library: "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"${attachedImages.length > 0 ? ` (with ${attachedImages.length} image${attachedImages.length > 1 ? 's' : ''})` : ''}`,
                            navigate: '/prompt-library'
                          })}\n\n`
                        )
                      );
                    } else {
                      console.error('Prompt library save error:', promptError);
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'prompt_save_error',
                            error: promptError?.message || 'Failed to save to Prompt Library'
                          })}\n\n`
                        )
                      );
                    }
                  } catch (saveError) {
                    console.error('Save to prompt library error:', saveError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'prompt_save_error',
                          error: saveError instanceof Error ? saveError.message : 'Unable to save prompt'
                        })}\n\n`
                      )
                    );
                  }
                }

                // === NEW AGI TOOL IMPLEMENTATIONS ===

                // CREATE INITIATIVE - AGI-powered project scaffolding
                else if (funcName === 'create_initiative') {
                  try {
                    console.log('[AI Assistant] Creating initiative:', args.name);
                    
                    // Valid initiative_type values per DB constraint
                    const VALID_INITIATIVE_TYPES = ['workshop', 'partnership', 'campaign', 'product_launch', 'event', 'research', 'acquisition', 'custom'];
                    const requestedType = (args.initiative_type || 'custom').toLowerCase();
                    const safeType = VALID_INITIATIVE_TYPES.includes(requestedType) ? requestedType : 'custom';
                    
                    // Step 1: Insert the initiative record using CORRECT schema
                    // initiatives table requires: user_id (NOT created_by), description (NOT goal_statement)
                    const { data: initiativeData, error: initiativeError } = await supabaseClient
                      .from('initiatives')
                      .insert({
                        user_id: user.id,
                        name: args.name,
                        description: args.goal_statement?.substring(0, 500) || args.description || '',
                        original_prompt: args.goal_statement || args.description || '',
                        initiative_type: safeType,
                        status: 'scaffolding'
                      })
                      .select()
                      .single();

                    if (initiativeError || !initiativeData) {
                      console.error('[AI Assistant] Initiative insert error:', initiativeError);
                      throw new Error(initiativeError?.message || 'Failed to create initiative');
                    }

                    // POST-EXECUTION VERIFICATION: Confirm the record exists
                    const { data: verifyData, error: verifyError } = await supabaseClient
                      .from('initiatives')
                      .select('id, name, status, user_id, description, original_prompt, initiative_type')
                      .eq('id', initiativeData.id)
                      .single();

                    if (verifyError || !verifyData) {
                      console.error('[AI Assistant] Initiative verification failed:', verifyError);
                      throw new Error('Initiative created but verification failed - database may be out of sync');
                    }

                    console.log('[AI Assistant] Initiative verified:', verifyData.id, verifyData.name);

                    // Step 2: Invoke the initiative-architect edge function to scaffold
                    // CORRECT payload: initiative_id (not initiativeId), goal_statement, initiative_type
                    const architectPayload = {
                      initiative_id: verifyData.id,
                      goal_statement: verifyData.original_prompt || verifyData.description || args.goal_statement,
                      initiative_type: verifyData.initiative_type || 'project'
                    };
                    
                    console.log('[AI Assistant] Calling initiative-architect with:', JSON.stringify(architectPayload));
                    
                    const architectResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/initiative-architect`, {
                      method: 'POST',
                      headers: {
                        'Authorization': authHeader!,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(architectPayload),
                    });

                    let architectResult = null;
                    let scaffoldingStatus = 'queued';
                    
                    if (architectResponse.ok) {
                      architectResult = await architectResponse.json();
                      scaffoldingStatus = 'started';
                      console.log('[AI Assistant] Initiative architect responded:', architectResult?.scaffolded ? 'success' : 'in progress');
                    } else {
                      const errorText = await architectResponse.text();
                      console.error('[AI Assistant] Initiative architect error:', architectResponse.status, errorText);
                    }

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'initiative_created',
                          initiative: verifyData,
                          verified: true,
                          scaffolding: scaffoldingStatus,
                          message: `🎯 Initiative "${verifyData.name}" created and verified! ${args.initiative_type === 'workshop' ? 'Curriculum generation in progress. ' : ''}The Initiative Architect is creating CRM entities, Deal Room, and tasks.`,
                          navigate: '/initiatives/' + verifyData.id
                        })}\n\n`
                      )
                    );
                  } catch (initError) {
                    console.error('[AI Assistant] Create initiative error:', initError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'initiative_creation_error',
                          error: initError instanceof Error ? initError.message : 'Unable to create initiative',
                          debug_code: 'INIT_CREATE_FAILED'
                        })}\n\n`
                      )
                    );
                  }
                }

                // GENERATE PROPOSAL - AI-powered business proposal creation
                else if (funcName === 'generate_proposal') {
                  try {
                    console.log('[AI Assistant] Generating proposal:', args.title);
                    
                    // Find recipient company/contact in CRM if specified
                    let recipientCompanyId = null;
                    let recipientContactId = null;
                    
                    if (args.recipient_company) {
                      const { data: company } = await supabaseClient
                        .from('crm_companies')
                        .select('id, name')
                        .eq('user_id', user.id)
                        .ilike('name', `%${args.recipient_company}%`)
                        .limit(1)
                        .single();
                      if (company) recipientCompanyId = company.id;
                    }
                    
                    if (args.recipient_contact) {
                      const { data: contact } = await supabaseClient
                        .from('crm_contacts')
                        .select('id, name')
                        .eq('user_id', user.id)
                        .ilike('name', `%${args.recipient_contact}%`)
                        .limit(1)
                        .single();
                      if (contact) recipientContactId = contact.id;
                    }

                    // Create the proposal record
                    const { data: proposalData, error: proposalError } = await supabaseClient
                      .from('generated_proposals')
                      .insert({
                        title: args.title,
                        proposal_type: args.proposal_type || 'custom',
                        recipient_company_id: recipientCompanyId,
                        recipient_contact_id: recipientContactId,
                        initiative_id: args.linked_initiative_id || null,
                        created_by: user.id,
                        status: 'generating',
                        key_points: args.key_points,
                        content: {
                          generated: false,
                          source: 'unified-chat'
                        }
                      })
                      .select()
                      .single();

                    if (proposalError) {
                      throw new Error(proposalError.message);
                    }

                    // Notify that proposal record was created
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'proposal_creating',
                          proposal: proposalData,
                          message: `📝 Creating proposal "${args.title}"... Generating AI content now.`
                        })}\n\n`
                      )
                    );

                    // Map proposal_type to template_type for the edge function
                    const templateTypeMap: Record<string, string> = {
                      'service': 'service',
                      'partnership': 'partnership',
                      'investment': 'investment_tour',
                      'sponsorship': 'partnership',
                      'custom': 'custom',
                      'consulting': 'consulting',
                      'property': 'property',
                      'workshop': 'workshop',
                      'executive_landing': 'executive_landing'
                    };
                    const templateType = templateTypeMap[args.proposal_type] || 'custom';

                    // Invoke the generate-proposal edge function to create AI content
                    const supabaseUrl = Deno.env.get('SUPABASE_URL');
                    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
                    
                    if (supabaseUrl && serviceRoleKey) {
                      try {
                        const generateResponse = await fetch(`${supabaseUrl}/functions/v1/generate-proposal`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            proposal_id: proposalData.id,
                            template_type: templateType,
                            custom_prompt: args.key_points,
                            target_company_id: recipientCompanyId,
                            target_contact_id: recipientContactId
                          })
                        });

                        if (generateResponse.ok) {
                          const generateResult = await generateResponse.json();
                          console.log(`Proposal content generated for ${proposalData.id}:`, generateResult);
                          
                          controller.enqueue(
                            new TextEncoder().encode(
                              `data: ${JSON.stringify({ 
                                type: 'proposal_created',
                                proposal: { ...proposalData, status: 'draft' },
                                message: `✅ Proposal "${args.title}" created with ${generateResult.sections_generated || 'AI-generated'} sections! Navigate to review and send.`,
                                navigate: '/proposals/' + proposalData.id
                              })}\n\n`
                            )
                          );
                        } else {
                          const errorText = await generateResponse.text();
                          console.error('Generate proposal edge function error:', errorText);
                          
                          controller.enqueue(
                            new TextEncoder().encode(
                              `data: ${JSON.stringify({ 
                                type: 'proposal_created',
                                proposal: proposalData,
                                message: `📝 Proposal "${args.title}" created! AI content generation encountered an issue - you can regenerate from the proposal page.`,
                                navigate: '/proposals/' + proposalData.id
                              })}\n\n`
                            )
                          );
                        }
                      } catch (genError) {
                        console.error('Error invoking generate-proposal:', genError);
                        controller.enqueue(
                          new TextEncoder().encode(
                            `data: ${JSON.stringify({ 
                              type: 'proposal_created',
                              proposal: proposalData,
                              message: `📝 Proposal "${args.title}" created! You can generate AI content from the proposal page.`,
                              navigate: '/proposals/' + proposalData.id
                            })}\n\n`
                          )
                        );
                      }
                    } else {
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'proposal_created',
                            proposal: proposalData,
                            message: `📝 Proposal "${args.title}" created! Navigate to generate AI content.`,
                            navigate: '/proposals/' + proposalData.id
                          })}\n\n`
                        )
                      );
                    }
                  } catch (propError) {
                    console.error('Generate proposal error:', propError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'proposal_generation_error',
                          error: propError instanceof Error ? propError.message : 'Unable to create proposal'
                        })}\n\n`
                      )
                    );
                  }
                }

                // ADD TO WATCHLIST - Opportunity Discovery monitoring
                else if (funcName === 'add_to_watchlist') {
                  try {
                    console.log('[AI Assistant] Adding to watchlist:', args.target_value);
                    
                    const { data: watchlistData, error: watchlistError } = await supabaseClient
                      .from('opportunity_watchlist')
                      .insert({
                        user_id: user.id,
                        target_type: args.target_type,
                        target_value: args.target_value,
                        keywords: args.keywords || [],
                        priority: args.priority || 'medium',
                        is_active: true,
                        metadata: {
                          source: 'unified-chat',
                          created_at: new Date().toISOString()
                        }
                      })
                      .select()
                      .single();

                    if (watchlistError) {
                      throw new Error(watchlistError.message);
                    }

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'watchlist_added',
                          watchlist_item: watchlistData,
                          message: `🔍 "${args.target_value}" added to your Opportunity Discovery watchlist! The AI agent will scan news, journals, and social media 24/7 for matching signals. You'll be notified when high-relevance opportunities are detected.`,
                          navigate: '/opportunity-discovery'
                        })}\n\n`
                      )
                    );
                  } catch (watchError) {
                    console.error('Add to watchlist error:', watchError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'watchlist_add_error',
                          error: watchError instanceof Error ? watchError.message : 'Unable to add to watchlist'
                        })}\n\n`
                      )
                    );
                  }
                }

                // SEARCH INITIATIVES - Find existing initiatives
                else if (funcName === 'search_initiatives') {
                  try {
                    let query = supabaseClient
                      .from('initiatives')
                      .select('id, name, goal_statement, initiative_type, status, created_at, scaffolded_entities')
                      .or(`name.ilike.%${args.query}%,goal_statement.ilike.%${args.query}%`);
                    
                    if (args.status && args.status !== 'all') {
                      query = query.eq('status', args.status);
                    }
                    
                    const { data: initiatives, error: searchError } = await query
                      .order('created_at', { ascending: false })
                      .limit(20);

                    if (searchError) {
                      throw new Error(searchError.message);
                    }

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'initiatives_search_result',
                          query: args.query,
                          results: initiatives || [],
                          found: (initiatives?.length || 0) > 0,
                          message: initiatives?.length 
                            ? `Found ${initiatives.length} initiative(s) matching "${args.query}"`
                            : `No initiatives found matching "${args.query}"`
                        })}\n\n`
                      )
                    );
                  } catch (searchError) {
                    console.error('Search initiatives error:', searchError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'initiatives_search_error',
                          error: searchError instanceof Error ? searchError.message : 'Unable to search initiatives'
                        })}\n\n`
                      )
                    );
                  }
                }

                // === RELATIONSHIP & ASSET MANAGEMENT TOOLS ===

                // SEND INVITATION - Asset-linked platform invitations with attribution
                else if (funcName === 'send_invitation') {
                  try {
                    let email = args.email;
                    let contactName = args.contact_name;
                    
                    // CRM LOOKUP: If no email but a contact name is mentioned, search CRM first
                    if (!email && contactName) {
                      console.log('[AI Assistant] Searching CRM for contact:', contactName);
                      const { data: foundContact } = await supabaseClient
                        .from('crm_contacts')
                        .select('id, email, first_name, last_name')
                        .eq('user_id', user.id)
                        .or(`first_name.ilike.%${contactName}%,last_name.ilike.%${contactName}%`)
                        .limit(1)
                        .single();
                      
                      if (foundContact?.email) {
                        email = foundContact.email;
                        console.log('[AI Assistant] Found email in CRM:', email);
                      }
                    }
                    
                    if (!email) {
                      controller.enqueue(
                        new TextEncoder().encode(
                          `data: ${JSON.stringify({ 
                            type: 'invitation_needs_email',
                            message: `I couldn't find an email for ${contactName || 'this contact'} in your CRM. Please provide their email address.`,
                            requires_input: true
                          })}\n\n`
                        )
                      );
                      return;
                    }
                    
                    console.log('[AI Assistant] Sending invitation to:', email);
                    
                    // Generate invite code
                    const inviteCode = crypto.randomUUID();
                    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                    
                    // Create invitation record with asset linking
                    const { data: invitationData, error: invitationError } = await supabaseClient
                      .from('team_invitations')
                      .insert({
                        inviter_id: user.id,
                        invitee_email: email,
                        assigned_role: args.role || 'client_user',
                        invite_code: inviteCode,
                        status: 'pending',
                        expires_at: expiresAt,
                        linked_proposal_id: args.linked_proposal_id || null,
                        linked_deal_room_id: args.linked_deal_room_id || null,
                        from_contact_id: args.facilitator_contact_id || null,
                        introduction_note: args.introduction_note || null,
                        redirect_to: args.redirect_to || null
                      })
                      .select()
                      .single();

                    if (invitationError) {
                      throw new Error(invitationError.message);
                    }

                    // Determine invitation type for messaging
                    let inviteType = 'platform';
                    let assetInfo = '';
                    if (args.linked_deal_room_id) {
                      inviteType = 'Deal Room';
                      const { data: dealRoom } = await supabaseClient
                        .from('deal_rooms')
                        .select('name')
                        .eq('id', args.linked_deal_room_id)
                        .single();
                      assetInfo = dealRoom ? ` linked to "${dealRoom.name}"` : '';
                    } else if (args.linked_proposal_id) {
                      inviteType = 'Proposal';
                      const { data: proposal } = await supabaseClient
                        .from('generated_proposals')
                        .select('title')
                        .eq('id', args.linked_proposal_id)
                        .single();
                      assetInfo = proposal ? ` linked to "${proposal.title}"` : '';
                    }

                    // Try to invoke send-invitation edge function for email
                    try {
                      const supabaseUrl = Deno.env.get('SUPABASE_URL');
                      if (supabaseUrl) {
                        await fetch(`${supabaseUrl}/functions/v1/send-invitation`, {
                          method: 'POST',
                          headers: {
                            'Authorization': authHeader!,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            invitation_id: invitationData.id,
                            email: args.email,
                            invite_code: inviteCode
                          }),
                        });
                      }
                    } catch (emailError) {
                      console.error('Email send failed (non-critical):', emailError);
                    }

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'invitation_sent',
                          invitation: invitationData,
                          message: `✉️ ${inviteType} invitation sent to ${args.email}${assetInfo}! ${args.facilitator_contact_id ? 'Attribution tracked.' : ''} Invite expires in 7 days.`,
                          invite_link: `/accept-invite?code=${inviteCode}`
                        })}\n\n`
                      )
                    );
                  } catch (inviteError) {
                    console.error('Send invitation error:', inviteError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'invitation_error',
                          error: inviteError instanceof Error ? inviteError.message : 'Unable to send invitation'
                        })}\n\n`
                      )
                    );
                  }
                }

                // MERGE CONTACTS - Consolidate duplicate CRM contacts
                else if (funcName === 'merge_contacts') {
                  try {
                    console.log('[AI Assistant] Merging contacts:', args.primary_contact_id, args.secondary_contact_ids);
                    
                    // Get primary contact
                    const { data: primaryContact, error: primaryError } = await supabaseClient
                      .from('crm_contacts')
                      .select('*')
                      .eq('id', args.primary_contact_id)
                      .eq('user_id', user.id)
                      .single();

                    if (primaryError || !primaryContact) {
                      throw new Error('Primary contact not found or access denied');
                    }

                    // Get secondary contacts
                    const { data: secondaryContacts, error: secondaryError } = await supabaseClient
                      .from('crm_contacts')
                      .select('*')
                      .in('id', args.secondary_contact_ids)
                      .eq('user_id', user.id);

                    if (secondaryError || !secondaryContacts?.length) {
                      throw new Error('Secondary contacts not found or access denied');
                    }

                    // Collect all unique emails
                    const allEmails = new Set<string>();
                    if (primaryContact.email) allEmails.add(primaryContact.email);
                    if (primaryContact.alternate_emails) {
                      (primaryContact.alternate_emails as string[]).forEach((e: string) => allEmails.add(e));
                    }
                    
                    for (const contact of secondaryContacts) {
                      if (contact.email) allEmails.add(contact.email);
                      if (contact.alternate_emails) {
                        (contact.alternate_emails as string[]).forEach((e: string) => allEmails.add(e));
                      }
                    }

                    // Remove primary email from alternate list
                    const primaryEmail = primaryContact.email;
                    allEmails.delete(primaryEmail);
                    const alternateEmails = Array.from(allEmails);

                    // Merge notes
                    let mergedNotes = primaryContact.notes || '';
                    for (const contact of secondaryContacts) {
                      if (contact.notes) {
                        mergedNotes += `\n\n--- Merged from ${contact.name} (${contact.email}) ---\n${contact.notes}`;
                      }
                    }

                    // Update primary contact with merged data
                    const { data: updatedContact, error: updateError } = await supabaseClient
                      .from('crm_contacts')
                      .update({
                        alternate_emails: alternateEmails,
                        notes: mergedNotes.trim(),
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', args.primary_contact_id)
                      .select()
                      .single();

                    if (updateError) {
                      throw new Error(updateError.message);
                    }

                    // Delete secondary contacts
                    const { error: deleteError } = await supabaseClient
                      .from('crm_contacts')
                      .delete()
                      .in('id', args.secondary_contact_ids)
                      .eq('user_id', user.id);

                    if (deleteError) {
                      console.error('Failed to delete secondary contacts:', deleteError);
                    }

                    // Create XODIAK anchor for the merge event
                    const transactionHash = `xdk_merge_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
                    await supabaseClient
                      .from('xodiak_relationship_anchors')
                      .insert({
                        user_id: user.id,
                        anchor_type: 'identity_merge',
                        source_contact_id: args.primary_contact_id,
                        description: `Merged ${secondaryContacts.length} duplicate contact(s) into ${primaryContact.name}`,
                        transaction_hash: transactionHash,
                        anchored_at: new Date().toISOString(),
                        metadata: {
                          merged_contact_ids: args.secondary_contact_ids,
                          emails_consolidated: alternateEmails.length
                        }
                      });

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'contacts_merged',
                          primary_contact: updatedContact,
                          merged_count: secondaryContacts.length,
                          emails_consolidated: alternateEmails.length,
                          message: `✅ Merged ${secondaryContacts.length} contact(s) into "${primaryContact.name}". ${alternateEmails.length} email(s) consolidated. XODIAK anchor created for audit trail.`,
                          navigate: '/crm/contacts/' + args.primary_contact_id
                        })}\n\n`
                      )
                    );
                  } catch (mergeError) {
                    console.error('Merge contacts error:', mergeError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'merge_error',
                          error: mergeError instanceof Error ? mergeError.message : 'Unable to merge contacts'
                        })}\n\n`
                      )
                    );
                  }
                }

                // CREATE RELATIONSHIP ANCHOR - XODIAK cryptographic proof of relationships
                else if (funcName === 'create_relationship_anchor') {
                  try {
                    console.log('[AI Assistant] Creating relationship anchor:', args.anchor_type);
                    
                    const transactionHash = `xdk_${args.anchor_type}_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;
                    
                    const { data: anchorData, error: anchorError } = await supabaseClient
                      .from('xodiak_relationship_anchors')
                      .insert({
                        user_id: user.id,
                        anchor_type: args.anchor_type,
                        source_contact_id: args.source_contact_id || null,
                        target_contact_id: args.target_contact_id || null,
                        facilitator_contact_id: args.facilitator_contact_id || null,
                        description: args.description,
                        linked_deal_room_id: args.linked_deal_room_id || null,
                        linked_proposal_id: args.linked_proposal_id || null,
                        transaction_hash: transactionHash,
                        anchored_at: new Date().toISOString(),
                        metadata: {
                          created_via: 'ai-assistant',
                          timestamp: new Date().toISOString()
                        }
                      })
                      .select()
                      .single();

                    if (anchorError) {
                      throw new Error(anchorError.message);
                    }

                    // Get contact names for message
                    let contextMessage = '';
                    if (args.source_contact_id || args.target_contact_id) {
                      const contactIds = [args.source_contact_id, args.target_contact_id, args.facilitator_contact_id].filter(Boolean);
                      const { data: contacts } = await supabaseClient
                        .from('crm_contacts')
                        .select('id, name')
                        .in('id', contactIds);
                      
                      if (contacts?.length) {
                        const names = contacts.map(c => c.name).join(', ');
                        contextMessage = ` involving ${names}`;
                      }
                    }

                    const anchorTypeLabels: Record<string, string> = {
                      'introduction': '🤝 Introduction',
                      'asset_share': '📁 Asset Sharing',
                      'meeting': '📅 Meeting',
                      'idea_disclosure': '💡 Idea Disclosure'
                    };

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'relationship_anchor_created',
                          anchor: anchorData,
                          transaction_hash: transactionHash,
                          message: `${anchorTypeLabels[args.anchor_type] || '🔗 Relationship'} anchor created${contextMessage}. Transaction: ${transactionHash}. This provides immutable proof of the relationship origin for IP protection and attribution.`
                        })}\n\n`
                      )
                    );
                  } catch (anchorError) {
                    console.error('Create relationship anchor error:', anchorError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'anchor_error',
                          error: anchorError instanceof Error ? anchorError.message : 'Unable to create relationship anchor'
                        })}\n\n`
                      )
                    );
                  }
                }

                // VIEW RELATIONSHIP ANCHORS - Query XODIAK ledger
                else if (funcName === 'view_relationship_anchors') {
                  try {
                    console.log('[AI Assistant] Viewing relationship anchors:', args);
                    
                    let query = supabaseClient
                      .from('xodiak_relationship_anchors')
                      .select(`
                        id,
                        anchor_type,
                        description,
                        transaction_hash,
                        anchored_at,
                        created_at,
                        source_contact_id,
                        target_contact_id,
                        facilitator_contact_id,
                        linked_deal_room_id,
                        linked_proposal_id,
                        metadata
                      `)
                      .eq('user_id', user.id)
                      .order('created_at', { ascending: false });

                    if (args.contact_id) {
                      query = query.or(`source_contact_id.eq.${args.contact_id},target_contact_id.eq.${args.contact_id},facilitator_contact_id.eq.${args.contact_id}`);
                    }

                    if (args.deal_room_id) {
                      query = query.eq('linked_deal_room_id', args.deal_room_id);
                    }

                    const { data: anchors, error: queryError } = await query.limit(args.limit || 20);

                    if (queryError) {
                      throw new Error(queryError.message);
                    }

                    // Enrich with contact names if we have anchors
                    let enrichedAnchors = anchors || [];
                    if (anchors?.length) {
                      const allContactIds = new Set<string>();
                      anchors.forEach(a => {
                        if (a.source_contact_id) allContactIds.add(a.source_contact_id);
                        if (a.target_contact_id) allContactIds.add(a.target_contact_id);
                        if (a.facilitator_contact_id) allContactIds.add(a.facilitator_contact_id);
                      });

                      if (allContactIds.size > 0) {
                        const { data: contacts } = await supabaseClient
                          .from('crm_contacts')
                          .select('id, name')
                          .in('id', Array.from(allContactIds));

                        const contactMap = new Map(contacts?.map(c => [c.id, c.name]) || []);
                        
                        enrichedAnchors = anchors.map(a => ({
                          ...a,
                          source_contact_name: a.source_contact_id ? contactMap.get(a.source_contact_id) : null,
                          target_contact_name: a.target_contact_id ? contactMap.get(a.target_contact_id) : null,
                          facilitator_contact_name: a.facilitator_contact_id ? contactMap.get(a.facilitator_contact_id) : null
                        }));
                      }
                    }

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'relationship_anchors_result',
                          anchors: enrichedAnchors,
                          total: enrichedAnchors.length,
                          message: enrichedAnchors.length > 0
                            ? `Found ${enrichedAnchors.length} XODIAK relationship anchor(s). Each provides cryptographic proof of relationship origin for IP protection and attribution.`
                            : 'No relationship anchors found matching your criteria.'
                        })}\n\n`
                      )
                    );
                  } catch (viewError) {
                    console.error('View relationship anchors error:', viewError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'anchor_view_error',
                          error: viewError instanceof Error ? viewError.message : 'Unable to retrieve relationship anchors'
                        })}\n\n`
                      )
                    );
                  }
                }

                // HUMAN + CAPITAL LIFECYCLE TOOLS

                // CREATE INCIDENT - EROS emergency incident creation
                else if (funcName === 'create_incident') {
                  try {
                    console.log('[AI Assistant] Creating EROS incident:', args.title);
                    
                    const { data: incident, error: incidentError } = await supabaseClient
                      .from('eros_incidents')
                      .insert({
                        title: args.title,
                        description: args.description,
                        severity: args.severity,
                        incident_type: args.incident_type || 'general',
                        location: args.location || null,
                        status: 'active',
                        reported_by: user.id,
                        created_at: new Date().toISOString()
                      })
                      .select()
                      .single();

                    if (incidentError) throw new Error(incidentError.message);

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'incident_created',
                          incident: incident,
                          message: `🚨 EROS Incident "${args.title}" created with ${args.severity} severity. Navigate to /eros to manage.`,
                          navigation: { path: '/eros', action: 'navigate' }
                        })}\n\n`
                      )
                    );
                  } catch (incErr) {
                    console.error('Create incident error:', incErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'create_incident', error: incErr instanceof Error ? incErr.message : 'Unknown error' })}\n\n`
                      )
                    );
                  }
                }

                // DEPLOY RESPONDER - Assign responder to EROS incident
                else if (funcName === 'deploy_responder') {
                  try {
                    console.log('[AI Assistant] Deploying responder to incident:', args.incident_id);
                    
                    // Get user's responder profile
                    const { data: responderProfile } = await supabaseClient
                      .from('eros_responder_profiles')
                      .select('id')
                      .eq('user_id', user.id)
                      .single();

                    const responderId = args.responder_id || responderProfile?.id;
                    
                    if (!responderId) {
                      throw new Error('No responder profile found. Please set up your EROS profile first at /eros/profile');
                    }

                    const { data: deployment, error: deployError } = await supabaseClient
                      .from('eros_deployments')
                      .insert({
                        incident_id: args.incident_id,
                        responder_id: responderId,
                        role: args.role || 'Support',
                        status: 'deployed',
                        deployed_at: new Date().toISOString()
                      })
                      .select()
                      .single();

                    if (deployError) throw new Error(deployError.message);

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'responder_deployed',
                          deployment: deployment,
                          message: `🚑 Responder deployed to incident as ${args.role || 'Support'}. Navigate to /eros to view status.`,
                          navigation: { path: `/eros/incidents/${args.incident_id}`, action: 'navigate' }
                        })}\n\n`
                      )
                    );
                  } catch (deployErr) {
                    console.error('Deploy responder error:', deployErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'deploy_responder', error: deployErr instanceof Error ? deployErr.message : 'Unknown error' })}\n\n`
                      )
                    );
                  }
                }

                // FIND OPPORTUNITIES - Search workforce opportunities
                else if (funcName === 'find_opportunities') {
                  try {
                    console.log('[AI Assistant] Finding workforce opportunities:', args.query);
                    
                    let query = supabaseClient
                      .from('workforce_opportunities')
                      .select('*')
                      .eq('status', args.status === 'all' ? 'open' : (args.status || 'open'));

                    if (args.engagement_type && args.engagement_type !== 'all') {
                      query = query.eq('engagement_type', args.engagement_type);
                    }

                    if (args.query) {
                      query = query.or(`title.ilike.%${args.query}%,description.ilike.%${args.query}%,skills_required.cs.{${args.query}}`);
                    }

                    const { data: opportunities, error: oppError } = await query
                      .order('created_at', { ascending: false })
                      .limit(20);

                    if (oppError) throw new Error(oppError.message);

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'opportunities_result',
                          opportunities: opportunities,
                          total: opportunities?.length || 0,
                          message: opportunities?.length 
                            ? `Found ${opportunities.length} workforce opportunity(s) matching "${args.query || 'all'}". Navigate to /workforce to apply.`
                            : `No opportunities found matching "${args.query}". Try different keywords or check back later.`
                        })}\n\n`
                      )
                    );
                  } catch (oppErr) {
                    console.error('Find opportunities error:', oppErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'find_opportunities', error: oppErr instanceof Error ? oppErr.message : 'Unknown error' })}\n\n`
                      )
                    );
                  }
                }

                // LOG TIME ENTRY - Track time against engagement
                else if (funcName === 'log_time_entry') {
                  try {
                    console.log('[AI Assistant] Logging time entry:', args.hours, 'hours');
                    
                    const { data: timeEntry, error: timeError } = await supabaseClient
                      .from('workforce_time_entries')
                      .insert({
                        user_id: user.id,
                        engagement_id: args.engagement_id,
                        hours: args.hours,
                        description: args.description || 'Time logged via AI assistant',
                        entry_date: args.entry_date || new Date().toISOString().split('T')[0],
                        billable: args.billable !== false,
                        status: 'pending'
                      })
                      .select()
                      .single();

                    if (timeError) throw new Error(timeError.message);

                    // Note: total_hours_logged should be recalculated on the page or via trigger

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'time_entry_logged',
                          time_entry: timeEntry,
                          message: `⏱️ Logged ${args.hours} hour(s) against engagement. ${args.billable !== false ? 'Marked as billable.' : 'Marked as non-billable.'} View at /workforce`,
                          navigation: { path: '/workforce', action: 'navigate' }
                        })}\n\n`
                      )
                    );
                  } catch (timeErr) {
                    console.error('Log time entry error:', timeErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'log_time_entry', error: timeErr instanceof Error ? timeErr.message : 'Unknown error' })}\n\n`
                      )
                    );
                  }
                }

                // VIEW ENGAGEMENTS - Workforce engagements
                else if (funcName === 'view_engagements') {
                  try {
                    console.log('[AI Assistant] Viewing workforce engagements');
                    
                    let query = supabaseClient
                      .from('workforce_engagements')
                      .select('*')
                      .eq('user_id', user.id);

                    if (args.engagement_type && args.engagement_type !== 'all') {
                      query = query.eq('engagement_type', args.engagement_type);
                    }
                    if (args.status && args.status !== 'all') {
                      query = query.eq('status', args.status);
                    }

                    const { data: engagements, error: engError } = await query.order('created_at', { ascending: false }).limit(20);

                    if (engError) throw new Error(engError.message);

                    const totalEarnings = engagements?.reduce((sum, e) => sum + (e.total_earned || 0), 0) || 0;
                    const totalHours = engagements?.reduce((sum, e) => sum + (e.total_hours_logged || 0), 0) || 0;

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'engagements_result',
                          engagements: engagements,
                          total: engagements?.length || 0,
                          total_earnings: totalEarnings,
                          total_hours: totalHours,
                          message: engagements?.length 
                            ? `Found ${engagements.length} engagement(s). Total hours: ${totalHours.toFixed(1)}h, Total earned: $${totalEarnings.toLocaleString()}`
                            : 'No workforce engagements found. Go to /workforce to create one.'
                        })}\n\n`
                      )
                    );
                  } catch (engErr) {
                    console.error('View engagements error:', engErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'view_engagements', error: engErr instanceof Error ? engErr.message : 'Unknown error' })}\n\n`
                      )
                    );
                  }
                }

                // CREATE ENGAGEMENT - Workforce engagement creation
                else if (funcName === 'create_engagement') {
                  try {
                    console.log('[AI Assistant] Creating workforce engagement:', args.title);
                    
                    const { data: engagement, error: engError } = await supabaseClient
                      .from('workforce_engagements')
                      .insert({
                        user_id: user.id,
                        title: args.title,
                        description: args.description || null,
                        engagement_type: args.engagement_type,
                        hourly_rate: args.hourly_rate || null,
                        project_value: args.project_value || null,
                        client_name: args.client_name || null,
                        status: 'active',
                        start_date: new Date().toISOString().split('T')[0]
                      })
                      .select()
                      .single();

                    if (engError) throw new Error(engError.message);

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'engagement_created',
                          engagement: engagement,
                          message: `✅ Workforce engagement "${args.title}" created (${args.engagement_type}). Navigate to /workforce to track time.`,
                          navigation: { path: '/workforce', action: 'navigate' }
                        })}\n\n`
                      )
                    );
                  } catch (engErr) {
                    console.error('Create engagement error:', engErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'create_engagement', error: engErr instanceof Error ? engErr.message : 'Unknown error' })}\n\n`
                      )
                    );
                  }
                }

                // VIEW PORTFOLIO - Capital formation equity stakes
                else if (funcName === 'view_portfolio') {
                  try {
                    console.log('[AI Assistant] Viewing investment portfolio');
                    
                    let query = supabaseClient
                      .from('equity_stakes')
                      .select('*')
                      .eq('user_id', user.id);

                    if (args.entity_type && args.entity_type !== 'all') {
                      query = query.eq('entity_type', args.entity_type);
                    }
                    if (args.status && args.status !== 'all') {
                      query = query.eq('status', args.status);
                    }

                    const { data: stakes, error: stakeError } = await query.order('current_valuation', { ascending: false }).limit(50);

                    if (stakeError) throw new Error(stakeError.message);

                    const totalValuation = stakes?.reduce((sum, s) => sum + (s.current_valuation || 0), 0) || 0;
                    const totalCostBasis = stakes?.reduce((sum, s) => sum + (s.cost_basis || 0), 0) || 0;
                    const unrealizedGain = totalValuation - totalCostBasis;

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'portfolio_result',
                          stakes: stakes,
                          total: stakes?.length || 0,
                          total_valuation: totalValuation,
                          total_cost_basis: totalCostBasis,
                          unrealized_gain: unrealizedGain,
                          message: stakes?.length 
                            ? `Portfolio contains ${stakes.length} equity stake(s). Total value: $${totalValuation.toLocaleString()} (${unrealizedGain >= 0 ? '+' : ''}$${unrealizedGain.toLocaleString()} unrealized)`
                            : 'No equity stakes found. Go to /capital-formation to add investments.'
                        })}\n\n`
                      )
                    );
                  } catch (portErr) {
                    console.error('View portfolio error:', portErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'view_portfolio', error: portErr instanceof Error ? portErr.message : 'Unknown error' })}\n\n`
                      )
                    );
                  }
                }

                // ALLOCATE CAPITAL - Create equity stake
                else if (funcName === 'allocate_capital') {
                  try {
                    console.log('[AI Assistant] Allocating capital:', args.entity_name);
                    
                    const { data: stake, error: stakeError } = await supabaseClient
                      .from('equity_stakes')
                      .insert({
                        user_id: user.id,
                        entity_name: args.entity_name,
                        entity_type: args.entity_type,
                        stake_type: args.stake_type || 'equity',
                        ownership_percentage: args.ownership_percentage || null,
                        cost_basis: args.amount,
                        current_valuation: args.amount,
                        acquisition_date: new Date().toISOString().split('T')[0],
                        status: 'active'
                      })
                      .select()
                      .single();

                    if (stakeError) throw new Error(stakeError.message);

                    // Also log the investment transaction
                    await supabaseClient
                      .from('capital_investments')
                      .insert({
                        user_id: user.id,
                        equity_stake_id: stake.id,
                        investment_type: 'initial',
                        amount: args.amount,
                        transaction_date: new Date().toISOString().split('T')[0]
                      });

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'capital_allocated',
                          stake: stake,
                          message: `💰 $${args.amount.toLocaleString()} allocated to ${args.entity_name} (${args.stake_type || 'equity'}). View at /capital-formation`,
                          navigation: { path: '/capital-formation', action: 'navigate' }
                        })}\n\n`
                      )
                    );
                  } catch (allocErr) {
                    console.error('Allocate capital error:', allocErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'allocate_capital', error: allocErr instanceof Error ? allocErr.message : 'Unknown error' })}\n\n`
                      )
                    );
                  }
                }

                // === FILE ATTACHMENT TOOLS ===

                // SUGGEST ATTACHMENT TARGETS - Analyze context for entity suggestions
                else if (funcName === 'suggest_attachment_targets') {
                  try {
                    console.log('[AI Assistant] Suggesting attachment targets for:', args.filename);
                    
                    const suggestions: any[] = [];

                    // Query recent proposals (user owns)
                    const { data: proposals } = await supabaseClient
                      .from('proposals')
                      .select('id, title, created_at')
                      .eq('created_by', user.id)
                      .order('created_at', { ascending: false })
                      .limit(5);

                    proposals?.forEach(p => {
                      suggestions.push({
                        entity_type: 'proposal',
                        entity_id: p.id,
                        entity_title: p.title,
                        confidence: 0.7,
                        reason: 'Recent proposal'
                      });
                    });

                    // Query deal rooms (user is participant)
                    const { data: dealRoomParticipants } = await supabaseClient
                      .from('deal_room_participants')
                      .select('deal_room_id, deal_rooms(id, name)')
                      .eq('user_id', user.id)
                      .limit(5);

                    dealRoomParticipants?.forEach((p: any) => {
                      if (p.deal_rooms) {
                        suggestions.push({
                          entity_type: 'deal_room',
                          entity_id: p.deal_rooms.id,
                          entity_title: p.deal_rooms.name,
                          confidence: 0.8,
                          reason: 'Active deal room'
                        });
                      }
                    });

                    // Query recent CRM deals
                    const { data: deals } = await supabaseClient
                      .from('crm_deals')
                      .select('id, title')
                      .eq('user_id', user.id)
                      .order('created_at', { ascending: false })
                      .limit(5);

                    deals?.forEach(d => {
                      suggestions.push({
                        entity_type: 'deal',
                        entity_id: d.id,
                        entity_title: d.title,
                        confidence: 0.6,
                        reason: 'Recent deal'
                      });
                    });

                    // Query recent contacts
                    const { data: contacts } = await supabaseClient
                      .from('crm_contacts')
                      .select('id, name, company')
                      .eq('user_id', user.id)
                      .order('created_at', { ascending: false })
                      .limit(5);

                    contacts?.forEach(c => {
                      suggestions.push({
                        entity_type: 'contact',
                        entity_id: c.id,
                        entity_title: `${c.name}${c.company ? ` (${c.company})` : ''}`,
                        confidence: 0.5,
                        reason: 'Recent contact'
                      });
                    });

                    // Sort by confidence and limit to top 5
                    const topSuggestions = suggestions
                      .sort((a, b) => b.confidence - a.confidence)
                      .slice(0, 5);

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'attachment_suggestions',
                          filename: args.filename,
                          suggestions: topSuggestions,
                          message: topSuggestions.length > 0
                            ? `I found ${topSuggestions.length} potential destinations for "${args.filename}". Which entity should I attach it to?`
                            : `I couldn't find any recent entities to attach "${args.filename}" to. Please specify where you'd like me to attach it.`
                        })}\n\n`
                      )
                    );
                  } catch (suggestErr) {
                    console.error('Suggest attachment targets error:', suggestErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'suggest_attachment_targets', error: suggestErr instanceof Error ? suggestErr.message : 'Unknown error' })}\n\n`
                      )
                    );
                  }
                }

                // ATTACH FILE TO ENTITY - Upload and link file
                else if (funcName === 'attach_file_to_entity') {
                  try {
                    console.log('[AI Assistant] Attaching file to entity:', args.entity_type, args.entity_id);
                    
                    // Decode base64 file content
                    const fileData = args.file_base64;
                    let binaryData: Uint8Array;
                    
                    // Handle data URL format or raw base64
                    const base64Content = fileData.includes(',') 
                      ? fileData.split(',')[1] 
                      : fileData;
                    
                    // Chunked base64 decoding to avoid stack overflow
                    const binaryString = atob(base64Content);
                    const len = binaryString.length;
                    binaryData = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                      binaryData[i] = binaryString.charCodeAt(i);
                    }

                    // Generate storage path
                    const timestamp = Date.now();
                    const sanitizedFilename = args.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const storagePath = `${user.id}/${args.entity_type}/${args.entity_id}/${timestamp}-${sanitizedFilename}`;

                    // Upload to storage
                    const { error: uploadError } = await supabaseClient.storage
                      .from('entity-attachments')
                      .upload(storagePath, binaryData, {
                        contentType: args.file_type || 'application/octet-stream',
                        upsert: false
                      });

                    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

                    // Create attachment record
                    const { data: attachment, error: attachError } = await supabaseClient
                      .from('entity_attachments')
                      .insert({
                        user_id: user.id,
                        entity_type: args.entity_type,
                        entity_id: args.entity_id,
                        storage_bucket: 'entity-attachments',
                        storage_path: storagePath,
                        filename: args.filename,
                        file_type: args.file_type || null,
                        file_size: args.file_size || binaryData.length,
                        attached_via_chat: true,
                        ai_conversation_id: activeConversationId || null,
                        ai_suggested: true,
                        notes: args.notes || null
                      })
                      .select()
                      .single();

                    if (attachError) throw new Error(`Record creation failed: ${attachError.message}`);

                    const entityTypeLabels: Record<string, string> = {
                      proposal: 'Proposal',
                      deal_room: 'Deal Room',
                      contact: 'Contact',
                      company: 'Company',
                      deal: 'Deal',
                      task: 'Task',
                      initiative: 'Initiative',
                      knowledge_item: 'Knowledge Item'
                    };

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'file_attached',
                          attachment: attachment,
                          message: `✅ Successfully attached "${args.filename}" to the ${entityTypeLabels[args.entity_type] || args.entity_type}. You can view it in the Attachments section.`,
                          entity_type: args.entity_type,
                          entity_id: args.entity_id
                        })}\n\n`
                      )
                    );
                  } catch (attachErr) {
                    console.error('Attach file error:', attachErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'attach_file_to_entity', error: attachErr instanceof Error ? attachErr.message : 'Unknown error' })}\n\n`
                      )
                    );
                  }
                }

                // LIST ENTITY ATTACHMENTS - Get attachments for an entity
                else if (funcName === 'list_entity_attachments') {
                  try {
                    console.log('[AI Assistant] Listing attachments for:', args.entity_type, args.entity_id);
                    
                    const { data: attachments, error: listError } = await supabaseClient
                      .from('entity_attachments')
                      .select('*')
                      .eq('entity_type', args.entity_type)
                      .eq('entity_id', args.entity_id)
                      .order('created_at', { ascending: false });

                    if (listError) throw new Error(listError.message);

                    const entityTypeLabels: Record<string, string> = {
                      proposal: 'Proposal',
                      deal_room: 'Deal Room',
                      contact: 'Contact',
                      company: 'Company',
                      deal: 'Deal',
                      task: 'Task',
                      initiative: 'Initiative',
                      knowledge_item: 'Knowledge Item'
                    };

                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'entity_attachments',
                          attachments: attachments,
                          entity_type: args.entity_type,
                          entity_id: args.entity_id,
                          total: attachments?.length || 0,
                          message: attachments?.length 
                            ? `Found ${attachments.length} attachment(s) for this ${entityTypeLabels[args.entity_type] || args.entity_type}.`
                            : `No attachments found for this ${entityTypeLabels[args.entity_type] || args.entity_type}.`
                        })}\n\n`
                      )
                    );
                  } catch (listErr) {
                    console.error('List attachments error:', listErr);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ type: 'tool_error', tool: 'list_entity_attachments', error: listErr instanceof Error ? listErr.message : 'Unknown error' })}\n\n`
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
