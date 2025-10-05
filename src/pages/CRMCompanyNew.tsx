import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { CRMCompanyForm } from "@/components/CRMCompanyForm";
import { Building2 } from "lucide-react";

const CRMCompanyNew = () => {
  return (
    <div className="min-h-screen bg-gradient-depth">
      <Navigation />

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Add New Company</h1>
            <p className="text-muted-foreground">Create a new company in your CRM</p>
          </div>
        </div>

        <Card className="p-8 shadow-elevated border border-border">
          <CRMCompanyForm />
        </Card>
      </div>
    </div>
  );
};

export default CRMCompanyNew;
