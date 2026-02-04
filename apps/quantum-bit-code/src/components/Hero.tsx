import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, FileCheck } from "lucide-react";
import nanoLogo from "@/assets/nano-logo.jpeg";
import BallpitBackground from "./BallpitBackground";

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const trademarks = [
  "NANO®",
  "NANO RX®",
  "THE UNIVERSAL STANDARD®",
  "NANODOSE®",
  "NANOBIDIOL®",
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Three.js Interactive Ballpit Background */}
      <BallpitBackground />
      
      <div className="container relative z-10 px-6 py-24">
        <div className="mx-auto max-w-5xl text-center space-y-12">
          {/* Logo */}
          <div className="flex justify-center animate-fade-in">
            <img 
              src={nanoLogo} 
              alt="NANO Logo" 
              className="h-48 md:h-64 w-auto"
            />
          </div>

          {/* Trademark List */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Badge variant="secondary" className="px-4 py-2 text-sm border border-border">
              <Shield className="mr-2 h-4 w-4 text-accent" />
              Institutional-Grade IP Portfolio
            </Badge>
            <div className="flex flex-wrap justify-center gap-3">
              {trademarks.map((tm, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="px-4 py-2 text-sm font-semibold border-accent/30 hover:border-accent transition-colors"
                >
                  {tm}
                </Badge>
              ))}
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Bankable Health & Wellness Trademarks Converted Into{" "}
            <span className="text-accent">Scalable IP-Backed Capital</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Structuring premium trademarks into an IP trust for non-dilutive, asset-backed credit facilities.
          </p>

          {/* Market Timing Insight */}
          <div className="pt-4 animate-fade-in" style={{ animationDelay: "0.35s" }}>
            <p className="text-sm md:text-base text-muted-foreground/80 max-w-2xl mx-auto italic">
              AI has solved design. Nanotechnology delivers the precision to build it. 
              This portfolio positions at the infrastructure layer of the next industrial revolution.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              onClick={() => scrollToSection("portfolio")}
              className="text-lg px-8 py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-cyan"
            >
              Explore IP Portfolio
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("contact")}
              className="text-lg px-8 py-6 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Request Investor Access
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-accent">
                <TrendingUp className="h-8 w-8" />
              </div>
              <p className="text-3xl font-bold text-foreground">$166M-$430M</p>
              <p className="text-sm text-muted-foreground">Portfolio Valuation</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-accent">
                <Shield className="h-8 w-8" />
              </div>
              <p className="text-3xl font-bold text-foreground">5+</p>
              <p className="text-sm text-muted-foreground">Registered Trademarks</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-accent">
                <FileCheck className="h-8 w-8" />
              </div>
              <p className="text-3xl font-bold text-foreground">$11M-$50M+</p>
              <p className="text-sm text-muted-foreground">Annual Licensing Potential</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
