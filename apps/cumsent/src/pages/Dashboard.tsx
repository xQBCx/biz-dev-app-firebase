import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle, Users, Shield, Plus, History } from "lucide-react";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useConsentSessions } from "@/hooks/useConsentSessions";
import { supabase } from "@/integrations/supabase/client";
import CreateSessionDialog from "@/components/CreateSessionDialog";
import SessionList from "@/components/SessionList";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface SessionStats {
  verified: number;
  pending: number;
  partners: number;
}

const Dashboard = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<SessionStats>({ verified: 0, pending: 0, partners: 0 });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { sessions, isLoading: sessionsLoading, updateSessionStatus, generateShareUrl } = useConsentSessions();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Calculate stats from sessions
    const verified = sessions.filter(s => s.status === "verified").length;
    const pending = sessions.filter(s => s.status === "pending").length;
    const uniquePartners = new Set(
      sessions
        .filter(s => s.partner_id && s.initiator_id === user?.id)
        .map(s => s.partner_id)
    );
    
    setStats({
      verified,
      pending,
      partners: uniquePartners.size,
    });
  }, [sessions, user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }
    
    setProfile(data);
  };

  const handleStartVerification = () => {
    setIsVerifying(true);
    
    // Simulate facial verification process
    setTimeout(() => {
      setIsVerifying(false);
      toast({
        title: "Verification Complete",
        description: "Your identity has been verified successfully.",
      });
    }, 3000);
  };

  const handleRevokeSession = async (sessionId: string) => {
    const { error } = await updateSessionStatus(sessionId, "revoked");
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Session revoked",
      description: "The consent session has been revoked.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border py-3 sm:py-4 px-3 sm:px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-1 sm:gap-4">
            {profile?.full_name && (
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                {profile.full_name}
              </span>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/history")}
              className="hover:bg-secondary px-2 sm:px-4"
            >
              <History className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">History</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
              className="hover:bg-secondary px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden text-xs">Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2 sm:mb-4">
              Consent Verification Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-lg px-2">
              Start a new verification session or view your history
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-12">
            <Card className="shadow-md border-border">
              <CardContent className="pt-4 sm:pt-6 text-center px-2 sm:px-4">
                <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-success mx-auto mb-2 sm:mb-4" />
                <div className="text-xl sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">{stats.verified}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Verified</div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-border">
              <CardContent className="pt-4 sm:pt-6 text-center px-2 sm:px-4">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-primary mx-auto mb-2 sm:mb-4" />
                <div className="text-xl sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">{stats.partners}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Partners</div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-border">
              <CardContent className="pt-4 sm:pt-6 text-center px-2 sm:px-4">
                <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-accent mx-auto mb-2 sm:mb-4" />
                <div className="text-xl sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">100%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Security</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl border-2 border-primary/20">
            <CardHeader className="text-center px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">Start Consent Verification</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Both parties must complete facial verification to confirm consent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="bg-muted/50 rounded-xl p-4 sm:p-8 text-center">
                <Camera className="w-12 h-12 sm:w-20 sm:h-20 text-primary mx-auto mb-3 sm:mb-4 animate-pulse-soft" />
                {isVerifying ? (
                  <div className="space-y-3">
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                    <p className="text-muted-foreground">Verifying your identity...</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-foreground">
                      Ready to Verify
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                      Create a session and share the link with your partner
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-base sm:text-lg py-5 sm:py-6"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Create New Session
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  A shareable link will be generated for your partner
                </p>
              </div>

              <div className="bg-primary/5 rounded-lg p-3 sm:p-4 border border-primary/20">
                <h4 className="font-semibold text-xs sm:text-sm mb-2 text-foreground">
                  Important Reminders:
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Both parties must verify their identity</li>
                  <li>• Ensure good lighting for facial recognition</li>
                  <li>• Records are timestamped and encrypted</li>
                  <li>• You can revoke access at any time</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <SessionList
            sessions={sessions}
            isLoading={sessionsLoading}
            onRevokeSession={handleRevokeSession}
            generateShareUrl={generateShareUrl}
          />
        </div>
      </main>

      <CreateSessionDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export default Dashboard;
