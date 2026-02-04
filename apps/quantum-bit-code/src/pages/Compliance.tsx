import Navigation from "@/components/Navigation";
import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";
import { motion } from "motion/react";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Lock,
  FileCheck,
  Globe,
  Server,
  Cpu,
  Eye,
  ExternalLink,
  Hexagon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";

const complianceCategories = [
  {
    category: "Quantum Resistance",
    icon: Cpu,
    frameworks: [
      {
        name: "NIST PQC Standards",
        status: "aligned",
        progress: 100,
        description: "QBC's geometric encoding provides inherent quantum resistance without reliance on lattice-based algorithms that may have undiscovered vulnerabilities.",
        details: "Geometric Information Objects (GIOs) are immune to Shor's algorithm and Grover's algorithm attacks.",
      },
      {
        name: "NSA CNSA 2.0",
        status: "aligned",
        progress: 95,
        description: "Commercial National Security Algorithm Suite 2.0 transition timeline compliance.",
        details: "Physical-layer security exceeds software-based quantum-resistant algorithm requirements.",
      },
    ],
  },
  {
    category: "Cryptographic Standards",
    icon: Lock,
    frameworks: [
      {
        name: "FIPS 140-3",
        status: "in_progress",
        progress: 45,
        description: "Federal Information Processing Standard for cryptographic modules.",
        details: "Level 3 certification in preparation. Physical-layer architecture requires novel validation approach.",
      },
      {
        name: "Common Criteria (EAL4+)",
        status: "planned",
        progress: 15,
        description: "International security certification for IT products.",
        details: "Protection Profile development underway for geometric encoding systems.",
      },
    ],
  },
  {
    category: "Government Authorization",
    icon: FileCheck,
    frameworks: [
      {
        name: "FedRAMP Moderate",
        status: "in_progress",
        progress: 30,
        description: "Federal Risk and Authorization Management Program.",
        details: "3PAO selection in progress. Targeting authorization by Q4 2025.",
      },
      {
        name: "DoD IL4/IL5",
        status: "planned",
        progress: 10,
        description: "Department of Defense Impact Levels for controlled unclassified and national security information.",
        details: "Architecture review with DISA in planning phase.",
      },
      {
        name: "CMMC 2.0 Level 2",
        status: "aligned",
        progress: 90,
        description: "Cybersecurity Maturity Model Certification for defense contractors.",
        details: "All 110 NIST SP 800-171 controls implemented in infrastructure.",
      },
    ],
  },
  {
    category: "Industry Standards",
    icon: Globe,
    frameworks: [
      {
        name: "SOC 2 Type II",
        status: "aligned",
        progress: 100,
        description: "Service Organization Control for security, availability, and confidentiality.",
        details: "Annual audit completed. Report available upon request under NDA.",
      },
      {
        name: "ISO 27001:2022",
        status: "in_progress",
        progress: 75,
        description: "International standard for information security management systems.",
        details: "Certification audit scheduled for Q2 2025.",
      },
      {
        name: "ISO 27701",
        status: "planned",
        progress: 20,
        description: "Privacy information management extension to ISO 27001.",
        details: "Gap analysis completed. Implementation in progress.",
      },
    ],
  },
  {
    category: "Data Privacy",
    icon: Eye,
    frameworks: [
      {
        name: "GDPR",
        status: "aligned",
        progress: 100,
        description: "EU General Data Protection Regulation compliance.",
        details: "Data processing agreements, privacy impact assessments, and right to erasure procedures in place.",
      },
      {
        name: "CCPA/CPRA",
        status: "aligned",
        progress: 100,
        description: "California Consumer Privacy Act and Privacy Rights Act.",
        details: "Consumer rights request handling and privacy policy compliant.",
      },
    ],
  },
  {
    category: "API & Application Security",
    icon: Server,
    frameworks: [
      {
        name: "OWASP API Top 10",
        status: "aligned",
        progress: 100,
        description: "API security risks and mitigations.",
        details: "All edge functions implement rate limiting, authentication, input validation, and audit logging.",
      },
      {
        name: "OWASP ASVS L2",
        status: "in_progress",
        progress: 80,
        description: "Application Security Verification Standard Level 2.",
        details: "Security controls verified against standard requirements.",
      },
      {
        name: "Business Logic Abuse Prevention",
        status: "aligned",
        progress: 95,
        description: "Protection against business logic exploitation.",
        details: "Glyph claim rate limiting, duplicate prevention, and ownership verification implemented.",
      },
    ],
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "aligned":
      return <CheckCircle className="w-5 h-5 text-quantum-green" />;
    case "in_progress":
      return <Clock className="w-5 h-5 text-quantum-orange" />;
    case "planned":
      return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    default:
      return null;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "aligned":
      return "Aligned";
    case "in_progress":
      return "In Progress";
    case "planned":
      return "Planned";
    default:
      return status;
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 90) return "bg-quantum-green";
  if (progress >= 50) return "bg-quantum-orange";
  return "bg-muted-foreground";
};

