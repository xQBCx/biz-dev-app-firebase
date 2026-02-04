import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "@/assets/logo.png";
import heroImage from "@/assets/hero-photography.jpg";
import photographerPortrait from "@/assets/photographer-portrait.jpg";
import clientHappy from "@/assets/client-happy.jpg";
import { Camera, Clock, MapPin, Star, Users, Share2, Play, Zap, Shield, DollarSign, ChevronRight, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Landing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");

  useEffect(() => {
    if (referralCode) {
      sessionStorage.setItem("referral_code", referralCode);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/home");
      }
    });
  }, [referralCode, navigate]);

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Professional photographer capturing a moment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 w-full px-4 py-12">
          {/* Theme Toggle - Top Right */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6">
            <ThemeToggle />
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl">
              <div className="mb-8">
                <img 
                  src={logo} 
                  alt="ISO Flash" 
                  className="h-16 md:h-20 w-auto animate-glow" 
                />
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
                <span className="text-foreground">Photography</span>
                <br />
                <span className="text-primary">On Demand</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
                Need a photographer right now? Flash for one nearby. 
                <span className="text-foreground font-medium"> Professional content in minutes, not days.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-lg font-bold glow-primary group"
                  onClick={handleGetStarted}
                >
                  <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Get Started Free
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 text-lg backdrop-blur-sm bg-background/50"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Play className="mr-2 h-5 w-5" />
                  See How It Works
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  <span className="font-medium">4.9</span>
                  <span className="text-muted-foreground">Rating</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="font-medium">1,000+</span>
                  <span className="text-muted-foreground">Sessions</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border">
                  <Camera className="h-4 w-4 text-success" />
                  <span className="font-medium">500+</span>
                  <span className="text-muted-foreground">Photographers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 py-20 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Simple as 1-2-3
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How ISO Flash Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get professional photos in three easy steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="relative text-center group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                1
              </div>
              <div className="pt-8 p-6 rounded-2xl bg-background border border-border transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3">Flash</h3>
                <p className="text-muted-foreground">
                  Tap the flash button to signal nearby photographers that you need content now
                </p>
              </div>
            </div>
            
            <div className="relative text-center group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center text-sm">
                2
              </div>
              <div className="pt-8 p-6 rounded-2xl bg-background border border-border transition-all group-hover:border-secondary/50 group-hover:shadow-lg group-hover:shadow-secondary/5">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-secondary/20 transition-colors">
                  <MapPin className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-bold text-xl mb-3">Connect</h3>
                <p className="text-muted-foreground">
                  Match with a verified photographer heading your way in minutes
                </p>
              </div>
            </div>
            
            <div className="relative text-center group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-success text-success-foreground font-bold flex items-center justify-center text-sm">
                3
              </div>
              <div className="pt-8 p-6 rounded-2xl bg-background border border-border transition-all group-hover:border-success/50 group-hover:shadow-lg group-hover:shadow-success/5">
                <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-success/20 transition-colors">
                  <Camera className="h-8 w-8 text-success" />
                </div>
                <h3 className="font-bold text-xl mb-3">Create</h3>
                <p className="text-muted-foreground">
                  Get professional photos & videos delivered straight to your phone
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              Loved by thousands
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What People Are Saying
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <p className="text-lg mb-6 leading-relaxed">
                "I was at a beautiful sunset spot and wished I had a professional photographer. 
                Within 10 minutes of flashing, I was being photographed! The photos were incredible."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={clientHappy} 
                  alt="Happy ISO Flash client" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                />
                <div>
                  <p className="font-bold">Sarah M.</p>
                  <p className="text-sm text-muted-foreground">Content Creator</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <Quote className="h-8 w-8 text-secondary/30 mb-4" />
              <p className="text-lg mb-6 leading-relaxed">
                "ISO Flash changed how I work. I accept sessions when I want, where I want. 
                Last month I made an extra $2,000 just from flash sessions between my regular gigs."
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={photographerPortrait} 
                  alt="ISO Flash photographer" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-secondary/20"
                />
                <div>
                  <p className="font-bold">Marcus R.</p>
                  <p className="text-sm text-muted-foreground">Photographer</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-secondary fill-secondary" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
              Built for everyone
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ISO Flash?
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-4 p-5 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Instant or Scheduled</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Need photos now? Flash for someone nearby. Planning ahead? Book sessions in advance.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 p-5 rounded-xl bg-background border border-border hover:border-secondary/30 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Verified & Rated</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every photographer is verified with real reviews from real clients you can trust.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 p-5 rounded-xl bg-background border border-border hover:border-success/30 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Camera className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Pro Editing Available</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get raw files immediately or request professional editing for that perfect finish.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 p-5 rounded-xl bg-background border border-border hover:border-warning/30 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-bold mb-2">Transparent Pricing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Photographers set their own rates. See prices upfront, pay only for what you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perfect For Every Moment
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From spontaneous adventures to planned events, ISO Flash has you covered
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Travel & Vacation",
              "Couples & Dating",
              "Proposals & Engagement",
              "Real Estate",
              "Content Creators",
              "Events & Parties",
              "Business Headshots",
              "Family Portraits",
              "Fitness & Sports",
              "Fashion & Lifestyle",
              "Pet Photography",
              "Graduation Photos"
            ].map((useCase) => (
              <span 
                key={useCase}
                className="px-5 py-2.5 rounded-full bg-muted text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Photographer CTA with QR */}
      <section className="px-4 py-20 bg-gradient-to-b from-card/50 to-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                For Photographers
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Turn Your Skills Into Income
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Accept sessions when you want, where you want. Set your own rates and build your 
                portfolio while earning. Join hundreds of photographers already on the platform.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  "Keep 100% of your earnings",
                  "Flexible schedule — work when you want",
                  "Build your professional portfolio",
                  "Get discovered by new clients"
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button 
                size="lg"
                className="h-14 px-8 text-lg font-bold"
                onClick={handleGetStarted}
              >
                <Camera className="mr-2 h-5 w-5" />
                Join as Photographer
              </Button>
            </div>

            <div className="flex justify-center">
              <div className="p-8 rounded-3xl bg-card border border-border text-center">
                <div className="p-4 bg-white rounded-2xl inline-block mb-4">
                  <QRCodeSVG 
                    value={`${window.location.origin}/?ref=PHOTOGRAPHER`}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Scan to get started</p>
                <p className="text-xs text-muted-foreground/60">or share this page</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Banner */}
      <section className="px-4 py-16 bg-primary/5 border-y border-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Earn While You Share</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Invite friends and photographers to ISO Flash. Earn{" "}
            <span className="text-primary font-bold">2.5% of their lifetime earnings</span>{" "}
            on the platform — forever.
          </p>
          <Button 
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handleGetStarted}
          >
            Get Your Referral Link
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Flash?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of people creating amazing content with ISO Flash photographers.
          </p>
          <Button 
            size="lg"
            className="h-16 px-12 text-xl font-bold glow-primary group"
            onClick={handleGetStarted}
          >
            <Zap className="mr-2 h-6 w-6 group-hover:animate-pulse" />
            Start Now — It's Free
            <ChevronRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-10 border-t border-border bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ISO Flash" className="h-10 w-auto" />
              <span className="font-bold text-lg">ISO Flash</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ISO Flash. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
