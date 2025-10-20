import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Mail, Plus, Copy, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { format } from "date-fns";

interface Invitation {
  id: string;
  invitee_email: string;
  invitee_name: string;
  invite_code: string;
  status: string;
  message: string | null;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
}

const TeamInvitations = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    invitee_name: "",
    invitee_email: "",
    message: "",
  });

  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [user]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("inviter_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error("Error loading invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSending(true);

      // Create invitation in database
      const { data: invitation, error: insertError } = await supabase
        .from("user_invitations")
        .insert({
          inviter_id: user.id,
          invitee_email: formData.invitee_email,
          invitee_name: formData.invitee_name,
          message: formData.message || null,
        } as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Get inviter's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke("send-invitation", {
        body: {
          invitee_email: formData.invitee_email,
          invitee_name: formData.invitee_name,
          inviter_name: profile?.full_name || "A team member",
          invite_code: invitation.invite_code,
          message: formData.message,
        },
      });

      if (emailError) throw emailError;

      toast.success(`Invitation sent to ${formData.invitee_name}`);
      setOpen(false);
      setFormData({ invitee_name: "", invitee_email: "", message: "" });
      loadInvitations();
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/auth?invite=${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard");
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === "accepted") {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
    } else if (isExpired || status === "expired") {
      return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
    } else if (status === "revoked") {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Revoked</Badge>;
    } else {
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Team Invitations</h1>
            <p className="text-muted-foreground">
              Invite business partners and team members to join your platform
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Team Invitation</DialogTitle>
                <DialogDescription>
                  Invite someone to join your platform and collaborate on portfolio companies
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendInvitation} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="invitee_name">Name</Label>
                  <Input
                    id="invitee_name"
                    value={formData.invitee_name}
                    onChange={(e) => setFormData({ ...formData, invitee_name: e.target.value })}
                    placeholder="Jason Lopez"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invitee_email">Email</Label>
                  <Input
                    id="invitee_email"
                    type="email"
                    value={formData.invitee_email}
                    onChange={(e) => setFormData({ ...formData, invitee_email: e.target.value })}
                    placeholder="jason@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Personal Message (optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Looking forward to working with you on our portfolio companies..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sending}>
                    {sending ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {invitations.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Invitations Yet</h3>
            <p className="text-muted-foreground mb-6">
              Send your first invitation to start building your team
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{invitation.invitee_name}</h3>
                        {getStatusBadge(invitation.status, invitation.expires_at)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Mail className="w-4 h-4" />
                        <span>{invitation.invitee_email}</span>
                      </div>
                      {invitation.message && (
                        <p className="text-sm text-muted-foreground mb-3 italic">
                          "{invitation.message}"
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Sent {format(new Date(invitation.created_at), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span>Expires {format(new Date(invitation.expires_at), "MMM d, yyyy")}</span>
                        {invitation.accepted_at && (
                          <>
                            <span>•</span>
                            <span>Accepted {format(new Date(invitation.accepted_at), "MMM d, yyyy")}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {invitation.status === "pending" && new Date(invitation.expires_at) > new Date() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteLink(invitation.invite_code)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamInvitations;