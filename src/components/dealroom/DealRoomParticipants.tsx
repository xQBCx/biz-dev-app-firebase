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
  Trash2
} from "lucide-react";

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

interface DealRoomParticipantsProps {
  dealRoomId: string;
  isAdmin: boolean;
}

export const DealRoomParticipants = ({ dealRoomId, isAdmin }: DealRoomParticipantsProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, [dealRoomId]);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from("deal_room_participants")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setParticipants(data || []);
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

  const sendInvitation = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from("deal_room_participants")
        .update({ invitation_sent_at: new Date().toISOString() })
        .eq("id", participantId);

      if (error) throw error;
      toast.success("Invitation sent");
      fetchParticipants();
    } catch (error) {
      toast.error("Failed to send invitation");
    }
  };

  const removeParticipant = async (participantId: string, participantName: string) => {
    if (!confirm(`Remove ${participantName} from this deal room?`)) return;
    
    try {
      const { error } = await supabase
        .from("deal_room_participants")
        .delete()
        .eq("id", participantId);

      if (error) throw error;
      toast.success(`${participantName} removed`);
      fetchParticipants();
    } catch (error) {
      toast.error("Failed to remove participant");
    }
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
    <div className="space-y-6">
      {isAdmin && (
        <Card className="p-4">
          <div className="flex gap-3">
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
            <Button onClick={addParticipant} disabled={adding}>
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
          participants.map((participant) => (
            <div key={participant.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-muted">
                  {participant.is_company ? (
                    <Building2 className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {participant.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {participant.has_submitted_contribution && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Submitted
                  </Badge>
                )}
                
                {participant.contribution_visible_to_others ? (
                  <Badge variant="secondary" className="gap-1">
                    <Eye className="w-3 h-3" />
                    Visible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <EyeOff className="w-3 h-3" />
                    Private
                  </Badge>
                )}

                {participant.invitation_accepted_at ? (
                  <Badge className="bg-emerald-500/20 text-emerald-600 gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Joined
                  </Badge>
                ) : participant.invitation_sent_at ? (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="w-3 h-3" />
                    Invited
                  </Badge>
                ) : isAdmin ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendInvitation(participant.id)}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send Invite
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Pending
                  </Badge>
                )}

                {isAdmin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeParticipant(participant.id, participant.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
