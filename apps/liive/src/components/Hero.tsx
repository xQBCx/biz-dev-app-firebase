import { Button } from "@/components/ui/button";
import { MapPin, Zap } from "lucide-react";
import liiveIcon from "@/assets/liive-icon.png";
import { Link } from "react-router-dom";
import { GridScan } from "./GridScan";
import { VenuePortals } from "./VenuePortals";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-16 md:pt-20">
      {/* Animated GridScan background - lowest layer */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#392e4e"
          gridScale={0.06}
          scanColor="#FF9FFC"
          scanOpacity={0.35}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
          zoomSpeed={0.3}
          scanDuration={4.0}
          scanDelay={2.0}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Floating venue portals - middle layer, clickable */}
      <div className="absolute inset-0 z-[5]">
        <VenuePortals />
      </div>

      {/* Content - top layer but with pointer-events-none, children re-enable */}
      <div className="relative z-10 container mx-auto px-4 py-20 pointer-events-none">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-float pointer-events-auto">
            <img 
              src={liiveIcon} 
              alt="LIIVE Icon" 
              className="h-40 md:h-48 w-auto drop-shadow-glow"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              LIIVE
            </h1>
            <p className="text-lg md:text-xl font-light text-muted-foreground">
              Live Intelligent Interactive Venue Explorer
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary pt-4">
              This is LIIVE
            </h2>
            <p className="text-xl md:text-2xl font-light text-muted-foreground">
              Discover the vibe before you arrive
            </p>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See what's happening right now, anywhere. Live feeds from restaurants, clubs, 
            parks, sports venues, theaters, and events. Book tables instantly, catch exclusive flash deals, 
            and secure VIP experiences—all while seeing the real-time vibe before you arrive.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 pointer-events-auto">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow text-lg px-8 py-6 rounded-full"
              onClick={() => {
                document.getElementById('venues-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <MapPin className="mr-2 h-5 w-5" />
              Explore Live Venues
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary text-foreground hover:bg-primary/10 text-lg px-8 py-6 rounded-full"
              asChild
            >
              <Link to="/for-venues">
                <Zap className="mr-2 h-5 w-5" />
                For Venues
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">Live</div>
              <div className="text-sm text-muted-foreground">Real-time feeds</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">AI</div>
              <div className="text-sm text-muted-foreground">Crowd analysis</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">Privacy</div>
              <div className="text-sm text-muted-foreground">Face blurring</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
