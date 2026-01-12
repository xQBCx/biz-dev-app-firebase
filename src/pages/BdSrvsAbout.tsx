import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft,
  Download,
  Award,
  Briefcase,
  Cpu,
  Building,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const timeline = [
  {
    icon: Building,
    period: "2000 - 2010",
    title: "Enterprise Engineering",
    description: "Led infrastructure projects for Fortune 500 companies, focusing on telecommunications and data center optimization.",
  },
  {
    icon: Cpu,
    period: "2010 - 2018",
    title: "Technology Strategy",
    description: "Transitioned to strategic consulting, helping enterprises navigate digital transformation and cloud adoption.",
  },
  {
    icon: Briefcase,
    period: "2018 - 2022",
    title: "Business Development",
    description: "Founded BDSRVS to provide boutique consulting services combining engineering expertise with business strategy.",
  },
  {
    icon: Award,
    period: "2022 - Present",
    title: "Platform Innovation",
    description: "Built the Biz Dev App platform to systematize and scale strategic consulting with AI-powered tools.",
  },
];

const expertise = [
  "Telecom Infrastructure",
  "Cost Optimization",
  "AI Systems Integration",
  "Security & Compliance",
  "Smart Building Controls",
  "Vendor Consolidation",
  "Strategic Advisory",
  "Board Governance",
];

export default function BdSrvsAbout() {
  return (
    <>
      <Helmet>
        <title>About Bill Mercer | BDSRVS</title>
        <meta name="description" content="25+ years of engineering and strategic consulting experience. Learn about Bill Mercer's background and approach to business development." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/bdsrvs" className="text-xl font-bold tracking-tight">
              BDSRVS
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link to="/bdsrvs/about" className="text-white font-medium">About</Link>
              <Link to="/bdsrvs/services" className="text-slate-300 hover:text-white transition-colors">Services</Link>
              <Link to="/bdsrvs/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link>
            </nav>
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white hover:text-slate-950">
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

            <div className="flex flex-col md:flex-row gap-12 items-start">
              {/* Photo placeholder */}
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-primary/30 to-slate-800 flex items-center justify-center flex-shrink-0">
                <Users className="h-20 w-20 text-slate-600" />
              </div>

              <div>
                <h1 className="text-4xl font-bold mb-4">Bill Mercer</h1>
                <p className="text-xl text-primary mb-4">Strategic Advisor & Consultant</p>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  With over 25 years in engineering and strategic consulting, I help enterprises 
                  optimize their infrastructure, implement AI systems, and navigate complex 
                  business development challenges. My approach combines deep technical knowledge 
                  with business acumen—backed by a platform I built specifically for this work.
                </p>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Download className="h-4 w-4 mr-2" />
                  Download Bio (PDF)
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Expertise */}
        <section className="py-16 px-6 bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Areas of Expertise</h2>
            <div className="flex flex-wrap gap-3">
              {expertise.map((skill, i) => (
                <span 
                  key={i} 
                  className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-12">Professional Journey</h2>
            
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-primary font-medium mb-1">{item.period}</p>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="py-16 px-6 bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">My Approach</h2>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8">
                <blockquote className="text-xl text-slate-300 italic leading-relaxed">
                  "Strategy without execution is just a wish. I built the Biz Dev App because 
                  I got tired of great plans dying in slide decks. Every engagement I take on 
                  moves into a Deal Room where terms are clear, deliverables are tracked, and 
                  both parties can see exactly where we stand."
                </blockquote>
                <p className="mt-6 text-slate-500">— Bill Mercer</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Let's Work Together</h2>
            <p className="text-slate-400 mb-8">
              Whether you need strategic guidance or hands-on implementation support.
            </p>
            <Button asChild size="lg">
              <Link to="/bdsrvs/contact">Get in Touch</Link>
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
