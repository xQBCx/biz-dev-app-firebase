import { FileText, Download, Shield, Radio, Key, Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DecryptedText from "@/components/DecryptedText";

const whitePapers = [
  {
    id: "qbc-architecture",
    title: "QBC Technical Architecture",
    subtitle: "Geometric Information Objects & Lattice Mathematics",
    description: "Comprehensive technical overview of Quantum Bit Code's foundational architecture, including GIO encoding principles, lattice-based security models, and quantum-resistant design patterns.",
    icon: Atom,
    classification: "UNCLASSIFIED",
    pages: 42,
    version: "2.1",
    topics: ["GIO Encoding", "Lattice Security", "Post-Quantum Cryptography", "Physical-Layer Protection"],
  },
  {
    id: "mesh34-framework",
    title: "MESH 34 Technical Framework",
    subtitle: "Hybrid Signal Transmission Architecture",
    description: "Detailed specification of the MESH 34 multi-path signal transmission system, covering terrestrial, satellite, and subsurface routing with automatic failover and denied-environment operation.",
    icon: Radio,
    classification: "UNCLASSIFIED",
    pages: 38,
    version: "1.4",
    topics: ["Signal Routing", "Denied Environments", "Multi-Path Transmission", "Infrastructure Resilience"],
  },
  {
    id: "luxkey-identity",
    title: "LUXKEY Identity Binding",
    subtitle: "Physical-Layer Authentication Protocol",
    description: "Technical specification for LUXKEY's geometric identity verification system, including biometric binding, device attestation, and credential-less authentication mechanisms.",
    icon: Key,
    classification: "UNCLASSIFIED",
    pages: 31,
    version: "1.2",
    topics: ["Identity Binding", "Biometric Integration", "Device Attestation", "Zero-Trust Architecture"],
  },
  {
    id: "signal-sovereignty",
    title: "Signal Sovereignty Doctrine",
    subtitle: "Post-Quantum Communication Strategy",
    description: "Strategic overview of the Signal Sovereignty framework, positioning QBC as the foundation for next-generation secure communications immune to quantum-capable adversaries.",
    icon: Shield,
    classification: "UNCLASSIFIED",
    pages: 24,
    version: "3.0",
    topics: ["Strategic Doctrine", "Quantum Threat Model", "National Security", "Communication Sovereignty"],
  },
];

const TechnicalWhitePapersSection = () => {
  const handleDownload = (paperId: string) => {
    // In production, this would trigger an actual PDF download
    // For now, show a toast or open a request form
    console.log(`Requesting download: ${paperId}`);
    alert("White paper request submitted. A representative will contact you with access credentials.");
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            <FileText className="w-3 h-3 mr-1" />
            Technical Documentation
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <DecryptedText text="Technical White Papers" animateOn="view" />
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            In-depth technical documentation for government evaluators, security architects, 
            and defense acquisition professionals.
          </p>
        </div>

        {/* White Papers Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {whitePapers.map((paper) => {
            const IconComponent = paper.icon;
            return (
              <Card 
                key={paper.id} 
                className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        v{paper.version}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                        {paper.classification}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-1">{paper.title}</CardTitle>
                  <CardDescription className="text-primary/80 font-medium">
                    {paper.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {paper.description}
                  </p>
                  
                  {/* Topics */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {paper.topics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">
                      {paper.pages} pages
                    </span>
                    <Button 
                      onClick={() => handleDownload(paper.id)}
                      variant="outline"
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Request PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Access Notice */}
        <div className="bg-muted/30 border border-border/50 rounded-lg p-6 text-center">
          <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Controlled Distribution</h3>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto mb-4">
            Technical white papers are provided upon verification of government or defense contractor status. 
            Classified briefing materials available for personnel with appropriate clearance levels.
          </p>
          <Button variant="outline" asChild>
            <a href="/government#contact">Request Classified Briefing</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TechnicalWhitePapersSection;
