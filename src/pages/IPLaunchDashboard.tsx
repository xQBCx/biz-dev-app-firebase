import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { FileText, Stamp, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";

const IPLaunchDashboard = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with actual data from backend
  const filings = [
    {
      id: 1,
      type: "patent",
      title: "AI-Powered Task Management System",
      status: "pending",
      dateSubmitted: "2024-01-15",
      paymentModel: "equity",
    },
    {
      id: 2,
      type: "trademark",
      title: "BIZDEV APP",
      status: "approved",
      dateSubmitted: "2023-12-10",
      paymentModel: "paid",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: "warning", icon: Clock },
      approved: { color: "success", icon: CheckCircle },
      rejected: { color: "destructive", icon: AlertCircle },
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return (
      <Badge className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">IP Portfolio Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/iplaunch/patent/start')}>
            <FileText className="h-4 w-4 mr-2" />
            New Patent
          </Button>
          <Button onClick={() => navigate('/iplaunch/trademark/start')}>
            <Stamp className="h-4 w-4 mr-2" />
            New Trademark
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">2</div>
          <div className="text-sm text-muted-foreground">Total Filings</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">1</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">1</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">Renewals Due</div>
        </Card>
      </div>

      {/* Filings List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Filings</h2>
        <div className="space-y-4">
          {filings.map((filing) => (
            <div
              key={filing.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                {filing.type === "patent" ? (
                  <FileText className="h-8 w-8" />
                ) : (
                  <Stamp className="h-8 w-8" />
                )}
                <div>
                  <h3 className="font-semibold">{filing.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Filed: {filing.dateSubmitted} • {filing.paymentModel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(filing.status)}
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Document Vault</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Access all your IP documents securely
          </p>
          <Button variant="outline" onClick={() => navigate('/iplaunch/vault')}>
            Open Vault
          </Button>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Renewal Reminders</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No upcoming renewals
          </p>
          <Button variant="outline" disabled>
            View Schedule
          </Button>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Licensing Offers</h3>
          <p className="text-sm text-muted-foreground mb-4">
            0 new licensing opportunities
          </p>
          <Button variant="outline" disabled>
            View Offers
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default IPLaunchDashboard;
