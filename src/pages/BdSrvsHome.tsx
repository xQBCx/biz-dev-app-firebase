import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Building2, 
  Users, 
  ChevronRight,
  CheckCircle,
  Phone,
  Mail,
  Linkedin
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const services = [
  {
    icon: Zap,
    title: "Cost Optimization",
    description: "Telecom, connectivity, and vendor consolidation strategies that reduce overhead while improving capability.",
  },
  {
    icon: Building2,
    title: "Infrastructure Strategy",
    description: "Smart building controls, security alignment, and technology infrastructure planning for modern enterprises.",
  },
  {
    icon: Shield,
    title: "AI & Security Systems",
    description: "AI implementation guidance, security architecture, and compliance alignment for regulated industries.",
  },
  {
    icon: Users,
    title: "Advisory & Board",
    description: "Strategic advisory, board engagements, and governance support for growth-stage companies.",
  },
];

const trustBadges = [
  "25+ Years Engineering",
  "Fortune 500 Experience", 
  "AI-Native Platform",
  "Confidential Process",
];

export default function BdSrvsHome() {
  return (
    <>
      <Helmet>
        <title>Bill Mercer | Strategic Business Development & Infrastructure Consulting</title>
        <meta name="description" content="Strategic advisor specializing in cost optimization, AI systems, infrastructure strategy, and enterprise consulting. Backed by the Biz Dev App platform." />
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
              <Link to="/bdsrvs/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link>
            </nav>
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white hover:text-slate-950">
              <Link to="/auth">Enter Platform</Link>
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-primary font-medium mb-4 tracking-wide uppercase text-sm">
              Strategic Business Development
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Bill Mercer
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-4">
              Business & Infrastructure Consultant
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Helping enterprises optimize costs, implement AI systems, and build strategic infrastructure—backed by a platform that turns strategy into execution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/bdsrvs/contact">
                  Start a Conversation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 border-slate-600 text-slate-300 hover:bg-slate-800">
                <Link to="/auth">
                  Enter Biz Dev App
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              {trustBadges.map((badge, i) => (
                <span key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 px-6 bg-slate-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Strategic Services</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Focused expertise in the areas that drive enterprise value and operational excellence.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, i) => (
                <Card key={i} className="bg-slate-800/50 border-slate-700 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
                    <p className="text-slate-400">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How I Work */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How I Work</h2>
              <p className="text-slate-400">
                Every engagement is backed by the Biz Dev App—a platform I built to turn strategy into measurable outcomes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  1
                </div>
                <h3 className="font-semibold text-white mb-2">Discovery</h3>
                <p className="text-slate-400 text-sm">
                  We discuss your challenges, goals, and current infrastructure to identify opportunities.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  2
                </div>
                <h3 className="font-semibold text-white mb-2">Strategy</h3>
                <p className="text-slate-400 text-sm">
                  Using AI-powered research, I develop a tailored strategy with clear deliverables and timelines.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                  3
                </div>
                <h3 className="font-semibold text-white mb-2">Execution</h3>
                <p className="text-slate-400 text-sm">
                  We move into a Deal Room where terms, deliverables, and progress are tracked transparently.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-gradient-to-r from-primary/20 via-slate-900 to-primary/20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to discuss your next move?</h2>
            <p className="text-slate-400 mb-8">
              Whether you're optimizing infrastructure, implementing AI, or seeking strategic guidance—let's talk.
            </p>
            <Button asChild size="lg" className="text-lg px-10">
              <Link to="/bdsrvs/contact">
                Schedule a Call
                <Phone className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-slate-800">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-xl font-bold mb-1">BDSRVS</p>
                <p className="text-sm text-slate-400">Business Development Services</p>
              </div>
              <div className="flex items-center gap-6 text-slate-400">
                <a href="mailto:bill@bdsrvs.com" className="hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  bill@bdsrvs.com
                </a>
                <a href="https://linkedin.com/in/billmercer" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
              <p>© {new Date().getFullYear()} BDSRVS. All rights reserved.</p>
              <p className="mt-1">Powered by the <Link to="/auth" className="text-primary hover:underline">Biz Dev App</Link></p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
