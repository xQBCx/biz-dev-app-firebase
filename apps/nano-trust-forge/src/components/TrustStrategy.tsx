import { Shield, Building2, FileCheck, Landmark } from "lucide-react";

const TrustStrategy = () => {
  const steps = [
    {
      icon: Shield,
      title: "IP Trust Formation",
      description: "Establish legal trust structure to hold and protect trademark portfolio with institutional-grade governance.",
      stepNumber: 1,
    },
    {
      icon: Building2,
      title: "Operating Company Licensing",
      description: "License IP to operating entities for commercialization while maintaining trust ownership and control.",
      stepNumber: 2,
    },
    {
      icon: FileCheck,
      title: "Formal IP Valuation",
      description: "Independent third-party valuation providing credible collateral assessment for financial institutions.",
      stepNumber: 3,
    },
    {
      icon: Landmark,
      title: "IP-Backed Credit Facilities",
      description: "Secure non-dilutive capital through IP-collateralized lending relationships with institutional lenders.",
      stepNumber: 4,
    },
  ];

  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              IP-as-Collateral Trust Strategy
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              A structured approach to unlocking capital from intellectual property assets
              through institutional-grade frameworks. Target counterparties include IP-backed 
              lenders and advisors such as Aon, Hilco Streambank, Gordon Brothers, Houlihan Lokey, 
              and select private credit funds.
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-8 top-12 h-[calc(100%-6rem)] w-0.5 bg-gradient-to-b from-step-1 via-step-2 to-step-4 md:left-1/2" />

            <div className="space-y-12">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                
                // Define step-specific colors
                const stepColors = {
                  1: { border: "border-step-1", text: "text-step-1", bg: "bg-step-1", shadow: "shadow-step-1/20" },
                  2: { border: "border-step-2", text: "text-step-2", bg: "bg-step-2", shadow: "shadow-step-2/20" },
                  3: { border: "border-step-3", text: "text-step-3", bg: "bg-step-3", shadow: "shadow-step-3/20" },
                  4: { border: "border-step-4", text: "text-step-4", bg: "bg-step-4", shadow: "shadow-step-4/20" },
                };
                
                const colors = stepColors[step.stepNumber as keyof typeof stepColors];

                return (
                  <div
                    key={index}
                    className={`relative flex flex-col md:flex-row ${
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    } gap-8 items-center`}
                  >
                    {/* Content */}
                    <div className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"}`}>
                      <div className={`rounded-2xl border-2 ${colors.border} bg-card p-8 shadow-lg transition-all hover:shadow-cyan`}>
                        <div className={`mb-2 text-sm font-semibold ${colors.text}`}>
                          Step {index + 1}
                        </div>
                        <h3 className="mb-3 text-2xl font-bold text-foreground">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Icon Circle */}
                    <div className={`relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${colors.bg} shadow-lg ${colors.shadow}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {/* Spacer for desktop */}
                    <div className="hidden flex-1 md:block" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustStrategy;
