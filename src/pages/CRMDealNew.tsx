import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { CRMDealForm } from "@/components/CRMDealForm";
import { Target } from "lucide-react";

const CRMDealNew = () => {
  return (
    <div className="min-h-screen bg-gradient-depth">
      <Navigation />

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Target className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Create New Deal</h1>
            <p className="text-muted-foreground">Track a new sales opportunity</p>
          </div>
        </div>

        <Card className="p-8 shadow-elevated border border-border">
          <CRMDealForm />
        </Card>
      </div>
    </div>
  );
};

export default CRMDealNew;
