import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign } from "lucide-react";

const IPPortfolio = () => {
  const { data: assets, isLoading } = useQuery({
    queryKey: ["ip-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_assets")
        .select("*")
        .order("value_high", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <section id="portfolio" className="py-24 bg-background">
      <div className="container px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Premium IP Portfolio
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Bankable trademarks positioned at the intersection of AI-enabled design and nanoscale 
              manufacturing, with established market presence and multi-sector licensing potential 
              across health, materials science, and advanced technology.
            </p>
          </div>

          {/* Trademark Class Coverage */}
          <div className="mb-16 mx-auto max-w-4xl">
            <div className="rounded-2xl border-2 border-border bg-card p-8 shadow-md">
              <h3 className="mb-4 text-2xl font-bold text-foreground">
                Trademark Class Coverage
              </h3>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                NANO®, NANO RX®, and THE UNIVERSAL STANDARD® are strategically registered across Classes 
                005, 006, 018, 044, 046, 051, and 052, enabling a unified brand presence spanning pharmaceuticals, 
                materials science, medical devices, health services, certification, and research. NANODOSE® and 
                NANOBIDIOL® own Class 025 (apparel) plus U.S. Classes 022 and 039 for performance and smart wearables. 
                This comprehensive coverage creates institutional-grade defensibility and licensing flexibility across 
                health, materials, technology, and consumer products.
              </p>
              
              <div className="grid gap-3 md:grid-cols-2 mb-6">
                <div className="flex gap-3 rounded-lg bg-muted p-3">
                  <div className="font-bold text-gold">005</div>
                  <div className="text-sm text-muted-foreground">Dietary supplements, pharmaceuticals, vitamins, nutritional formulations, plant extracts</div>
                </div>
                <div className="flex gap-3 rounded-lg bg-muted p-3">
                  <div className="font-bold text-gold">006</div>
                  <div className="text-sm text-muted-foreground">Metals, nanostructured metals, medical containers, coated metals, industrial materials</div>
                </div>
                <div className="flex gap-3 rounded-lg bg-muted p-3">
                  <div className="font-bold text-gold">018</div>
                  <div className="text-sm text-muted-foreground">Cases, bags, carriers, medical kits, health-related accessories</div>
                </div>
                <div className="flex gap-3 rounded-lg bg-muted p-3">
                  <div className="font-bold text-gold">044</div>
                  <div className="text-sm text-muted-foreground">Medical services, telehealth, diagnostics, wellness programs, clinical consultations</div>
                </div>
                <div className="flex gap-3 rounded-lg bg-muted p-3">
                  <div className="font-bold text-gold">046</div>
                  <div className="text-sm text-muted-foreground">Testing, certification, regulatory compliance, third-party verification services</div>
                </div>
                <div className="flex gap-3 rounded-lg bg-muted p-3">
                  <div className="font-bold text-gold">051</div>
                  <div className="text-sm text-muted-foreground">Pharmaceutical raw materials, chemical compositions for medical use</div>
                </div>
                <div className="flex gap-3 rounded-lg bg-muted p-3">
                  <div className="font-bold text-gold">052</div>
                  <div className="text-sm text-muted-foreground">Scientific research substances, nanomaterials for R&D, cleaners, detergents</div>
                </div>
                <div className="flex gap-3 rounded-lg bg-muted p-3">
                  <div className="font-bold text-gold">025</div>
                  <div className="text-sm text-muted-foreground">Apparel, wearables, smart clothing (NANODOSE®, NANOBIDIOL® + US 022, 039)</div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                This full-stack coverage enables the NANO ecosystem to span pharmaceuticals, raw materials, 
                metals, certification, research, clinical services, wearables, and consumer products—creating 
                a complete IP foundation for the nanotechnology-for-health future across materials, formulations, 
                services, and consumer touchpoints.
              </p>
            </div>
          </div>

          {/* Advanced-Industry Leverage */}
          <div className="mb-16 mx-auto max-w-4xl">
            <div className="rounded-2xl border-2 border-border bg-card p-8 shadow-md">
              <h3 className="mb-4 text-2xl font-bold text-foreground">
                Advanced-Industry Leverage
              </h3>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Because the NANO® and NANO RX® families cover Classes 005, 006, 018, 044, 046, 051, and 052, 
                the portfolio extends into several high-value industries beyond health and wellness. This 
                multi-sector coverage positions the trademark ecosystem at the intersection of biotechnology, 
                materials science, and advanced manufacturing.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="rounded-lg bg-muted p-4">
                  <div className="font-bold text-foreground mb-2">Mining & Advanced Materials</div>
                  <div className="text-sm text-muted-foreground">
                    Class 006 supports nano-coated metals, corrosion-resistant materials, industrial containers, 
                    tool coatings, and filtration/treatment materials used in mining and heavy industry.
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <div className="font-bold text-foreground mb-2">Semiconductors & Clean-Room Industries</div>
                  <div className="text-sm text-muted-foreground">
                    Overlap between Class 006, Class 046, and Class 052 enables nano-enhanced surfaces, precision 
                    metal components, protective cases, and specialty cleaning agents relevant to chip fabs and 
                    electronics manufacturing.
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <div className="font-bold text-foreground mb-2">Consumer Products & Household Goods</div>
                  <div className="text-sm text-muted-foreground">
                    Classes 051 and 052 cover nano-enhanced cleaners, disinfectants, topicals, and high-performance 
                    household products.
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <div className="font-bold text-foreground mb-2">Medical Devices & Diagnostics</div>
                  <div className="text-sm text-muted-foreground">
                    Classes 044 and 046 allow expansion into clinical services, diagnostics, devices, instrument 
                    coatings, and delivery systems.
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                These categories make the NANO ecosystem relevant not only to health and wellness but also to 
                materials science, industrial technology, high-performance manufacturing, and regulated global 
                supply chains—strengthening its appeal to institutional lenders and strategic acquirers across 
                multiple sectors.
              </p>
            </div>
          </div>

          {/* Assets Grid */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {assets?.map((asset) => (
                <Card
                  key={asset.id}
                  className="group relative overflow-hidden border-2 border-border bg-card p-8 shadow-md transition-all hover:border-gold hover:shadow-gold"
                >
                  {/* Gold accent bar */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-gold transition-all group-hover:w-2" />

                  <div className="relative">
                    <h3 className="mb-4 text-3xl font-bold text-foreground">
                      {asset.name}
                    </h3>

                    {/* Valuation Range */}
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-muted p-4">
                      <DollarSign className="h-5 w-5 text-gold" />
                      <div>
                        <div className="text-xs text-muted-foreground">Estimated Value</div>
                        <div className="text-xl font-semibold text-foreground">
                          {formatCurrency(asset.value_low)} - {formatCurrency(asset.value_high)}
                        </div>
                      </div>
                    </div>

                    {/* Licensing Potential */}
                    {asset.estimated_licensing_low_per_year && (
                      <div className="mb-4 flex items-center gap-2 rounded-lg bg-gold/10 p-4">
                        <TrendingUp className="h-5 w-5 text-gold" />
                        <div>
                          <div className="text-xs text-muted-foreground">Annual Licensing Potential</div>
                          <div className="text-xl font-semibold text-foreground">
                            {formatCurrency(asset.estimated_licensing_low_per_year)} - {formatCurrency(asset.estimated_licensing_high_per_year)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Markets */}
                    <div className="mb-4">
                      <div className="mb-2 text-sm font-medium text-muted-foreground">Target Markets</div>
                      <div className="flex flex-wrap gap-2">
                        {asset.markets?.split(",").map((market, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {market.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {asset.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default IPPortfolio;
