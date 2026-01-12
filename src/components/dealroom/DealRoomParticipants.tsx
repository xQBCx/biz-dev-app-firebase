import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Settings,
  UserCheck,
  Contact,
  UserPlus,
  BookUser,
  Pencil
} from "lucide-react";
import { DealRoomParticipantPermissions } from "@/components/deal-room/DealRoomParticipantPermissions";
import { CRMContactSearch } from "./CRMContactSearch";
import { ParticipantDisplayEditor, getParticipantDisplayName } from "./ParticipantDisplayEditor";

// Master Admin user ID for CRM auto-add
const MASTER_ADMIN_USER_ID = "b8c5a162-5141-422e-9924-dc0e8c333790";

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
  can_add_to_crm: boolean;
  default_permissions?: unknown;
  visibility_config?: unknown;
  role_type?: string;
  display_mode?: string | null;
  display_name_override?: string | null;
  wallet_address?: string | null;
  company_display_name?: string | null;
}

interface LookupResult {
  type: 'profile' | 'crm_contact' | null;
  profileId?: string;
  crmContactId?: string;
  name?: string;
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
  const [lookupResults, setLookupResults] = useState<Map<string, LookupResult>>(new Map());
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  // Unified permissions dialog state - stores the participant being configured
  const [permissionsParticipant, setPermissionsParticipant] = useState<Participant | null>(null);
  const [displayEditParticipant, setDisplayEditParticipant] = useState<Participant | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserParticipant, setCurrentUserParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (currentUserId && participants.length > 0) {
      const myParticipant = participants.find(p => p.user_id === currentUserId);
      setCurrentUserParticipant(myParticipant || null);
    }
  }, [currentUserId, participants]);

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

      // Lookup CRM/profile for each participant
      if (participantsData && participantsData.length > 0) {
        await lookupParticipants(participantsData);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const lookupParticipants = async (participantsList: Participant[]) => {
    const emails = participantsList.map(p => p.email.toLowerCase());
    const lookupMap = new Map<string, LookupResult>();

    // Check profiles table for existing platform users
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("email", emails);

    profiles?.forEach(profile => {
      lookupMap.set(profile.email.toLowerCase(), {
        type: 'profile',
        profileId: profile.id,
        name: profile.full_name
      });
    });

    // Check CRM contacts for non-profile emails
    const emailsNotInProfiles = emails.filter(e => !lookupMap.has(e));
    if (emailsNotInProfiles.length > 0) {
      const { data: crmContacts } = await supabase
        .from("crm_contacts")
        .select("id, email, first_name, last_name")
        .in("email", emailsNotInProfiles);

      crmContacts?.forEach(contact => {
        if (contact.email) {
          lookupMap.set(contact.email.toLowerCase(), {
            type: 'crm_contact',
            crmContactId: contact.id,
            name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
          });
        }
      });
    }

    // Mark remaining as null (new contact)
    emails.forEach(email => {
      if (!lookupMap.has(email)) {
        lookupMap.set(email, { type: null });
      }
    });

    setLookupResults(lookupMap);
  };

  const addToMasterAdminCRM = async (name: string, email: string) => {
    try {
      // Check if contact already exists in Master Admin's CRM
      const { data: existing } = await supabase
        .from("crm_contacts")
        .select("id")
        .eq("user_id", MASTER_ADMIN_USER_ID)
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (existing) return; // Already in CRM

      // Split name into first/last
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await supabase.from("crm_contacts").insert({
        user_id: MASTER_ADMIN_USER_ID,
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        lead_source: 'deal_room',
        lead_status: 'new',
        notes: `Added from Deal Room: ${dealRoomName}`
      });
    } catch (error) {
      console.error("Error adding to Master Admin CRM:", error);
    }
  };

  const addParticipantToMyCRM = async (participant: Participant) => {
    if (!currentUserId) {
      toast.error("You must be logged in");
      return;
    }
    
    try {
      // Check if already in user's CRM
      const { data: existing } = await supabase
        .from("crm_contacts")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("email", participant.email.toLowerCase())
        .maybeSingle();

      if (existing) {
        toast.info(`${participant.name} is already in your CRM`);
        return;
      }

      const nameParts = participant.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await supabase.from("crm_contacts").insert({
        user_id: currentUserId,
        first_name: firstName,
        last_name: lastName,
        email: participant.email.toLowerCase(),
        lead_source: 'deal_room',
        lead_status: 'new',
        notes: `Added from Deal Room: ${dealRoomName}`
      });

      toast.success(`${participant.name} added to your CRM`);
    } catch (error) {
      console.error("Error adding to CRM:", error);
      toast.error("Failed to add contact to CRM");
    }
  };

  const toggleCanAddToCRM = async (participantId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("deal_room_participants")
        .update({ can_add_to_crm: !currentValue })
        .eq("id", participantId);

      if (error) throw error;
      
      // Update local state
      setParticipants(prev => prev.map(p => 
        p.id === participantId ? { ...p, can_add_to_crm: !currentValue } : p
      ));
      
      toast.success(`CRM permission ${!currentValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error toggling CRM permission:", error);
      toast.error("Failed to update permission");
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

      // Auto-add to Master Admin's CRM
      await addToMasterAdminCRM(newName.trim(), newEmail.trim());

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
        allow_full_profile_setup: false,
        invited_by: currentUserId
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

  const getParticipantStatus = (participant: Participant): 'accepted' | 'pending' | 'cancelled' | 'added' => {
    // Check invitation status from the invitations map
    const invitation = invitations.get(participant.email.toLowerCase());
    
    // If user has joined (has user_id or accepted_at), they're accepted
    if (participant.invitation_accepted_at || participant.user_id) {
      return 'accepted';
    }
    
    // Check invitation record status
    if (invitation) {
      if (invitation.status === 'accepted') return 'accepted';
      if (invitation.status === 'cancelled') return 'cancelled';
      if (invitation.status === 'pending') return 'pending';
    }
    
    // If invitation was sent but no record (edge case), treat as pending
    if (participant.invitation_sent_at) {
      return 'pending';
    }
    
    return 'added';
  };

  const openPermissions = (participant: Participant) => {
    setPermissionsParticipant(participant);
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
            <CRMContactSearch
              nameValue={newName}
              emailValue={newEmail}
              onNameChange={setNewName}
              onEmailChange={setNewEmail}
              onSelect={(name, email) => {
                setNewName(name);
                setNewEmail(email);
              }}
              placeholder="Search CRM or enter name..."
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
                  <div className="p-2 rounded-full bg-muted shrink-0 relative">
                    {participant.is_company ? (
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                    {/* CRM/Profile indicator */}
                    {(() => {
                      const lookup = lookupResults.get(participant.email.toLowerCase());
                      if (lookup?.type === 'profile') {
                        return (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5" title="Platform member">
                            <UserCheck className="w-2.5 h-2.5 text-white" />
                          </div>
                        );
                      }
                      if (lookup?.type === 'crm_contact') {
                        return (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5" title="In CRM">
                            <Contact className="w-2.5 h-2.5 text-white" />
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{getParticipantDisplayName(participant)}</p>
                      {/* Edit display button for admins/creators or self */}
                      {(isAdmin || participant.user_id === currentUserId) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                          onClick={() => setDisplayEditParticipant(participant)}
                          title="Edit display name"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                      {(() => {
                        const lookup = lookupResults.get(participant.email.toLowerCase());
                        if (lookup?.type === 'profile') {
                          return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Member</Badge>;
                        }
                        if (lookup?.type === 'crm_contact') {
                          return <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">CRM</Badge>;
                        }
                        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">New</Badge>;
                      })()}
                    </div>
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
                  {status === 'accepted' ? (
                    <Badge className="bg-emerald-500/20 text-emerald-600 gap-1 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Accepted
                    </Badge>
                  ) : status === 'pending' ? (
                    <Badge variant="secondary" className="gap-1 text-xs text-amber-600 bg-amber-500/10">
                      <Clock className="w-3 h-3" />
                      Pending
                    </Badge>
                  ) : status === 'cancelled' ? (
                    <Badge variant="outline" className="gap-1 text-xs text-destructive bg-destructive/10">
                      <XCircle className="w-3 h-3" />
                      Cancelled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-xs">
                      Added
                    </Badge>
                  )}

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      {/* Added - needs initial invite */}
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

                      {/* Pending - can resend or cancel */}
                      {status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
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

                      {/* Cancelled - can re-invite */}
                      {status === 'cancelled' && (
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
                                Re-invite
                              </>
                            )}
                          </Button>
                        </>
                      )}

                      {/* Accepted - manage permissions */}
                      {status === 'accepted' && participant.user_id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openPermissions(participant)}
                          className="h-7 text-xs"
                          title="Manage permissions"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Permissions</span>
                        </Button>
                      )}

                      {/* Pre-invite permissions for non-accepted participants */}
                      {status !== 'accepted' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPermissionsParticipant(participant)}
                          className="h-7 text-xs"
                          title="Pre-configure permissions"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Permissions</span>
                        </Button>
                      )}

                      {/* CRM permission toggle */}
                      <Button
                        size="sm"
                        variant={participant.can_add_to_crm ? "secondary" : "ghost"}
                        onClick={() => toggleCanAddToCRM(participant.id, participant.can_add_to_crm)}
                        className="h-7 text-xs"
                        title={participant.can_add_to_crm ? "Disable CRM sharing" : "Enable CRM sharing"}
                      >
                        <BookUser className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">CRM</span>
                        {participant.can_add_to_crm && <CheckCircle className="w-2.5 h-2.5 ml-1 text-emerald-500" />}
                      </Button>

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

                  {/* Non-admin: Add to my CRM button (if permission granted and not self) */}
                  {!isAdmin && currentUserParticipant?.can_add_to_crm && participant.user_id !== currentUserId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addParticipantToMyCRM(participant)}
                      className="h-7 text-xs"
                      title="Add to my CRM"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Add to </span>CRM
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Card>

      {/* Unified Permissions Dialog */}
      {permissionsParticipant && (
        <DealRoomParticipantPermissions
          participantId={permissionsParticipant.id}
          dealRoomId={dealRoomId}
          userId={permissionsParticipant.user_id}
          userEmail={permissionsParticipant.email}
          userName={permissionsParticipant.name}
          open={!!permissionsParticipant}
          onOpenChange={(open) => {
            if (!open) {
              setPermissionsParticipant(null);
            }
          }}
        />
      )}

      {/* Display Name Editor Dialog */}
      {displayEditParticipant && (
        <ParticipantDisplayEditor
          participantId={displayEditParticipant.id}
          currentName={displayEditParticipant.name}
          currentDisplayMode={(displayEditParticipant.display_mode as any) || 'full_name'}
          currentDisplayOverride={displayEditParticipant.display_name_override}
          currentWalletAddress={displayEditParticipant.wallet_address}
          currentCompanyName={displayEditParticipant.company_display_name}
          open={!!displayEditParticipant}
          onOpenChange={(open) => {
            if (!open) {
              setDisplayEditParticipant(null);
            }
          }}
          onSaved={fetchParticipants}
        />
      )}
    </div>
  );
};
