import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Handshake, 
  Users, 
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { XEvent, XEventParticipant } from "@/hooks/useXEvents";

interface XEventDealRoomSpawnerProps {
  event: XEvent;
  participants: XEventParticipant[];
}

export const XEventDealRoomSpawner = ({ event, participants }: XEventDealRoomSpawnerProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [dealRoomId, setDealRoomId] = useState<string | null>(event.deal_room_id || null);
  
  const [formData, setFormData] = useState({
    name: `${event.name} - Partnership Deal`,
    description: `Deal room spawned from event: ${event.name}`,
    dealType: 'partnership' as string,
    selectedParticipants: [] as string[],
  });

  const sponsors = participants.filter(p => p.role === 'sponsor');
  const speakers = participants.filter(p => p.role === 'speaker');
  const organizers = participants.filter(p => p.role === 'organizer' || p.role === 'co_organizer');

  const handleCreateDealRoom = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsCreating(true);

    try {
      // Create the deal room
      const { data: dealRoom, error: dealRoomError } = await supabase
        .from('deal_rooms')
        .insert({
          name: formData.name,
          description: formData.description,
          created_by: user.id,
          category: 'services' as const,
        })
        .select()
        .single();

      if (dealRoomError) throw dealRoomError;

      // Add creator as participant
      await supabase
        .from('deal_room_participants')
        .insert([{
          deal_room_id: dealRoom.id,
          user_id: user.id,
          email: user.email || '',
          name: 'Organizer',
          role_type: 'creator',
        }]);

      // Add selected participants
      for (const participantId of formData.selectedParticipants) {
        const participant = participants.find(p => p.id === participantId);
        if (participant && participant.email) {
          await supabase
            .from('deal_room_participants')
            .insert([{
              deal_room_id: dealRoom.id,
              email: participant.email,
              name: participant.display_name || participant.company || 'Participant',
              company_display_name: participant.company,
              role_type: 'participant',
            }]);
        }
      }

      // Link deal room to event
      await supabase
        .from('xevents')
        .update({ deal_room_id: dealRoom.id })
        .eq('id', event.id);

      setDealRoomId(dealRoom.id);
      toast.success("Deal Room created successfully!");
      setIsOpen(false);
    } catch (err: any) {
      console.error("Error creating deal room:", err);
      toast.error(err.message || "Failed to create deal room");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleParticipant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedParticipants: prev.selectedParticipants.includes(id)
        ? prev.selectedParticipants.filter(p => p !== id)
        : [...prev.selectedParticipants, id]
    }));
  };

  if (dealRoomId) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold">Deal Room Active</h3>
              <p className="text-sm text-muted-foreground">
                Collaboration space is ready for this event
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate(`/deal-rooms/${dealRoomId}`)}
          >
            Open Deal Room
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Handshake className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Deal Room Integration</h3>
            <p className="text-sm text-muted-foreground">
              Spawn a Deal Room for event partnerships
            </p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Create Deal Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5" />
                Spawn Deal Room from Event
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Deal Room Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter deal room name"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the partnership opportunity..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Deal Type</Label>
                <Select 
                  value={formData.dealType}
                  onValueChange={(value) => setFormData({ ...formData, dealType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="sponsorship">Sponsorship</SelectItem>
                    <SelectItem value="joint_venture">Joint Venture</SelectItem>
                    <SelectItem value="licensing">Licensing</SelectItem>
                    <SelectItem value="revenue_share">Revenue Share</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Participant Selection */}
              <div className="space-y-2">
                <Label>Add Participants from Event</Label>
                <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                  {sponsors.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Sponsors</p>
                      {sponsors.map(p => (
                        <button
                          key={p.id}
                          onClick={() => toggleParticipant(p.id)}
                          className={`w-full flex items-center justify-between p-2 rounded hover:bg-muted/50 ${
                            formData.selectedParticipants.includes(p.id) ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-medium text-sm">{p.display_name || p.company}</p>
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                          </div>
                          {formData.selectedParticipants.includes(p.id) && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {speakers.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Speakers</p>
                      {speakers.map(p => (
                        <button
                          key={p.id}
                          onClick={() => toggleParticipant(p.id)}
                          className={`w-full flex items-center justify-between p-2 rounded hover:bg-muted/50 ${
                            formData.selectedParticipants.includes(p.id) ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-medium text-sm">{p.display_name || p.company}</p>
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                          </div>
                          {formData.selectedParticipants.includes(p.id) && (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {sponsors.length === 0 && speakers.length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      No sponsors or speakers to add
                    </p>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleCreateDealRoom}
                disabled={isCreating}
                className="w-full gap-2"
              >
                {isCreating ? 'Creating...' : 'Create Deal Room'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};
