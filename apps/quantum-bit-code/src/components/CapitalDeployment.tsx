import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Beaker,
  Factory,
  Truck,
  FileText,
  Cpu,
  Building,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const CapitalDeployment = () => {
  const categories = [
    {
      icon: Beaker,
      title: "Product Development",
      description: "NANO RX®, NANODOSE®, and next-generation formulations",
      details: [
        "Nano-formulated supplements and nutraceuticals (Class 005)",
        "Pharmaceutical raw materials and chemical compositions (Class 051)",
        "Scientific research materials and nanomaterials for R&D (Class 052)",
        "Medical device components and testing services (Classes 006 & 046)",
      ],
      percentage: 25,
    },
    {
      icon: Factory,
      title: "Manufacturing & Labs",
      description: "Facility acquisition and production scaling",
      details: [
        "Supplement and beverage manufacturing facilities",
        "Topical and skincare production labs",
        "Device or coated-metal manufacturing partnerships",
        "Contract manufacturing for nano-enhanced product lines",
      ],
      percentage: 20,
    },
    {
      icon: Truck,
      title: "Distribution Channels",
      description: "Market expansion and channel partnerships",
      percentage: 20,
    },
    {
      icon: FileText,
      title: "Licensing Expansion",
      description: "New market territories and use cases",
      percentage: 15,
    },
    {
      icon: Cpu,
      title: "Digital Health / AI",
      description: "Technology ecosystems and platform integration",
      percentage: 12,
    },
    {
      icon: Building,
      title: "Strategic Acquisitions",
      description: "Complementary IP and business assets",
      details: [
        "Existing health and wellness brands for NANO®/NANO RX® rebranding",
        "IP-heavy companies in nanotechnology and materials science",
        "R&D teams aligned with clinical standards and regulatory pathways",
        "Complementary product lines spanning registered trademark classes",
      ],
      percentage: 8,
    },
  ];

  return (
    <section className="py-24 bg-card">
      <div className="container px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center space-y-4">
            <Badge variant="secondary" className="px-6 py-3 text-base border border-border">
              <TrendingUp className="mr-2 h-5 w-5 text-accent" />
              Capital Strategy
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Capital Deployment Plan
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Strategic allocation framework for scaling operations and maximizing
              portfolio value across key growth initiatives.
            </p>
          </div>

          {/* Deployment Categories */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const colorClasses = [
                { bg: "from-step-1/20 to-step-1/5", text: "text-step-1", border: "border-step-1/20", glow: "bg-step-1/5" },
                { bg: "from-step-2/20 to-step-2/5", text: "text-step-2", border: "border-step-2/20", glow: "bg-step-2/5" },
                { bg: "from-step-3/20 to-step-3/5", text: "text-step-3", border: "border-step-3/20", glow: "bg-step-3/5" },
                { bg: "from-step-4/20 to-step-4/5", text: "text-step-4", border: "border-step-4/20", glow: "bg-step-4/5" },
                { bg: "from-accent/20 to-accent/5", text: "text-accent", border: "border-accent/20", glow: "bg-accent/5" },
                { bg: "from-cyan/20 to-cyan/5", text: "text-cyan", border: "border-cyan/20", glow: "bg-cyan/5" },
              ];
              const colorClass = colorClasses[index % colorClasses.length];
              
              return (
                <Card
                  key={index}
                  className="relative overflow-hidden border-2 border-border bg-background p-8 shadow-sm transition-all hover:shadow-lg hover:border-accent/50 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all" />
                  
                  {/* Percentage badge */}
                  <div className={`absolute right-6 top-6 rounded-xl bg-gradient-to-br ${colorClass.bg} border ${colorClass.border} px-4 py-2 shadow-sm`}>
                    <span className={`text-lg font-bold ${colorClass.text}`}>{category.percentage}%</span>
                  </div>

                  <div className="relative mb-6">
                    <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClass.bg} border ${colorClass.border} shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all`}>
                      <div className={`absolute inset-0 ${colorClass.glow} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
                      <Icon className={`h-8 w-8 ${colorClass.text} relative z-10`} />
                    </div>
                  </div>

                  <div className="relative">
                    <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {category.description}
                    </p>

                    {category.details && (
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        {category.details.map((detail, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className={`${colorClass.text} mt-1 shrink-0`}>•</span>
                            <span className="leading-relaxed">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Progress bar */}
                    <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full bg-gradient-to-r ${colorClass.bg.replace('/20', '').replace('/5', '/60')} transition-all duration-1000 ease-out`}
                        style={{ width: `${category.percentage * 4}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Summary Note */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-accent/30 bg-background/50 p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 shadow-md">
                  <div className="absolute inset-0 bg-accent/5 rounded-xl blur-xl" />
                  <TrendingUp className="h-8 w-8 text-accent relative z-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Conservative Growth Framework
                  </h3>
                </div>
              </div>
              
              <div className="relative pl-2 border-l-2 border-accent/20">
                <div className="absolute top-0 -left-0.5 h-8 w-0.5 bg-gradient-to-b from-accent to-transparent" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Capital deployment priorities are designed to maximize portfolio value while maintaining
                  operational flexibility. Allocations may adjust based on market conditions, strategic
                  opportunities, and institutional partner requirements.
                </p>
              </div>
            </Card>

            <Card className="border-2 border-step-4/30 bg-background/50 p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-step-4/20 to-step-4/5 border border-step-4/20 shadow-md">
                  <div className="absolute inset-0 bg-step-4/5 rounded-xl blur-xl" />
                  <ShieldCheck className="h-8 w-8 text-step-4 relative z-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Risk & Governance Snapshot
                  </h3>
                </div>
              </div>
              
              <div className="relative pl-2 border-l-2 border-step-4/20">
                <div className="absolute top-0 -left-0.5 h-8 w-0.5 bg-gradient-to-b from-step-4 to-transparent" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The trust and licensing structure acknowledges regulatory, scientific, and execution 
                  risks inherent in health and materials sectors while maintaining a conservative, 
                  lender-friendly framework. Detailed financial models, comprehensive risk disclosures, 
                  and legal documentation are shared exclusively in the gated data room following NDA 
                  execution, ensuring institutional-grade governance and transparency throughout the 
                  capital deployment process.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CapitalDeployment;
