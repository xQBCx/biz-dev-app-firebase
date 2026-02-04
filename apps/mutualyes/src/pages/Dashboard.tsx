import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle, Users, Shield } from "lucide-react";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen">
      <header className="bg-card/20 backdrop-blur-md border-b border-border py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="hover:bg-secondary text-white font-semibold"
          >
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
              Consent Verification Dashboard
            </h1>
            <p className="text-white text-lg font-semibold drop-shadow-md">
              Start a new verification session or view your history
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="shadow-md border-border bg-card/30 backdrop-blur-md">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-white font-semibold">Verified Sessions</div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-border bg-card/30 backdrop-blur-md">
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-white font-semibold">Active Partners</div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-border bg-card/30 backdrop-blur-md">
              <CardContent className="pt-6 text-center">
                <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-white font-semibold">Security Score</div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-xl border-2 border-primary/20 bg-card/40 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white font-bold">Start Consent Verification</CardTitle>
              <CardDescription className="text-base text-white font-semibold">
                Both parties must complete facial verification to confirm consent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <Camera className="w-20 h-20 text-primary mx-auto mb-4 animate-pulse-soft" />
                {isVerifying ? (
                  <div className="space-y-3">
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                    <p className="text-white font-semibold">Verifying your identity...</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      Ready to Verify
                    </h3>
                    <p className="text-white font-semibold mb-6">
                      Position your face in the camera frame for verification
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleStartVerification}
                  disabled={isVerifying}
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                >
                  {isVerifying ? "Verifying..." : "Start Facial Verification"}
                </Button>
                <p className="text-xs text-center text-white font-semibold">
                  This will activate your camera for biometric verification
                </p>
              </div>

              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <h4 className="font-bold text-sm mb-2 text-white">
                  Important Reminders:
                </h4>
                <ul className="text-xs text-white font-semibold space-y-1">
                  <li>• Both parties must verify their identity</li>
                  <li>• Ensure good lighting for facial recognition</li>
                  <li>• Records are timestamped and encrypted</li>
                  <li>• You can revoke access at any time</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-border">
            <CardHeader>
              <CardTitle>Recent Verifications</CardTitle>
              <CardDescription>Your verification history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No verifications yet</p>
                <p className="text-sm mt-2">Start your first verification session above</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
