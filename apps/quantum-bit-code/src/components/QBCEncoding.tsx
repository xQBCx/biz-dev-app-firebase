import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hexagon, Layers, Clock, Sparkles, Box, Orbit } from "lucide-react";
import DecryptedText from "./DecryptedText";

const QBCEncoding = () => {
  const concepts = [
    {
      icon: Box,
      title: "Lattice Foundation",
      description: "Based on configurations like Metatron's Cube, where each node represents a character, symbol, or data point in 3D vector space.",
    },
    {
      icon: Clock,
      title: "Temporal Evolution",
      description: "The lattice and shape evolve in a programmed, sequential manner—adding time as a critical dimension of the encryption.",
    },
    {
      icon: Sparkles,
      title: "Spectral Encoding",
      description: "Signal intensity, frequency, and color add further dimensions of data, creating limitless encoding combinations.",
    },
    {
      icon: Orbit,
      title: "Fractalization",
      description: "Used to modulate the scale of the message or assist in transmission resolution across different mediums.",
    },
  ];

  return (
    <section id="qbc-encoding" className="py-24 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_hsl(185_100%_50%_/_0.08)_0%,_transparent_70%)]" />
      
      <div className="container relative z-10 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center space-y-4">
            <Badge variant="outline" className="px-4 py-2 text-sm border-primary/50 bg-primary/10 text-primary">
              <Hexagon className="mr-2 h-4 w-4" />
              <DecryptedText text="Core Protocol" animateOn="view" speed={30} maxIterations={10} />
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              <DecryptedText text="QBC: Geometric Information Objects" animateOn="view" speed={35} maxIterations={12} />
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
              <DecryptedText 
                text="Information is encoded not as static data, but as dynamic vector-based forms in spatial-temporal lattices. The shape, structure, and sequence function as a post-quantum encryption layer." 
                animateOn="view" 
                speed={15} 
                maxIterations={6} 
              />
            </p>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-2 mb-16">
            {/* Left - Visual Representation */}
            <Card className="relative p-10 border-2 border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              
              {/* Geometric visualization placeholder */}
              <div className="relative aspect-square flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Animated geometric shapes */}
                  <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin-slow" />
                  <div className="absolute inset-4 border-2 border-quantum-purple/30 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
                  <div className="absolute inset-8 border-2 border-step-2/30 rounded-full animate-spin-slow" style={{ animationDuration: '15s' }} />
                  
                  {/* Center hexagon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 border-2 border-primary bg-primary/10 rotate-45 flex items-center justify-center">
                      <Hexagon className="h-12 w-12 text-primary -rotate-45" />
                    </div>
                  </div>
                  
                  {/* Corner nodes */}
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <div 
                      key={i}
                      className="absolute w-3 h-3 bg-primary rounded-full animate-pulse-glow"
                      style={{
                        top: `${50 + 45 * Math.sin(angle * Math.PI / 180)}%`,
                        left: `${50 + 45 * Math.cos(angle * Math.PI / 180)}%`,
                        transform: 'translate(-50%, -50%)',
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="relative text-center mt-6">
                <p className="text-sm text-muted-foreground">
                  Lattice State Vector: <code className="text-primary font-mono">Ψ = (L, O, T, S, M)</code>
                </p>
              </div>
            </Card>

            {/* Right - Concepts */}
            <div className="space-y-4">
              {concepts.map((concept, index) => {
                const Icon = concept.icon;
                return (
                  <Card 
                    key={index}
                    className="p-6 border-2 border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shrink-0 group-hover:bg-primary/20 transition-all">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          <DecryptedText text={concept.title} animateOn="view" speed={40} maxIterations={10} />
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          <DecryptedText text={concept.description} animateOn="view" speed={15} maxIterations={5} />
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* State Vector Explanation */}
          <Card className="p-8 border-2 border-border bg-card/30 backdrop-blur-sm">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  <DecryptedText text="Multi-Dimensional Encoding Variables" animateOn="view" speed={35} maxIterations={10} />
                </h3>
                <div className="grid gap-4 md:grid-cols-5">
                  {[
                    { code: 'L', label: 'Lattice', desc: 'Fundamental geometry' },
                    { code: 'O', label: 'Orientation', desc: 'Rotation group in space' },
                    { code: 'T', label: 'Temporal', desc: 'Time evolution function' },
                    { code: 'S', label: 'Spectral', desc: 'Frequency, phase, amplitude' },
                    { code: 'M', label: 'Medium', desc: 'Physical substrate profile' },
                  ].map((item, i) => (
                    <div key={i} className="text-center p-4 rounded-lg bg-muted/50 border border-border">
                      <code className="text-2xl font-bold text-primary font-mono">{item.code}</code>
                      <p className="text-sm font-semibold text-foreground mt-2">
                        <DecryptedText text={item.label} animateOn="hover" speed={40} maxIterations={8} />
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QBCEncoding;