import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useConsentSessions, SessionWithProfiles } from "@/hooks/useConsentSessions";
import Logo from "@/components/Logo";
import { ArrowLeft, CheckCircle, XCircle, Clock, Shield, Calendar, User, Download, FileText, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SessionHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessions, isLoading } = useConsentSessions();
  const { toast } = useToast();

  const historySessions = useMemo(() => {
    return sessions.filter(
      (s) => s.status === "verified" || s.status === "expired" || s.status === "revoked"
    );
  }, [sessions]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case "revoked":
        return (
          <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="w-3 h-3 mr-1" />
            Revoked
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForExport = (dateString: string) => {
    return new Date(dateString).toISOString();
  };

  const getPartnerName = (session: SessionWithProfiles) => {
    const isInitiator = session.initiator_id === user?.id;
    if (isInitiator) {
      return session.partner?.full_name || "Unknown Partner";
    }
    return session.initiator?.full_name || "Unknown Initiator";
  };

  const getRole = (session: SessionWithProfiles) => {
    return session.initiator_id === user?.id ? "Initiator" : "Partner";
  };

  const getStatusDate = (session: SessionWithProfiles) => {
    if (session.status === "verified" && session.verified_at) {
      return session.verified_at;
    }
    if (session.status === "revoked" && session.revoked_at) {
      return session.revoked_at;
    }
    return session.expires_at;
  };

  const exportToCSV = () => {
    if (historySessions.length === 0) return;

    const headers = ["Partner/Initiator", "Role", "Status", "Created At", "Status Date"];
    const rows = historySessions.map((session) => [
      getPartnerName(session),
      getRole(session),
      session.status.charAt(0).toUpperCase() + session.status.slice(1),
      formatDateForExport(session.created_at),
      formatDateForExport(getStatusDate(session)),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `consent-session-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "Export complete",
      description: "Session history exported as CSV",
    });
  };

  const exportToPDF = () => {
    if (historySessions.length === 0) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text("Consent Session History", 14, 22);
    
    // Subtitle with date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);
    
    // Summary stats
    const verified = historySessions.filter((s) => s.status === "verified").length;
    const expired = historySessions.filter((s) => s.status === "expired").length;
    const revoked = historySessions.filter((s) => s.status === "revoked").length;
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Summary: ${verified} Verified, ${expired} Expired, ${revoked} Revoked`, 14, 38);

    // Table
    const tableData = historySessions.map((session) => [
      getPartnerName(session),
      getRole(session),
      session.status.charAt(0).toUpperCase() + session.status.slice(1),
      formatDate(session.created_at),
      formatDate(getStatusDate(session)),
    ]);

    autoTable(doc, {
      head: [["Partner/Initiator", "Role", "Status", "Created", "Status Date"]],
      body: tableData,
      startY: 45,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`consent-session-history-${new Date().toISOString().split("T")[0]}.pdf`);

    toast({
      title: "Export complete",
      description: "Session history exported as PDF",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Session History</h1>
            <p className="text-muted-foreground">
              View your past verified, expired, and revoked sessions
            </p>
          </div>

          {/* Export Buttons */}
          {historySessions.length > 0 && (
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={exportToCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-muted-foreground">Loading history...</div>
            </div>
          ) : historySessions.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="py-12 text-center">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No History Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Completed sessions will appear here once both parties verify
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  Create Your First Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {historySessions.map((session) => (
                <Card key={session.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-muted-foreground" />
                        {getPartnerName(session)}
                      </CardTitle>
                      {getStatusBadge(session.status)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created {formatDate(session.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <span className="text-muted-foreground block mb-1">Role</span>
                        <span className="font-medium">
                          {session.initiator_id === user?.id ? "Initiator" : "Partner"}
                        </span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <span className="text-muted-foreground block mb-1">
                          {session.status === "verified" ? "Verified At" : 
                           session.status === "revoked" ? "Revoked At" : "Expired At"}
                        </span>
                        <span className="font-medium">
                          {session.status === "verified" && session.verified_at
                            ? formatDate(session.verified_at)
                            : session.status === "revoked" && session.revoked_at
                            ? formatDate(session.revoked_at)
                            : formatDate(session.expires_at)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          {historySessions.length > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-success">
                      {historySessions.filter((s) => s.status === "verified").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Verified</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-muted-foreground">
                      {historySessions.filter((s) => s.status === "expired").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Expired</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">
                      {historySessions.filter((s) => s.status === "revoked").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Revoked</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SessionHistory;
