import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useConsentSessions, SessionWithProfiles } from "@/hooks/useConsentSessions";
import { useVerification } from "@/hooks/useVerification";
import { supabase } from "@/integrations/supabase/client";
import CameraCapture from "@/components/CameraCapture";
import Logo from "@/components/Logo";
import { Shield, CheckCircle, XCircle, Camera, Users, ArrowLeft } from "lucide-react";

const VerifySession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { sessions, updateSessionStatus, fetchSessions } = useConsentSessions();
  const { isUploading, uploadVerificationPhoto, checkVerificationStatus, getUserVerificationForSession } = useVerification();
  
  const [session, setSession] = useState<SessionWithProfiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    initiatorVerified: false,
    partnerVerified: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/auth?redirect=/verify/${sessionId}`);
    }
  }, [user, authLoading, navigate, sessionId]);

  useEffect(() => {
    if (sessions.length > 0 && sessionId) {
      const found = sessions.find(s => s.id === sessionId);
      if (found) {
        setSession(found);
      }
      setIsLoading(false);
    }
  }, [sessions, sessionId]);

  // Subscribe to realtime updates for verification records
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`verification-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'verification_records',
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          console.log('New verification record detected');
          await checkAllVerifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  useEffect(() => {
    if (sessionId && user) {
      checkUserVerification();
      checkAllVerifications();
    }
  }, [sessionId, user]);

  const checkUserVerification = async () => {
    if (!sessionId) return;
    const record = await getUserVerificationForSession(sessionId);
    setHasVerified(!!record);
  };

  const checkAllVerifications = async () => {
    if (!sessionId) return;
    const status = await checkVerificationStatus(sessionId);
    setVerificationStatus(status);

    // If both verified, update session status
    if (status.initiatorVerified && status.partnerVerified && session?.status === "pending") {
      await updateSessionStatus(sessionId, "verified");
      await fetchSessions();
    }
  };

  const handleCapture = async (blob: Blob) => {
    if (!sessionId) return;

    const result = await uploadVerificationPhoto(sessionId, blob);

    if (result.success) {
      toast({
        title: "Verification complete",
        description: "Your identity has been verified successfully.",
      });
      setShowCamera(false);
      setHasVerified(true);
      await checkAllVerifications();
    } else {
      toast({
        title: "Verification failed",
        description: result.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const isInitiator = session?.initiator_id === user?.id;
  const isPartner = session?.partner_id === user?.id;
  const canVerify = (isInitiator || isPartner) && !hasVerified && session?.status === "pending";

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12 bg-background">
        <Card className="w-full max-w-md shadow-xl mx-2 sm:mx-0">
          <CardHeader className="text-center px-4 sm:px-6">
            <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mx-auto mb-3 sm:mb-4" />
            <CardTitle className="text-lg sm:text-xl">Session Not Found</CardTitle>
            <CardDescription className="text-sm">This session does not exist or you don't have access.</CardDescription>
          </CardHeader>
          <CardContent className="text-center px-4 sm:px-6">
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status === "verified") {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12 bg-background">
        <Card className="w-full max-w-md shadow-xl border-success/20 mx-2 sm:mx-0">
          <CardHeader className="text-center px-4 sm:px-6">
            <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-success mx-auto mb-3 sm:mb-4" />
            <CardTitle className="text-xl sm:text-2xl">Consent Verified</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Both parties have completed verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="bg-success/10 rounded-lg p-3 sm:p-4 border border-success/20">
              <p className="text-xs sm:text-sm text-center text-success">
                Verified at {session.verified_at ? new Date(session.verified_at).toLocaleString() : "Unknown"}
              </p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border py-3 sm:py-4 px-3 sm:px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-sm">Back</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center">
            <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Facial Verification
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Complete identity verification for this consent session
            </p>
          </div>

          {/* Verification Status */}
          <Card className="shadow-lg">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${verificationStatus.initiatorVerified ? "bg-success" : "bg-muted-foreground"}`} />
                  <span className="text-xs sm:text-sm truncate">
                    {session.initiator?.full_name || "Initiator"} 
                    {isInitiator && " (You)"}
                  </span>
                </div>
                {verificationStatus.initiatorVerified ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                ) : (
                  <span className="text-xs text-muted-foreground">Pending</span>
                )}
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${verificationStatus.partnerVerified ? "bg-success" : "bg-muted-foreground"}`} />
                  <span className="text-xs sm:text-sm truncate">
                    {session.partner?.full_name || "Partner"} 
                    {isPartner && " (You)"}
                  </span>
                </div>
                {session.partner_id ? (
                  verificationStatus.partnerVerified ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">Not joined</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Camera Capture */}
          {showCamera ? (
            <Card className="shadow-xl">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">Capture Verification Photo</CardTitle>
                <CardDescription className="text-sm">
                  Position your face in the frame and capture a clear photo
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <CameraCapture
                  onCapture={handleCapture}
                  onCancel={() => setShowCamera(false)}
                  isUploading={isUploading}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-2 border-primary/20">
              <CardContent className="py-6 sm:py-8 px-4 sm:px-6">
                {hasVerified ? (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-success mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">You're Verified</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {verificationStatus.initiatorVerified && verificationStatus.partnerVerified
                        ? "Both parties have completed verification!"
                        : "Waiting for the other party to complete verification..."}
                    </p>
                  </div>
                ) : canVerify ? (
                  <div className="text-center">
                    <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Ready to Verify</h3>
                    <p className="text-sm text-muted-foreground mb-4 sm:mb-6 px-2">
                      Capture a photo to verify your identity for this session
                    </p>
                    <Button
                      onClick={() => setShowCamera(true)}
                      size="lg"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Start Verification
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2">Cannot Verify</h3>
                    <p className="text-sm text-muted-foreground px-2">
                      {!session.partner_id 
                        ? "Waiting for a partner to join this session"
                        : "You're not a participant in this session"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Box */}
          <div className="bg-primary/5 rounded-lg p-3 sm:p-4 border border-primary/20">
            <h4 className="font-semibold text-xs sm:text-sm mb-2">Security Information</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Your photo is encrypted and stored securely</li>
              <li>• Only session participants can view verification records</li>
              <li>• Records include timestamp and device information</li>
              <li>• You can request deletion of your data at any time</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifySession;
