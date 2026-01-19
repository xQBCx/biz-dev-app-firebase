import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Users, Mail, Phone, GitMerge, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  notes?: string;
  alternate_emails?: string[];
  created_at: string;
}

interface CRMContactMergeProps {
  contacts: Contact[];
  onMergeComplete: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CRMContactMerge = ({ contacts, onMergeComplete, open, onOpenChange }: CRMContactMergeProps) => {
  const [primaryContactId, setPrimaryContactId] = useState<string>(contacts[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleMerge = async () => {
    if (!primaryContactId || contacts.length < 2) {
      toast.error("Please select a primary contact and have at least 2 contacts to merge");
      return;
    }

    setIsLoading(true);
    try {
      const primaryContact = contacts.find(c => c.id === primaryContactId);
      const secondaryContacts = contacts.filter(c => c.id !== primaryContactId);
      
      if (!primaryContact) {
        throw new Error("Primary contact not found");
      }

      // Collect all unique emails from all contacts
      const allEmails = new Set<string>();
      contacts.forEach(contact => {
        if (contact.email) allEmails.add(contact.email.toLowerCase());
        contact.alternate_emails?.forEach(email => allEmails.add(email.toLowerCase()));
      });
      
      // Remove primary email from alternate emails
      allEmails.delete(primaryContact.email.toLowerCase());
      
      // Merge notes
      const mergedNotes = contacts
        .map(c => c.notes)
        .filter(Boolean)
        .join("\n\n---\n\n");

      // Update primary contact with merged data
      const { error: updateError } = await supabase
        .from("crm_contacts")
        .update({
          alternate_emails: Array.from(allEmails),
          notes: mergedNotes || primaryContact.notes,
          phone: primaryContact.phone || secondaryContacts.find(c => c.phone)?.phone,
        })
        .eq("id", primaryContactId);

      if (updateError) throw updateError;

      // Delete secondary contacts
      for (const contact of secondaryContacts) {
        const { error: deleteError } = await supabase
          .from("crm_contacts")
          .delete()
          .eq("id", contact.id);

        if (deleteError) {
          console.error("Error deleting contact:", deleteError);
        }
      }

      toast.success(`Successfully merged ${contacts.length} contacts into one`);
      onMergeComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error merging contacts:", error);
      toast.error("Failed to merge contacts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="w-5 h-5" />
            Merge Duplicate Contacts
          </DialogTitle>
          <DialogDescription>
            Select the primary contact to keep. All email addresses and notes will be merged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-600">
              {contacts.length} duplicate contacts found with the same or similar information
            </span>
          </div>

          <RadioGroup value={primaryContactId} onValueChange={setPrimaryContactId}>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <Card 
                  key={contact.id} 
                  className={`cursor-pointer transition-all ${
                    primaryContactId === contact.id 
                      ? "ring-2 ring-primary border-primary" 
                      : "hover:border-muted-foreground/40"
                  }`}
                  onClick={() => setPrimaryContactId(contact.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <RadioGroupItem value={contact.id} id={contact.id} className="mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={contact.id} className="text-lg font-semibold cursor-pointer">
                            {contact.first_name} {contact.last_name}
                          </Label>
                          {primaryContactId === contact.id && (
                            <Badge variant="default" className="text-xs">Primary</Badge>
                          )}
                        </div>
                        
                        <div className="grid gap-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span>{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.alternate_emails && contact.alternate_emails.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <Users className="w-3 h-3" />
                              <span className="text-xs">Alt emails: {contact.alternate_emails.join(", ")}</span>
                            </div>
                          )}
                        </div>
                        
                        {contact.notes && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                            {contact.notes}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground/60">
                          Created: {new Date(contact.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleMerge} disabled={isLoading || !primaryContactId}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <GitMerge className="w-4 h-4 mr-2" />
                  Merge Contacts
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
