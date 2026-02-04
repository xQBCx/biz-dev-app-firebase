import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Mail, Send, Clock, CheckCircle, XCircle, Copy, ExternalLink, Building, Shield, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface DealRoomInviteManagerProps {
  dealRoomId: string;
  dealRoomName: string;
  isAdmin: boolean;
}

interface Invitation {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role_in_deal: string | null;
  access_level: string;
  allow_full_profile_setup: boolean;
  token: string;
  status: string;
  expires_at: string;
  accepted_at: string | null;
  message: string | null;
  created_at: string;
}

export const DealRoomInviteManager = ({ dealRoomId, dealRoomName, isAdmin }: DealRoomInviteManagerProps) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: "",
    name: "",
    company: "",
    role_in_deal: "",
    allow_full_profile_setup: false,
    requires_wallet_setup: false,
    message: "",
    default_modules: ['deal_rooms'] as string[]
  });

  useEffect(() => {
    fetchInvitations();
  }, [dealRoomId]);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("deal_room_invitations")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!newInvite.email) {
      toast.error("Please enter an email address");
      return;
    }

    setSending(true);
    try {
      // Create the invitation record with default permissions
      const { data: invitation, error: inviteError } = await supabase
        .from("deal_room_invitations")
        .insert({
          deal_room_id: dealRoomId,
          invited_by: user?.id,
          email: newInvite.email.toLowerCase().trim(),
          name: newInvite.name || null,
          company: newInvite.company || null,
          role_in_deal: newInvite.role_in_deal || null,
          allow_full_profile_setup: newInvite.allow_full_profile_setup,
          requires_wallet_setup: newInvite.requires_wallet_setup,
          access_level: newInvite.allow_full_profile_setup ? "full_profile" : "deal_room_only",
          message: newInvite.message || null,
          default_permissions: newInvite.default_modules
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send the invitation email
      const { error: emailError } = await supabase.functions.invoke("send-deal-room-invite", {
        body: {
          invitationId: invitation.id,
          dealRoomName,
          recipientEmail: newInvite.email,
          recipientName: newInvite.name,
          personalMessage: newInvite.message
        }
      });

      if (emailError) {
        console.error("Email sending failed:", emailError);
        toast.warning("Invitation created but email failed to send");
      } else {
        toast.success(`Invitation sent to ${newInvite.email}`);
      }

      setInviteDialogOpen(false);
      setNewInvite({
        email: "",
        name: "",
        company: "",
        role_in_deal: "",
        allow_full_profile_setup: false,
        requires_wallet_setup: false,
        message: "",
        default_modules: ['deal_rooms']
      });
      fetchInvitations();
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `https://thebdapp.com/deal-room-invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard");
  };

  const resendInvitation = async (invitation: Invitation) => {
    try {
      const { error } = await supabase.functions.invoke("send-deal-room-invite", {
        body: {
          invitationId: invitation.id,
          dealRoomName,
          recipientEmail: invitation.email,
          recipientName: invitation.name,
          personalMessage: invitation.message
        }
      });

      if (error) throw error;
      toast.success(`Invitation resent to ${invitation.email}`);
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error("Failed to resend invitation");
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired && status === "pending") {
      return <Badge variant="outline" className="text-destructive border-destructive">Expired</Badge>;
    }

    const variants: Record<string, { color: string; icon: any }> = {
      pending: { color: "bg-amber-500/20 text-amber-600", icon: Clock },
      accepted: { color: "bg-green-500/20 text-green-600", icon: CheckCircle },
      declined: { color: "bg-destructive/20 text-destructive", icon: XCircle }
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <CardTitle>Invite Participants</CardTitle>
            </div>
            {isAdmin && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Invite to Deal Room</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join "{dealRoomName}". They can accept with an existing account or create a new one.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email Address *</Label>
                        <Input
                          type="email"
                          placeholder="participant@company.com"
                          value={newInvite.email}
                          onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder="John Smith"
                          value={newInvite.name}
                          onChange={(e) => setNewInvite({ ...newInvite, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          placeholder="Acme Corp"
                          value={newInvite.company}
                          onChange={(e) => setNewInvite({ ...newInvite, company: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role in Deal</Label>
                        <Input
                          placeholder="Investor, Advisor, etc."
                          value={newInvite.role_in_deal}
                          onChange={(e) => setNewInvite({ ...newInvite, role_in_deal: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Full Profile Setup</Label>
                        <p className="text-sm text-muted-foreground">
                          Let them create a complete Biz Dev profile, not just deal room access
                        </p>
                      </div>
                      <Switch
                        checked={newInvite.allow_full_profile_setup}
                        onCheckedChange={(checked) => 
                          setNewInvite({ ...newInvite, allow_full_profile_setup: checked })
                        }
                      />
                    </div>

                    {/* Wallet Setup Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-muted/50">
                      <div className="flex items-start gap-3">
                        <Wallet className="h-5 w-5 text-primary mt-0.5" />
                        <div className="space-y-0.5">
                          <Label className="text-base">Requires Wallet Setup</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable if they'll receive XDK payouts and need to set up their withdrawal wallet
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={newInvite.requires_wallet_setup}
                        onCheckedChange={(checked) => 
                          setNewInvite({ ...newInvite, requires_wallet_setup: checked })
                        }
                      />
                    </div>
                    
                    {/* Pre-configure Module Permissions */}
                    <div className="space-y-3 p-4 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <Label className="text-base font-medium">Pre-configure Module Access</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Select which modules this invitee will have access to when they join.
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {[
                          { value: 'deal_rooms', label: 'Deal Rooms' },
                          { value: 'dashboard', label: 'Dashboard' },
                          { value: 'crm', label: 'CRM' },
                          { value: 'portfolio', label: 'Portfolio' },
                          { value: 'tasks', label: 'Tasks' },
                          { value: 'messages', label: 'Messages' },
                          { value: 'xcommodity', label: 'XCommodity' },
                          { value: 'calendar', label: 'Calendar' },
                        ].map((module) => (
                          <div key={module.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`module-${module.value}`}
                              checked={newInvite.default_modules.includes(module.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewInvite({
                                    ...newInvite,
                                    default_modules: [...newInvite.default_modules, module.value]
                                  });
                                } else {
                                  setNewInvite({
                                    ...newInvite,
                                    default_modules: newInvite.default_modules.filter(m => m !== module.value)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`module-${module.value}`} className="text-sm cursor-pointer">
                              {module.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Personal Message (Optional)</Label>
                      <Textarea
                        placeholder="Add a personal note to your invitation..."
                        value={newInvite.message}
                        onChange={(e) => setNewInvite({ ...newInvite, message: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={sendInvitation} disabled={sending}>
                      {sending ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <CardDescription>
            Invite people to participate in this deal room. First-time users can join with deal-room-only access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No invitations sent yet</p>
              <p className="text-sm mt-1">Send invitations to bring participants into this deal room</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invitee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invitation.name || invitation.email}</div>
                        {invitation.name && (
                          <div className="text-sm text-muted-foreground">{invitation.email}</div>
                        )}
                        {invitation.company && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Building className="h-3 w-3" />
                            {invitation.company}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{invitation.role_in_deal || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {invitation.allow_full_profile_setup ? "Full Profile" : "Deal Room Only"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invitation.status, invitation.expires_at)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(invitation.created_at), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyInviteLink(invitation.token)}
                          title="Copy invite link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {invitation.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resendInvitation(invitation)}
                            title="Resend invitation"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
