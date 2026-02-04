import { ArrowLeftRight, Radio, Shield, Cpu, Lock, Zap, Database, Settings, Code, Lightbulb, Building2, TrendingUp, GitMerge, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

const BridgeModule = () => {
  return (
    <article className="whitepaper-module" id="bridge-module">
      {/* Module Header */}
      <header className="mb-8 pb-6 border-b border-border">
        <p className="text-primary font-mono text-sm tracking-widest uppercase mb-2">Module 6</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          The Quantum-Classical Bridge
        </h1>
        <p className="text-lg text-muted-foreground">
          Patented technology enabling seamless integration between existing classical infrastructure 
          and emerging quantum systems—ensuring organizations can protect their communications today 
          while preparing for the quantum future.
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
          The Foundational Bridge is the critical technology layer that enables the QBC ecosystem to 
          operate across both classical and quantum communication infrastructure. Rather than requiring 
          a complete infrastructure replacement, the Bridge provides an evolutionary path that 
          protects existing investments while enabling quantum-ready security.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          This technology is protected by 10 provisional patent claims covering quantum-classical 
          interoperability protocols.
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
            <p className="text-sm text-primary">For Quantum Engineers & System Architects</p>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          Hybrid Key Encapsulation Mechanism (HKEM)
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Bridge implements a hybrid key encapsulation that combines classical and post-quantum 
          cryptography with optional QKD enhancement:
        </p>

        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground overflow-x-auto">
          <pre>{`// Hybrid Key Encapsulation
function encapsulateKey(
  recipientPubKey: PublicKey,
  qkdSession?: QKDSession
): { ciphertext: Uint8Array; sharedSecret: Uint8Array } {
  
  // Layer 1: Classical ECDH (X25519)
  const ecdh = X25519.keyAgreement(recipientPubKey.classical);
  
  // Layer 2: Post-Quantum KEM (ML-KEM-1024 / Kyber)
  const pqkem = MLKEM1024.encapsulate(recipientPubKey.postQuantum);
  
  // Layer 3: QKD-derived key (if available)
  const qkdKey = qkdSession?.deriveKey(256) ?? new Uint8Array(32);
  
  // Combine using domain-separated HKDF
  const combinedSecret = HKDF.expand(
    HKDF.extract(ecdh.secret, pqkem.sharedSecret),
    qkdKey,
    "QBC-Bridge-HKEM-v1",
    32
  );
  
  return {
    ciphertext: concat(ecdh.ciphertext, pqkem.ciphertext),
    sharedSecret: combinedSecret
  };
}`}</pre>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">QKD Protocol Integration</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Bridge supports multiple QKD protocols through an abstraction layer:
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-bold text-foreground">Protocol</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Type</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Key Rate</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Max Distance</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">BB84</td>
                <td className="py-2 px-3">Prepare-and-measure</td>
                <td className="py-2 px-3">~1 Mbps</td>
                <td className="py-2 px-3">100 km</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">E91</td>
                <td className="py-2 px-3">Entanglement-based</td>
                <td className="py-2 px-3">~100 kbps</td>
                <td className="py-2 px-3">150 km</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">MDI-QKD</td>
                <td className="py-2 px-3">Measurement-device-independent</td>
                <td className="py-2 px-3">~10 kbps</td>
                <td className="py-2 px-3">400 km</td>
              </tr>
              <tr>
                <td className="py-2 px-3">TF-QKD</td>
                <td className="py-2 px-3">Twin-field</td>
                <td className="py-2 px-3">~1 kbps</td>
                <td className="py-2 px-3">500+ km</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Security Downgrade Prevention</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Bridge implements strict policies to prevent attackers from forcing degraded security:
        </p>
        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground">
          <pre>{`SecurityPolicy = {
  minimumClassical: "X25519 + AES-256-GCM",
  minimumPostQuantum: "ML-KEM-768",  // NIST Level 3
  qkdFallbackAllowed: true,           // Can proceed without QKD
  degradeToClassicalOnly: false,      // NEVER allow PQ bypass
  
  // Enforcement
  onNegotiationFailure: "ABORT",      // Don't try weaker options
  onQKDUnavailable: "LOG_AND_PROCEED" // QKD is enhancement, not requirement
}`}</pre>
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
          What Is the Quantum-Classical Bridge, Really?
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Imagine the internet is like a highway system. Right now, all our "cars" (data) travel on 
          regular roads using regular rules. But quantum computing is like the introduction of 
          flying cars—completely different technology that requires completely different roads.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The problem is: we can't replace all roads with skyways overnight. And flying cars don't 
          exist everywhere yet. So what do we do?
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The <strong className="text-foreground">Quantum-Classical Bridge</strong> is like a smart 
          traffic system that can:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
          <li>Send your message via "flying car" when those routes are available</li>
          <li>Automatically switch to "armored car" (super-secure ground transport) when they're not</li>
          <li>Combine both methods for maximum security when possible</li>
          <li>Never compromise on safety, even if it takes a bit longer</li>
        </ul>

        <h4 className="text-lg font-bold text-foreground mb-2">Why Does This Matter?</h4>
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Without the Bridge:</strong> You'd have to wait 
              until quantum networks are everywhere (probably 10-20 years) before getting quantum 
              security. Meanwhile, your current encryption is increasingly vulnerable.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              <strong className="text-foreground">With the Bridge:</strong> You get quantum-level 
              security TODAY over existing networks. As quantum networks become available in your 
              area, you automatically upgrade to even stronger security—no changes needed.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">The "Harvest Now, Decrypt Later" Threat</h4>
        <p className="text-muted-foreground leading-relaxed">
          Here's the scary part: hostile governments are <em>already</em> recording encrypted 
          messages they can't read today, planning to decrypt them once quantum computers are 
          powerful enough. The Bridge ensures that even recorded messages remain safe because 
          they're protected with methods that quantum computers can't break.
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
          The $50 Billion Quantum Migration Challenge
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Analysts estimate that migrating global IT infrastructure to post-quantum cryptography will 
          cost $50+ billion over the next decade. Most organizations will need to maintain hybrid 
          systems for 15-20 years as quantum infrastructure gradually deploys.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The Bridge provides a single, unified solution for this entire transition period.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-3">Investment Protection Strategy</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <RefreshCw className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Preserve Existing Infrastructure</h5>
            <p className="text-sm text-muted-foreground">
              No need to replace firewalls, VPNs, or network equipment. The Bridge operates as 
              an overlay that adds quantum-grade security.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <GitMerge className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Gradual QKD Integration</h5>
            <p className="text-sm text-muted-foreground">
              As QKD links become available in your geography, they're seamlessly incorporated 
              without application changes.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <Shield className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Compliance Continuity</h5>
            <p className="text-sm text-muted-foreground">
              Meet NIST PQC deadlines (2035) and emerging regulations with a single 
              deployment—no repeated compliance projects.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary mb-2" />
            <h5 className="font-bold text-foreground mb-1">Vendor Independence</h5>
            <p className="text-sm text-muted-foreground">
              The Bridge abstracts QKD vendor differences, avoiding lock-in as the quantum 
              market matures.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">TCO Comparison: 10-Year Horizon</h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-foreground">Approach</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Year 1-3</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Year 4-7</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Year 8-10</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-bold text-foreground">Wait-and-See</td>
                <td className="py-3 px-4 text-destructive">Vulnerable</td>
                <td className="py-3 px-4 text-destructive">Emergency migration</td>
                <td className="py-3 px-4">Costly catch-up</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4 font-bold text-foreground">PQC-Only</td>
                <td className="py-3 px-4">Protected</td>
                <td className="py-3 px-4">QKD migration needed</td>
                <td className="py-3 px-4">Re-architecture</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-foreground">QBC Bridge</td>
                <td className="py-3 px-4 text-quantum-green">Protected</td>
                <td className="py-3 px-4 text-quantum-green">Automatic upgrade</td>
                <td className="py-3 px-4 text-quantum-green">Full quantum-ready</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">Patent Portfolio Value</h4>
        <p className="text-muted-foreground leading-relaxed">
          The 10 provisional patents covering the Bridge create significant IP value. Licensing 
          opportunities exist for:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
          <li>Telecommunications carriers deploying quantum services</li>
          <li>Cloud providers offering quantum-safe enclaves</li>
          <li>Security vendors incorporating hybrid cryptography</li>
          <li>Government agencies requiring sovereign quantum capabilities</li>
        </ul>
      </section>

      {/* The Quantum Transition Challenge */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">The Quantum Transition Challenge</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Organizations face a critical dilemma: quantum computers will eventually break current 
          encryption, but quantum communication infrastructure is decades from widespread deployment. 
          The Bridge solves this by:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-card border border-border rounded-lg">
            <Zap className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-bold text-foreground mb-2">Immediate Protection</h4>
            <p className="text-sm text-muted-foreground">
              Deploy quantum-resistant security today over existing fiber, satellite, and radio 
              infrastructure without hardware modifications.
            </p>
          </div>
          
          <div className="p-4 bg-card border border-border rounded-lg">
            <Settings className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-bold text-foreground mb-2">Gradual Migration</h4>
            <p className="text-sm text-muted-foreground">
              As quantum links become available, integrate them seamlessly without disrupting 
              existing operations or requiring complete system replacement.
            </p>
          </div>
          
          <div className="p-4 bg-card border border-border rounded-lg">
            <Database className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-bold text-foreground mb-2">Investment Protection</h4>
            <p className="text-sm text-muted-foreground">
              Existing infrastructure remains valuable. The Bridge extends its useful life by 
              adding quantum-grade security without replacement.
            </p>
          </div>
          
          <div className="p-4 bg-card border border-border rounded-lg">
            <Lock className="w-6 h-6 text-primary mb-3" />
            <h4 className="font-bold text-foreground mb-2">Harvest-Now Defense</h4>
            <p className="text-sm text-muted-foreground">
              Counter "harvest now, decrypt later" attacks by upgrading current communications 
              to resist future quantum decryption.
            </p>
          </div>
        </div>
      </section>

      {/* Protocol Translation */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Protocol Translation Layer</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          The Bridge translates between multiple protocol families:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-foreground">Classical Protocol</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Bridge Translation</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Quantum Protocol</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">TLS 1.3</td>
                <td className="py-3 px-4">Hybrid Key Encapsulation</td>
                <td className="py-3 px-4">BB84 QKD</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">IPsec/IKEv2</td>
                <td className="py-3 px-4">Post-Quantum Key Exchange</td>
                <td className="py-3 px-4">E91 Entanglement</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">SSH</td>
                <td className="py-3 px-4">Lattice-Based Auth</td>
                <td className="py-3 px-4">MDI-QKD</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Signal Protocol</td>
                <td className="py-3 px-4">QBC GIO Ratchet</td>
                <td className="py-3 px-4">Continuous Variable QKD</td>
              </tr>
              <tr>
                <td className="py-3 px-4">WireGuard</td>
                <td className="py-3 px-4">NIST PQC Wrappers</td>
                <td className="py-3 px-4">Twin-Field QKD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Technical Specifications */}
      <section>
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
                <td className="py-3 px-4">Supported QKD Protocols</td>
                <td className="py-3 px-4">BB84, E91, MDI-QKD, CV-QKD, TF-QKD</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Classical Protocol Support</td>
                <td className="py-3 px-4">TLS 1.2/1.3, IPsec, SSH, WireGuard, Signal</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Key Encapsulation</td>
                <td className="py-3 px-4">NIST PQC (Kyber, Dilithium) + QBC GIO</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Handoff Latency</td>
                <td className="py-3 px-4">&lt;50ms (quantum to classical failover)</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Error Correction Overhead</td>
                <td className="py-3 px-4">10-15% (adaptive, condition-dependent)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
};

export default BridgeModule;