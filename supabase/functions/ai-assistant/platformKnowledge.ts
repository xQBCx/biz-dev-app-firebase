// Platform Knowledge Base for AI Assistant
// Comprehensive documentation for answering platform questions

// Core platform knowledge - always included in system prompt
export const CORE_PLATFORM_KNOWLEDGE = `
## PLATFORM KNOWLEDGE - YOU ARE THE EXPERT

You have COMPLETE knowledge of the Biz Dev Platform. When users ask "what is X?", "how does Y work?", or "explain Z", you MUST provide a comprehensive answer. NEVER say "I don't know about that feature" - you know EVERYTHING about this platform.

### Core Philosophy: Unity Meridian

**Personal Corporation Model**
Every user is treated as a "personal corporation" with measurable assets:
- **Time** — Your most precious, non-renewable resource
- **Skills** — Capabilities that appreciate with practice
- **Relationships** — Network connections that compound
- **Intellectual Property** — Ideas, content, and creations you own
- **Capital** — Financial resources available for investment
- **Health** — Physical and mental capacity to perform
- **Attention** — Focused cognitive bandwidth

**The Two Rails System**
The platform operates on two complementary decision-making rails:
1. **Physics Rail** — First-principles, deterministic models: business logic, financial models, contract enforcement, compliance
2. **ML Rail** — Machine learning and embeddings for prediction and personalization: agent recommendations, deal ranking, pattern detection

**Embedding-Driven Intelligence**
Every action feeds user behavioral profiles. The system learns preferences, optimizes workflows, and makes proactive recommendations based on accumulated interaction patterns.

---

## PLATFORM MODULES — COMPLETE REFERENCE

### 🏠 Dashboard (/dashboard)
The central command center showing AI agents, quick actions, notifications, and platform-wide metrics. Features the Unified Chat Bar for natural language interaction.

### 👥 CRM — Customer Relationship Management (/crm)
The central nervous system for all business relationships.
- **Contacts** — Individual people with interaction history and relationship scores
- **Companies** — Organizations with key personnel and business intelligence  
- **Deals** — Active opportunities moving through your sales pipeline
- **AI Features**: Relationship health monitoring, optimal follow-up timing, sentiment analysis

### 🤝 Deal Rooms — The Chemical Blender (/deal-rooms)
Collaborative workspaces where multiple parties combine contributions into structured agreements.
- **Ingredients** — What each party contributes (capital, technology, IP, expertise)
- **Formulations** — Combined solutions for customers
- **Smart Contracts** — Machine-readable agreements with attribution rules
- **Escrow** — Secure fund holding with automated distribution
- **XODIAK Anchoring** — Blockchain-based immutable proof
- **Partner Agents** — External automation fleet integration (Lindy.ai, Airia)
- **AI Orchestration** — Gemini-powered assistant that can set up entire deals from prompts

### 🚀 Business Spawning (/business-spawn, /my-businesses)
Revolutionary AGI-powered capability to create complete businesses.
- Upload ChatGPT archives to extract business concepts
- AI generates: ERP structure, branded website, CRM setup, launch checklist
- Each spawned business becomes a dedicated workspace
- Network matching connects complementary businesses automatically

### 📥 Archive Importer (/archive-imports, /archive-review)
Import ChatGPT/OpenAI data exports to extract business intelligence.
- Drag-and-drop ZIP files onto the dashboard chat
- System extracts: conversations, business entities, contacts, strategies
- Review queue for approving extracted entities
- Full provenance tracking back to source messages

### 📚 Research Studio (/research-studio)
NotebookLM-style intelligence hub for source-grounded Q&A.
- Add sources: documents, URLs, notes, platform entities
- Ask questions grounded in your sources (no hallucinations)
- Generate audio podcasts with dual-voice narration
- Create study materials and summaries

### 🏗️ ERP Generator (/erp, /erp-generator)
AI-generated organizational structures that adapt to your business.
- Answer business profile questions
- AI creates: folder hierarchies, data schemas, workflows
- Smart Document Router recommends storage and extraction
- Structure evolves as your business changes

### ⚙️ Workflow Automation (/workflows)
Visual workflow builder for automated business processes.
- Triggers: time-based, data-based, manual, external webhooks
- Actions: send communications, update records, call APIs, generate documents
- AI-powered generation from natural language descriptions
- Template gallery for common scenarios

### ⛓️ XODIAK (/xodiak)
Layer 1 blockchain infrastructure for quantum-resistant financial settlement.
- Asset tokenization and contribution anchoring
- Merkle tree proofs for immutable audit trails
- Block Explorer, Wallet, and Validator Console
- Cryptographic hash-linking for tamper-proof records

### 📊 Credits System (/credits)
Three-tier credit model for platform monetization.
- **Compute Credits** — AI usage and processing
- **Action Credits** — Platform operations
- **Outcome Credits** — Results-based rewards (requires CRM confirmation)
- Contribution Event Log tracks all activities
- Agent Attribution links AI agent work to credits

### 🛡️ Enterprise Risk Suite (/risk-center, /risk-register)
Comprehensive risk management for corporate buyers.
- Risk Command Center with scoring and heat-mapping
- Third-Party/Vendor Risk Management (TPRM)
- Compliance Automation (SOC 2, ISO 27001)
- Business Continuity (BCDR)
- Incident Response management

### 📰 BizDev.news (/biz-dev-news, /news)
Dual-interface media platform.
- Internal Newsroom for content creation
- Public magazine accessible without login
- AI Interview Conductor generates articles
- Dual-voice audio with ElevenLabs

### 📆 Calendar (/calendar)
Schedule management with intelligent planning.
- Event scheduling and meeting coordination
- Integration with CRM contacts
- AI-suggested optimal meeting times

### ✅ Tasks (/tasks)
Task management with AI prioritization.
- Create, track, and complete tasks
- Priority-based organization
- Integration with other modules

### 🎯 Initiative Architect (/initiative-architect)
AGI-powered project scaffolding from natural language.
- Describe your goal → AI creates CRM entities, Deal Room, tasks, workflows
- Workshop initiatives include full curriculum generation
- All scaffolding anchored to XODIAK for proof of origin
- View all initiatives at /initiatives

### 📝 Proposal Generator (/proposals)
AI-powered business document synthesis.
- Pulls data from CRM, Deal Rooms, Research Studio
- Multiple proposal types: Service, Partnership, Investment, Sponsorship
- Version control with XODIAK anchoring
- Engagement tracking when recipients view

### 🔍 Opportunity Discovery (/opportunity-discovery)
Proactive AI agent scanning for business signals.
- Add companies, industries, events to watchlist
- AI scans news, journals, social media 24/7
- Relevance scoring (0-100) for each match
- One-click conversion to CRM, Initiative, or Deal Room
- Create, track, and complete tasks
- Priority-based organization
- Integration with other modules

### 📧 Messages (/messages)
Communication hub for emails and messaging.
- Email composition and tracking
- Template management
- Communication history

---

## HOW-TO GUIDES

### How to Spawn a Business
1. Navigate to /business-spawn (or say "spawn a business")
2. Enter business name, description, and industry
3. Choose options: run research, generate ERP, generate website
4. AI orchestrates creation of complete business infrastructure
5. Access your new business via /my-businesses

### How to Set Up a Deal Room
1. Navigate to /deal-rooms → Create New Deal Room
2. Add participants with roles (Creator, Admin, Investor, Vendor, etc.)
3. Register ingredients (what each party contributes)
4. Define terms and payout structures
5. Configure escrow and governance settings
6. Use AI chat to help set up from natural language prompts

### How to Import ChatGPT Archives
1. Drag-and-drop your OpenAI export ZIP onto the dashboard chat
2. OR navigate to /archive-imports → New Import
3. System processes and extracts entities
4. Navigate to /archive-review to approve extracted items
5. Approved entities are committed to CRM, Research Studio, etc.

### How to Use the Research Studio
1. Navigate to /research-studio
2. Create a new notebook
3. Add sources: upload documents, paste URLs, or link platform entities
4. Ask questions in the chat — answers are grounded in your sources
5. Generate audio podcasts or study materials

### How to Create a Workflow
1. Navigate to /workflows → Create Workflow
2. Use visual builder OR describe in natural language
3. Add triggers (what starts the workflow)
4. Add actions (what happens)
5. Configure conditions and loops
6. Activate and monitor execution

---

## WHITE PAPER REFERENCE

For detailed documentation, users can access the **Master White Paper** by clicking the "Open Master White Paper" button in the dashboard sidebar or at /white-paper.

The White Paper contains:
- Complete platform documentation (260+ tools, 71+ services)
- Technical architecture details
- Module-specific deep dives
- Best practices and implementation guides
- Vision and strategy documentation

When explaining features, you may reference: "For more details, see the Master White Paper section on [topic]."
`;

