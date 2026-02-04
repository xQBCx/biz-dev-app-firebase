import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Mountain, Waves, Cloud, Cable, Radio, Map, Zap } from "lucide-react";
import DecryptedText from "./DecryptedText";

const MESH34 = () => {
  const mediums = [
    {
      icon: Mountain,
      title: "Earth",
      description: "Signal propagation through geological strata using pre-mapped MESH 34 index data. Conductive pathways through water and minerals.",
      color: "step-4",
    },
    {
      icon: Waves,
      title: "Water",
      description: "Underwater cables and natural fluid bodies as signal conductors with adaptive impedance correction.",
      color: "step-2",
    },
    {
      icon: Cloud,
      title: "Vapor/Atmosphere",
      description: "Compressed signal harmonics and frequency-tuned phase shifts through atmospheric vapor.",
      color: "quantum-purple",
    },
    {
      icon: Cable,
      title: "Classical Infrastructure",
      description: "Seamless integration with existing fiber optic, copper, and RF networks for interoperability.",
      color: "primary",
    },
  ];

  return (
    <section id="mesh-34" className="py-24 bg-space-void relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-earth" />
      
      <div className="container relative z-10 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center space-y-4">
            <Badge variant="outline" className="px-4 py-2 text-sm border-step-2/50 bg-step-2/10 text-step-2">
              <Radio className="mr-2 h-4 w-4" />
              <DecryptedText text="Hybrid Transport Layer" animateOn="view" speed={30} maxIterations={10} />
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              <DecryptedText text="MESH 34: Multi-Domain Signal Routing" animateOn="view" speed={35} maxIterations={12} />
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              <DecryptedText 
                text="A resilient transport layer that treats the Earth's crust as a structured, layered transmission medium. Route signals through any domain for unparalleled redundancy and survivability." 
                animateOn="view" 
                speed={15} 
                maxIterations={6} 
              />
            </p>
          </div>

          {/* Medium Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
            {mediums.map((medium, index) => {
              const Icon = medium.icon;
              return (
                <Card 
                  key={index}
                  className={`relative p-6 border-2 border-border bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-${medium.color}/50 transition-all hover:shadow-lg`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${medium.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-all`} />
                  
                  <div className="relative space-y-4 text-center">
                    <div className={`mx-auto p-4 rounded-xl bg-${medium.color}/10 border border-${medium.color}/20 w-fit group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-8 w-8 text-${medium.color}`} />
                    </div>
                    <h3 className={`text-xl font-bold text-foreground group-hover:text-${medium.color} transition-colors`}>
                      <DecryptedText text={medium.title} animateOn="view" speed={40} maxIterations={10} />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <DecryptedText text={medium.description} animateOn="view" speed={15} maxIterations={5} />
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* EarthPulse Section */}
          <Card className="relative border-2 border-step-4/30 bg-card/50 backdrop-blur-sm p-10 overflow-hidden mb-16">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,_hsl(160_100%_45%_/_0.1)_0%,_transparent_70%)]" />
            
            <div className="relative grid gap-8 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-step-4/50 bg-step-4/10 text-step-4">
                    <DecryptedText text="Intelligence Layer" animateOn="view" speed={30} maxIterations={8} />
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-foreground">
                  <DecryptedText text="EarthPulse™ Geophysical Engine" animateOn="view" speed={35} maxIterations={12} />
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  <DecryptedText 
                    text="Real-time situational awareness creating a dynamic Subsurface Material Index (SMI) by continuously mapping conductivity, geophysical impedance, magnetic flux density, and material composition." 
                    animateOn="view" 
                    speed={12} 
                    maxIterations={5} 
                  />
                </p>
                
                <div className="space-y-3">
                  {[
                    { label: "Intelligent Signal Routing", desc: "Modulate signals to couple efficiently with specific strata" },
                    { label: "Shape Extraction & Sensing", desc: "Turn communications into geophysical sensors" },
                    { label: "FractalPulse Simulation", desc: "Pre-transmission optimization through indexed geology" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                      <Zap className="h-5 w-5 text-step-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          <DecryptedText text={item.label} animateOn="hover" speed={35} maxIterations={8} />
                        </p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Visual representation */}
              <div className="relative aspect-square">
                <div className="absolute inset-0 rounded-2xl border-2 border-step-4/30 bg-gradient-to-b from-step-4/5 to-transparent overflow-hidden">
                  {/* Earth layers visualization */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-step-4/30 to-transparent border-t border-step-4/20">
                    <span className="absolute bottom-2 left-4 text-xs text-step-4/70 font-mono">CRUST</span>
                  </div>
                  <div className="absolute bottom-1/4 left-0 right-0 h-1/4 bg-gradient-to-t from-step-2/20 to-transparent border-t border-step-2/20">
                    <span className="absolute bottom-2 left-4 text-xs text-step-2/70 font-mono">AQUIFER</span>
                  </div>
                  <div className="absolute bottom-1/2 left-0 right-0 h-1/4 bg-gradient-to-t from-quantum-purple/10 to-transparent border-t border-quantum-purple/20">
                    <span className="absolute bottom-2 left-4 text-xs text-quantum-purple/70 font-mono">STRATA</span>
                  </div>
                  
                  {/* Signal path */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path 
                      d="M10 20 Q 30 30, 50 45 T 90 80" 
                      stroke="hsl(185 100% 50%)" 
                      strokeWidth="0.5" 
                      fill="none"
                      strokeDasharray="2 2"
                      className="animate-pulse"
                    />
                    <circle cx="10" cy="20" r="2" fill="hsl(185 100% 50%)" className="animate-pulse-glow" />
                    <circle cx="90" cy="80" r="2" fill="hsl(160 100% 45%)" className="animate-pulse-glow" />
                  </svg>
                  
                  <div className="absolute top-4 left-4 text-xs text-primary font-mono flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    SMI: Active
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Insight */}
          <Card className="p-8 border-2 border-primary/30 bg-primary/5 text-center">
            <Globe className="h-10 w-10 text-primary mx-auto mb-4" />
            <p className="text-lg text-foreground font-medium max-w-2xl mx-auto">
              <DecryptedText 
                text="MESH 34 transforms the physical environment from a passive background into an active participant in secure communication—providing resilience unattainable by conventional systems." 
                animateOn="view" 
                speed={15} 
                maxIterations={6} 
              />
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MESH34;