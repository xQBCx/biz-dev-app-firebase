import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Radio, 
  Send, 
  Users, 
  Mail,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { XEvent, XEventRegistration } from "@/hooks/useXEvents";

interface XEventBroadcastIntegrationProps {
  event: XEvent;
  registrations: XEventRegistration[];
}

type BroadcastType = 'announcement' | 'reminder' | 'update' | 'follow_up';

interface BroadcastLog {
  id: string;
  type: BroadcastType;
  subject: string;
  sentAt: string;
  recipientCount: number;
}

export const XEventBroadcastIntegration = ({ event, registrations }: XEventBroadcastIntegrationProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [broadcasts, setBroadcasts] = useState<BroadcastLog[]>([]);
  
  const [formData, setFormData] = useState({
    type: 'announcement' as BroadcastType,
    subject: '',
    message: '',
    targetAudience: 'all' as 'all' | 'confirmed' | 'pending' | 'checked_in',
  });

  const getRecipientCount = () => {
    switch (formData.targetAudience) {
      case 'confirmed':
        return registrations.filter(r => r.status === 'confirmed').length;
      case 'pending':
        return registrations.filter(r => r.status === 'pending').length;
      case 'checked_in':
        return registrations.filter(r => r.status === 'checked_in').length;
      default:
        return registrations.length;
    }
  };

  const generateContent = async () => {
    setIsGenerating(true);

    try {
      const templates: Record<BroadcastType, { subject: string; message: string }> = {
        announcement: {
          subject: `Important Update: ${event.name}`,
          message: `Dear Attendee,\n\nWe have an exciting announcement regarding ${event.name}!\n\n[Your announcement here]\n\nWe look forward to seeing you there.\n\nBest regards,\nThe ${event.name} Team`
        },
        reminder: {
          subject: `Reminder: ${event.name} is Coming Up!`,
          message: `Dear Attendee,\n\nThis is a friendly reminder that ${event.name} is just around the corner!\n\n📅 Date: ${new Date(event.start_date).toLocaleDateString()}\n⏰ Time: ${new Date(event.start_date).toLocaleTimeString()}\n${event.is_virtual ? '💻 Virtual Event' : `📍 Location: ${event.venue_name || event.venue_city}`}\n\nDon't forget to:\n• Add the event to your calendar\n• Prepare any questions you might have\n• Join a few minutes early\n\nSee you there!\n\nBest regards,\nThe ${event.name} Team`
        },
        update: {
          subject: `Update: ${event.name}`,
          message: `Dear Attendee,\n\nWe wanted to keep you informed about the latest updates for ${event.name}.\n\n[Your update details here]\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nThe ${event.name} Team`
        },
        follow_up: {
          subject: `Thank You for Attending ${event.name}!`,
          message: `Dear Attendee,\n\nThank you for joining us at ${event.name}! We hope you found it valuable.\n\nHere are some follow-up resources:\n• [Link to recordings/materials]\n• [Feedback survey link]\n• [Next steps or upcoming events]\n\nWe'd love to hear your thoughts! Please take a moment to share your feedback.\n\nThank you again for your participation!\n\nBest regards,\nThe ${event.name} Team`
        },
      };

      const template = templates[formData.type];
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        message: template.message,
      }));

      toast.success("Content generated!");
    } catch (err) {
      console.error("Error generating content:", err);
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!user || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSending(true);

    try {
      // Filter recipients based on target audience
      let recipients = registrations;
      if (formData.targetAudience === 'confirmed') {
        recipients = registrations.filter(r => r.status === 'confirmed');
      } else if (formData.targetAudience === 'pending') {
        recipients = registrations.filter(r => r.status === 'pending');
      } else if (formData.targetAudience === 'checked_in') {
        recipients = registrations.filter(r => r.status === 'checked_in');
      }

      // Log the broadcast
      const { error } = await supabase
        .from('broadcast_interactions')
        .insert({
          user_id: user.id,
          segment_id: event.id, // Use event ID as segment reference
          interaction_type: 'event_broadcast',
          question: formData.subject,
          response: formData.message,
          metadata: {
            event_id: event.id,
            event_name: event.name,
            broadcast_type: formData.type,
            target_audience: formData.targetAudience,
            recipient_count: recipients.length,
            recipient_emails: recipients.map(r => r.email),
          },
        });

      if (error) throw error;

      // Add to local broadcasts list
      setBroadcasts(prev => [{
        id: Date.now().toString(),
        type: formData.type,
        subject: formData.subject,
        sentAt: new Date().toISOString(),
        recipientCount: recipients.length,
      }, ...prev]);

      toast.success(`Broadcast sent to ${recipients.length} recipients!`);
      setIsOpen(false);
      setFormData({
        type: 'announcement',
        subject: '',
        message: '',
        targetAudience: 'all',
      });
    } catch (err: any) {
      console.error("Error sending broadcast:", err);
      toast.error(err.message || "Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  const typeLabels: Record<BroadcastType, { label: string; icon: typeof Mail }> = {
    announcement: { label: 'Announcement', icon: Radio },
    reminder: { label: 'Reminder', icon: Clock },
    update: { label: 'Update', icon: MessageSquare },
    follow_up: { label: 'Follow Up', icon: Mail },
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Broadcast Outreach</h3>
            <p className="text-sm text-muted-foreground">
              Send communications to {registrations.length} registrants
            </p>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={registrations.length === 0}>
              <Send className="w-4 h-4" />
              New Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Create Broadcast
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Broadcast Type</Label>
                  <Select 
                    value={formData.type}
                    onValueChange={(value: BroadcastType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">📢 Announcement</SelectItem>
                      <SelectItem value="reminder">⏰ Reminder</SelectItem>
                      <SelectItem value="update">📝 Update</SelectItem>
                      <SelectItem value="follow_up">📧 Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select 
                    value={formData.targetAudience}
                    onValueChange={(value: any) => setFormData({ ...formData, targetAudience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Registrants ({registrations.length})</SelectItem>
                      <SelectItem value="confirmed">Confirmed Only ({registrations.filter(r => r.status === 'confirmed').length})</SelectItem>
                      <SelectItem value="pending">Pending Only ({registrations.filter(r => r.status === 'pending').length})</SelectItem>
                      <SelectItem value="checked_in">Checked In ({registrations.filter(r => r.status === 'checked_in').length})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Subject</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={generateContent}
                    disabled={isGenerating}
                    className="gap-1 text-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isGenerating ? 'Generating...' : 'AI Generate'}
                  </Button>
                </div>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter subject line"
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message..."
                  rows={8}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="gap-1">
                  <Users className="w-3 h-3" />
                  {getRecipientCount()} Recipients
                </Badge>
                <Button 
                  onClick={handleSend}
                  disabled={isSending || !formData.subject || !formData.message}
                  className="gap-2"
                >
                  {isSending ? 'Sending...' : 'Send Broadcast'}
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recent Broadcasts */}
      {broadcasts.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Recent Broadcasts</p>
          <div className="space-y-2">
            {broadcasts.slice(0, 3).map(broadcast => (
              <div 
                key={broadcast.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium truncate max-w-[200px]">{broadcast.subject}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {broadcast.recipientCount} sent
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
