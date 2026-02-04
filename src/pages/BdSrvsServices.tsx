import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  Zap,
  Building2,
  Shield,
  Users,
  Phone,
  Server,
  BarChart3,
  FileCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import bizdevLogo from "@/assets/bizdev-monogram.png";

const services = [
  {
    icon: Zap,
    title: "Cost Optimization",
    description: "Comprehensive analysis and reduction of operational costs without sacrificing capability.",
    deliverables: [
      "Telecom & connectivity audit",
      "Vendor consolidation strategy",
      "Contract renegotiation support",
      "ROI tracking dashboard",
    ],
    timeline: "4-8 weeks",
    typical: "$50K-500K annual savings identified",
  },
  {
    icon: Building2,
    title: "Infrastructure Strategy",
    description: "Modern infrastructure planning for enterprises navigating digital transformation.",
    deliverables: [
      "Current state assessment",
      "Technology roadmap",
      "Smart building integration plan",
      "Implementation oversight",
    ],
    timeline: "6-12 weeks",
    typical: "Enterprise infrastructure modernization",
  },
  {
    icon: Shield,
    title: "AI & Security Systems",
    description: "Responsible AI implementation with security-first architecture for regulated industries.",
    deliverables: [
      "AI readiness assessment",
      "Security architecture review",
      "Compliance alignment (SOC 2, ISO 27001)",
      "Implementation guidance",
    ],
    timeline: "8-16 weeks",
    typical: "Secure, compliant AI deployment",
  },
  {
    icon: Users,
    title: "Advisory & Board",
    description: "Strategic advisory and governance support for leadership teams.",
    deliverables: [
      "Quarterly strategic reviews",
      "Board presentation support",
      "M&A due diligence",
      "Growth strategy development",
    ],
    timeline: "Ongoing engagement",
    typical: "Board-level strategic partnership",
  },
];

const process = [
  {
    icon: Phone,
    title: "Initial Consultation",
    description: "30-minute call to understand your challenges and determine fit.",
  },
  {
    icon: BarChart3,
    title: "Discovery & Analysis",
    description: "Deep dive into your current state with AI-powered research and assessment.",
  },
  {
    icon: FileCheck,
    title: "Strategy Proposal",
    description: "Detailed strategy with clear deliverables, timeline, and investment.",
  },
  {
    icon: Server,
    title: "Deal Room Execution",
    description: "Move into the Biz Dev App platform for tracked, transparent execution.",
  },
];

export default function BdSrvsServices() {
  return (
    <>
      <Helmet>
        <title>Services | Bill Mercer - BDSRVS</title>
        <meta name="description" content="Strategic consulting services including cost optimization, infrastructure strategy, AI implementation, and advisory engagements." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/bdsrvs" className="flex items-center gap-3">
              <img src={bizdevLogo} alt="Biz Dev" className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight text-foreground">BDSRVS</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link to="/bdsrvs/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/bdsrvs/services" className="text-foreground font-medium">Services</Link>
              <Link to="/bdsrvs/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </nav>
            <Button asChild>
              <Link to="/auth">Enter Platform</Link>
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Link to="/bdsrvs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <h1 className="text-4xl font-bold mb-4 text-foreground">Services</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Focused expertise delivered through a systematic, transparent process—
              backed by the Biz Dev App platform for execution.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, i) => (
                <Card key={i} className="bg-card border-border">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4">
                      <service.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{service.description}</p>
                    
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Deliverables</p>
                      <ul className="space-y-1">
                        {service.deliverables.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-foreground flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-border text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {service.timeline}
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-medium">{service.typical}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 px-6 bg-secondary">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-12 text-center text-foreground">How Engagements Work</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium mb-2">Step {i + 1}</p>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8">
              Schedule a consultation to discuss which service fits your needs.
            </p>
            <Button asChild size="lg">
              <Link to="/bdsrvs/contact">
                Schedule Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} BDSRVS. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
