import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Handshake, Lock, User, Building, ArrowRight, CheckCircle, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Invitation {
  id: string;
  deal_room_id: string;
  email: string;
  name: string | null;
  company: string | null;
  role_in_deal: string | null;
  access_level: string;
  allow_full_profile_setup: boolean;
  status: string;
  expires_at: string;
  message: string | null;
  default_permissions?: string[];
  deal_rooms?: {
    name: string;
    description: string | null;
  };
}

const DealRoomInviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    company: ""
  });

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  useEffect(() => {
    // If user is already authenticated and invitation is pending, check if they can accept
    if (isAuthenticated && invitation && invitation.status === "pending") {
      // Auto-fill email if matching
      if (user?.email === invitation.email) {
        // Can accept directly - no action needed here
      }
    }
  }, [isAuthenticated, invitation, user]);

  const fetchInvitation = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("deal_room_invitations")
        .select(`
          *,
          deal_rooms (
            name,
            description
          )
        `)
        .eq("token", token)
        .single();

      if (fetchError) throw fetchError;
      
      setInvitation(data);
      setFormData(prev => ({
        ...prev,
        email: data.email,
        fullName: data.name || "",
        company: data.company || ""
      }));
    } catch (err) {
      console.error("Error fetching invitation:", err);
      setError("Invalid or expired invitation");
      toast.error("Invalid or expired invitation");
    } finally {
      setLoading(false);
    }
  };

  // Self-healing reconciliation function
  const reconcileInvitations = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('reconcile_my_invitations');
      
      if (error) {
        console.error("Reconciliation error:", error);
        return false;
      }
      
      console.log("Reconciliation result:", data);
      // Type-safe check for success property
      const result = data as { success?: boolean } | null;
      return result?.success === true;
    } catch (err) {
      console.error("Reconciliation failed:", err);
      return false;
    }
  };

  const handleSignUp = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setAccepting(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/deal-rooms/${invitation?.deal_room_id}`,
          data: {
            full_name: formData.fullName,
            company: formData.company,
            deal_room_invite_token: token,
            access_level: invitation?.access_level
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Account created but user data not returned. Please sign in.");
      }

      // Accept the invitation
      await acceptInvitation(authData.user.id);

      // Run reconciliation to ensure everything is linked
      await reconcileInvitations();

      toast.success("Account created! Redirecting to deal room...");
      navigate(`/deal-rooms/${invitation?.deal_room_id}`);
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || "Failed to create account");
      toast.error(err.message || "Failed to create account");
    } finally {
      setAccepting(false);
    }
  };

  const handleSignIn = async () => {
    setAccepting(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      // Accept the invitation
      await acceptInvitation(authData.user?.id);

      // Run reconciliation to ensure everything is linked
      await reconcileInvitations();

      toast.success("Signed in! Redirecting to deal room...");
      navigate(`/deal-rooms/${invitation?.deal_room_id}`);
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in");
      toast.error(err.message || "Failed to sign in");
    } finally {
      setAccepting(false);
    }
  };

  const acceptInvitation = async (userId?: string) => {
    if (!invitation || !userId) {
      throw new Error("Missing invitation or user ID");
    }

    // Update invitation status - the database trigger will automatically
    // create/update the deal_room_participants record server-side
    const { error: inviteError } = await supabase
      .from("deal_room_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by_user_id: userId
      })
      .eq("id", invitation.id);

    if (inviteError) {
      console.error("Invitation update error:", inviteError);
      throw new Error(`Failed to accept invitation: ${inviteError.message}`);
    }
  };

  const handleAcceptAsAuthenticatedUser = async () => {
    if (!user || !invitation) return;

    setAccepting(true);
    setError(null);
    
    try {
      await acceptInvitation(user.id);
      
      // Run reconciliation to ensure everything is linked
      await reconcileInvitations();
      
      toast.success("Invitation accepted! Redirecting...");
      navigate(`/deal-rooms/${invitation.deal_room_id}`);
    } catch (err: any) {
      console.error("Error accepting invitation:", err);
      setError(err.message || "Failed to accept invitation");
      toast.error(err.message || "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    
    try {
      // Try to reconcile any broken state
      const success = await reconcileInvitations();
      
      if (success) {
        toast.success("Successfully repaired invitation state. Redirecting...");
        navigate(`/deal-rooms/${invitation?.deal_room_id}`);
      } else {
        // Refetch invitation to check current state
        await fetchInvitation();
        toast.info("Please try accepting the invitation again.");
      }
    } catch (err) {
      console.error("Retry error:", err);
      toast.error("Retry failed. Please contact support.");
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto p-3 rounded-full bg-destructive/10 w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate("/")}>Go to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invitation.expires_at) < new Date();
  const isAlreadyAccepted = invitation.status === "accepted";
  const isCancelled = invitation.status === "cancelled";
  const dealRoomName = invitation.deal_rooms?.name || "Deal Room";

  if (isCancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto p-3 rounded-full bg-destructive/10 w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Invitation Cancelled</CardTitle>
            <CardDescription>
              This invitation has been cancelled by the deal room administrator.
              Please contact them if you believe this was a mistake.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate("/")}>Go to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto p-3 rounded-full bg-muted w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation has expired. Please contact the deal room admin for a new invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate("/")}>Go to Homepage</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isAlreadyAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto p-3 rounded-full bg-green-500/10 w-fit mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle>Already Accepted</CardTitle>
            <CardDescription>
              This invitation to <strong>{dealRoomName}</strong> has already been accepted.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center gap-2">
            {isAuthenticated ? (
              <Button onClick={() => navigate(`/deal-rooms/${invitation.deal_room_id}`)}>
                Go to Deal Room
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/")}>Go to Homepage</Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Already authenticated - show accept option
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
              <Handshake className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Join Deal Room</CardTitle>
            <CardDescription>
              You've been invited to join <strong>{dealRoomName}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitation.message && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm italic">"{invitation.message}"</p>
              </div>
            )}
            
            <div className="p-4 rounded-lg border space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Signed in as <strong>{user.email}</strong></span>
              </div>
              {invitation.role_in_deal && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{invitation.role_in_deal}</Badge>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleRetry}
                  disabled={retrying}
                >
                  {retrying ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleAcceptAsAuthenticatedUser}
              disabled={accepting}
            >
              {accepting ? "Joining..." : (
                <>
                  Accept & Join Deal Room
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Not authenticated - show sign up/sign in options
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-4">
            <Handshake className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Join {dealRoomName}</CardTitle>
          <CardDescription>
            {invitation.allow_full_profile_setup 
              ? "Create a full Biz Dev account or sign in to join this deal room"
              : "Create an account to access this deal room"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {invitation.message && (
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm italic">"{invitation.message}"</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup">Create Account</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                />
              </div>

              {invitation.allow_full_profile_setup && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-sm">
                    You've been granted access to set up a full Biz Dev profile with all platform features.
                  </p>
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={handleSignUp}
                disabled={accepting}
              >
                {accepting ? "Creating Account..." : "Create Account & Join"}
              </Button>
            </TabsContent>

            <TabsContent value="signin" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Your password"
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleSignIn}
                disabled={accepting}
              >
                {accepting ? "Signing In..." : "Sign In & Join"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealRoomInviteAccept;