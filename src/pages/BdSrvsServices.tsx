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

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/bdsrvs" className="text-xl font-bold tracking-tight">
              BDSRVS
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link to="/bdsrvs/about" className="text-slate-300 hover:text-white transition-colors">About</Link>
              <Link to="/bdsrvs/services" className="text-white font-medium">Services</Link>
              <Link to="/bdsrvs/casework" className="text-slate-300 hover:text-white transition-colors">Casework</Link>
              <Link to="/bdsrvs/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link>
            </nav>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link to="/auth">Enter Platform</Link>
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Link to="/bdsrvs" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <h1 className="text-4xl font-bold mb-4">Services</h1>
            <p className="text-xl text-slate-300 max-w-2xl">
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
                <Card key={i} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-white">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-400">{service.description}</p>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-300 mb-2">Deliverables</p>
                      <ul className="space-y-1">
                        {service.deliverables.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-slate-400">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-700 text-sm">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-4 w-4" />
                        {service.timeline}
                      </span>
                    </div>
                    <p className="text-sm text-primary">{service.typical}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 px-6 bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-12 text-center">How Engagements Work</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-primary font-medium mb-2">Step {i + 1}</p>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-slate-400 mb-8">
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
        <footer className="py-8 px-6 border-t border-slate-800">
          <div className="max-w-6xl mx-auto text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} BDSRVS. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
