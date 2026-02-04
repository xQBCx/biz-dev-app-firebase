import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Hexagon, 
  Radio, 
  Map, 
  Key, 
  Fingerprint, 
  Link2, 
  Shield, 
  Cpu,
  Network,
  Lock,
  Blocks
} from "lucide-react";
import DecryptedText from "./DecryptedText";

const QBCEcosystem = () => {
  const components = [
    {
      icon: Hexagon,
      name: "QBC",
      subtitle: "Geometric Encoding",
      description: "Post-quantum encryption via evolving geometric shapes and lattice structures.",
      color: "primary",
    },
    {
      icon: Network,
      name: "MESH 34",
      subtitle: "Hybrid Transport",
      description: "Resilient, multi-domain signal routing through any medium.",
      color: "step-2",
    },
    {
      icon: Map,
      name: "EarthPulse™",
      subtitle: "Intelligence Layer",
      description: "Real-time geophysical mapping and signal path optimization.",
      color: "step-4",
    },
    {
      icon: Key,
      name: "LUXKEY™",
      subtitle: "Identity Layer",
      description: "Tokenized, physically-bound command and control identity.",
      color: "step-5",
    },
    {
      icon: Fingerprint,
      name: "FractalPulse™",
      subtitle: "Authentication",
      description: "Unforgeable, non-repeating geometric signal signatures.",
      color: "quantum-purple",
    },
    {
      icon: Link2,
      name: "Foundational Bridge",
      subtitle: "Patented Modules",
      description: "Quantum-classical interface for spectrum, error correction, and security.",
      color: "step-3",
    },
  ];

  const capabilities = [
    {
      icon: Shield,
      title: "Unparalleled Resilience",
      items: [
        "Self-healing topology via MESH 34",
        "Autonomous multi-modal routing",
        "Operational in GPS-denied scenarios"
      ],
      color: "step-2",
    },
    {
      icon: Lock,
      title: "Inherent Post-Quantum Security",
      items: [
        "Post-quantum by construction",
        "Geometric encoding resists brute-force",
        "Physical state identity binding"
      ],
      color: "quantum-purple",
    },
    {
      icon: Radio,
      title: "Multi-Domain Stealth",
      items: [
        "Low probability of intercept",
        "Real-time anomaly detection",
        "Attribution-resistant signaling"
      ],
      color: "step-4",
    },
    {
      icon: Blocks,
      title: "Sovereign Command & Control",
      items: [
        "Independent of public infrastructure",
        "Blockchain-auditable execution",
        "Geofenced relay logic"
      ],
      color: "step-5",
    },
  ];

  return (
    <section id="ecosystem" className="py-24 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      <div className="container relative z-10 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center space-y-4">
            <Badge variant="outline" className="px-4 py-2 text-sm border-quantum-purple/50 bg-quantum-purple/10 text-quantum-purple">
              <Cpu className="mr-2 h-4 w-4" />
              <DecryptedText text="Full-Scope Arsenal" animateOn="view" speed={30} maxIterations={10} />
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              <DecryptedText text="The QBC Ecosystem" animateOn="view" speed={35} maxIterations={12} />
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              <DecryptedText 
                text="A multi-layered, physically-aware arsenal designed to establish and enforce Signal Sovereignty™—providing complete, end-to-end capability from encoding to transport and intelligence." 
                animateOn="view" 
                speed={15} 
                maxIterations={6} 
              />
            </p>
          </div>

          {/* Component Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {components.map((component, index) => {
              const Icon = component.icon;
              return (
                <Card 
                  key={index}
                  className={`relative p-6 border-2 border-border bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-${component.color}/50 transition-all hover:shadow-lg`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${component.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-all`} />
                  
                  <div className="relative flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-${component.color}/10 border border-${component.color}/20 shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 text-${component.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-bold text-foreground group-hover:text-${component.color} transition-colors`}>
                          <DecryptedText text={component.name} animateOn="view" speed={40} maxIterations={10} />
                        </h3>
                      </div>
                      <Badge variant="outline" className={`text-xs mb-2 border-${component.color}/30 text-${component.color}`}>
                        <DecryptedText text={component.subtitle} animateOn="hover" speed={30} maxIterations={8} />
                      </Badge>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <DecryptedText text={component.description} animateOn="view" speed={15} maxIterations={5} />
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Strategic Capabilities */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-foreground text-center mb-8">
              <DecryptedText text="Strategic Capabilities" animateOn="view" speed={35} maxIterations={10} />
            </h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              {capabilities.map((cap, index) => {
                const Icon = cap.icon;
                return (
                  <Card 
                    key={index}
                    className={`relative p-6 border-2 border-border bg-card/30 backdrop-blur-sm overflow-hidden group hover:border-${cap.color}/50 transition-all`}
                  >
                    <div className={`absolute top-0 left-0 h-full w-1 bg-${cap.color}`} />
                    
                    <div className="relative flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-${cap.color}/10 border border-${cap.color}/20 shrink-0`}>
                        <Icon className={`h-6 w-6 text-${cap.color}`} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground mb-3">
                          <DecryptedText text={cap.title} animateOn="view" speed={35} maxIterations={10} />
                        </h4>
                        <ul className="space-y-2">
                          {cap.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className={`text-${cap.color} mt-1`}>•</span>
                              <span>
                                <DecryptedText text={item} animateOn="view" speed={20} maxIterations={6} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QBCEcosystem;