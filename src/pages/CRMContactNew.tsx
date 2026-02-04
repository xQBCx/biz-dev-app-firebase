import { Card } from "@/components/ui/card";
import { CRMContactForm } from "@/components/CRMContactForm";
import { UserPlus } from "lucide-react";

const CRMContactNew = () => {
  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <UserPlus className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Add New Contact</h1>
            <p className="text-muted-foreground">Create a new contact in your CRM</p>
          </div>
        </div>

        <Card className="p-8 shadow-elevated border border-border">
          <CRMContactForm />
        </Card>
      </div>
    </div>
  );
};

export default CRMContactNew;
