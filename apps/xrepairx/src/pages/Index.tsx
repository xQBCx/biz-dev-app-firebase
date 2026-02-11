import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { XWeldxLogo } from "../../xweldx/src/components/XWeldxLogo";
import { 
  ArrowRight, 
  Video, 
  Zap, 
  ClipboardList, 
  Building2, 
  Train, 
  Cog, 
  CheckCircle,
  Shield,
  Clock,
  TrendingDown,
  Users,
  Wrench,
  Printer,
  Camera,
  Rocket,
  Globe,
  DollarSign,
  Briefcase,
  Eye,
  Cpu,
  Package,
  Network
} from "lucide-react";

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminRole) {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, []);

  const industries = [
    { icon: Building2, label: "Property Management", desc: "Buildings, units, HVAC, plumbing" },
    { icon: Train, label: "Rail & Transit", desc: "Railcar inspections, maintenance" },
    { icon: Cog, label: "Industrial Equipment", desc: "Machinery, systems, components" },
    { icon: Wrench, label: "Field Services", desc: "Mobile repair, fabrication" },
  ];

  const platformFeatures = [
    {
      icon: Eye,
      title: "Onsite Vision",
      desc: "Our AI sees what you see. Point your camera at any broken part and get instant identification, repair guidance, and step-by-step instructions.",
    },
    {
      icon: Cpu,
      title: "AI Part Discovery",
      desc: "Upload a photo of any component. Our AI identifies the part, finds specs, locates replacements, and determines if it can be fabricated on-site.",
    },
    {
      icon: Printer,
      title: "Print-On-Demand",
      desc: "No more waiting for parts. Our mobile fabrication units can 3D print replacement components on-site in hours, not weeks.",
    },
    {
      icon: Video,
      title: "Remote Expert Guidance",
      desc: "Connect via video with experts who can see through your camera, annotate your view, and guide you through complex repairs in real-time.",
    },
  ];

  const franchiseFeatures = [
    {
      icon: Briefcase,
      title: "Be Your Own Boss",
      desc: "Start your own repair technician franchise. We provide the platform, training, and technology—you provide the skills.",
    },
    {
      icon: Network,
      title: "Work Sent To You",
      desc: "On-demand repair jobs, delivered to you. Accept jobs in your area, get dispatched to sites, and earn on your schedule.",
    },
    {
      icon: DollarSign,
      title: "Keep More Earnings",
      desc: "Competitive splits, instant payouts, and no hidden fees. Your expertise, your earnings.",
    },
    {
      icon: Rocket,
      title: "Growth Support",
      desc: "Build your team, expand your territory. We help you scale from solo tech to thriving business.",
    },
  ];

  const stats = [
    { icon: TrendingDown, value: "60%", label: "Fewer truck rolls" },
    { icon: Clock, value: "< 5 min", label: "Avg response time" },
    { icon: CheckCircle, value: "85%", label: "Remote resolution rate" },
    { icon: Users, value: "24/7", label: "Expert availability" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin badge */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="bg-card shadow-lg border-primary/20"
          >
            Admin Dashboard
          </Button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <XRepairxLogo size="md" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/request-support">Get Support</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto max-w-5xl text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <Rocket className="h-4 w-4" />
            <span className="text-sm font-medium">The Future of Field Repair</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-primary">On-Demand</span>
            {" "}
            <br className="hidden sm:block" />
            <span className="text-primary">Repair Work</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            AI-powered part discovery. On-demand 3D printing. Remote expert guidance. 
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Whether you need repairs done or want to become a repair technician entrepreneur—xREPAIRx is your platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/request-support">
                Get Repairs <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary/50 hover:bg-primary/10" asChild>
              <Link to="/auth">
                Become a Tech Partner <Wrench className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-16">
            Join the repair revolution • No app install needed • Get paid same day
          </p>

          {/* Industries */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {industries.map((ind) => (
              <div key={ind.label} className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <ind.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm">{ind.label}</h3>
                <p className="text-xs text-muted-foreground">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-primary">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary-foreground/80" />
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-sm text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revolutionary Technology Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent mb-6">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Revolutionary Technology</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Repair Technician Platform of the Future
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're not just dispatching techs—we're transforming how repairs happen with AI vision, instant part fabrication, and global expert networks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {platformFeatures.map((feature) => (
              <div key={feature.title} className="p-8 rounded-xl bg-card border border-border hover:border-primary/30 transition-all hover:shadow-lg group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Print on Demand Highlight */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
                <Printer className="h-4 w-4" />
                <span className="text-sm font-medium">Print-On-Demand Fabrication</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Can't Find the Part?<br />
                <span className="text-primary">We'll Print It.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our AI identifies broken components and matches them against our ever-growing CAD library. If we don't have it, we can design and fabricate it on-site with our mobile 3D printing units.
              </p>
              <ul className="space-y-4">
                {[
                  "AI-powered part identification from photos",
                  "Massive digital library of printable components",
                  "Mobile fabrication units dispatched to your site",
                  "Print replacement parts in hours, not weeks",
                  "Perfect for obsolete or hard-to-find parts"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="aspect-square bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
                    <ArrowRight className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <Cpu className="h-16 w-16 text-accent mx-auto mb-4" />
                    <ArrowRight className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <Printer className="h-16 w-16 text-primary mx-auto" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">Snap → Identify → Print</p>
                  <p className="text-sm text-muted-foreground">From broken to fixed in hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Tech Partner */}
      <section className="py-24 px-4 bg-sidebar-background text-sidebar-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sidebar-primary/20 border border-sidebar-primary/30 text-sidebar-primary mb-6">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm font-medium">Technician Opportunities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Own Repair Business
            </h2>
            <p className="text-lg text-sidebar-foreground/70 max-w-2xl mx-auto">
              Be your own boss. We send you the work, provide the technology, and help you build a thriving repair business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {franchiseFeatures.map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl bg-sidebar-accent border border-sidebar-border hover:border-sidebar-primary/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-sidebar-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-sidebar-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-sidebar-foreground">{feature.title}</h3>
                <p className="text-sidebar-foreground/70">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="text-lg px-8 bg-sidebar-primary hover:bg-sidebar-primary/90" asChild>
              <Link to="/auth">
                Join as Tech Partner <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">From problem to resolution in minutes, not days.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Report Issue", desc: "Describe the problem, upload photos, or scan a QR code" },
              { step: "2", title: "AI Triage", desc: "Our AI analyzes, identifies parts, and suggests next steps" },
              { step: "3", title: "Connect", desc: "Video call with an expert or get AI-guided self-service" },
              { step: "4", title: "Resolve", desc: "Fix remotely, dispatch a tech, or print parts on-site" },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-primary/10 absolute -top-4 -left-2">{item.step}</div>
                <div className="relative z-10 pt-8">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Network */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-5xl text-center">
          <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            A Growing Network of Repair Professionals
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            From solo technicians to enterprise operations—we're building the world's largest network of on-demand repair professionals equipped with tomorrow's technology.
          </p>
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Tech Partners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Cities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Repairs Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join the Repair Revolution?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Whether you need something fixed or want to build a business fixing things—xREPAIRx is your platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/request-support">I Need Repairs</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">I'm a Technician</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-card">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <XRepairxLogo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2025 xREPAIRx. On-Demand Repair, Anywhere.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link to="/request-support" className="hover:text-foreground transition-colors">Support</Link>
              <Link to="/auth" className="hover:text-foreground transition-colors">Login</Link>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
