import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Users, Plus, Mail, Trash2, Shield, Eye, Code, Send, Copy, Check, Loader2, Crown } from "lucide-react";
import { format } from "date-fns";

interface TeamMember {
  id: string;
  partner_integration_id: string;
  user_id: string | null;
  email: string;
  full_name: string | null;
  role: "owner" | "admin" | "engineer" | "viewer";
  permissions: {
    can_view_api_token?: boolean;
    can_use_api?: boolean;
    can_view_logs?: boolean;
    can_view_docs?: boolean;
    can_submit_feedback?: boolean;
  };
  invite_token: string | null;
  invite_expires_at: string | null;
  joined_at: string | null;
  is_active: boolean;
  last_active_at: string | null;
  created_at: string;
}

interface PartnerTeamManagerProps {
  partnerId: string;
  partnerName: string;
  isAdmin?: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  admin: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  engineer: "bg-green-500/20 text-green-500 border-green-500/30",
  viewer: "bg-gray-500/20 text-gray-500 border-gray-500/30",
};

export function PartnerTeamManager({ partnerId, partnerName, isAdmin = false }: PartnerTeamManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const [newMember, setNewMember] = useState({
    email: "",
    full_name: "",
    role: "engineer" as const,
    permissions: {
      can_view_api_token: false,
      can_use_api: true,
      can_view_logs: true,
      can_view_docs: true,
      can_submit_feedback: true,
    },
  });

  useEffect(() => {
    loadMembers();
  }, [partnerId]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("partner-token-generate", {
        body: { action: "list_team_members", partner_id: partnerId },
      });

      if (response.error) throw response.error;
      setMembers(response.data.members || []);
    } catch (error: any) {
      console.error("Error loading team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.email) {
      toast.error("Email is required");
      return;
    }

    setIsSending(true);
    try {
      const response = await supabase.functions.invoke("partner-token-generate", {
        body: {
          action: "add_team_member",
          partner_id: partnerId,
          email: newMember.email,
          full_name: newMember.full_name || null,
          role: newMember.role,
          permissions: newMember.permissions,
        },
      });

      if (response.error) throw response.error;

      toast.success(`Invitation sent to ${newMember.email}`);
      setIsAddOpen(false);
      setNewMember({
        email: "",
        full_name: "",
        role: "engineer",
        permissions: {
          can_view_api_token: false,
          can_use_api: true,
          can_view_logs: true,
          can_view_docs: true,
          can_submit_feedback: true,
        },
      });
      loadMembers();
    } catch (error: any) {
      console.error("Error adding team member:", error);
      toast.error(error.message || "Failed to add team member");
    } finally {
      setIsSending(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const response = await supabase.functions.invoke("partner-token-generate", {
        body: { action: "remove_team_member", member_id: memberId },
      });

      if (response.error) throw response.error;

      toast.success("Team member removed");
      loadMembers();
    } catch (error: any) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      const response = await supabase.functions.invoke("partner-token-generate", {
        body: {
          action: "update_team_member",
          member_id: member.id,
          is_active: !member.is_active,
        },
      });

      if (response.error) throw response.error;

      toast.success(`Team member ${member.is_active ? "deactivated" : "activated"}`);
      loadMembers();
    } catch (error: any) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member");
    }
  };

  const copyInviteLink = (inviteToken: string) => {
    const link = `${window.location.origin}/partner-team-invite/${inviteToken}`;
    navigator.clipboard.writeText(link);
    setCopied(inviteToken);
    toast.success("Invite link copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              Manage who has access to {partnerName}'s integration
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join {partnerName}'s team
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="engineer@company.com"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      placeholder="John Smith"
                      value={newMember.full_name}
                      onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(v) => setNewMember({ ...newMember, role: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4" />
                          Owner - Full access and ownership
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin - Can manage team
                        </div>
                      </SelectItem>
                      <SelectItem value="engineer">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Engineer - Can use API
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Viewer - Read-only access
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    {[
                      { key: "can_view_api_token", label: "Can view API token" },
                      { key: "can_use_api", label: "Can use the API" },
                      { key: "can_view_logs", label: "Can view API logs" },
                      { key: "can_view_docs", label: "Can view documentation" },
                      { key: "can_submit_feedback", label: "Can submit feedback" },
                    ].map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between">
                        <span className="text-sm">{perm.label}</span>
                        <Switch
                          checked={newMember.permissions[perm.key as keyof typeof newMember.permissions]}
                          onCheckedChange={(checked) =>
                            setNewMember({
                              ...newMember,
                              permissions: { ...newMember.permissions, [perm.key]: checked },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={isSending || !newMember.email}>
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
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
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading team members...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No team members yet</p>
            <p className="text-sm">Invite engineers to collaborate on this integration</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{member.full_name || member.email}</p>
                      {member.full_name && (
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[member.role]}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.joined_at ? (
                      <Badge variant={member.is_active ? "default" : "secondary"}>
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                          Pending
                        </Badge>
                        {member.invite_token && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyInviteLink(member.invite_token!)}
                            title="Copy invite link"
                          >
                            {copied === member.invite_token ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.joined_at ? (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(member.joined_at), "MMM d, yyyy")}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {member.role !== "owner" && (
                        <>
                          <Switch
                            checked={member.is_active}
                            onCheckedChange={() => handleToggleActive(member)}
                            disabled={!member.joined_at}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
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
  );
}
