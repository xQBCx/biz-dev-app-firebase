import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageCircleQuestion, Send, Bug, Lightbulb, Heart, HelpCircle } from "lucide-react";

interface PartnerFeedbackWidgetProps {
  partnerEmail?: string;
  partnerName?: string;
  partnerIntegrationId?: string;
  dealRoomId?: string;
}

const feedbackTypes = [
  { value: "issue", label: "Report Issue", icon: Bug, color: "text-destructive" },
  { value: "suggestion", label: "Suggestion", icon: Lightbulb, color: "text-amber-500" },
  { value: "praise", label: "Praise", icon: Heart, color: "text-pink-500" },
  { value: "question", label: "Question", icon: HelpCircle, color: "text-blue-500" },
];

export function PartnerFeedbackWidget({
  partnerEmail,
  partnerName,
  partnerIntegrationId,
  dealRoomId,
}: PartnerFeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    feedback_type: "question",
    subject: "",
    message: "",
    email: partnerEmail || "",
    name: partnerName || "",
  });

  const handleSubmit = async () => {
    if (!formData.subject || !formData.message || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("partner_feedback").insert([
        {
          partner_integration_id: partnerIntegrationId || null,
          deal_room_id: dealRoomId || null,
          feedback_type: formData.feedback_type,
          subject: formData.subject,
          message: formData.message,
          submitted_by_email: formData.email,
          submitted_by_name: formData.name || null,
          status: "new",
          priority: formData.feedback_type === "issue" ? "high" : "medium",
        },
      ]);

      if (error) throw error;

      toast.success("Feedback submitted! We'll get back to you soon.");
      setFormData({
        feedback_type: "question",
        subject: "",
        message: "",
        email: partnerEmail || "",
        name: partnerName || "",
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = feedbackTypes.find((t) => t.value === formData.feedback_type);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg border-2 hover:scale-105 transition-transform z-50 bg-background"
        >
          <MessageCircleQuestion className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5" />
            Send Feedback
          </SheetTitle>
          <SheetDescription>
            Have a question, found an issue, or want to share an idea? We'd love to hear from you.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Feedback Type Selection */}
          <div className="space-y-2">
            <Label>What type of feedback?</Label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={formData.feedback_type === type.value ? "default" : "outline"}
                  className="justify-start gap-2"
                  onClick={() => setFormData({ ...formData, feedback_type: type.value })}
                >
                  <type.icon className={`h-4 w-4 ${formData.feedback_type === type.value ? "" : type.color}`} />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Peter Holcomb"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="peter@optimoit.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder={
                formData.feedback_type === "issue"
                  ? "Brief description of the issue..."
                  : formData.feedback_type === "suggestion"
                  ? "Your suggestion title..."
                  : formData.feedback_type === "praise"
                  ? "What's working well..."
                  : "Your question..."
              }
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder={
                formData.feedback_type === "issue"
                  ? "Describe what happened, what you expected, and steps to reproduce..."
                  : formData.feedback_type === "suggestion"
                  ? "Tell us more about your idea and how it would help..."
                  : formData.feedback_type === "praise"
                  ? "We'd love to hear what you like about the platform..."
                  : "Ask your question and provide any relevant context..."
              }
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          {/* Priority Badge for Issues */}
          {formData.feedback_type === "issue" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="destructive" className="text-xs">High Priority</Badge>
              <span>Issues are automatically flagged for immediate attention</span>
            </div>
          )}

          {/* Alternative Contact */}
          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p>
              <strong>Need urgent help?</strong> Email{" "}
              <a href="mailto:bill@bdsrvs.com" className="text-primary underline">
                bill@bdsrvs.com
              </a>{" "}
              directly.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.subject || !formData.message || !formData.email}
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
