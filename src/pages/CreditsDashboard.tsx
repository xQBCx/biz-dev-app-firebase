import { CreditSystemDashboard } from '@/components/credits/CreditSystemDashboard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreditsDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Credit System</h1>
            <p className="text-muted-foreground">Track your participation credits and payouts</p>
          </div>
        </div>
        
        <CreditSystemDashboard />
      </div>
    </div>
  );
}
