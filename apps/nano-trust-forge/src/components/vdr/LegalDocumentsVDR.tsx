import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Scale, CheckCircle2 } from "lucide-react";

const LegalDocumentsVDR = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Badge variant="secondary" className="px-4 py-2">
          <Shield className="mr-2 h-4 w-4 text-accent" />
          Confidential — NDA Protected
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Legal Documents
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Comprehensive legal documentation for IP Trust structure, trademark registrations, licensing frameworks, and IP-backed lending agreements.
        </p>
      </div>

      {/* Document Categories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Document Library</h2>

        {/* Trademark Documentation */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Federal Trademark Registrations</h3>
          </div>
          <div className="space-y-3">
            <p className="text-muted-foreground">
              All five trademark IP assets are federally registered with the United States Patent and Trademark Office (USPTO)
              and are in good standing. Registration certificates, specimens, and class-specific documentation available for:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">NANO®</p>
                  <p className="text-sm text-muted-foreground">Classes: 005, 006, 018, 044, 046, 051, 052</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">NANO RX®</p>
                  <p className="text-sm text-muted-foreground">Classes: 005, 006, 018, 044, 046, 051, 052</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">THE UNIVERSAL STANDARD®</p>
                  <p className="text-sm text-muted-foreground">Classes: 005, 006, 018, 044, 046, 051, 052</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">NANODOSE®</p>
                  <p className="text-sm text-muted-foreground">Classes: 025, 022, 039</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">NANOBIDIOL®</p>
                  <p className="text-sm text-muted-foreground">Classes: 025, 022, 039</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Documents Available:</strong> USPTO registration certificates,
              trademark specimens, office action responses, declaration of use statements, and renewal documentation.
            </p>
          </div>
        </Card>

        {/* IP Trust Structure */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">IP Trust Structure Documentation</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Legal framework establishing IP Trust as separate entity holding trademark assets, defining governance,
              trustee responsibilities, beneficiary rights, and lender priority in capital structure.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Trust Agreement & Formation Documents</li>
              <li>IP Assignment Agreements (transferring trademarks to Trust)</li>
              <li>Trustee Appointment and Governance Documents</li>
              <li>Operating Agreement (defining Trust operations and oversight)</li>
              <li>Amendment and Modification Protocols</li>
            </ul>
          </div>
        </Card>

        {/* Licensing Framework */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Licensing Framework & Agreements</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Standard licensing templates and executed agreements defining usage rights, royalty structures, quality control,
              enforcement mechanisms, and termination provisions for trademark licensees.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Master Licensing Agreement Templates (exclusive and non-exclusive)</li>
              <li>Royalty Rate Schedules and Payment Terms</li>
              <li>Quality Control Standards and Monitoring Protocols</li>
              <li>Sublicensing Rights and Restrictions</li>
              <li>Trademark Usage Guidelines and Brand Standards</li>
              <li>Territory and Field-of-Use Restrictions</li>
              <li>Termination and Breach Provisions</li>
            </ul>
          </div>
        </Card>

        {/* IP-Backed Lending */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">IP-Backed Lending Documentation</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Legal agreements and security documentation establishing lender rights, collateral interests, valuation methodologies,
              and enforcement mechanisms for IP-backed financing structure.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Security Agreement (granting lender interest in IP collateral)</li>
              <li>UCC-1 Financing Statements (perfecting security interest)</li>
              <li>Loan Agreement and Credit Terms</li>
              <li>Collateral Valuation Reports (third-party appraisals)</li>
              <li>IP Insurance Policies and Coverage Documentation</li>
              <li>Intercreditor Agreements (if applicable)</li>
              <li>Covenant Compliance and Reporting Requirements</li>
            </ul>
          </div>
        </Card>

        {/* Partnership & Operational */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Partnership & Operational Agreements</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Agreements with manufacturing partners, distributors, advisors, and service providers supporting IP commercialization
              and operational execution.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Manufacturing and Supply Agreements</li>
              <li>Distribution and Channel Partner Agreements</li>
              <li>Advisory and Consulting Agreements</li>
              <li>Joint Development Agreements (R&D partnerships)</li>
              <li>Confidentiality and Non-Disclosure Agreements</li>
              <li>Service Provider Agreements (regulatory, legal, financial)</li>
            </ul>
          </div>
        </Card>

        {/* Corporate & Compliance */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Corporate & Compliance Documentation</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Corporate formation documents, governance records, and regulatory compliance documentation for all entities
              within the IP ecosystem.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Articles of Incorporation / Organization</li>
              <li>Bylaws / Operating Agreements</li>
              <li>Board Resolutions and Meeting Minutes</li>
              <li>Capitalization Tables and Ownership Records</li>
              <li>Good Standing Certificates</li>
              <li>Registered Agent and Jurisdictional Filings</li>
              <li>Tax Documentation (EINs, state registrations)</li>
            </ul>
          </div>
        </Card>

        {/* Digital Asset Legal */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Digital Asset Legal Documentation</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>
              Legal documentation for domain portfolio, .nano TLD acquisition strategy, and digital infrastructure supporting
              trademark portfolio and IP collateral value.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Domain Name Purchase Agreements and Transfer Documentation</li>
              <li>.nano TLD Acquisition Letters of Intent and Purchase Agreements</li>
              <li>ICANN Registrar Agreements and Compliance Documentation</li>
              <li>Domain Licensing and Leasing Agreements</li>
              <li>Digital Asset Ownership Records and Registrar Access</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Access Notice */}
      <Card className="p-6 border-accent/30 bg-accent/5">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-accent mt-1" />
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Document Access & Due Diligence</h4>
            <p className="text-sm text-muted-foreground">
              All legal documents listed above are available for review during the due diligence process for qualified lenders
              and institutional partners. Documents can be provided in secure digital format or through physical data room access.
              For document requests or legal inquiries, please contact the deal administrator through your designated relationship manager.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LegalDocumentsVDR;
