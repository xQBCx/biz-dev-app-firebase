import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Shield, TrendingUp, Clock, Blocks, Building2, FileCheck, DollarSign, Rocket } from "lucide-react";

const Tokenization = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container px-6">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm border border-border">
              <Clock className="mr-2 h-4 w-4 text-step-2" />
              Phase 2 Initiative
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Future Tokenization Layer
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Optional digital infrastructure for enhanced transparency and liquidity,
              deployed only after core trust and lending frameworks are operational.
            </p>
          </div>

          {/* Key Points Grid */}
          <div className="grid gap-8 md:grid-cols-3 mb-16">
            <Card className="relative border-2 border-border bg-background p-8 text-center group hover:border-step-1/50 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-step-1/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all" />
              <div className="relative">
                <div className="mx-auto mb-6 relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-step-1/20 to-step-1/5 border border-step-1/20 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                  <div className="absolute inset-0 bg-step-1/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <Coins className="h-10 w-10 text-step-1 relative z-10" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">
                  Royalty Stream Tokens
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Potential tokenization of licensing revenue streams for qualified investors
                </p>
              </div>
            </Card>

            <Card className="relative border-2 border-border bg-background p-8 text-center group hover:border-step-2/50 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-step-2/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all" />
              <div className="relative">
                <div className="mx-auto mb-6 relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-step-2/20 to-step-2/5 border border-step-2/20 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                  <div className="absolute inset-0 bg-step-2/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <Shield className="h-10 w-10 text-step-2 relative z-10" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">
                  IP Protection First
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Raw IP assets remain protected in trust structure, not directly tokenized
                </p>
              </div>
            </Card>

            <Card className="relative border-2 border-border bg-background p-8 text-center group hover:border-step-3/50 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-step-3/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all" />
              <div className="relative">
                <div className="mx-auto mb-6 relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-step-3/20 to-step-3/5 border border-step-3/20 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                  <div className="absolute inset-0 bg-step-3/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <Blocks className="h-10 w-10 text-step-3 relative z-10" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">
                  Enhanced Transparency
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Blockchain-based reporting for real-time performance visibility
                </p>
              </div>
            </Card>
          </div>

          {/* Conservative Statement */}
          <Card className="relative border-2 border-step-4/30 bg-background overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-step-4/5 via-transparent to-transparent" />
            
            <div className="relative p-10">
              {/* Header */}
              <div className="flex items-start gap-6 mb-10">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-step-4/20 to-step-4/5 border-2 border-step-4/20 shadow-lg">
                  <div className="absolute inset-0 bg-step-4/10 rounded-2xl blur-2xl" />
                  <Clock className="h-10 w-10 text-step-4 relative z-10" />
                </div>
                <div className="flex-1">
                  <Badge variant="outline" className="mb-3 border-step-4/30 text-step-4">
                    Risk-Mitigated Framework
                  </Badge>
                  <h3 className="text-3xl font-bold text-foreground mb-3">
                    Phased & Conservative Approach
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Tokenization is entirely <strong className="text-foreground">optional</strong> and 
                    will only be pursued after core infrastructure milestones are achieved and validated by institutional partners.
                  </p>
                </div>
              </div>

              {/* Prerequisites Timeline */}
              <div className="mb-10">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                  <div className="h-px w-8 bg-step-4/30" />
                  Required Prerequisites
                </h4>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="relative p-6 border-2 border-step-1/20 bg-card group hover:border-step-1/40 transition-all hover:shadow-md">
                    <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-step-1 to-step-1/50" />
                    <div className="flex items-start gap-4 pl-2">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-step-1/20 to-step-1/5 border border-step-1/30">
                        <Building2 className="h-6 w-6 text-step-1" />
                      </div>
                      <div className="flex-1 pt-1">
                        <Badge variant="outline" className="mb-2 text-xs border-step-1/30 text-step-1">
                          Prerequisite 1
                        </Badge>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          IP Trust Formation
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Complete with institutional trustees and formal governance
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="relative p-6 border-2 border-step-2/20 bg-card group hover:border-step-2/40 transition-all hover:shadow-md">
                    <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-step-2 to-step-2/50" />
                    <div className="flex items-start gap-4 pl-2">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-step-2/20 to-step-2/5 border border-step-2/30">
                        <FileCheck className="h-6 w-6 text-step-2" />
                      </div>
                      <div className="flex-1 pt-1">
                        <Badge variant="outline" className="mb-2 text-xs border-step-2/30 text-step-2">
                          Prerequisite 2
                        </Badge>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Independent Valuations
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Third-party IP appraisals finalized and audited
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="relative p-6 border-2 border-step-3/20 bg-card group hover:border-step-3/40 transition-all hover:shadow-md">
                    <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-step-3 to-step-3/50" />
                    <div className="flex items-start gap-4 pl-2">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-step-3/20 to-step-3/5 border border-step-3/30">
                        <DollarSign className="h-6 w-6 text-step-3" />
                      </div>
                      <div className="flex-1 pt-1">
                        <Badge variant="outline" className="mb-2 text-xs border-step-3/30 text-step-3">
                          Prerequisite 3
                        </Badge>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Traditional Credit Secured
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          IP-backed facilities with institutional lenders operational
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="relative p-6 border-2 border-step-4/20 bg-card group hover:border-step-4/40 transition-all hover:shadow-md">
                    <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-step-4 to-step-4/50" />
                    <div className="flex items-start gap-4 pl-2">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-step-4/20 to-step-4/5 border border-step-4/30">
                        <Rocket className="h-6 w-6 text-step-4" />
                      </div>
                      <div className="flex-1 pt-1">
                        <Badge variant="outline" className="mb-2 text-xs border-step-4/30 text-step-4">
                          Prerequisite 4
                        </Badge>
                        <p className="text-sm font-semibold text-foreground mb-1">
                          Revenue Validation
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Operating companies demonstrating commercial traction
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="relative p-6 rounded-xl border-2 border-accent/20 bg-accent/5">
                <div className="absolute top-0 left-6 h-0.5 w-16 bg-gradient-to-r from-accent to-transparent" />
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground mb-2">
                      Complementary Enhancement, Not Replacement
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Any future tokenization layer would function exclusively as a <strong className="text-foreground">transparency 
                      and liquidity mechanism</strong> for qualified investors—not as a substitute for conventional financial structures. 
                      The underlying IP assets and trust framework remain institutionally managed under traditional governance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Tokenization;
