import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Users, 
  Mail, 
  Building2, 
  User, 
  CheckCircle, 
  Clock,
  Plus,
  Send,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  RefreshCw,
  XCircle,
  Settings
} from "lucide-react";
import { DealRoomParticipantPermissions } from "@/components/deal-room/DealRoomParticipantPermissions";

interface Participant {
  id: string;
  deal_room_id: string;
  user_id: string | null;
  email: string;
  name: string;
  is_company: boolean;
  invitation_sent_at: string | null;
  invitation_accepted_at: string | null;
  has_submitted_contribution: boolean;
  contribution_visible_to_others: boolean;
}

interface Invitation {
  id: string;
  token: string;
  status: string;
  email: string;
}

interface DealRoomParticipantsProps {
  dealRoomId: string;
  dealRoomName: string;
  isAdmin: boolean;
}

export const DealRoomParticipants = ({ dealRoomId, dealRoomName, isAdmin }: DealRoomParticipantsProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [invitations, setInvitations] = useState<Map<string, Invitation>>(new Map());
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  const [permissionsUserId, setPermissionsUserId] = useState<string | null>(null);
  const [permissionsUserEmail, setPermissionsUserEmail] = useState<string | undefined>();

  useEffect(() => {
    fetchParticipants();
  }, [dealRoomId]);

  const fetchParticipants = async () => {
    try {
      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from("deal_room_participants")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: true });

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);

      // Fetch all invitations for this deal room
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("deal_room_invitations")
        .select("id, token, status, email")
        .eq("deal_room_id", dealRoomId);

      if (invitationsError) throw invitationsError;

      // Map invitations by email for quick lookup
      const inviteMap = new Map<string, Invitation>();
      invitationsData?.forEach(inv => {
        inviteMap.set(inv.email.toLowerCase(), inv);
      });
      setInvitations(inviteMap);
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Please enter both name and email");
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from("deal_room_participants")
        .insert({
          deal_room_id: dealRoomId,
          name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
        });

      if (error) throw error;
      toast.success("Participant added");
      setNewName("");
      setNewEmail("");
      fetchParticipants();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("This email is already a participant");
      } else {
        toast.error("Failed to add participant");
      }
    } finally {
      setAdding(false);
    }
  };

  const getOrCreateInvitation = async (participant: Participant): Promise<Invitation | null> => {
    const existingInvite = invitations.get(participant.email.toLowerCase());
    
    // If there's an existing active invitation, return it
    if (existingInvite && existingInvite.status !== 'cancelled') {
      return existingInvite;
    }

    // Create new invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const { data, error } = await supabase
      .from("deal_room_invitations")
      .insert({
        deal_room_id: dealRoomId,
        email: participant.email.toLowerCase(),
        name: participant.name,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        access_level: 'deal_room_only',
        allow_full_profile_setup: false
      } as any)
      .select("id, token, status, email")
      .single();

    if (error) throw error;
    return data;
  };

  const sendInvitation = async (participant: Participant) => {
    setSendingInvite(participant.id);
    try {
      // Get or create invitation record
      const invitation = await getOrCreateInvitation(participant);
      if (!invitation) throw new Error("Failed to create invitation");

      // Send the actual email via edge function
      const { error: sendError } = await supabase.functions.invoke('send-deal-room-invite', {
        body: {
          invitationId: invitation.id,
          dealRoomName,
          recipientEmail: participant.email,
          recipientName: participant.name
        }
      });

      if (sendError) throw sendError;

      // Update the participant's invitation_sent_at timestamp
      const { error: updateError } = await supabase
        .from("deal_room_participants")
        .update({ invitation_sent_at: new Date().toISOString() })
        .eq("id", participant.id);

      if (updateError) throw updateError;

      toast.success(`Invitation email sent to ${participant.name}`);
      fetchParticipants();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation email");
    } finally {
      setSendingInvite(null);
    }
  };

  const resendInvitation = async (participant: Participant) => {
    setSendingInvite(participant.id);
    try {
      const invitation = invitations.get(participant.email.toLowerCase());
      if (!invitation) {
        // If no invitation exists, create and send new one
        await sendInvitation(participant);
        return;
      }

      // Resend email with existing invitation
      const { error: sendError } = await supabase.functions.invoke('send-deal-room-invite', {
        body: {
          invitationId: invitation.id,
          dealRoomName,
          recipientEmail: participant.email,
          recipientName: participant.name
        }
      });

      if (sendError) throw sendError;

      toast.success(`Invitation resent to ${participant.name}`);
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error("Failed to resend invitation");
    } finally {
      setSendingInvite(null);
    }
  };

  const cancelInvitation = async (participant: Participant) => {
    if (!confirm(`Cancel invitation for ${participant.name}? They won't be able to use the invite link.`)) return;

    try {
      const invitation = invitations.get(participant.email.toLowerCase());
      
      if (invitation) {
        // Mark invitation as cancelled (using type assertion since 'cancelled' was just added to enum)
        const { error: inviteError } = await supabase
          .from("deal_room_invitations")
          .update({ status: 'cancelled' as any })
          .eq("id", invitation.id);

        if (inviteError) throw inviteError;
      }

      // Reset the invitation_sent_at on participant
      const { error: participantError } = await supabase
        .from("deal_room_participants")
        .update({ invitation_sent_at: null })
        .eq("id", participant.id);

      if (participantError) throw participantError;

      toast.success(`Invitation cancelled for ${participant.name}`);
      fetchParticipants();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error("Failed to cancel invitation");
    }
  };

  const copyInviteLink = async (participant: Participant) => {
    try {
      const invitation = await getOrCreateInvitation(participant);
      if (!invitation) throw new Error("Failed to create invitation");

      const inviteUrl = `${window.location.origin}/deal-room-invite/${invitation.token}`;
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied to clipboard");
      
      // Refresh to show updated invitation status
      fetchParticipants();
    } catch (error) {
      console.error("Error copying invite link:", error);
      toast.error("Failed to copy invite link");
    }
  };

  const removeParticipant = async (participantId: string, participantName: string, participantEmail: string) => {
    if (!confirm(`Remove ${participantName} from this deal room?`)) return;
    
    try {
      // Remove participant
      const { error: participantError } = await supabase
        .from("deal_room_participants")
        .delete()
        .eq("id", participantId);

      if (participantError) throw participantError;

      // Also cancel any pending invitations (using type assertion since 'cancelled' was just added to enum)
      const invitation = invitations.get(participantEmail.toLowerCase());
      if (invitation && invitation.status === 'pending') {
        await supabase
          .from("deal_room_invitations")
          .update({ status: 'cancelled' as any })
          .eq("id", invitation.id);
      }

      toast.success(`${participantName} removed`);
      fetchParticipants();
    } catch (error) {
      toast.error("Failed to remove participant");
    }
  };

  const getParticipantStatus = (participant: Participant) => {
    if (participant.invitation_accepted_at || participant.user_id) {
      return 'joined';
    }
    if (participant.invitation_sent_at) {
      return 'invited';
    }
    return 'added';
  };

  const openPermissions = (userId: string, email: string) => {
    setPermissionsUserId(userId);
    setPermissionsUserEmail(email);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-16 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {isAdmin && (
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Input
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addParticipant} disabled={adding} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </Card>
      )}

      <Card className="divide-y divide-border">
        {participants.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No participants yet</p>
          </div>
        ) : (
          participants.map((participant) => {
            const status = getParticipantStatus(participant);
            const isSending = sendingInvite === participant.id;

            return (
              <div key={participant.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 rounded-full bg-muted shrink-0">
                    {participant.is_company ? (
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{participant.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{participant.email}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap pl-11 sm:pl-0">
                  {participant.has_submitted_contribution && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      <span className="hidden sm:inline">Submitted</span>
                    </Badge>
                  )}
                  
                  {participant.contribution_visible_to_others ? (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">Visible</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground text-xs">
                      <EyeOff className="w-3 h-3" />
                      <span className="hidden sm:inline">Private</span>
                    </Badge>
                  )}

                  {/* Status Badge */}
                  {status === 'joined' ? (
                    <Badge className="bg-emerald-500/20 text-emerald-600 gap-1 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Joined
                    </Badge>
                  ) : status === 'invited' ? (
                    <Badge variant="secondary" className="gap-1 text-xs text-amber-600 bg-amber-500/10">
                      <Clock className="w-3 h-3" />
                      Email Sent
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-xs">
                      Added
                    </Badge>
                  )}

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      {status === 'added' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendInvitation(participant)}
                            disabled={isSending}
                            className="h-7 text-xs"
                          >
                            {isSending ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Send </span>Invite
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyInviteLink(participant)}
                            className="h-7 w-7 p-0"
                            title="Copy invite link"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </>
                      )}

                      {status === 'invited' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => resendInvitation(participant)}
                            disabled={isSending}
                            className="h-7 text-xs"
                            title="Resend invitation"
                          >
                            {isSending ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Resend
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyInviteLink(participant)}
                            className="h-7 w-7 p-0"
                            title="Copy invite link"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelInvitation(participant)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Cancel invitation"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </>
                      )}

                      {status === 'joined' && participant.user_id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openPermissions(participant.user_id!, participant.email)}
                          className="h-7 text-xs"
                          title="Manage permissions"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Permissions</span>
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                        onClick={() => removeParticipant(participant.id, participant.name, participant.email)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Card>

      {/* Permissions Dialog */}
      {permissionsUserId && (
        <DealRoomParticipantPermissions
          userId={permissionsUserId}
          userEmail={permissionsUserEmail}
          open={!!permissionsUserId}
          onOpenChange={(open) => {
            if (!open) {
              setPermissionsUserId(null);
              setPermissionsUserEmail(undefined);
            }
          }}
        />
      )}
    </div>
  );
};
