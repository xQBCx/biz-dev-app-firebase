import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, TrendingUp, Building2, Users, FileCheck, Network } from "lucide-react";

export const CorporateStructureEducation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Corporate Structure Education
        </CardTitle>
        <CardDescription>
          Understanding different entity structures for liability protection, tax optimization, and operational efficiency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="holding-company">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Holding Company Structure</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                A holding company owns the assets (shares, intellectual property, real estate) while operating companies handle day-to-day business activities.
              </p>
              <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
                <p><strong>Benefits:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Maximum liability protection - lawsuits against operating companies don't affect holding company assets</li>
                  <li>Tax efficiency - profits can be distributed strategically</li>
                  <li>Asset protection - valuable IP and property are shielded</li>
                  <li>Easier succession planning and transfers</li>
                </ul>
              </div>
              <p className="text-sm font-medium mt-2">Example: EnWaTel LLC (holding) owns distribution rights, while operating LLCs handle customer relationships</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="distribution-rights">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                <span>Distribution Rights & Licensing</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your company holds exclusive rights to distribute or license products/services without owning the underlying company.
              </p>
              <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
                <p><strong>Key Advantages:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Revenue generation without operational liability</li>
                  <li>Lower capital requirements than full ownership</li>
                  <li>Corporate veil protection - you're a separate entity</li>
                  <li>Can hold multiple distribution agreements in one entity</li>
                </ul>
              </div>
              <p className="text-sm font-medium mt-2">Example: Business Development LLC holds distribution rights for TheViewPro and Seenic.io</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="wholly-owned">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Wholly-Owned Subsidiaries</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                100% ownership provides complete control while maintaining separate legal entities for liability protection.
              </p>
              <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
                <p><strong>Strategic Uses:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Isolate high-risk business operations</li>
                  <li>Separate brands or market segments</li>
                  <li>Tax optimization across jurisdictions</li>
                  <li>Easier to sell individual business units</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sister-companies">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                <span>Sister Companies</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Multiple companies owned by the same parent entity, operating independently but with shared ownership.
              </p>
              <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
                <p><strong>Best For:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Different business lines requiring separate branding</li>
                  <li>Risk isolation - failure of one doesn't affect others</li>
                  <li>Easier to bring in partners or investors per company</li>
                  <li>Regulatory compliance (different industries)</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="liability-shield">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Liability Shield Best Practices</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Maintain proper corporate separation to preserve liability protection.
              </p>
              <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
                <p><strong>Critical Requirements:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Separate bank accounts for each entity</li>
                  <li>Proper bookkeeping and financial records</li>
                  <li>Written contracts between related entities</li>
                  <li>Annual meetings and corporate minutes</li>
                  <li>Never co-mingle personal and business funds</li>
                  <li>Adequate capitalization of each entity</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tax-optimization">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Tax Optimization Strategies</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Structure entities to minimize tax burden while remaining compliant.
              </p>
              <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
                <p><strong>Common Strategies:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Income splitting across entities and family members</li>
                  <li>Strategic location of IP holding companies</li>
                  <li>Management fees between related entities</li>
                  <li>Cost allocation and transfer pricing</li>
                  <li>Qualified Business Income (QBI) deduction optimization</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Note: Always consult with tax professionals. Aggressive strategies may trigger IRS scrutiny.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};