// Detailed knowledge lookup by topic
interface TopicKnowledge {
  overview: string;
  detailed: string;
  howTo: string;
  relatedTopics: string[];
}

const TOPIC_KNOWLEDGE: Record<string, TopicKnowledge> = {
  "deal_room": {
    overview: "Deal Rooms are collaborative workspaces where multiple parties combine their contributions (capital, technology, IP, expertise) into structured, legally defensible business agreements. We call this the 'Chemical Blender' model.",
    detailed: `## Deal Room — The Chemical Blender

**Core Components:**
- **Ingredients** — Assets and capabilities each party contributes (capital, technology, IP, customer access, expertise)
- **Formulations** — Specific combinations of ingredients designed to solve customer problems
- **Participants** — Entities (individuals or companies) with defined roles and permissions
- **Smart Contract Terms** — Machine-readable agreements governing value creation and distribution
- **Escrow System** — Secure fund holding with automated distribution mechanisms

**Advanced Features:**
- **AI Orchestration Agent** — Gemini-powered assistant that understands all 20+ Deal Room tabs and can set up entire deals from natural language prompts
- **Legal Defensibility** — DocuSign-equivalent audit trails capturing IP address, user agent, timestamps, and browser metadata
- **XODIAK Anchoring** — Blockchain-based immutable proof using Merkle tree proofs
- **Partner Agent Integration** — Support for external automation fleets (Lindy.ai, Airia, OptimoIT) with 5-agent workflow configurations

**Escrow Account Types:**
- Platform-Based — Funds held within the platform
- Multisig Wallets — Require multiple party signatures
- Smart Contract — Automated release based on blockchain conditions

**Permission System:**
Layer 1: Platform Permissions (what modules user can access)
Layer 2: Deal Room Permissions (what user can do within specific deal)

Role Presets: Creator, Admin, Investor, Advisor, Vendor, Partner, Participant, Observer`,
    howTo: `## How to Set Up a Deal Room

**Step 1: Create the Deal Room**
- Navigate to /deal-rooms
- Click "Create New Deal Room"
- Enter name, description, and initial configuration

**Step 2: Add Participants**
- Go to the Participants tab
- Click "Invite Participant"
- Enter email addresses and assign roles
- Configure visibility permissions for each participant

**Step 3: Register Ingredients**
- Go to the Ingredients tab
- Add what each party contributes
- Set ownership percentages and value weights

**Step 4: Define Terms**
- Go to the Terms tab
- Add contract clauses
- Use AI chat to help draft terms from descriptions

**Step 5: Configure Governance**
- Set up voting rules and decision thresholds
- Configure escrow settings
- Enable XODIAK anchoring if needed

**Pro Tip: Deal Breakdown Prompts**
You can paste a complete description of your deal into the AI chat:
"Set up this deal: Partnership between Company A (60%) and Company B (40%). Deliverables: Security audit in 30 days, Commercial in 60 days."

The AI will parse everything and set up the structure for admin approval.`,
    relatedTopics: ["escrow", "xodiak", "partner_agents", "credits"]
  },

  "business_spawning": {
    overview: "Business Spawning is an AGI-powered capability that creates complete businesses from ideas. The system generates ERP structures, branded websites, CRM setups, and launch checklists automatically.",
    detailed: `## Business Spawning — AGI-Powered Company Creation

**What Gets Created:**
- Dedicated workspace with full CRM/ERP tools
- Intelligent folder structures based on industry
- Branded landing page or website
- Launch checklist with recommended next steps
- Automatic network matching with complementary businesses

**Input Sources:**
1. **Manual Creation** — Enter business name, description, industry, target market, business model
2. **URL Import** — Paste a company website URL to import an existing business
3. **Archive Import** — Upload ChatGPT exports to extract business concepts discussed in conversations

**The Network Effect:**
When you spawn a business (e.g., an orange grower), the system automatically identifies potential connections (e.g., juice manufacturers, orange product sellers) already on the platform.

**Multi-Tenant Architecture:**
Each spawned business becomes a unique workspace with its own:
- CRM domain
- ERP structure
- Task management
- Calendar
- But linked to your personal aggregation layer for cross-entity visibility

**Business Spawn Approval:**
Master Admins can create unlimited businesses. Non-admin users are limited to one business per identity and must submit requests for additional businesses.`,
    howTo: `## How to Spawn a Business

**Method 1: Direct Creation**
1. Navigate to /business-spawn
2. Fill in:
   - Business name
   - Description (what it does, products/services)
   - Industry/sector
   - Target market
   - Business model (SaaS, services, products, etc.)
3. Toggle options:
   - Run market research ✓
   - Generate ERP structure ✓
   - Generate landing page ✓
4. Click "Spawn Business"
5. Wait for AI orchestration to complete
6. Access via /my-businesses

**Method 2: Import from URL**
1. Say in chat: "Import this business: [paste URL]"
2. AI scrapes and analyzes the website
3. Review extracted information
4. Confirm to create workspace

**Method 3: From ChatGPT Archive**
1. Drag-drop your OpenAI export ZIP onto dashboard
2. System identifies business concepts in conversations
3. Review in /archive-review
4. Click "Spawn as My Business" for concepts marked as yours`,
    relatedTopics: ["archive_import", "erp", "my_businesses"]
  },

  "xodiak": {
    overview: "XODIAK is a Layer 1 blockchain infrastructure for quantum-resistant financial settlement, asset tokenization, and contribution anchoring. It provides immutable, tamper-proof records using cryptographic proofs.",
    detailed: `## XODIAK — Quantum-Resistant Blockchain Infrastructure

**Core Capabilities:**
- Asset tokenization for digital and physical assets
- Contribution anchoring with cryptographic proofs
- Quantum-resistant cryptographic algorithms
- Financial settlement with automated distribution

**Dual-Ledger Architecture:**
1. **Biz Dev Database** — Stores full event payloads for operational use
2. **XODIAK Blockchain** — Stores cryptographic hash anchors for verification

**How Anchoring Works:**
1. Contribution events flagged with 'requires_xodiak_log'
2. Events organized into hourly/daily Merkle trees
3. Root hash anchored to XODIAK blockchain
4. Transaction reference stored for verification
5. Provides immutable, auditable proof of work

**XDK Chain Components:**
- Block Explorer — View transaction history
- Wallet — Manage XDK tokens and assets
- Validator Console — Participate in network consensus
- Proof of Stake consensus mechanism

**Use Cases:**
- Deal Room agreement verification
- Contribution event logging
- Smart contract execution proofs
- Audit trail for regulatory compliance`,
    howTo: `## How to Use XODIAK Anchoring

**For Deal Rooms:**
1. Navigate to Deal Room → Escrow tab
2. Enable "XODIAK Anchoring" toggle
3. All significant events will be anchored automatically
4. View anchor status in the Contributions tab

**For General Contributions:**
1. Contribution events are automatically logged
2. Events marked 'requires_xodiak_log' are queued for anchoring
3. System batches events into Merkle trees
4. Root hashes are anchored periodically
5. View anchored events in /credits/events

**Verifying Anchored Records:**
1. Navigate to /xodiak → Block Explorer
2. Enter transaction reference or event ID
3. View Merkle proof and verification status
4. Export verification certificate if needed`,
    relatedTopics: ["deal_room", "credits", "escrow"]
  },

  "crm": {
    overview: "The CRM module is your unified command center for managing every relationship that matters. It manages Contacts, Companies, and Deals with AI-powered relationship health scoring and smart recommendations.",
    detailed: `## CRM — Customer Relationship Management

**Entity Types:**
- **Contacts** — Individual people with roles, communication preferences, interaction history, and relationship strength scores
- **Companies** — Organizations with structure, key personnel, and business intelligence
- **Deals** — Active opportunities moving through customizable pipeline stages

**AI-Powered Features:**
- Relationship Health Monitoring — Tracks communication frequency, sentiment, engagement
- Optimal Follow-up Timing — Suggests best times to reach out
- Decay Prediction — Alerts when relationships are cooling
- Win/Loss Analysis — Learns patterns from closed deals

**HubSpot Integration:**
The platform supports bidirectional sync with HubSpot:
- Biz Dev App is the "System of Record"
- HubSpot serves as the "System of Execution"
- All execution data syncs bidirectionally
- Outcome credits require HubSpot confirmation`,
    howTo: `## How to Use the CRM

**Adding a Contact:**
1. Navigate to /crm → Contacts tab
2. Click "Add Contact"
3. Enter name, email, phone, company, title
4. Or say in chat: "Add contact John Smith from Acme Corp"

**Managing Deals:**
1. Navigate to /crm → Deals tab
2. View your pipeline stages
3. Drag deals between stages
4. Click a deal to see details, add notes, schedule follow-ups

**Using AI Insights:**
1. Review the AI Suggestions panel daily
2. Act on relationship decay alerts
3. Use suggested follow-up times
4. Let the system learn from your patterns`,
    relatedTopics: ["deal_room", "tasks", "calendar"]
  },

  "archive_import": {
    overview: "The Archive Importer lets you upload ChatGPT/OpenAI data exports to extract business intelligence, conversations, contacts, and strategies from your AI conversation history.",
    detailed: `## Archive Importer — ChatGPT Data Intelligence

**What Gets Extracted:**
- Conversations and message threads
- Business entities and concepts discussed
- Contacts and relationships mentioned
- Strategies and insights
- Knowledge items for Research Studio

**Supported Formats:**
- OpenAI data export ZIP files
- ChatGPT conversation archives
- Files up to 2GB supported via chunked upload

**Processing Pipeline:**
1. Upload — Drag-drop or manual upload
2. Extract — System parses conversations.json
3. Analyze — AI identifies entities, contacts, businesses
4. Review — You approve/reject in /archive-review
5. Commit — Approved items go to appropriate modules

**Entity Classification:**
- "Mine" — Businesses you built (can spawn as workspace)
- "External" — Other companies (categorized as client, prospect, vendor, etc. and added to CRM)`,
    howTo: `## How to Import ChatGPT Archives

**Step 1: Get Your Export**
1. Go to ChatGPT → Settings → Data Controls
2. Click "Export Data"
3. Download the ZIP file when ready

**Step 2: Upload to Platform**
Option A: Drag-drop ZIP onto dashboard chat
Option B: Navigate to /archive-imports → New Import

**Step 3: Wait for Processing**
- System validates ZIP structure
- Extracts and analyzes conversations
- Identifies entities and relationships

**Step 4: Review Extracted Items**
1. Navigate to /archive-review
2. See identified businesses, contacts, strategies
3. For each item:
   - "Mine" → Spawn as My Business
   - "External" → Categorize and add to CRM

**Step 5: Commit to Platform**
- Approved items are saved to appropriate modules
- Full provenance tracking back to source messages`,
    relatedTopics: ["business_spawning", "research_studio", "crm"]
  },

  "research_studio": {
    overview: "Research Studio is a NotebookLM-style intelligence hub for source-grounded Q&A. Add sources (documents, URLs, notes), ask questions grounded in those sources, and generate audio podcasts.",
    detailed: `## Research Studio — Source-Grounded Intelligence

**Key Features:**
- Create notebooks with multiple sources
- Add sources: documents, URLs, text notes, platform entities
- Ask questions — answers are grounded in your sources (no hallucinations)
- Generate audio podcasts with dual-voice narration
- Create study materials and summaries

**Source Types:**
- PDF documents
- Web URLs (scraped and processed)
- Text notes and annotations
- Platform entities (contacts, companies, deals)
- Imported archive content

**Audio Generation:**
- Dual-voice podcast format ("Biz" and "Dev" personas)
- ElevenLabs text-to-speech integration
- Downloadable audio files

**Vision Generator:**
Tailored presentations based on learning styles:
- Audio formats
- Slide decks
- Infographics
- Quizzes`,
    howTo: `## How to Use Research Studio

**Creating a Notebook:**
1. Navigate to /research-studio
2. Click "New Notebook"
3. Give it a name and description

**Adding Sources:**
1. Open your notebook
2. Click "Add Source"
3. Choose type: Upload file, Paste URL, or Write text
4. Sources are processed and indexed

**Asking Questions:**
1. Use the chat interface
2. Ask any question about your sources
3. Answers include citations to specific sources
4. No hallucinations — only what's in your sources

**Generating Audio:**
1. Click "Generate Podcast"
2. AI creates a conversational script
3. ElevenLabs renders dual-voice audio
4. Download and share`,
    relatedTopics: ["archive_import", "business_spawning"]
  },

  "erp": {
    overview: "The ERP Generator creates AI-powered organizational structures customized to your business. It generates folder hierarchies, data schemas, and workflows based on your industry and strategy.",
    detailed: `## ERP Generator — Intelligent Business Structure

**What Gets Generated:**
- Complete folder hierarchies for document organization
- Custom data schemas matching your business model
- Workflow blueprints for common processes
- Role definitions and access patterns
- Integration recommendations

**Smart Document Router:**
When you upload any document:
1. AI analyzes contents
2. Recommends storage location within ERP
3. Suggests data extraction strategies
4. Offers workflow triggers
5. Files automatically upon approval

**Industry Templates:**
Pre-configured structures for:
- Technology companies
- Manufacturing
- Healthcare
- Retail
- Professional services
- Construction
- And more...

**Evolution Engine:**
The system monitors your activity and suggests structural updates as your business grows.`,
    howTo: `## How to Generate an ERP Structure

**Step 1: Navigate to Generator**
Navigate to /erp-generator
Or say in chat: "Generate an ERP for [company name]"

**Step 2: Answer Questions**
- Company name
- Industry/sector
- Primary strategy (growth, efficiency, innovation)
- Team size
- Existing tools

**Step 3: Review Generated Structure**
- See visual mind map of structure
- Folder hierarchy preview
- Workflow recommendations
- Integration suggestions

**Step 4: Apply and Customize**
- Apply the generated structure
- Modify folders as needed
- Add custom categories
- Connect integrations`,
    relatedTopics: ["business_spawning", "workflows"]
  },

  "workflows": {
    overview: "The Workflow module lets you design, build, and execute automated sequences that handle repetitive business processes. Use the visual builder or describe workflows in natural language.",
    detailed: `## Workflow Automation

**Components:**
- **Triggers** — Events that start workflows (time-based, data-based, manual, webhooks)
- **Actions** — Steps performed (send email, update records, call APIs, generate documents)
- **Conditions** — Logic gates (if/then/else, data comparisons, role checks)
- **Loops** — Repeated actions for batch processing

**Building Methods:**
1. Visual Builder — Drag-and-drop canvas
2. AI Generation — Describe in natural language
3. Templates — Pre-built for common scenarios

**Common Use Cases:**
- Lead nurturing sequences
- Approval chains with escalation
- Customer onboarding
- Invoice reminders and collection
- Report generation and distribution
- Meeting prep automation`,
    howTo: `## How to Create a Workflow

**Visual Builder:**
1. Navigate to /workflows → Create Workflow
2. Drag trigger node onto canvas
3. Connect action nodes
4. Add condition nodes for branching
5. Configure each node's parameters
6. Click "Activate"

**AI Generation:**
1. Navigate to /workflows
2. Click "Generate with AI"
3. Describe your workflow:
   "When a deal moves to Closed Won, send congratulations email to team, create onboarding task, and notify accounting"
4. Review generated workflow
5. Adjust and activate

**Using Templates:**
1. Navigate to /workflows → Templates
2. Browse by category
3. Click "Use Template"
4. Customize for your needs`,
    relatedTopics: ["erp", "crm", "tasks"]
  },

  "credits": {
    overview: "The Credits System uses a three-tier model (Compute, Action, Outcome) to track platform activities and enable monetization through the Contribution Event Log and Agent Attribution.",
    detailed: `## Credits System — Platform Monetization

**Three-Tier Model:**
1. **Compute Credits** — AI usage, processing, model inference
2. **Action Credits** — Platform operations, data modifications
3. **Outcome Credits** — Results-based rewards (meetings booked, deals closed)

**Contribution Event Log:**
All platform activities are logged with:
- Event type and description
- User attribution
- Timestamp
- XODIAK anchor status
- Credit value assigned

**Agent Attribution:**
AI agent work is tracked and attributed:
- Which agent performed the action
- What outcome was achieved
- How much credit is earned
- Automatic distribution based on rules

**Outcome Credit Validation:**
Outcome-based credits (e.g., qualified meetings) require external CRM confirmation (HubSpot) before being granted — ensuring pay-for-performance integrity.`,
    howTo: `## How to Track and Earn Credits

**Viewing Your Credits:**
1. Navigate to /credits
2. See Credit System Dashboard
3. View animated meters and payout previews

**Understanding Credit Types:**
- Compute: Earned for AI usage
- Action: Earned for platform operations
- Outcome: Earned for results (requires confirmation)

**Agent Attribution:**
1. Configure attribution rules in Deal Room → Agents tab
2. Set credit values per outcome type
3. Monitor agent contributions
4. Credits automatically calculated and distributed

**Payout Calculator:**
1. Navigate to /credits → Calculator
2. See conversion to USD
3. View projected earnings`,
    relatedTopics: ["deal_room", "xodiak", "partner_agents"]
  },

  "partner_agents": {
    overview: "Partner Agent Integration allows external automation platforms (Lindy.ai, Airia, OptimoIT) to register agents that perform work within Deal Rooms with tracked attribution and credit assignment.",
    detailed: `## Partner Agent Integration

**Supported Platforms:**
- Lindy.ai
- Airia
- OptimoIT
- Custom integrations via API

**Agent Registration:**
Register external agents with:
- API keys for authentication
- Capability definitions
- Attribution rules per outcome type

**5-Agent Workflow Example (OptimoIT):**
1. Signal Scout — Prospect identification
2. Account Intel — Company research and enrichment
3. Sequence+Draft — Outreach content generation
4. Booking+Follow-Up — Meeting scheduling
5. Daily Prep — Executive briefing preparation

**Sandbox Mode:**
Test agents in shadow mode that:
- Logs actions without executing
- Captures telemetry for debugging
- Allows safe testing before production

**Dual CRM Sync:**
- Real-time sync with HubSpot
- Per-deal-room filtering
- Bidirectional data flow`,
    howTo: `## How to Set Up Partner Agents

**Step 1: Register Agent**
1. Navigate to Deal Room → Agents tab
2. Click "Register New Agent"
3. Enter agent name, platform, and API key

**Step 2: Configure Attribution**
1. Go to Agent Attribution Manager
2. Set credit values per outcome type:
   - Meeting booked: X credits
   - Demo completed: Y credits
   - Deal closed: Z credits

**Step 3: Enable Sandbox Mode (Optional)**
1. Toggle "Sandbox Mode"
2. Agent logs actions without executing
3. Review telemetry and debug

**Step 4: Enable CRM Sync**
1. Go to Dual CRM Sync section
2. Connect HubSpot credentials
3. Configure sync settings per deal room`,
    relatedTopics: ["deal_room", "credits", "workflows"]
  },

  "escrow": {
    overview: "The Smart Escrow System manages secure fund holding for multi-party transactions in Deal Rooms, with platform-based, multisig wallet, and smart contract account options.",
    detailed: `## Smart Escrow System

**Account Types:**
1. **Platform-Based** — Funds held within platform's settlement system
2. **Multisig Wallets** — Require multiple party signatures for release
3. **Smart Contract** — Automated release based on blockchain-verified conditions

**Universal Wallet Integration:**
Connect external wallets for participation:
- MetaMask (Ethereum)
- Phantom (Solana)
- Coinbase Wallet
- Hardware wallets

**Verification Process:**
Wallet connections verified via cryptographic signature challenges — proving ownership without revealing private keys.

**Advisor Access:**
Invite trusted advisors (lawyers, accountants) with limited permissions to:
- Review contract terms
- Add private notes
- Provide recommendations
- Access specific documents`,
    howTo: `## How to Use Escrow

**Setting Up Escrow:**
1. Navigate to Deal Room → Escrow tab
2. Choose account type
3. Configure release conditions
4. Invite participants to fund

**Connecting a Wallet:**
1. Click "Connect Wallet"
2. Choose wallet type (MetaMask, Phantom, etc.)
3. Sign verification message
4. Wallet linked to your participant profile

**Adding an Advisor:**
1. Go to Participants tab
2. Click "Invite Advisor"
3. Set their permission scope
4. They can review terms without full deal access`,
    relatedTopics: ["deal_room", "xodiak"]
  },

  "initiative_architect": {
    overview: "The Initiative Architect transforms natural language project descriptions into complete operational infrastructure — creating CRM entities, Deal Rooms, tasks, workflows, and curriculum (for workshops), all anchored to XODIAK for immutable proof of origin.",
    detailed: `## Initiative Architect — AGI-Powered Project Scaffolding

**Core Capability:**
Describe what you want to accomplish in natural language, and the AGI system will create the entire operational infrastructure to make it happen.

**What Gets Created:**
- **CRM Contacts & Companies** — Key stakeholders extracted and linked
- **Deal Room** — Collaborative workspace with terms and governance
- **Tasks** — Action items with assignments and deadlines
- **Curriculum** (for workshops) — Complete educational content with sessions, objectives, and materials
- **XODIAK Anchoring** — Cryptographic proof of the initiative's origin

**Initiative Types:**
1. **Project** — General business projects with milestones
2. **Workshop** — Educational events with curriculum generation
3. **Campaign** — Marketing or outreach initiatives
4. **Partnership** — Multi-party collaborations
5. **Event** — Conferences, meetings, or gatherings
6. **Research** — Investigation and analysis projects

**XODIAK Integration:**
Every initiative is anchored to the XODIAK blockchain upon scaffolding, providing:
- Immutable proof of when the initiative was conceived
- Verifiable attribution of the creator
- Tamper-proof record of the original goal statement

**Workflow:**
1. User describes goal in natural language
2. AI parses stakeholders, deliverables, timeline
3. System creates all infrastructure automatically
4. User reviews and activates the initiative`,
    howTo: `## How to Create an Initiative

**Method 1: Via Unified Chat**
Simply tell the AI assistant:
- "Create an initiative for a Biz Dev workshop at St. Constantine School"
- "Start a World Cup 2026 partnership project"
- "Launch a marketing campaign for Q2"

**Method 2: Via Initiative Architect Page**
1. Navigate to /initiative-architect
2. Enter initiative name and type
3. Write your goal statement in natural language
4. Add stakeholders (optional)
5. Click "Create Initiative"

**After Creation:**
1. Navigate to /initiatives/[id] to see the detail page
2. Review scaffolded entities in the tabs:
   - Overview — Status and XODIAK anchor
   - Linked CRM — Companies and contacts created
   - Deal Room — Collaborative workspace (if created)
   - Curriculum — Workshop content (for workshop type)
3. Click "View in CRM" to see filtered CRM view
4. Use "Re-scaffold" if the initial scaffolding was interrupted`,
    relatedTopics: ["proposal_generator", "opportunity_discovery", "deal_room", "xodiak"]
  },

  "proposal_generator": {
    overview: "The Proposal Generator synthesizes data from CRM, Deal Rooms, and Research Studio to create formal, branded business proposals with AI-powered content generation and XODIAK anchoring for verifiable terms.",
    detailed: `## Proposal Generator — AI-Powered Document Synthesis

**Core Capability:**
Create boardroom-quality proposals by pulling intelligence from across the platform — CRM profiles, Deal Room context, Research Studio insights, and initiative data.

**Proposal Types:**
1. **Service** — Offering professional services or consulting
2. **Partnership** — Proposing collaboration between parties
3. **Investment** — Seeking or offering capital investment
4. **Sponsorship** — Event or initiative sponsorship offers
5. **Custom** — Freeform proposal structure

**AI Content Generation:**
- Executive summaries tailored to recipient
- Scope of work extracted from initiatives
- Pricing recommendations based on market data
- Terms and conditions with legal language
- Professional formatting and branding

**Data Sources:**
- **CRM** — Recipient company info, contact history, relationship score
- **Deal Room** — Terms, ingredients, and participant context
- **Research Studio** — Market intelligence and competitor analysis
- **Initiative** — Goals, deliverables, and stakeholder mapping

**Version Control:**
- Track all proposal versions
- Compare changes between versions
- XODIAK anchoring for immutable version history

**Engagement Tracking:**
- Know when recipients open proposals
- Track time spent on each section
- Get notified of recipient actions`,
    howTo: `## How to Generate a Proposal

**Method 1: Via Unified Chat**
Tell the AI:
- "Generate a proposal for St. Constantine School"
- "Create a partnership proposal for the World Cup initiative"
- "Draft a service proposal for consulting services"

**Method 2: Via Proposals Page**
1. Navigate to /proposals
2. Click "New Proposal"
3. Select proposal type
4. Link to initiative (optional)
5. Enter key points and context
6. Click "Generate with AI"

**After Generation:**
1. Review the generated content
2. Edit sections as needed
3. Add custom attachments
4. Preview the branded output
5. Send via email or share link
6. Track engagement in the dashboard`,
    relatedTopics: ["initiative_architect", "crm", "deal_room", "research_studio"]
  },

  "opportunity_discovery": {
    overview: "The Opportunity Discovery Engine features a proactive AI agent that continuously scans public data (news, business journals, social media) for signals matching your watchlist, scoring relevance and enabling one-click conversion to CRM leads or Deal Rooms.",
    detailed: `## Opportunity Discovery — Proactive AI Agent

**Core Capability:**
The platform shifts from reactive CRM to proactive business-spawning engine by continuously monitoring the world for opportunities that match your interests.

**Watchlist System:**
Add targets to your watchlist by type:
- **Company** — Monitor specific companies for news and signals
- **Industry** — Track sector-wide trends and opportunities
- **Event** — Follow major events (World Cup, conferences, etc.)
- **Person** — Track individuals for career moves, announcements

**AI Scanning:**
The proactive agent scans 24/7:
- News articles and press releases
- Business journals and trade publications
- Social media (LinkedIn, Twitter/X)
- Government filings and announcements
- Patent and trademark databases

**Relevance Scoring:**
Each discovered opportunity receives a score (0-100) based on:
- Keyword match strength
- Recency of the signal
- Source credibility
- Historical interest patterns

**One-Click Conversion:**
High-value opportunities can be instantly converted to:
- CRM Lead (contact or company)
- Initiative (via Initiative Architect)
- Deal Room (collaborative workspace)
- Research Studio notebook

**Notification System:**
- Real-time alerts for high-priority matches
- Daily digest of discovered opportunities
- Threshold-based filtering`,
    howTo: `## How to Use Opportunity Discovery

**Adding to Watchlist via Chat:**
- "Add World Cup 2026 to my watchlist"
- "Watch for opportunities in oil & gas"
- "Monitor St. Constantine School for news"

**Adding via Opportunity Discovery Page:**
1. Navigate to /opportunity-discovery
2. Click "Add to Watchlist"
3. Select target type (company, industry, event, person)
4. Enter the target value and keywords
5. Set priority level

**Reviewing Discovered Opportunities:**
1. View the feed of discovered opportunities
2. Sort by relevance score or recency
3. Click to see full details and source
4. Convert to CRM, Initiative, or Deal Room

**Managing Your Watchlist:**
1. Navigate to /opportunity-discovery/watchlist
2. Edit or remove targets
3. Adjust priority levels
4. Pause/resume monitoring`,
    relatedTopics: ["initiative_architect", "crm", "deal_room"]
  }
};

