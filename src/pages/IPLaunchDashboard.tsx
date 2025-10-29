import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { FileText, Stamp, Shield, Clock, CheckCircle2, DollarSign, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Application = {
  id: string;
  application_type: string;
  sub_type: string;
  status: string;
  payment_model: string;
  invention_title?: string;
  mark_text?: string;
  created_at: string;
  uspto_filing_date?: string;
  applicant_name: string;
};

const IPLaunchDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    
    // Check for payment success
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("ip_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("iplaunch-verify-payment", {
        body: { sessionId },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Payment Successful",
          description: "Your application has been submitted for review",
        });
        fetchApplications();
      }
    } catch (error: any) {
      console.error("Verification error:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "destructive";
      case "pending_review":
        return "secondary";
      case "filed":
        return "default";
      case "approved":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending_review" || a.status === "pending_payment").length,
    filed: applications.filter(a => a.status === "filed").length,
    approved: applications.filter(a => a.status === "approved").length,
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/iplaunch')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to IPLaunch
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">IP Portfolio Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/iplaunch/patent/start')}
            className="active:scale-95 transition-transform"
          >
            <FileText className="h-4 w-4 mr-2" />
            New Patent
          </Button>
          <Button 
            onClick={() => navigate('/iplaunch/trademark/start')}
            className="active:scale-95 transition-transform"
          >
            <Stamp className="h-4 w-4 mr-2" />
            New Trademark
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Applications</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.filed}</div>
          <div className="text-sm text-muted-foreground">Filed</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{stats.approved}</div>
          <div className="text-sm text-muted-foreground">Approved</div>
        </Card>
      </div>

      {/* Applications */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {applications.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground mb-4">No applications yet</p>
              <Button onClick={() => navigate("/iplaunch")}>Start New Application</Button>
            </div>
          ) : (
            applications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {app.application_type === "patent" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <Stamp className="h-5 w-5" />
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {app.invention_title || app.mark_text || "Untitled"}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {app.application_type} - {app.sub_type}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(app.status)}>
                    {getStatusLabel(app.status)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applicant</span>
                    <span>{app.applicant_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Model</span>
                    <span className="flex items-center gap-1 capitalize">
                      {app.payment_model === "pay" ? (
                        <>
                          <DollarSign className="h-4 w-4" />
                          Standard Fee
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Equity Share
                        </>
                      )}
                    </span>
                  </div>
                  {app.uspto_filing_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">USPTO Filed</span>
                      <span className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        {new Date(app.uspto_filing_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full active:scale-95 transition-transform"
                    onClick={() => navigate(`/iplaunch/application/${app.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Document Vault</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Access all your IP documents securely
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/iplaunch/vault')}
            className="active:scale-95 transition-transform"
          >
            Open Vault
          </Button>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">AI Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get AI-powered patent & trademark insights
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/iplaunch')}
            className="active:scale-95 transition-transform"
          >
            Start Analysis
          </Button>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Renewals Due</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No upcoming renewals
          </p>
          <Button variant="outline" disabled>
            View Schedule
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default IPLaunchDashboard;
