import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnchorStatusPanel } from '@/components/xodiak/AnchorStatusPanel';

export default function XodiakAnchorDashboard() {
  return (
    <>
      <Helmet>
        <title>XODIAK Ledger Anchoring | Contribution Engine</title>
        <meta name="description" content="View and manage contribution event anchoring to the XODIAK blockchain" />
      </Helmet>

      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/contributions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">XODIAK Ledger Anchoring</h1>
              <p className="text-muted-foreground">
                Merkle tree hashing and blockchain anchoring for contribution events
              </p>
            </div>
          </div>
        </div>

        <AnchorStatusPanel />
      </div>
    </>
  );
}
