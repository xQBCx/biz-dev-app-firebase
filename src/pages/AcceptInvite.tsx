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

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Update profile with name from invitation (trigger creates it with email)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: invitation.invitee_name || invitation.invitee_email,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        // Continue anyway
      }

      // Update the role to match invitation (trigger assigns 'client_user' by default)
      if (invitation.assigned_role !== 'client_user') {
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: invitation.assigned_role as any })
          .eq("user_id", authData.user.id);

        if (roleError) {
          console.error("Role update error:", roleError);
          // Continue anyway - user can still access with default role
        }
      }

      // Apply default permissions if they exist
      const defaultPerms = invitation.default_permissions as Record<string, any> | null;
      if (defaultPerms && typeof defaultPerms === 'object' && Object.keys(defaultPerms).length > 0) {
        const permissionsToInsert = Object.entries(defaultPerms).map(([module, perms]: [string, any]) => ({
          user_id: authData.user.id,
          module: module as PlatformModule,
          can_view: perms.can_view || false,
          can_create: perms.can_create || false,
          can_edit: perms.can_edit || false,
          can_delete: perms.can_delete || false,
        }));

        const { error: permError } = await supabase
          .from("user_permissions")
          .insert(permissionsToInsert);

        if (permError) {
          console.error("Permissions insert error:", permError);
          // Continue anyway - admin can adjust permissions later
        }
      }

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from("team_invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      if (updateError) {
        console.error("Invitation update error:", updateError);
      }

      // Automatically accept terms of service as part of invitation acceptance
      const { error: termsError } = await supabase
        .from("user_terms_acceptance")
        .insert({
          user_id: authData.user.id,
          terms_version: "1.0",
          ip_address: null,
          user_agent: navigator.userAgent,
        });

      if (termsError) {
        console.error("Terms acceptance error:", termsError);
        // Continue anyway - terms dialog will show if needed
      }

      toast({
        title: "Welcome aboard!",
        description: "Your account has been created successfully.",
      });

      // Redirect to dashboard
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to accept invitation",
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
