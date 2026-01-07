import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Plus, Copy, Clock, CheckCircle, XCircle, Users, Settings, Loader2, Trash2, Lock } from "lucide-react";
import { format } from "date-fns";
import { PermissionManager } from "@/components/PermissionManager";
import { InvitationPermissionManager } from "./InvitationPermissionManager";

interface Invitation {
  id: string;
  invitee_email: string;
  invitee_name: string | null;
  assigned_role: string;
  status: string;
  message: string | null;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
  invitation_token: string;
  source: 'team' | 'deal_room';
  deal_room_name?: string;
  deal_room_id?: string;
  company?: string;
}

export const InvitationsTab = () => {
  const { user } = useAuth();
  const { hasRole } = useUserRole();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [isInvitationPermissionDialogOpen, setIsInvitationPermissionDialogOpen] = useState(false);
  const [emailIdentities, setEmailIdentities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    invitee_name: "",
    invitee_email: "",
    assigned_role: "client_user" as 'admin' | 'team_member' | 'client_user' | 'partner',
    message: "",
    from_identity_id: "",
  });

  useEffect(() => {
    if (user) {
      loadInvitations();
      loadEmailIdentities();
    }
  }, [user]);

  const loadEmailIdentities = async () => {
    try {
      const { data, error } = await supabase
        .from("email_identities")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_active", true)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      setEmailIdentities(data || []);
      
      const primaryEmail = data?.find(e => e.is_primary);
      if (primaryEmail && !formData.from_identity_id) {
        setFormData(prev => ({ ...prev, from_identity_id: primaryEmail.id }));
      }
    } catch (error: any) {
      console.error("Error loading email identities:", error);
    }
  };

  const loadInvitations = async () => {
    try {
      setLoading(true);
      
      // Fetch team invitations
      const { data: teamData, error: teamError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("inviter_id", user?.id)
        .order("created_at", { ascending: false });

      if (teamError) throw teamError;
      
      // Map team invitations to unified format
      const teamInvitations: Invitation[] = (teamData || []).map(inv => ({
        id: inv.id,
        invitee_email: inv.invitee_email,
        invitee_name: inv.invitee_name,
        assigned_role: inv.assigned_role,
        status: inv.status,
        message: inv.message,
        expires_at: inv.expires_at,
        created_at: inv.created_at,
        accepted_at: inv.accepted_at,
        invitation_token: inv.invitation_token,
        source: 'team' as const,
      }));
      
      // Fetch deal room invitations (for admins, get all; otherwise get user's)
      const isAdmin = hasRole('admin');
      let dealRoomQuery = supabase
        .from("deal_room_invitations")
        .select(`
          *,
          deal_rooms:deal_room_id (name)
        `)
        .order("created_at", { ascending: false });
      
      if (!isAdmin) {
        dealRoomQuery = dealRoomQuery.eq("invited_by", user?.id);
      }
      
      const { data: dealRoomData, error: dealRoomError } = await dealRoomQuery;
      
      if (dealRoomError) {
        console.error("Error loading deal room invitations:", dealRoomError);
      }
      
      // Map deal room invitations to unified format
      const dealRoomInvitations: Invitation[] = (dealRoomData || []).map(inv => ({
        id: inv.id,
        invitee_email: inv.email,
        invitee_name: inv.name,
        assigned_role: inv.role_in_deal || 'participant',
        status: inv.status,
        message: inv.message,
        expires_at: inv.expires_at,
        created_at: inv.created_at,
        accepted_at: inv.accepted_at,
        invitation_token: inv.token,
        source: 'deal_room' as const,
        deal_room_name: inv.deal_rooms?.name,
        deal_room_id: inv.deal_room_id,
        company: inv.company,
      }));
      
      // Combine and sort by created_at
      const allInvitations = [...teamInvitations, ...dealRoomInvitations].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setInvitations(allInvitations);
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

      const { data: invitation, error: insertError } = await supabase
        .from("team_invitations")
        .insert({
          inviter_id: user.id,
          invitee_email: formData.invitee_email,
          invitee_name: formData.invitee_name,
          assigned_role: formData.assigned_role,
          message: formData.message || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const inviteDomain = "https://thebdapp.com";
      
      const { error: emailError } = await supabase.functions.invoke("send-invitation", {
        body: {
          inviteeEmail: formData.invitee_email,
          inviteeName: formData.invitee_name,
          inviterName: profile?.full_name || "A team member",
          message: formData.message,
          inviteLink: `${inviteDomain}/accept-invite/${invitation.invitation_token}`,
          identityId: formData.from_identity_id,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        toast.success("Invitation created. You can copy the invite link.");
      } else {
        toast.success(`Invitation sent to ${formData.invitee_name}`);
      }

      setOpen(false);
      const primaryEmail = emailIdentities.find(e => e.is_primary);
      setFormData({ 
        invitee_name: "", 
        invitee_email: "", 
        assigned_role: "client_user", 
        message: "",
        from_identity_id: primaryEmail?.id || ""
      });
      loadInvitations();
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  const copyInviteLink = (token: string, source: 'team' | 'deal_room') => {
    const link = source === 'deal_room'
      ? `https://thebdapp.com/deal-room-invite/${token}`
      : `https://thebdapp.com/accept-invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard");
  };

  const deleteInvitation = async (id: string, source: 'team' | 'deal_room') => {
    try {
      const tableName = source === 'deal_room' ? 'deal_room_invitations' : 'team_invitations';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Invitation deleted");
      loadInvitations();
    } catch (error: any) {
      console.error("Error deleting invitation:", error);
      toast.error("Failed to delete invitation");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'team_member': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'partner': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === "accepted") {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
    } else if (isExpired || status === "expired") {
      return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
    } else {
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Invitations</h2>
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
                Invite someone to join your platform with specific roles and permissions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendInvitation} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="from_email">Send From</Label>
                <Select 
                  value={formData.from_identity_id} 
                  onValueChange={(value) => setFormData({ ...formData, from_identity_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select email identity" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailIdentities.map((identity) => (
                      <SelectItem key={identity.id} value={identity.id}>
                        {identity.display_name} &lt;{identity.email}&gt;
                        {identity.is_primary && " (Primary)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {emailIdentities.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No email identities configured. Visit Communications Hub &gt; Email Identities to add one.
                  </p>
                )}
              </div>
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
                <Label htmlFor="assigned_role">Assign Role</Label>
                <Select 
                  value={formData.assigned_role} 
                  onValueChange={(value: any) => setFormData({ ...formData, assigned_role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {hasRole('admin') && <SelectItem value="admin">Admin</SelectItem>}
                    <SelectItem value="team_member">Team Member</SelectItem>
                    <SelectItem value="client_user">Client User</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (optional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Looking forward to working with you..."
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
            <Card key={`${invitation.source}-${invitation.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{invitation.invitee_name || "No name provided"}</h3>
                      {getStatusBadge(invitation.status, invitation.expires_at)}
                      {invitation.source === 'deal_room' && (
                        <Badge variant="outline" className="text-xs">
                          Deal Room
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Mail className="w-4 h-4" />
                      <span>{invitation.invitee_email}</span>
                      {invitation.company && (
                        <>
                          <span>•</span>
                          <span>{invitation.company}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getRoleBadgeColor(invitation.assigned_role)}>
                        {invitation.assigned_role.replace('_', ' ')}
                      </Badge>
                      {invitation.deal_room_name && (
                        <Badge variant="secondary" className="text-xs">
                          {invitation.deal_room_name}
                        </Badge>
                      )}
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
                  <div className="flex flex-col gap-2">
                    {invitation.status === "pending" && new Date(invitation.expires_at) > new Date() && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvitation(invitation);
                            setIsInvitationPermissionDialogOpen(true);
                          }}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Set Permissions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(invitation.invitation_token, invitation.source)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                      </>
                    )}
                    {invitation.status === "accepted" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const { data: profile } = await supabase
                            .from('profiles')
                            .select('id')
                            .eq('email', invitation.invitee_email)
                            .single();
                          
                          if (profile) {
                            setSelectedUserId(profile.id);
                            setIsPermissionDialogOpen(true);
                          }
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Permissions
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteInvitation(invitation.id, invitation.source)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Permission Management Dialog for Accepted Users */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Manage User Permissions
            </DialogTitle>
            <DialogDescription>
              Configure what this user can access and do on the platform
            </DialogDescription>
          </DialogHeader>
          {selectedUserId && (
            <PermissionManager userId={selectedUserId} />
          )}
        </DialogContent>
      </Dialog>

      {/* Permission Management Dialog for Pending Invitations */}
      <Dialog open={isInvitationPermissionDialogOpen} onOpenChange={setIsInvitationPermissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Set Default Permissions
            </DialogTitle>
            <DialogDescription>
              Configure permissions that will be applied when {selectedInvitation?.invitee_name || selectedInvitation?.invitee_email} accepts the invitation
            </DialogDescription>
          </DialogHeader>
          {selectedInvitation && (
            <InvitationPermissionManager 
              invitationId={selectedInvitation.id} 
              inviteeEmail={selectedInvitation.invitee_email}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
