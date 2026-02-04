import { 
  Brain, 
  Code, 
  Lightbulb, 
  Building2, 
  Shield, 
  Globe, 
  Network, 
  Cpu, 
  Database, 
  Lock, 
  Eye, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Zap, 
  Radio, 
  Layers, 
  Search, 
  Video, 
  MapPin,
  Activity,
  BarChart3,
  GitBranch,
  Hexagon
} from "lucide-react";

const LEXIEModule = () => {
  return (
    <article className="whitepaper-module" id="lexie-module">
      {/* Module Header */}
      <header className="mb-8 pb-6 border-b border-border">
        <p className="text-primary font-mono text-sm tracking-widest uppercase mb-2">Module 8</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          LEXIE Intelligence Platform
        </h1>
        <p className="text-lg text-muted-foreground">
          A Global Intelligence, Risk, and Signal Sovereignty System Built on Quantum Bit Code
        </p>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span>Version 1.0</span>
          <span>•</span>
          <span>Classification: UNCLASSIFIED // FOUO</span>
        </div>
      </header>

      {/* Executive Framing */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Executive Framing</h2>
        <div className="p-6 bg-card border border-border rounded-xl mb-6">
          <p className="text-lg text-foreground font-medium italic mb-4">
            "LEXIE is not a product. It is not a dashboard. It is not a surveillance tool, 
            a cybersecurity suite, or an AI model."
          </p>
          <p className="text-muted-foreground leading-relaxed">
            LEXIE is a planetary-scale intelligence engine designed to help humanity understand, secure, 
            and coordinate across a world where information, infrastructure, and decision-making are 
            inseparable — and increasingly fragile.
          </p>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE exists because the modern world has crossed a threshold:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li><strong className="text-foreground">Risk is no longer isolated.</strong> A cyberattack on a power grid affects hospitals, banks, and transportation simultaneously.</li>
          <li><strong className="text-foreground">Threats no longer stay in one domain.</strong> Financial instability cascades to supply chains, which cascade to geopolitical tensions.</li>
          <li><strong className="text-foreground">Information moves faster than institutions can reason about it.</strong> By the time reports are written, the situation has changed.</li>
          <li><strong className="text-foreground">Quantum computing, AI automation, and infrastructure warfare</strong> have permanently altered the security landscape.</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          LEXIE is the system that sees across domains, thinks in structures instead of silos, and 
          communicates meaning in forms that survive language, jurisdiction, and even future computation paradigms.
        </p>
      </section>

      {/* Why LEXIE Exists */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Why LEXIE Exists</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Every major failure of the last two decades — financial crises, supply chain collapses, cyber breaches, 
          infrastructure outages, geopolitical miscalculations — shares a common root cause:
        </p>
        <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl mb-6">
          <p className="text-lg font-bold text-foreground text-center">
            Decision-makers were blind to how systems were actually connected.
          </p>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Information existed. Data existed. Warnings existed. But no system could fuse, reason, and communicate 
          that complexity in a way humans could trust and act on.
        </p>
        <p className="text-foreground font-medium">
          LEXIE is built to solve that problem permanently.
        </p>
      </section>

      {/* What LEXIE Is */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">What LEXIE Is</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE is a continuous intelligence and risk-exposure platform that ingests massive, heterogeneous 
          data streams and produces:
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg flex items-start gap-3">
            <Activity className="w-5 h-5 text-primary mt-1 shrink-0" />
            <span className="text-muted-foreground">Real-time situational awareness</span>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-primary mt-1 shrink-0" />
            <span className="text-muted-foreground">Predictive risk modeling</span>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg flex items-start gap-3">
            <Network className="w-5 h-5 text-primary mt-1 shrink-0" />
            <span className="text-muted-foreground">Cross-domain dependency maps</span>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg flex items-start gap-3">
            <Brain className="w-5 h-5 text-primary mt-1 shrink-0" />
            <span className="text-muted-foreground">Explainable decision intelligence</span>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg flex items-start gap-3">
            <Hexagon className="w-5 h-5 text-primary mt-1 shrink-0" />
            <span className="text-muted-foreground">Secure, geometry-encoded intelligence artifacts</span>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE serves governments, critical infrastructure operators, enterprises, financial institutions, 
          insurers and reinsurers, telecommunications and network operators, and security and emergency 
          response organizations. But it is designed so no single group controls the system, even while all 
          can benefit from it economically.
        </p>
      </section>

      {/* TECHNICAL PERSPECTIVE */}
      <section className="mb-12 p-6 bg-primary/5 border border-primary/20 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Code className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Technical Perspective</h2>
            <p className="text-sm text-primary">For Engineers, Data Scientists & Security Architects</p>
          </div>
        </div>

        {/* Core Capability 1: Global Risk & Threat Intelligence */}
        <h3 className="text-xl font-display font-bold text-foreground mb-4">
          Core Capability 1: Global Risk & Threat Intelligence
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE continuously monitors and analyzes risk signals across all major domains of modern civilization:
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              Cyber & Digital Risk
            </h4>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Malware propagation patterns and zero-day exploit signals</li>
              <li>Software supply chain dependencies and vulnerability mapping</li>
              <li>Credential compromise indicators and dark web monitoring</li>
              <li>AI-enabled attack behaviors and autonomous threat actors</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              Infrastructure Risk
            </h4>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Power grid stability and cascading failure prediction</li>
              <li>Telecommunications networks and BGP anomaly detection</li>
              <li>Water systems, transportation corridors, and SCADA networks</li>
              <li>Data centers, cloud regions, and CDN dependencies</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Economic & Financial Risk
            </h4>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Market instability indicators and flash crash precursors</li>
              <li>Counterparty exposure mapping and systemic risk scoring</li>
              <li>Payment and settlement dependencies (SWIFT, CHIPS, FedWire)</li>
              <li>Sanctions, regulatory shifts, and trade policy impacts</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-primary" />
              Geopolitical & Strategic Risk
            </h4>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Escalation signals and conflict probability modeling</li>
              <li>Trade chokepoints (Suez, Panama, Strait of Malacca)</li>
              <li>Resource dependencies (rare earth, semiconductors, energy)</li>
              <li>State-level cyber and infrastructure posture assessment</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-primary" />
              Emerging Technology Risk
            </h4>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Post-quantum cryptographic exposure assessment</li>
              <li>AI misuse patterns and deepfake detection</li>
              <li>Autonomous system dependencies and failure modes</li>
              <li>Biotechnology and synthetic biology threat vectors</li>
            </ul>
          </div>
        </div>

        <p className="text-foreground font-medium mb-6">
          LEXIE does not simply alert. It models consequences, scores exposure, and projects cascades.
        </p>

        {/* Core Capability 2: Cross-Domain Data Ingestion */}
        <h3 className="text-xl font-display font-bold text-foreground mb-4">
          Core Capability 2: Cross-Domain Data Ingestion & Semantic Fusion
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE is built on the premise that the most important risks live <em>between</em> datasets, not inside them.
        </p>
        
        <h4 className="text-lg font-bold text-foreground mb-2">Data Sources</h4>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {[
            "Video & sensor streams",
            "Network telemetry (NetFlow, sFlow)",
            "Code repositories & SBOMs",
            "Legal & regulatory text",
            "Financial data feeds",
            "Satellite & geospatial",
            "IoT & OT telemetry",
            "Open-source intelligence",
            "Classified feeds (authorized)"
          ].map((source) => (
            <div key={source} className="p-2 bg-muted/30 rounded text-sm text-muted-foreground text-center">
              {source}
            </div>
          ))}
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Semantic Fusion Architecture</h4>
        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground overflow-x-auto">
          <pre>{`┌──────────────────────────────────────────────────────────────────┐
│                    LEXIE SEMANTIC FUSION ENGINE                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Video   │  │ Network  │  │ Financial│  │  OSINT   │   ...   │
│  │  Feeds   │  │ Telemetry│  │   Data   │  │  Feeds   │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │             │             │             │                │
│       └─────────────┼─────────────┼─────────────┘                │
│                     ▼                                            │
│           ┌─────────────────────┐                                │
│           │  Normalization Layer │                               │
│           │  (Schema Mapping)    │                               │
│           └──────────┬──────────┘                                │
│                      ▼                                           │
│           ┌─────────────────────┐                                │
│           │  Entity Extraction  │◄─── NER, Relationship Mining   │
│           │  (AI-Powered)       │                                │
│           └──────────┬──────────┘                                │
│                      ▼                                           │
│           ┌─────────────────────┐                                │
│           │  Knowledge Graph    │◄─── Neo4j / Property Graph     │
│           │  Construction       │                                │
│           └──────────┬──────────┘                                │
│                      ▼                                           │
│           ┌─────────────────────┐                                │
│           │  Unified Reality    │                                │
│           │  Model              │                                │
│           └─────────────────────┘                                │
└──────────────────────────────────────────────────────────────────┘`}</pre>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-6">
          The breakthrough is not ingestion — it is semantic fusion. LEXIE translates raw inputs into a 
          unified structural model of reality, allowing relationships to emerge that no single-domain system can detect.
        </p>

        {/* Core Capability 3: Relationship & Dependency Mapping */}
        <h3 className="text-xl font-display font-bold text-foreground mb-4">
          Core Capability 3: Relationship & Dependency Mapping
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE constructs living graphs of dependency, showing:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>Which systems rely on which components</li>
          <li>Where single points of failure exist</li>
          <li>How risk propagates across sectors</li>
          <li>Which entities are upstream or downstream of a given event</li>
        </ul>

        <h4 className="text-lg font-bold text-foreground mb-2">Example Queries</h4>
        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground overflow-x-auto">
          <pre>{`// Query: Impact of software vulnerability
LEXIE.query({
  type: "cascade_analysis",
  trigger: "CVE-2024-XXXXX in OpenSSL 3.x",
  scope: ["infrastructure", "financial", "healthcare"],
  depth: 3
});

// Response includes:
// - Affected systems: 847 entities
// - Critical path: Cloud Provider → Payment Processor → Banks (12)
// - Estimated exposure: $2.4B potential impact
// - Time to cascade: 4-12 hours after exploit publication`}</pre>
        </div>
        <p className="text-foreground font-medium mb-6">
          These maps update continuously. They are not static diagrams — they are dynamic intelligence structures.
        </p>

        {/* Core Capability 4: Predictive Modeling */}
        <h3 className="text-xl font-display font-bold text-foreground mb-4">
          Core Capability 4: Predictive Modeling & Simulation
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE does not stop at describing the present. It simulates futures.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Using probabilistic modeling, graph theory, and machine learning, LEXIE can project:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li>Cascading infrastructure failures with probability distributions</li>
          <li>Market reactions to geopolitical events (T+0 to T+30 days)</li>
          <li>Regulatory impacts on business models and compliance costs</li>
          <li>Communication resilience under coordinated attack</li>
          <li>Post-quantum cryptographic collapse scenarios</li>
        </ul>

        <h4 className="text-lg font-bold text-foreground mb-2">Simulation Engine</h4>
        <div className="bg-muted/30 rounded-lg p-4 mb-6 font-mono text-sm text-muted-foreground overflow-x-auto">
          <pre>{`interface SimulationRequest {
  scenario: ScenarioType;
  entities: Entity[];
  constraints: SimulationConstraints;
  timeHorizon: { start: Date; end: Date };
  confidenceThreshold: number; // 0-1
}

interface SimulationResult {
  outcomes: Outcome[];          // Ranked by probability
  cascadePaths: CascadePath[];  // Graph of propagation
  keyIndicators: Indicator[];   // Early warning signals
  confidence: number;           // Overall confidence score
  assumptions: Assumption[];    // Transparency layer
  alternativeScenarios: Scenario[]; // What-if variations
}`}</pre>
        </div>

        {/* Core Capability 5: Human-Centric Decision Support */}
        <h3 className="text-xl font-display font-bold text-foreground mb-4">
          Core Capability 5: Human-Centric Decision Support
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE is explicitly designed <strong className="text-foreground">not to replace human judgment</strong>. 
          Instead, it augments it.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Every conclusion includes:
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-1">Confidence Scores</h5>
            <p className="text-sm text-muted-foreground">
              Quantified certainty levels (0-100%) with statistical basis
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-1">Assumption Transparency</h5>
            <p className="text-sm text-muted-foreground">
              Every assumption underlying a conclusion is surfaced
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-1">Alternative Scenarios</h5>
            <p className="text-sm text-muted-foreground">
              "If assumption X is wrong, outcome shifts to Y"
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-1">Explainable Reasoning</h5>
            <p className="text-sm text-muted-foreground">
              Chain-of-thought reasoning visible to reviewers
            </p>
          </div>
        </div>

        {/* Core Capability 6: QBC Encoding */}
        <h3 className="text-xl font-display font-bold text-foreground mb-4">
          Core Capability 6: QBC Visual-Geometric Intelligence Encoding
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Everything described so far exists in partial form across the industry. 
          <strong className="text-foreground"> LEXIE becomes fundamentally different because of Quantum Bit Code.</strong>
        </p>

        <h4 className="text-lg font-bold text-foreground mb-2">Intelligence as Geometry</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Using QBC, every intelligence object produced by LEXIE can be encoded as a Geometric Information Object (GIO) — 
          a lattice-based, multi-dimensional geometric structure defined in the QBC white paper.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          This means:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li><strong className="text-foreground">Intelligence is no longer trapped in text or dashboards</strong> — it becomes a portable, verifiable object</li>
          <li><strong className="text-foreground">Meaning is encoded structurally</strong> — not as syntax vulnerable to translation errors</li>
          <li><strong className="text-foreground">Interpretation requires authorized lattice knowledge</strong> — defense in depth</li>
          <li><strong className="text-foreground">Integrity is mathematically verifiable</strong> — any tampering breaks the geometric hash</li>
        </ul>

        <h4 className="text-lg font-bold text-foreground mb-2">QBC as Security Boundary</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE does not treat QBC as "encryption." It treats <strong className="text-foreground">geometry itself as a security perimeter</strong>.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Traditional Approach:</strong><br />
              "Here is the data, protect it."
            </p>
          </div>
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">LEXIE Approach:</strong><br />
              "Here is the shape. Without the lattice context, it has no meaning."
            </p>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed mb-6">
          This provides: post-quantum resilience, resistance to brute-force decryption, resistance to insider leaks, 
          and resistance to AI scraping and mass surveillance.
        </p>

        {/* Core Capability 7: AI Video Analytics */}
        <h3 className="text-xl font-display font-bold text-foreground mb-4">
          Core Capability 7: AI Video Analytics Platform
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE integrates cloud-based AI video analytics for real-time situational awareness:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <Video className="w-4 h-4 text-primary" />
              Real-Time Threat Detection
            </h5>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Weapons detection (firearms, knives, explosives)</li>
              <li>Fire and smoke detection with localization</li>
              <li>Unattended object alerts</li>
              <li>Intrusion detection and perimeter monitoring</li>
              <li>Crowd density and behavior analysis</li>
            </ul>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              Ethical AI Modules
            </h5>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Privacy-preserving analytics (blur, anonymization)</li>
              <li>Regulated facial analytics with consent tracking</li>
              <li>Role-based access to sensitive detection types</li>
              <li>Audit logging of all AI inferences</li>
              <li>Bias monitoring and fairness metrics</li>
            </ul>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-primary" />
              Search & Forensic Tools
            </h5>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>"Searchveillance" — near-instant video search</li>
              <li>Object and person re-identification</li>
              <li>Timeline reconstruction</li>
              <li>Evidence chain-of-custody tracking</li>
              <li>Integration with legal workflows</li>
            </ul>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              Missing Persons & Safety
            </h5>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>AMBER Alert integration</li>
              <li>Human trafficking victim identification</li>
              <li>Elderly/vulnerable person monitoring</li>
              <li>Preloaded watchlists (with legal authorization)</li>
              <li>Multi-agency coordination</li>
            </ul>
          </div>
        </div>

        {/* System Architecture */}
        <h3 className="text-xl font-display font-bold text-foreground mb-4">
          System Architecture Overview
        </h3>
        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground overflow-x-auto">
          <pre>{`┌────────────────────────────────────────────────────────────────────────┐
│                       LEXIE SYSTEM ARCHITECTURE                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Layer 1: INGESTION & NORMALIZATION                                    │
│  ├── Data connectors (video, network, financial, satellite, IoT)       │
│  ├── Schema normalization and type inference                           │
│  └── Deduplication and quality scoring                                 │
│                                                                        │
│  Layer 2: CROSS-DOMAIN GRAPH ENGINE                                    │
│  ├── Entity extraction (NER, relationship mining)                      │
│  ├── Property graph construction (Neo4j-compatible)                    │
│  └── Continuous graph updates and versioning                           │
│                                                                        │
│  Layer 3: PREDICTIVE MODELING & SIMULATION                             │
│  ├── Probabilistic cascade modeling                                    │
│  ├── Monte Carlo simulation engine                                     │
│  └── Scenario comparison and sensitivity analysis                      │
│                                                                        │
│  Layer 4: QBC ENCODING / DECODING ENGINE                               │
│  ├── Intelligence artifact encoding to GIOs                            │
│  ├── Lattice management and versioning                                 │
│  └── Geometric hash verification                                       │
│                                                                        │
│  Layer 5: SECURE TRANSPORT & TRANSMISSION (MESH 34)                    │
│  ├── Quantum-resistant channel establishment                           │
│  ├── Multi-path redundancy                                             │
│  └── Physical layer signal sovereignty                                 │
│                                                                        │
│  Layer 6: ROLE-BASED POLICY & ACCESS CONTROL                           │
│  ├── Organization and team management                                  │
│  ├── Clearance-level access gating                                     │
│  └── Audit logging and compliance reporting                            │
│                                                                        │
│  Layer 7: VISUALIZATION & GLYPH INTERFACE                              │
│  ├── Real-time dashboards and alert panels                             │
│  ├── Graph visualization (2D/3D)                                       │
│  └── GIO rendering and export                                          │
│                                                                        │
│  Layer 8: API & INTEGRATION LAYER                                      │
│  ├── RESTful and GraphQL APIs                                          │
│  ├── Webhook and event streaming                                       │
│  └── SDK for custom integrations                                       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘`}</pre>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Deployment Options</h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-bold text-foreground">Model</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Description</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Scale</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-bold text-foreground">SaaS Hosted</td>
                <td className="py-2 px-3">Secure cloud datacenter deployment (global)</td>
                <td className="py-2 px-3">1 - 100,000+ cameras</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-bold text-foreground">Self-Hosted</td>
                <td className="py-2 px-3">On-premises deployment with client hardware</td>
                <td className="py-2 px-3">Custom sizing</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-foreground">Hybrid</td>
                <td className="py-2 px-3">Edge processing with cloud aggregation</td>
                <td className="py-2 px-3">Distributed networks</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">API Specification</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-bold text-foreground">Endpoint</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Method</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-mono text-xs">/api/lexie/analyze</td>
                <td className="py-2 px-3">POST</td>
                <td className="py-2 px-3">Submit data for semantic analysis</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-mono text-xs">/api/lexie/entities</td>
                <td className="py-2 px-3">GET</td>
                <td className="py-2 px-3">Query entity database</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-mono text-xs">/api/lexie/relationships</td>
                <td className="py-2 px-3">GET</td>
                <td className="py-2 px-3">Query dependency graph</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-mono text-xs">/api/lexie/simulate</td>
                <td className="py-2 px-3">POST</td>
                <td className="py-2 px-3">Run predictive simulation</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-mono text-xs">/api/lexie/alerts</td>
                <td className="py-2 px-3">GET/PATCH</td>
                <td className="py-2 px-3">Manage alerts and notifications</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-xs">/api/lexie/encode</td>
                <td className="py-2 px-3">POST</td>
                <td className="py-2 px-3">Encode intelligence to QBC GIO</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* EVERYDAY UNDERSTANDING */}
      <section className="mb-12 p-6 bg-secondary/20 border border-secondary/30 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Everyday Understanding</h2>
            <p className="text-sm text-muted-foreground">Plain English Explanation</p>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          What Does LEXIE Actually Do?
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Imagine you could see the entire world as a connected web — where a problem in one place 
          creates ripples everywhere else. A cyberattack on a bank affects the hospital that can't 
          process payments. A shipping delay affects the factory that affects the store that affects you.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">LEXIE is like having X-ray vision for how the world is connected.</strong> 
          It watches thousands of different information sources — security cameras, financial markets, 
          satellite images, computer networks — and sees patterns that humans couldn't possibly notice.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-2">Think of It Like This:</h4>
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Without LEXIE:</strong> A city has 10,000 security cameras. 
              A human team might watch 50 at a time, and they can only react to what they see. They don't 
              know that the suspicious van on Camera 47 was also seen near the power plant yesterday.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              <strong className="text-foreground">With LEXIE:</strong> All 10,000 cameras are analyzed instantly. 
              LEXIE notices the van, connects it to unusual network traffic at the power plant, correlates 
              it with social media chatter, and alerts security — all before anything happens.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Why Should You Care?</h4>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li><strong className="text-foreground">Public Safety:</strong> Missing children can be found faster. 
            Threats can be detected before they become tragedies.</li>
          <li><strong className="text-foreground">Economic Stability:</strong> Your bank, your employer, your 
            supply chain are all protected from cascading failures.</li>
          <li><strong className="text-foreground">Privacy Protection:</strong> Unlike surveillance systems, LEXIE 
            uses ethical AI that respects privacy while still protecting people.</li>
          <li><strong className="text-foreground">Future Security:</strong> The geometric encoding means even 
            future super-computers can't break the protection.</li>
        </ul>

        <h4 className="text-lg font-bold text-foreground mb-2">The Geometry of Understanding</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Remember how QBC turns words into geometric shapes? LEXIE takes entire intelligence reports — 
          pages of analysis, charts, and warnings — and encodes them the same way. The result is a 
          unique "glyph" that contains the full meaning but can only be read by authorized people.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          It's like having a universal translator that works across all languages, all countries, and all 
          computer systems — while being impossible for enemies to intercept or fake.
        </p>
      </section>

      {/* CORPORATE & STRATEGIC VALUE */}
      <section className="mb-12 p-6 bg-accent/10 border border-accent/20 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Corporate & Strategic Value</h2>
            <p className="text-sm text-muted-foreground">Business Case & ROI Analysis</p>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          Market Analysis
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The global risk intelligence market is projected to exceed $50 billion by 2030. The convergence 
          of AI, IoT, and quantum computing is creating unprecedented demand for integrated intelligence 
          platforms that can operate across traditional silos.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-3">Customer Segments Served</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Shield className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Governments & Defense</h5>
            <p className="text-sm text-muted-foreground">
              National security agencies, defense departments, intelligence communities, 
              and homeland security organizations requiring sovereign intelligence capabilities.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Zap className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Critical Infrastructure</h5>
            <p className="text-sm text-muted-foreground">
              Power utilities, telecommunications, water systems, and transportation networks 
              requiring real-time threat detection and resilience planning.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Financial Institutions</h5>
            <p className="text-sm text-muted-foreground">
              Banks, trading firms, payment processors, and regulators requiring systemic 
              risk monitoring and counterparty exposure analysis.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Building2 className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Enterprise</h5>
            <p className="text-sm text-muted-foreground">
              Fortune 500 companies requiring supply chain visibility, cyber risk management, 
              and business continuity intelligence.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Insurance & Reinsurance</h5>
            <p className="text-sm text-muted-foreground">
              Underwriters requiring accurate risk quantification, catastrophe modeling, 
              and portfolio exposure analysis.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Users className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Smart Cities & Public Safety</h5>
            <p className="text-sm text-muted-foreground">
              Municipal governments, transit authorities, school districts, and community 
              organizations requiring integrated safety solutions.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">Deployment & Pricing Models</h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-foreground">Model</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Best For</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Pricing Structure</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-bold text-foreground">SaaS Subscription</td>
                <td className="py-3 px-4">Rapid deployment, variable workloads</td>
                <td className="py-3 px-4">Per-camera / per-data-source / month</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-bold text-foreground">Enterprise License</td>
                <td className="py-3 px-4">Large-scale, predictable usage</td>
                <td className="py-3 px-4">Annual license with unlimited usage</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-bold text-foreground">Government Contract</td>
                <td className="py-3 px-4">Sovereign requirements, classified data</td>
                <td className="py-3 px-4">Custom negotiation (GSA, SBIR eligible)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-foreground">Managed Service</td>
                <td className="py-3 px-4">Full outsourcing of intelligence ops</td>
                <td className="py-3 px-4">Retainer + outcomes-based</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">ROI Analysis</h4>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li><strong className="text-foreground">Breach Prevention:</strong> Average data breach cost in 2024: $4.45M. 
            Average infrastructure attack: $140M+. LEXIE prevents catastrophic exposure.</li>
          <li><strong className="text-foreground">Operational Efficiency:</strong> Reduce security operations center 
            staffing by 40-60% through AI-augmented monitoring.</li>
          <li><strong className="text-foreground">Insurance Positioning:</strong> Cyber insurance premiums reduced 
            15-25% with demonstrated quantum-resistant posture.</li>
          <li><strong className="text-foreground">Regulatory Compliance:</strong> Single platform addresses NIST CSF, 
            ISO 27001, SOC 2, and emerging PQC mandates.</li>
          <li><strong className="text-foreground">Competitive Intelligence:</strong> Supply chain and market visibility 
            enables strategic advantage worth multiples of platform cost.</li>
        </ul>

        <h4 className="text-lg font-bold text-foreground mb-3">Funding Model</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE is funded through aligned incentives:
        </p>
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {[
            "Government contracts",
            "Enterprise subscriptions",
            "Infrastructure operators",
            "Insurance firms",
            "Financial institutions",
            "QBC licensing",
            "Premium intelligence feeds",
            "Managed services",
            "Tokenized intelligence assets"
          ].map((item) => (
            <div key={item} className="p-2 bg-muted/30 rounded text-sm text-muted-foreground text-center">
              {item}
            </div>
          ))}
        </div>
        <p className="text-foreground font-medium">
          There is no ad model. No surveillance economy. No manipulation incentive.
        </p>

        <h4 className="text-lg font-bold text-foreground mt-6 mb-3">Governance Principles</h4>
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <p className="text-muted-foreground italic">
            "LEXIE is structured so the world can benefit financially without turning intelligence into 
            a popularity contest. Economic participation does not equal governance control."
          </p>
        </div>
      </section>

      {/* QBC Ecosystem Integration */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">
          QBC Ecosystem Integration
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE serves as the operational crown of the QBC ecosystem, consuming and producing 
          intelligence through all other modules:
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Hexagon className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">QBC Encoding</h5>
            <p className="text-sm text-muted-foreground">
              All intelligence artifacts are encoded as GIOs for post-quantum secure storage and transmission.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Layers className="w-6 h-6 text-quantum-blue mb-2" />
            <h5 className="font-bold text-foreground mb-1">MESH 34 Transport</h5>
            <p className="text-sm text-muted-foreground">
              Intelligence moves through quantum-resistant channels with physical-layer sovereignty.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Lock className="w-6 h-6 text-quantum-orange mb-2" />
            <h5 className="font-bold text-foreground mb-1">LUXKEY Identity</h5>
            <p className="text-sm text-muted-foreground">
              Every analyst, system, and intelligence artifact is bound to verified identity via CSI fingerprinting.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Globe className="w-6 h-6 text-quantum-green mb-2" />
            <h5 className="font-bold text-foreground mb-1">EarthPulse Sensing</h5>
            <p className="text-sm text-muted-foreground">
              Geophysical intelligence feeds provide unique data streams unavailable to adversaries.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Radio className="w-6 h-6 text-quantum-purple mb-2" />
            <h5 className="font-bold text-foreground mb-1">FractalPulse Auth</h5>
            <p className="text-sm text-muted-foreground">
              Continuous authentication ensures only authorized actors access sensitive intelligence.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <GitBranch className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Bridge Protocol</h5>
            <p className="text-sm text-muted-foreground">
              Seamless interoperability with legacy systems during transition to full signal sovereignty.
            </p>
          </div>
        </div>
      </section>

      {/* Global Benefit Statement */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Global Benefit</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LEXIE exists to:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li><strong className="text-foreground">Reduce catastrophic blind spots</strong> — preventing the failures that come from not seeing connections</li>
          <li><strong className="text-foreground">Raise the cost of attacks on civilization</strong> — making it exponentially harder for adversaries to succeed</li>
          <li><strong className="text-foreground">Improve coordination without centralized control</strong> — enabling cooperation while preserving sovereignty</li>
          <li><strong className="text-foreground">Enable shared understanding across borders</strong> — through universal geometric language</li>
          <li><strong className="text-foreground">Prepare humanity for a post-quantum future</strong> — security that survives the next computing revolution</li>
        </ul>

        <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl">
          <p className="text-lg text-foreground font-medium text-center mb-4">
            "LEXIE does not decide for humanity. It ensures humanity can see clearly enough to decide for itself."
          </p>
          <p className="text-muted-foreground text-center italic">
            LEXIE transforms global risk, intelligence, and infrastructure into a secure, visual, post-quantum 
            language that humans and machines can understand — enabling clarity, coordination, and sovereignty 
            in an era of systemic uncertainty.
          </p>
        </div>
      </section>
    </article>
  );
};

export default LEXIEModule;
