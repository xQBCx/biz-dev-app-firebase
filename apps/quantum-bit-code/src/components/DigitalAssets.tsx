import { Card } from "@/components/ui/card";
import { Globe, Shield, Lock, Database, Globe2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth"
    });
  }
};
const DigitalAssets = () => {
  return <section id="digital-assets" className="py-24 bg-background">
      <div className="container px-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border border-accent/30">
              <Globe className="h-5 w-5 text-accent" />
              <span className="text-sm font-semibold text-accent">Digital Asset Layer</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Domain Portfolio Strategy</h2>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A strategic collection of digital assets that reinforce trademark protection, 
              expand brand equity, and create infrastructure for global licensing operations.
            </p>
          </div>

          {/* Value Proposition Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="relative p-8 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent overflow-hidden group hover:border-accent/40 transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
              <div className="relative space-y-4">
                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 w-fit">
                  <Globe className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Strategic Domain Portfolio</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Extensive NANO-related domain portfolio strategically classified across brand, 
                  product, scientific, wellness, and technology verticals.
                </p>
              </div>
            </Card>

            <Card className="relative p-8 border-2 border-step-2/20 bg-gradient-to-br from-step-2/5 to-transparent overflow-hidden group hover:border-step-2/40 transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-step-2/10 rounded-full blur-3xl" />
              <div className="relative space-y-4">
                <div className="p-3 rounded-xl bg-step-2/10 border border-step-2/20 w-fit">
                  <Shield className="h-6 w-6 text-step-2" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Collateral Enhancement</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Digital assets treated as a separate asset class that enhances trademark 
                  defensibility and integrates into IP-backed credit facilities.
                </p>
              </div>
            </Card>

            <Card className="relative p-8 border-2 border-step-3/20 bg-gradient-to-br from-step-3/5 to-transparent overflow-hidden group hover:border-step-3/40 transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-step-3/10 rounded-full blur-3xl" />
              <div className="relative space-y-4">
                <div className="p-3 rounded-xl bg-step-3/10 border border-step-3/20 w-fit">
                  <Globe2 className="h-6 w-6 text-step-3" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
              </h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  This information is available under NDA.
                </p>
              </div>
            </Card>
          </div>

          {/* Strategic Framework */}
          <div className="mb-16">
            <Card className="relative border-2 border-border bg-card/50 p-10 overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-step-2/5" />
              <div className="relative space-y-6">
                <div className="flex items-start gap-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 shrink-0">
                    <Database className="h-8 w-8 text-accent" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-bold text-foreground">Digital Infrastructure for IP-Backed Lending</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The digital asset portfolio serves as infrastructure for product microsites, clinical program portals, 
                      certification hubs, and partner landing pages—creating a comprehensive digital ecosystem that 
                      strengthens brand protection, trademark defensibility, and enables formal valuation frameworks 
                      for institutional IP-backed lending relationships.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-accent shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-foreground mb-1">Trademark Protection</p>
                      <p className="text-sm text-muted-foreground">
                        Defensive domain registration preventing cybersquatting and brand dilution across digital channels.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe2 className="h-5 w-5 text-step-2 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-foreground mb-1">Licensing Infrastructure</p>
                      <p className="text-sm text-muted-foreground">
                        Digital namespace enabling partner portals, sub-licensing structures, and revenue-generating digital channels.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Privacy Notice & CTA */}
          <Card className="relative border-2 border-accent/30 bg-background/50 p-10 overflow-hidden group hover:border-accent/50 transition-all hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all" />
            
            <div className="relative flex items-start gap-8">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <Lock className="h-10 w-10 text-accent relative z-10" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-2xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    Full Portfolio Details Available After NDA
                  </h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Comprehensive portfolio information including specific domain lists, valuations, appraisal 
                  notes, web domain acquisition strategy, and strategic implementation roadmaps are available to 
                  qualified investors in the Virtual Data Room after NDA signature.
                </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>Complete domain portfolio with individual valuations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>Third-party appraisal documentation and market comparables</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>Further web domain acquisition strategy and cost-benefit analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>Digital asset integration with IP-backed lending terms</span>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" onClick={() => scrollToSection("contact")} className="border-2 border-accent/30 hover:border-accent hover:bg-accent/5 text-foreground font-semibold px-6 py-6 text-base transition-all group/btn">
                    <span className="mr-2">Request Investor Access</span>
                    <span className="inline-block transition-transform group-hover/btn:translate-x-1">→</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 h-32 w-32 bg-gradient-to-tl from-accent/10 to-transparent rounded-tl-full opacity-50" />
          </Card>
        </div>
      </div>
    </section>;
};
export default DigitalAssets;