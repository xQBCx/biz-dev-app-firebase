import Navigation from "@/components/Navigation";
import GovernmentContactForm from "@/components/GovernmentContactForm";
import TechnicalWhitePapersSection from "@/components/sections/TechnicalWhitePapersSection";
import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import { motion } from "motion/react";
import { 
  Shield,
  Target, 
  Lock, 
  Globe, 
  Satellite,
  Cpu,
  FileCheck,
  Building2,
  Briefcase,
  Award,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Hexagon } from "lucide-react";

const agencyUseCases = [
  {
    agency: "Department of Defense",
    abbreviation: "DoD",
    icon: Shield,
    applications: [
      "Command & Control (C2) communications",
      "SIPR alternative for denied environments",
      "Tactical field communications",
      "Coalition partner secure messaging",
    ],
    color: "quantum-cyan",
  },
  {
    agency: "National Nuclear Security Administration",
    abbreviation: "NNSA",
    icon: Target,
    applications: [
      "Nuclear command authority verification",
      "Stockpile management communications",
      "Research facility secure channels",
      "Emergency action messaging",
    ],
    color: "destructive",
  },
  {
    agency: "Cybersecurity & Infrastructure Security Agency",
    abbreviation: "CISA",
    icon: Lock,
    applications: [
      "Critical infrastructure protection",
      "Cross-sector emergency coordination",
      "Threat intelligence sharing",
      "Incident response communications",
    ],
    color: "quantum-green",
  },
  {
    agency: "Intelligence Community",
    abbreviation: "IC",
    icon: Globe,
    applications: [
      "Attribution-resistant SIGINT",
      "Covert communications channels",
      "Source protection messaging",
      "Cross-agency secure coordination",
    ],
    color: "quantum-purple",
  },
  {
    agency: "Space Force / NRO",
    abbreviation: "USSF",
    icon: Satellite,
    applications: [
      "Satellite command links",
      "Space domain awareness sharing",
      "Anti-jamming ground-to-orbit comms",
      "Constellation control resilience",
    ],
    color: "quantum-blue",
  },
  {
    agency: "Defense Innovation Unit",
    abbreviation: "DIU",
    icon: Cpu,
    applications: [
      "Commercial technology transition",
      "Rapid prototyping programs",
      "Dual-use capability development",
      "Innovation ecosystem integration",
    ],
    color: "quantum-orange",
  },
];

const complianceFrameworks = [
  {
    name: "NIST PQC",
    status: "Aligned",
    description: "Post-Quantum Cryptography standards - geometry-based approach provides quantum immunity without reliance on NIST algorithms",
  },
  {
    name: "FIPS 140-3",
    status: "Roadmap",
    description: "Cryptographic module validation - physical-layer security architecture under certification review",
  },
  {
    name: "FedRAMP",
    status: "Roadmap",
    description: "Federal cloud authorization - preparing documentation for Moderate baseline",
  },
  {
    name: "CMMC 2.0",
    status: "Ready",
    description: "Defense contractor cybersecurity - infrastructure meets Level 2 requirements",
  },
  {
    name: "ITAR/EAR",
    status: "Compliant",
    description: "Export controls - technology classification under review for appropriate controls",
  },
];

const procurementPathways = [
  {
    title: "GSA Schedule",
    icon: FileCheck,
    description: "Pursuing GSA Schedule 70 for streamlined government purchasing",
    status: "In Progress",
  },
  {
    title: "SBIR/STTR",
    icon: Award,
    description: "Eligible for Small Business Innovation Research programs across DoD, DHS, DOE",
    status: "Eligible",
  },
  {
    title: "Defense Innovation Unit",
    icon: Cpu,
    description: "Prototype engagement with DIU for commercial solution evaluation",
    status: "Actively Pursuing",
  },
  {
    title: "In-Q-Tel / Defense VC",
    icon: Building2,
    description: "Engagement with intelligence and defense venture capital",
    status: "Open to Discussion",
  },
  {
    title: "Pilot Programs",
    icon: Briefcase,
    description: "Tailored proof-of-concept deployments for specific agency requirements",
    status: "Available Now",
  },
];

const GovernmentSolutions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="relative z-10 container px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-primary font-mono text-sm tracking-widest uppercase">
                  <QBCStaticText glyphHeight="0.875rem">Government & Defense</QBCStaticText>
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
                <QBCDecryptedText 
                  text="Securing America's" 
                  animateOn="view"
                  glyphHeight="3rem"
                  className="text-foreground"
                />
                <br />
                <span className="text-primary">
                  <QBCDecryptedText 
                    text="Critical Communications"
                    animateOn="view"
                    glyphHeight="3rem"
                  />
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                <QBCStaticText glyphHeight="1.25rem">
                  Physical-layer security for nuclear command, defense operations, and critical infrastructure. 
                  Immune to software zero-days and quantum computing threats.
                </QBCStaticText>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Agency Use Cases */}
      <section className="py-20 bg-space-deep">
        <div className="container px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                <QBCDecryptedText 
                  text="Agency-Specific Applications" 
                  animateOn="view"
                  glyphHeight="2rem"
                />
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                <QBCStaticText glyphHeight="1rem">
                  QBC technology adapts to the unique operational requirements of each agency and mission set.
                </QBCStaticText>
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agencyUseCases.map((agency, index) => (
                <motion.div
                  key={agency.abbreviation}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <Card className={`h-full p-6 bg-card/60 backdrop-blur-sm border-${agency.color}/30 hover:border-${agency.color}/60 transition-all duration-300`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg bg-${agency.color}/20 flex items-center justify-center`}>
                        <agency.icon className={`w-5 h-5 text-${agency.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{agency.abbreviation}</h3>
                        <p className="text-xs text-muted-foreground">{agency.agency}</p>
                      </div>
                    </div>
                    
                    <ul className="space-y-2">
                      {agency.applications.map((app) => (
                        <li key={app} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className={`w-4 h-4 text-${agency.color} flex-shrink-0 mt-0.5`} />
                          <span>{app}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Certifications */}
      <section className="py-20 bg-background">
        <div className="container px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                <QBCDecryptedText 
                  text="Compliance & Certifications" 
                  animateOn="view"
                  glyphHeight="2rem"
                />
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                <QBCStaticText glyphHeight="1rem">
                  Built to meet the rigorous security requirements of government and defense environments.
                </QBCStaticText>
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complianceFrameworks.map((framework, index) => (
                <motion.div
                  key={framework.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="p-4 rounded-lg bg-card/60 border border-border/50 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-foreground">{framework.name}</h3>
                    <span className={`
                      px-2 py-0.5 rounded text-xs font-semibold
                      ${framework.status === 'Aligned' || framework.status === 'Compliant' || framework.status === 'Ready'
                        ? 'bg-quantum-green/20 text-quantum-green'
                        : 'bg-quantum-orange/20 text-quantum-orange'
                      }
                    `}>
                      {framework.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{framework.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <NavLink to="/compliance">
                <Button variant="outline" className="border-primary/50 hover:border-primary hover:bg-primary/10">
                  View Full Compliance Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Procurement Pathways */}
      <section className="py-20 bg-space-deep">
        <div className="container px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                <QBCDecryptedText 
                  text="Procurement Pathways" 
                  animateOn="view"
                  glyphHeight="2rem"
                />
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                <QBCStaticText glyphHeight="1rem">
                  Multiple acquisition routes to fit your agency's procurement requirements and timelines.
                </QBCStaticText>
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {procurementPathways.map((pathway, index) => (
                <motion.div
                  key={pathway.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="p-6 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <pathway.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{pathway.title}</h3>
                      <span className="text-xs text-primary">{pathway.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{pathway.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technical White Papers */}
      <TechnicalWhitePapersSection />

      {/* Contact Form */}
      <section id="contact" className="py-20 bg-background">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                <QBCDecryptedText 
                  text="Official Inquiry" 
                  animateOn="view"
                  glyphHeight="2rem"
                />
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                <QBCStaticText glyphHeight="1rem">
                  Submit your official inquiry for technical documentation, pilot program information, 
                  or to schedule a classified briefing.
                </QBCStaticText>
              </p>
            </motion.div>

            <GovernmentContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-space-void py-12">
        <div className="container px-6">
          <div className="mx-auto max-w-6xl text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-foreground">
              <Hexagon className="h-5 w-5 text-primary" />
              <span className="font-bold">
                <QBCStaticText glyphHeight="1.25rem">Quantum Bit Code</QBCStaticText>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} QBC Portfolio. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Contact: <a href="mailto:bill@quantumbitcode.com" className="text-primary hover:underline">bill@quantumbitcode.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GovernmentSolutions;
