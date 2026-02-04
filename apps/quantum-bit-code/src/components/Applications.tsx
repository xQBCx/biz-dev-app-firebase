import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Target, 
  Building2, 
  Radio, 
  Map,
  Plane,
  Factory,
  Cpu
} from "lucide-react";
import DecryptedText from "./DecryptedText";

const Applications = () => {
  const applications = [
    {
      icon: Shield,
      title: "Defense & Tactical Communications",
      description: "Secure and survivable communications in denied or contested environments.",
      features: [
        "Denied-environment communications through subsurface routing",
        "Attribution-resistant signaling with unique geometric patterns",
        "Geographically-locked command authority via LUXKEY™"
      ],
      color: "step-2",
    },
    {
      icon: Factory,
      title: "Critical Infrastructure Protection",
      description: "Defense against physical-layer signal injection and spoofing attacks.",
      features: [
        "Multi-layer signal authentication (geometric, temporal, physical)",
        "Protection for SCADA systems and industrial controls",
        "Emergency communication channels through alternate mediums"
      ],
      color: "step-4",
    },
    {
      icon: Radio,
      title: "Telecommunications Resilience",
      description: "Self-healing network topology with hybrid-pathway delivery.",
      features: [
        "Intelligent distribution across multiple mediums",
        "Automatic re-routing through atmospheric or terrestrial channels",
        "Robust fallback for conventional infrastructure"
      ],
      color: "primary",
    },
    {
      icon: Map,
      title: "Geophysical Sensing & Exploration",
      description: "Transform communication signals into active probes for subsurface mapping.",
      features: [
        "Real-time maps of subsurface geology",
        "Identification of mineral deposits and water tables",
        "Dual-use sensor grid without traditional seismic surveys"
      ],
      color: "quantum-purple",
    },
  ];

  const domains = [
    { icon: Plane, label: "Air", color: "quantum-purple" },
    { icon: Building2, label: "Land", color: "step-4" },
    { icon: Target, label: "Sea", color: "step-2" },
    { icon: Cpu, label: "Cyber", color: "primary" },
  ];

  return (
    <section id="applications" className="py-24 bg-space-void relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      <div className="container relative z-10 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center space-y-4">
            <Badge variant="outline" className="px-4 py-2 text-sm border-step-5/50 bg-step-5/10 text-step-5">
              <Target className="mr-2 h-4 w-4" />
              <DecryptedText text="Strategic Applications" animateOn="view" speed={30} maxIterations={10} />
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              <DecryptedText text="Multi-Domain Operations" animateOn="view" speed={35} maxIterations={12} />
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              <DecryptedText 
                text="Enabling secure communications and infrastructure protection across all operational domains—from national defense to critical infrastructure and beyond." 
                animateOn="view" 
                speed={15} 
                maxIterations={6} 
              />
            </p>
          </div>

          {/* Domain Icons */}
          <div className="flex justify-center gap-8 mb-16">
            {domains.map((domain, index) => {
              const Icon = domain.icon;
              return (
                <div key={index} className="text-center group">
                  <div className={`p-4 rounded-xl bg-${domain.color}/10 border border-${domain.color}/30 group-hover:bg-${domain.color}/20 transition-all`}>
                    <Icon className={`h-8 w-8 text-${domain.color}`} />
                  </div>
                  <p className={`text-sm font-medium text-${domain.color} mt-2`}>
                    <DecryptedText text={domain.label} animateOn="hover" speed={40} maxIterations={8} />
                  </p>
                </div>
              );
            })}
          </div>

          {/* Application Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {applications.map((app, index) => {
              const Icon = app.icon;
              return (
                <Card 
                  key={index}
                  className={`relative p-8 border-2 border-border bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-${app.color}/50 transition-all hover:shadow-lg`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-${app.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-all`} />
                  <div className={`absolute top-0 left-0 h-full w-1 bg-${app.color}`} />
                  
                  <div className="relative space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-${app.color}/10 border border-${app.color}/20 shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 text-${app.color}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold text-foreground group-hover:text-${app.color} transition-colors`}>
                          <DecryptedText text={app.title} animateOn="view" speed={35} maxIterations={10} />
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <DecryptedText text={app.description} animateOn="view" speed={20} maxIterations={6} />
                        </p>
                      </div>
                    </div>
                    
                    <ul className="space-y-2 pt-2">
                      {app.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className={`text-${app.color} mt-1 shrink-0`}>•</span>
                          <span>
                            <DecryptedText text={feature} animateOn="view" speed={15} maxIterations={5} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Applications;