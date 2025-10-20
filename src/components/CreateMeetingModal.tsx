import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Link as LinkIcon, Mail } from "lucide-react";

interface CreateMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactEmail?: string;
  contactName?: string;
  onSuccess?: () => void;
}

export const CreateMeetingModal = ({
  open,
  onOpenChange,
  contactEmail,
  contactName,
  onSuccess,
}: CreateMeetingModalProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    startDate: "",
    startTime: "",
    duration: "60",
    location: "",
    meetingLink: "",
    attendeeEmails: contactEmail || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);

      // Parse attendee emails
      const attendees = formData.attendeeEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      // Create activity in database
      const { data: activity, error: activityError } = await supabase
        .from('crm_activities')
        .insert({
          user_id: user.id,
          subject: formData.subject,
          description: formData.description,
          activity_type: 'meeting',
          status: 'scheduled',
          priority: 'medium',
          due_date: startDateTime.toISOString(),
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          location: formData.location || null,
          meeting_link: formData.meetingLink || null,
          attendee_emails: attendees,
        })
        .select()
        .single();

      if (activityError) throw activityError;

      // Get user profile for organizer info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Send meeting invites
      const { error: inviteError } = await supabase.functions.invoke('send-meeting-invite', {
        body: {
          activityId: activity.id,
          subject: formData.subject,
          description: formData.description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          location: formData.location,
          meetingLink: formData.meetingLink,
          organizerEmail: user.email,
          organizerName: profile?.full_name || user.email,
          attendeeEmails: attendees,
        },
      });

      if (inviteError) throw inviteError;

      toast.success("Meeting created and invites sent!");
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData({
        subject: "",
        description: "",
        startDate: "",
        startTime: "",
        duration: "60",
        location: "",
        meetingLink: "",
        attendeeEmails: "",
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error("Failed to create meeting");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Meeting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Meeting Title *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Weekly Sync"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Meeting agenda and details"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Conference Room A"
            />
          </div>

          <div>
            <Label htmlFor="meetingLink" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Meeting Link
            </Label>
            <Input
              id="meetingLink"
              type="url"
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="e.g., https://zoom.us/j/123456789"
            />
          </div>

          <div>
            <Label htmlFor="attendeeEmails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Attendees (comma-separated emails) *
            </Label>
            <Input
              id="attendeeEmails"
              value={formData.attendeeEmails}
              onChange={(e) => setFormData({ ...formData, attendeeEmails: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
              required
            />
            {contactName && (
              <p className="text-sm text-muted-foreground mt-1">
                Pre-filled with: {contactName}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create & Send Invites"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
