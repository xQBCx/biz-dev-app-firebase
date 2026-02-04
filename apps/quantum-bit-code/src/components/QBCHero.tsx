import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Globe, Lock, ChevronDown } from "lucide-react";
import Hyperspeed from "./Hyperspeed";
import DecryptedText from "./DecryptedText";

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const coreCapabilities = [
  "Post-Quantum Encryption",
  "MESH 34 Hybrid Transport",
  "EarthPulse™ Intelligence",
  "LUXKEY™ Identity",
  "FractalPulse™ Auth",
];

const hyperspeedOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5] as [number, number],
  lightStickHeight: [1.3, 1.7] as [number, number],
  movingAwaySpeed: [60, 80] as [number, number],
  movingCloserSpeed: [-120, -160] as [number, number],
  carLightsLength: [400 * 0.03, 400 * 0.2] as [number, number],
  carLightsRadius: [0.05, 0.14] as [number, number],
  carWidthPercentage: [0.3, 0.5] as [number, number],
  carShiftX: [-0.8, 0.8] as [number, number],
  carFloorSeparation: [0, 5] as [number, number],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x131318,
    brokenLines: 0x131318,
    leftCars: [0xD856BF, 0x6750A2, 0xC247AC],
    rightCars: [0x03B3C3, 0x0E5EA5, 0x324555],
    sticks: 0x03B3C3,
  }
};

const QBCHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black pt-20">
      {/* Hyperspeed Background */}
      <div className="absolute inset-0 z-0">
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 z-[1]" />
      
      <div className="container relative z-10 px-6 py-24">
        <div className="mx-auto max-w-5xl text-center space-y-10">
          
          {/* Tagline Badge */}
          <div className="animate-fade-in">
            <Badge 
              variant="outline" 
              className="px-6 py-3 text-sm border-primary/50 bg-primary/10 text-primary backdrop-blur-sm"
            >
              <Lock className="mr-2 h-4 w-4" />
              <DecryptedText 
                text="Signal Sovereignty™ — Post-Quantum Doctrine" 
                animateOn="view"
                speed={30}
                maxIterations={15}
              />
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-foreground">
              <DecryptedText 
                text="The Future of" 
                animateOn="view"
                speed={40}
                maxIterations={12}
              />
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-quantum-purple to-primary bg-clip-text text-transparent text-glow-cyan">
              <DecryptedText 
                text="Quantum Bit Code" 
                animateOn="view"
                speed={50}
                maxIterations={20}
                sequential
                revealDirection="center"
              />
            </span>
          </h1>

          {/* Subheadline */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <DecryptedText 
              text="A complete redefinition of information as physical, geometric, and environmentally-aware constructs. Encoding data into evolving lattice structures for unbreakable post-quantum security." 
              animateOn="view"
              speed={20}
              maxIterations={8}
            />
          </p>

          {/* Core Capabilities */}
          <div 
            className="flex flex-wrap justify-center gap-3 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            {coreCapabilities.map((cap, index) => (
              <Badge 
                key={index}
                variant="secondary" 
                className="px-4 py-2 text-sm font-medium border border-border/50 bg-secondary/50 text-foreground backdrop-blur-sm hover:border-primary/50 hover:bg-primary/10 transition-all"
              >
                <DecryptedText 
                  text={cap} 
                  animateOn="hover"
                  speed={30}
                  maxIterations={10}
                />
              </Badge>
            ))}
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Button 
              size="lg" 
              onClick={() => scrollToSection("qbc-encoding")}
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-cyan transition-all hover:shadow-[0_0_40px_hsl(185_100%_50%_/_0.4)]"
            >
              <Zap className="mr-2 h-5 w-5" />
              <DecryptedText text="Explore Technology" animateOn="hover" speed={40} maxIterations={8} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("contact")}
              className="text-lg px-8 py-6 border-2 border-accent/50 hover:border-accent hover:bg-accent/10 text-foreground transition-all"
            >
              <Shield className="mr-2 h-5 w-5" />
              <DecryptedText text="Request Access" animateOn="hover" speed={40} maxIterations={8} />
            </Button>
          </div>

          {/* Key Stats */}
          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all group">
              <div className="flex items-center justify-center gap-2 text-primary mb-3 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                <DecryptedText text="Post-Quantum" animateOn="view" speed={40} maxIterations={10} />
              </p>
              <p className="text-sm text-muted-foreground">
                <DecryptedText text="By Construction" animateOn="view" speed={30} maxIterations={8} />
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-step-2/30 transition-all group">
              <div className="flex items-center justify-center gap-2 text-step-2 mb-3 group-hover:scale-110 transition-transform">
                <Globe className="h-8 w-8" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                <DecryptedText text="Multi-Domain" animateOn="view" speed={40} maxIterations={10} />
              </p>
              <p className="text-sm text-muted-foreground">
                <DecryptedText text="Earth • Water • Air • Fiber" animateOn="view" speed={30} maxIterations={8} />
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-step-4/30 transition-all group">
              <div className="flex items-center justify-center gap-2 text-step-4 mb-3 group-hover:scale-110 transition-transform">
                <Lock className="h-8 w-8" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                <DecryptedText text="Signal Sovereign" animateOn="view" speed={40} maxIterations={10} />
              </p>
              <p className="text-sm text-muted-foreground">
                <DecryptedText text="Tokenized Identity" animateOn="view" speed={30} maxIterations={8} />
              </p>
            </div>
          </div>

          {/* Scroll indicator */}
          <div 
            className="pt-8 animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <button 
              onClick={() => scrollToSection("threat-landscape")}
              className="mx-auto flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
            >
              <span className="text-sm">
                <DecryptedText text="Discover the Doctrine" animateOn="hover" speed={30} maxIterations={8} />
              </span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QBCHero;