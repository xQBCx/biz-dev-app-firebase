import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Send, Paperclip, Sparkles, Save, X, FileIcon } from "lucide-react";
import { RecipientSearchInput } from "@/components/RecipientSearchInput";
import { Input } from "@/components/ui/input";
import { formatFileSize, isFileSizeValid } from "@/lib/fileUtils";

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
  draftId?: string;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const ComposeEmail = ({ open, onOpenChange, to = "", subject = "", draftId }: ComposeEmailProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [identities, setIdentities] = useState<EmailIdentity[]>([]);
  const [selectedIdentity, setSelectedIdentity] = useState<string>("");
  const [toEmail, setToEmail] = useState(to);
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState(subject);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showAiAssist, setShowAiAssist] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(draftId);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (user && open) {
      loadIdentities();
      if (draftId) {
        loadDraft(draftId);
      }
    }
  }, [user, open, draftId]);

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

      // Delete draft if it exists
      if (currentDraftId) {
        await supabase
          .from("communications")
          .delete()
          .eq("id", currentDraftId);
      }

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
      setCurrentDraftId(undefined);
      setAttachments([]);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 50MB limit`,
          variant: "destructive",
        });
      } else {
        validFiles.push(file);
      }
    }
    
    setAttachments(prev => [...prev, ...validFiles]);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const loadDraft = async (draftId: string) => {
    try {
      const { data, error } = await supabase
        .from("communications")
        .select("*")
        .eq("id", draftId)
        .eq("is_draft", true)
        .single();

      if (error) throw error;
      if (data) {
        const metadata = data.metadata as any;
        setToEmail(metadata?.to || "");
        setCcEmail(metadata?.cc || "");
        setBccEmail(metadata?.bcc || "");
        setEmailSubject(data.subject || "");
        setBody(data.body || "");
        setSelectedIdentity(metadata?.identityId || "");
        setCurrentDraftId(draftId);
      }
    } catch (error: any) {
      console.error("Error loading draft:", error);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) return;

    setIsSavingDraft(true);
    try {
      const draftData = {
        user_id: user.id,
        communication_type: "email",
        subject: emailSubject || "No Subject",
        body: body,
        direction: "outbound",
        status: "draft",
        is_draft: true,
        metadata: {
          to: toEmail,
          cc: ccEmail,
          bcc: bccEmail,
          identityId: selectedIdentity,
        },
      };

      if (currentDraftId) {
        // Update existing draft
        const { error } = await supabase
          .from("communications")
          .update(draftData)
          .eq("id", currentDraftId);

        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from("communications")
          .insert([draftData])
          .select()
          .single();

        if (error) throw error;
        setCurrentDraftId(data.id);
      }

      toast({
        title: "Draft saved",
        description: "Your email has been saved as a draft",
      });
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error saving draft",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSavingDraft(false);
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
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => {
                    onOpenChange(false);
                    navigate("/integrations");
                  }}
                >
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
            <RecipientSearchInput
              value={toEmail}
              onChange={setToEmail}
              placeholder="recipient@example.com"
            />
          </div>

          {/* CC */}
          <div>
            <Label>CC (optional)</Label>
            <RecipientSearchInput
              value={ccEmail}
              onChange={setCcEmail}
              placeholder="cc@example.com"
            />
          </div>

          {/* BCC */}
          <div>
            <Label>BCC (optional)</Label>
            <RecipientSearchInput
              value={bccEmail}
              onChange={setBccEmail}
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

          {/* Attachments Display */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Attachments ({attachments.length})</Label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm"
                  >
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(file.size)})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
              />
              <Button 
                variant="outline" 
                disabled={isSending || isSavingDraft}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                Attach Files
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveDraft} 
                disabled={isSending || isSavingDraft || !user}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSavingDraft ? "Saving..." : "Save Draft"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending || isSavingDraft}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={isSending || isSavingDraft || identities.length === 0}>
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