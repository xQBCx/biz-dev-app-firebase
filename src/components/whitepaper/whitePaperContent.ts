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
    version: 3,
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
        title: "Multi-Email Identity System",
        content: `**The Challenge:**
Business developers and executives often operate across multiple organizations. A single person may have:
• Corporate email from their primary employer
• Personal email for independent consulting
• Email from a secondary business or advisory role
• Family business email address

Traditional CRMs treat each email as a separate contact, creating fragmented, incomplete pictures of the relationship.

**The Solution — Multi-Email Identity:**
The CRM now supports multiple email addresses per contact:
• **Primary Email** — The main contact email displayed on the profile
• **Alternate Emails** — Additional email addresses associated with this person
• **Primary Email for Outreach** — Specify which email to use for communications

**Use Cases:**
• **Mark Erogbogbo** — Has \`mark@texasstaralliance.com\` (corporate) and \`markoatx@gmail.com\` (personal)
• **Ryan Owen** — May have multiple organizational affiliations

**Contact Merge Capability:**
When duplicate contacts are detected (same person, different emails), use the "Merge Selected" button to:
1. Select 2 or more contacts in the CRM
2. Choose the primary record to keep
3. All alternate emails are consolidated
4. Notes and history are merged
5. Duplicate records are removed

This ensures a complete, unified view of each business relationship regardless of which email they use to communicate.`
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
5. **Trust the Relationship Scores** — When the system flags a relationship as cooling, take action
6. **Merge Duplicates Promptly** — When the same person appears with multiple emails, merge them to maintain a unified profile`
      }
    ]
  },

  deal_room: {
    title: "Deal Room — Enterprise Smart Contract Platform",
    subtitle: "Where Business Ingredients Combine to Create Legally Defensible Value",
    version: 5,
    sections: [
      {
        title: "What is the Deal Room?",
        content: `The Deal Room is an enterprise-grade collaborative workspace where multiple parties bring their unique contributions—capital, technology, customer access, intellectual property, expertise—and combine them into structured, legally defensible business agreements. We call this the "Chemical Blender" model.

**Core Components:**
• **Ingredients** — The assets, capabilities, and resources each party contributes
• **Formulations** — Specific combinations of ingredients designed to solve customer problems
• **Participants** — The entities (individuals or companies) bringing ingredients to the blend
• **Smart Contract Terms** — Machine-readable agreements governing value creation and distribution
• **AI Intelligence** — Gemini-powered assistant for contract understanding and change detection
• **Escrow & Settlement** — Secure fund holding with automated distribution mechanisms
• **Legal Defensibility** — DocuSign-equivalent audit trails with IP, timestamp, and user agent logging
• **Partner Agent Integration** — External automation fleet support for enterprise workflows

