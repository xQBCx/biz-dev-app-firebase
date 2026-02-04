import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, DollarSign, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FinancialProjectionsVDR = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Badge variant="secondary" className="px-4 py-2">
          <Shield className="mr-2 h-4 w-4 text-accent" />
          Confidential — NDA Protected
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Financial Projections
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Conservative financial projections, licensing revenue models, and scenario analyses for IP-backed lending structure.
        </p>
      </div>

      {/* Current Portfolio Valuation */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Current Portfolio Valuation</h2>
        
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Asset</TableHead>
                <TableHead>Valuation Range</TableHead>
                <TableHead>Licensing Potential (Annual)</TableHead>
                <TableHead>Class Coverage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">NANO®</TableCell>
                <TableCell>{formatCurrency(60000000)} - {formatCurrency(150000000)}</TableCell>
                <TableCell>{formatCurrency(3000000)} - {formatCurrency(10000000)}</TableCell>
                <TableCell><Badge variant="outline">005, 006, 018, 044, 046, 051, 052</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">NANO RX®</TableCell>
                <TableCell>{formatCurrency(40000000)} - {formatCurrency(120000000)}</TableCell>
                <TableCell>{formatCurrency(2000000)} - {formatCurrency(6000000)}</TableCell>
                <TableCell><Badge variant="outline">005, 006, 018, 044, 046, 051, 052</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">THE UNIVERSAL STANDARD®</TableCell>
                <TableCell>{formatCurrency(50000000)} - {formatCurrency(120000000)}</TableCell>
                <TableCell>{formatCurrency(5000000)} - {formatCurrency(30000000)}+</TableCell>
                <TableCell><Badge variant="outline">005, 006, 018, 044, 046, 051, 052</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">NANODOSE®</TableCell>
                <TableCell>{formatCurrency(8000000)} - {formatCurrency(20000000)}</TableCell>
                <TableCell>{formatCurrency(500000)} - {formatCurrency(2000000)}</TableCell>
                <TableCell><Badge variant="outline">025, 022, 039</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">NANOBIDIOL®</TableCell>
                <TableCell>{formatCurrency(8000000)} - {formatCurrency(20000000)}</TableCell>
                <TableCell>{formatCurrency(500000)} - {formatCurrency(2000000)}</TableCell>
                <TableCell><Badge variant="outline">025, 022, 039</Badge></TableCell>
              </TableRow>
              <TableRow className="font-bold bg-accent/5">
                <TableCell>Total Portfolio</TableCell>
                <TableCell>{formatCurrency(166000000)} - {formatCurrency(430000000)}</TableCell>
                <TableCell>{formatCurrency(11000000)} - {formatCurrency(50000000)}+</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6 space-y-3 border-accent/30 bg-accent/5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Accelerated Valuation Scenario</h3>
          </div>
          <p className="text-muted-foreground">
            With active product development, licensing agreements, digital asset integration, and market positioning,
            total portfolio valuation could reach <strong className="text-foreground">{formatCurrency(1200000000)}+</strong> within 
            24–36 months based on comparable transactions and market demand for nanotechnology-branded health products.
          </p>
        </Card>
      </div>

      {/* Revenue Projections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Licensing Revenue Projections</h2>
        
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead>Year 1</TableHead>
                <TableHead>Year 2</TableHead>
                <TableHead>Year 3</TableHead>
                <TableHead>Year 5</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">Conservative</TableCell>
                <TableCell>{formatCurrency(500000)}</TableCell>
                <TableCell>{formatCurrency(1500000)}</TableCell>
                <TableCell>{formatCurrency(3000000)}</TableCell>
                <TableCell>{formatCurrency(8000000)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Base Case</TableCell>
                <TableCell>{formatCurrency(1000000)}</TableCell>
                <TableCell>{formatCurrency(3000000)}</TableCell>
                <TableCell>{formatCurrency(6000000)}</TableCell>
                <TableCell>{formatCurrency(15000000)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Accelerated</TableCell>
                <TableCell>{formatCurrency(2000000)}</TableCell>
                <TableCell>{formatCurrency(6000000)}</TableCell>
                <TableCell>{formatCurrency(12000000)}</TableCell>
                <TableCell>{formatCurrency(30000000)}+</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground">Conservative Scenario</h3>
            <p className="text-sm text-muted-foreground">
              Single-digit licensees, limited product launches, minimal marketing support. Assumes cautious market entry
              and phased partnership development. Suitable for downside risk modeling.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground">Base Case Scenario</h3>
            <p className="text-sm text-muted-foreground">
              5-10 licensing partners across supplements, pharma-adjacent products, and wellness services. Moderate product
              launches with regional distribution. Reflects expected case with disciplined execution.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground">Accelerated Scenario</h3>
            <p className="text-sm text-muted-foreground">
              15+ licensing partners, major retail distribution, international expansion, and THE UNIVERSAL STANDARD®
              certification adoption. Assumes strong market demand and nanotechnology market tailwinds.
            </p>
          </Card>
        </div>
      </div>

      {/* Digital Asset Revenue */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Digital Asset Revenue Potential</h2>
        
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">.nano TLD Subdomain Licensing</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Upon acquisition of the .nano Top-Level Domain, subdomain licensing creates recurring revenue stream
              independent of product development. Potential licensees include:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Health & wellness brands seeking .nano branded domains</li>
              <li>Nanotechnology research institutions and labs</li>
              <li>Pharmaceutical and biotech companies</li>
              <li>Materials science and manufacturing companies</li>
              <li>Consumer product brands launching nano-enhanced lines</li>
            </ul>
          </div>
          
          <div className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subdomain Tier</TableHead>
                  <TableHead>Annual Fee Range</TableHead>
                  <TableHead>Target Volume</TableHead>
                  <TableHead>Revenue Potential</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Premium</TableCell>
                  <TableCell>{formatCurrency(50000)} - {formatCurrency(250000)}</TableCell>
                  <TableCell>5-10</TableCell>
                  <TableCell>{formatCurrency(250000)} - {formatCurrency(2500000)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Standard</TableCell>
                  <TableCell>{formatCurrency(10000)} - {formatCurrency(50000)}</TableCell>
                  <TableCell>20-50</TableCell>
                  <TableCell>{formatCurrency(200000)} - {formatCurrency(2500000)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Basic</TableCell>
                  <TableCell>{formatCurrency(2500)} - {formatCurrency(10000)}</TableCell>
                  <TableCell>50-100</TableCell>
                  <TableCell>{formatCurrency(125000)} - {formatCurrency(1000000)}</TableCell>
                </TableRow>
                <TableRow className="font-bold bg-accent/5">
                  <TableCell>Total Potential</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>75-160 subdomains</TableCell>
                  <TableCell>{formatCurrency(575000)} - {formatCurrency(6000000)}+ annually</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Domain Portfolio Monetization</h3>
          </div>
          <p className="text-muted-foreground">
            Strategic domain portfolio (~400 NANO-related domains) can generate revenue through direct sales, leasing,
            or bundled licensing agreements with trademark partners. Conservative annual revenue projection: 
            <strong className="text-foreground"> {formatCurrency(100000)} - {formatCurrency(500000)}</strong> based
            on selective divestment and licensing activity.
          </p>
        </Card>
      </div>

      {/* Capital Deployment Timeline */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Capital Deployment Timeline</h2>
        
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Phased Allocation Strategy</h3>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-2 border-accent pl-4 space-y-2">
              <h4 className="font-semibold text-foreground">Phase 1 (Months 1-6): Foundation</h4>
              <p className="text-sm text-muted-foreground">
                Product development infrastructure, initial manufacturing partnerships, regulatory preparation,
                .nano TLD acquisition, and first licensing agreements. Estimated deployment: 30-35% of capital.
              </p>
            </div>
            
            <div className="border-l-2 border-accent pl-4 space-y-2">
              <h4 className="font-semibold text-foreground">Phase 2 (Months 7-18): Market Entry</h4>
              <p className="text-sm text-muted-foreground">
                Manufacturing scale-up, distribution partnerships, marketing campaigns, and expansion of licensing
                portfolio. Estimated deployment: 40-45% of capital.
              </p>
            </div>
            
            <div className="border-l-2 border-accent pl-4 space-y-2">
              <h4 className="font-semibold text-foreground">Phase 3 (Months 19-36): Expansion</h4>
              <p className="text-sm text-muted-foreground">
                Strategic acquisitions, international expansion, digital asset portfolio growth, and tokenization
                infrastructure (if pursued). Estimated deployment: 20-25% of capital.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Notice */}
      <Card className="p-6 border-accent/30 bg-accent/5">
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Methodology & Assumptions</h4>
          <p className="text-sm text-muted-foreground">
            All financial projections are based on comparable trademark licensing transactions, industry royalty rates (3-8%),
            market research on nanotechnology and health sectors, and conservative adoption curves. Actual results may vary
            based on execution, market conditions, regulatory environment, and partnership success. Detailed financial models,
            sensitivity analyses, and supporting documentation available upon request during due diligence.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default FinancialProjectionsVDR;
