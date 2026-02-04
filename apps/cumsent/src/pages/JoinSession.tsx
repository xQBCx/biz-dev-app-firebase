import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useConsentSessions, SessionWithProfiles } from "@/hooks/useConsentSessions";
import Logo from "@/components/Logo";
import { Shield, Clock, CheckCircle, XCircle, Users } from "lucide-react";

const JoinSession = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { getSessionByToken, joinSession } = useConsentSessions();
  
  const [session, setSession] = useState<SessionWithProfiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid session link");
      setIsLoading(false);
      return;
    }
    
    fetchSession();
  }, [token]);

  const fetchSession = async () => {
    if (!token) return;
    
    const { data, error } = await getSessionByToken(token);
    
    if (error || !data) {
      setError("Session not found or has been deleted");
      setIsLoading(false);
      return;
    }
    
    if (data.status !== "pending") {
      setError("This session is no longer available for joining");
      setIsLoading(false);
      return;
    }
    
    if (new Date(data.expires_at) < new Date()) {
      setError("This session has expired");
      setIsLoading(false);
      return;
    }
    
    setSession(data);
    setIsLoading(false);
  };

  const handleJoinSession = async () => {
    if (!user) {
      // Redirect to auth with return URL
      navigate(`/auth?redirect=/join/${token}`);
      return;
    }
    
    if (!token) return;
    
    setIsJoining(true);
    
    const { data, error } = await joinSession(token);
    
    setIsJoining(false);
    
    if (error) {
      toast({
        title: "Could not join session",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Session joined!",
      description: "You've successfully joined the consent verification session.",
    });
    
    navigate("/dashboard");
  };

  const getStatusIcon = () => {
    if (!session) return null;
    
    switch (session.status) {
      case "pending":
        return <Clock className="w-16 h-16 text-warning mx-auto mb-4" />;
      case "verified":
        return <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />;
      case "revoked":
      case "expired":
        return <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />;
      default:
        return <Shield className="w-16 h-16 text-primary mx-auto mb-4" />;
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12 bg-background">
        <Card className="w-full max-w-md shadow-xl mx-2 sm:mx-0">
          <CardHeader className="text-center px-4 sm:px-6">
            <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mx-auto mb-3 sm:mb-4" />
            <CardTitle className="text-lg sm:text-xl">Session Unavailable</CardTitle>
            <CardDescription className="text-sm">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center px-4 sm:px-6">
            <Button onClick={() => navigate("/")} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12 bg-background">
      <div className="w-full max-w-md mx-2 sm:mx-0">
        <div className="text-center mb-6 sm:mb-8">
          <Logo size="md" className="justify-center mb-3 sm:mb-4" />
        </div>

        <Card className="shadow-xl border-border">
          <CardHeader className="text-center px-4 sm:px-6">
            {getStatusIcon()}
            <CardTitle className="text-lg sm:text-xl">Consent Verification Request</CardTitle>
            <CardDescription className="text-sm">
              You've been invited to verify mutual consent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium">Initiated by</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {session?.initiator?.full_name || "Anonymous User"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium">Expires</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {session?.expires_at 
                      ? new Date(session.expires_at).toLocaleString()
                      : "Unknown"
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-3 sm:p-4 border border-primary/20">
              <h4 className="font-semibold text-xs sm:text-sm mb-2">What happens next:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• You'll join this consent verification session</li>
                <li>• Both parties must complete facial verification</li>
                <li>• Records are timestamped and securely stored</li>
                <li>• Either party can revoke consent at any time</li>
              </ul>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Button 
                onClick={handleJoinSession}
                disabled={isJoining}
                className="w-full bg-primary hover:bg-primary/90 text-sm sm:text-base"
              >
                {isJoining ? "Joining..." : user ? "Join Session" : "Sign in to Join"}
              </Button>
              <Button 
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full text-sm sm:text-base"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinSession;
