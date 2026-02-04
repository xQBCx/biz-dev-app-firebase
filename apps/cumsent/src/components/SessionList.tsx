import { SessionWithProfiles } from "@/hooks/useConsentSessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, CheckCircle, XCircle, Users, Copy, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface SessionListProps {
  sessions: SessionWithProfiles[];
  isLoading: boolean;
  onRevokeSession?: (sessionId: string) => void;
  generateShareUrl: (token: string) => string;
}

const SessionList = ({ sessions, isLoading, onRevokeSession, generateShareUrl }: SessionListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-warning border-warning">Pending</Badge>;
      case "verified":
        return <Badge variant="outline" className="text-success border-success">Verified</Badge>;
      case "revoked":
        return <Badge variant="outline" className="text-destructive border-destructive">Revoked</Badge>;
      case "expired":
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />;
      case "verified":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "revoked":
      case "expired":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handleCopyLink = async (shareToken: string) => {
    const url = generateShareUrl(shareToken);
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share this link with your partner.",
    });
  };

  const isInitiator = (session: SessionWithProfiles) => {
    return session.initiator_id === user?.id;
  };

  const getOtherPartyName = (session: SessionWithProfiles) => {
    if (isInitiator(session)) {
      return session.partner?.full_name || (session.partner_id ? "Partner" : "Waiting for partner...");
    }
    return session.initiator?.full_name || "Anonymous";
  };

  if (isLoading) {
    return (
      <Card className="shadow-md border-border">
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Your verification history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground animate-pulse">
            Loading sessions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="shadow-md border-border">
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Your verification history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No sessions yet</p>
            <p className="text-sm mt-2">Create your first verification session above</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md border-border">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">Recent Sessions</CardTitle>
        <CardDescription className="text-sm">Your verification history</CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors gap-3"
            >
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="mt-0.5 sm:mt-0">
                  {getStatusIcon(session.status)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <span className="font-medium truncate">
                      {isInitiator(session) ? "You" : getOtherPartyName(session)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium truncate">
                      {isInitiator(session) ? getOtherPartyName(session) : "You"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {new Date(session.initiated_at).toLocaleDateString()} at{" "}
                    {new Date(session.initiated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end sm:justify-start">
                {getStatusBadge(session.status)}
                
                {session.status === "pending" && session.partner_id && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/verify/${session.id}`)}
                    className="bg-primary hover:bg-primary/90 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Verify
                  </Button>
                )}
                
                {session.status === "pending" && isInitiator(session) && !session.partner_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyLink(session.share_token)}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden xs:inline">Copy</span> Link
                  </Button>
                )}
                
                {session.status === "pending" && isInitiator(session) && onRevokeSession && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRevokeSession(session.id)}
                    className="text-destructive hover:text-destructive text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionList;
