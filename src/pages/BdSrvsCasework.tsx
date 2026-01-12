import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  ArrowRight,
  Building2,
  TrendingUp,
  Users,
  Shield,
  Zap,
  BarChart3,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const caseStudies = [
  {
    id: "telecom-optimization",
    industry: "Telecommunications",
    title: "Enterprise Telecom Consolidation",
    description: "Reduced a Fortune 500 company's telecom spend by 47% while improving service reliability and coverage.",
    metrics: [
      { label: "Annual Savings", value: "$2.3M" },
      { label: "Vendors Consolidated", value: "12 → 3" },
      { label: "Timeline", value: "16 weeks" },
    ],
    tags: ["Cost Optimization", "Vendor Management", "Telecom"],
    icon: Zap,
  },
  {
    id: "ai-implementation",
    industry: "Financial Services",
    title: "AI-Powered Operations",
    description: "Implemented AI automation for document processing, reducing manual review time by 80% while maintaining compliance.",
    metrics: [
      { label: "Processing Time", value: "-80%" },
      { label: "Accuracy Rate", value: "99.2%" },
      { label: "ROI", value: "340%" },
    ],
    tags: ["AI Systems", "Automation", "Compliance"],
    icon: BarChart3,
  },
  {
    id: "infrastructure-modernization",
    industry: "Commercial Real Estate",
    title: "Smart Building Integration",
    description: "Unified building management systems across a 15-property portfolio, enabling centralized monitoring and control.",
    metrics: [
      { label: "Properties Unified", value: "15" },
      { label: "Energy Savings", value: "23%" },
      { label: "Maintenance Costs", value: "-35%" },
    ],
    tags: ["Infrastructure", "Smart Buildings", "IoT"],
    icon: Building2,
  },
  {
    id: "security-alignment",
    industry: "Healthcare",
    title: "Security & Compliance Overhaul",
    description: "Achieved HIPAA and SOC 2 Type II compliance for a growing healthcare technology company preparing for enterprise sales.",
    metrics: [
      { label: "Certifications", value: "2" },
      { label: "Time to Compliance", value: "6 months" },
      { label: "Enterprise Deals Unlocked", value: "$4M+" },
    ],
    tags: ["Security", "Compliance", "Healthcare"],
    icon: Shield,
  },
];

export default function BdSrvsCasework() {
  return (
    <>
      <Helmet>
        <title>Casework | Bill Mercer - BDSRVS</title>
        <meta name="description" content="Sample engagements and case studies showcasing strategic consulting outcomes across industries." />
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
              <Link to="/bdsrvs/services" className="text-slate-300 hover:text-white transition-colors">Services</Link>
              <Link to="/bdsrvs/casework" className="text-white font-medium">Casework</Link>
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

            <h1 className="text-4xl font-bold mb-4">Casework</h1>
            <p className="text-xl text-slate-300 max-w-2xl">
              Sample engagements showcasing outcomes across industries. Details are anonymized 
              and sanitized for confidentiality—full case studies available upon request.
            </p>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-8">
              {caseStudies.map((study, i) => (
                <Card key={study.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Left side - icon */}
                    <div className="md:w-48 bg-gradient-to-br from-primary/20 to-slate-800 p-8 flex items-center justify-center">
                      <study.icon className="h-16 w-16 text-primary" />
                    </div>

                    {/* Right side - content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Badge variant="outline" className="text-primary border-primary/50 mb-2">
                            {study.industry}
                          </Badge>
                          <h3 className="text-xl font-semibold text-white">{study.title}</h3>
                        </div>
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>

                      <p className="text-slate-400 mb-4">{study.description}</p>

                      {/* Metrics */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {study.metrics.map((metric, j) => (
                          <div key={j} className="text-center">
                            <p className="text-2xl font-bold text-primary">{metric.value}</p>
                            <p className="text-xs text-slate-400">{metric.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {study.tags.map((tag, j) => (
                          <span 
                            key={j}
                            className="px-3 py-1 text-xs rounded-full bg-slate-700 text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Confidentiality Note */}
        <section className="py-12 px-6 bg-slate-900/50">
          <div className="max-w-4xl mx-auto text-center">
            <Lock className="h-10 w-10 text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Confidentiality Commitment</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              All case studies are anonymized to protect client confidentiality. 
              Detailed references and outcomes are available upon request under NDA 
              for qualified prospects.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Want to see how this applies to you?</h2>
            <p className="text-slate-400 mb-8">
              Let's discuss your specific challenges and explore potential outcomes.
            </p>
            <Button asChild size="lg">
              <Link to="/bdsrvs/contact">
                Start a Conversation
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
