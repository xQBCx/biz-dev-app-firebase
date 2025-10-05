import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip, Sparkles } from "lucide-react";

type EmailIdentity = {
  id: string;
  email: string;
  display_name: string | null;
};

type ComposeEmailProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  to?: string;
  subject?: string;
};

export const ComposeEmail = ({ open, onOpenChange, to = "", subject = "" }: ComposeEmailProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [identities, setIdentities] = useState<EmailIdentity[]>([]);
  const [selectedIdentity, setSelectedIdentity] = useState<string>("");
  const [toEmail, setToEmail] = useState(to);
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState(subject);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showAiAssist, setShowAiAssist] = useState(false);

  useEffect(() => {
    if (user && open) {
      loadIdentities();
    }
  }, [user, open]);

  useEffect(() => {
    setToEmail(to);
    setEmailSubject(subject);
  }, [to, subject]);

  const loadIdentities = async () => {
    const { data, error } = await supabase
      .from("email_identities")
      .select("id, email, display_name")
      .eq("user_id", user?.id)
      .eq("is_active", true)
      .order("is_primary", { ascending: false });

    if (error) {
      console.error("Error loading identities:", error);
      return;
    }

    setIdentities(data || []);
    if (data && data.length > 0 && !selectedIdentity) {
      setSelectedIdentity(data[0].id);
    }
  };

  const handleSend = async () => {
    if (!toEmail || !emailSubject || !body) {
      toast({
        title: "Missing fields",
        description: "Please fill in To, Subject, and Message fields",
        variant: "destructive",
      });
      return;
    }

    if (!selectedIdentity) {
      toast({
        title: "No email identity",
        description: "Please connect an email account in Integrations",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          identityId: selectedIdentity,
          to: toEmail.split(",").map(e => e.trim()),
          cc: ccEmail ? ccEmail.split(",").map(e => e.trim()) : [],
          bcc: bccEmail ? bccEmail.split(",").map(e => e.trim()) : [],
          subject: emailSubject,
          body: body,
        },
      });

      if (error) throw error;

      toast({
        title: "Email sent",
        description: data.note || "Your email has been sent successfully",
      });

      // Reset form
      setToEmail("");
      setCcEmail("");
      setBccEmail("");
      setEmailSubject("");
      setBody("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Error sending email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleAiDraft = async () => {
    // TODO: Implement AI draft generation
    toast({
      title: "AI Draft",
      description: "AI email drafting will be available soon",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* From */}
          <div>
            <Label>From</Label>
            {identities.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">
                No email accounts connected. Go to{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => onOpenChange(false)}>
                  Integrations
                </Button>{" "}
                to add one.
              </p>
            ) : (
              <Select value={selectedIdentity} onValueChange={setSelectedIdentity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {identities.map((identity) => (
                    <SelectItem key={identity.id} value={identity.id}>
                      {identity.display_name ? `${identity.display_name} <${identity.email}>` : identity.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* To */}
          <div>
            <Label>To</Label>
            <Input
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>

          {/* CC */}
          <div>
            <Label>CC (optional)</Label>
            <Input
              value={ccEmail}
              onChange={(e) => setCcEmail(e.target.value)}
              placeholder="cc@example.com"
            />
          </div>

          {/* BCC */}
          <div>
            <Label>BCC (optional)</Label>
            <Input
              value={bccEmail}
              onChange={(e) => setBccEmail(e.target.value)}
              placeholder="bcc@example.com"
            />
          </div>

          {/* Subject */}
          <div>
            <Label>Subject</Label>
            <Input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Message</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAiDraft}
                disabled={!emailSubject && !toEmail}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Draft
              </Button>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
              rows={12}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" disabled={isSending}>
              <Paperclip className="mr-2 h-4 w-4" />
              Attach Files
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={isSending || identities.length === 0}>
                <Send className="mr-2 h-4 w-4" />
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};