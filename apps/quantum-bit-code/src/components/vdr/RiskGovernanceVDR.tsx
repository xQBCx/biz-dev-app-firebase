import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const RiskGovernanceVDR = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Badge variant="secondary" className="px-4 py-2">
          <Shield className="mr-2 h-4 w-4 text-accent" />
          Confidential — NDA Protected
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Risk & Governance
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Comprehensive risk assessment, mitigation strategies, and governance framework for IP-backed lending structure.
        </p>
      </div>

      {/* Risk Categories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Risk Assessment</h2>
        
        <Accordion type="single" collapsible className="space-y-4">
          {/* Regulatory Risk */}
          <AccordionItem value="regulatory" className="border border-border rounded-lg">
            <Card className="border-0">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-foreground">Regulatory & Compliance Risk</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 text-muted-foreground">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Risk Overview</h4>
                    <p>
                      Health and wellness products, particularly those involving nanotechnology, CBD, and dietary supplements,
                      are subject to FDA regulations, state-specific rules, and evolving international standards. Regulatory
                      changes could impact product development timelines, market entry, and licensing agreements.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Mitigation Strategies</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Trademark portfolio structured as separate asset class from product development</li>
                      <li>IP Trust collateral value based on trademark defensibility and licensing potential, not regulatory approval</li>
                      <li>Partnerships with regulatory consultants and compliance advisors for product-level execution</li>
                      <li>Multi-jurisdiction trademark protection to diversify regulatory exposure</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Scientific & Technical Risk */}
          <AccordionItem value="scientific" className="border border-border rounded-lg">
            <Card className="border-0">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-foreground">Scientific & Technical Risk</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 text-muted-foreground">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Risk Overview</h4>
                    <p>
                      Nanotechnology applications in health, materials science, and manufacturing are scientifically complex
                      and require specialized expertise, validation studies, and third-party partnerships. Technical execution
                      risk could impact product commercialization timelines and market viability.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Mitigation Strategies</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>IP valuation based on trademark brand equity and licensing potential across multiple use cases</li>
                      <li>Trademark classes cover broad applications (005, 006, 018, 044, 046, 051, 052) reducing dependence on single vertical</li>
                      <li>Partnership model allows technical execution by specialized licensees and manufacturing partners</li>
                      <li>Digital asset portfolio creates infrastructure value independent of product development</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Market & Competitive Risk */}
          <AccordionItem value="market" className="border border-border rounded-lg">
            <Card className="border-0">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-foreground">Market & Competitive Risk</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 text-muted-foreground">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Risk Overview</h4>
                    <p>
                      Health and wellness markets are highly competitive with established brands and new entrants. Consumer
                      preferences, market trends, and competitive dynamics could impact brand positioning and licensing demand
                      for NANO trademark portfolio.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Mitigation Strategies</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Federal trademark registration provides legal defensibility and exclusive rights across US markets</li>
                      <li>Broad class coverage allows pivot to highest-value verticals based on market conditions</li>
                      <li>Domain portfolio and .nano TLD acquisition strengthen digital defensibility against competitors</li>
                      <li>THE UNIVERSAL STANDARD® certification mark creates unique positioning as quality badge</li>
                      <li>Replacement cost methodology for valuation reduces sensitivity to short-term market fluctuations</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Execution & Operational Risk */}
          <AccordionItem value="execution" className="border border-border rounded-lg">
            <Card className="border-0">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-foreground">Execution & Operational Risk</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 text-muted-foreground">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Risk Overview</h4>
                    <p>
                      Execution of product development, manufacturing partnerships, distribution agreements, and licensing
                      deals requires operational expertise, capital deployment discipline, and third-party relationship management.
                      Delays or failures in execution could impact revenue generation and collateral performance.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Mitigation Strategies</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Phased capital deployment strategy prioritizing highest-ROI opportunities first</li>
                      <li>Partnership model distributes execution risk across specialized licensees and manufacturers</li>
                      <li>IP Trust structure separates IP ownership from operational execution, protecting collateral</li>
                      <li>Governance framework with advisor oversight ensures strategic alignment and risk monitoring</li>
                      <li>Diversified capital deployment across multiple categories reduces single-point-of-failure risk</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* IP Valuation & Collateral Risk */}
          <AccordionItem value="valuation" className="border border-border rounded-lg">
            <Card className="border-0">
              <AccordionTrigger className="px-6 hover:no-underline">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-foreground">IP Valuation & Collateral Risk</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 text-muted-foreground">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Risk Overview</h4>
                    <p>
                      IP-backed lending relies on accurate valuation of intangible assets including trademarks, brand equity,
                      and digital asset portfolios. Valuation disputes, market perception changes, or enforcement challenges
                      could impact collateral value and loan-to-value ratios.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Mitigation Strategies</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Third-party IP valuation firms (Anson, Ocean Tomo, IPEG) provide independent appraisals</li>
                      <li>Valuation methodology combines replacement cost, market comparables, and licensing potential</li>
                      <li>Federal trademark registration provides enforceable legal rights supporting collateral value</li>
                      <li>Digital asset portfolio (domains + .nano TLD) creates tangible, transferable collateral layer</li>
                      <li>Conservative loan-to-value ratios account for illiquidity and valuation uncertainty</li>
                      <li>IP insurance policies available to protect against enforcement risk and infringement</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Governance Framework */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Governance Framework</h2>
        
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">IP Trust Structure</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Trademark assets are held within an IP Trust structure that separates IP ownership from operational execution,
              protecting collateral value from product-level risks and ensuring lender priority in capital structure.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Trust holds legal title to all federally registered trademarks</li>
              <li>Separate operating entities license trademarks from Trust for product development</li>
              <li>Lenders hold security interest in Trust assets, not operating company equity</li>
              <li>Trust governance documents define IP usage rights, licensing terms, and enforcement protocols</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Advisory & Oversight</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Strategic advisory board and specialized consultants provide guidance on IP strategy, regulatory compliance,
              scientific validation, and capital deployment to ensure informed decision-making and risk mitigation.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>IP counsel for trademark enforcement, licensing agreements, and infringement monitoring</li>
              <li>Regulatory advisors for FDA compliance, state regulations, and international standards</li>
              <li>Scientific advisors for nanotechnology applications, materials science, and product validation</li>
              <li>Financial advisors for capital structure, valuation updates, and lender relationships</li>
            </ul>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Reporting & Transparency</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Regular reporting to lenders and stakeholders ensures transparency, accountability, and alignment with
              IP-backed financing covenants and performance metrics.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Quarterly financial reporting including revenue, expenses, and capital deployment status</li>
              <li>Annual IP valuation updates from third-party appraisal firms</li>
              <li>Licensing agreement documentation and royalty tracking</li>
              <li>Trademark maintenance and renewal status reporting</li>
              <li>Material event notifications for regulatory changes, litigation, or strategic pivots</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Bottom Notice */}
      <Card className="p-6 border-accent/30 bg-accent/5">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-accent mt-1" />
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Additional Documentation</h4>
            <p className="text-sm text-muted-foreground">
              Detailed risk models, scenario analyses, insurance policies, governance agreements, and legal documentation
              are available upon request to qualified lenders during due diligence process.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RiskGovernanceVDR;