const Compliance = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        
        <div className="relative z-10 container px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-quantum-green/10 border border-quantum-green/30 mb-6">
                <Shield className="w-4 h-4 text-quantum-green" />
                <span className="text-quantum-green font-mono text-sm tracking-widest uppercase">
                  <QBCStaticText glyphHeight="0.875rem">Public Compliance Status</QBCStaticText>
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                <QBCDecryptedText 
                  text="Security & Compliance" 
                  animateOn="view"
                  glyphHeight="2.5rem"
                  className="text-foreground"
                />
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                <QBCStaticText glyphHeight="1.125rem">
                  QBC is designed to meet the most rigorous security and compliance requirements. 
                  This dashboard provides transparency into our certification status across major frameworks.
                </QBCStaticText>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-8 bg-space-deep border-y border-border/50">
        <div className="container px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-quantum-green">8</div>
                <div className="text-sm text-muted-foreground">Fully Aligned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-quantum-orange">5</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">3</div>
                <div className="text-sm text-muted-foreground">Planned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">16</div>
                <div className="text-sm text-muted-foreground">Total Frameworks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Categories */}
      <section className="py-16 bg-background">
        <div className="container px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            {complianceCategories.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * catIndex }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    <QBCStaticText glyphHeight="1.5rem">{category.category}</QBCStaticText>
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {category.frameworks.map((framework, index) => (
                    <Card
                      key={framework.name}
                      className="p-5 bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(framework.status)}
                          <h3 className="font-bold text-foreground">{framework.name}</h3>
                        </div>
                        <span className={`
                          px-2 py-0.5 rounded text-xs font-semibold
                          ${framework.status === 'aligned' 
                            ? 'bg-quantum-green/20 text-quantum-green' 
                            : framework.status === 'in_progress'
                              ? 'bg-quantum-orange/20 text-quantum-orange'
                              : 'bg-muted text-muted-foreground'
                          }
                        `}>
                          {getStatusLabel(framework.status)}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {framework.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground font-medium">{framework.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(framework.progress)}`}
                            style={{ width: `${framework.progress}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                        {framework.details}
                      </p>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-space-deep">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                <QBCDecryptedText 
                  text="Need Detailed Documentation?" 
                  animateOn="view"
                  glyphHeight="1.5rem"
                />
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                <QBCStaticText glyphHeight="1rem">
                  Request access to detailed compliance reports, third-party audit results, 
                  and technical security documentation.
                </QBCStaticText>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NavLink to="/government">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Shield className="w-5 h-5 mr-2" />
                    Request Documentation
                  </Button>
                </NavLink>
                <NavLink to="/#contact">
                  <Button size="lg" variant="outline" className="border-primary/50 hover:border-primary hover:bg-primary/10">
                    Contact Security Team
                  </Button>
                </NavLink>
              </div>
            </motion.div>
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
              Last updated: January 2025 | Contact: <a href="mailto:bill@quantumbitcode.com" className="text-primary hover:underline">bill@quantumbitcode.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Compliance;
