import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Users, Shield, Mail, Building2, CheckCircle2, AlertTriangle } from "lucide-react";

interface InviteData {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  partner_name: string;
  partner_id: string;
  invite_expires_at: string | null;
}

export default function PartnerTeamInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) return;
    
    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      navigate(`/auth?redirect=/partner-team-invite/${token}`);
      return;
    }
    
    // If authenticated and have token, load invite data
    if (token) {
      loadInviteData();
    }
  }, [token, isAuthenticated, authLoading]);

  const loadInviteData = async () => {
    setIsLoading(true);
    try {
      // Fetch invite details
      const { data, error: fetchError } = await supabase
        .from("partner_team_members")
        .select(`
          id,
          email,
          full_name,
          role,
          invite_expires_at,
          partner_integration_id,
          partner_integrations!inner(
            partner_name
          )
        `)
        .eq("invite_token", token)
        .single();

      if (fetchError || !data) {
        setError("Invalid or expired invitation link");
        return;
      }

      // Check expiration
      if (data.invite_expires_at && new Date(data.invite_expires_at) < new Date()) {
        setError("This invitation has expired. Please request a new one.");
        return;
      }

      setInviteData({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        partner_id: data.partner_integration_id,
        partner_name: (data.partner_integrations as any).partner_name,
        invite_expires_at: data.invite_expires_at,
      });
    } catch (err) {
      console.error("Error loading invite:", err);
      setError("Failed to load invitation details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!user || !inviteData) return;

    setIsAccepting(true);
    try {
      // Update team member with user_id and joined_at
      const { error: updateError } = await supabase
        .from("partner_team_members")
        .update({
          user_id: user.id,
          joined_at: new Date().toISOString(),
          invite_token: null,
          invite_expires_at: null,
        })
        .eq("id", inviteData.id);

      if (updateError) throw updateError;

      toast.success("You've joined the team!");
      navigate("/dashboard"); // Redirect to dashboard after joining
    } catch (err: any) {
      console.error("Error accepting invite:", err);
      toast.error("Failed to accept invitation");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inviteData) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a partner team
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invite Details */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="font-semibold">{inviteData.partner_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Your Role</p>
                <Badge variant="secondary" className="capitalize">
                  {inviteData.role}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Invited Email</p>
                <p className="font-medium">{inviteData.email}</p>
              </div>
            </div>
          </div>

          {/* Auth State */}
          {!isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Please sign in or create an account to accept this invitation
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/auth?redirect=/partner-team-invite/${token}`)}
                >
                  Sign In
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/auth?mode=signup&redirect=/partner-team-invite/${token}&email=${encodeURIComponent(inviteData.email)}`)}
                >
                  Create Account
                </Button>
              </div>
            </div>
          ) : user?.email !== inviteData.email ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-600">
                You're signed in as <strong>{user?.email}</strong>, but this invitation was sent to{" "}
                <strong>{inviteData.email}</strong>.
              </p>
              <p className="text-sm text-amber-600 mt-2">
                Please sign in with the correct email to accept this invitation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-700">
                  You're signed in as {user.email}
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleAcceptInvite}
                disabled={isAccepting}
              >
                {isAccepting ? "Joining..." : "Accept & Join Team"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
