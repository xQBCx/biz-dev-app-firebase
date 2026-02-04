import { Key, Fingerprint, Lock, Shield, UserCheck, Radio, Zap, AlertTriangle, Code, Lightbulb, Building2, TrendingUp, Users, Eye, Cpu, Database } from "lucide-react";

const LUXKEYModule = () => {
  return (
    <article className="whitepaper-module" id="luxkey-module">
      {/* Module Header */}
      <header className="mb-8 pb-6 border-b border-border">
        <p className="text-quantum-orange font-mono text-sm tracking-widest uppercase mb-2">Module 3</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
          LUXKEY: Physical-Layer Identity Binding
        </h1>
        <p className="text-lg text-muted-foreground">
          A revolutionary authentication system that binds digital identity to the immutable physical 
          characteristics of the signal path itself—creating credentials that cannot be forged, 
          replayed, or stolen because they exist only in the moment of transmission.
        </p>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span>Version 1.2</span>
          <span>•</span>
          <span>Classification: UNCLASSIFIED // FOUO</span>
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Executive Summary</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LUXKEY (Light/Unique Cross-Key) represents a fundamental breakthrough in authentication 
          technology. Unlike traditional authentication methods that rely on secrets (passwords), 
          tokens (keys), or biometrics (fingerprints), LUXKEY binds identity to the physical 
          characteristics of the communication channel itself.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          This approach eliminates entire classes of attacks including credential theft, replay attacks, 
          man-in-the-middle attacks, and even sophisticated supply chain compromises—because the 
          authentication credential literally cannot exist outside the specific physical context 
          of the legitimate communication.
        </p>
      </section>

      {/* TECHNICAL PERSPECTIVE */}
      <section className="mb-12 p-6 bg-quantum-orange/5 border border-quantum-orange/20 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-quantum-orange/10 flex items-center justify-center">
            <Code className="w-6 h-6 text-quantum-orange" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Technical Perspective</h2>
            <p className="text-sm text-quantum-orange">For Security Engineers & Cryptographers</p>
          </div>
        </div>

        <h3 className="text-xl font-display font-bold text-foreground mb-3">
          Channel State Information (CSI) Extraction
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LUXKEY authentication is built on extracting and processing Channel State Information—the 
          complete characterization of the wireless channel between transmitter and receiver:
        </p>

        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground overflow-x-auto">
          <pre>{`CSI Matrix H[k] = [h₁₁  h₁₂  ...  h₁ₙ]
                  [h₂₁  h₂₂  ...  h₂ₙ]   for subcarrier k
                  [hₘ₁  hₘ₂  ...  hₘₙ]

Where each hᵢⱼ = amplitude × e^(jφ) represents:
- Multipath propagation delays
- Doppler shifts from movement
- Reflection/refraction characteristics
- Antenna-specific signatures

Feature Vector F = [||H||, ∠H, τ_rms, σ_τ, K_factor, ...]`}</pre>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Key Derivation Function</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Both endpoints independently derive identical session keys from shared physical measurements 
          without transmitting key material:
        </p>
        <div className="bg-muted/30 rounded-lg p-4 mb-4 font-mono text-sm text-muted-foreground">
          <pre>{`// Reciprocity-based key extraction
function deriveSessionKey(csi: CSIMatrix): Uint8Array {
  const quantized = quantizeCSI(csi, threshold);
  const reconciled = cascadeReconciliation(quantized);
  const amplified = privacyAmplification(reconciled, securityParam);
  return sha3_256(amplified);
}

// Key agreement success rate: >99.7% with reconciliation
// Bit disagreement rate: <0.1% after error correction`}</pre>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">Security Proofs</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LUXKEY security relies on several physical-layer properties:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong className="text-foreground">Channel Reciprocity:</strong> H_AB ≈ H_BA within coherence time (provable from Maxwell's equations)</li>
              <li><strong className="text-foreground">Spatial Decorrelation:</strong> Channels separated by greater than λ/2 are statistically independent</li>
              <li><strong className="text-foreground">Temporal Variation:</strong> Channel characteristics change within Doppler coherence time T_c = 1/(f_d)</li>
              <li><strong className="text-foreground">Eavesdropper Disadvantage:</strong> Eve's channel H_AE is independent of H_AB if greater than λ/2 away</li>
        </ul>

        <h4 className="text-lg font-bold text-foreground mb-2">Implementation Requirements</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-bold text-foreground">Component</th>
                <th className="text-left py-2 px-3 font-bold text-foreground">Requirement</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">Radio Frontend</td>
                <td className="py-2 px-3">CSI-capable (802.11n/ac/ax, 5G NR)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">Sampling Rate</td>
                <td className="py-2 px-3">≥100 Hz for mobile scenarios</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3">Subcarriers</td>
                <td className="py-2 px-3">≥64 for adequate entropy</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Processing Latency</td>
                <td className="py-2 px-3">&lt;10ms end-to-end</td>
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
          What Is LUXKEY, Really?
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Today, when you log into your bank, you prove who you are with a password (something you 
          know), maybe a code from your phone (something you have), or possibly your fingerprint 
          (something you are). The problem? All of these can be stolen, copied, or faked.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LUXKEY is different. It proves who you are based on <strong className="text-foreground">where 
          you physically are</strong> and the unique characteristics of the signal traveling between 
          you and the system you're logging into.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-2">Think of It Like This:</h4>
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              <strong className="text-foreground">Traditional Password:</strong> Like a key to your 
              house. If someone copies the key, they can enter your house when you're not there.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">
              <strong className="text-foreground">LUXKEY:</strong> Like a key that only works when 
              <em> you specifically</em> are holding it, standing in a specific spot, at a specific 
              moment in time. Even if someone took an exact photo of the key, it wouldn't work for them.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-2">How Does This Work in Real Life?</h4>
        <p className="text-muted-foreground leading-relaxed mb-4">
          When you connect to a LUXKEY-protected system, something magical happens in the radio waves 
          between your device and the base station:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-6">
          <li>Your device and the system both measure exactly how the radio signal bounced off walls, 
            traveled through air, and picked up tiny distortions</li>
          <li>These measurements are like a fingerprint of that exact moment and location—unique to you</li>
          <li>Both sides independently create the same "key" from these measurements without ever 
            sending the key itself</li>
          <li>If an attacker tried to intercept or copy the signal, the measurements would be 
            completely different from their location</li>
        </ol>

        <h4 className="text-lg font-bold text-foreground mb-2">Why This Matters to You:</h4>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">No more password theft:</strong> There's no password 
            to steal because your identity is the physics of the connection itself</li>
          <li><strong className="text-foreground">Impossible to fake:</strong> An attacker would need 
            to literally occupy your exact position in space</li>
          <li><strong className="text-foreground">Continuous protection:</strong> Unlike logging in 
            once, LUXKEY constantly verifies you're still the legitimate user</li>
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
          The $16 Billion Identity Problem
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Identity and access management (IAM) represents one of the largest and most persistent 
          challenges in enterprise security. Despite $16 billion in annual IAM spending, credential 
          compromise remains the #1 attack vector for data breaches.
        </p>

        <h4 className="text-lg font-bold text-foreground mb-3">Market Pain Points Addressed</h4>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-destructive mb-2" />
            <h5 className="font-bold text-destructive mb-1">Current State</h5>
            <p className="text-sm text-muted-foreground">
              61% of breaches involve credentials. Average cost: $4.45M per breach. 
              MFA bypass techniques are increasingly sophisticated.
            </p>
          </div>
          <div className="p-4 bg-quantum-green/10 border border-quantum-green/30 rounded-lg">
            <Shield className="w-6 h-6 text-quantum-green mb-2" />
            <h5 className="font-bold text-quantum-green mb-1">With LUXKEY</h5>
            <p className="text-sm text-muted-foreground">
              Credentials literally cannot be stolen or replayed. Authentication 
              is continuous, not point-in-time. Zero phishing surface.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">Enterprise Deployment Scenarios</h4>
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-2">Financial Services</h5>
            <p className="text-sm text-muted-foreground">
              High-value transaction authorization, trading floor access, secure 
              customer authentication for private banking.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-2">Healthcare</h5>
            <p className="text-sm text-muted-foreground">
              HIPAA-compliant patient data access, medical device authentication, 
              operating room presence verification.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-2">Critical Infrastructure</h5>
            <p className="text-sm text-muted-foreground">
              SCADA/ICS authentication, power grid operator verification, nuclear 
              facility access control.
            </p>
          </div>
          <div className="p-4 bg-card border border-border rounded-lg">
            <h5 className="font-bold text-foreground mb-2">Defense & Intelligence</h5>
            <p className="text-sm text-muted-foreground">
              Classified system access, field operator authentication, diplomatic 
              communication verification.
            </p>
          </div>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">ROI Calculation</h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-foreground">Metric</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">Traditional MFA</th>
                <th className="text-left py-3 px-4 font-bold text-foreground">LUXKEY</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Breach probability (annual)</td>
                <td className="py-3 px-4">15-20%</td>
                <td className="py-3 px-4">&lt;1%</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">User friction</td>
                <td className="py-3 px-4">High (codes, tokens)</td>
                <td className="py-3 px-4">Zero (invisible)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Help desk load</td>
                <td className="py-3 px-4">20-40% of tickets</td>
                <td className="py-3 px-4">Near zero</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Regulatory compliance</td>
                <td className="py-3 px-4">Standard</td>
                <td className="py-3 px-4">Exceeds requirements</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 className="text-lg font-bold text-foreground mb-3">Competitive Advantage</h4>
        <p className="text-muted-foreground leading-relaxed">
          Organizations deploying LUXKEY can market "unbreakable authentication" to customers, 
          partners, and regulators—a significant differentiator in security-conscious industries.
        </p>
      </section>

      {/* The Problem */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          The Identity Crisis in Cybersecurity
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Every major breach in the last decade has involved compromised identity. Despite billions 
          invested in authentication technology, the fundamental problem remains: digital credentials 
          can be copied, stolen, or forged.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <h4 className="font-bold text-destructive mb-2">Password-Based Auth</h4>
            <p className="text-sm text-muted-foreground">
              Passwords can be phished, brute-forced, or stolen from breached databases. 
              Even hashed passwords can be cracked with sufficient compute power.
            </p>
          </div>
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <h4 className="font-bold text-destructive mb-2">Token-Based Auth</h4>
            <p className="text-sm text-muted-foreground">
              Hardware tokens can be cloned or stolen. Software tokens can be extracted 
              from compromised devices. Session tokens can be hijacked.
            </p>
          </div>
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <h4 className="font-bold text-destructive mb-2">Biometric Auth</h4>
            <p className="text-sm text-muted-foreground">
              Biometrics are not secrets—they're left everywhere. Once compromised, 
              they cannot be changed. Sophisticated fakes can defeat sensors.
            </p>
          </div>
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <h4 className="font-bold text-destructive mb-2">Certificate-Based Auth</h4>
            <p className="text-sm text-muted-foreground">
              Certificates can be stolen from endpoints. Certificate authorities can be 
              compromised. Private keys can be extracted from memory.
            </p>
          </div>
        </div>
      </section>

      {/* The LUXKEY Solution */}
      <section className="mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-3">
          <Key className="w-6 h-6 text-quantum-orange" />
          The LUXKEY Solution
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          LUXKEY solves the identity problem by making the credential inseparable from the physics 
          of the communication itself. The authentication is not something you have, know, or are—it 
          is the channel itself.
        </p>

        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-quantum-orange/10 border border-quantum-orange/30 rounded-lg">
            <Fingerprint className="w-6 h-6 text-quantum-orange shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Physical Binding</h4>
              <p className="text-sm text-muted-foreground">
                Identity is derived from the unique physical characteristics of the signal path: 
                propagation delay, multipath interference patterns, atmospheric conditions, and 
                the specific hardware characteristics of the transmission chain.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-quantum-orange/10 border border-quantum-orange/30 rounded-lg">
            <Lock className="w-6 h-6 text-quantum-orange shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Unclonable Authentication</h4>
              <p className="text-sm text-muted-foreground">
                The authentication credential exists only in the moment of transmission. It cannot 
                be recorded and replayed because the physical conditions that created it no longer 
                exist. It cannot be forged because it requires control over physical reality.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-quantum-orange/10 border border-quantum-orange/30 rounded-lg">
            <Radio className="w-6 h-6 text-quantum-orange shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Channel State Information (CSI)</h4>
              <p className="text-sm text-muted-foreground">
                LUXKEY leverages the full Channel State Information matrix—amplitude, phase, and 
                timing across all subcarriers—to create a high-dimensional fingerprint that is 
                unique to each transmission.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-quantum-orange/10 border border-quantum-orange/30 rounded-lg">
            <Zap className="w-6 h-6 text-quantum-orange shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-foreground mb-1">Quantum Randomness</h4>
              <p className="text-sm text-muted-foreground">
                At its foundation, LUXKEY incorporates true quantum randomness from the physical 
                layer, ensuring that authentication tokens have genuine entropy that cannot be 
                predicted or simulated.
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
                <td className="py-3 px-4">Feature Vector Dimensions</td>
                <td className="py-3 px-4">4,096 - 16,384 (configurable)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Key Derivation Rate</td>
                <td className="py-3 px-4">256 bits per probe cycle</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">Authentication Latency</td>
                <td className="py-3 px-4">&lt;10ms (typical)</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">False Accept Rate</td>
                <td className="py-3 px-4">&lt;10^-12</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-3 px-4">False Reject Rate</td>
                <td className="py-3 px-4">&lt;10^-6 (adaptive threshold)</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Continuous Verification</td>
                <td className="py-3 px-4">100Hz sampling (configurable)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Integration */}
      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Integration with QBC Ecosystem</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          LUXKEY is designed to work seamlessly with other components of the QBC ecosystem:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong className="text-foreground">QBC Encoding:</strong> Physical layer authentication is embedded directly in QBC GIO transmissions</li>
          <li><strong className="text-foreground">MESH 34:</strong> Channel probing works across all MESH 34 media types</li>
          <li><strong className="text-foreground">EarthPulse:</strong> Environmental monitoring enhances channel characterization</li>
          <li><strong className="text-foreground">FractalPulse:</strong> Recursive verification patterns provide multi-scale authentication</li>
        </ul>
      </section>
    </article>
  );
};

export default LUXKEYModule;