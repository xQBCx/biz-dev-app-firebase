import { Hexagon, Layers, Fingerprint, Shield, Target, Flag, AlertTriangle, CheckCircle, Code, Lightbulb, Building2, TrendingUp, Users, Swords, Globe, BookOpen, Scale } from "lucide-react";

const DoctrineModule = () => {
  return (
    <article className="whitepaper-module" id="doctrine-module">
      {/* Module Header */}
      <header className="mb-8 pb-6 border-b border-border">
        <p className="text-primary font-mono text-sm tracking-widest uppercase mb-2">Module 7</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          Signal Sovereignty: The Post-Quantum Doctrine
        </h1>
        <p className="text-lg text-muted-foreground">
          The strategic framework for achieving absolute control over information pathways—from 
          the physical substrate to the mathematical encoding—in an era of quantum-capable adversaries.
        </p>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span>Version 1.0</span>
          <span>•</span>
          <span>Classification: UNCLASSIFIED // FOUO</span>
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Executive Summary</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Signal Sovereignty is the doctrine that a nation or organization must have absolute control 
          over its information pathways—from the physical substrate to the mathematical encoding. 
          This is not merely a technical goal; it is a strategic imperative for maintaining decision 
          advantage in the 21st century.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The convergence of quantum computing, AI-enabled threats, and physical infrastructure 
          vulnerabilities has created a new battlespace where traditional cybersecurity approaches 
          are insufficient. Signal Sovereignty provides the conceptual framework and practical 
          implementation path for addressing this challenge.
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
            <p className="text-sm text-primary">For Security Architects & Defense Planners</p>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          Threat Model Definition
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Signal Sovereignty addresses a comprehensive threat model that includes nation-state 
          adversaries with the following capabilities:
        </p>

        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground overflow-x-auto">
          <pre>{`ADVERSARY CAPABILITY MATRIX
┌─────────────────────────────────────────────────────────────┐
│ Capability                  │ Current │ 2030    │ 2040    │
├─────────────────────────────────────────────────────────────┤
│ RSA-2048 factoring          │ 10^8 yr │ 10^5 yr │ Hours   │
│ AES-256 brute force         │ Safe    │ Safe    │ Safe    │
│ ECC discrete log            │ Safe    │ Months  │ Minutes │
│ Undersea cable tapping      │ Active  │ Active  │ Active  │
│ Satellite signal intercept  │ Active  │ Active  │ Active  │
│ AI-driven traffic analysis  │ Basic   │ Advanced│ Ubiquit │
│ Physical infrastructure     │ Limited │ Enhanced│ Full    │
└─────────────────────────────────────────────────────────────┘

SIGNAL SOVEREIGNTY COUNTERMEASURES:
- Cryptographic: QBC (geometry-based) + NIST PQC + QKD
- Transport: MESH 34 pan-medium redundancy
- Authentication: LUXKEY (physical) + FractalPulse (mathematical)
- Intelligence: EarthPulse environmental awareness`}</pre>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Defense-in-Depth Architecture</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Signal Sovereignty implements a layered security model where each layer provides 
          independent protection:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-bold text-foreground">Layer</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Component</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Threat Mitigated</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">Physical</td>
                <td className="py-2 px-3">MESH 34 + LUXKEY</td>
                <td className="py-2 px-3">Infrastructure denial, interception</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">Cryptographic</td>
                <td className="py-2 px-3">QBC + Bridge</td>
                <td className="py-2 px-3">Quantum decryption, harvest attacks</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">Authentication</td>
                <td className="py-2 px-3">LUXKEY + FractalPulse</td>
                <td className="py-2 px-3">Identity spoofing, credential theft</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Intelligence</td>
                <td className="py-2 px-3">EarthPulse</td>
                <td className="py-2 px-3">Jamming, manipulation, anomalies</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Minimum Viable Sovereignty</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          For organizations beginning their Signal Sovereignty journey, we define minimum viable 
          configurations:
        </p>
        <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm text-muted-foreground">
          <pre>{`SOVEREIGNTY LEVEL 1 (Commercial):
  - QBC encoding for sensitive communications
  - Bridge with NIST PQC (no QKD required)
  - Standard network infrastructure
  
SOVEREIGNTY LEVEL 2 (Critical Infrastructure):
  - Level 1 + LUXKEY authentication
  - MESH 34 with 2+ medium redundancy
  - EarthPulse monitoring integration
  
SOVEREIGNTY LEVEL 3 (National Security):
  - Level 2 + Full MESH 34 pan-medium
  - QKD links where available
  - FractalPulse for high-value transactions
  - Dedicated EarthPulse sensor network`}</pre>
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
          What Is Signal Sovereignty, Really?
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Think about all the ways you communicate: phone calls, text messages, emails, video 
          chats. Now think about who <em>actually</em> controls these pathways:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li>Your phone company can read your texts</li>
          <li>Internet providers can see your web traffic</li>
          <li>Cloud services can access your files</li>
          <li>Governments can compel access to all of the above</li>
        </ul>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Signal Sovereignty</strong> means taking back control. 
          It's the principle that YOU (or your organization, or your country) should have complete, 
          unbreakable control over your communications—not tech companies, not foreign governments, 
          not hackers.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-2">Why "Sovereignty"?</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We use the word "sovereignty" because it's the same concept as national sovereignty—the 
          idea that a country controls what happens within its borders. Signal Sovereignty extends 
          this to the information realm: you control what happens with your data, period.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-2">The Three Pillars of Signal Sovereignty:</h4>
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-1">1. Nobody Can Read It</h5>
            <p className="text-sm text-muted-foreground">
              Your messages are encoded in a way that no computer—not even future quantum 
              computers—can decode without your permission.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-1">2. Nobody Can Stop It</h5>
            <p className="text-sm text-muted-foreground">
              If someone tries to block your communications—by cutting cables, jamming signals, 
              or shutting down the internet—your messages automatically find another way through.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-1">3. Nobody Can Fake It</h5>
            <p className="text-sm text-muted-foreground">
              When you receive a message, you know with mathematical certainty who sent it. 
              Impersonation is physically impossible.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Who Needs Signal Sovereignty?</h4>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">Governments:</strong> National security communications</li>
          <li><strong className="text-foreground">Businesses:</strong> Trade secrets, executive communications</li>
          <li><strong className="text-foreground">Journalists:</strong> Source protection</li>
          <li><strong className="text-foreground">Activists:</strong> Organizing in oppressive regimes</li>
          <li><strong className="text-foreground">Everyone:</strong> Basic privacy in an age of surveillance</li>
        </ul>
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
          Competitive Advantage Through Information Supremacy
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          In the 21st-century economy, competitive advantage increasingly depends on information. 
          Organizations that achieve Signal Sovereignty gain:
        </p>

        <h4 className="text-lg font-bold text-foreground mb-3">Strategic Benefits</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Swords className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Decision Advantage</h5>
            <p className="text-sm text-muted-foreground">
              When you know your communications are secure, you can share sensitive information 
              faster, enabling quicker strategic decisions than competitors.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Globe className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Global Operations Freedom</h5>
            <p className="text-sm text-muted-foreground">
              Operate confidently in any jurisdiction without worrying about local surveillance 
              or infrastructure vulnerabilities.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Scale className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Regulatory Leadership</h5>
            <p className="text-sm text-muted-foreground">
              Exceed emerging post-quantum security requirements before competitors, avoiding 
              compliance scrambles.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Users className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Trust Premium</h5>
            <p className="text-sm text-muted-foreground">
              Customers, partners, and governments increasingly choose vendors who can 
              demonstrate superior security posture.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">Market Opportunity</h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-foreground">Sector</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">TAM (2030)</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Key Driver</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Government/Defense</td>
                <td className="py-3 px-4">$85B</td>
                <td className="py-3 px-4">National security mandate</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Financial Services</td>
                <td className="py-3 px-4">$45B</td>
                <td className="py-3 px-4">Regulatory + competitive pressure</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Critical Infrastructure</td>
                <td className="py-3 px-4">$35B</td>
                <td className="py-3 px-4">Operational resilience</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Enterprise</td>
                <td className="py-3 px-4">$120B</td>
                <td className="py-3 px-4">IP protection + compliance</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">Investment Thesis</h4>
        <p className="text-muted-foreground leading-relaxed">
          Signal Sovereignty is not optional—it's inevitable. Organizations can invest now at 
          reasonable cost and with strategic advantage, or scramble later at premium cost under 
          regulatory and competitive pressure. Early movers capture market position; laggards 
          pay catch-up premiums.
        </p>
      </section>

      {/* Core Tenets */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Core Tenets</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <Hexagon className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Geometric Security</h4>
              <p className="text-sm text-muted-foreground">
                Information encoded as evolving geometric structures that cannot be reverse-engineered. 
                Security derives from the mathematical complexity of the encoding space, not from 
                computational problems that quantum computers can solve.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-quantum-green/10 border border-quantum-green/30 rounded-lg">
            <Layers className="w-6 h-6 text-quantum-green shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Pan-Medium Transport</h4>
              <p className="text-sm text-muted-foreground">
                Signals that traverse earth, water, atmosphere, and space as a unified medium. 
                No single infrastructure can be targeted to deny communications. Redundancy is 
                built into the physics of the system.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-quantum-orange/10 border border-quantum-orange/30 rounded-lg">
            <Fingerprint className="w-6 h-6 text-quantum-orange shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Physically-Bound Identity</h4>
              <p className="text-sm text-muted-foreground">
                Authentication tied to immutable physical characteristics of the signal path. 
                Identity cannot be forged because it is embedded in the laws of physics—not in 
                secrets, tokens, or biometrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The New Battlespace */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
          <Target className="w-6 h-6 text-destructive" />
          The New Battlespace
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          The threat landscape has fundamentally shifted. Adversaries now target the convergence 
          of cyber and physical domains:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-destructive mb-3" />
            <h4 className="font-bold text-destructive mb-2">Quantum Decryption</h4>
            <p className="text-sm text-muted-foreground">
              "Harvest now, decrypt later" attacks store encrypted traffic today for quantum 
              decryption tomorrow. All current RSA/ECC-protected communications are at risk.
            </p>
          </div>
          
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-destructive mb-3" />
            <h4 className="font-bold text-destructive mb-2">Infrastructure Warfare</h4>
            <p className="text-sm text-muted-foreground">
              Physical attacks on undersea cables, power grids, and satellite systems can 
              disable communications at the physical layer, bypassing all software security.
            </p>
          </div>
          
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-destructive mb-3" />
            <h4 className="font-bold text-destructive mb-2">AI-Enabled Threats</h4>
            <p className="text-sm text-muted-foreground">
              Autonomous systems can identify and exploit vulnerabilities faster than human 
              defenders can respond. Traditional security operations cannot keep pace.
            </p>
          </div>
          
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-destructive mb-3" />
            <h4 className="font-bold text-destructive mb-2">Supply Chain Compromise</h4>
            <p className="text-sm text-muted-foreground">
              Hardware and software supply chains are infiltrated at source, embedding 
              vulnerabilities before systems are even deployed.
            </p>
          </div>
        </div>
      </section>

      {/* Implementation Roadmap */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
          <Flag className="w-6 h-6 text-primary" />
          Implementation Roadmap
        </h2>
        
        <div className="space-y-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-bold text-primary mb-2">Phase 1: Foundation (0-12 months)</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Deploy QBC encoding across existing infrastructure</li>
              <li>• Establish EarthPulse monitoring network</li>
              <li>• Implement LUXKEY for high-value communications</li>
              <li>• Train personnel on Signal Sovereignty concepts</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-bold text-primary mb-2">Phase 2: Expansion (12-36 months)</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Extend MESH 34 to additional media (seismic, acoustic)</li>
              <li>• Integrate FractalPulse authentication across all endpoints</li>
              <li>• Deploy Foundational Bridge for hybrid quantum integration</li>
              <li>• Establish redundant communication paths</li>
            </ul>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <h4 className="font-bold text-primary mb-2">Phase 3: Sovereignty (36+ months)</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Achieve full pan-medium communication capability</li>
              <li>• Complete quantum infrastructure integration</li>
              <li>• Establish autonomous threat response systems</li>
              <li>• Attain true Signal Sovereignty</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Strategic Outcomes */}
      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Strategic Outcomes</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Organizations that achieve Signal Sovereignty gain:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">Decision Advantage:</strong> Secure communications enable faster, more confident decision-making</li>
          <li><strong className="text-foreground">Operational Resilience:</strong> Communications survive infrastructure attacks and natural disasters</li>
          <li><strong className="text-foreground">Future-Proof Security:</strong> Protection against both current and quantum-era threats</li>
          <li><strong className="text-foreground">Trust Foundation:</strong> Authentication that cannot be compromised builds lasting trust</li>
          <li><strong className="text-foreground">Strategic Independence:</strong> No reliance on potentially compromised third-party infrastructure</li>
        </ul>
      </section>
    </article>
  );
};

export default DoctrineModule;