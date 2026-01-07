// Comprehensive White Paper Content Library
// Each module has detailed documentation explaining What, Why, and How

export interface WhitePaperData {
  title: string;
  subtitle: string;
  version: number;
  sections: {
    title: string;
    content: string;
  }[];
}

export const whitePaperContent: Record<string, WhitePaperData> = {
  crm: {
    title: "Customer Relationship Management",
    subtitle: "The Central Nervous System of Your Business Relationships",
    version: 2,
    sections: [
      {
        title: "What is CRM?",
        content: `The CRM module is your unified command center for managing every relationship that matters to your business. Unlike traditional contact lists, this system treats relationships as living, evolving assets that grow in value over time.

At its core, the CRM manages three interconnected entity types:
• **Contacts** — Individual people with their roles, communication preferences, and interaction history
• **Companies** — Organizations with their structure, key personnel, and business intelligence
• **Deals** — Active opportunities moving through your sales pipeline with associated tasks and documents

Each entity is enriched with AI-powered insights, automatic relationship mapping, and cross-platform synchronization.`
      },
      {
        title: "Why Does This Exist?",
        content: `Traditional CRMs fail because they treat data entry as the goal rather than the means. This platform was built on a different philosophy: relationships are your most valuable business asset, and the system should work to strengthen them—not create busywork.

**The Problem We Solve:**
1. **Fragmented Information** — Contact details scattered across email, spreadsheets, and notes
2. **Lost Context** — Forgetting why you know someone or what was discussed
3. **Missed Opportunities** — Failing to follow up at the right moment
4. **Relationship Decay** — Letting valuable connections go cold

**Our Approach:**
The CRM automatically captures interaction data, suggests optimal follow-up timing, identifies relationship patterns, and surfaces opportunities you might miss. It's not just a database—it's an active partner in relationship building.`
      },
      {
        title: "How It Works",
        content: `**Contact Management:**
Every contact is enriched with contextual data pulled from your interactions. The system tracks communication frequency, sentiment trends, and relationship strength scores. AI analyzes patterns to predict the best times to reach out and the topics most likely to resonate.

**Company Intelligence:**
Company profiles aggregate data from all associated contacts, deals, and external sources. You see organizational hierarchies, decision-maker maps, and relationship pathways showing how you're connected to key stakeholders.

**Deal Pipeline:**
Deals flow through customizable stages with automatic task generation, document management, and probability scoring. The AI learns from your closed deals to predict outcomes and recommend actions that improve win rates.

**Integration Points:**
• Email sync captures correspondence automatically
• Calendar integration tracks meetings and follow-ups
• Document storage links files to relevant entities
• Workflow triggers automate repetitive tasks
• Analytics dashboards visualize relationship health`
      },
      {
        title: "Best Practices",
        content: `1. **Update Regularly** — The system learns from your inputs; consistent data improves AI recommendations
2. **Use Tags Strategically** — Create a tagging taxonomy that reflects how you actually think about relationships
3. **Review AI Suggestions** — The system surfaces opportunities daily; make reviewing them part of your routine
4. **Connect Everything** — Link deals to contacts, contacts to companies, and activities to all relevant entities
5. **Trust the Relationship Scores** — When the system flags a relationship as cooling, take action`
      }
    ]
  },

  deal_room: {
    title: "Deal Room — The Chemical Blender",
    subtitle: "Where Business Ingredients Combine to Create Value",
    version: 3,
    sections: [
      {
        title: "What is the Deal Room?",
        content: `The Deal Room is a collaborative workspace where multiple parties bring their unique contributions—capital, technology, customer access, intellectual property, expertise—and combine them into structured business opportunities. We call this the "Chemical Blender" model.

**Core Components:**
• **Ingredients** — The assets, capabilities, and resources each party contributes
• **Formulations** — Specific combinations of ingredients designed to solve customer problems
• **Participants** — The entities (individuals or companies) bringing ingredients to the blend
• **Structures** — The legal and operational frameworks governing how value is created and distributed
• **Settlement** — The mechanisms for tracking, attributing, and distributing returns
• **Permissions & Visibility** — Granular control over what each participant can see and do

Unlike traditional deal management that tracks a single company's pipeline, Deal Rooms orchestrate multi-party value creation where everyone brings something to the table.`
      },
      {
        title: "Why Does This Exist?",
        content: `Modern business increasingly happens at the intersection of multiple parties. A software company needs a distribution partner. A manufacturer needs financing and channel access. An IP holder needs operational expertise to commercialize their invention.

**The Traditional Problem:**
These deals happen through fragmented emails, unclear contribution tracking, disputed attribution, and handshake agreements that fall apart when money appears. Smart people avoid collaboration because the overhead exceeds the benefit.

**The Deal Room Solution:**
We created a structured environment where:
1. Every contribution is registered and timestamped
2. Attribution rules are defined upfront
3. Usage and value creation are tracked automatically
4. Settlement happens transparently based on agreed formulas
5. All parties have appropriate visibility based on their role
6. Sensitive information is protected with granular access controls

This transforms collaboration from a trust-dependent gamble into a structured, repeatable process.`
      },
      {
        title: "How It Works",
        content: `**Phase 1: Participant Invitation & Role Assignment**
Administrators invite participants by email. Before a participant even joins, their role and permissions can be pre-configured. The hybrid permission system supports role presets (Creator, Admin, Investor, Advisor, Vendor, Partner, Participant, Observer) with customizable individual overrides.

**Phase 2: Ingredient Registration**
Participants document what they're bringing to the deal. Software licenses, customer introductions, capital investment, technical expertise—each contribution is categorized, valued, and linked to the contributing party.

**Phase 3: Formulation Building**
Using the Formulation Builder, participants combine ingredients into specific customer solutions. A formulation might combine Party A's software + Party B's implementation services + Party C's customer relationship to create a complete offering.

**Phase 4: Structure Definition**
The deal structure defines how revenue, costs, and risks are allocated. Revenue share percentages, payment waterfalls, expense allocations, and exit provisions are documented in machine-readable format.

**Phase 5: Execution & Tracking**
As the formulation is deployed to customers, the system tracks usage, revenue, and attribution. AI monitors for anomalies and flags potential disputes before they escalate.

**Phase 6: Settlement**
Based on tracked metrics and agreed structures, the system calculates distributions and facilitates settlement. Complete audit trails ensure transparency and simplify accounting.`
      },
      {
        title: "Hybrid Permission System",
        content: `Deal Rooms feature a sophisticated two-layer permission architecture that separates platform-wide access from deal-specific controls.

**Layer 1: Platform Permissions**
Controls what modules a user can access across the entire BizDev platform (CRM, ERP, Workflows, etc.). Managed by system administrators.

**Layer 2: Deal Room Permissions**
Controls what a participant can do and see within a specific deal. Each deal can have unique permission structures because deals vary in complexity and sensitivity.

**Role Presets:**
• **Creator** — Full access to all deal functions and visibility
• **Admin** — Full management capabilities
• **Investor** — View documents, own financials, and deal terms
• **Advisor** — See everything but limited edit rights
• **Vendor** — Access to their deliverables and own earnings
• **Partner** — Collaborative access with financial visibility
• **Participant** — Standard access to core deal information
• **Observer** — Read-only access to public deal information

**Visibility Controls:**
For each participant, administrators can configure visibility scope for:
• **Financials** — Revenue splits, earnings %, contribution amounts
• **Participants** — Who else is in the deal, their roles, contact info
• **Documents** — Files, deliverables, attachments
• **Deal Terms** — Ingredients, terms, conditions
• **Contributions** — What each party is bringing
• **Earnings** — Payout information and distribution

Each category can be set to: None, Own Only, Role-Based, or All.`
      },
      {
        title: "Key Concepts",
        content: `**Embedded Contributions:**
Some contributions become permanently embedded in the final product or service. Software code, brand elements, or methodology IP don't deplete when used—they create ongoing value. The system tracks embedded contributions differently from consumable ones.

**Credit-Based Settlement:**
Rather than complex payment waterfalls, many Deal Rooms use credit systems where contributions earn credits and settlements distribute based on credit ratios. This simplifies multi-party accounting.

**Attribution Rules:**
Before deals close, participants define how value creation will be attributed. Direct attribution (Party A's customer = Party A's credit), proportional attribution, or custom formulas ensure everyone knows the rules before outcomes arrive.

**Pre-Invite Permissions:**
Permissions can be configured before a participant joins the platform. When they accept their invitation and create an account, their pre-configured access rights are automatically applied. This ensures smooth onboarding for complex deals.

**Permission Overrides:**
While role presets provide sensible defaults, individual permissions can be overridden for any participant. An Investor might be granted document upload rights, or a Partner might have their financial visibility restricted—all without changing their base role.`
      }
    ]
  },

  workflows: {
    title: "Workflow Automation",
    subtitle: "Turn Repetitive Processes into Reliable Systems",
    version: 2,
    sections: [
      {
        title: "What is Workflow Automation?",
        content: `The Workflow module allows you to design, build, and execute automated sequences that handle repetitive business processes. Instead of manually performing the same steps every time a specific situation arises, you define the logic once and let the system handle execution.

**Workflow Components:**
• **Triggers** — Events that start a workflow (time-based, data-based, or manual)
• **Actions** — Steps the workflow performs (send email, update record, call API, notify user)
• **Conditions** — Logic gates that determine which path the workflow takes
• **Loops** — Repeated actions across collections of data
• **Integrations** — Connections to external systems and services

Workflows can be simple (send a reminder email 3 days after a meeting) or complex (multi-stage approval processes with conditional routing and external system updates).`
      },
      {
        title: "Why Does This Exist?",
        content: `Every business has processes that happen repeatedly. New customer onboarding. Invoice follow-ups. Lead qualification. Report generation. Meeting scheduling. These processes consume time, introduce human error, and distract from high-value work.

**The Automation Opportunity:**
For each process you automate:
• Time savings compound over every execution
• Error rates drop to near zero
• Response times become instant
• Processes happen consistently regardless of who's available
• You free mental bandwidth for creative and strategic work

**Beyond Simple Automation:**
This isn't just "if this then that" logic. The workflow engine incorporates AI decision-making, learning from outcomes to improve routing, and cross-module integration that treats your entire business as an interconnected system.`
      },
      {
        title: "How It Works",
        content: `**Visual Workflow Builder:**
Design workflows using a drag-and-drop canvas. Connect triggers to actions, add conditional branches, and configure each step's parameters. No coding required for most workflows, though advanced users can embed custom logic.

**AI-Powered Generation:**
Describe what you want to automate in natural language, and the AI generates a complete workflow structure. Review, modify, and activate—often in minutes rather than hours.

**Template Gallery:**
Start from pre-built templates for common scenarios: lead nurturing sequences, approval chains, reporting automation, and notification systems. Customize templates to match your specific needs.

**Execution & Monitoring:**
Active workflows run automatically. The dashboard shows execution history, success rates, error logs, and performance metrics. Set up alerts for failures or anomalies.

**Cross-Module Integration:**
Workflows can trigger actions across CRM, Deal Room, ERP, Calendar, and external systems. A deal stage change can update inventory, notify stakeholders, and schedule follow-up meetings—all automatically.`
      },
      {
        title: "Common Use Cases",
        content: `1. **Lead Nurturing** — Automated email sequences based on lead behavior and scoring
2. **Approval Chains** — Multi-level approvals with escalation rules and timeout handling
3. **Customer Onboarding** — Triggered sequences when new customers are added
4. **Invoice Management** — Payment reminders, overdue notifications, and collection escalation
5. **Report Generation** — Scheduled reports compiled and distributed automatically
6. **Data Synchronization** — Keep systems in sync with real-time data propagation
7. **Meeting Preparation** — Automatic briefing document generation before scheduled meetings
8. **Follow-up Sequences** — Time-based reminders ensuring nothing falls through cracks`
      }
    ]
  },

  erp: {
    title: "Enterprise Resource Planning",
    subtitle: "Intelligent Business Structure That Evolves With You",
    version: 2,
    sections: [
      {
        title: "What is the ERP System?",
        content: `The ERP module is an AI-generated organizational structure that adapts to your company's specific needs. Unlike traditional ERP systems that force you into rigid templates, this system analyzes your business type, strategy, and operations to create a customized structure that actually matches how you work.

**Core Capabilities:**
• **Folder Structures** — Organized hierarchies for documents, data, and processes
• **Data Schemas** — Custom fields and relationships tailored to your business model
• **Integrations** — Connections to the modules and external systems you actually use
• **Smart Routing** — AI-powered document classification and filing
• **Auto-Evolution** — Continuous adaptation as your business changes

The system treats your business as a dynamic organism, not a static org chart.`
      },
      {
        title: "Why Does This Exist?",
        content: `Traditional ERP implementations are expensive, rigid, and often fail because they force businesses to adapt to software rather than software adapting to businesses.

**Problems We Solve:**
1. **Implementation Nightmare** — Traditional ERPs take months or years to configure; ours generates in minutes
2. **One-Size-Fits-All Failure** — Generic structures don't match unique business models
3. **Change Paralysis** — Modifying traditional ERPs requires consultants and downtime
4. **Document Chaos** — Files end up everywhere with no consistent organization
5. **Integration Hell** — Getting systems to talk to each other becomes a full-time job

**The Intelligent Approach:**
AI analyzes your company profile—industry, size, strategy, existing tools—and generates an ERP structure optimized for your specific situation. As your business evolves, the system recognizes changes and recommends structural updates. You're never locked into yesterday's configuration.`
      },
      {
        title: "How It Works",
        content: `**Initial Generation:**
The ERP Generator asks about your business: What industry? What's your primary strategy? How many employees? What tools do you use? Based on responses, AI creates a complete organizational structure including folder hierarchies, data schemas, workflow suggestions, and integration recommendations.

**Smart Document Router:**
When you upload any document—contract, image, spreadsheet, report—the Smart Document Router analyzes its contents, recommends where it should be stored, suggests what data should be extracted, and offers to create relevant workflows. You approve or override, and the document is filed automatically.

**Visual Structure:**
The ERP Mind Map provides a visual representation of your organizational structure. See how departments connect, where processes flow, and how data moves through your business. Click any node to drill into details.

**Evolution Engine:**
The system monitors your business activity patterns and periodically recommends structural updates. New product line? It suggests folder additions. Growing team? It recommends new role structures. The ERP grows with you.

**Research Integration:**
Every ERP-filed document becomes queryable through the Research Studio. Ask questions across your entire document repository and get AI-synthesized answers grounded in your actual business data.`
      },
      {
        title: "Key Features",
        content: `**Industry Templates:**
Start with templates optimized for your industry—SaaS, manufacturing, professional services, retail, and dozens more. Templates incorporate best practices while remaining fully customizable.

**Multi-Entity Support:**
Manage multiple business entities from one interface. Holding companies, subsidiaries, joint ventures—each with appropriate structure and controlled information sharing.

**Compliance Frameworks:**
Built-in support for regulatory requirements. Document retention policies, access controls, and audit trails designed to meet common compliance standards.

**Integration Hub:**
Connect to external systems (accounting, HR, inventory) and keep data synchronized. Changes in connected systems automatically reflect in your ERP structure.`
      }
    ]
  },

  calendar: {
    title: "Calendar & Scheduling",
    subtitle: "Time as a Strategic Asset",
    version: 2,
    sections: [
      {
        title: "What is the Calendar Module?",
        content: `The Calendar module is more than a schedule viewer—it's an intelligent time management system that treats your calendar as a strategic resource. It integrates scheduling, availability management, meeting preparation, and time analytics into a unified interface.

**Core Capabilities:**
• **Unified Calendar View** — All events across connected calendars in one place
• **Smart Scheduling** — AI-powered meeting time suggestions based on multiple factors
• **Availability Sharing** — Customizable booking links with intelligent rules
• **Meeting Preparation** — Automatic briefing documents before important meetings
• **Time Analytics** — Insights into how you actually spend your time

The system recognizes that time is finite and helps you allocate it strategically.`
      },
      {
        title: "Why Does This Exist?",
        content: `Calendar tools have barely evolved in decades. They show you what's scheduled but don't help you schedule wisely. They let others book your time without protecting your priorities. They treat all hours equally when clearly some are more valuable than others.

**Problems We Address:**
1. **Schedule Fragmentation** — Meetings scattered across the day destroying deep work blocks
2. **Context Switching Costs** — Back-to-back meetings on unrelated topics drain energy
3. **Preparation Failure** — Walking into meetings without context or objectives
4. **Time Blindness** — No visibility into where time actually goes
5. **Availability Abuse** — Open calendars leading to meeting overload

**Strategic Scheduling:**
This module learns your preferences, protects your high-value time blocks, clusters related meetings, ensures preparation time exists, and gives you data to make better time allocation decisions.`
      },
      {
        title: "How It Works",
        content: `**Smart Scheduler:**
When scheduling meetings, the AI considers:
• Participant availability across connected calendars
• Time zone complexity for distributed teams
• Energy patterns (avoiding important meetings during typical low-energy periods)
• Context clustering (grouping related meetings)
• Buffer requirements (travel time, preparation, decompression)

**Scheduling Preferences:**
Define your ideal week structure: focus blocks, meeting windows, unavailable periods, preferred meeting lengths. The system enforces these preferences when others try to book your time.

**Meeting Intelligence:**
Before each meeting, the system generates a briefing: attendee backgrounds (pulled from CRM), relevant recent communications, outstanding action items, and suggested talking points. Walk in prepared.

**Time Analytics:**
Dashboards show how your time breaks down: by meeting type, by relationship, by project, by outcome. Identify patterns and make data-driven adjustments to your schedule strategy.

**Integration:**
Connects to Google Calendar, Outlook, and other calendar systems. Two-way sync ensures changes anywhere reflect everywhere.`
      },
      {
        title: "Best Practices",
        content: `1. **Define Focus Blocks First** — Schedule deep work before allowing meetings
2. **Set Realistic Buffers** — 5 minutes between meetings isn't enough; build in 15-30
3. **Review Time Analytics Weekly** — Data reveals patterns you won't notice otherwise
4. **Use Meeting Templates** — Consistent structures make meetings more effective
5. **Protect Mornings** — If that's your high-energy time, don't let it fill with calls
6. **Batch Similar Meetings** — Sales calls together, strategy sessions together`
      }
    ]
  },

  research_studio: {
    title: "Research Studio",
    subtitle: "Your AI-Powered Knowledge Synthesis Engine",
    version: 2,
    sections: [
      {
        title: "What is Research Studio?",
        content: `Research Studio is a NotebookLM-style research environment where you can upload sources, ask questions, and get AI-synthesized answers grounded in your actual documents. It transforms passive document storage into an active knowledge system.

**Core Capabilities:**
• **Multi-Source Ingestion** — Upload PDFs, paste URLs, import YouTube transcripts, connect internal data
• **Source-Grounded Q&A** — Ask questions and get answers with citations to specific sources
• **Audio Overviews** — AI-generated podcast-style summaries of your research
• **Study Tools** — Flashcards, quizzes, and summaries for learning material
• **Content Generation** — Create reports, mind maps, and presentations from research

The system doesn't just store your documents—it understands them.`
      },
      {
        title: "Why Does This Exist?",
        content: `Information overload is the modern professional's constant challenge. You collect articles, save PDFs, bookmark videos—but when you need that information, it's buried in scattered locations and your memory has faded.

**The Knowledge Gap:**
1. **Collection Without Synthesis** — Information saved but never integrated
2. **Search Limitations** — Keywords don't capture conceptual connections
3. **Context Loss** — Forgetting why something seemed important when you saved it
4. **Silos** — External research disconnected from internal business data
5. **Output Friction** — Turning research into deliverables requires starting from scratch

**The Research Studio Approach:**
Every source you add becomes part of a searchable, queryable knowledge base. AI maintains context and connections. When you need information, you ask in natural language and get synthesized answers with citations. When you need output, the system generates drafts based on your actual research.`
      },
      {
        title: "How It Works",
        content: `**Source Ingestion:**
Add sources through multiple methods:
• Upload files (PDF, DOCX, TXT, and more)
• Paste URLs for automatic content extraction
• Import YouTube videos for transcript analysis
• Connect CRM contacts, companies, and deals as sources
• Sync documents from your ERP structure

**Processing & Indexing:**
Each source is processed for semantic understanding. The AI doesn't just index keywords—it comprehends concepts, identifies themes, and maps relationships between sources.

**Conversational Research:**
Ask questions in natural language: "What do my sources say about market trends in Q4?" The AI synthesizes an answer drawing from multiple sources, with citations linking to the exact passages supporting each claim.

**Audio Synthesis:**
Generate podcast-style audio overviews of your research. Two AI hosts discuss your material, making it easy to absorb information while commuting or exercising.

**Output Generation:**
Transform research into deliverables:
• Executive summaries
• Detailed reports
• Mind maps showing concept relationships
• Presentation outlines
• Comparison matrices`
      },
      {
        title: "Integration with Business Data",
        content: `**CRM as Source:**
Add CRM entities as sources. Research a prospect by combining their company profile, contact history, deal details, and external sources about their industry. Ask questions that span internal and external knowledge.

**ERP Document Access:**
Research Studio can access documents filed in your ERP structure. Your business documentation becomes a queryable knowledge base alongside external research.

**Cross-Module Intelligence:**
Insights discovered in Research Studio can flow back to other modules. Identify a competitive threat? Create a task in CRM. Discover a market opportunity? Add a note to a Deal Room.`
      }
    ]
  },

  dashboard: {
    title: "Platform Dashboard",
    subtitle: "Your Business Intelligence Command Center",
    version: 2,
    sections: [
      {
        title: "What is the Dashboard?",
        content: `The Dashboard is your central intelligence hub—a real-time view of what matters most across your entire business operation. It synthesizes data from all connected modules into actionable insights, alerts, and recommendations.

**Core Elements:**
• **Key Metrics** — Revenue, pipeline, relationship health, and custom KPIs at a glance
• **Activity Feed** — Real-time updates on important events across modules
• **AI Recommendations** — Proactive suggestions based on pattern analysis
• **Quick Actions** — Common tasks accessible without navigating to other modules
• **Alerts & Notifications** — Priority items requiring attention

The Dashboard answers the question: "What do I need to know right now?"`
      },
      {
        title: "Why Does This Exist?",
        content: `Modern business tools create silos. Your CRM doesn't know about your calendar. Your project management doesn't see your finances. You become the integration layer, manually synthesizing information across systems.

**The Integration Challenge:**
1. **Context Switching** — Jumping between apps to get a complete picture
2. **Missed Signals** — Important patterns hidden across disconnected systems
3. **Delayed Response** — Problems discovered too late because no unified view
4. **Decision Overhead** — Each decision requires gathering data from multiple sources

**The Unified View:**
The Dashboard connects all modules into a coherent picture. AI identifies cross-module patterns you'd never see in siloed tools. Recommendations consider your complete business context, not just one domain.`
      },
      {
        title: "How It Works",
        content: `**Data Aggregation:**
Every module feeds data to the Dashboard engine. CRM updates, deal progress, calendar events, workflow executions, research insights—everything contributes to your unified view.

**Intelligent Prioritization:**
AI ranks information by urgency and importance. A cooling relationship with a major customer surfaces above routine updates. A deal at risk gets attention before stable opportunities.

**Customizable Layout:**
Arrange Dashboard widgets to match your priorities. Some users want pipeline front-and-center; others prioritize relationship health. Configure the layout that works for how you think.

**Drill-Down Navigation:**
Every Dashboard element links to deeper detail. Click a metric to see the underlying data. Click an alert to open the relevant module with context preserved.

**Time-Aware Insights:**
The Dashboard adapts to time context. Morning view emphasizes preparation for the day. End-of-day surfaces items needing follow-up. Weekly view highlights trends and patterns.`
      },
      {
        title: "Making It Work For You",
        content: `1. **Check Daily** — Make Dashboard review part of your morning routine
2. **Act on AI Recommendations** — The system learns from what you accept and ignore
3. **Customize Aggressively** — Remove widgets you ignore; add ones you wish existed
4. **Use Quick Actions** — Reduce friction for common tasks
5. **Review Weekly Trends** — Daily focus obscures patterns; weekly view reveals them
6. **Trust the Alerts** — When something surfaces as urgent, treat it that way`
      }
    ]
  },

  broadcast: {
    title: "Broadcast Network (UPN)",
    subtitle: "The ESPN of Business Achievement",
    version: 2,
    sections: [
      {
        title: "What is Broadcast?",
        content: `The Broadcast module is the Universal Professional Network (UPN)—a dynamic feed of verified business achievements, industry intelligence, and professional updates. Think of it as a business news network where the content is generated by real professional activity.

**Core Components:**
• **Achievement Feed** — Real-time stream of verified professional wins
• **News Curation** — AI-curated industry news relevant to your interests
• **Interactive Q&A** — Ask questions about news content and get sourced answers
• **Achievement Submission** — Document and share your professional milestones
• **Analytics** — Track engagement and reach of your broadcast content

This isn't social media noise—it's signal: verified achievements and curated intelligence.`
      },
      {
        title: "Why Does This Exist?",
        content: `Professional networks are broken. LinkedIn became a vanity metric contest. Twitter is noise. Industry news is paywalled and disconnected from people you know.

**What's Missing:**
1. **Verification** — Anyone can claim anything; verification is manual and rare
2. **Relevance** — Generic feeds show you everything except what matters
3. **Action** — Reading about achievements doesn't help you connect or collaborate
4. **Context** — News without interpretation is just information, not intelligence

**The UPN Approach:**
Achievements are verified through platform activity—a closed deal in the Deal Room, a completed project with documented outcomes, a successful partnership formation. News is curated by AI that knows your industry focus and professional interests. Everything connects back to people and opportunities in your network.`
      },
      {
        title: "How It Works",
        content: `**Achievement Verification:**
When you close a deal, complete a project, or hit a milestone, the platform has the underlying data. You submit an achievement for broadcast, and the system verifies it against activity records. Verified achievements carry more weight than claims.

**News Curation Agent:**
AI monitors thousands of sources for news relevant to your defined interests. Articles are summarized, categorized, and ranked by relevance. You see the most important developments without wading through noise.

**Q&A Overlay:**
On any news item, ask questions and get AI answers grounded in the source material. "What does this mean for manufacturing companies?" The AI interprets and explains, with citations to the original source.

**Engagement Tracking:**
See who viewed your achievements, how news spreads through the network, and which content resonates. Analytics help you understand your professional visibility.

**Achievement Metrics:**
Each achievement includes structured data: deal size, execution speed, risk tolerance, team composition. This data feeds network matching algorithms and professional scoring systems.`
      },
      {
        title: "Best Practices",
        content: `1. **Submit Real Achievements** — Verification builds credibility; unverifiable claims don't
2. **Be Specific** — "Closed $2M deal in 45 days" beats "Had a great quarter"
3. **Engage with Curated News** — The algorithm learns from what you click and share
4. **Ask Questions** — Q&A engagement improves curation and builds understanding
5. **Check Weekly** — Daily checks become noise; weekly review captures trends`
      }
    ]
  },

  fleet: {
    title: "Fleet Intelligence",
    subtitle: "Managing Physical Assets and Service Networks",
    version: 2,
    sections: [
      {
        title: "What is Fleet Intelligence?",
        content: `Fleet Intelligence is a comprehensive asset and service network management system. It tracks physical assets (vehicles, equipment, property), manages service providers and franchises, and optimizes resource allocation across distributed operations.

**Core Capabilities:**
• **Asset Tracking** — Location, status, and utilization of physical resources
• **Service Network Management** — Vendors, franchises, and partner coordination
• **Work Order System** — Request, assign, track, and complete service tasks
• **Revenue Distribution** — Automated calculation and settlement across partners
• **Analytics Dashboard** — Performance metrics, utilization rates, and cost analysis

Whether you manage a vehicle fleet, service franchise network, or distributed equipment, this module provides unified visibility and control.`
      },
      {
        title: "Why Does This Exist?",
        content: `Managing physical assets and service networks involves complexity that generic tools don't address. Spreadsheets can't track real-time location. Project management tools don't understand revenue sharing. CRMs aren't built for asset lifecycle management.

**Challenges We Address:**
1. **Visibility Gaps** — Not knowing where assets are or their current status
2. **Coordination Overhead** — Managing service providers through email and phone
3. **Revenue Leakage** — Manual calculations leading to errors and disputes
4. **Utilization Blindness** — Assets sitting idle while others are overworked
5. **Maintenance Chaos** — Reactive rather than predictive maintenance

**The Integrated Approach:**
Fleet Intelligence connects asset tracking, service coordination, financial settlement, and analytics into one system. AI optimizes routing, predicts maintenance needs, and identifies utilization opportunities.`
      },
      {
        title: "How It Works",
        content: `**Asset Registry:**
Register all physical assets with relevant metadata: location capabilities, service requirements, capacity, and assigned personnel. Track lifecycle from acquisition through disposal.

**Work Order Flow:**
Service requests enter the system, get routed to appropriate providers based on location, capability, and availability, and flow through completion with automatic documentation and settlement triggers.

**Partner Network:**
Manage relationships with service vendors and franchise operators. Define service territories, capability matrices, and performance expectations. Track against SLAs automatically.

**Revenue Engine:**
When revenue-generating activities occur, the system applies defined distribution rules automatically. Franchise royalties, service commissions, and partner splits calculate and settle without manual intervention.

**Predictive Analytics:**
AI analyzes usage patterns, maintenance history, and external factors to predict when assets will need service, when demand will spike, and where optimization opportunities exist.`
      },
      {
        title: "Use Cases",
        content: `• **Vehicle Fleets** — Delivery services, ride-sharing operations, rental companies
• **Equipment Networks** — Construction equipment, medical devices, manufacturing tools
• **Franchise Operations** — Service franchises, distributed retail, territory management
• **Property Management** — Real estate portfolios, maintenance coordination, vendor management
• **Field Service** — Technician dispatch, parts inventory, service level tracking`
      }
    ]
  },

  marketplace: {
    title: "Marketplace",
    subtitle: "The Business-to-Business Connection Platform",
    version: 2,
    sections: [
      {
        title: "What is the Marketplace?",
        content: `The Marketplace is a B2B connection platform where businesses discover, evaluate, and engage with potential partners, vendors, and customers. Unlike generic directories, listings are enriched with verified platform data—real activity, real achievements, real capabilities.

**Core Components:**
• **Listings** — Service offerings, product catalogs, and partnership opportunities
• **Marketer Network** — Professionals who help promote and connect listings
• **Verification System** — Platform activity validates claimed capabilities
• **Connection Workflow** — Structured engagement from discovery to relationship
• **Analytics** — Performance tracking for listings and connections

Think of it as a business directory where the entries are verified by actual business activity, not just self-reported claims.`
      },
      {
        title: "Why Does This Exist?",
        content: `Finding good business partners is expensive and risky. Directories list everyone equally. References can be manufactured. By the time you discover a vendor is terrible, you've wasted months and money.

**Discovery Challenges:**
1. **Signal vs. Noise** — Every vendor claims to be excellent
2. **Verification Cost** — Due diligence is time-consuming and incomplete
3. **Mismatch Risk** — Finding out too late that capabilities were overstated
4. **Distribution Friction** — Good providers are hard to find if they're not marketing-savvy

**The Verified Marketplace:**
Listings connect to platform activity. A vendor claiming project management expertise? See their actual project completion rates from the Workflow module. A partner claiming deal-closing ability? See their Deal Room history. Verification replaces claims with data.`
      },
      {
        title: "How It Works",
        content: `**Creating Listings:**
Businesses create listings describing their offerings, capabilities, and value propositions. The system automatically enriches listings with verified activity data—achievements from Broadcast, deal history, project completions, relationship scores.

**Marketer Network:**
Marketers are platform users who help promote listings. They earn commissions on successful connections. This creates an incentive layer where good offerings get promoted by people who stake their reputation on recommendations.

**Discovery & Matching:**
AI analyzes your business needs against available listings, surfacing relevant opportunities. Matching considers not just stated capabilities but verified history and relationship proximity.

**Connection Workflow:**
When you find a promising listing, initiate a structured connection. Exchange context, schedule introductory conversations, and track relationship development—all within the platform.

**Performance Analytics:**
Track listing views, connection rates, conversion to relationships, and ultimate outcomes. Optimize your marketplace presence based on data.`
      }
    ]
  },

  tasks: {
    title: "Task Management",
    subtitle: "AI-Enhanced Execution Tracking",
    version: 2,
    sections: [
      {
        title: "What is Task Management?",
        content: `The Task module is an intelligent work tracking system that goes beyond simple to-do lists. Tasks are connected to business context—CRM contacts, Deal Room negotiations, ERP projects—and enhanced with AI that helps prioritize, suggests actions, and learns from your patterns.

**Core Capabilities:**
• **Unified Task View** — All tasks across modules in one place
• **Smart Prioritization** — AI-ranked ordering based on urgency, importance, and dependencies
• **Context Linking** — Tasks connected to relevant business entities
• **AI Assistance** — Suggestions, breakdowns, and scheduling optimization
• **Completion Tracking** — Analytics on productivity patterns and bottlenecks`
      },
      {
        title: "Why Does This Exist?",
        content: `Task management tools fail because they treat tasks as isolated items. In reality, tasks exist in context—they're steps toward deals, follow-ups with contacts, components of projects. Without context, prioritization is guesswork.

**Common Failures:**
1. **List Overload** — Too many tasks, no clear priority
2. **Context Loss** — Forgetting why a task matters
3. **Stale Tasks** — Items sitting on lists forever because they're unclear
4. **Scattered Systems** — Tasks in email, notes, project tools, and head
5. **No Learning** — Making the same prioritization mistakes repeatedly

**The Contextual Approach:**
Every task links to its business context. The AI considers not just due dates but business impact, relationship stakes, and your personal patterns. Over time, the system learns what you actually prioritize and helps align your task list with your actual values.`
      },
      {
        title: "How It Works",
        content: `**Task Creation:**
Create tasks manually or let them generate from other modules—follow-up from a CRM interaction, action item from a Deal Room meeting, step in a Workflow process. Each task carries context from its origin.

**AI Prioritization:**
The AI considers multiple factors:
• Due date and time sensitivity
• Business impact (deal size, relationship importance)
• Dependencies (what's blocked until this is done)
• Your energy patterns (hard tasks when you're fresh)
• Historical patterns (what you actually complete vs. defer)

**Smart Scheduling:**
Connect tasks to calendar and let AI find optimal times. The system considers your task load, energy patterns, and meeting schedule to suggest when you should work on what.

**Context Panel:**
Every task shows its full context: related entities, conversation history, relevant documents, and connected tasks. Never wonder "why is this on my list?"

**Learning Loop:**
As you complete, defer, and delete tasks, the AI learns your actual priorities. Over time, suggestions align better with how you really work.`
      }
    ]
  },

  xodiak_chain: {
    title: "XDK Chain — Layer 1 Blockchain",
    subtitle: "Quantum-Resistant Financial Infrastructure",
    version: 1,
    sections: [
      {
        title: "What is XDK Chain?",
        content: `XDK Chain is XODIAK's native Layer 1 blockchain infrastructure, providing quantum-resistant financial settlement, asset tokenization, and institutional-grade transaction processing.

**Core Architecture:**
• Layer 1 blockchain built on Supabase and Edge Functions
• Post-quantum cryptographic algorithms
• Real-time settlement capabilities
• Proof of Stake consensus mechanism

**Chain Components:**
The XDK Chain consists of four primary interfaces:
1. **Block Explorer** — Browse blocks, transactions, and chain state
2. **Wallet** — Manage XDK tokens and digital assets
3. **Validator Console** — Participate in network consensus
4. **Admin Panel** — Chain configuration and governance`
      },
      {
        title: "Why XDK Chain Exists",
        content: `Traditional blockchain infrastructure faces critical challenges:

**The Quantum Threat:**
Current cryptographic systems (RSA, ECDSA) will be broken by quantum computers. XDK Chain uses lattice-based and hash-based algorithms designed to resist quantum attacks.

**The Settlement Problem:**
Cross-border financial settlement takes days and costs billions annually. XDK Chain enables real-time, low-cost settlement for tokenized assets.

**The Integration Gap:**
Most blockchains exist in isolation. XDK Chain integrates directly with the Biz Dev Platform, enabling seamless tokenization of deals, assets, and transactions.

**Our Approach:**
We built XDK Chain as native infrastructure that brings blockchain capabilities directly into business workflows—not as a separate system, but as an integral part of how value is created and exchanged.`
      },
      {
        title: "Block Explorer",
        content: `**Browsing the Chain:**
The Block Explorer provides complete visibility into chain activity:
• Block height and hash
• Transaction history
• Address balances
• Chain statistics

**Block Structure:**
Each block contains:
• Block number and previous block reference
• Transaction merkle root
• Validator signature
• Timestamp and metadata
• State transitions

**Transaction Types:**
• Token transfers (XDK and tokenized assets)
• Asset tokenization operations
• Smart contract executions
• Governance votes
• Staking operations

**Search Capabilities:**
Find any on-chain data by:
• Block number or hash
• Transaction ID
• Wallet address
• Asset identifier`
      },
      {
        title: "Wallet Management",
        content: `**Wallet Features:**
The XDK Wallet provides secure asset management:

**Portfolio View:**
• XDK token balance
• Tokenized asset holdings
• Transaction history
• Pending operations

**Sending & Receiving:**
• Send tokens to any XDK address
• Receive with QR code or address
• Set transaction priorities
• Add memos and metadata

**Asset Management:**
• View all tokenized assets
• Check asset details and provenance
• Transfer ownership
• Participate in governance

**Security:**
• Multi-factor authentication
• Transaction signing
• Address whitelisting
• Activity alerts`
      },
      {
        title: "Validator Console",
        content: `**Becoming a Validator:**
Validators secure the XDK Chain through Proof of Stake consensus:

**Requirements:**
• Minimum stake of XDK tokens
• Reliable uptime commitment
• Technical infrastructure
• Identity verification

**Validator Operations:**
• Monitor your validator status
• Track blocks proposed and validated
• View reward distributions
• Manage stake delegation

**Consensus Participation:**
Validators participate in:
• Block proposal (when selected)
• Block validation and voting
• Governance proposals
• Network upgrades

**Rewards & Penalties:**
• Earn rewards for honest participation
• Slashing for misbehavior
• Delegation rewards distribution
• Compounding options`
      },
      {
        title: "Quantum Resistance",
        content: `**Why Quantum Matters:**
Quantum computers can break current cryptography:
• RSA: Factoring becomes trivial
• ECDSA: Discrete log problem solved
• Hash functions: Grover's algorithm halves security

**XDK Chain's Protection:**
We implement NIST-approved post-quantum algorithms:

**Lattice-Based Cryptography:**
• CRYSTALS-Dilithium for signatures
• CRYSTALS-Kyber for key exchange
• Based on hard lattice problems

**Hash-Based Signatures:**
• SPHINCS+ for long-term security
• Stateless hash-based signatures
• Conservative security assumptions

**Future-Proofing:**
• Cryptographic agility built in
• Upgrade paths for new algorithms
• Hybrid classical/quantum options
• Regular security audits`
      },
      {
        title: "Asset Tokenization",
        content: `**Supported Asset Types:**
XDK Chain enables tokenization of real-world assets:

• Real estate properties
• Commodity contracts
• Intellectual property
• Revenue shares
• Equipment and vehicles
• Financial instruments

**Tokenization Process:**
1. Asset registration with documentation
2. Legal structure and compliance review
3. Valuation methodology approval
4. Token creation and distribution
5. Ongoing management and reporting

**Token Standards:**
• Fungible tokens (divisible, interchangeable)
• Non-fungible tokens (unique assets)
• Semi-fungible (hybrid use cases)
• Custom standards for specific needs

**Compliance Integration:**
• KYC/AML verification
• Accredited investor checks
• Regulatory reporting
• Jurisdiction management`
      }
    ]
  },

  xodiak: {
    title: "XODIAK — Quantum Financial Platform",
    subtitle: "Institutional-Grade Digital Asset Infrastructure",
    version: 1,
    sections: [
      {
        title: "What is XODIAK?",
        content: `XODIAK is the platform's comprehensive quantum financial infrastructure, providing blockchain-based settlement, asset tokenization, and institutional-grade transaction processing.

**Platform Components:**
• **XDK Chain** — Native Layer 1 blockchain
• **Asset Tokenization** — Real-world asset digitization
• **Compliance Engine** — Regulatory framework support
• **Settlement System** — Real-time value transfer

**Key Capabilities:**
The platform enables:
1. Tokenization of any real-world asset
2. Quantum-resistant security for long-term protection
3. Seamless integration with business workflows
4. Institutional-grade compliance and reporting`
      },
      {
        title: "Why XODIAK Exists",
        content: `Financial infrastructure is due for a fundamental upgrade:

**Current Limitations:**
• Settlement takes days instead of seconds
• Cross-border transfers cost billions annually
• Asset ownership is fragmented across systems
• Security relies on soon-to-be-obsolete cryptography

**The XODIAK Vision:**
We're building financial infrastructure for the next century:
• Real-time settlement globally
• Fractional ownership of any asset
• Quantum-resistant security
• Direct integration with business processes

**Strategic Position:**
XODIAK operates as both a platform feature and a registerable business entity—meaning it can be managed, developed, and potentially sold independently while powering the broader Biz Dev ecosystem.`
      },
      {
        title: "Platform Services",
        content: `**Core Services:**

**Quantum Chain:**
Access to XDK Chain infrastructure:
• Block explorer and transaction visibility
• Wallet management for tokens and assets
• Validator participation options
• Chain governance

**Asset Services:**
Comprehensive tokenization capabilities:
• Asset registration and documentation
• Token creation and distribution
• Ownership transfer mechanisms
• Dividend and revenue distribution

**Compliance Services:**
Regulatory framework support:
• KYC/AML integration
• Investor verification
• Reporting automation
• Multi-jurisdiction handling

**Integration Services:**
Connect XODIAK with business workflows:
• Deal Room settlement integration
• CRM asset tracking
• ERP financial synchronization
• Automated reporting`
      }
    ]
  }
};

export function getWhitePaperContent(moduleKey: string): WhitePaperData | null {
  return whitePaperContent[moduleKey] || null;
}

export function formatWhitePaperAsText(data: WhitePaperData): string {
  let text = `# ${data.title}\n`;
  text += `## ${data.subtitle}\n\n`;
  
  for (const section of data.sections) {
    text += `### ${section.title}\n\n`;
    text += `${section.content}\n\n`;
  }
  
  return text;
}
