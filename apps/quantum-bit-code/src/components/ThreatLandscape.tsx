import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, Shield, Lock, Cpu, Network, Bot, Key, Eye, Radio } from "lucide-react";
import DecryptedText from "./DecryptedText";

const ThreatLandscape = () => {
  const threats = [
    {
      icon: Network,
      title: "API Attack Surface",
      description: "APIs are the connective tissue of modern systems. Shadow, orphan, and zombie endpoints create exploitable blind spots across your attack surface.",
      color: "step-1",
    },
    {
      icon: Bot,
      title: "Agentic AI Exploitation",
      description: "Autonomous AI agents introduce new attack vectors through prompt injection, jailbreaks, and multi-agent coordination failures. AI security is API security.",
      color: "step-2",
    },
    {
      icon: Cpu,
      title: "Quantum Checkmate",
      description: "Post-quantum computing will render current public-key cryptography obsolete overnight. Legacy encryption becomes retroactively insecure.",
      color: "step-3",
    },
  ];

  const attackCategories = [
    {
      icon: Key,
      title: "Credential & Identity Attacks",
      attacks: ["Account Takeover", "Credential Dumping", "Pass-the-Hash", "Brute Force", "Session Hijacking"],
    },
    {
      icon: Eye,
      title: "Business Logic Abuse",
      attacks: ["Action Limit Overrun", "Workflow Bypass", "State Manipulation", "Resource Quota Violation", "Shadow Function Abuse"],
    },
    {
      icon: Radio,
      title: "Infrastructure Threats",
      attacks: ["Advanced Persistent Threats", "Supply Chain Attacks", "DNS Hijacking", "Man-in-the-Middle", "Zero-Day Exploits"],
    },
  ];

  return (
    <section id="threat-landscape" className="py-24 bg-space-void relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_hsl(0_84%_40%_/_0.1)_0%,_transparent_70%)]" />
      
      <div className="container relative z-10 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center space-y-4">
            <Badge variant="destructive" className="px-4 py-2 text-sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <DecryptedText text="Critical Threat Assessment" animateOn="view" speed={30} maxIterations={12} />
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              <DecryptedText text="The Attack Surface is " animateOn="view" speed={40} maxIterations={10} />
              <span className="text-destructive">
                <DecryptedText text="Expanding" animateOn="view" speed={50} maxIterations={15} />
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              <DecryptedText 
                text="Modern adversaries target APIs, exploit autonomous AI agents, and prepare for quantum supremacy. Your security posture must address the full lifecycle: Discover, Protect, Respond, Test." 
                animateOn="view" 
                speed={15} 
                maxIterations={6} 
              />
            </p>
          </div>

          {/* Threat Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            {threats.map((threat, index) => {
              const Icon = threat.icon;
              return (
                <Card 
                  key={index}
                  className="relative p-8 border-2 border-border bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-destructive/50 transition-all hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                  
                  <div className="relative space-y-4">
                    <div className={`p-3 rounded-xl bg-${threat.color}/10 border border-${threat.color}/20 w-fit`}>
                      <Icon className={`h-6 w-6 text-${threat.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-destructive transition-colors">
                      <DecryptedText text={threat.title} animateOn="view" speed={40} maxIterations={10} />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <DecryptedText text={threat.description} animateOn="view" speed={15} maxIterations={5} />
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Attack Categories Grid */}
          <div className="grid gap-4 md:grid-cols-3 mb-16">
            {attackCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="p-6 border border-border/50 bg-card/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="h-5 w-5 text-destructive" />
                    <h4 className="font-semibold text-foreground">
                      <DecryptedText text={category.title} animateOn="view" speed={30} maxIterations={8} />
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.attacks.map((attack, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
                        {attack}
                      </Badge>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quantum Threat Callout */}
          <Card className="relative border-2 border-destructive/30 bg-destructive/5 p-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,_hsl(0_84%_40%_/_0.15)_0%,_transparent_70%)]" />
            
            <div className="relative flex flex-col md:flex-row items-start gap-8">
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 shrink-0">
                <Shield className="h-10 w-10 text-destructive" />
              </div>
              
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  <DecryptedText 
                    text="The Quantum Checkmate: An Extinction-Level Event" 
                    animateOn="view" 
                    speed={35} 
                    maxIterations={12} 
                  />
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  <DecryptedText 
                    text="The arrival of cryptographically relevant quantum computers will shatter the entire foundation of modern digital trust. All current public-key encryption becomes retroactively insecure. Trust in digital identity, data integrity, and secure communication will be broken." 
                    animateOn="view" 
                    speed={10} 
                    maxIterations={5} 
                  />
                  <strong className="text-foreground"> This is not a vulnerability that can be patched.</strong>
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <Badge variant="outline" className="border-destructive/30 text-destructive">
                    <DecryptedText text="Existential Threat" animateOn="hover" speed={30} maxIterations={8} />
                  </Badge>
                  <Badge variant="outline" className="border-destructive/30 text-destructive">
                    <DecryptedText text="Post-Quantum Required" animateOn="hover" speed={30} maxIterations={8} />
                  </Badge>
                  <Badge variant="outline" className="border-destructive/30 text-destructive">
                    <DecryptedText text="No Algorithmic Patch" animateOn="hover" speed={30} maxIterations={8} />
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Transition to Solution */}
          <div className="mt-16 text-center">
            <Card className="inline-flex items-center gap-4 p-6 border-2 border-primary/30 bg-primary/5">
              <Lock className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-semibold text-foreground">
                  <DecryptedText text="A New Doctrine is Required" animateOn="view" speed={40} maxIterations={10} />
                </p>
                <p className="text-sm text-muted-foreground">
                  <DecryptedText text="Signal Sovereignty™ — Post-Quantum by Construction" animateOn="view" speed={30} maxIterations={8} />
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreatLandscape;