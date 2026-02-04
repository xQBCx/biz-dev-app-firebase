import { TrendingUp, Zap, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const MarketTiming = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-6">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Market Inflection Point</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Why Nanotechnology Is the Next Infrastructure Play
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              AI has mapped the solutions. Nanotechnology delivers the precision to build them.
            </p>
          </div>

          {/* Core Thesis */}
          <Card className="p-8 md:p-12 bg-card border-2 border-border shadow-lg">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-foreground">
                Over the past three years, artificial intelligence achieved computational breakthroughs 
                that solved design, optimization, and prediction challenges across materials science, 
                drug development, and precision manufacturing. But AI doesn't build physical products—it 
                generates specifications. <span className="font-semibold text-accent">The next frontier 
                is physical implementation at atomic and molecular scale.</span>
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Nanotechnology is projected to exceed $250B globally by 2030, spanning pharmaceuticals, 
                medical devices, materials science, coated metals, semiconductors, industrial containers, 
                clean-room technologies, consumer products, and advanced manufacturing.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                This convergence creates a once-in-a-generation infrastructure opportunity. Just as "cloud 
                computing" and "blockchain" became foundational categories requiring naming rights and 
                trademark control, <span className="font-semibold text-foreground">"nano" is the semantic 
                anchor for precision manufacturing, molecular engineering, and AI-enabled materials science.</span> 
                Companies building nanoscale products need brandable, defensible terminology across supplements, 
                pharmaceuticals, diagnostics, coatings, materials, and medical devices.
              </p>
            </div>
          </Card>

          {/* Strategic Positioning Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Market Timing</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-designed nanomaterials are moving from labs to commercial production in 2025–2026. 
                Early trademark positioning captures IP infrastructure before category consolidation.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Class Coverage</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                NANO® and NANO RX® trademarks cover Classes 005, 006, 018, 044, 046, 051, 052—the exact 
                categories where AI-nano convergence is creating commercial products (pharma, materials, 
                diagnostics, certification, medical devices).
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Collateral Value</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As nanotechnology becomes infrastructure, generic "nano" branding loses defensibility. 
                Registered trademarks with comprehensive class coverage become high-value licensing assets 
                and IP-backed collateral for institutional credit.
              </p>
            </Card>
          </div>

          {/* Bottom Insight */}
          <div className="text-center space-y-4 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              <span className="font-semibold text-foreground">Investment Insight:</span> The companies 
              that controlled "cloud" branding (Amazon Web Services, Microsoft Azure, Google Cloud) captured 
              outsized market share in the cloud computing revolution. Similarly, controlling "nano" 
              trademark infrastructure across health, materials, and technology sectors positions this 
              portfolio at the center of the AI-to-physical manufacturing transition—a trend measured in 
              decades, not quarters.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketTiming;