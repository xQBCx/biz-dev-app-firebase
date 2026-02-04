import { Hexagon, Clock, Radio, GitBranch, Shield, Cpu, Database, Lock, Users, Building2, GraduationCap, Code, Lightbulb, TrendingUp, CircuitBoard, Binary, Layers } from "lucide-react";

const QBCModule = () => {
  return (
    <article className="whitepaper-module" id="qbc-module">
      {/* Module Header */}
      <header className="mb-8 pb-6 border-b border-border">
        <p className="text-primary font-mono text-sm tracking-widest uppercase mb-2">Module 1</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Quantum Bit Code (QBC)
        </h1>
        <p className="text-lg text-muted-foreground">
          A revolutionary encoding system that transforms information into dynamic geometric structures, 
          providing quantum-resistant security through mathematical complexity rather than computational difficulty.
        </p>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span>Version 2.1</span>
          <span>•</span>
          <span>Classification: UNCLASSIFIED // FOUO</span>
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Executive Summary</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Quantum Bit Code (QBC) represents a paradigm shift in information encoding and security. Unlike 
          traditional cryptographic systems that rely on the computational difficulty of mathematical problems 
          (such as prime factorization), QBC encodes information as evolving geometric structures within a 
          multi-dimensional lattice framework.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          This approach provides inherent resistance to quantum computing attacks because the security is 
          derived from the geometric complexity of the encoding space, not from problems that quantum 
          computers can efficiently solve.
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
            <p className="text-sm text-primary">For Engineers, Developers & Security Professionals</p>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          Architecture Overview
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          QBC operates on a 13-vertex lattice derived from Metatron's Cube, creating 78 potential connection 
          lines. Each character in the input alphabet maps to a specific anchor point on the lattice. When 
          encoding a word or phrase, the system traces a continuous polyline path through these anchor points, 
          with the path order determined by the character sequence.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-2">Encoding Algorithm</h4>
        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground overflow-x-auto">
          <pre>{`function encodeToGIO(text: string, lattice: Lattice): GIO {
  const normalizedText = normalize(text.toUpperCase());
  const path: Point3D[] = [];
  
  for (const char of normalizedText) {
    const anchor = lattice.getAnchor(char);
    if (anchor) {
      path.push({
        x: anchor.x,
        y: anchor.y,
        z: getZFromOrientation(anchor, orientation)
      });
    }
  }
  
  return {
    path,
    contentHash: sha256(normalizedText + lattice.key),
    timestamp: Date.now(),
    latticeVersion: lattice.version
  };
}`}</pre>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Lattice Mathematics</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Metatron's Cube lattice provides specific geometric properties essential for security:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          <li><strong className="text-foreground">Vertex Density:</strong> 13 vertices in a unit circle, with coordinates defined by: 
            <code className="bg-muted px-2 py-0.5 rounded text-sm">v_i = (cos(2πi/6), sin(2πi/6))</code> for outer ring, plus center point</li>
          <li><strong className="text-foreground">Edge Connectivity:</strong> Each vertex connects to every other vertex, creating C(13,2) = 78 edges</li>
          <li><strong className="text-foreground">Symmetry Group:</strong> D6 dihedral symmetry with 12 symmetry operations (6 rotations + 6 reflections)</li>
          <li><strong className="text-foreground">Path Enumeration:</strong> For a word of length n, the path visits n anchor points in sequence, but orientation 
            transforms (yaw, pitch, roll) multiply the solution space by 360³ degrees of freedom</li>
        </ul>

        <h4 className="text-lg font-bold text-foreground mb-2">Content Hashing</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Each GIO includes a SHA-256 content hash computed from: <code className="bg-muted px-2 py-0.5 rounded text-sm">
          hash = SHA256(normalizedText || latticeKey || pathJSON || styleJSON)</code>
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          This ensures that any modification to the original text, lattice configuration, or path representation 
          will invalidate the hash, providing tamper-evidence for encoded content.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-2">3D Encoding Extensions</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The 3D encoding variant expands the lattice to a 7×7×7 cubic grid (343 anchor points) or a Metatron's Cube 
          projection in 3-space. Characters from extended character sets (Latin, Cyrillic, Greek, Hebrew, Arabic, CJK 
          radicals) are strategically distributed across the XYZ axes to ensure paths have genuine depth and don't 
          collapse to a 2D plane.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-2">API Specification</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-bold text-foreground">Endpoint</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Method</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Parameters</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-mono text-xs">/api/qbc/encode</td>
                <td className="py-2 px-3">POST</td>
                <td className="py-2 px-3">text, latticeId, orientation?, style?</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-mono text-xs">/api/qbc/decode</td>
                <td className="py-2 px-3">POST</td>
                <td className="py-2 px-3">glyphPackage | svgData</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-mono text-xs">/api/qbc/verify</td>
                <td className="py-2 px-3">POST</td>
                <td className="py-2 px-3">contentHash, expectedText</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-xs">/api/lattices</td>
                <td className="py-2 px-3">GET</td>
                <td className="py-2 px-3">orgId?, includePrivate?</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* LAYMAN PERSPECTIVE */}
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
          What Is QBC, Really?
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Imagine you want to send a secret message to a friend. Traditional encryption is like writing 
          your message, then scrambling it with a mathematical formula so only someone with the "key" 
          can unscramble it. The problem? Future computers (quantum computers) will be able to guess 
          those keys almost instantly.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          QBC takes a completely different approach. Instead of scrambling letters and numbers, it 
          <strong className="text-foreground"> transforms your message into a unique geometric shape</strong>—like 
          a fingerprint made of connected dots and lines. Each word creates its own distinctive pattern 
          that can only be "read" by someone who knows the exact map of how letters connect to dots.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-2">Think of It Like This:</h4>
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Traditional Encryption:</strong> Writing a message in 
              invisible ink that can only be revealed with a special chemical. But if someone invents 
              a new chemical scanner, they can read all your messages.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              <strong className="text-foreground">QBC Encoding:</strong> Turning your message into a 
              3D sculpture where each word is a unique twist and turn through space. Even if someone 
              sees the sculpture, they can't know what words created it without the secret blueprint.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Why Does This Matter to You?</h4>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">Your bank details stay safe</strong> even when super-powerful 
            computers exist that could crack today's passwords in seconds</li>
          <li><strong className="text-foreground">Your private messages remain private</strong> because the 
            "shape" of your message can't be reverse-engineered</li>
          <li><strong className="text-foreground">Your identity is protected</strong> in ways that current 
            security systems simply cannot achieve</li>
        </ul>

        <h4 className="text-lg font-bold text-foreground mt-6 mb-2">Real-World Analogy</h4>
        <p className="text-muted-foreground leading-relaxed">
          Consider a constellation in the night sky. If you connect the stars in a specific order, you 
          get Orion or the Big Dipper. QBC works similarly—your message determines which "stars" to 
          connect and in what order, creating a pattern that's meaningless without knowing the original 
          message that created it.
        </p>
      </section>

      {/* CORPORATE PERSPECTIVE */}
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
          Executive Business Case
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The global cybersecurity market is projected to reach $376 billion by 2029. However, the 
          emergence of quantum computing poses an existential threat to all current encryption standards. 
          Organizations that fail to transition to quantum-resistant security face not only data breaches 
          but complete operational compromise.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-3">Market Drivers</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Regulatory Pressure</h5>
            <p className="text-sm text-muted-foreground">
              NIST has mandated post-quantum cryptography adoption by 2035. Early adopters gain 
              competitive advantage and compliance head start.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Shield className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">"Harvest Now, Decrypt Later"</h5>
            <p className="text-sm text-muted-foreground">
              Nation-state actors are storing encrypted data today for future quantum decryption. 
              Data protected only by RSA/ECC is already compromised in future terms.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Users className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Customer Trust</h5>
            <p className="text-sm text-muted-foreground">
              Enterprises demonstrating quantum-readiness signal security leadership to customers, 
              partners, and investors.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Building2 className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Insurance Requirements</h5>
            <p className="text-sm text-muted-foreground">
              Cyber insurance providers are beginning to require post-quantum security measures 
              for coverage renewal.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">Deployment Models</h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-foreground">Model</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Best For</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Pricing</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-bold text-foreground">SaaS API</td>
                <td className="py-3 px-4">Rapid integration, variable workloads</td>
                <td className="py-3 px-4">Per-word / per-GIO usage</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-bold text-foreground">Enterprise License</td>
                <td className="py-3 px-4">High-volume, on-premise deployment</td>
                <td className="py-3 px-4">Annual license + custom lattices</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-foreground">Government Contract</td>
                <td className="py-3 px-4">Classified environments, custom requirements</td>
                <td className="py-3 px-4">Custom negotiation</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">ROI Considerations</h4>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">Breach Prevention:</strong> Average data breach cost in 2024: $4.45M. 
            QBC protection prevents catastrophic exposure of sensitive communications.</li>
          <li><strong className="text-foreground">Compliance Cost Reduction:</strong> Unified quantum-resistant solution 
            reduces point-solution sprawl and audit complexity.</li>
          <li><strong className="text-foreground">Future-Proofing:</strong> Single implementation protects against 
            both current and future quantum threats—no migration required.</li>
          <li><strong className="text-foreground">Competitive Differentiation:</strong> "Quantum-Secure" messaging 
            commands premium positioning in security-conscious markets.</li>
        </ul>
      </section>

      {/* Core Concepts */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Core Concepts</h2>
        
        <h3 className="text-xl font-display font-bold text-foreground mb-3 mt-6">
          Geometric Information Objects (GIOs)
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          At the heart of QBC are Geometric Information Objects (GIOs)—multi-dimensional data structures 
          that encode information through their shape, orientation, and evolution over time. Each GIO is:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li><strong className="text-foreground">Unique:</strong> No two encodings of different data can produce identical geometric signatures</li>
          <li><strong className="text-foreground">Verifiable:</strong> The integrity of encoded information can be validated without decryption</li>
          <li><strong className="text-foreground">Evolvable:</strong> GIOs can transform over time, enabling temporal security protocols</li>
          <li><strong className="text-foreground">Composable:</strong> Multiple GIOs can be combined to encode complex data structures</li>
        </ul>

        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          The Metatron's Cube Foundation
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          QBC utilizes Metatron's Cube as its foundational lattice structure. This sacred geometric form 
          provides 13 interconnected vertices creating 78 lines of connection, offering an extraordinarily 
          dense encoding space.
        </p>
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <p className="text-primary font-mono text-sm">
            LATTICE SPECIFICATION: 13 vertices × 78 connection lines × 4 dimensional variables = 
            theoretical encoding space of 10^47 unique states per word
          </p>
        </div>
      </section>

      {/* Multi-Dimensional Variables */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Multi-Dimensional Variables</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          QBC encoding operates across four primary dimensional variables, each adding exponential 
          complexity to the encoding space:
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Hexagon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-display font-bold text-foreground">Space</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Multi-dimensional lattice positioning within the geometric structure. Each character maps 
              to specific anchor points, with paths traced through the lattice creating unique spatial signatures.
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-display font-bold text-foreground">Time</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Temporal evolution of the encoding pattern over transmission. GIOs can be configured to 
              transform according to predetermined schedules, enabling time-locked access controls.
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Radio className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-display font-bold text-foreground">Spectrum</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Frequency-domain distribution across available bandwidth. Encoding can be spread across 
              multiple frequency bands, enabling covert transmission and jamming resistance.
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-display font-bold text-foreground">Fractalization</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Recursive self-similar patterns at multiple scales. Information is encoded at multiple 
              resolution levels, enabling progressive disclosure and error recovery.
            </p>
          </div>
        </div>
      </section>

      {/* Security Model */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Post-Quantum Security Model</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Traditional encryption methods face an existential threat from quantum computing. Algorithms like 
          RSA and ECC rely on the difficulty of factoring large numbers or solving discrete logarithm 
          problems—tasks that quantum computers can perform efficiently using Shor's algorithm.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-6">
          QBC's security derives from fundamentally different mathematical properties:
        </p>

        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-card border border-border rounded-lg">
            <Shield className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Geometric Complexity</h4>
              <p className="text-sm text-muted-foreground">
                The encoding space is defined by continuous geometric transformations, not discrete 
                mathematical operations. There is no known quantum algorithm that provides speedup 
                for geometric space search.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-card border border-border rounded-lg">
            <Cpu className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Lattice-Based Hardness</h4>
              <p className="text-sm text-muted-foreground">
                The underlying lattice structure leverages problems from lattice-based cryptography, 
                specifically the Shortest Vector Problem (SVP) and Learning With Errors (LWE), which 
                remain hard for quantum computers.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-card border border-border rounded-lg">
            <Database className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Information-Theoretic Properties</h4>
              <p className="text-sm text-muted-foreground">
                Certain QBC configurations achieve information-theoretic security, meaning they are 
                secure against any adversary regardless of computational resources—classical or quantum.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-card border border-border rounded-lg">
            <Lock className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Physical Layer Integration</h4>
              <p className="text-sm text-muted-foreground">
                QBC encoding can be directly mapped to physical signal characteristics, enabling 
                security that is literally embedded in the laws of physics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Technical Specifications</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-foreground">Parameter</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Specification</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Lattice Structure</td>
                <td className="py-3 px-4">Metatron's Cube (13 vertices, 78 edges)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Encoding Capacity</td>
                <td className="py-3 px-4">20-50 bytes per GIO (word-level)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Output Formats</td>
                <td className="py-3 px-4">SVG, JSON, Binary Protocol</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Character Support</td>
                <td className="py-3 px-4">Latin, Cyrillic, Greek, Hebrew, Arabic, CJK</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Security Level</td>
                <td className="py-3 px-4">NIST PQC Level 5 equivalent</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Encoding Latency</td>
                <td className="py-3 px-4">&lt;1ms per word (reference implementation)</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Decoding Requirements</td>
                <td className="py-3 px-4">Licensed lattice key + authorized decoder</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Implementation */}
      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Implementation Considerations</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          QBC is designed for integration into existing communication and security infrastructure. 
          Key implementation considerations include:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">API Integration:</strong> RESTful and gRPC endpoints for encode/decode operations</li>
          <li><strong className="text-foreground">SDK Availability:</strong> Native libraries for JavaScript/TypeScript, Python, Go, and Rust</li>
          <li><strong className="text-foreground">Lattice Management:</strong> Organization-specific lattice customization with versioning</li>
          <li><strong className="text-foreground">Audit Logging:</strong> Complete cryptographic audit trail for all encoding operations</li>
          <li><strong className="text-foreground">Offline Decoding:</strong> Licensed decoder packages for air-gapped environments</li>
        </ul>
      </section>
    </article>
  );
};

export default QBCModule;