Unlike traditional deal management that tracks a single company's pipeline, Deal Rooms orchestrate multi-party value creation with full audit trails and governance.`
      },
      {
        title: "Why Does This Exist?",
        content: `Modern business increasingly happens at the intersection of multiple parties. A software company needs a distribution partner. A manufacturer needs financing and channel access. An IP holder needs operational expertise to commercialize their invention.

**The Traditional Problem:**
These deals happen through fragmented emails, unclear contribution tracking, disputed attribution, and handshake agreements that fall apart when money appears. Smart people avoid collaboration because the overhead exceeds the benefit.

**The Deal Room Solution:**
We created a structured environment where:
1. Every contribution is registered and timestamped with cryptographic proof
2. Attribution rules are defined upfront with XODIAK blockchain anchoring
3. Usage and value creation are tracked automatically via AI and partner agents
4. Settlement happens transparently based on agreed formulas with escrow protection
5. All parties have appropriate visibility based on their role with granular permissions
6. Sensitive information is protected with enterprise-grade access controls
7. Legal defensibility through comprehensive audit logging (IP, user agent, timestamps)
8. AI assistance for contract understanding, change proposal detection, and feedback learning

This transforms collaboration from a trust-dependent gamble into a structured, repeatable, and legally defensible process.`
      },
      {
        title: "Enterprise Onboarding System",
        content: `The Deal Room implements a self-healing, enterprise-scale onboarding architecture that eliminates manual friction.

**Automatic Reconciliation:**
The 'reconcile_deal_room_participants' function and 'handle_new_user' trigger automatically link user profiles to pending invitations by email, bypassing manual access request approvals.

**Atomic Transactions:**
Database triggers ensure invitation status updates and participant creation are atomic and consistent—eliminating race conditions and partial state issues.

**Self-Healing UI:**
The acceptance flow (/deal-room-invite/:token) includes intelligent retry logic and calls the 'reconcile_my_invitations' RPC to automatically repair any state inconsistencies.

**Pre-Staged Permissions:**
Administrators can configure platform access and deal permissions for users BEFORE they join. When a user accepts an invitation and creates an account, their pre-configured access rights are automatically applied—ensuring smooth, one-click entry into deals.

**Data Integrity:**
System-wide validation ensures 'user_id' is never null in participant records once an account exists, with automatic backfill for historical data.`
      },
      {
        title: "AI Orchestration Agent",
        content: `The Deal Room features a full **Orchestration Agent** powered by Gemini 2.5 Flash that goes far beyond Q&A—it can set up entire deals from natural language prompts.

**Comprehensive Platform Knowledge:**
The AI has deep understanding of ALL Deal Room modules:
• **Overview** — Deal summary, description, status
• **Participants** — Managing parties, roles, identity display
• **Ingredients** — Chemical Blender contributions, ownership %
• **Contributions** — Logged events, value attribution
• **Credits** — Outcome-based credit system
• **Structures** — Payout structures and waterfalls
• **Settlement** — Settlement mechanisms
• **Formulations** — Version-controlled deal configurations
• **Analytics** — Performance metrics and dashboards
• **Payouts** — Distribution calculations
• **Chat** — AI assistant (this feature)
• **Messaging** — Direct communication between parties
• **Deliverables** — Task assignments with verification criteria
• **Terms** — Smart contract clauses, agreement tracking
• **Invites** — Participant invitation management
• **Governance** — Voting rules, decision thresholds
• **Escrow** — Digital escrow configuration
• **Agents** — External agent registration, attribution rules
• **AI Analysis** — Contribution maps, fairness scoring

**Action Detection & Execution:**
The AI can detect when users want to modify the deal and extract structured data to execute actions:
• **Add Terms** — Paste legal text, AI parses and creates term entries
• **Create Deliverables** — Describe tasks, AI creates with assignees and due dates
• **Add Participants** — Provide names and emails, AI creates invitations
• **Set Governance** — Describe voting rules, AI configures governance settings
• **Configure Ingredients** — Describe contributions, AI creates ingredient entries

**Admin Confirmation Gate:**
All data-modifying actions require admin confirmation before execution. The AI displays a preview card showing exactly what will be created, with "Confirm & Apply" and "Cancel" buttons.

**Full Deal Setup from Prompts:**
Users can paste a complete "Deal Breakdown Prompt" describing all parties, their contributions, deliverables, and terms. The AI parses everything and sets up the entire deal structure in one operation—subject to admin approval.

**Example Flow:**
\`\`\`
User: "Set up this deal: Partnership between The View Pro 
(bill@theviewpro.com) providing media production (60%) and 
Optimo IT (jason@optimoit.io) providing security (40%). 
Deliverables: Security audit in 30 days, Commercial in 60 days."

AI: "I've analyzed your deal breakdown. Here's what I'll set up:

**Participants:**
• The View Pro - Creator, 60% ownership
• Optimo IT - Partner, 40% ownership

**Deliverables:**
• Security audit - Assigned to Optimo IT - Due: 30 days
• Commercial production - Assigned to The View Pro - Due: 60 days

**Ingredients:**
• Media Production - 60% value weight
• Security Infrastructure - 40% value weight

[Confirm & Set Up Deal] [Cancel]"
\`\`\`

**Human-in-the-Loop Feedback:**
Users can provide 'Thumbs Up' or 'Thumbs Down' on AI responses. Negative feedback triggers a clarification dialog to refine understanding—powering an Expert Imitation Learning flywheel.`
      },
      {
        title: "Legal Defensibility & Audit",
        content: `Deal Room agreements implement a legally defensible digital signature system equivalent to DocuSign.

**Comprehensive Audit Logging:**
Every 'agree' action is logged to 'deal_agreement_audit_log' with:
• User's IP address (for geographic verification)
• User agent string (browser/device identification)
• Precise timestamp (for timeline reconstruction)
• Browser metadata (timezone, resolution, language)
• Document hash (for tamper detection)

**Edge Function Security:**
The 'log-deal-agreement' Edge Function is configured with mandatory JWT verification in supabase/config.toml, ensuring only authenticated and authorized users can create legally binding signatures.

**Export & Verification:**
Signed contracts can be exported as PDF documents including a verification certificate with:
• All signer data and timestamps
• Document cryptographic hashes
• Verification codes for third-party validation
• Complete audit trail summary

**XODIAK Anchoring:**
High-value agreements can be anchored to the XODIAK blockchain for immutable, tamper-proof verification using Merkle tree proofs.`
      },
      {
        title: "Partner Agent Integration",
        content: `The Deal Room serves as the Smart Contract management and payout layer for external automation fleets (Lindy.ai, Airia, OptimoIT).

**Key Features in the Agents Tab:**
1. **Agent Registration Panel** — Register external agents with API keys and capability definitions
2. **Agent Attribution Manager** — Configure credit values per outcome type (meeting booked, deal closed, etc.)
3. **Agent Activity Feed** — Real-time tracking of agent activities with filtering by outcome type and agent
4. **Agent Contribution Viewer** — Visualize agent contributions and XODIAK anchor status
5. **Dual CRM Sync Status** — Monitor HubSpot/Master CRM synchronization with per-deal-room filtering
6. **Agent Sandbox Mode** — Shadow testing mode that logs actions without executing them
7. **Agent Integration Guide** — Developer documentation for API integration

**Workflow Support:**
Supports complex multi-agent workflows like the 5-agent OptimoIT configuration:
• Signal Scout — Prospect identification
• Account Intel — Company research and enrichment
• Sequence+Draft — Outreach content generation
• Booking+Follow-Up — Meeting scheduling and reminders
• Daily Prep — Executive briefing preparation

**Outcome-Based Credits:**
Outcome credits (e.g., for qualified meetings) require external CRM confirmation (HubSpot) before being granted—ensuring pay-for-performance integrity.`
      },
      {
        title: "Smart Escrow System",
        content: `The Deal Room Escrow panel (/deal-room/:id/escrow) manages secure fund holding for multi-party transactions.

**Escrow Account Types:**
• **Platform-Based** — Funds held within the platform's settlement system
• **Multisig Wallets** — Require multiple party signatures for fund release
• **Smart Contract** — Automated release based on blockchain-verified conditions

**Universal Wallet Integration:**
Users can connect various external wallet types for participation:
• MetaMask (Ethereum)
• Phantom (Solana)
• Coinbase Wallet
• Hardware wallets

**Verification Process:**
Wallet connections are verified via cryptographic signature challenges—proving ownership without revealing private keys.

**Advisor Access:**
Participants can invite trusted Advisors (lawyers, accountants) with granular, limited permissions to:
• Review contract terms
• Add private notes visible only to specified participants
• Provide non-binding recommendations
• Access specific documents without full deal visibility`
      },
      {
        title: "Hybrid Permission System",
        content: `Deal Rooms feature a sophisticated two-layer permission architecture that separates platform-wide access from deal-specific controls.

**Layer 1: Platform Permissions**
Controls what modules a user can access across the entire BizDev platform (CRM, ERP, Workflows, etc.). Managed by system administrators. Users with 'deal_rooms' view+create permissions can access the module.

**Layer 2: Deal Room Permissions**
Controls what a participant can do and see within a specific deal. Each deal can have unique permission structures because deals vary in complexity and sensitivity.

**Role Presets:**
• **Creator** — Full access to all deal functions and visibility (Master Admin authority)
• **Admin** — Full management capabilities within the deal
• **Investor** — View documents, own financials, and deal terms
• **Advisor** — See everything but limited edit rights, can add private notes
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
        title: "Identity Display Management",
        content: `The ParticipantDisplayEditor allows users and admins to configure how identities appear within deals.

**Display Modes:**
• **Full Name** — Real name from profile
• **First Name Only** — Privacy-preserving partial identity
• **Company** — Organization name instead of personal identity
• **Anonymous** — Pseudonymous participation
• **Wallet Address** — Crypto-native identity verification

**Override System:**
• Custom display name overrides are supported
• Users can choose their public appearance within each deal
• True identity remains linked to Biz Dev profile for Master Admin oversight

**Governance:**
Platform admins and Deal Room creators have permission to edit display settings for any participant—ensuring compliance with regulatory or organizational requirements.`
      },
      {
        title: "CRM Integration & Sync",
        content: `The platform supports bidirectional CRM synchronization with HubSpot as the primary external integration.

**System of Record Architecture:**
• **Biz Dev App** — System of Record (authoritative source)
• **HubSpot** — System of Execution (operational CRM)

**HubSpot Configuration:**
The HubSpotConfigDialog in the Agents tab manages:
• API/OAuth credential storage (encrypted in deal_room_integrations table)
• Sync preferences (contacts, deals, activities)
• Auto-sync toggle
• Connection testing

**Dual CRM Sync Status:**
The DualCRMSyncStatus component provides real-time visibility:
• Synced count (activities with hubspot_sync_id)
• Pending count (awaiting sync)
• Failed count (sync errors)
• Recent activity log with status indicators

**Data Isolation:**
Sync status queries filter specifically by deal_room_id—ensuring users only see activities relevant to their specific deal, preventing platform-wide CRM data from leaking into individual deal room views.`
      },
      {
        title: "Chemical Blender Model",
        content: `The Chemical Blender is the conceptual framework for how Deal Rooms combine diverse contributions.

**Ingredients (Raw Materials):**
• Software licenses and IP
• Capital investment
• Customer introductions
• Technical expertise
• Distribution channels
• Brand value

**Formulation Building:**
Using the Formulation Builder, participants combine ingredients into specific customer solutions. Example: Party A's software + Party B's implementation services + Party C's customer relationship = Complete offering.

**Structure Definition:**
Revenue share percentages, payment waterfalls, expense allocations, and exit provisions are documented in machine-readable format—enabling automated settlement calculations.

**Execution & Tracking:**
As formulations are deployed to customers, the system tracks:
• Usage metrics
• Revenue attribution
• Cost allocation
• Performance against SLAs

**Settlement:**
Based on tracked metrics and agreed structures, the system calculates distributions and facilitates settlement with complete audit trails.`
      },
      {
        title: "User Experience & Mobile",
        content: `The Deal Room is optimized for enterprise use across all devices.

**Responsive Design:**
• Deliverables and titles stretch to full width for readability
• Fluid typography using clamp() for proportional scaling
• Scrollable terms panels without fixed height restrictions
• Mobile-optimized headers and action buttons

**Master White Paper Integration:**
Direct WhitePaperIcon links in module headers provide instant access to this documentation—ensuring users always understand the system they're using.

**Terms of Service Flow:**
• Scrollable content area within dialog
• Accept button positioned at document end
• Preserves intended destination after acceptance
• Mobile-optimized layout prevents chunking

**Accessibility:**
• Semantic HTML structure
• Keyboard navigation support
• Screen reader compatibility
• High contrast mode support`
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
  },

  true_odds: {
    title: "True Odds — Statistical Intelligence Engine",
    subtitle: "Data-Driven Probability Assessment for Strategic Decision Making",
    version: 1,
    sections: [
      {
        title: "What is True Odds?",
        content: `True Odds is a sophisticated statistical analysis module that calculates realistic probability assessments for business outcomes, deals, investments, and strategic decisions. Unlike gut-feeling estimates or optimistic projections, True Odds applies rigorous statistical methodology to provide calibrated probability assessments.

**Core Capabilities:**
• **Deal Probability Scoring** — Likelihood of deal closure based on historical patterns and current signals
• **Risk Assessment Matrices** — Multi-factor risk evaluation with weighted scoring
• **Outcome Modeling** — Monte Carlo simulations for range-of-outcomes analysis
• **Comparative Analytics** — How current opportunities compare to historical baselines
• **Confidence Calibration** — Ensuring stated probabilities match actual outcomes over time

The module integrates with CRM, Deal Rooms, and financial data to provide context-aware probability assessments grounded in your actual business history.`
      },
      {
        title: "Why Does This Exist?",
        content: `Human intuition systematically fails at probability assessment. We're overconfident in good times, overly pessimistic in bad. We anchor on irrelevant numbers. We confuse familiarity with probability.

**The Forecasting Problem:**
1. **Optimism Bias** — Sales teams consistently overestimate close probabilities
2. **Recency Bias** — Recent outcomes disproportionately influence expectations
3. **Narrative Fallacy** — Good stories feel more probable than boring ones
4. **Base Rate Neglect** — Ignoring historical frequencies in favor of case-specific details
5. **Overconfidence** — Stated 90% probabilities actually occur 70% of the time

**The True Odds Solution:**
We apply Bayesian probability updating, historical base rate analysis, and signal-weighting algorithms to generate calibrated probability estimates. Over time, the system learns from your specific outcomes to improve accuracy for your business context.

**Integration with Instincts Layer:**
True Odds feeds directly into the platform's Instincts AI layer, enabling agents to make probabilistically-informed recommendations and prioritize actions based on expected value rather than gut feeling.`
      },
      {
        title: "How It Works",
        content: `**Data Integration:**
True Odds pulls from multiple platform sources:
• CRM interaction history and relationship strength scores
• Deal Room progress indicators and milestone completion
• Historical deal outcomes with similar characteristics
• External market signals and industry benchmarks
• Time-in-stage metrics and velocity indicators

**Probability Calculation:**
The engine applies multiple methodologies:
• **Base Rate Analysis** — What percentage of similar deals historically closed?
• **Signal Weighting** — Which current indicators predict success or failure?
• **Bayesian Updating** — How do new developments shift probabilities?
• **Decay Functions** — How do stale opportunities differ from active ones?
• **Comparative Scoring** — How does this opportunity rank against peers?

**Calibration System:**
The module continuously tracks predicted vs. actual outcomes. If 80% predictions are closing at 65%, the system adjusts its models to improve calibration. This creates a feedback loop that makes predictions more accurate over time.

**Confidence Intervals:**
Rather than single-point estimates, True Odds provides ranges: "70% probability of closing, with 90% confidence the actual probability is between 55% and 85%." This honest uncertainty acknowledgment improves decision-making.`
      },
      {
        title: "Use Cases",
        content: `**Pipeline Forecasting:**
Generate realistic revenue forecasts by applying calibrated probabilities to deal values. Replace "hoped-for" numbers with statistically-grounded projections.

**Resource Allocation:**
Focus sales effort on opportunities with favorable expected value (probability × deal value), not just the biggest or most exciting deals.

**Risk Management:**
Identify deals where probability is declining despite continued investment. Recognize when to cut losses early.

**Investment Decisions:**
Apply True Odds methodology to investment opportunities, comparing expected returns against realistic probability distributions.

**Strategic Planning:**
Use probabilistic scenario planning for major business decisions, understanding the range of possible outcomes rather than betting on single forecasts.`
      },
      {
        title: "Best Practices",
        content: `1. **Trust the Numbers** — When True Odds conflicts with intuition, investigate why before overriding
2. **Feed the System** — Accurate outcome recording improves future predictions
3. **Use Ranges** — Single-point estimates create false precision; embrace uncertainty
4. **Review Calibration** — Regularly check whether stated probabilities match actual frequencies
5. **Combine with Judgment** — True Odds provides input, not final answers; context matters
6. **Update Frequently** — Probabilities should shift as new information arrives`
      }
    ]
  },

  xcommodity: {
    title: "XCommodity — Digital Commodity Trading Platform",
    subtitle: "Institutional-Grade Commodity Markets with AI-Enhanced Intelligence",
    version: 1,
    sections: [
      {
        title: "What is XCommodity?",
        content: `XCommodity is a comprehensive digital platform for commodity trading, market intelligence, and supply chain integration. It connects commodity producers, traders, refiners, and end-users in a transparent marketplace enhanced by AI analytics and blockchain-based settlement.

**Core Components:**
• **Market Dashboard** — Real-time pricing, volume, and market sentiment for major commodities
• **Trading Interface** — Execute trades, manage positions, and hedge exposures
• **Supply Chain Integration** — Track physical commodity movements from origin to destination
• **Market Intelligence** — AI-curated news, analysis, and predictive signals
• **Settlement System** — Integration with XDK Chain for transparent, efficient settlement

**Supported Commodities:**
XCommodity covers energy (crude oil, natural gas, refined products), metals (precious and industrial), agricultural products, and emerging commodities like carbon credits and rare earths.`
      },
      {
        title: "Why Does This Exist?",
        content: `Commodity markets are opaque, fragmented, and dominated by intermediaries who extract value without adding transparency. Smaller players lack access to the same intelligence and execution capabilities as major trading houses.

**Market Inefficiencies:**
1. **Information Asymmetry** — Large traders have better data; small players trade blind
2. **Intermediary Costs** — Brokers, traders, and middlemen extract significant margins
3. **Settlement Risk** — Cross-border commodity trades involve complex credit relationships
4. **Supply Chain Opacity** — Physical commodity tracking is manual and unreliable
5. **Market Access** — Smaller producers and consumers struggle to reach counterparties

**The XCommodity Vision:**
We're democratizing commodity market access by providing institutional-grade tools, intelligence, and execution to participants of all sizes. AI levels the information playing field. Blockchain settlement reduces counterparty risk. Direct marketplace access cuts out unnecessary intermediaries.

**Integration with Instincts Layer:**
XCommodity's market intelligence feeds into the platform's AI agents, enabling automated trading signals, risk alerts, and strategic recommendations based on commodity market conditions.`
      },
      {
        title: "How It Works",
        content: `**Market Data Infrastructure:**
Real-time feeds from major exchanges and OTC markets:
• Spot and futures prices across global benchmarks
• Volume and open interest data
• Bid/ask spreads and market depth
• Historical price patterns and seasonal analysis
• Cross-commodity correlation tracking

**Trading Execution:**
Execute trades through integrated counterparty networks:
• Direct marketplace for producer-to-consumer trades
• Broker integration for exchange-traded products
• OTC desk connections for customized structures
• Hedging tools for price risk management

**AI Market Intelligence:**
AI agents continuously monitor and analyze:
• News and social sentiment affecting commodity markets
• Geopolitical developments impacting supply/demand
• Weather patterns affecting agricultural and energy commodities
• Shipping and logistics data signaling supply disruptions
• Technical patterns suggesting price movements

**Physical Tracking:**
For physical commodity trades:
• GPS tracking of shipments
• Quality certification verification
• Customs and regulatory documentation
• Chain of custody maintenance
• Delivery confirmation and settlement triggers`
      },
      {
        title: "Settlement & Compliance",
        content: `**XDK Chain Integration:**
Commodity trades can settle on XDK Chain:
• Tokenized commodity contracts for fractional ownership
• Smart contract escrow for trade settlement
• Quantum-resistant security for long-term positions
• Transparent transaction history for audit purposes

**Regulatory Compliance:**
Built-in frameworks for:
• CFTC reporting requirements for US-based trades
• EMIR obligations for European participants
• Sanctions screening and trade finance compliance
• Anti-money laundering verification

**Credit & Risk Management:**
• Counterparty credit assessment
• Margin and collateral management
• Position limit monitoring
• Exposure reporting and alerts`
      },
      {
        title: "Best Practices",
        content: `1. **Start with Intelligence** — Understand market context before executing trades
2. **Use Hedging Tools** — Physical commodity exposure should be managed, not speculated on
3. **Track Physically** — For physical trades, utilize full supply chain visibility
4. **Monitor Counterparties** — Credit risk is real in commodity markets
5. **Leverage AI Signals** — Market intelligence identifies opportunities humans miss
6. **Document Everything** — Commodity trades involve regulatory scrutiny; maintain records`
      }
    ]
  },

  the_grid: {
    title: "The Grid — Intelligent Productivity Suite",
    subtitle: "Embedding-Driven Workspace Tools That Learn and Adapt",
    version: 1,
    sections: [
      {
        title: "What is The Grid?",
        content: `The Grid is a comprehensive productivity suite that reimagines traditional office tools through embedding-driven intelligence. Unlike static applications that treat each document or task in isolation, Grid tools learn from every interaction to provide personalized suggestions, automated workflows, and cross-tool insights.

**Grid Tool Categories:**

**Core Tools:**
• **Pulse** — Smart notes and knowledge capture that understands context
• **Rhythm** — Adaptive task management that learns your work patterns
• **Vault** — Intelligent file storage with automatic organization

**Productivity Tools:**
• **Scribe** — Document creation with AI writing assistance
• **Matrix** — Spreadsheets enhanced with natural language queries
• **Canvas** — Visual design and presentation builder

**Intelligence Tools:**
• **Nexus** — Relationship mapping and network visualization
• **Sphere** — 360-degree view of any entity (person, company, project)
• **Momentum** — Progress tracking and goal achievement system

**Automation & Collaboration:**
• **Flow** — Visual automation builder for cross-tool workflows
• **Sync** — Real-time collaboration and change tracking
• **Gather** — Meeting and communication hub`
      },
      {
        title: "Why Does This Exist?",
        content: `Traditional productivity tools haven't fundamentally evolved in decades. Word processors still don't know what you're writing about. Spreadsheets still don't suggest relevant formulas. File systems still don't organize themselves.

**The Productivity Paradox:**
1. **Tool Silos** — Each app is an island; switching contexts costs time and mental energy
2. **Manual Organization** — You spend more time organizing than doing
3. **No Learning** — Tools don't get smarter from your usage patterns
4. **Generic Defaults** — Same interface for everyone, regardless of work style
5. **Reactive Design** — Tools wait for commands instead of anticipating needs

**The Grid Difference:**
Every Grid tool feeds into a unified embedding system that understands relationships between your notes, tasks, files, and communications. Write a note about a client, and it automatically links to relevant CRM data. Create a task, and the system suggests related documents. The more you use The Grid, the smarter it becomes.

**Instincts Layer Integration:**
The Grid's embedding system is the foundation for the platform's Instincts AI layer. User behavior patterns, content relationships, and work preferences flow into the AI agents that provide proactive assistance across all platform modules.`
      },
      {
        title: "How It Works",
        content: `**Embedding Architecture:**
Every piece of content in The Grid is converted to semantic embeddings—mathematical representations that capture meaning. This enables:
• Similarity detection across different content types
• Automatic linking of related items
• Semantic search beyond keyword matching
• Pattern recognition in work behavior

**Tool Integration:**
Grid tools share a common data layer:
• Notes in Pulse can reference Matrix data
• Tasks in Rhythm link to Scribe documents
• Files in Vault connect to everything
• Automations in Flow trigger across all tools

**Personalization Engine:**
The system learns from your behavior:
• How you organize information
• When you're most productive
• What content relationships matter to you
• Which suggestions you accept or reject

**AI Assistance:**
Throughout The Grid, AI provides:
• Writing suggestions based on context and style
• Formula recommendations in spreadsheets
• Organization suggestions for files
• Task prioritization based on patterns
• Meeting preparation summaries`
      },
      {
        title: "Individual Tools Deep Dive",
        content: `**Pulse (Smart Notes):**
Capture notes that understand context. Tag with entities, link to CRM records, extract action items automatically. Notes become searchable knowledge, not buried text.

**Rhythm (Adaptive Tasks):**
Task management that learns when you complete tasks, what you procrastinate, and how to schedule for your actual work patterns. AI scheduling that adapts to energy levels.

**Vault (Intelligent Storage):**
File storage with AI organization. Drop files and let the system suggest locations. Automatic tagging, version control, and relationship mapping.

**Scribe (AI Documents):**
Write with AI that knows your style, your audience, and your purpose. Context-aware suggestions, automatic formatting, and integration with platform data.

**Matrix (Smart Spreadsheets):**
Spreadsheets you can talk to. Ask "what's the average deal size by region?" and get formulas built automatically. Natural language data analysis.

**Canvas (Visual Builder):**
Create presentations and visuals with AI assistance. Layout suggestions, design consistency, and automatic data visualization from platform sources.`
      },
      {
        title: "Best Practices",
        content: `1. **Use Consistently** — The more you use Grid tools, the smarter they become
2. **Connect Everything** — Link notes to tasks to files to contacts; relationships are power
3. **Trust Suggestions** — AI recommendations improve with feedback; try them before overriding
4. **Review Automations** — Periodically check Flow automations for optimization opportunities
5. **Embrace Search** — Semantic search finds things you forgot you saved
6. **Cross-Tool Thinking** — Don't silo work into single tools; use the integration`
      }
    ]
  },

  instincts_layer: {
    title: "Instincts Layer — Autonomous AI Agent System",
    subtitle: "The Intelligence That Powers Proactive Business Automation",
    version: 1,
    sections: [
      {
        title: "What is the Instincts Layer?",
        content: `The Instincts Layer is the platform's core AI infrastructure—a network of specialized agents that observe, learn, and act across all modules. Unlike reactive AI that waits for prompts, the Instincts Layer proactively identifies opportunities, flags risks, and executes automated actions based on learned patterns.

**Core Architecture:**
• **Agent Registry** — Catalog of specialized AI agents with defined capabilities and permissions
• **Execution Engine** — Task scheduling, dependency management, and agent orchestration
• **Learning System** — Continuous improvement through outcome tracking and feedback
• **Guardrail Framework** — Safety constraints preventing harmful or unauthorized actions
• **Attribution System** — Credit tracking for agent contributions to business outcomes

**Agent Types:**
• **Observers** — Monitor data streams and flag patterns
• **Analysts** — Process information and generate insights
• **Actors** — Execute defined actions when conditions are met
• **Advisors** — Provide recommendations requiring human approval
• **Orchestrators** — Coordinate multi-agent workflows`
      },
      {
        title: "Why Does This Exist?",
        content: `Most business AI is passive—it answers when asked but never initiates. This leaves enormous value on the table. Opportunities expire while waiting for human attention. Risks escalate unnoticed. Routine tasks consume time that should go to strategic thinking.

**The Automation Gap:**
1. **Reactive AI Limitation** — Chatbots answer questions but don't spot problems
2. **Notification Overload** — Alerts pile up; important signals get lost
3. **Inconsistent Execution** — Human processes vary by mood, energy, and attention
4. **Opportunity Cost** — Time spent on routine work isn't spent on high-value activities
5. **Knowledge Silos** — Expertise trapped in individuals rather than systematized

**The Instincts Vision:**
We built an AI layer that behaves like a skilled team member who's always watching, always learning, and always ready to act within defined boundaries. Agents handle the routine so humans can focus on judgment, creativity, and relationships.

**Cross-Platform Integration:**
The Instincts Layer touches every module:
• CRM agents monitor relationship health and suggest outreach
• Deal Room agents track negotiation patterns and flag risks
• Workflow agents identify automation opportunities
• Research agents surface relevant intelligence proactively`
      },
      {
        title: "How It Works",
        content: `**Agent Activation:**
Agents are registered in the Agent Registry with:
• Defined capabilities and permissions
• Trigger conditions for activation
• Action boundaries (what they can and cannot do)
• Resource limits (API calls, processing time)
• Human oversight requirements

**Observation & Pattern Recognition:**
Agents continuously monitor their assigned domains:
• Data changes across platform modules
• User behavior patterns
• External signals (news, market data)
• Timing and scheduling triggers

**Decision & Action:**
When conditions match agent triggers:
1. Agent evaluates the situation using its model
2. Guardrails check the proposed action
3. If human oversight required, notification sent
4. If autonomous action allowed, execution proceeds
5. Outcome recorded for learning

**Learning Loop:**
Agents improve through:
• Outcome tracking (did the action achieve its goal?)
• Feedback integration (human corrections to recommendations)
• A/B testing of different approaches
• Cross-agent knowledge sharing

**Attribution & Credit:**
The system tracks agent contributions to business outcomes:
• Which agent identified an opportunity?
• What actions led to deal closure?
• How much value did automation create?

This enables ROI calculation for AI investment and reward distribution when agents contribute to Deal Room outcomes.`
      },
      {
        title: "Guardrails & Safety",
        content: `**The Safety Framework:**
Autonomous AI requires robust constraints:

**Permission Boundaries:**
• Agents can only access data within their assigned scope
• Actions are limited to defined capability sets
• Resource consumption is capped to prevent runaway processes

**Human Oversight Rules:**
• High-impact actions require human approval
• Unusual patterns trigger escalation
• Confidence thresholds gate autonomous execution

**Audit Trail:**
• Every agent action is logged with full context
• Decision reasoning is recorded for review
• Outcomes are tracked for accountability

**Kill Switches:**
• Agents can be immediately deactivated
• Actions can be rolled back where possible
• Emergency stops at system level

**Governance:**
• Agent behavior policies defined by administrators
• Regular review of agent actions and outcomes
• Feedback mechanisms for users to flag issues`
      },
      {
        title: "Best Practices",
        content: `1. **Start Conservative** — Enable agents with high oversight requirements first; reduce as trust builds
2. **Review Recommendations** — Agent suggestions train future behavior; thoughtful feedback improves accuracy
3. **Monitor Attribution** — Understand which agents create value to optimize investment
4. **Audit Regularly** — Review agent actions for unintended patterns or behaviors
5. **Expand Gradually** — Add agent capabilities incrementally as you understand their behavior
6. **Trust the Guardrails** — The safety framework prevents harmful actions; work with it, not around it`
      }
    ]
  },

  app_store: {
    title: "App Store — Platform Extension Marketplace",
    subtitle: "Extend Platform Capabilities with Verified Applications",
    version: 1,
    sections: [
      {
        title: "What is the App Store?",
        content: `The App Store is the platform's marketplace for extensions, integrations, and add-on applications. It enables third-party developers to build solutions that extend platform capabilities while giving users a curated catalog of verified, secure applications.

**Core Components:**
• **App Registry** — Catalog of available applications with descriptions, pricing, and reviews
• **License Management** — Subscription, one-time purchase, and usage-based licensing
• **Installation System** — One-click deployment with automatic configuration
• **Developer Portal** — Tools for building, testing, and publishing applications
• **Review System** — User ratings and verified reviews

**App Categories:**
• **Integrations** — Connections to external services (CRM, accounting, marketing)
• **Extensions** — New features added to existing modules
• **Templates** — Pre-built workflows, documents, and configurations
• **Analytics** — Specialized reporting and business intelligence
• **AI Agents** — Custom Instincts Layer agents for specific use cases`
      },
      {
        title: "Why Does This Exist?",
        content: `No platform can build everything every user needs. But uncontrolled extensions create security risks, compatibility problems, and support nightmares.

**The Extension Dilemma:**
1. **Diverse Needs** — Different industries and companies need different capabilities
2. **Development Velocity** — Core team can't build every requested feature
3. **Security Concerns** — Third-party code can introduce vulnerabilities
4. **Quality Variance** — Open extension systems have quality all over the map
5. **Support Burden** — Extensions break; users blame the platform

**The App Store Solution:**
We created a curated marketplace with:
• Security review before publication
• Quality standards enforcement
• Clear attribution (what's core, what's third-party)
• Centralized license management
• Developer incentives aligned with user value

**Integration with Platform:**
Apps integrate through defined APIs and can:
• Add UI elements to existing modules
• Create new workflow actions
• Register Instincts Layer agents
• Access platform data (with user permission)
• Extend existing data schemas`
      },
      {
        title: "How It Works",
        content: `**For Users:**

**Discovery:**
Browse the App Store by category, search by keyword, or explore curated collections. Each app listing includes:
• Description and feature list
• Screenshots and demos
• Pricing and licensing terms
• User reviews and ratings
• Compatibility information

**Installation:**
Click to install. The system handles:
• License verification
• Configuration setup
• Permission grants
• Module integration

**Management:**
View installed apps, manage licenses, update versions, and remove applications through a central dashboard.

**For Developers:**

**Development:**
Build apps using the platform SDK:
• API access to platform data
• UI component libraries
• Webhook integrations
• Instincts Layer agent registration

**Testing:**
Sandbox environment for development and testing. Submit for review when ready.

**Publication:**
After security and quality review, apps appear in the marketplace. Set pricing, track installations, and receive payments.`
      },
      {
        title: "Affiliate & Commission System",
        content: `**For App Developers:**
Revenue from app sales with platform commission:
• Standard commission on subscription revenue
• Lower commission for lifetime/one-time purchases
• Tiered rates based on volume

**For Referrers:**
Earn commissions by recommending apps:
• Affiliate links for app store listings
• Commission on referred installations
• Multi-tier referral bonuses for high-value apps

**For Integration Partners:**
Special terms for apps that bring users to the platform:
• Reduced commissions for user acquisition
• Co-marketing opportunities
• Featured placement programs`
      },
      {
        title: "Best Practices",
        content: `**For Users:**
1. **Check Reviews** — Real user feedback indicates quality and reliability
2. **Start with Free Tiers** — Test before committing to paid plans
3. **Monitor Permissions** — Only grant access apps actually need
4. **Keep Updated** — Install updates for security and feature improvements

**For Developers:**
1. **Follow Guidelines** — Rejected apps waste everyone's time
2. **Invest in UX** — User experience drives reviews and retention
3. **Provide Support** — Responsive support builds reputation
4. **Iterate on Feedback** — User suggestions improve product-market fit`
      }
    ]
  },

  profile_management: {
    title: "Profile Management — User Identity & Preferences",
    subtitle: "Your Digital Identity Across the Platform",
    version: 1,
    sections: [
      {
        title: "What is Profile Management?",
        content: `Profile Management is the centralized system for managing user identity, preferences, permissions, and personalization across the entire platform. It controls how users appear to others, what they can access, and how the platform adapts to their preferences.

**Core Components:**
• **Identity Settings** — Name, avatar, contact information, and public profile
• **Security Configuration** — Password, 2FA, session management, and security logs
• **Preference Management** — Notification settings, display preferences, and defaults
• **Permission Dashboard** — View and manage access rights across modules
• **Activity History** — Complete log of platform interactions

**Profile Scope:**
Your profile controls experience across all modules—CRM, Deal Rooms, The Grid, and every other feature. Changes propagate everywhere, ensuring consistency.`
      },
      {
        title: "Why Does This Exist?",
        content: `Fragmented identity management creates friction and security risks. When settings are scattered across modules, users can't maintain consistent security postures or preferences.

**Identity Challenges:**
1. **Setting Sprawl** — Preferences spread across multiple locations
2. **Security Inconsistency** — Different security levels in different places
3. **Permission Confusion** — Unclear what access exists where
4. **Personalization Gaps** — Each module has to learn preferences independently
5. **Audit Difficulty** — Activity scattered; hard to review comprehensively

**The Unified Profile:**
We centralized identity management to:
• Provide one place for all security settings
• Enable platform-wide preference propagation
• Create clear permission visibility
• Maintain comprehensive activity logs
• Support consistent personalization`
      },
      {
        title: "How It Works",
        content: `**Identity Configuration:**
Set your public profile:
• Display name and avatar
• Professional title and company
• Contact preferences (which channels to use)
• Timezone and locale settings
• Public visibility preferences

**Security Settings:**
Manage account security:
• Password management and rotation
• Two-factor authentication setup
• Session viewing and termination
• API key management
• Security event review

**Preferences:**
Configure platform behavior:
• Notification channels and frequency
• Default views and layouts
• Language and formatting preferences
• Keyboard shortcuts and accessibility
• Theme and display options

**Permission Visibility:**
View your access rights:
• Module-by-module permission summary
• Role assignments and sources
• Deal Room specific permissions
• Time-limited access grants
• Delegation capabilities`
      },
      {
        title: "Best Practices",
        content: `1. **Enable 2FA** — Two-factor authentication significantly reduces account compromise risk
2. **Review Sessions** — Periodically check active sessions and terminate unknown ones
3. **Audit Activity** — Regular activity review catches unauthorized access early
4. **Configure Notifications** — Balance staying informed with avoiding noise
5. **Keep Profile Current** — Accurate information helps others find and verify you
6. **Use Strong Passwords** — Unique, complex passwords for your account`
      }
    ]
  },

  notifications: {
    title: "Notification System — Intelligent Alert Management",
    subtitle: "The Right Information at the Right Time",
    version: 1,
    sections: [
      {
        title: "What is the Notification System?",
        content: `The Notification System is the platform's intelligent alert infrastructure that delivers relevant information through the right channels at the right time. It goes beyond simple push notifications to provide context-aware, priority-ranked, actionable alerts.

**Core Capabilities:**
• **Multi-Channel Delivery** — In-app, email, SMS, push, and webhook notifications
• **Priority Ranking** — AI-determined importance based on context and history
• **Batching & Digests** — Intelligent grouping to prevent notification fatigue
• **Action Integration** — Handle tasks directly from notifications
• **Preference Learning** — Adapts to your actual attention patterns

**Notification Types:**
• **Alerts** — Urgent items requiring immediate attention
• **Updates** — Status changes on items you're tracking
• **Recommendations** — AI-suggested actions from the Instincts Layer
• **Digests** — Periodic summaries of activity
• **System** — Platform maintenance, security events, and announcements`
      },
      {
        title: "Why Does This Exist?",
        content: `Notification systems typically fail in two ways: they either miss important things or overwhelm with noise. Neither serves users well.

**Notification Failures:**
1. **Volume Overload** — So many alerts that important ones get lost
2. **Poor Timing** — Notifications arrive when you can't act on them
3. **Missing Context** — Knowing something happened without knowing why it matters
4. **Channel Mismatch** — Urgent items in email; trivial ones via push
5. **No Learning** — System ignores your response patterns

**The Intelligent Approach:**
We built a notification system that:
• Learns what actually gets your attention
• Routes through appropriate channels based on urgency
• Batches low-priority items into digests
• Provides context so you can decide without clicking through
• Enables action without leaving the notification interface`
      },
      {
        title: "How It Works",
        content: `**Priority Classification:**
AI evaluates each notification for:
• Business impact (deal size, relationship importance)
• Time sensitivity (deadline proximity, window of opportunity)
• User patterns (what you typically respond to)
• Context relevance (current focus, time of day)

**Channel Selection:**
Based on priority and preferences:
• Highest priority → Push + SMS + Email
• High priority → Push + Email
• Medium priority → In-app + Email digest
• Low priority → Digest only

**Batching Logic:**
Related notifications are grouped:
• Multiple updates to the same deal → Single summary
• Series of routine events → Daily digest
• Rapid-fire alerts → Consolidated notice with count

**Action Capabilities:**
Many notifications support inline action:
• Approve/reject without opening module
• Quick reply to messages
• Mark tasks complete
• Snooze for later
• Dismiss with feedback`
      },
      {
        title: "Best Practices",
        content: `1. **Configure Channels** — Set which channels are available for each priority level
2. **Use Do Not Disturb** — Focus time settings prevent interruption when needed
3. **Train the System** — Your response patterns teach priority classification
4. **Review Digests** — Low-priority items matter in aggregate
5. **Provide Feedback** — "This wasn't important" helps future classification
6. **Set Exceptions** — VIP contacts or critical deals can override normal rules`
      }
    ]
  },

  activity_tracking: {
    title: "Activity Tracking — Comprehensive Platform Analytics",
    subtitle: "Understanding How Work Actually Happens",
    version: 1,
    sections: [
      {
        title: "What is Activity Tracking?",
        content: `Activity Tracking is the platform's comprehensive logging and analytics system that records how users interact with the platform, how work flows through processes, and how outcomes relate to actions. It provides visibility for individuals, teams, and administrators.

**Core Capabilities:**
• **User Activity Logs** — Complete record of platform interactions
• **Entity Timelines** — History of changes to any CRM, Deal, or data entity
• **Process Analytics** — How workflows and deals progress through stages
• **Time Analysis** — Where time is spent across platform activities
• **Audit Support** — Tamper-resistant logs for compliance and investigation

**Tracking Scope:**
Activity tracking covers all platform modules—CRM updates, Deal Room changes, workflow executions, file uploads, communication, and system events.`
      },
      {
        title: "Why Does This Exist?",
        content: `Without activity visibility, understanding what happened and why is impossible. Post-mortems become guesswork. Optimization happens based on intuition rather than data. Compliance requirements go unmet.

**Visibility Challenges:**
1. **Memory Limitations** — We forget what happened and when
2. **Multiple Contributors** — Hard to track who did what in collaborative work
3. **Process Opacity** — Bottlenecks and inefficiencies hide in unmeasured work
4. **Compliance Requirements** — Regulations demand audit trails
5. **Dispute Resolution** — "He said, she said" without records

**The Tracking Solution:**
We log everything (with appropriate retention and privacy controls) to enable:
• Complete reconstruction of what happened
• Pattern analysis for process improvement
• Compliance audit support
• Performance analysis and optimization
• Accountability without blame culture`
      },
      {
        title: "How It Works",
        content: `**Event Capture:**
The platform records:
• CRUD operations on all entities
• State transitions (deal stages, task statuses)
• User sessions and navigation
• API calls and integrations
• System events and errors

**Entity Timelines:**
For any tracked entity, view complete history:
• Who made each change
• What the old and new values were
• When changes occurred
• Related activity (comments, tasks, documents)

**Analytics Dashboards:**
Aggregate activity into insights:
• User productivity patterns
• Process efficiency metrics
• Bottleneck identification
• Comparative performance
• Trend analysis

**Privacy Controls:**
Activity tracking respects privacy settings:
• Personal activity visible only to user and admins
• Team activity aggregated appropriately
• Retention policies limit how long data is kept
• Export capabilities for user data rights`
      },
      {
        title: "Best Practices",
        content: `1. **Review Your Activity** — Periodic review reveals patterns you don't notice day-to-day
2. **Use for Process Improvement** — Activity data identifies optimization opportunities
3. **Support Rather Than Surveil** — Use for helping, not micromanaging
4. **Maintain Retention Policies** — Don't keep data longer than needed
5. **Export for Compliance** — When audits require, export capabilities deliver
6. **Respect Privacy** — Access activity data only when legitimately needed`
      }
    ]
  },

  leads: {
    title: "Lead Management — Opportunity Qualification Pipeline",
    subtitle: "Convert Interest into Qualified Opportunities",
    version: 1,
    sections: [
      {
        title: "What is Lead Management?",
        content: `Lead Management is the module for capturing, qualifying, and converting potential opportunities into active deals or customers. It provides structured processes for handling inbound interest and outbound prospecting, with AI-enhanced scoring and routing.

**Core Capabilities:**
• **Lead Capture** — Forms, imports, API integrations, and manual entry
• **Qualification Workflows** — Structured processes for evaluating fit
• **Lead Scoring** — AI-powered ranking based on conversion likelihood
• **Routing Rules** — Automatic assignment based on criteria
• **Conversion Tracking** — Pipeline from lead to qualified opportunity

**Lead Sources:**
Website forms, referrals, events, purchased lists, social media, partner introductions, and manual prospecting all feed into unified lead management.`
      },
      {
        title: "Why Does This Exist?",
        content: `Raw leads are not opportunities. Without qualification, sales teams waste time on poor fits while good prospects go cold waiting for attention.

**Lead Management Failures:**
1. **Response Delay** — New leads wait too long for first contact
2. **Qualification Inconsistency** — Different reps apply different standards
3. **Cherry Picking** — Best leads get attention; others are neglected
4. **Source Blindness** — Can't tell which sources produce quality
5. **Handoff Failure** — Leads fall through cracks between marketing and sales

**The Systematic Approach:**
We built structured lead management that:
• Ensures rapid initial response to new leads
• Applies consistent qualification criteria
• Scores and ranks leads objectively
• Routes based on skills and capacity
• Tracks conversion by source and segment

**Instincts Layer Integration:**
AI agents monitor lead activity and recommend:
• Optimal contact timing
• Personalized outreach messages
• Qualification probability updates
• Routing suggestions based on patterns`
      },
      {
        title: "How It Works",
        content: `**Lead Capture:**
Leads enter the system through:
• Web forms integrated with your website
• Bulk imports from events or lists
• API connections to marketing tools
• Partner referral portals
• Manual entry by team members

**Qualification Process:**
Leads move through qualification stages:
1. **Raw** — Just captured, no evaluation yet
2. **Contacted** — Initial outreach made
3. **Engaged** — Prospect responded and showed interest
4. **Qualified** — Meets criteria for opportunity creation
5. **Disqualified** — Doesn't meet criteria (with reason)

**Scoring System:**
AI evaluates leads based on:
• Demographic fit (company size, industry, location)
• Behavioral signals (website activity, email engagement)
• Historical patterns (how similar leads converted)
• Timing indicators (urgency signals, budget cycle)

**Routing Logic:**
Qualified leads route to appropriate owners:
• Territory-based assignment
• Product expertise matching
• Capacity balancing
• Round-robin fairness`
      },
      {
        title: "Best Practices",
        content: `1. **Respond Quickly** — Lead response time dramatically affects conversion
2. **Qualify Ruthlessly** — Time on poor fits is time not spent on good ones
3. **Track Sources** — Know which channels produce quality leads
4. **Use Scoring** — Let AI help prioritize; your intuition has biases
5. **Define Criteria** — Clear qualification standards ensure consistency
6. **Nurture the Middle** — Not-ready-yet leads need nurturing, not neglect`
      }
    ]
  },

  proposals: {
    title: "Proposal System — Structured Business Proposals",
    subtitle: "From Opportunity to Signed Agreement",
    version: 1,
    sections: [
      {
        title: "What is the Proposal System?",
        content: `The Proposal System is a comprehensive tool for creating, sending, tracking, and closing business proposals. It integrates pricing, document generation, electronic signature, and analytics into a streamlined workflow.

**Core Capabilities:**
• **Proposal Builder** — Drag-and-drop composition with templates
• **Pricing Engine** — Product configuration, discounting, and approval workflows
• **Document Generation** — Professional PDF output with branding
• **Electronic Signature** — Integrated e-signature for closing
• **Analytics Dashboard** — View rates, time-to-close, and engagement metrics

**Proposal Types:**
Standard quotes, complex RFP responses, partnership agreements, service contracts, and custom proposal formats.`
      },
      {
        title: "Why Does This Exist?",
        content: `Proposal creation is often a bottleneck between qualified opportunity and closed deal. Manual document creation is slow, error-prone, and inconsistent.

**Proposal Challenges:**
1. **Creation Time** — Building proposals manually takes hours
2. **Pricing Errors** — Manual calculations lead to mistakes
3. **Approval Delays** — Non-standard deals wait for pricing approval
4. **Version Confusion** — Multiple versions circulating creates chaos
5. **Signature Friction** — Requiring physical signatures slows closing

**The Streamlined Approach:**
We integrated proposal creation with CRM and Deal data:
• Templates pre-populated with opportunity information
• Pricing from product catalog with approval workflows
• Professional formatting without design skills
• Built-in e-signature eliminates printing and scanning
• Analytics show what's working and what's not

**Integration Points:**
Proposals connect to:
• CRM for contact and company data
• Deal Rooms for complex multi-party deals
• Product catalog for pricing
• Workflows for approval processes`
      },
      {
        title: "How It Works",
        content: `**Proposal Creation:**
Start from templates or blank:
• Select proposal type and template
• Pull in opportunity data automatically
• Configure products and pricing
• Add custom content and terms
• Include relevant attachments

**Pricing Configuration:**
Configure offerings:
• Select from product catalog
• Apply discount rules (or request approval)
• Add line items and custom pricing
• Calculate taxes and totals
• Show payment terms

**Review & Approval:**
Before sending:
• Preview final document
• Route for internal approval if needed
• Set validity period
• Add personal message

**Delivery & Tracking:**
Send and monitor:
• Email delivery with tracking
• View notifications (opened, viewed, downloaded)
• See time spent on each section
• Track signing status

**Signature & Close:**
Finalize the deal:
• Recipients sign electronically
• All parties notified on completion
• Signed document stored in Deal record
• CRM updated automatically`
      },
      {
        title: "Best Practices",
        content: `1. **Use Templates** — Consistent templates save time and ensure quality
2. **Pre-Populate Data** — Don't re-enter what exists in CRM
3. **Track Engagement** — Viewing patterns indicate interest and objections
4. **Set Expiration** — Limited validity creates urgency
5. **Simplify Signing** — Every signature step you remove increases close rate
6. **Analyze Patterns** — Which templates, pricing, and terms correlate with wins?`
      }
    ]
  },

  content_generation: {
    title: "Content Generation — AI-Powered Business Content",
    subtitle: "Create Professional Content at Scale",
    version: 1,
    sections: [
      {
        title: "What is Content Generation?",
        content: `Content Generation is the platform's AI-powered content creation system. It generates professional business content—emails, posts, articles, scripts, and more—based on prompts, templates, and platform context.

**Core Capabilities:**
• **Multi-Format Output** — Emails, social posts, blog articles, video scripts
• **Context Awareness** — Content informed by CRM, Deal, and platform data
• **Template System** — Customizable starting points for common content types
• **Tone Matching** — Adjust voice and style to match brand and purpose
• **Iteration Support** — Refine outputs through conversation

**Content Types:**
• Outreach emails and follow-ups
• Social media posts and threads
• Blog articles and thought leadership
• Video scripts and presentations
• Internal communications and announcements`
      },
      {
        title: "Why Does This Exist?",
        content: `Content creation is a bottleneck for most professionals. Writing takes time, many people don't enjoy it, and quality varies widely.

**Content Challenges:**
1. **Time Consumption** — Good writing takes time most don't have
2. **Skill Variance** — Not everyone writes well
3. **Consistency Issues** — Tone and quality vary across the organization
4. **Personalization Difficulty** — Custom content for each prospect doesn't scale
5. **Writer's Block** — Staring at blank pages wastes time

**The AI Solution:**
AI content generation provides:
• First drafts in seconds instead of hours
• Consistent quality regardless of writer skill
• Personalization at scale using platform data
• Multiple options to choose from
• Iteration through natural conversation

**Instincts Layer Integration:**
Content generation agents can:
• Draft follow-up emails after meetings
• Create social posts when achievements are logged
• Generate personalized outreach for leads
• Prepare meeting agendas and summaries`
      },
      {
        title: "How It Works",
        content: `**Input Methods:**
Start content generation with:
• Free-form prompt describing what you need
• Template selection for common formats
• Context reference (generate email about this deal)
• Style specification (formal, casual, persuasive)

**Generation Process:**
The AI:
• Analyzes your request and context
• Pulls relevant data from platform
• Generates content matching specifications
• Offers alternatives if requested

**Refinement:**
Iterate on output:
• "Make it shorter"
• "More formal tone"
• "Add more about pricing"
• "Include a call to action"

**Output & Integration:**
Use generated content:
• Copy to clipboard for use anywhere
• Insert directly into email composition
• Save as template for future use
• Export to documents`
      },
      {
        title: "Best Practices",
        content: `1. **Provide Context** — More context yields better output
2. **Iterate** — First drafts are starting points, not final versions
3. **Edit the Output** — AI creates drafts; human review ensures quality
4. **Save Good Prompts** — Effective prompts can become templates
5. **Match the Purpose** — Different content types need different approaches
6. **Add Your Voice** — AI provides structure; you add personality`
      }
    ]
  },

  task_management: {
    title: "Task Management — Unified Work Execution",
    subtitle: "Every Action Item in One Place",
    version: 1,
    sections: [
      {
        title: "What is Task Management?",
        content: `Task Management is the centralized system for tracking all action items, to-dos, and work assignments across the platform. Unlike siloed task lists, this module aggregates tasks from all sources and provides AI-enhanced prioritization and scheduling.

**Core Capabilities:**
• **Unified Task View** — Tasks from all modules in one list
• **Smart Prioritization** — AI ranking based on impact and urgency
• **Context Linking** — Every task connected to relevant entities
• **Scheduling Integration** — Tasks mapped to calendar for realistic planning
• **Collaboration Support** — Assignment, delegation, and progress tracking

**Task Sources:**
CRM follow-ups, Deal Room action items, Workflow steps, meeting notes, manual creation, and Instincts Layer recommendations.`
      },
      {
        title: "Why Does This Exist?",
        content: `Tasks scatter across tools, notes, emails, and mental lists. Without unified tracking, important items fall through cracks while trivial ones consume attention.

**Task Management Failures:**
1. **Fragmentation** — Tasks in email, notes, project tools, and head
2. **Priority Confusion** — Everything feels urgent; nothing gets done
3. **Context Loss** — Tasks disconnected from why they matter
4. **Stale Lists** — Old tasks never reviewed or cleared
5. **Unrealistic Planning** — More tasks than time; chronic overcommitment

**The Integrated Approach:**
We aggregate all tasks into one system that:
• Shows everything in one prioritized view
• Connects each task to its business context
• Learns from your completion patterns
• Integrates with calendar for realistic scheduling
• Provides AI assistance for overwhelming backlogs`
      },
      {
        title: "How It Works",
        content: `**Task Aggregation:**
Tasks flow in from:
• Manual creation
• CRM interaction follow-ups
• Deal Room action items
• Workflow process steps
• Meeting notes extraction
• Instincts Layer suggestions

**Prioritization Engine:**
AI considers:
• Due date and time sensitivity
• Business impact (deal value, relationship importance)
• Dependencies (what's blocked waiting for this)
• Your historical patterns (what you actually do first)
• Energy requirements (complex vs. simple tasks)

**Scheduling Integration:**
Connect tasks to calendar:
• Block time for task completion
• See realistic capacity
• Balance meetings and execution time
• Identify overcommitment before it happens

**Progress Tracking:**
Monitor execution:
• Completion rates and trends
• Bottleneck identification
• Delegation effectiveness
• Time-to-completion analytics`
      },
      {
        title: "Best Practices",
        content: `1. **Single Source** — Put everything in the system; hidden tasks undermine prioritization
2. **Weekly Review** — Regular review keeps the list current and realistic
3. **Trust AI Priorities** — Your brain has biases; the system sees patterns you don't
4. **Link Context** — Connected tasks are easier to understand and complete
5. **Schedule Realistically** — Block time for tasks; don't just assume you'll find it
6. **Complete or Delete** — Stale tasks clog the system; make decisions`
      }
    ]
  },

  calendar_system: {
    title: "Calendar System — Strategic Time Management",
    subtitle: "Your Most Valuable Asset, Managed Intelligently",
    version: 1,
    sections: [
      {
        title: "What is the Calendar System?",
        content: `The Calendar System is an intelligent scheduling platform that goes beyond showing appointments. It helps you protect strategic time, prepare for meetings, and understand how you actually spend your most limited resource.

**Core Capabilities:**
• **Unified View** — All calendars (personal, work, shared) in one interface
• **Smart Scheduling** — AI-powered meeting time suggestions
• **Availability Management** — Sophisticated booking controls
• **Meeting Preparation** — Automatic briefings before important meetings
• **Time Analytics** — Understand where your time actually goes

**Integration Depth:**
Calendar connects to CRM for attendee context, Tasks for time blocking, and Instincts Layer for intelligent suggestions.`
      },
      {
        title: "Why Does This Exist?",
        content: `Traditional calendars are passive containers that show what's scheduled but don't help you schedule wisely. They let others fill your time without protecting your priorities.

**Calendar Failures:**
1. **Fragmentation** — Deep work destroyed by scattered meetings
2. **Context Switching** — Unrelated meetings back-to-back drain energy
3. **Preparation Gaps** — Walking into meetings unprepared
4. **Time Blindness** — No awareness of where time actually goes
5. **Passive Filling** — Calendar fills up; priorities get squeezed out

**The Strategic Approach:**
We built calendar management that:
• Protects focus time from meeting creep
• Clusters related meetings for efficiency
• Ensures preparation time exists
• Provides analytics on time allocation
• Learns from your patterns to improve suggestions`
      },
      {
        title: "How It Works",
        content: `**Smart Scheduling:**
When scheduling meetings:
• Consider all participants' availability
• Account for time zones
• Cluster with related meetings
• Include buffer time
• Avoid energy-depleting patterns

**Availability Controls:**
Define sophisticated booking rules:
• Meeting windows and blocked times
• Maximum meetings per day
• Required buffers between events
• Preferred times for different meeting types
• VIP override exceptions

**Meeting Preparation:**
Before important meetings:
• Attendee profiles from CRM
• Recent interaction history
• Outstanding action items
• Suggested talking points
• Relevant documents

**Time Analytics:**
Understand your calendar:
• Time by meeting type
• Time by relationship
• Focus time vs. meeting time
• Trend analysis over time
• Comparison to goals`
      },
      {
        title: "Best Practices",
        content: `1. **Protect Focus Time First** — Block deep work before allowing meetings
2. **Set Realistic Buffers** — 15-30 minutes between meetings, not 5
3. **Review Analytics Weekly** — Patterns emerge over time
4. **Use Preparation Briefs** — Walking in prepared makes meetings effective
5. **Batch Similar Meetings** — Reduce context switching costs
6. **Say No More** — A full calendar doesn't mean a productive one`
      }
    ]
  },

  meetings: {
    title: "Meetings — Collaborative Session Management",
    subtitle: "Make Every Meeting Worth Having",
    version: 1,
    sections: [
      {
        title: "What is the Meetings Module?",
        content: `The Meetings module manages the full lifecycle of business meetings—from scheduling through follow-up. It integrates preparation, execution support, and action tracking to ensure meetings create value rather than waste time.

**Core Capabilities:**
• **Scheduling Integration** — Connection to calendar with smart suggestions
• **Preparation System** — Automatic briefing documents and agendas
• **In-Meeting Support** — Note taking, action capture, and time tracking
• **Follow-Up Automation** — Action item distribution and tracking
• **Meeting Analytics** — Effectiveness measurement over time

**Meeting Types:**
Internal meetings, client calls, prospect presentations, partner discussions, and interview sessions.`
      },
      {
        title: "Why Does This Exist?",
        content: `Most meetings are poorly prepared, badly run, and have no follow-up. The result is wasted time and unclear outcomes.

**Meeting Failures:**
1. **No Preparation** — Participants arrive uninformed
2. **Missing Agendas** — Discussions wander without structure
3. **No Notes** — Decisions and actions lost after meeting ends
4. **Follow-Up Failure** — Action items never tracked or completed
5. **Measurement Absence** — No feedback on meeting effectiveness

**The Effective Meeting Approach:**
We wrapped meeting management in systems that:
• Ensure preparation happens automatically
• Provide structure during the meeting
• Capture notes and actions in real-time
• Distribute and track follow-ups
• Measure effectiveness to improve over time`
      },
      {
        title: "How It Works",
        content: `**Pre-Meeting:**
Before the meeting:
• Auto-generate briefing with attendee info from CRM
• Pull relevant history and documents
• Create agenda from past patterns or templates
• Send reminders with preparation materials

**During Meeting:**
Support while meeting:
• Collaborative note-taking
• Action item capture with assignment
• Time tracking against agenda
• Recording (if permitted)

**Post-Meeting:**
After the meeting:
• Distribute notes to participants
• Create tasks for action items
• Update CRM and Deal records
• Schedule follow-up if needed

**Analytics:**
Measure effectiveness:
• Action completion rates
• Participant feedback
• Outcome achievement
• Time efficiency`
      },
      {
        title: "Best Practices",
        content: `1. **Prepare Always** — Use auto-generated briefs; don't wing it
2. **Have Agendas** — Even informal meetings benefit from structure
3. **Capture Actions** — If it's not written, it didn't happen
4. **Follow Up Promptly** — Same-day distribution while memory is fresh
5. **Track Completion** — Actions without follow-up are meaningless
6. **Measure and Improve** — Use analytics to make meetings better over time`
      }
    ]
  },

  documents: {
    title: "Documents — Intelligent File Management",
    subtitle: "Your Business Knowledge, Organized and Accessible",
    version: 1,
    sections: [
      {
        title: "What is the Documents Module?",
        content: `The Documents module is intelligent file storage that goes beyond folders. It provides automatic organization, smart search, version control, and integration with all platform modules.

**Core Capabilities:**
• **Smart Organization** — AI-suggested filing and automatic tagging
• **Semantic Search** — Find documents by meaning, not just keywords
• **Version Control** — Complete history with comparison and rollback
• **Access Control** — Granular permissions at folder and file level
• **Cross-Module Linking** — Documents connected to relevant entities

**Supported Content:**
PDFs, Office documents, images, videos, code files, archives, and any other file type.`
      },
      {
        title: "Why Does This Exist?",
        content: `File systems haven't fundamentally improved since the desktop metaphor was invented. Finding the right document requires remembering where you put it, and that fails constantly.

**Document Challenges:**
1. **Organization Burden** — Manual filing takes time and discipline
2. **Search Limitations** — Keyword search misses conceptually related content
3. **Version Confusion** — Which version is current? Who changed what?
4. **Access Complexity** — Permission management is all-or-nothing
5. **Context Loss** — Files disconnected from the business context they belong to

**The Intelligent Approach:**
We built document management that:
• Suggests where to file things and tags automatically
• Searches by meaning, not just text matching
• Tracks every version with full audit trail
• Provides nuanced permission control
• Links documents to CRM, Deals, and other entities`
      },
      {
        title: "How It Works",
        content: `**Smart Filing:**
When you upload a document:
• AI analyzes content and suggests folder location
• Automatic tagging based on content
• Entity linking (relevant contacts, deals, projects)
• Duplicate detection to prevent redundancy

**Semantic Search:**
Find documents by:
• Natural language queries
• Conceptual similarity
• Related entities
• Metadata filters
• Date and author

**Version Control:**
Track document evolution:
• Every save creates a version
• Compare any two versions
• Rollback to previous versions
• See who changed what and when

**Access Control:**
Manage permissions:
• Folder-level inheritance
• File-level overrides
• Role-based access
• External sharing with controls`
      },
      {
        title: "Best Practices",
        content: `1. **Trust AI Suggestions** — Filing recommendations are usually right
2. **Add Context** — Link documents to relevant entities for findability
3. **Use Semantic Search** — Describe what you're looking for; don't guess keywords
4. **Version Intentionally** — Major changes deserve version notes
5. **Control Access Appropriately** — Open by default, restricted when needed
6. **Clean Up Periodically** — Old, irrelevant documents add noise`
      }
    ]
  },

  admin_panel: {
    title: "Admin Panel — Platform Administration",
    subtitle: "Complete Control Over Your Business Platform",
    version: 1,
    sections: [
      {
        title: "What is the Admin Panel?",
        content: `The Admin Panel is the centralized administration interface for platform-wide settings, user management, security configuration, and system monitoring. It's where administrators configure, control, and maintain the platform.

**Core Capabilities:**
• **User Management** — Create, configure, and manage user accounts
• **Role & Permission Administration** — Define access levels and capabilities
• **System Configuration** — Platform-wide settings and defaults
• **Security Management** — Authentication, policies, and compliance settings
• **Monitoring & Logs** — System health, activity logs, and audit trails
• **Integration Management** — External service connections and API configuration

**Access Control:**
Admin Panel access is restricted to users with administrative roles. Different admin levels have different capabilities.`
      },
      {
        title: "Why Does This Exist?",
        content: `Platforms without proper administration become chaos. Users can't be managed centrally, settings are scattered, security is ad-hoc, and nobody knows what's actually happening.

**Administration Challenges:**
1. **Scattered Controls** — Settings spread across the platform
2. **User Management Complexity** — Onboarding and offboarding is manual
3. **Permission Confusion** — Who has access to what is unclear
4. **Security Gaps** — No central policy enforcement
5. **Visibility Gaps** — Administrators can't see what's happening

**The Centralized Approach:**
We consolidated administration into one interface that:
• Provides complete user lifecycle management
• Makes permissions visible and controllable
• Centralizes security policy configuration
• Offers comprehensive monitoring and logging
• Enables configuration without technical expertise`
      },
      {
        title: "How It Works",
        content: `**User Management:**
Complete user lifecycle:
• Create accounts with initial configuration
• Assign roles and permissions
• Manage access across modules
• Suspend or terminate accounts
• Impersonation for support

**Role Administration:**
Define and manage roles:
• Create custom roles
• Configure role permissions
• Assign users to roles
• Review role membership

**Security Configuration:**
Enforce security policies:
• Authentication requirements (2FA, SSO)
• Password policies
• Session management
• IP restrictions
• Audit logging levels

**System Monitoring:**
Observe platform health:
• User activity dashboards
• System performance metrics
• Error and exception tracking
• Audit log review
• Usage analytics

**Integration Management:**
Configure external connections:
• API key management
• OAuth application configuration
• Webhook setup
• External service credentials`
      },
      {
        title: "Best Practices",
        content: `1. **Limit Admin Access** — Fewer admins means smaller attack surface
2. **Use Roles** — Manage permissions through roles, not individual assignments
3. **Review Regularly** — Periodic access reviews catch accumulation and orphans
4. **Enable Logging** — Comprehensive logs enable investigation when needed
5. **Document Changes** — Configuration changes should be recorded and reviewed
6. **Test in Staging** — Major changes should be tested before production deployment`
      }
    ]
  },

  client_management: {
    title: "Client Management — Customer Relationship Excellence",
    subtitle: "Nurturing Business Relationships That Drive Growth",
    version: 1,
    sections: [
      {
        title: "What is Client Management?",
        content: `Client Management extends CRM capabilities specifically for ongoing customer relationships. While lead management focuses on acquisition, client management focuses on retention, expansion, and satisfaction of existing customers.

**Core Capabilities:**
• **Client Profiles** — Comprehensive views of each customer relationship
• **Health Scoring** — AI-assessed relationship strength and risk indicators
• **Engagement Tracking** — All touchpoints and interactions logged
• **Expansion Opportunities** — Cross-sell and upsell identification
• **Satisfaction Monitoring** — Feedback collection and sentiment tracking
• **Renewal Management** — Contract and subscription lifecycle

**Client vs. Prospect:**
Clients are converted customers with ongoing relationships. Client management provides tools specific to nurturing and growing these relationships.`
      },
      {
        title: "Why Does This Exist?",
        content: `Acquiring a new customer costs 5-25x more than retaining an existing one. Yet most CRMs focus on acquisition, treating customers as the end of the pipeline rather than the beginning of a relationship.

**Retention Challenges:**
1. **Post-Sale Neglect** — Attention drops after the deal closes
2. **Silent Churn** — Customers leave without warning signs being noticed
3. **Expansion Blindness** — Growth opportunities missed
4. **Relationship Decay** — Connections weaken without intentional nurturing
5. **Satisfaction Guessing** — No systematic feedback collection

**The Client-Centric Approach:**
We built client management to:
• Keep focus on relationships after acquisition
• Identify health risks before they become churn
• Surface expansion opportunities systematically
• Track engagement to prevent relationship decay
• Monitor satisfaction continuously

**Instincts Layer Integration:**
AI agents monitor client relationships and:
• Flag declining health scores
• Suggest outreach timing
• Identify expansion triggers
• Predict renewal risks`
      },
      {
        title: "How It Works",
        content: `**Client Profiles:**
Comprehensive relationship views:
• Contact and company information
• Complete interaction history
• Contract and purchase details
• Support ticket history
• Custom fields for your business context

**Health Scoring:**
AI evaluates relationship strength:
• Engagement frequency and quality
• Support satisfaction
• Product usage metrics
• Payment history
• Sentiment from communications

**Engagement Management:**
Track and plan touchpoints:
• Log all interactions automatically
• Schedule proactive outreach
• Set engagement cadence goals
• Alert on gaps in contact

**Expansion & Renewal:**
Growth and retention focus:
• Identify cross-sell opportunities
• Track contract renewal dates
• Monitor usage for upsell triggers
• Manage renewal conversations`
      },
      {
        title: "Best Practices",
        content: `1. **Monitor Health Scores** — Don't wait for churn; watch the indicators
2. **Maintain Cadence** — Regular touchpoints prevent relationship decay
3. **Act on Risks** — When health declines, intervene quickly
4. **Seek Expansion** — Happy clients are the best growth opportunities
5. **Collect Feedback** — Systematic feedback catches issues early
6. **Celebrate Success** — Acknowledge client wins and milestones`
      }
    ]
  },

  // ============================================
  // MISSING MODULES - COMPREHENSIVE COVERAGE
  // ============================================

  archive_import: {
    title: "Archive Import — AI Conversation Ingestion",
    subtitle: "Transform Your ChatGPT History into Actionable Business Infrastructure",
    version: 1,
    sections: [
      {
        title: "What is Archive Import?",
        content: `Archive Import is a revolutionary capability that transforms your existing AI conversations (ChatGPT, OpenAI archives) into structured business assets. Upload your conversation history and the platform extracts businesses, contacts, ideas, and projects—then converts them into operational infrastructure.

**Core Capabilities:**
• **Archive Upload** — Drag-and-drop ChatGPT/OpenAI export files (up to 2GB)
• **Intelligent Extraction** — AI identifies entities: businesses, contacts, companies, projects, ideas
• **Entity Classification** — Distinguishes between "mine" (your businesses) and "external" entities
• **Business Spawning** — Convert extracted business concepts into full platform entities
• **CRM Population** — External entities become contacts, companies, or leads

**Supported Formats:**
• OpenAI/ChatGPT exports (conversations.json)
• Structured conversation archives
• Multi-gigabyte conversation histories`
      },
      {
        title: "Why Does This Exist?",
        content: `Most professionals have accumulated months or years of valuable AI conversations—business plans discussed, contacts mentioned, ideas explored, strategies debated. This knowledge sits locked in conversation archives, inaccessible and unorganized.

**The Knowledge Problem:**
1. **Trapped Intelligence** — Great ideas stuck in chat logs
2. **Lost Connections** — Contacts and relationships mentioned but not tracked
3. **Scattered Strategy** — Business planning spread across hundreds of conversations
4. **No Continuity** — Each AI session starts fresh without context
5. **Manual Extraction** — Copy-pasting from chats is tedious and incomplete

**The Archive Import Solution:**
We built a pipeline that:
• Ingests your complete AI history in one upload
• Uses multiple extraction stages (parsing, entity detection, classification)
• Presents discoveries in a review queue for human approval
• Spawns approved businesses with full infrastructure
• Populates CRM with external entities

**Instincts Layer Integration:**
AI agents monitor imported entities and:
• Suggest network connections between businesses
• Recommend next steps for spawned companies
• Identify synergies across your portfolio
• Track project momentum from conversation origins`
      },
      {
        title: "How It Works",
        content: `**The Import Pipeline:**

**Stage 1: Upload & Extraction**
• Upload archive file (drag-and-drop or file picker)
• System parses JSON structure
• Initial content extraction

**Stage 2: Entity Detection**
• AI scans for business mentions
• Contact and company identification
• Project and idea extraction
• Relationship mapping

**Stage 3: Classification**
• "Mine" — Businesses you're building/own
• "External" — Companies, contacts, vendors, partners
• Category assignment (client, prospect, vendor, associate)

**Stage 4: Review Queue**
• Visual review interface
• Approve/reject/edit each entity
• Categorization confirmation
• Spawn or CRM decisions

**Stage 5: Infrastructure Creation**
• Approved "mine" businesses → Full spawning
• External entities → CRM population
• Relationship linking
• Workspace creation

**Spawning Flow:**
When you approve a business as "mine":
1. spawned_business record created
2. Workspace automatically generated
3. ERP structure initialized
4. Website scaffolding prepared
5. CRM linked to client workspace
6. All platform tools available`
      },
      {
        title: "Best Practices",
        content: `1. **Export Everything** — Include your full conversation history for comprehensive extraction
2. **Review Carefully** — AI extraction isn't perfect; verify entity classifications
3. **Spawn Strategically** — Don't spawn every business idea; focus on actionable ones
4. **Categorize External Entities** — Proper classification improves CRM utility
5. **Link Relationships** — Connect related entities during review
6. **Use as Starting Point** — Spawned businesses need further development`
      }
    ]
  },

  commercial_studio: {
    title: "Commercial Studio — AI Video Generation",
    subtitle: "Create Professional Business Commercials from Scripts",
    version: 1,
    sections: [
      {
        title: "What is Commercial Studio?",
        content: `Commercial Studio is an AI-powered video generation system that transforms text scripts into professional business commercials. Using advanced AI pipelines (Replicate, Fal.ai, ElevenLabs), you can create marketing videos without cameras, actors, or production crews.

**Core Capabilities:**
• **Script Input** — Write or generate commercial scripts
• **Scene Decomposition** — AI breaks script into timed visual scenes
• **Video Generation** — Each scene becomes an AI-generated video clip
• **Voice Synthesis** — Professional voiceover from ElevenLabs
• **Watermark Preview** — Review before purchasing clean version
• **Stripe Integration** — Purchase clean, downloadable versions

**Use Cases:**
• Product launch announcements
• Company introduction videos
• Service explainer content
• Social media marketing
• Pitch deck video supplements`
      },
      {
        title: "Why Does This Exist?",
        content: `Professional video production is expensive, time-consuming, and requires specialized skills. Most small businesses can't afford quality commercials, limiting their ability to compete with larger companies in visual marketing.

**Traditional Video Challenges:**
1. **High Costs** — Professional production runs thousands to tens of thousands
2. **Time Investment** — Weeks or months from concept to final product
3. **Specialized Skills** — Requires videographers, editors, voice talent
4. **Iteration Difficulty** — Changes mean reshoots and re-edits
5. **Scaling Issues** — Can't produce variations cost-effectively

**The Commercial Studio Solution:**
We built a complete video generation pipeline that:
• Generates from text in minutes, not months
• Costs a fraction of traditional production
• Enables unlimited iterations and variations
• Requires no technical video skills
• Integrates with business spawning workflow

**Instincts Layer Integration:**
AI agents can:
• Suggest video content based on business type
• Generate optimized scripts from business descriptions
• Recommend distribution strategies
• Track video performance metrics`
      },
      {
        title: "How It Works",
        content: `**The Video Generation Pipeline:**

**Step 1: Script Creation**
• Write your commercial script
• Or use AI to generate from business description
• Define tone, style, and messaging

**Step 2: Scene Analysis**
• AI decomposes script into scenes
• Timing assigned to each segment
• Visual prompts generated for each scene

**Step 3: Video Generation**
• Fal.ai generates video clips for each scene
• Multiple AI models for different styles
• High-quality 1080p output

**Step 4: Voice Synthesis**
• ElevenLabs creates professional voiceover
• Multiple voice options
• Synchronized to video timing

**Step 5: Assembly**
• Clips combined with voiceover
• Transitions and effects applied
• Watermarked preview generated

**Step 6: Preview & Purchase**
• Review watermarked version
• Stripe payment for clean version
• Download HD final product

**Output Quality:**
• 1080p resolution
• Professional voice quality
• Smooth scene transitions
• Brand-appropriate styling`
      },
      {
        title: "Best Practices",
        content: `1. **Write Clear Scripts** — Specific descriptions produce better visuals
2. **Keep It Short** — 30-60 seconds is optimal for most commercials
3. **Preview Before Purchase** — Use watermarked versions for stakeholder review
4. **Iterate on Scripts** — Regenerate with revised scripts until satisfied
5. **Match Tone to Audience** — Adjust voice and style for target demographic
6. **Integrate with Marketing** — Use across social media, website, presentations`
      }
    ]
  },

  bill_intelligence: {
    title: "Bill Intelligence — Expense Optimization Engine",
    subtitle: "Analyze Bills to Find Savings and Better Alternatives",
    version: 1,
    sections: [
      {
        title: "What is Bill Intelligence?",
        content: `Bill Intelligence is an AI-powered expense analysis system that examines your business bills (utilities, telecom, SaaS, materials, services) to identify savings opportunities, optimization recommendations, and alternative providers.

**Core Capabilities:**
• **Bill Upload** — Submit bills from any provider category
• **Multi-LLM Analysis** — Multiple AI models analyze for savings
• **Optimization Recommendations** — Specific actions to reduce costs
• **Alternative Suggestions** — Better providers for your needs
• **Continuous Monitoring** — Link accounts for ongoing optimization
• **Centralized Management** — All bills in one dashboard

**Bill Categories:**
• Utilities (electricity, gas, water)
• Telecommunications (phone, internet, mobile)
• SaaS subscriptions (software, cloud services)
• Construction materials and supplies
• Ingredients and raw materials
• Professional services`
      },
      {
        title: "Why Does This Exist?",
        content: `Most businesses overpay for services simply because they don't have time to analyze bills, compare alternatives, or renegotiate contracts. This hidden expense drain compounds over time.

**Bill Management Challenges:**
1. **Time Constraints** — Nobody has time to analyze every bill
2. **Market Ignorance** — Don't know what alternatives exist
3. **Contract Complexity** — Hidden fees and terms obscured
4. **Provider Lock-in** — Switching seems too difficult
5. **Scale Issues** — Savings opportunities compound with volume

**The Bill Intelligence Solution:**
We built an analysis engine that:
• Processes any bill format automatically
• Uses multiple AI models to find optimization paths
• Maintains knowledge of market alternatives
• Tracks savings over time
• Learns from all platform users to improve recommendations

**Instincts Layer Integration:**
AI agents continuously:
• Monitor for billing anomalies
• Alert on unexpected increases
• Suggest renegotiation timing
• Identify category-wide optimization opportunities
• Learn from successful switches across the platform`
      },
      {
        title: "How It Works",
        content: `**Bill Analysis Pipeline:**

**Step 1: Bill Ingestion**
• Upload PDF, image, or document
• OCR extraction of bill details
• Structured data parsing

**Step 2: Multi-Model Analysis**
• GPT-4 analyzes for savings opportunities
• Claude examines contract terms
• Gemini identifies alternatives
• Consensus recommendations generated

**Step 3: Recommendation Generation**
• Immediate actions (plan changes, feature drops)
• Negotiation strategies (rate discussions, competitor quotes)
• Alternative providers (better pricing, features)
• Contract timing (renewal windows, cancellation terms)

**Step 4: Implementation Support**
• Step-by-step guides for each recommendation
• Template negotiation scripts
• Provider comparison data
• Switch facilitation where available

**Step 5: Ongoing Monitoring**
• Link accounts for automatic bill capture
• Trend analysis over time
• Alert on anomalies
• Periodic re-optimization

**Knowledge Aggregation:**
The system learns from all users:
• Which providers offer best rates by region
• What negotiation tactics work
• When to switch vs. negotiate
• Industry-specific optimization patterns`
      },
      {
        title: "Best Practices",
        content: `1. **Upload All Bills** — More data enables better analysis
2. **Include Full Documents** — AI needs terms and conditions, not just totals
3. **Link Accounts** — Continuous monitoring catches issues early
4. **Act on Recommendations** — Identified savings only matter when implemented
5. **Review Periodically** — Market conditions change; re-analyze quarterly
6. **Share Anonymized Data** — Platform learns from collective experience`
      }
    ]
  },

  credits_hub: {
    title: "Credits Hub — Contribution & Monetization Engine",
    subtitle: "Track Contributions, Earn Credits, Convert to Revenue",
    version: 1,
    sections: [
      {
        title: "What is the Credits Hub?",
        content: `The Credits Hub is the centralized interface for the platform's contribution and monetization system. Every valuable action—human or agent—earns credits that can convert to real revenue through defined allocation rules and payout mechanisms.

**Core Components:**
• **Credit System Dashboard** — Real-time credit balances and earning rates
• **Contribution Event Log** — Every action logged with attribution
• **Analytics & Trends** — Credit earning patterns over time
• **Leaderboard** — Rankings among platform participants
• **Payout Calculator** — Convert credits to USD estimates
• **Agent Attribution** — Track AI agent contributions

**Credit Tiers:**
• **Compute Credits** — Resource usage (API calls, processing)
• **Action Credits** — Completed tasks and operations
• **Outcome Credits** — Successful business results (requires verification)`
      },
      {
        title: "Why Does This Exist?",
        content: `In traditional platforms, users contribute value but don't share in the platform's success. We believe everyone who helps build the network should benefit from its growth.

**Value Attribution Challenges:**
1. **Invisible Contributions** — Work happens but isn't measured
2. **Misaligned Incentives** — Platforms profit; users don't
3. **Agent Opacity** — AI work isn't attributed
4. **Verification Gaps** — Claimed outcomes aren't validated
5. **Complex Multi-Party** — Multiple contributors to single outcomes

**The Credits Hub Solution:**
We built a comprehensive attribution system:
• Every action logged to contribution ledger
• Three-tier credit model captures different value types
• Agent and human contributions tracked equally
• Outcome credits require external verification (CRM confirmation)
• Clear conversion to monetary value

**Instincts Layer Integration:**
AI agents:
• Earn credits for successful automation
• Attribution rules define agent payouts
• Learning improves agent effectiveness
• Human oversight credits for approvals
• Network-wide contribution visibility`
      },
      {
        title: "How It Works",
        content: `**The Credit Flow:**

**Contribution Logging:**
Every valuable action creates a log entry:
• Action type and timestamp
• Actor (user or agent)
• Context (deal, client, project)
• Anchor status (verified or pending)

**Credit Allocation:**
Rules define credit values:
• Task completion = X action credits
• API call = Y compute credits
• Closed deal = Z outcome credits (pending verification)
• Agent automation = credits to agent and oversight user

**Verification Pipeline:**
Outcome credits require confirmation:
• CRM integration validates deals
• External systems confirm results
• Multi-party attestation for complex outcomes
• Dispute resolution for contested attribution

**Payout Calculation:**
Credits convert to currency:
• Current exchange rate displayed
• Minimum payout thresholds
• Payment method selection
• Tax documentation

**Credit Allocation Manager:**
Define rules for your organization:
• Agent vs. human splits
• Team allocation percentages
• Outcome sharing formulas
• Escalation for edge cases

**Agent Run History:**
Track every agent execution:
• Which agents ran
• What actions taken
• Outcomes achieved
• Credits earned`
      },
      {
        title: "Best Practices",
        content: `1. **Define Clear Rules** — Establish allocation before work begins
2. **Verify Outcomes** — Anchor credits to prevent gaming
3. **Balance Incentives** — Reward both quantity and quality
4. **Monitor Agent Performance** — Credits reveal which agents deliver value
5. **Review Periodically** — Adjust rules based on observed patterns
6. **Communicate Transparently** — All participants should understand the system`
      }
    ]
  },

  intelligent_scheduling: {
    title: "Intelligent Scheduling — AI-Optimized Time Management",
    subtitle: "Learn Your Preferences and Create Perfect Daily Schedules",
    version: 1,
    sections: [
      {
        title: "What is Intelligent Scheduling?",
        content: `Intelligent Scheduling is an AI-powered system that learns your preferences, analyzes your tasks, and creates optimized daily schedules. It combines fixed constraints (sleep, meals, workouts) with intelligent task placement based on industry best practices and your behavioral patterns.

**Core Capabilities:**
• **Preference Capture** — Define fixed blocks and constraints
• **Task Analysis** — Duration estimates and optimal timing
• **Industry Intelligence** — Best practices for task types
• **Location Awareness** — Travel time between commitments
• **Learning Engine** — Improves with every interaction
• **Task Guidance** — In-app tools and scripts for execution

**Schedule Types:**
• Daily optimized schedules
• Weekly planning views
• Project milestone scheduling
• Team coordination calendars`
      },
      {
        title: "Why Does This Exist?",
        content: `Most people know what to do but struggle with when to do it. Traditional calendars are passive containers; they don't help you decide when to schedule sales calls (peak hours), when to post social media (engagement windows), or how to sequence tasks for energy optimization.

**Scheduling Challenges:**
1. **Timing Ignorance** — Don't know optimal times for different activities
2. **Manual Planning** — Rebuilding schedules daily is exhausting
3. **Context Switching** — Poor sequencing kills productivity
4. **Travel Blindness** — Don't account for movement between locations
5. **No Learning** — Same mistakes repeated

**The Intelligent Scheduling Solution:**
We built a three-component system:
• **Preference Setup** — Captures constraints and preferences
• **Schedule Generator** — Creates optimized daily plans
• **Learning Engine** — Continuously improves from behavior

**Instincts Layer Integration:**
AI agents:
• Suggest task timing based on historical success
• Adjust schedules based on energy patterns
• Recommend task batching for efficiency
• Learn from completion patterns
• Predict and prevent scheduling conflicts`
      },
      {
        title: "How It Works",
        content: `**The Three-Component System:**

**Component 1: User Preferences Setup**
Fixed time blocks captured:
• Sleep schedule (wake/sleep times)
• Meal times and duration
• Workout or exercise blocks
• Personal commitments
• Do-not-disturb periods

**Component 2: Schedule Generator**
For each day, the system:
• Loads tasks with duration estimates
• Applies industry best practices:
  - Sales calls during 10am-12pm and 2pm-4pm
  - Deep work in morning energy peaks
  - Admin tasks in afternoon energy lulls
  - Social media during engagement windows
• Accounts for location and travel time
• Respects fixed blocks and preferences
• Generates optimized sequence

**Component 3: Learning Engine**
Continuous improvement through:
• Task completion tracking
• Time accuracy learning
• Pattern recognition
• Preference refinement
• Prediction improvement

**Two Rails Architecture:**
• **Physics Rail** — Hard constraints (meetings, deadlines, travel)
• **ML Rail** — Soft optimization (preferences, energy, patterns)

**Task Guidance:**
For each scheduled task:
• Links to relevant platform tools
• Call scripts for outreach tasks
• Templates for document creation
• Checklists for complex tasks`
      },
      {
        title: "Best Practices",
        content: `1. **Be Honest About Preferences** — Accurate constraints produce better schedules
2. **Estimate Task Durations** — Even rough estimates help optimization
3. **Complete Tasks as Scheduled** — Learning requires feedback
4. **Review and Adjust** — Refine preferences based on results
5. **Trust the System** — AI recommendations often outperform intuition
6. **Start Simple** — Add complexity as the system learns you`
      }
    ]
  },

  business_spawning: {
    title: "Business Spawning — Rapid Company Creation",
    subtitle: "Launch Complete Business Infrastructure in Hours",
    version: 1,
    sections: [
      {
        title: "What is Business Spawning?",
        content: `Business Spawning is the platform's revolutionary capability to create fully operational business entities from ideas. When you spawn a business, the platform generates complete infrastructure: workspace, ERP structure, website scaffolding, CRM integration, and all platform tools—activated in hours, not months.

**Core Capabilities:**
• **One-Click Creation** — Spawn from ideas, imports, or manual input
• **Workspace Generation** — Dedicated workspace with all tools
• **ERP Initialization** — AI-generated folder and data structures
• **Website Scaffolding** — Basic web presence ready for customization
• **CRM Integration** — Client workspace linked to your CRM
• **Tool Activation** — All platform modules available

**Spawning Sources:**
• Archive Import discoveries
• Manual business creation
• AI conversation suggestions
• Network matching recommendations`
      },
      {
        title: "Why Does This Exist?",
        content: `Starting a business traditionally requires months of infrastructure setup: registrations, websites, tools, processes. This friction kills good ideas before they can prove themselves.

**Business Launch Challenges:**
1. **Infrastructure Overhead** — Tools, systems, websites all need setup
2. **Time Drain** — Months spent on setup vs. actual business
3. **Cost Barriers** — Enterprise tools priced for enterprises
4. **Integration Hell** — Connecting disparate systems
5. **Iteration Difficulty** — Hard to pivot when infrastructure is rigid

**The Business Spawning Solution:**
We built infrastructure-as-a-service for businesses:
• Complete operational stack in hours
• All tools pre-integrated
• Managed as portfolio entities
• Detachable for sale or transfer
• Network effects from day one

**Instincts Layer Integration:**
AI agents support spawned businesses:
• Monitor health and suggest improvements
• Connect with network opportunities
• Automate routine operations
• Track performance metrics
• Suggest pivot strategies when needed`
      },
      {
        title: "How It Works",
        content: `**The Spawning Pipeline:**

**Step 1: Business Definition**
• Name and description
• Industry and vertical
• Strategy focus
• Initial goals

**Step 2: Infrastructure Generation**
Automatic creation of:
• spawned_business record
• Dedicated workspace
• ERP folder structure
• Initial data schemas
• Tool configurations

**Step 3: Website Scaffolding**
• Basic site structure
• Placeholder content
• Domain options (subdomain or custom)
• CMS-ready templates

**Step 4: Integration Setup**
• Linked to parent CRM as client
• Financial tracking initialized
• Reporting dashboards configured
• Team access provisioned

**Step 5: Tool Activation**
All platform modules available:
• CRM (contacts, deals, pipeline)
• Tasks and calendar
• Documents and storage
• Workflows and automation
• Analytics and reporting

**Portfolio Management:**
Spawned businesses appear in:
• ClientSelector (rocket icon indicator)
• Personal aggregation dashboard
• Cross-entity task views
• Consolidated financial reports

**Detachment & Sale:**
Businesses can be:
• Detached as standalone React packages
• Transferred to new owners
• Sold through marketplace
• Exported with all data`
      },
      {
        title: "Best Practices",
        content: `1. **Spawn Fast, Iterate Faster** — Don't over-plan; spawn and learn
2. **Use ERP Generation** — Let AI create initial structures
3. **Leverage Templates** — Start with industry-specific setups
4. **Connect to Network** — Enable matching for growth opportunities
5. **Monitor Health Metrics** — Use dashboard to track spawned business performance
6. **Plan for Detachment** — Build with eventual independence in mind`
      }
    ]
  },

  command_center: {
    title: "Command Center — Meta-Development Hub",
    subtitle: "Develop the Platform from Within the Platform",
    version: 1,
    sections: [
      {
        title: "What is the Command Center?",
        content: `The Command Center is a meta-development hub that enables users to develop, manage, and evolve the Biz Dev platform from within the platform itself. When you make feature decisions here, AI agents can execute those decisions directly—implementing changes without context-switching to external tools.

**Core Components:**
• **Forge** — Feature and roadmap tracking
• **Conductor** — Command queue to Lovable/GitHub
• **Oracle** — Multi-AI unified conversation interface
• **Creation Studio** — Mind maps, decks, video generation

**Philosophy:**
The platform develops itself. Users don't just use features—they shape the platform's evolution through structured feedback and direct implementation commands.`
      },
      {
        title: "Why Does This Exist?",
        content: `Most platforms are black boxes—users submit feedback that disappears into backlogs, and development happens in isolation from user context. We believe the people using the platform should directly influence its evolution.

**Development Challenges:**
1. **Context Loss** — Developers don't see user workflows
2. **Feedback Black Holes** — Suggestions disappear without response
3. **Tool Fragmentation** — Development in separate systems
4. **Slow Iteration** — Long cycles from idea to implementation
5. **Disconnected Users** — No visibility into platform evolution

**The Command Center Solution:**
We built a meta-layer that:
• Surfaces development work within the platform
• Connects feature requests to implementation
• Enables direct agent execution of changes
• Provides multi-AI conversation for complex decisions
• Creates content (mind maps, presentations) for planning

**Instincts Layer Integration:**
AI agents in Command Center:
• Translate feature requests into specifications
• Queue implementation commands
• Track development progress
• Suggest feature priorities based on usage
• Execute approved changes automatically`
      },
      {
        title: "How It Works",
        content: `**The Four Components:**

**Forge — Feature Tracking**
• Feature request submission
• Roadmap visualization
• Priority scoring
• Implementation status
• User voting and feedback

**Conductor — Command Queue**
• Implementation commands staged
• Approval workflows
• Lovable/GitHub integration
• Execution status tracking
• Rollback capabilities

**Oracle — Multi-AI Chat**
• Unified interface for multiple AI models
• Context-aware conversations
• Tool-calling capabilities
• Development discussion
• Decision documentation

**Creation Studio**
• **Threads** — Mind map creation for planning
• **Canvas** — Presentation deck generation
• **Studio** — Video content creation
• All outputs feed other components

**Execution Flow:**
1. User identifies need (Forge)
2. Discusses with AI (Oracle)
3. Creates planning artifacts (Creation Studio)
4. Queues implementation (Conductor)
5. AI agents execute approved commands
6. Changes deploy to platform

**Self-Evolving Architecture:**
The Command Center enables:
• Users to shape their own experience
• Rapid iteration on features
• Transparent development process
• Community-driven priorities
• AI-accelerated implementation`
      },
      {
        title: "Best Practices",
        content: `1. **Document Everything** — Use Oracle to capture decision context
2. **Vote Meaningfully** — Priority signals guide development
3. **Create Artifacts** — Mind maps and decks clarify complex features
4. **Review Before Execution** — Conductor commands need oversight
5. **Provide Feedback** — Post-implementation feedback improves future work
6. **Think Platform-Wide** — Consider how features affect all users`
      }
    ]
  },

  unity_meridian: {
    title: "Unity Meridian — Core Architecture Philosophy",
    subtitle: "Every User is a Personal Corporation",
    version: 1,
    sections: [
      {
        title: "What is Unity Meridian?",
        content: `Unity Meridian is the foundational architectural philosophy underlying the entire Biz Dev platform. It treats every user as a "personal corporation" with measurable assets, liabilities, workflows, and growth trajectories. This isn't a metaphor—it's a literal data model that enables unprecedented personalization and automation.

**The Personal Corporation Model:**
Every user has:
• **Assets** — Time, skills, relationships, IP, capital, health, attention
• **Liabilities** — Obligations, debts, commitments
• **Workflows** — Repeatable processes that transform assets into value
• **Embeddings** — Behavioral fingerprints for personalization

**Core Principle:**
Users should feel like they have a "C-suite in their pocket"—advisors, analysts, and executors working constantly on their behalf to optimize their personal corporation.`
      },
      {
        title: "Why Does This Exist?",
        content: `Traditional software treats users as anonymous entities performing transactions. But every person is actually a complex economic agent making thousands of decisions that compound over time. Understanding users as corporations unlocks transformative capabilities.

**The Insight:**
1. **Everyone is an Economic Entity** — We all have assets, make investments, generate returns
2. **Actions Compound** — Small optimizations accumulate into major outcomes
3. **Relationships are Assets** — Networks have measurable, improvable value
4. **Time is Capital** — How you spend attention determines your trajectory
5. **Data Enables Optimization** — You can't improve what you don't measure

**The Unity Meridian Solution:**
We model every user as a corporation with:
• Balance sheets (assets and liabilities)
• P&L statements (value created vs. spent)
• Strategic planning (goal setting and pursuit)
• Performance tracking (metric improvement)
• Advisory layer (AI agents as C-suite)

**Platform-Wide Impact:**
This philosophy drives:
• How we model data (graph-based relationships)
• How AI agents operate (optimize for user "returns")
• How features integrate (everything affects the personal corporation)
• How value is measured (contribution credits, outcome tracking)`
      },
      {
        title: "How It Works",
        content: `**The Data Model:**

**User as Corporation:**
• Primary entity with unique identifier
• Owns and operates multiple "business units" (projects, spawned businesses)
• Maintains relationships (edges) to other entities
• Accumulates behavioral embeddings

**Asset Categories:**
• **Time** — Calendar data, availability patterns
• **Skills** — Demonstrated capabilities, certifications
• **Relationships** — Contact network, relationship strength scores
• **IP** — Created content, documented knowledge
• **Capital** — Financial resources, credit limits
• **Health** — Energy patterns, sustainability metrics
• **Attention** — Focus capacity, distraction patterns

**The Graph Structure:**
Everything is nodes and edges:
• Nodes: Users, companies, projects, assets, content
• Edges: Relationships, transactions, collaborations
• Properties: Strength, recency, value, type

**Embedding Integration:**
Every action updates embeddings:
• Behavioral patterns captured
• Preferences inferred
• Predictions refined
• Recommendations personalized

**Agent Optimization:**
AI agents act as personal C-suite:
• CFO agent manages financial decisions
• CRO agent optimizes relationships
• COO agent streamlines operations
• Each agent has access to personal corporation data`
      },
      {
        title: "Best Practices",
        content: `1. **Think Like a CEO** — You're managing your personal corporation
2. **Track Your Assets** — What you measure, you can improve
3. **Invest Wisely** — Time and attention are your scarcest resources
4. **Build Relationships** — Your network is a compounding asset
5. **Trust Your Agents** — AI advisors work continuously on your behalf
6. **Review Performance** — Use dashboards to assess your personal P&L`
      }
    ]
  },

  two_rails_architecture: {
    title: "Two Rails Architecture — Hybrid Decision Framework",
    subtitle: "Physics Rail and ML Rail Working in Harmony",
    version: 1,
    sections: [
      {
        title: "What is Two Rails Architecture?",
        content: `The Two Rails Architecture is the decision-making framework underlying all platform intelligence. It combines two complementary approaches: the Physics Rail (deterministic, first-principles reasoning) and the ML Rail (probabilistic, pattern-based prediction). Every platform decision flows through one or both rails.

**The Two Rails:**

**Physics Rail — Deterministic Logic**
• First-principles calculations
• Business rules and constraints
• Financial models
• Contract enforcement
• Compliance requirements
• Explicit causality

**ML Rail — Probabilistic Intelligence**
• Pattern recognition
• Behavioral prediction
• Anomaly detection
• Recommendation engines
• Similarity matching
• Learned heuristics`
      },
      {
        title: "Why Does This Exist?",
        content: `AI-only systems hallucinate and violate business rules. Rule-only systems miss patterns and fail to personalize. The magic happens when you combine both approaches strategically.

**The Hybrid Insight:**
1. **Rules Need Intelligence** — Pure logic can't handle ambiguity
2. **ML Needs Constraints** — Pure learning can violate requirements
3. **Context Determines Rail** — Some decisions are deterministic; others probabilistic
4. **Combination Outperforms** — Hybrid approaches beat pure approaches

**Examples of Rail Selection:**

**Physics Rail (deterministic):**
• "Can this user access this data?" — Permission check
• "What's the tax on this transaction?" — Calculation
• "Does this contract allow this action?" — Rule evaluation

**ML Rail (probabilistic):**
• "Will this deal close?" — Prediction
• "What should we recommend?" — Personalization
• "Is this pattern anomalous?" — Detection

**Both Rails:**
• "Should we approve this loan?" — Rules define limits; ML predicts risk
• "When should we follow up?" — Constraints set bounds; ML optimizes timing`
      },
      {
        title: "How It Works",
        content: `**Rail Selection Logic:**

**Step 1: Classify Decision Type**
• Hard constraint? → Physics Rail
• Prediction/recommendation? → ML Rail
• Complex decision? → Both rails

**Step 2: Physics Rail Processing**
When invoked:
• Load applicable rules
• Evaluate constraints
• Calculate deterministic outputs
• Enforce business logic
• Return definitive answer or constraints

**Step 3: ML Rail Processing**
When invoked:
• Load user embeddings
• Query relevant patterns
• Generate predictions
• Score recommendations
• Return probabilistic outputs

**Step 4: Rail Integration**
When both rails active:
• Physics Rail sets hard boundaries
• ML Rail optimizes within boundaries
• Conflicts resolved by Physics Rail (safety)
• Uncertainty flagged for human review

**Implementation Patterns:**

**Validation Pattern:**
ML suggests → Physics validates → Approved or rejected

**Optimization Pattern:**
Physics sets constraints → ML optimizes → Best option selected

**Escalation Pattern:**
ML confident → Auto-execute
ML uncertain → Human review
Physics violation → Block and alert

**Audit Trail:**
Every decision records:
• Which rails invoked
• Inputs to each rail
• Rail outputs
• Integration logic
• Final decision`
      },
      {
        title: "Best Practices",
        content: `1. **Know Your Constraints** — Physics Rail encodes what MUST happen
2. **Trust Patterns** — ML Rail learns what SHOULD happen
3. **Audit Decisions** — Review how rails interact for important choices
4. **Update Rules** — Physics Rail needs maintenance as business changes
5. **Feed the ML** — More data improves ML Rail predictions
6. **Override When Needed** — Human judgment supersedes both rails`
      }
    ]
  },

  user_embeddings: {
    title: "User Embeddings — Behavioral Intelligence System",
    subtitle: "Every Action Shapes Your Digital Fingerprint",
    version: 1,
    sections: [
      {
        title: "What are User Embeddings?",
        content: `User Embeddings are dense vector representations of user behavior that power the platform's personalization engine. Every action you take—clicks, completions, preferences, timing—updates your embedding, creating a continuously refined model of who you are and what you need.

**Core Concepts:**
• **Embeddings** — High-dimensional vectors capturing behavioral patterns
• **Continuous Learning** — Every action updates the model
• **Cross-Module Intelligence** — Embeddings inform all platform features
• **Privacy-Preserving** — Patterns, not raw data, are stored

**What Embeddings Capture:**
• Work style preferences
• Communication patterns
• Decision-making tendencies
• Energy and focus rhythms
• Collaboration behaviors
• Content consumption patterns`
      },
      {
        title: "Why Does This Exist?",
        content: `Traditional personalization uses explicit preferences—settings you configure manually. But behavior reveals truth that stated preferences don't capture. You might say you prefer morning meetings, but your embeddings know you actually perform better in afternoons.

**The Embedding Advantage:**
1. **Implicit Learning** — No configuration required
2. **Behavioral Truth** — Actions reveal true preferences
3. **Continuous Refinement** — Gets better with use
4. **Cross-Domain Transfer** — Patterns in one area inform others
5. **Prediction Power** — Enable anticipatory features

**Platform-Wide Impact:**
Embeddings power:
• Intelligent Scheduling (optimal task timing)
• Recommendation engines (content, connections)
• Anomaly detection (unusual patterns flagged)
• Agent personalization (AI adapts to you)
• Network matching (similar users/businesses connected)`
      },
      {
        title: "How It Works",
        content: `**The Embedding Pipeline:**

**Step 1: Action Capture**
Every interaction logged:
• What action occurred
• When it happened
• Context and metadata
• Outcome (if applicable)

**Step 2: Feature Extraction**
Raw actions → Features:
• Temporal patterns (time of day, day of week)
• Sequence patterns (what follows what)
• Duration patterns (how long spent)
• Preference signals (choices made)
• Outcome correlations (what leads to success)

**Step 3: Embedding Update**
Features → Vector update:
• Incremental learning (small adjustments per action)
• Decay for stale patterns
• Emphasis on recent behavior
• Cross-feature interactions

**Step 4: Embedding Application**
Vector used for:
• Similarity search (find like users/content)
• Prediction (what will user do/want)
• Personalization (adapt interface/recommendations)
• Anomaly detection (flag unusual patterns)

**Privacy Architecture:**
• Raw data processed, not stored indefinitely
• Embeddings are abstract vectors, not readable profiles
• User controls for embedding reset
• Transparent embedding influence on features
• No selling or sharing of embedding data

**Embedding Categories:**
• **Behavioral** — How you work
• **Preferential** — What you like
• **Temporal** — When you're most effective
• **Social** — How you collaborate
• **Cognitive** — How you make decisions`
      },
      {
        title: "Best Practices",
        content: `1. **Be Yourself** — Authentic behavior creates accurate embeddings
2. **Use Consistently** — More data means better personalization
3. **Trust the System** — Embedding-driven recommendations often surprise positively
4. **Review Occasionally** — Check what the system has learned about you
5. **Reset if Needed** — Major life changes may warrant embedding refresh
6. **Provide Feedback** — Corrections refine embedding accuracy`
      }
    ]
  },

  network_matching: {
    title: "Network Matching — AGI-Powered Business Connection",
    subtitle: "Automatically Connect Complementary Businesses",
    version: 1,
    sections: [
      {
        title: "What is Network Matching?",
        content: `Network Matching is the platform's AGI-powered system for automatically identifying and suggesting connections between complementary businesses. When an orange grower joins the platform, the system identifies and connects them with juice manufacturers, citrus product sellers, and agricultural suppliers already in the network.

**Core Capabilities:**
• **Automatic Discovery** — AI identifies potential matches
• **Complement Detection** — Finds businesses that complete each other
• **Introduction Facilitation** — Warm introductions through shared context
• **Opportunity Surfacing** — Suggests specific collaboration possibilities
• **Network Effects** — Value compounds as more businesses join

**Matching Dimensions:**
• Supply chain (suppliers ↔ buyers)
• Service complements (lawyer + accountant for business clients)
• Customer overlap (shared target markets)
• Capability gaps (what you need ↔ what they have)`
      },
      {
        title: "Why Does This Exist?",
        content: `Most valuable business relationships happen by accident—chance meetings, random introductions, lucky discoveries. But with sufficient data about businesses, AI can systematically identify matches that humans would never find on their own.

**The Network Vision:**
The platform aims to incubate millions of businesses. With that scale, the number of potential connections is astronomical. Network Matching is how we extract value from that network.

**Matching Challenges:**
1. **Discovery Problem** — Businesses don't know potential partners exist
2. **Complementarity Blindness** — Non-obvious matches missed
3. **Introduction Friction** — Cold outreach rarely works
4. **Scale Impossibility** — Humans can't process all potential matches

**The AGI Solution:**
We built matching intelligence that:
• Analyzes all businesses on embeddings and industry tags
• Identifies complementary patterns
• Scores match quality
• Generates introduction rationale
• Facilitates warm connections

**Instincts Layer Integration:**
AI agents continuously:
• Scan for new matching opportunities
• Score and rank potential connections
• Generate personalized introduction messages
• Track connection outcomes for learning`
      },
      {
        title: "How It Works",
        content: `**The Matching Pipeline:**

**Step 1: Business Profiling**
For each business, capture:
• Industry and vertical
• Products and services offered
• Products and services needed
• Customer profile
• Geographic footprint
• Growth stage and strategy

**Step 2: Embedding Generation**
Convert profile to vector:
• Industry embeddings
• Capability embeddings
• Need embeddings
• Customer embeddings
• Strategy embeddings

**Step 3: Complement Detection**
Find businesses where:
• Your outputs = Their inputs (supply chain)
• Your customers = Their customers (cross-sell)
• Your gaps = Their strengths (partnership)
• Your strengths = Their gaps (service)

**Step 4: Match Scoring**
Evaluate match quality:
• Complementarity strength
• Geographic feasibility
• Stage compatibility
• Cultural alignment (from embeddings)
• Historical success of similar matches

**Step 5: Introduction Facilitation**
For high-quality matches:
• Generate introduction rationale
• Identify shared context
• Suggest conversation starters
• Provide relevant background

**Step 6: Outcome Tracking**
Learn from connections:
• Did introduction happen?
• Did relationship develop?
• Did value create?
• What predicted success?

**Example Match Types:**
• Orange grower ↔ Juice manufacturer
• Software company ↔ Implementation partner
• Manufacturer ↔ Distributor
• Startup ↔ Investor (specific fit)`
      },
      {
        title: "Best Practices",
        content: `1. **Complete Your Profile** — More data enables better matching
2. **Be Specific About Needs** — Clear needs find clear solutions
3. **Respond to Matches** — The system learns from your reactions
4. **Take Introduction Meetings** — AI-suggested matches are high quality
5. **Report Outcomes** — Feedback improves future matching
6. **Stay Active** — Active businesses surface more prominently in matching`
      }
    ]
  },

  data_aggregation: {
    title: "Data Aggregation Strategy — Six Categories of Platform Intelligence",
    subtitle: "Ethical, Consent-Based Data Collection for Ecosystem Value",
    version: 1,
    sections: [
      {
        title: "What is the Data Aggregation Strategy?",
        content: `The Data Aggregation Strategy defines six categories of data the platform collects, analyzes, and leverages to create value for all participants. All collection is ethical, consent-based, and designed to benefit users while building network-wide intelligence.

**The Six Categories:**

1. **User Behavioral Data** — Actions, patterns, preferences
2. **Company/Entity Intelligence** — Operations, strategies, relationships
3. **AI Provider Data** — Performance, routing, optimization (from AI Gift Cards)
4. **Transaction/Economic Data** — Purchases, payments, value flows
5. **Graph/Relationship Data** — Connections between entities
6. **Workflow/Agent Effectiveness** — Automation performance metrics

**Core Principles:**
• **Consent-Based** — Explicit agreement for data collection
• **Value Exchange** — Data shared improves user experience
• **Privacy-Preserving** — Aggregation, not individual exposure
• **Transparent Use** — Clear explanation of how data is used`
      },
      {
        title: "Why Does This Exist?",
        content: `Platforms that collect data without clear purpose or user benefit eventually face backlash. We believe data collection should be a transparent value exchange where users understand exactly how their data improves their experience.

**The Data Value Loop:**
1. Users contribute data through normal platform use
2. Platform aggregates into intelligence
3. Intelligence improves recommendations, matching, automation
4. Users benefit from improved experience
5. Improved experience encourages more contribution

**Category Details:**

**Category 1: User Behavioral**
Powers: Personalization, scheduling, recommendations

**Category 2: Company/Entity Intelligence**
Powers: Business matching, market insights, benchmarking

**Category 3: AI Provider Data**
Powers: Model routing, cost optimization, capability matching

**Category 4: Transaction/Economic**
Powers: Pricing intelligence, fraud detection, market analysis

**Category 5: Graph/Relationship**
Powers: Network matching, introduction quality, relationship health

**Category 6: Workflow/Agent Effectiveness**
Powers: Agent improvement, workflow optimization, best practice identification`
      },
      {
        title: "How It Works",
        content: `**Collection Pipeline:**

**Consent Layer:**
• Clear data use explanations
• Granular opt-in/opt-out
• Audit trail of consents
• Easy preference changes

**Collection Points:**
• User actions (clicks, completions)
• Business profiles and updates
• Transaction records
• Relationship events
• Agent executions
• API interactions

**Aggregation Layer:**
• Individual data → Anonymous aggregates
• Pattern extraction without identification
• Statistical summaries
• Trend calculations

**Intelligence Generation:**
• Aggregates → Insights
• Patterns → Predictions
• Trends → Recommendations
• Benchmarks → Comparisons

**Application Layer:**
How intelligence improves experience:
• Scheduling: "Users like you are most productive at X time"
• Matching: "Businesses in your category often partner with Y"
• Pricing: "Market rate for this service is $Z"
• Agents: "This workflow pattern succeeds 80% of the time"

**Privacy Guarantees:**
• No selling of individual data
• No exposure without consent
• Aggregation thresholds (minimum group size)
• Right to deletion
• Export capability`
      },
      {
        title: "Best Practices",
        content: `1. **Understand the Exchange** — Know what you share and what you get
2. **Opt In Strategically** — Enable collection for features you want
3. **Review Periodically** — Check your data preferences
4. **Contribute for Network** — Your data helps the entire community
5. **Request Insights** — Ask what the platform has learned about your category
6. **Report Issues** — Help maintain data quality and ethics`
      }
    ]
  },

  okari_gx: {
    title: "Okari GX — Hardware Verification Layer",
    subtitle: "Physical Truth for Digital Commerce",
    version: 1,
    sections: [
      {
        title: "What is Okari GX?",
        content: `Okari GX is a hardware verification system that provides physical truth for digital commodity trading. Using IoT sensors and tamper-evident devices, Okari GX measures and verifies physical assets (tank levels, volumes, quality metrics) before trades execute, creating a "Physically Verified Marketplace."

**Core Capabilities:**
• **Real-Time Telemetry** — Live sensor data from physical assets
• **Tamper Evidence** — Cryptographic verification of sensor integrity
• **Custody Tracking** — Chain of custody from source to destination
• **Verification Gates** — Trade execution blocked until physical verification
• **API Integration** — Data flows into xCOMMODITYx platform

**Sensor Types:**
• Tank level sensors
• Pressure monitors
• Flow meters
• Quality analyzers
• GPS trackers
• Temperature sensors`
      },
      {
        title: "Why Does This Exist?",
        content: `Commodity trading involves physical goods, but most trading platforms operate on trust and paper documentation. Fraud, discrepancies, and disputes are common because there's no reliable way to verify physical reality before committing to trades.

**Physical Commerce Challenges:**
1. **Paper Lies** — Documents can misrepresent reality
2. **Trust Gaps** — Parties don't trust each other's claims
3. **Verification Costs** — Physical inspections are expensive
4. **Timing Issues** — Verification happens after commitment
5. **Dispute Complexity** — He-said-she-said without evidence

**The Okari GX Solution:**
We built a hardware layer that:
• Measures physical assets in real-time
• Provides cryptographic verification of readings
• Blocks trades until physical verification completes
• Creates immutable audit trail
• Integrates directly with trading platform

**Integration with xCOMMODITYx:**
Okari GX is the physical truth layer for the digital trading platform:
• Telemetry displays on trading interface
• Verification status gates transactions
• Historical data supports dispute resolution
• Custody chain tracks asset movement`
      },
      {
        title: "How It Works",
        content: `**The Verification Pipeline:**

**Step 1: Sensor Deployment**
• Install Okari GX sensors on physical assets
• Configure measurement parameters
• Establish secure communication
• Register in platform

**Step 2: Continuous Monitoring**
• Sensors report at configured intervals
• Data transmitted securely to platform
• Readings stored with timestamps
• Anomalies flagged automatically

**Step 3: Trade Verification**
When trade initiated:
• Current readings captured
• Compared against trade terms
• Verification status calculated
• Green light or block decision

**Step 4: Custody Tracking**
During asset movement:
• GPS tracks location
• Sensors monitor conditions
• Chain of custody documented
• Delivery confirmed at destination

**Telemetry Widget:**
The OkariTelemetryWidget displays:
• Current tank levels (visual gauge)
• Pressure readings
• Flow rates
• Quality metrics
• Verification status (pulsing green = "Live Custody")

**Trust Architecture:**
• Sensors use cryptographic signatures
• Tamper detection alerts
• Regular calibration verification
• Third-party audit capability
• Immutable recording of all readings`
      },
      {
        title: "Best Practices",
        content: `1. **Deploy Comprehensively** — More sensors = more trust
2. **Calibrate Regularly** — Accuracy requires maintenance
3. **Monitor Alerts** — Respond to anomalies immediately
4. **Use Verification Gates** — Don't bypass for convenience
5. **Maintain Audit Trail** — Documentation prevents disputes
6. **Train Personnel** — Proper installation ensures accuracy`
      }
    ]
  },

  domain_portability: {
    title: "Domain & Portability System — Business Independence",
    subtitle: "Detach, Transfer, and Monetize Your Businesses",
    version: 1,
    sections: [
      {
        title: "What is the Domain & Portability System?",
        content: `The Domain & Portability System enables spawned businesses to become fully independent entities. From custom domain configuration to complete detachment as standalone React packages, this system ensures businesses built on the platform are never locked in.

**Core Capabilities:**
• **Subdomain Support** — yourcompany.bizdev.app
• **Custom Domains** — Connect your own domains via OAuth
• **Version Control** — Deployment versioning with rollback
• **Detachment** — Export as standalone React package
• **Transfer** — Sell or transfer to new owners
• **Domain Purchase** — Buy domains directly in-platform

**Portability Levels:**
• Level 1: Subdomain (included)
• Level 2: Custom domain (configuration)
• Level 3: Standalone export (detachment)
• Level 4: Complete transfer (ownership change)`
      },
      {
        title: "Why Does This Exist?",
        content: `Platform lock-in is the dark pattern of SaaS. Businesses invest in platforms only to find they can't leave without losing everything. We believe businesses should be able to grow beyond the platform that incubated them.

**Lock-In Problems:**
1. **Data Hostage** — Your data trapped in proprietary formats
2. **Feature Dependency** — Can't function without platform
3. **Export Impossibility** — No path to independence
4. **Value Destruction** — Built value can't be transferred or sold
5. **Growth Ceiling** — Platform limitations cap your potential

**The Portability Solution:**
We built with exit in mind:
• Businesses are self-contained React applications
• Data exportable in standard formats
• Domain ownership fully transferable
• Clean separation of platform vs. business
• Marketplace for business transfer

**Platform Features as Spawned Businesses:**
Even core platform features (xCOMMODITYx, XODIAK) are managed as spawned businesses, proving the architecture supports full-scale operations with detachment capability.`
      },
      {
        title: "How It Works",
        content: `**Domain Management:**

**Subdomain Setup:**
• Automatic subdomain on bizdev.app
• Instant activation
• SSL included
• DNS managed

**Custom Domain:**
• OAuth connection to registrar
• Automated DNS configuration
• SSL certificate provisioning
• Verification and activation

**In-Platform Purchase:**
• Domain search and suggestions
• Registrar API integration
• One-click purchase
• Automatic configuration

**Version Control:**
• Every deployment versioned
• Visual deployment history
• One-click rollback
• A/B testing support

**Detachment Process:**

**Step 1: Export Preparation**
• Identify dependencies
• Package static assets
• Generate configuration

**Step 2: Code Generation**
• Create standalone React package
• Include all components
• Bundle styling and assets

**Step 3: Data Export**
• Export all business data
• Standard format (JSON, CSV)
• Relationship preservation

**Step 4: Domain Transfer**
• Point domain to new hosting
• Update DNS records
• Verify new configuration

**Business Transfer:**
For selling or transferring:
• Ownership transfer in platform
• Data access handoff
• Domain transfer initiation
• Clean separation from seller`
      },
      {
        title: "Best Practices",
        content: `1. **Plan for Independence** — Build with eventual detachment in mind
2. **Use Custom Domains** — Establish brand identity early
3. **Version Important Changes** — Enable rollback for major updates
4. **Export Regularly** — Keep backups of your data
5. **Document Dependencies** — Know what you rely on
6. **Consider Market Value** — Businesses can be valuable assets`
      }
    ]
  },

  white_label: {
    title: "White Label / xBUILDERx — Partner Customization",
    subtitle: "Deploy Customized Platform Instances for Partners",
    version: 1,
    sections: [
      {
        title: "What is White Label / xBUILDERx?",
        content: `White Label (powered by xBUILDERx) enables partners to deploy customized instances of the Biz Dev platform under their own branding. From visual theming to feature selection, partners can create tailored experiences for their customers while leveraging the full platform infrastructure.

**Core Capabilities:**
• **Custom Branding** — Logos, colors, typography
• **Feature Selection** — Enable/disable specific modules
• **Custom Domains** — Operate under partner URLs
• **User Management** — Partner-controlled user administration
• **Revenue Sharing** — Partner monetization options
• **Sector Analysis** — Industry-specific configurations

**White Label Levels:**
• Basic: Branding only
• Professional: Branding + feature selection
• Enterprise: Full customization + custom development`
      },
      {
        title: "Why Does This Exist?",
        content: `Partners want to offer business tools to their customers without building from scratch. Enterprises want the platform's capabilities under their own identity. Industry associations want member-specific features. White labeling enables all of these.

**Partner Needs:**
1. **Brand Consistency** — Tools should match partner identity
2. **Feature Control** — Not all features suit all audiences
3. **Revenue Opportunity** — Monetize platform access
4. **Customer Ownership** — Partners own their user relationships
5. **Differentiation** — Unique configurations create competitive advantage

**The xBUILDERx Solution:**
We built a comprehensive white label system:
• Complete visual customization
• Module-level feature toggling
• Partner administration portals
• Sector-specific templates
• Revenue sharing infrastructure

**Use Cases:**
• Industry associations offering member tools
• Consultancies providing client portals
• Franchises needing standardized systems
• Enterprises requiring custom deployments`
      },
      {
        title: "How It Works",
        content: `**White Label Configuration:**

**Visual Customization:**
• Logo upload and placement
• Color palette definition
• Typography selection
• Custom CSS injection
• Email template branding

**Feature Selection:**
• Module enable/disable toggles
• Feature-level granularity
• Custom module ordering
• Sidebar configuration
• Default settings

**Domain Setup:**
• Partner domain configuration
• SSL provisioning
• Email domain integration
• Subdomain structure

**User Administration:**
Partners manage:
• User creation and invitations
• Role and permission assignment
• Access level configuration
• User support and management

**Sector Analysis (xBUILDERx):**
Industry-specific configurations:
• Pre-configured module sets
• Industry terminology
• Workflow templates
• Compliance settings
• Best practice defaults

**Revenue Model:**
• Subscription revenue sharing
• Transaction fee splits
• Custom pricing tiers
• Partner billing management

**Deployment Flow:**
1. Partner agreement and setup
2. Branding configuration
3. Feature selection
4. Domain setup
5. User migration (if applicable)
6. Launch and support`
      },
      {
        title: "Best Practices",
        content: `1. **Define Clear Brand Guidelines** — Consistent branding improves user experience
2. **Select Features Thoughtfully** — Less is often more for focused audiences
3. **Train Your Team** — Partners need platform expertise
4. **Establish Support Channels** — Clear escalation paths for issues
5. **Monitor Usage** — Analytics inform future customization
6. **Iterate Based on Feedback** — Continuous improvement from user input`
      }
    ]
  },

  risk_reduction: {
    title: "Enterprise Risk Reduction Suite",
    subtitle: "Transform Business Features into Measurable Risk Mitigation",
    version: 1,
    sections: [
      {
        title: "What is Enterprise Risk Reduction?",
        content: `The Enterprise Risk Reduction Suite is a comprehensive command center for identifying, measuring, monitoring, and mitigating risks across your organization. Unlike traditional risk management tools that treat risk as a compliance checkbox, this system transforms every platform feature into a measurable risk reduction story.

**Six Core Risk Domains:**
• **Strategic Risk** — Threats to business model, market position, and competitive advantage
• **Operational Risk** — Process failures, supply chain disruptions, and execution gaps
• **Financial Risk** — Cash flow, credit, market, and settlement risks
• **Compliance Risk** — Regulatory violations, policy breaches, and audit failures
• **Technology Risk** — Cybersecurity threats, system failures, and data breaches
• **Reputational Risk** — Brand damage, stakeholder trust, and public perception

**Core Components:**
• **Risk Command Center** — Unified dashboard with heat maps, KRI monitoring, and drill-down analytics
• **Risk Register** — Centralized catalog of all identified risks with scoring and ownership
• **Key Risk Indicators (KRIs)** — Leading metrics that predict risk materialization
• **Vendor Risk Management (TPRM)** — Third-party assessment and monitoring
• **Compliance Control Library** — Framework-aligned controls with testing workflows
• **Incident Response Center** — Security incident tracking with root cause analysis
• **Insurance Management** — Policy tracking with coverage gap identification
• **Business Continuity** — BCDR planning with scenario modeling`
      },
      {
        title: "Why Does This Exist?",
        content: `**The Enterprise Reality:**
Multi-million and billion-dollar companies don't buy "features" — they buy risk reduction. Every procurement decision is filtered through the lens of: "How does this reduce our exposure?"

**The Reframing Opportunity:**
Every platform capability is actually a risk reduction story waiting to be told:

• **XODIAK Ledger Anchoring** → Audit/Regulatory Risk Elimination
  - Immutable proof of business transactions
  - Automatic compliance documentation
  - Dispute resolution through cryptographic evidence

• **Smart Escrow** → Financial/Settlement Risk Mitigation
  - Protected transaction settlements
  - Reduced counterparty risk
  - Automated release conditions

• **Two-Tier Permissions** → Access/Data Risk Reduction
  - Granular control over sensitive information
  - Audit trails for all access
  - Least-privilege enforcement

• **Workflow Automation** → Operational Risk Reduction
  - Eliminated manual errors
  - Consistent process execution
  - Automatic escalation and failsafes

• **Deal Room Structure** → Contractual Risk Reduction
  - Clear attribution and documentation
  - Pre-defined dispute resolution
  - Transparent multi-party governance

**The Competitive Advantage:**
By quantifying risk reduction, you speak the language of enterprise buyers and their procurement committees.`
      },
      {
        title: "How It Works",
        content: `**Risk Register Workflow:**
1. **Identification** — Risks are identified through manual entry, AI detection, or external feeds
2. **Assessment** — Each risk is scored using Likelihood (1-5) × Impact (1-5) = Risk Score (1-25)
3. **Categorization** — Risks are tagged by domain, owner, and related entities
4. **Treatment** — Mitigation strategies are documented with progress tracking
5. **Monitoring** — Continuous monitoring through KRIs and automated alerts

**Heat Map Visualization:**
The Risk Heat Map provides instant visibility into your risk landscape:
- X-axis: Likelihood of occurrence
- Y-axis: Impact if realized
- Color intensity: Number of risks in each cell
- Click-through: Drill into specific risk categories

**Key Risk Indicators (KRIs):**
KRIs are leading metrics that predict risk events before they occur:
- Define thresholds for warning and critical states
- Automatic data collection from platform activity
- Trend analysis to identify deteriorating conditions
- Alert triggers when thresholds are breached

**Risk Appetite Framework:**
Define your organization's tolerance for risk:
- Category-specific appetite statements
- Quantified thresholds for acceptable risk
- Escalation procedures when appetite is exceeded
- Board-level reporting on appetite utilization

**Integration with Platform Modules:**
- Deal Rooms can require risk assessments before closure
- Workflows can trigger risk reviews
- CRM activities feed into relationship risk scoring
- Financial transactions update settlement risk metrics`
      },
      {
        title: "Vendor & Third-Party Risk Management (TPRM)",
        content: `**Why Vendor Risk Matters:**
Organizations increasingly rely on third parties for critical operations. Each vendor relationship introduces potential risks:
- Data security and privacy
- Business continuity dependencies
- Regulatory compliance gaps
- Reputational exposure

**Vendor Assessment Process:**
1. **Onboarding Assessment** — Initial risk evaluation before engagement
2. **Due Diligence** — Documentation collection and review
3. **Risk Scoring** — Automated scoring based on assessment responses
4. **Ongoing Monitoring** — Continuous surveillance for risk changes
5. **Periodic Reassessment** — Scheduled reviews based on risk tier

**Risk Tiers:**
• **Critical** — Business-critical vendors requiring quarterly review
• **High** — Important vendors with annual assessment
• **Medium** — Standard vendors with biennial review
• **Low** — Minimal-risk vendors with streamlined oversight

**Assessment Categories:**
- Information security controls
- Business continuity capabilities
- Financial stability indicators
- Regulatory compliance status
- Subcontractor/fourth-party risks`
      },
      {
        title: "Compliance Automation Engine",
        content: `**Framework Support:**
The Compliance Control Library supports multiple frameworks:
- SOC 2 Type II
- ISO 27001
- GDPR
- HIPAA
- PCI-DSS
- Custom frameworks

**Control Library:**
Pre-built control catalog with:
- Control objectives and requirements
- Implementation guidance
- Evidence requirements
- Testing procedures
- Mapping to multiple frameworks

**Testing Workflow:**
1. **Schedule** — Automated test scheduling based on control risk
2. **Execute** — Guided testing procedures with evidence collection
3. **Document** — Automatic evidence linking and storage
4. **Evaluate** — Pass/fail determination with remediation tracking
5. **Report** — Compliance dashboards and audit-ready reports

**Continuous Compliance:**
Move from point-in-time audits to continuous assurance:
- Real-time control monitoring
- Automated evidence collection
- Immediate gap detection
- Proactive remediation workflows`
      },
      {
        title: "Incident Response & Business Continuity",
        content: `**Incident Response Center:**
When security incidents occur, the platform provides:
- Severity-based triage and escalation
- Playbook-driven response procedures
- Root cause analysis documentation
- Lessons learned capture
- Insurance claim integration

**Incident Lifecycle:**
1. **Detection** — Identified through monitoring, reports, or external notification
2. **Triage** — Severity assessment and initial response team assignment
3. **Containment** — Immediate actions to limit impact
4. **Investigation** — Root cause analysis and scope determination
5. **Remediation** — Corrective actions and control improvements
6. **Recovery** — Return to normal operations
7. **Post-Incident Review** — Lessons learned and process improvements

**Business Continuity Planning:**
- Business Impact Analysis (BIA) documentation
- Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)
- Scenario-based continuity plans
- Testing schedules and results tracking
- Crisis communication templates

**Insurance Management:**
Track all insurance policies with:
- Coverage summaries and limits
- Premium and renewal tracking
- Gap analysis against risk profile
- Claim history and documentation
- Broker contact management`
      },
      {
        title: "Best Practices",
        content: `**1. Define Risk Appetite First**
Before operations begin, establish clear risk tolerance statements for each domain. This provides the benchmark against which all risk decisions are measured.

**2. Monitor KRIs Daily**
Key Risk Indicators are your early warning system. Build daily KRI review into your operations rhythm to catch emerging risks before they materialize.

**3. Link All Deals to Risk Assessments**
Every significant deal should have an associated risk assessment. This ensures commercial decisions incorporate risk considerations.

**4. Regular Vendor Reassessment**
Vendor risk profiles change over time. Maintain a reassessment schedule based on vendor criticality and previous findings.

**5. Document Control Testing**
Evidence-based compliance requires documented testing. Ensure every control test is recorded with sufficient evidence for audit review.

**6. Integrate Risk into Workflows**
Use workflow automation to embed risk considerations into business processes — automatic risk reviews, approval gates, and escalation triggers.

**7. Report to Leadership**
Risk is a board-level concern. Provide regular, digestible risk reporting that translates technical risks into business impact language.

**8. Learn from Incidents**
Every incident is a learning opportunity. Maintain a formal post-incident review process that captures and applies lessons learned.`
      }
    ]
  },

  "initiative-architect": {
    title: "Initiative Architect — AGI-Powered Project Scaffolding",
    subtitle: "Transform Natural Language Into Operational Infrastructure",
    version: 1,
    sections: [
      {
        title: "What is Initiative Architect?",
        content: `The Initiative Architect is an AGI orchestration system that converts natural language project descriptions into complete operational infrastructure. When you describe a goal, the system automatically scaffolds everything needed to execute it.

**What Gets Scaffolded:**
• **CRM Contacts** — Key people identified in your prompt are created as contacts
• **CRM Companies** — Organizations mentioned become company records with research
• **Deal Room** — Partnership structure with terms, participants, and governance
• **Task Lists** — Action items with priorities, assignments, and due dates
• **ERP Folders** — Document structure for organizing project assets
• **Workflows** — Automated sequences for common operations (RSVP, follow-up)
• **Calendar Events** — Milestones and meetings scheduled automatically
• **Proposals** — Initial outreach materials and curriculum drafts

**XODIAK Anchoring:**
Every scaffolding event is automatically anchored to the XODIAK blockchain, creating immutable proof of:
• When the initiative was conceived
• What was specified in the original prompt
• Which assets were created
• Who created it

This provides "origin proof" — an auditable record that the initiative existed with these parameters at this moment in time.`
      },
      {
        title: "Why Does This Exist?",
        content: `**The Problem:**
Turning an idea into action requires extensive setup:
1. Creating contact records for everyone involved
2. Setting up company profiles for organizations
3. Building deal structures with terms
4. Creating task lists and assigning work
5. Setting up folder structures for documents
6. Scheduling meetings and milestones
7. Drafting outreach materials

This takes hours of manual work before any real progress happens.

**The Solution:**
The Initiative Architect eliminates this friction. Describe your goal in natural language, and the AI creates the entire operational infrastructure in minutes. You go from idea to action-ready immediately.

**The Vision:**
This is part of the platform's transformation into a "business spawning engine." Every initiative you describe becomes a structured, traceable, executable project anchored to the blockchain.

**St. Constantine Example:**
When you entered "I want to run Biz Dev workshops at St. Constantine School...", the system:
• Created Majida Baba as a CRM contact (partnership key contact)
• Created St. Constantine School as a company
• Created BDLLC as your company
• Identified the workshop structure and curriculum needs
• Prepared to generate a Deal Room for the partnership

All of this from a single prompt, with XODIAK proof of conception.`
      },
      {
        title: "How It Works",
        content: `**The Scaffolding Pipeline:**

**Step 1: Natural Language Analysis**
Your prompt is analyzed by Gemini 2.5 Pro to extract:
• People mentioned (→ CRM Contacts)
• Organizations mentioned (→ CRM Companies)
• Partnership structure (→ Deal Room)
• Action items (→ Tasks)
• Timeline elements (→ Calendar Events)
• Document needs (→ ERP Folders)
• Automation opportunities (→ Workflows)

**Step 2: Entity Creation**
The AI creates database records for each identified entity:
• Contacts with roles, titles, and initiative context
• Companies with industry tags and relationship notes
• Deal Room with participants and initial terms

**Step 3: Content Generation**
AI generates:
• Curriculum outlines for educational initiatives
• Proposal drafts for partnership pitches
• Email templates for outreach sequences
• Meeting agendas for scheduled events

**Step 4: XODIAK Anchoring**
A contribution event is logged with:
• Actor: initiative-architect-agi
• Event type: workflow_triggered
• Payload: All scaffolded entities and content
• Status: Queued for blockchain anchoring

**Step 5: Status Update**
Initiative moves from "scaffolding" → "ready"

**Module Connections:**
• **Opportunity Discovery** → Signals can spawn initiatives
• **Proposal Generator** → Initiatives feed proposal creation
• **Deal Rooms** → Partnership terms executed here
• **Tasks** → All action items flow to task dashboard
• **Calendar** → Milestones appear in schedule
• **CRM** → All people and organizations tracked
• **Credits** → Execution earns contribution credits`
      },
      {
        title: "Using the Initiative Module",
        content: `**Creating an Initiative:**
1. Navigate to /initiatives
2. Enter a detailed prompt describing your goal
3. Include: people, organizations, timeline, objectives, desired outcomes
4. Click "Launch Initiative"
5. Watch as the AI scaffolds your infrastructure

**Viewing Initiative Details:**
Click any initiative card to see:
• **Summary** — AI-generated description of your goal
• **CRM Tab** — Contacts and companies created
• **Tasks Tab** — Action items with priorities and due dates
• **ERP Tab** — Folder structure for documents
• **Workflows Tab** — Automated sequences suggested
• **Calendar Tab** — Milestones and events scheduled
• **XODIAK Tab** — Blockchain anchor status and proof

**Activating an Initiative:**
Once scaffolding is complete:
1. Review all created assets
2. Make any adjustments needed
3. Click "Activate Initiative"
4. Begin execution with everything in place

**Status Lifecycle:**
• **Scaffolding** — AI is creating infrastructure (auto-refreshes)
• **Ready** — All assets created, awaiting activation
• **Active** — Initiative is being executed
• **Completed** — Goals achieved, outcomes tracked
• **Archived** — Historical reference

**Pro Tips:**
• Be specific about people and organizations in your prompt
• Include timeline expectations (e.g., "workshop in 60 days")
• Mention desired outcomes for better task generation
• Describe partnership structures for Deal Room setup`
      },
      {
        title: "Best Practices",
        content: `**1. Write Detailed Prompts**
More context = better scaffolding. Include:
• All key people and their roles
• Organizations involved
• Timeline and milestones
• Specific objectives
• Desired outcomes

**2. Review Before Activating**
Always review scaffolded assets before activation:
• Verify contacts have correct information
• Check task priorities and assignments
• Review generated content for accuracy
• Confirm Deal Room terms

**3. Connect to Opportunity Discovery**
Link your initiative to discovered opportunities for full lifecycle tracking from signal to execution.

**4. Use the Proposal Generator**
Generate formal proposals from your initiative to send to partners and stakeholders.

**5. Monitor XODIAK Status**
Check the XODIAK tab to verify blockchain anchoring:
• Pending = awaiting batch anchor
• Anchored = immutable proof recorded
• Copy transaction hash for external verification

**6. Track Outcomes**
As you execute, log outcomes to earn contribution credits:
• Tasks completed
• Meetings held
• Deals closed
• Revenue generated

**7. Archive with Learnings**
When complete, archive with notes on what worked for future initiative templates.`
      }
    ]
  },

  "proposal-generator": {
    title: "Proposal Generator — AGI-Powered Business Documents",
    subtitle: "Synthesize Platform Intelligence Into Professional Proposals",
    version: 1,
    sections: [
      {
        title: "What is the Proposal Generator?",
        content: `The Proposal Generator is an AI-powered engine that synthesizes data from across the platform—CRM profiles, Deal Room assets, Research Studio intelligence—to generate formal, branded business proposals.

**Proposal Types:**
• **Service Agreements** — Consulting, professional services, retainers
• **Partnership Proposals** — Joint ventures, collaborations, alliances
• **Investment Pitches** — Funding requests, equity offers
• **Workshop Curricula** — Educational programs, training materials
• **Project Proposals** — Scoped work with deliverables and pricing
• **Custom Templates** — Your own structures and branding

**Core Features:**
• **Template Library** — Pre-built and custom templates
• **CRM Integration** — Pull contact and company data automatically
• **Deal Room Linking** — Connect to specific deal contexts
• **Version Control** — Track revisions with full history
• **XODIAK Anchoring** — Immutable proof of proposal terms
• **PDF Export** — High-fidelity branded documents
• **Secure Sharing** — Password-protected web links
• **Engagement Tracking** — Know when proposals are viewed`
      },
      {
        title: "Why Does This Exist?",
        content: `**The Problem:**
Creating professional proposals requires:
1. Gathering information from multiple sources
2. Writing compelling, accurate content
3. Ensuring consistent branding
4. Managing versions and revisions
5. Tracking who viewed what
6. Proving what was offered and when

This takes hours per proposal and introduces risk of errors.

**The Solution:**
The Proposal Generator automatically:
• Pulls CRM data for personalization
• Uses Deal Room context for accurate terms
• Applies consistent branding
• Generates professional content with AI
• Tracks versions with XODIAK proof
• Monitors engagement

**The Trust Layer:**
When proposals are anchored to XODIAK, you have cryptographic proof of:
• Exactly what terms were offered
• When the offer was made
• What version was sent
• Any subsequent revisions

This eliminates "he said, she said" disputes and provides legal defensibility.

**Initiative Connection:**
Proposals often emerge from initiatives. The St. Constantine workshop initiative should generate:
• Partnership proposal to St. Constantine School
• Curriculum document for workshop delivery
• Registration/onboarding materials for attendees

The system connects these documents to their origin initiative for full traceability.`
      },
      {
        title: "How It Works",
        content: `**The Generation Pipeline:**

**Step 1: Template Selection**
Choose from:
• Standard templates (Service, Partnership, Investment)
• Custom templates you've created
• Initiative-specific templates
• Industry-specific formats

**Step 2: Context Gathering**
System pulls relevant data:
• CRM company profile (St. Constantine School)
• CRM contact info (Majida Baba)
• Deal Room terms (if linked)
• Research Studio intelligence
• Previous proposal history

**Step 3: AI Generation**
Gemini 2.5 Pro generates:
• Executive summary
• Problem/solution framing
• Scope of work
• Pricing and terms
• Timeline and milestones
• About your company

**Step 4: Review & Edit**
You can:
• Edit any section
• Regenerate specific parts
• Add custom content
• Adjust pricing
• Modify terms

**Step 5: Finalization**
When satisfied:
• Mark as final
• Anchor to XODIAK (optional but recommended)
• Generate PDF
• Create secure share link

**Step 6: Delivery & Tracking**
• Send via email with share link
• Track when recipient opens
• Get notified of engagement
• See time spent on each section

**Module Connections:**
• **Initiative Architect** → Proposals stem from initiatives
• **CRM** → Contact and company data
• **Deal Rooms** → Terms and pricing context
• **Research Studio** → Intelligence and insights
• **Communications** → Email delivery
• **Credits** → Sent proposals earn action credits`
      },
      {
        title: "Using the Proposal Generator",
        content: `**Creating a New Proposal:**
1. Navigate to /proposals
2. Click "New Proposal"
3. Select template type
4. Link to Company (optional but recommended)
5. Link to Contact (optional)
6. Link to Deal Room (optional)
7. Click "Generate"

**Editing a Proposal:**
• Click any section to edit inline
• Use "Regenerate" to get fresh AI content
• Adjust styling and branding
• Add images and attachments
• Preview as recipient will see it

**Version Management:**
• Each save creates a version
• View full version history
• Compare versions side-by-side
• Revert to previous versions
• Anchor specific versions to XODIAK

**Sharing Proposals:**
• Generate secure share link
• Set password protection (optional)
• Set expiration date (optional)
• Enable/disable download
• Track views and engagement

**PDF Export:**
• High-fidelity branded PDF
• Includes all sections and attachments
• Optional cover page
• Version and date stamps
• XODIAK verification certificate (if anchored)

**Proposal Status:**
• **Draft** — Work in progress
• **Review** — Ready for internal review
• **Sent** — Delivered to recipient
• **Viewed** — Recipient has opened
• **Accepted** — Terms agreed
• **Declined** — Not accepted
• **Expired** — Past expiration date`
      },
      {
        title: "Best Practices",
        content: `**1. Link to CRM Records**
Always connect proposals to CRM companies and contacts for:
• Automatic personalization
• Relationship context
• Proposal history tracking

**2. Use Templates Consistently**
Create templates for your common proposal types:
• Ensures brand consistency
• Speeds up generation
• Reduces errors

**3. Anchor Important Proposals**
Use XODIAK anchoring for:
• High-value proposals
• Legal agreements
• Anything that might be disputed
• Proposals with specific pricing

**4. Track Engagement**
Use engagement tracking to:
• Follow up when proposals are viewed
• Identify which sections get attention
• Optimize future proposals

**5. Version Control Everything**
• Create versions for significant changes
• Add notes explaining revisions
• Keep full history for reference

**6. Connect to Initiatives**
When proposals stem from initiatives:
• Link them for traceability
• Track from conception to acceptance
• Measure initiative effectiveness

**7. Follow Up with Deal Rooms**
When proposals are accepted:
• Create or update Deal Room
• Formalize terms and participants
• Track execution and deliverables

**8. Archive with Outcomes**
Track proposal outcomes:
• Win/loss reasons
• Time to decision
• Revenue generated
• Learnings for improvement`
      }
    ]
  },

  "opportunity-discovery": {
    title: "Opportunity Discovery Engine — Proactive AI Agent",
    subtitle: "Continuously Scan for Business Opportunities Matching Your Watchlist",
    version: 1,
    sections: [
      {
        title: "What is Opportunity Discovery?",
        content: `The Opportunity Discovery Engine is a proactive AI agent that continuously scans public data sources—news, business journals, social media, industry publications—for signals matching your opportunity watchlist. It transforms the platform from a reactive CRM into a proactive business-spawning engine.

**Core Components:**
• **Watchlist Management** — Define what you're looking for
• **Signal Scanning** — AI monitors public sources
• **Entity Extraction** — Identify people, companies, events
• **Relevance Scoring** — Calculate match quality (0-100)
• **Opportunity Queue** — High-value matches for review
• **One-Click Conversion** — Transform discoveries into CRM leads or Deal Rooms

**Signal Types:**
• **Company Signals** — New funding, leadership changes, expansion
• **Industry Signals** — Regulatory changes, market shifts, trends
• **Event Signals** — Conferences, partnerships, acquisitions
• **Geographic Signals** — Market entry, regional developments
• **People Signals** — Job changes, promotions, speaking engagements

**Example:**
If you're watching for "World Cup 2026 hospitality opportunities," the system scans for:
• Hotel and venue announcements
• International business delegations
• Infrastructure investments
• Tourism industry news
• Government initiatives`
      },
      {
        title: "Why Does This Exist?",
        content: `**The Problem:**
Most business development is reactive—you wait for opportunities to come to you. But the best opportunities go to those who spot them first.

**The Reactive Trap:**
• Waiting for inbound leads
• Relying on network referrals
• Missing public signals
• Reacting instead of anticipating

**The Proactive Advantage:**
The Opportunity Discovery Engine shifts you from reactive to proactive:
• AI scans 24/7 while you focus on execution
• Signals are scored for relevance to YOUR specific interests
• High-value matches surface automatically
• One-click conversion means you can act immediately

**The Vision:**
This is the "eyes and ears" of the platform. While you execute current deals, the AI is continuously scanning for your next opportunity. When a signal matches your watchlist, you get notified with everything you need to act.

**Connection to Initiatives:**
High-value discoveries can be converted directly into Initiatives:
1. Signal detected: "St. Constantine School hosting business workshop series"
2. You review and click "Convert to Initiative"
3. Initiative Architect scaffolds everything
4. Proposal Generator creates outreach materials
5. You're first to reach out with a professional proposal`
      },
      {
        title: "How It Works",
        content: `**The Discovery Pipeline:**

**Step 1: Watchlist Configuration**
Define what you're looking for:
• Target type (Company, Industry, Event, Person)
• Target value (specific name or category)
• Keywords (related terms to match)
• Priority (High, Medium, Low)
• Scan frequency (Hourly, Daily, Weekly)

**Step 2: Signal Scanning**
AI agents scan sources:
• News APIs and RSS feeds
• Business journal databases
• Social media platforms
• Industry publications
• Government announcements
• Patent and trademark filings

**Step 3: Entity Extraction**
From each signal, extract:
• Companies mentioned
• People mentioned
• Events referenced
• Locations specified
• Monetary values
• Dates and timelines

**Step 4: Relevance Scoring**
Calculate match quality:
• Keyword match strength
• Entity alignment with watchlist
• Recency of signal
• Source credibility
• Opportunity potential

**Step 5: Opportunity Queue**
High-scoring matches (>70):
• Appear in your opportunity feed
• Include source link and summary
• Show extracted entities
• Provide conversion actions

**Step 6: Conversion Actions**
From any opportunity:
• Create CRM Contact
• Create CRM Company
• Create Initiative
• Create Deal Room
• Add to Talent Network
• Archive/Dismiss`
      },
      {
        title: "Using Opportunity Discovery",
        content: `**Setting Up Your Watchlist:**
1. Navigate to /opportunity-discovery
2. Click "Add to Watchlist"
3. Choose target type:
   • Company — Specific company name
   • Industry — Industry category
   • Event — Event type or specific event
   • Person — Specific individual
4. Enter target value (e.g., "World Cup 2026")
5. Add keywords (e.g., "hospitality", "hotel", "tourism")
6. Set priority and scan frequency
7. Activate

**Reviewing Opportunities:**
• Sort by relevance score or date
• Filter by status (New, Reviewed, Converted, Archived)
• Click to expand full details
• View source article/post
• See extracted entities

**Converting Opportunities:**
When you find a match:
1. Click the opportunity to expand
2. Review summary and entities
3. Choose conversion action:
   • "Add to CRM" → Creates contact/company
   • "Create Initiative" → Launches Initiative Architect
   • "Create Deal Room" → Opens deal setup
4. System pre-fills with extracted data
5. Complete any missing fields
6. New entity is created and linked

**Managing Your Watchlist:**
• Pause/resume items without deleting
• Adjust keywords based on results
• Change scan frequency for performance
• Delete items no longer needed
• Review "Last Scanned" timestamps

**Opportunity Status:**
• **New** — Just discovered, not reviewed
• **Reviewed** — You've looked at it
• **Converted** — Turned into CRM/Initiative/Deal
• **Archived** — Dismissed but saved
• **Expired** — Past relevance window`
      },
      {
        title: "Best Practices",
        content: `**1. Start Specific, Then Broaden**
Begin with specific targets:
• Known companies you want to work with
• Specific events you're targeting
• Named individuals in your network

**2. Refine Keywords Over Time**
• Review what matches come through
• Add keywords that would have caught good opportunities
• Remove keywords that create noise

**3. Set Appropriate Frequencies**
• Breaking news = Hourly
• Industry trends = Daily
• Long-term plays = Weekly

**4. Act Quickly on High Scores**
Opportunities decay:
• 90+ score = Act today
• 80-89 = Act this week
• 70-79 = Add to consideration

**5. Convert to Initiatives**
Don't just create CRM records. Launch full initiatives to:
• Get the full scaffolding benefit
• Create XODIAK proof of timing
• Generate proposals immediately

**6. Archive, Don't Delete**
Archived opportunities:
• Inform future AI scanning
• Provide context for related signals
• Build your opportunity history

**7. Connect to Deal Rooms**
When an opportunity converts to action:
• Create the Deal Room early
• Add structure as it develops
• Track from discovery to close

**8. Review Weekly**
Set a weekly review habit:
• Process new opportunities
• Clean up archived items
• Adjust watchlist priorities`
      }
    ]
  },

  xevents: {
    title: "xEVENTSx — Event-Driven Business Activation",
    subtitle: "Transforming Events into Business Formation and Network Activation Catalysts",
    version: 1,
    sections: [
      {
        title: "What is xEVENTSx?",
        content: `xEVENTSx is a production-grade event-driven business formation and network activation system. It treats events as temporary business entities with a full lifecycle, from initial concept through execution to post-event monetization.

**Core Philosophy:**
Events are not just gatherings—they are **business formation catalysts**. Every conference, workshop, meetup, or networking session generates:
• New relationships that need CRM capture
• Business opportunities that need Deal Room structuring
• Intellectual property from presentations and discussions
• Network effects that compound over time

**Event Lifecycle States:**
• **Draft** — Event is being planned, not yet visible
• **Published** — Event is live and accepting registrations
• **Live** — Event is currently happening
• **Completed** — Event has ended, follow-up phase begins
• **Archived** — Event is stored for historical reference

**Key Components:**
• **Events** — The core entity with full metadata (title, description, dates, location, capacity)
• **Ticket Types** — Configurable pricing tiers (Early Bird, VIP, Standard, Free)
• **Registrations** — Attendee records with confirmation and check-in tracking
• **Sessions** — Agenda items within multi-day or multi-track events
• **Participants** — Speakers, sponsors, organizers, and attendees with role-based access`
      },
      {
        title: "Why Does This Exist?",
        content: `Traditional event platforms focus only on ticketing and logistics. They miss the real value: the business relationships and opportunities that events generate.

**The Problem We Solve:**

1. **Lost Follow-Up Value** — Attendees meet, exchange cards, then never connect again
2. **Manual CRM Entry** — Event organizers manually input contacts after events
3. **Disconnected Revenue** — Sponsorship deals happen outside the event platform
4. **No Proof of Participation** — No verifiable record of who attended what
5. **Fragmented Tools** — Separate systems for ticketing, registration, email, and networking

**Our Approach — The xEVENTSx Advantage:**

**1. CRM Integration**
Every registration automatically creates or updates a CRM contact. Attendee data flows seamlessly into your relationship management system.

**2. Network Group Generation**
Events auto-spawn Network Groups (Lobbies) where attendees can connect before, during, and after. These become persistent communities.

**3. Deal Room Spawning**
When attendees want to collaborate, one-click spawns a Deal Room with all relevant context pre-filled from the event.

**4. XODIAK Anchoring**
Every significant event action (registration, outcome, settlement) is anchored to XODIAK for immutable proof.

**5. Broadcast Integration**
Intelligent outreach campaigns for promotion, reminders, and follow-up—all driven by attendee segmentation.`
      },
      {
        title: "How It Works",
        content: `**For Event Organizers:**

**Creating Events:**
1. Navigate to /xevents → Create New Event
2. Complete the 5-step wizard:
   • **Basics** — Title, description, category
   • **Date & Time** — Start/end with timezone handling
   • **Location** — Physical address or virtual meeting link
   • **Settings** — Visibility, capacity, ticketing options
   • **Branding** — Cover image, logo, custom styling
3. Publish when ready to accept registrations

**Managing Events:**
• **Overview Tab** — At-a-glance metrics and quick actions
• **Registrations Tab** — View and manage attendees, export lists
• **Tickets Tab** — Configure pricing tiers, track sales
• **Agenda Tab** — Build session schedules for multi-track events
• **Settings Tab** — Update event details, manage team access

**For Attendees:**

**Registration Flow:**
1. Browse events or receive direct invite link
2. Select ticket type (if multiple options)
3. Complete registration form
4. Receive QR-coded ticket via email
5. Access event lobby for pre-event networking

**At the Event:**
• QR code check-in at entrance
• Session tracking for multi-track events
• In-app networking with other attendees
• Real-time updates and announcements

**Post-Event:**
• Access recorded sessions (if available)
• Continue conversations in Network Lobby
• Spawn Deal Rooms for collaboration
• Leave reviews and feedback

**Event Categories:**
• **Conference** — Large multi-day, multi-track events
• **Meetup** — Informal community gatherings
• **Workshop** — Hands-on training sessions
• **Networking** — Focused relationship-building events
• **Webinar** — Virtual presentations and discussions
• **Launch** — Product or business launch events
• **Party** — Social celebrations
• **Other** — Custom event types`
      },
      {
        title: "Integration Points",
        content: `**CRM Sync:**
• Registrations create/update CRM contacts automatically
• Attendee companies are linked to CRM company records
• Registration source (which event) is tracked for attribution

**Initiative Architect:**
Events can be scaffolded from the Initiative Architect:
"Create a workshop for St. Constantine School on Family Business" → AI generates:
• Event with appropriate settings
• Registration form
• Follow-up email sequences
• Deal Room for partnership discussions

**Proposal Generator:**
• Create event proposals for sponsors
• Generate post-event reports
• Package attendee insights for stakeholders

**Broadcast System:**
• Promotional campaigns for event marketing
• Reminder sequences before event
• Follow-up campaigns after event
• Attendee segmentation for targeted messaging

**Deal Rooms:**
• Spawn Deal Rooms from event context
• Pre-fill participant info from registrations
• Track deals that originated from events

**XODIAK:**
• Anchor registration timestamps
• Verify attendance for compliance
• Record sponsorship agreements
• Track outcome attribution`
      },
      {
        title: "Best Practices",
        content: `**1. Plan the Follow-Up First**
Before creating the event, define:
• What do you want attendees to do after?
• Which relationships are most valuable?
• What Deal Rooms might spawn?

**2. Use the Right Category**
Event category affects:
• Default ticket settings
• Suggested agenda structure
• Post-event automation templates

**3. Configure Ticket Tiers Strategically**
• **Early Bird** — Time-limited discounts drive urgency
• **VIP** — Premium access creates exclusivity
• **Standard** — Default option for most attendees
• **Free** — Lower barrier, but capture data

**4. Build Agenda Early**
For multi-session events:
• Sessions help attendees plan
• Speakers confirmed early build credibility
• Breaks and networking time matter

**5. Enable the Lobby**
The Network Lobby creates value even before the event:
• Attendees connect early
• Discussion threads start
• Networking anxiety reduced

**6. Anchor Everything**
Use XODIAK anchoring for:
• VIP attendee verification
• Sponsorship agreement proof
• Outcome-based payments

**7. Follow Up Fast**
The 48-hour window after events is critical:
• Send thank-you messages
• Share recordings/materials
• Propose next steps
• Spawn Deal Rooms while momentum is high

**8. Measure and Iterate**
Track metrics across events:
• Registration-to-attendance rate
• Deal Rooms spawned per event
• Revenue attributed to events
• Network growth from attendees`
      }
    ]
  },

  "invitation-system": {
    title: "Invitation & Onboarding System",
    subtitle: "Red Carpet Experiences for High-Value Prospects",
    version: 1,
    sections: [
      {
        title: "What is the Invitation System?",
        content: `The Invitation System provides a sophisticated onboarding experience that goes beyond simple email invites. It enables "Red Carpet" experiences where new users are guided directly to relevant assets, with full attribution tracking and relationship anchoring.

**Core Capabilities:**
• **Standard Invitations** — Basic platform access invites with role assignment
• **Asset-Linked Invitations** — Invites that redirect to specific proposals or deal rooms
• **Facilitator Attribution** — Track who introduced whom for business attribution
• **XODIAK Anchoring** — Cryptographic proof of introductions and asset shares
• **Pre-Staged Permissions** — Configure user access before they even join

**Key Fields:**
• \`linked_proposal_id\` — Redirect to a specific proposal upon acceptance
• \`linked_deal_room_id\` — Add user to deal room and redirect there
• \`redirect_to\` — Custom path to send user after login
• \`from_contact_id\` — CRM contact who facilitated the introduction
• \`introduction_note\` — Context about why this connection was made`
      },
      {
        title: "Red Carpet Onboarding Flow",
        content: `**The Problem:**
High-value prospects deserve more than a generic "Welcome to the platform" experience. When you've been introduced to someone important, they should land directly on the relevant context.

**The Solution — Asset-Linked Invitations:**

**Example: Ryan Owen Invitation**
1. Mark Erogbogbo introduces Ryan Owen
2. Admin creates invitation with:
   • Linked proposal (the explainer deck Ryan should see)
   • Facilitator: Mark Erogbogbo (from CRM)
   • Introduction note: "Intro from Texas Star Alliance partnership"
3. Ryan receives invite email
4. Upon acceptance and login, Ryan is redirected to the proposal
5. XODIAK anchor is created proving:
   • Mark introduced Ryan
   • An asset was shared
   • Exact timestamp of the introduction

**Business Value:**
• **For Ryan** — Immediate relevant context, no confusion about what to do
• **For You** — Full attribution of who facilitated valuable relationships
• **For Mark** — Verifiable proof he made the introduction (for commission/credit)
• **For Legal** — Immutable record of when proprietary information was shared`
      },
      {
        title: "How It Works",
        content: `**Creating Asset-Linked Invitations:**

**Step 1: Configure the Invitation**
In User Management → Invitations:
• Enter recipient email and select role
• Toggle "Link to Asset" to expand options
• Choose: Link to Proposal OR Link to Deal Room
• Optionally set custom redirect path

**Step 2: Set Attribution**
• Select "Facilitator Contact" from CRM
• Add "Introduction Note" for context
• This creates the from_contact_id link

**Step 3: Send Invitation**
• Recipient receives standard invite email
• Token contains all linked information

**Step 4: Acceptance Flow**
When recipient accepts:
1. Account is created normally
2. If linked to Deal Room → Automatically added as participant
3. XODIAK anchor is created for the relationship event
4. User is redirected to linked asset instead of dashboard

**Automatic XODIAK Anchoring:**
Upon acceptance, the system creates a relationship anchor with:
• \`anchor_type\`: 'asset_share' or 'introduction'
• \`source_contact_id\`: The facilitator (e.g., Mark)
• \`target_contact_id\`: The new user's CRM record
• \`linked_proposal_id\` or \`linked_deal_room_id\`
• Full metadata for audit trail`
      },
      {
        title: "Best Practices",
        content: `**1. Always Track Facilitators**
When someone introduces you to a prospect, record it:
• Creates attribution trail for commissions
• Protects relationship IP
• Enables proper crediting

**2. Link to Relevant Assets**
Don't just invite to the platform:
• Link to the specific proposal discussed
• Link to the deal room where collaboration will happen
• Custom redirect to relevant page

**3. Write Introduction Notes**
Future you will thank past you:
• "Met at World Cup planning meeting"
• "Referred by Jason from OptimoIT"
• "Interested in xSTAYx property management"

**4. Review XODIAK Anchors**
After high-value invitations:
• Verify the anchor was created
• Check all parties are correctly linked
• Export for legal documentation if needed

**5. Pre-Stage Permissions**
For invited deal room participants:
• Configure their visibility settings before they join
• Set up their role and access level
• Prepare any deliverables assigned to them`
      }
    ]
  },

  "xodiak-relationship-anchoring": {
    title: "XODIAK Relationship Anchoring",
    subtitle: "Cryptographic Proof of Professional Connections and Idea Disclosure",
    version: 1,
    sections: [
      {
        title: "What is Relationship Anchoring?",
        content: `XODIAK Relationship Anchoring provides cryptographic proof of the origin of professional connections, idea disclosures, and asset shares. It creates an immutable ledger of "who introduced whom" and "who shared what with whom."

**Core Concept:**
Every significant relationship event is anchored to the XODIAK blockchain:
• **Introductions** — Person A introduced Person B to Person C
• **Asset Shares** — Person A shared a proposal/document with Person B
• **Meetings** — Record of when parties met and discussed business
• **Idea Disclosures** — When proprietary information was first shared

**The Database Table — \`xodiak_relationship_anchors\`:**
• \`anchor_type\` — introduction, asset_share, meeting, idea_disclosure
• \`source_contact_id\` — Who initiated the relationship event
• \`target_contact_id\` — Who received the introduction/asset
• \`facilitator_contact_id\` — Third party who made the connection
• \`linked_deal_room_id\` — Associated deal room (if any)
• \`linked_proposal_id\` — Associated proposal (if any)
• \`description\` — Human-readable description of the event
• \`metadata\` — Additional structured data
• \`xodiak_tx_hash\` — Blockchain transaction reference
• \`xodiak_status\` — pending, anchored, failed`
      },
      {
        title: "Why Does This Exist?",
        content: `**The Trust Problem in Business Development:**

Business relationships often break down over disputes about:
1. "I introduced you to that client!"
2. "That was my idea you shared!"
3. "We discussed this partnership months ago!"
4. "You used our proprietary strategy!"

Without proof, these become "he said, she said" disputes that damage relationships and lead to legal conflicts.

**The XODIAK Solution:**

Relationship anchoring creates irrefutable proof:
• **Timestamped** — Exact moment the event occurred
• **Immutable** — Cannot be altered after the fact
• **Attributed** — All parties clearly identified
• **Verifiable** — Anyone can verify the anchor on-chain

**Use Cases:**

**1. Commission Attribution**
Mark introduces Ryan to a deal. Six months later, Ryan closes a $1M transaction. The XODIAK anchor proves Mark deserves his referral commission.

**2. IP Protection**
You share a proprietary business strategy with a potential partner. The anchor proves exactly when and what was disclosed—critical if they later claim it as their own idea.

**3. Partnership Disputes**
When a collaboration goes sour, anchors provide objective timeline of who contributed what and when.

**4. Regulatory Compliance**
For industries requiring audit trails of business relationships (finance, real estate), anchors provide compliance-ready documentation.`
      },
      {
        title: "How It Works",
        content: `**Automatic Anchoring:**

Relationship anchors are created automatically when:
• Asset-linked invitations are accepted
• Deal room participants agree to terms
• Proposals are shared with new recipients
• Key milestones are reached in deal rooms

**Manual Anchoring:**

You can also create anchors manually:
1. Navigate to a contact detail page or deal room
2. Find the "XODIAK Relationship Ledger" section
3. Click "Create Anchor" (if available)
4. Select anchor type and fill in details
5. Submit for blockchain anchoring

**Viewing Anchors:**

**Contact Detail Page:**
Each CRM contact shows their relationship anchors:
• All introductions involving this person
• Assets shared with/by this person
• Meetings and disclosures recorded

**Deal Room XODIAK Anchors Tab:**
Shows all relationship anchors linked to the deal:
• Who was introduced through this deal
• What assets were shared
• Meeting and disclosure history

**The Anchoring Process:**
1. Event is recorded in \`xodiak_relationship_anchors\`
2. Status is set to 'pending'
3. Batch job collects pending anchors
4. Merkle tree is constructed
5. Root hash is anchored to XODIAK chain
6. Transaction hash is recorded
7. Status updated to 'anchored'`
      },
      {
        title: "Best Practices",
        content: `**1. Anchor Significant Introductions**
Not every meeting needs an anchor, but record:
• High-value client introductions
• Partner referrals with commission implications
• Strategic relationship connections

**2. Always Set Facilitators**
When creating invitations or recording intros:
• Identify who made the connection
• This protects their attribution rights
• Enables proper commission tracking

**3. Link to Assets When Relevant**
Anchors are more valuable when connected to:
• The proposal that was shared
• The deal room where collaboration happens
• Specific documents or IP disclosed

**4. Write Clear Descriptions**
Future auditors will thank you:
• "Mark introduced Ryan for World Cup hosting partnership"
• "Shared Explainer Deck v2 with potential investor"
• "Initial meeting to discuss xSTAYx property management"

**5. Review Anchor Status**
Regularly check that anchors are properly recorded:
• 'pending' = Awaiting batch processing
• 'anchored' = Successfully on blockchain
• 'failed' = Requires investigation

**6. Export for Legal**
When needed for legal purposes:
• Copy transaction hashes
• Export anchor details
• Provide verification instructions`
      }
    ]
  },

  eros: {
    title: "Emergency Response Operating System (EROS)",
    subtitle: "Real-Time Crisis Coordination and Responder Deployment",
    version: 1,
    sections: [
      {
        title: "What is EROS?",
        content: `EROS (Emergency Response Operating System) is a first-class module for real-time crisis coordination and responder deployment. It provides the situational awareness and command-and-control capabilities needed for emergency response operations.

**Core Components:**
• **EROS Dashboard** (/eros) — Central command view with active incidents, severity indicators, and responder status
• **Incident Command Center** (/eros/incidents/:id) — Detailed incident management with situation reports, resource tracking, and communication logs
• **Responder Profile** (/eros/profile) — Manage skills, certifications, equipment, and availability status
• **Deployment Tracking** — Real-time tracking of responder assignments and status

**Key Capabilities:**
• Location-aware incident intake with severity ranking (Critical, High, Medium, Low)
• Multi-tier availability status (Available, On Call, Deployed, Unavailable)
• Communication logs across multiple channels (App, SMS, Radio, Satellite)
• XODIAK anchoring for audit trails and compliance verification`
      },
      {
        title: "Why Does This Exist?",
        content: `**The Problem We Solve:**
Emergency response is often fragmented—incidents are tracked in spreadsheets, responder availability is unknown, and there's no unified command structure. This leads to:
• Delayed response times
• Unclear resource allocation
• Lost communication history
• Compliance documentation gaps

**Our Approach:**
EROS treats emergency response as a structured, data-driven operation:
1. **Unified Command** — Single dashboard for all active incidents
2. **Skill-Based Deployment** — Match responders to incidents based on certifications and skills
3. **Real-Time Coordination** — Communication logs and status updates visible to all stakeholders
4. **Audit Trail** — Every action logged for compliance and after-action review`
      },
      {
        title: "Trading Command Integration",
        content: `**Downtime Engagement:**
EROS integrates with Trading Command to provide productive activity during downtime periods between emergency deployments.

**How It Works:**
1. EROS responders can opt into Trading Command
2. When not actively deployed, downtime is automatically detected
3. Trading education and market analysis are served during off-duty periods
4. Simple trades can be executed from mobile devices
5. All trading activity syncs to the user's Personal Corporation P&L

**Benefits:**
• **Productive Use of Waiting Time** — Study markets and execute trades during off-duty periods
• **Skill Development** — Build capital literacy as a secondary competency
• **Income Diversification** — Reduce dependence on active service income
• **Mental Discipline Transfer** — Trading rules reinforce the discipline used in emergency response

The EROS-Trading integration tab in Trading Command (/trading-command) shows deployment history, between-deployment trading activity, and correlation between response cycles and trading performance.`
      },
      {
        title: "Best Practices",
        content: `**1. Keep Responder Profile Current**
Skills, certifications, and availability should be updated regularly for accurate deployment matching.

**2. Use Severity Levels Correctly**
• **Critical** — Life-threatening, immediate response required
• **High** — Urgent, response within hours
• **Medium** — Important but not urgent
• **Low** — Routine or informational

**3. Log All Communications**
Every significant communication should be logged for audit trail and after-action review.

**4. Verify Equipment Status**
Regular equipment checks ensure responders can be deployed immediately when needed.

**5. Review After-Action Reports**
Every incident should have a documented review to capture lessons learned.

**6. Leverage Downtime**
Use between-deployment periods productively through Trading Command integration.`
      }
    ]
  },
  
  tradingCommand: {
    title: "Trading Command & Capital Training",
    subtitle: "A Disciplined Economic Engine for Rules-Based Wealth Building",
    version: 2,
    sections: [
      {
        title: "What is Trading Command?",
        content: `Trading Command is a disciplined economic engine designed to teach rules-based stock trading as a mission-based skill. It serves as a capital literacy bridge between earned income (from EROS, workforce roles, or projects) and capital outcomes (asset investment, company ownership).

**Core Philosophy:**
Rather than gambling or speculation, Trading Command treats trading as a learnable discipline with clear rules of engagement, risk management protocols, and after-action reviews.

**Key Components:**
• **Trading Education Layer** — Structured curriculum with 'Rules of Engagement' playbooks focused on risk management
• **Simulation Environment** — Practice trading without real capital to learn patterns and discipline
• **Live Trading Transition** — Performance-based graduation from simulation to real markets
• **Performance Dashboard** — After-action review (AAR) style feedback on every trade
• **Capital Allocation** — Optional routing of profits into long-term investments or ecosystem companies

The system adapts terminology to the user's archetype (e.g., 'Trades' become 'Missions' for military/first-responder archetypes).`
      },
      {
        title: "Why Does This Exist?",
        content: `**The Problem We Solve:**
Most people have no structured path from earning wages to building wealth. Trading is often presented as:
• A get-rich-quick scheme
• Too complex for regular people
• Pure gambling with extra steps

**Our Approach:**
Trading Command treats capital markets as a skill domain, like any other profession:
1. **Structured Learning** — Clear curriculum from basics to advanced strategies
2. **Rules-Based Decisions** — Every trade has pre-defined entry, exit, and risk parameters
3. **Emotional Discipline** — Training to follow rules regardless of market psychology
4. **Performance Metrics** — Objective measurement of skill development over time

**Integration with Human Operating System:**
Trading Command connects to:
• **EROS** — Downtime engagement for responders between missions
• **Workforce Continuum** — Skill development for professional traders
• **Capital Formation** — Profits flow into long-term equity positions
• **Personal Corporation** — Trading P&L appears on personal financial statements`
      },
      {
        title: "How It Works",
        content: `**Education Pathway:**
1. Complete foundational modules on market mechanics
2. Learn risk management rules (position sizing, stop losses)
3. Study pattern recognition and technical analysis
4. Practice in simulation with paper money
5. Graduate to live trading with small positions
6. Scale based on demonstrated competence

**Rules of Engagement:**
Every trade follows a structured protocol:
• **Pre-Trade Analysis** — Document thesis, entry criteria, risk/reward ratio
• **Position Sizing** — Never risk more than X% of portfolio on single trade
• **Entry Execution** — Execute only when all criteria are met
• **Risk Management** — Stop-loss orders always in place
• **Exit Strategy** — Pre-defined profit targets and time limits
• **After-Action Review** — Document what happened and lessons learned

**Performance Tracking:**
• Win rate percentage
• Average risk/reward achieved
• Rule adherence score
• Emotional discipline metrics
• Cumulative P&L and drawdown history`
      },
      {
        title: "EROS Integration",
        content: `**Downtime Engagement:**
Emergency responders experience unpredictable schedules with periods of intense activity followed by downtime. Trading Command provides:

• **Productive Use of Waiting Time** — Study markets and execute trades during off-duty periods
• **Skill Development** — Build capital literacy as a secondary competency
• **Income Diversification** — Reduce dependence on active service income
• **Mental Discipline Transfer** — Trading rules reinforce the discipline used in emergency response

**How It Works:**
1. EROS responders can opt into Trading Command
2. Downtime periods are automatically detected
3. Educational content and market analysis are served
4. Simple trades can be executed from mobile
5. All activity syncs to the user's Personal Corporation P&L`
      },
      {
        title: "Best Practices",
        content: `**1. Start with Education**
Never trade real money until completing foundational modules and demonstrating simulation proficiency.

**2. Follow the Rules**
The Rules of Engagement exist for a reason. Deviating from them leads to gambling, not trading.

**3. Size Positions Appropriately**
Risk management is more important than finding winners. Protect capital first.

**4. Review Every Trade**
After-action reviews are mandatory. Learning from mistakes is how skill develops.

**5. Connect to Long-Term Goals**
Trading profits should flow into Capital Formation for permanent wealth building, not consumption.

**6. Stay Within Your Skill Level**
The system tracks your demonstrated competence. Don't trade strategies you haven't mastered.`
      }
    ]
  },
  
  tradingExecution: {
    title: "Discipline Over Dopamine — Trading Execution",
    subtitle: "Mission-Based Execution with Automated Guardrails",
    version: 1,
    sections: [
      {
        title: "What is the Execution System?",
        content: `The Trading Execution System (/trading-command/execute) enforces strict discipline through automated guardrails. Key components: Pre-Flight Checklist, Live Candlestick Chart with ORB overlays, Signal Alert Panel with VPA detection, Risk Calculator enforcing 2% max risk, and Circuit Breaker (2 losses = 24h lockout).`
      },
      {
        title: "ORB Methodology",
        content: `**Key Levels:** PM High/Low (pre-market), ORB High/Low (09:30-09:45 EST), Midline (50% retracement). **Rules:** No trading during opening range, enter on candle close breakouts, stop at opposite ORB level (max $0.60), exit 75% at 1.5R, move stop to breakeven for runners.`
      },
      {
        title: "Signal Detection",
        content: `Three conditions must pass: (A) Candle close above/below ORB, (B) Volume > 3-candle average with no VPA anomaly, (C) Stop distance ≤ $0.60. VPA anomalies (price rising on falling volume) trigger DO NOT TRADE warnings.`
      },
      {
        title: "Circuit Breaker",
        content: `2 losses in a day = 24-hour mandatory lockout. Cannot be overridden. Prevents revenge trading and protects capital during poor performance. After lockout, access restored and new pre-flight required.`
      }
    ]
  },
  
  workforceContinuum: {
    title: "Workforce Continuum Layer",
    subtitle: "Multi-Role Human Deployment and Professional Evolution",
    version: 1,
    sections: [
      {
        title: "What is the Workforce Continuum?",
        content: `The Workforce Continuum transforms the platform into a multi-role human deployment engine. It manages how individuals engage with work across different contexts—from hourly gigs to equity partnerships.

**Core Concepts:**
• **Engagements** — Active work relationships with defined terms (hourly, project, equity-swap)
• **Time Entries** — Verified labor tracking with approval workflows
• **Role Transitions** — Logged changes in professional identity and responsibilities
• **Opportunities** — Available positions and projects matched to user profiles

**Integration with Personal Corporation:**
All workforce activity flows directly into the user's personal financial statement:
• Hourly work → Service Revenue
• Project completions → Project Income
• Equity swaps → Deferred Compensation / Equity Assets`
      },
      {
        title: "Why Does This Exist?",
        content: `**The Problem We Solve:**
Modern work is fragmented across multiple platforms, employers, and engagement types. Workers struggle to:
• Track earnings across different relationships
• Transition between employee and entrepreneur mindsets
• Convert labor into ownership stakes
• Document their professional evolution

**Our Approach:**
The Workforce Continuum treats every user as a 'Personal Corporation' that deploys its primary asset (human capital) across various engagements:
1. **Unified Work History** — All engagements in one place
2. **Time as Currency** — Verified hours can convert to payments or equity
3. **Role Progression** — Clear paths from worker to owner
4. **Skill Recognition** — Demonstrated competencies unlock new opportunities`
      },
      {
        title: "Engagement Types",
        content: `**Hourly Engagements:**
Traditional time-for-money arrangements:
• Track hours worked
• Specify hourly rate
• Generate invoices automatically
• Connect to client billing

**Project Engagements:**
Fixed-scope work with defined deliverables:
• Clear project scope and timeline
• Milestone-based payments
• Completion verification
• Portfolio documentation

**Equity-Swap Engagements:**
Labor exchanged for ownership stakes:
• Work contributed to a venture
• Hours convert to equity percentage
• Vesting schedules apply
• Flows into Capital Formation module

**Retainer Engagements:**
Ongoing availability agreements:
• Monthly retainer amount
• Expected availability hours
• Priority access for clients
• Recurring billing`
      },
      {
        title: "Role Transitions",
        content: `**Tracking Professional Evolution:**
The platform logs every significant role change:
• **From Role** — Previous professional identity
• **To Role** — New professional identity
• **Transition Type** — Progression, pivot, or parallel addition
• **Trigger Source** — What initiated the change (training, opportunity, choice)

**Example Transitions:**
• EROS Responder → EROS Team Lead (progression)
• Junior Developer → Product Manager (pivot)
• Consultant → Consultant + Investor (parallel addition)
• Employee → Business Owner (entrepreneur transition)

**Why This Matters:**
• Creates documented career narrative
• Identifies patterns in successful transitions
• Enables AI-powered career recommendations
• Builds reputation across the ecosystem`
      },
      {
        title: "Best Practices",
        content: `**1. Log All Engagements**
Even informal work relationships should be tracked for complete financial picture.

**2. Track Time Accurately**
Time entries are the foundation of billing and equity calculations. Accuracy matters.

**3. Document Role Changes**
When your professional identity evolves, log the transition. It's your career story.

**4. Connect to Equity**
When possible, negotiate equity-swap arrangements to build ownership alongside income.

**5. Review Your P&L**
Regularly check how workforce activity flows into your Personal Corporation financials.

**6. Explore Opportunities**
The system matches you to opportunities based on demonstrated skills. Stay engaged.`
      }
    ]
  },
  
  capitalFormation: {
    title: "Capital Formation & Ownership",
    subtitle: "From Earned Income to Durable Wealth",
    version: 1,
    sections: [
      {
        title: "What is Capital Formation?",
        content: `Capital Formation manages the transition from earned income to asset ownership. It's the final stage of the Human + Capital lifecycle, where labor and trading profits convert into permanent equity positions.

**Core Components:**
• **Equity Stakes** — Ownership positions in various entities (businesses, funds, real estate)
• **Capital Investments** — Transaction records of capital deployed
• **Ownership Events** — Dividends, distributions, exits, and governance activities
• **Portfolio Summary** — Real-time view of all ownership positions and valuations

**Entity Types Supported:**
• Spawned Businesses (created through the platform)
• External Companies (outside investments)
• Deal Room Outcomes (equity from collaborations)
• Funds (LP/GP positions)
• Real Estate Holdings`
      },
      {
        title: "Why Does This Exist?",
        content: `**The Problem We Solve:**
Most wealth-building advice focuses on either:
• Saving money (too slow for meaningful impact)
• High-risk speculation (often leads to losses)

The missing piece is a structured system for converting earned income into productive assets.

**Our Approach:**
Capital Formation creates a clear pathway:
1. **Earn** — Generate income through workforce engagements
2. **Trade** — Grow capital through rules-based trading
3. **Invest** — Deploy capital into equity positions
4. **Own** — Build portfolio of productive assets
5. **Compound** — Reinvest returns into more assets

**Integration Points:**
• **Trading Command** — Profits flow into investment capital
• **Workforce Continuum** — Equity-swap engagements create ownership
• **Deal Rooms** — Collaboration outcomes may include equity grants
• **Personal Corporation** — All positions appear on balance sheet`
      },
      {
        title: "Equity Stake Management",
        content: `**Stake Types:**
• **Equity** — Direct ownership shares
• **Options** — Right to purchase shares at set price
• **Warrants** — Long-dated options, often from deals
• **Convertible Notes** — Debt that may convert to equity
• **Profit Share** — Percentage of profits without ownership

**Key Fields:**
• **Entity Name** — What you own
• **Ownership Percentage** — Your share of the entity
• **Cost Basis** — What you paid for the position
• **Current Valuation** — What it's worth now
• **Vesting Schedule** — When ownership becomes permanent
• **Status** — Active, Vesting, Fully Vested, or Exited

**XODIAK Anchoring:**
Significant equity stakes can be anchored to XODIAK for:
• Immutable proof of ownership terms
• Transparent attribution for collaborators
• Auditable transaction history`
      },
      {
        title: "Investment Tracking",
        content: `**Capital Investments Table:**
Every capital deployment is logged:
• **Investment Type** — Initial, follow-on, exercise, etc.
• **Amount** — Capital deployed
• **Share Price** — Price per share at investment
• **Shares Acquired** — Number of shares received
• **Transaction Date** — When investment was made
• **Instrument** — Type of security purchased

**Common Investment Flows:**
1. Trading profits → Cash reserve → Equity investment
2. Workforce earnings → Capital allocation → Fund position
3. Deal room outcome → Equity grant → Portfolio addition

**Reporting:**
• Total capital deployed by period
• Investment concentration by entity type
• Return on invested capital (ROIC)`
      },
      {
        title: "Ownership Events",
        content: `**Event Types:**
• **Dividend** — Cash distribution from profits
• **Distribution** — Return of capital
• **Stock Split** — Share count adjustments
• **Exit** — Full or partial sale of position
• **Governance** — Voting or board participation

**Tracking Importance:**
Ownership events represent the 'return on capital':
• Dividends prove the investment generates cash
• Exits realize gains (or losses)
• Governance events show active ownership engagement

**Automatic Logging:**
When possible, ownership events are logged automatically:
• Deal room milestones trigger event records
• Spawned business dividends are tracked
• External events can be manually recorded`
      },
      {
        title: "Best Practices",
        content: `**1. Track Everything**
Every equity position should be logged, even informal arrangements.

**2. Update Valuations Regularly**
Current valuations should reflect best estimates, not historical costs.

**3. Monitor Vesting**
Know when ownership becomes permanent. Vesting schedules matter.

**4. Record Ownership Events**
Dividends, distributions, and exits should be logged as they occur.

**5. Connect to Source**
Link equity stakes to their origin (deal room, workforce engagement, etc.).

**6. Anchor Significant Stakes**
Use XODIAK anchoring for positions that may need verification later.

**7. Review Portfolio Summary**
Regularly assess portfolio concentration and performance.`
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
