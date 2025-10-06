import { Button } from "@/components/ui/button";
import { Shield, Zap, Users, ArrowRight, Sparkles, Building2, Lock, Gift } from "lucide-react";
import { useState } from "react";
import bizdevMonogram from "@/assets/bizdev-monogram.png";

const Index = () => {
  const [activeSection, setActiveSection] = useState<'landing' | 'verify' | 'dashboard'>('landing');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-gradient-depth">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(217_30%_20%/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(217_30%_20%/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        {/* Login Button at Top */}
        <div className="absolute top-12 right-6 z-20">
          <Button 
            variant="chrome" 
            size="lg"
            onClick={() => window.location.href = '/auth'}
          >
            Login
          </Button>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Logo placeholder - we'll add the actual logo later */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full"></div>
              <div className="relative bg-card border-2 border-primary/50 rounded-2xl p-6 shadow-elevated">
                <img src={bizdevMonogram} alt="Biz Dev App" className="w-16 h-16 object-contain" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-foreground via-chrome to-foreground bg-clip-text text-transparent">
            Biz Dev App
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground mb-4 font-light">
            The Amazon of Business Development Tools
          </p>
          
          <p className="text-lg md:text-xl text-muted-foreground/80 mb-12 max-w-3xl mx-auto">
            Launch your verified business in hours, not months. AI-powered platform combining identity verification, 
            automated business setup, and a complete suite of enterprise tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button 
              variant="default" 
              size="lg"
              onClick={() => window.location.href = '/auth'}
              className="group"
            >
              Get Started Free
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="chrome" 
              size="lg"
              onClick={() => window.location.href = '/auth'}
            >
              Login
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = '/directory'}
            >
              Browse Directory
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-[hsl(var(--neon-blue))] text-[hsl(var(--neon-blue))] hover:bg-[hsl(var(--neon-blue))]/10"
              onClick={() => window.location.href = '/ai-gift-cards'}
            >
              <Gift className="mr-2 h-5 w-5" />
              AI Gift Cards
            </Button>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Shield,
                title: "BD-ID™ Verified Identity",
                description: "One-time biometric verification for global business authentication"
              },
              {
                icon: Zap,
                title: "Instant Business Setup",
                description: "Automated LLC, S-Corp, C-Corp formation with tax optimization"
              },
              {
                icon: Users,
                title: "Verified Social Network",
                description: "Exclusive platform for verified business owners only"
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="group bg-card border border-border rounded-xl p-6 shadow-elevated hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
              >
                <div className="bg-gradient-primary rounded-lg w-14 h-14 flex items-center justify-center mb-4 shadow-chrome group-hover:shadow-glow transition-all">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "60+", label: "Platform Integrations" },
              { value: "$5", label: "Launchpad Activation" },
              { value: "24/7", label: "AI Agents Available" },
              { value: "Global", label: "Business Directory" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
            <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
            <ArrowRight className="rotate-90 w-4 h-4" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-chrome bg-clip-text text-transparent">
              How Biz Dev App Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From verification to verified business owner in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                title: "Verify Your Identity",
                description: "Complete BD-ID™ biometric verification once, use everywhere",
                icon: Lock
              },
              {
                step: "02",
                title: "Choose Entity Type",
                description: "Select LLC, S-Corp, C-Corp with AI guidance on tax optimization",
                icon: Building2
              },
              {
                step: "03",
                title: "Launch Across Platforms",
                description: "$5 activates profiles on 60+ platforms automatically",
                icon: Zap
              },
              {
                step: "04",
                title: "Scale with AI Agents",
                description: "Biz & Dev agents handle strategy, execution, and automation",
                icon: Sparkles
              }
            ].map((step, idx) => (
              <div 
                key={idx}
                className="relative group"
              >
                <div className="bg-card border border-border rounded-xl p-6 shadow-elevated hover:shadow-glow transition-all duration-300">
                  <div className="absolute -top-4 left-6 bg-gradient-primary text-primary-foreground w-12 h-12 rounded-lg flex items-center justify-center font-bold shadow-chrome">
                    {step.step}
                  </div>
                  <div className="mt-8 mb-4">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-depth border-2 border-primary/30 rounded-2xl p-12 md:p-16 text-center shadow-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(217_91%_60%/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(217_91%_60%/0.1)_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-chrome to-foreground bg-clip-text text-transparent">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join verified business owners building the future. Get started with BD-ID™ verification today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="group"
                  onClick={() => window.location.href = '/auth'}
                >
                  Get Started Now
                  <Sparkles className="ml-2 group-hover:rotate-12 transition-transform" />
                </Button>
                <Button 
                  variant="chrome" 
                  size="lg"
                  onClick={() => window.location.href = '/social'}
                >
                  View Network
                </Button>
              </div>

              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Bank-level security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Setup in hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Verified community</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={bizdevMonogram} alt="Biz Dev App" className="w-6 h-6 object-contain" />
              <span className="font-semibold text-lg">Biz Dev App</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2025 Biz Dev App. All rights reserved.
            </div>
            
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="/directory" className="hover:text-primary transition-colors">Directory</a>
              <a href="/social" className="hover:text-primary transition-colors">Network</a>
              <a href="/tools" className="hover:text-primary transition-colors">Tools</a>
              <a href="/funding" className="hover:text-primary transition-colors">Funding</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
