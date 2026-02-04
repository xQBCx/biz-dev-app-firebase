import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, Stamp, Scale, Shield, Zap, Brain } from "lucide-react";

const IPLaunch = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Scale className="h-12 w-12" />
          <h1 className="text-4xl font-bold">IPLaunch™</h1>
        </div>
        <p className="text-xl max-w-2xl mx-auto">
          The Future of Intellectual Property Protection
        </p>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          AI-powered patent and trademark filing. File in minutes, protect your ideas with blockchain verification, and choose your payment model.
        </p>
      </div>

      {/* Main Action Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8" />
            <h2 className="text-2xl font-bold">File a Patent</h2>
          </div>
          <p className="text-muted-foreground">
            Provisional, Utility, Design, or Software patents. AI-assisted drafting with prior art detection.
          </p>
          <Button 
            onClick={() => navigate('/iplaunch/patent/start')}
            className="w-full"
          >
            Start Patent Filing
          </Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Stamp className="h-8 w-8" />
            <h2 className="text-2xl font-bold">File a Trademark</h2>
          </div>
          <p className="text-muted-foreground">
            Wordmark, Logo, or Combined marks. Live TM class lookup with risk assessment.
          </p>
          <Button 
            onClick={() => navigate('/iplaunch/trademark/start')}
            className="w-full"
          >
            Start Trademark Filing
          </Button>
        </Card>
      </div>

      {/* Payment Options */}
      <Card className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Choose Your Payment Model</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Pay Fee</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Standard pricing with Stripe checkout. You retain 100% ownership.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Equity Partnership</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              IPLaunch covers filing costs in exchange for equity stake or co-inventorship.
            </p>
          </div>
        </div>
      </Card>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card className="p-6 space-y-3">
          <Shield className="h-8 w-8" />
          <h3 className="text-lg font-semibold">Blockchain Anchoring</h3>
          <p className="text-sm text-muted-foreground">
            Timestamped hashes to IPFS with smart contract verification
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <Brain className="h-8 w-8" />
          <h3 className="text-lg font-semibold">AI Legal Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Generate claims, detect prior art, and format USPTO-ready documents
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <FileText className="h-8 w-8" />
          <h3 className="text-lg font-semibold">Portfolio Management</h3>
          <p className="text-sm text-muted-foreground">
            Track filings, renewals, and licensing opportunities in one place
          </p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => navigate('/iplaunch/dashboard')}>
          View Dashboard
        </Button>
        <Button variant="outline" onClick={() => navigate('/iplaunch/vault')}>
          Document Vault
        </Button>
      </div>
    </div>
  );
};

export default IPLaunch;
