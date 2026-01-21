import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Loader2, CheckCircle } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import type { PlatformModule } from "@/hooks/usePermissions";

interface InvitationData {
  id: string;
  invitee_email: string;
  invitee_name: string | null;
  assigned_role: string;
  message: string | null;
  expires_at: string;
  status: string;
  default_permissions: Json | null;
  redirect_to: string | null;
  linked_proposal_id: string | null;
  linked_deal_room_id: string | null;
  from_contact_id: string | null;
  introduction_note: string | null;
}

const AcceptInvite = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    if (!token) {
      setError("Invalid invitation link");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("invitation_token", token)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Invitation not found");
        setIsLoading(false);
        return;
      }

      if (data.status === "accepted") {
        setError("This invitation has already been accepted");
        setIsLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError("This invitation has expired");
        setIsLoading(false);
        return;
      }

      setInvitation(data);
    } catch (error: any) {
      console.error("Error validating invitation:", error);
      setError("Failed to validate invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    if (!invitation) return;

    setIsSubmitting(true);

    try {
      console.log("[AcceptInvite] Starting account creation for:", invitation.invitee_email);
      
      // Create the user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.invitee_email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: invitation.invitee_name || invitation.invitee_email,
            email: invitation.invitee_email,
          },
        },
      });

      if (signUpError) {
        console.error("[AcceptInvite] Signup error details:", {
          message: signUpError.message,
          status: signUpError.status,
          name: signUpError.name,
        });
        
        // Provide helpful messages for common issues
        if (signUpError.message?.includes("already registered") || signUpError.message?.includes("already been registered")) {
          throw new Error("An account with this email already exists. Please sign in instead using the link below.");
        }
        if (signUpError.message?.includes("network") || signUpError.status === 0 || signUpError.message?.includes("fetch")) {
          throw new Error("Network error - your firewall or security software may be blocking this request. Please try disabling VPN, or try from a personal device/network.");
        }
        if (signUpError.message?.includes("timeout")) {
          throw new Error("The request timed out. Please check your internet connection and try again.");
        }
        if (signUpError.message?.includes("rate limit") || signUpError.status === 429) {
          throw new Error("Too many attempts. Please wait a few minutes and try again.");
        }
        throw signUpError;
      }

      console.log("[AcceptInvite] Signup successful, user ID:", authData.user?.id);

      if (!authData.user) {
        throw new Error("Failed to create user account - no user data returned");
      }

      // Small delay to ensure the handle_new_user trigger has completed
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log("[AcceptInvite] Proceeding with profile updates after trigger delay");

      // Update profile with name from invitation (trigger creates it with email)
      try {
        console.log("[AcceptInvite] Updating profile for user:", authData.user.id);
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: invitation.invitee_name || invitation.invitee_email,
          })
          .eq("id", authData.user.id);

        if (profileError) {
          console.error("[AcceptInvite] Profile update error (non-critical):", profileError);
          // Continue anyway - profile was created by trigger
        } else {
          console.log("[AcceptInvite] Profile updated successfully");
        }
      } catch (profileErr) {
        console.error("[AcceptInvite] Profile update exception (non-critical):", profileErr);
        // Continue anyway
      }

      // Update the role to match invitation (trigger assigns 'client_user' by default)
      if (invitation.assigned_role !== 'client_user') {
        try {
          console.log("[AcceptInvite] Updating role to:", invitation.assigned_role);
          const { error: roleError } = await supabase
            .from("user_roles")
            .update({ role: invitation.assigned_role as any })
            .eq("user_id", authData.user.id);

          if (roleError) {
            console.error("[AcceptInvite] Role update error (non-critical):", roleError);
            // Continue anyway - user can still access with default role
          } else {
            console.log("[AcceptInvite] Role updated successfully");
          }
        } catch (roleErr) {
          console.error("[AcceptInvite] Role update exception (non-critical):", roleErr);
        }
      }

      // Mark invitation as accepted and set accepted_by_user_id
      try {
        console.log("[AcceptInvite] Marking invitation as accepted");
        const { error: updateError } = await supabase
          .from("team_invitations")
          .update({
            status: "accepted",
            accepted_at: new Date().toISOString(),
            accepted_by_user_id: authData.user.id,
          })
          .eq("id", invitation.id);

        if (updateError) {
          console.error("[AcceptInvite] Invitation update error (non-critical):", updateError);
        } else {
          console.log("[AcceptInvite] Invitation marked as accepted");
        }
      } catch (inviteErr) {
        console.error("[AcceptInvite] Invitation update exception (non-critical):", inviteErr);
      }

      // Automatically accept terms of service as part of invitation acceptance
      try {
        console.log("[AcceptInvite] Recording terms acceptance");
        const { error: termsError } = await supabase
          .from("user_terms_acceptance")
          .insert({
            user_id: authData.user.id,
            terms_version: "1.0",
            ip_address: null,
            user_agent: navigator.userAgent,
          });

        if (termsError) {
          console.error("[AcceptInvite] Terms acceptance error (non-critical):", termsError);
          // Continue anyway - terms dialog will show if needed
        } else {
          console.log("[AcceptInvite] Terms accepted successfully");
        }
      } catch (termsErr) {
        console.error("[AcceptInvite] Terms acceptance exception (non-critical):", termsErr);
      }

      // Create XODIAK relationship anchor for this introduction
      if (invitation.from_contact_id || invitation.linked_proposal_id || invitation.linked_deal_room_id) {
        try {
          console.log("[AcceptInvite] Creating XODIAK relationship anchor");
          await supabase.from("xodiak_relationship_anchors").insert({
            user_id: authData.user.id,
            anchor_type: "introduction",
            facilitator_contact_id: invitation.from_contact_id,
            linked_proposal_id: invitation.linked_proposal_id,
            linked_deal_room_id: invitation.linked_deal_room_id,
            linked_invitation_id: invitation.id,
            description: invitation.introduction_note || `User ${invitation.invitee_name || invitation.invitee_email} joined via invitation`,
            metadata: {
              invitation_accepted_at: new Date().toISOString(),
              invitee_email: invitation.invitee_email,
            },
          });
          console.log("[AcceptInvite] XODIAK anchor created");
        } catch (anchorError) {
          console.error("[AcceptInvite] XODIAK anchor error (non-critical):", anchorError);
          // Continue anyway - non-critical
        }
      }

      // If linked to a deal room, add user as participant
      if (invitation.linked_deal_room_id) {
        try {
          console.log("[AcceptInvite] Adding user to deal room:", invitation.linked_deal_room_id);
          await supabase.from("deal_room_participants").insert({
            deal_room_id: invitation.linked_deal_room_id,
            user_id: authData.user.id,
            role: "participant",
            name: invitation.invitee_name || invitation.invitee_email,
            email: invitation.invitee_email,
          });
          console.log("[AcceptInvite] User added to deal room");
        } catch (dealRoomError) {
          console.error("[AcceptInvite] Deal room participant error (non-critical):", dealRoomError);
          // Continue anyway
        }
      }

      console.log("[AcceptInvite] Account setup complete, redirecting...");

      toast({
        title: "Welcome aboard!",
        description: "Your account has been created successfully.",
      });

      // Determine redirect destination
      let redirectPath = "/dashboard";
      if (invitation.redirect_to) {
        redirectPath = invitation.redirect_to;
      } else if (invitation.linked_proposal_id) {
        redirectPath = `/proposals/${invitation.linked_proposal_id}`;
      } else if (invitation.linked_deal_room_id) {
        redirectPath = `/deal-rooms/${invitation.linked_deal_room_id}`;
      }

      setTimeout(() => navigate(redirectPath), 1500);
    } catch (error: any) {
      console.error("[AcceptInvite] Error accepting invitation:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Check for network-level errors that might indicate firewall blocking
      const isNetworkError = error.message?.includes("network") || 
                            error.message?.includes("fetch") || 
                            error.message?.includes("Failed to fetch") ||
                            error.name === "TypeError";
      
      toast({
        variant: "destructive",
        title: isNetworkError ? "Network Error" : "Error",
        description: isNetworkError 
          ? "Unable to connect. Your corporate firewall may be blocking this request. Try from a personal device or network."
          : (error.message || "Failed to accept invitation. Please try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/50 shadow-elevated">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Biz Dev App
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h2 className="text-2xl font-semibold">You're Invited!</h2>
          </div>
          <p className="text-muted-foreground">
            Create your account to join the platform
          </p>
        </div>

        <Card className="border-border/50 shadow-elevated">
          <CardHeader>
            <CardTitle>Welcome, {invitation?.invitee_name || "there"}!</CardTitle>
            <CardDescription>
              You've been invited to join as a <strong>{invitation?.assigned_role.replace('_', ' ')}</strong>
              {invitation?.message && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md">
                  <p className="text-sm italic">"{invitation.message}"</p>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAcceptInvitation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={invitation?.invitee_email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Accept Invitation & Create Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0"
            onClick={() => navigate("/auth")}
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
};

export default AcceptInvite;