// Function to get detailed knowledge for a topic
export function getDetailedKnowledge(topic: string, detailLevel: 'overview' | 'detailed' | 'how_to' = 'detailed'): string {
  // Normalize the topic
  const normalizedTopic = topic.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .replace(/['"]/g, '');

  // Find matching topic
  let matchedTopic: TopicKnowledge | null = null;
  let topicKey = '';

  // Direct match
  if (TOPIC_KNOWLEDGE[normalizedTopic]) {
    matchedTopic = TOPIC_KNOWLEDGE[normalizedTopic];
    topicKey = normalizedTopic;
  } else {
    // Fuzzy match
    for (const [key, value] of Object.entries(TOPIC_KNOWLEDGE)) {
      if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
        matchedTopic = value;
        topicKey = key;
        break;
      }
    }
  }

  // Keyword-based matching
  if (!matchedTopic) {
    const keywordMap: Record<string, string> = {
      'chemical': 'deal_room',
      'blender': 'deal_room',
      'agreement': 'deal_room',
      'contract': 'deal_room',
      'collaboration': 'deal_room',
      'spawn': 'business_spawning',
      'create business': 'business_spawning',
      'launch business': 'business_spawning',
      'new company': 'business_spawning',
      'blockchain': 'xodiak',
      'ledger': 'xodiak',
      'anchor': 'xodiak',
      'proof': 'xodiak',
      'contact': 'crm',
      'company': 'crm',
      'deal': 'crm',
      'relationship': 'crm',
      'pipeline': 'crm',
      'chatgpt': 'archive_import',
      'openai': 'archive_import',
      'import': 'archive_import',
      'archive': 'archive_import',
      'notebook': 'research_studio',
      'research': 'research_studio',
      'source': 'research_studio',
      'knowledge': 'research_studio',
      'folder': 'erp',
      'structure': 'erp',
      'organization': 'erp',
      'automation': 'workflows',
      'workflow': 'workflows',
      'trigger': 'workflows',
      'action': 'workflows',
      'credit': 'credits',
      'contribution': 'credits',
      'monetization': 'credits',
      'agent': 'partner_agents',
      'lindy': 'partner_agents',
      'airia': 'partner_agents',
      'optimo': 'partner_agents',
      'escrow': 'escrow',
      'fund': 'escrow',
      'wallet': 'escrow',
      'initiative': 'initiative_architect',
      'scaffold': 'initiative_architect',
      'project': 'initiative_architect',
      'workshop': 'initiative_architect',
      'curriculum': 'initiative_architect',
      'proposal': 'proposal_generator',
      'pitch': 'proposal_generator',
      'offer': 'proposal_generator',
      'opportunity': 'opportunity_discovery',
      'watchlist': 'opportunity_discovery',
      'discover': 'opportunity_discovery',
      'scan': 'opportunity_discovery',
      'signal': 'opportunity_discovery'
    };

    for (const [keyword, mappedTopic] of Object.entries(keywordMap)) {
      if (normalizedTopic.includes(keyword)) {
        matchedTopic = TOPIC_KNOWLEDGE[mappedTopic];
        topicKey = mappedTopic;
        break;
      }
    }
  }

  if (!matchedTopic) {
    return `I have comprehensive knowledge of all platform features. Could you be more specific about what you'd like to know? 

Here are the main topics I can explain in detail:
- **Deal Rooms** — The Chemical Blender for multi-party agreements
- **Business Spawning** — AGI-powered company creation
- **Initiative Architect** — Project scaffolding from natural language
- **Proposal Generator** — AI-powered business proposals
- **Opportunity Discovery** — Proactive signal scanning
- **XODIAK** — Blockchain infrastructure and anchoring
- **CRM** — Customer relationship management
- **Archive Import** — ChatGPT/OpenAI data extraction
- **Research Studio** — Source-grounded Q&A
- **ERP Generator** — AI-powered organizational structures
- **Workflows** — Automation builder
- **Credits System** — Platform monetization
- **Partner Agents** — External automation integration
- **Escrow** — Secure fund holding

What would you like to learn about?`;
  }

  // Return based on detail level
  let response = '';
  
  switch (detailLevel) {
    case 'overview':
      response = matchedTopic.overview;
      break;
    case 'how_to':
      response = matchedTopic.howTo;
      break;
    case 'detailed':
    default:
      response = matchedTopic.detailed;
      break;
  }

  // Add related topics
  if (matchedTopic.relatedTopics.length > 0) {
    response += `\n\n**Related Topics:** ${matchedTopic.relatedTopics.map(t => t.replace(/_/g, ' ')).join(', ')}`;
  }

  return response;
}

// Get all available topics for the AI to reference
export function getAvailableTopics(): string[] {
  return Object.keys(TOPIC_KNOWLEDGE);
}
