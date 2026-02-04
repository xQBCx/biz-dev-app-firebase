import { CreditsDashboard } from "@/components/credits/CreditsDashboard";

export default function Credits() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Credits & Contributions</h1>
        <p className="text-muted-foreground">
          Track your contribution events, credit balances, and XODIAK anchoring status
        </p>
      </div>
      
      <CreditsDashboard />
    </div>
  );
}
