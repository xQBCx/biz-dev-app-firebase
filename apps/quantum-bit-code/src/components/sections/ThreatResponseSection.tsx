import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import { motion } from "motion/react";
import { 
  AlertTriangle, 
  Shield, 
  Lock, 
  Zap, 
  Globe, 
  Server, 
  ArrowRight,
  Clock,
  Target,
  Database
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";

const activeThreats = [
  {
    date: "January 2025",
    title: "NNSA SharePoint Zero-Day Breach",
    actor: "China (State-Sponsored)",
    target: "National Nuclear Security Administration",
    method: "Zero-day vulnerability in Microsoft SharePoint",
    impact: "Access to nuclear command systems",
    icon: Server,
    severity: "critical",
  },
  {
    date: "Ongoing",
    title: "Harvest Now, Decrypt Later",
    actor: "Multiple State Actors",
    target: "Encrypted Government Communications",
    method: "Mass collection of encrypted traffic for future quantum decryption",
    impact: "All current communications at risk when quantum computers mature",
    icon: Database,
    severity: "critical",
  },
  {
    date: "Ongoing",
    title: "Critical Infrastructure Targeting",
    actor: "Russia, China, Iran",
    target: "Power Grids, Water Systems, Transportation",
    method: "SCADA/ICS exploitation, supply chain compromise",
    impact: "Potential cascading infrastructure failures",
    icon: Zap,
    severity: "high",
  },
];

const qbcSolutions = [
  {
    threat: "Software Zero-Day Vulnerabilities",
    solution: "Physical-Layer Security",
    description: "QBC operates at the geometric/physical layer, bypassing software attack surfaces entirely. No login screen to hack.",
    icon: Shield,
    color: "quantum-cyan",
  },
  {
    threat: "Credential & Identity Theft",
    solution: "LUXKEY Geometric Identity",
    description: "Identity bound to physical materials with unique lattice signatures. Cannot be copied, phished, or forged.",
    icon: Lock,
    color: "quantum-orange",
  },
  {
    threat: "Quantum Decryption Risk",
    solution: "GIO Encoding Immunity",
    description: "Geometric Information Objects use lattice mathematics, not factorization. Quantum computers provide no advantage.",
    icon: Target,
    color: "quantum-purple",
  },
  {
    threat: "Infrastructure Hijacking",
    solution: "MESH 34 Resilience",
    description: "Multi-medium signal transport (acoustic, RF, photonic) ensures communication even when primary channels are compromised.",
    icon: Globe,
    color: "quantum-green",
  },
];

const ThreatResponseSection = () => {
  return (
    <section id="threat-response" className="relative py-24 bg-space-void overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      
      {/* Red Alert Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive via-quantum-orange to-destructive animate-pulse" />

      <div className="relative z-10 container px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/20 border border-destructive/40 mb-6">
              <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
              <span className="text-destructive font-mono text-sm tracking-widest uppercase">
                <QBCStaticText glyphHeight="0.875rem">Active Threat Response</QBCStaticText>
              </span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              <QBCDecryptedText 
                text="Real Threats." 
                animateOn="view"
                glyphHeight="2.5rem"
                className="text-foreground"
              />
              <br />
              <span className="text-primary">
                <QBCDecryptedText 
                  text="Real Solutions."
                  animateOn="view"
                  glyphHeight="2.5rem"
                />
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <QBCStaticText glyphHeight="1.125rem">
                Current cyberattacks expose the fundamental vulnerability of software-dependent security. 
                QBC provides physical-layer protection that cannot be bypassed by zero-days, credential theft, or quantum computing.
              </QBCStaticText>
            </p>
          </motion.div>

          {/* Active Threat Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-destructive" />
              <QBCStaticText glyphHeight="1.25rem">Current Threat Landscape</QBCStaticText>
            </h3>
            
            <div className="space-y-4">
              {activeThreats.map((threat, index) => (
                <motion.div
                  key={threat.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className={`
                    bg-card/60 backdrop-blur-sm border rounded-lg p-6
                    ${threat.severity === 'critical' 
                      ? 'border-destructive/40 hover:border-destructive/60' 
                      : 'border-quantum-orange/40 hover:border-quantum-orange/60'
                    }
                    transition-all duration-300 hover:bg-card/80
                  `}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                      ${threat.severity === 'critical' ? 'bg-destructive/20' : 'bg-quantum-orange/20'}
                    `}>
                      <threat.icon className={`w-6 h-6 ${threat.severity === 'critical' ? 'text-destructive' : 'text-quantum-orange'}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {threat.date}
                        </span>
                        <span className={`
                          px-2 py-0.5 rounded text-xs font-semibold uppercase
                          ${threat.severity === 'critical' 
                            ? 'bg-destructive/20 text-destructive' 
                            : 'bg-quantum-orange/20 text-quantum-orange'
                          }
                        `}>
                          {threat.severity}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Actor: <span className="text-foreground">{threat.actor}</span>
                        </span>
                      </div>
                      
                      <h4 className="text-lg font-bold text-foreground mb-1">
                        <QBCStaticText glyphHeight="1.125rem">{threat.title}</QBCStaticText>
                      </h4>
                      
                      <p className="text-sm text-muted-foreground">
                        <span className="text-foreground/80">Target:</span> {threat.target}
                        <span className="mx-2">|</span>
                        <span className="text-foreground/80">Method:</span> {threat.method}
                      </p>
                      
                      <p className="text-sm text-destructive mt-2">
                        <span className="font-semibold">Impact:</span> {threat.impact}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* QBC Solutions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <QBCStaticText glyphHeight="1.25rem">QBC Defense Mapping</QBCStaticText>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {qbcSolutions.map((item, index) => (
                <motion.div
                  key={item.solution}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-${item.color}/20 flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-5 h-5 text-${item.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="text-xs font-mono text-destructive mb-1">
                        ✕ {item.threat}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <h4 className="text-lg font-bold text-primary">
                          <QBCStaticText glyphHeight="1.125rem">{item.solution}</QBCStaticText>
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <QBCStaticText glyphHeight="0.875rem">{item.description}</QBCStaticText>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <NavLink to="/government">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Shield className="w-5 h-5 mr-2" />
                  <QBCStaticText glyphHeight="1rem">Government Solutions</QBCStaticText>
                </Button>
              </NavLink>
              <NavLink to="/compliance">
                <Button size="lg" variant="outline" className="border-primary/50 hover:border-primary hover:bg-primary/10">
                  <QBCStaticText glyphHeight="1rem">View Compliance Status</QBCStaticText>
                </Button>
              </NavLink>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ThreatResponseSection;
