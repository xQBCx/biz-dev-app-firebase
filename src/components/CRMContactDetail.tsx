import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Link } from "lucide-react";
import { CRMContactNotes } from "./CRMContactNotes";
import { XODIAKRelationshipView } from "./xodiak/XODIAKRelationshipView";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  lead_status?: string;
  lead_source?: string;
  address?: string;
  city?: string;
  state?: string;
  notes?: string;
  alternate_emails?: string[];
  primary_email_for_outreach?: string;
  created_at: string;
}

interface CRMContactDetailProps {
  contactId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

export const CRMContactDetail = ({ contactId, onEdit, onBack }: CRMContactDetailProps) => {
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContact();
  }, [contactId]);

  const loadContact = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("*")
        .eq("id", contactId)
        .single();

      if (error) throw error;
      setContact(data);
    } catch (error) {
      console.error("Error loading contact:", error);
      toast.error("Failed to load contact");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const { error } = await supabase
        .from("crm_contacts")
        .delete()
        .eq("id", contactId);

      if (error) throw error;

      toast.success("Contact deleted successfully");
      if (onBack) onBack();
      else navigate("/crm");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!contact) {
    return <div className="text-center p-8">Contact not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack || (() => navigate("/crm"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-3xl font-bold mb-6">
          {contact.first_name} {contact.last_name}
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Email {contact.primary_email_for_outreach && "(Primary for outreach)"}
                </p>
                <p className="font-medium">{contact.email}</p>
                {contact.alternate_emails && contact.alternate_emails.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-muted-foreground">Additional emails:</p>
                    {contact.alternate_emails.map((altEmail, idx) => (
                      <p key={idx} className="text-sm flex items-center gap-1">
                        {altEmail}
                        {contact.primary_email_for_outreach === altEmail && (
                          <span className="text-xs text-primary">(primary for outreach)</span>
                        )}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {contact.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{contact.phone}</p>
                </div>
              </div>
            )}

            {(contact.address || contact.city || contact.state) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {contact.address && <>{contact.address}<br /></>}
                    {contact.city && contact.state && `${contact.city}, ${contact.state}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {contact.title && (
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{contact.title}</p>
              </div>
            )}

            {contact.department && (
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{contact.department}</p>
              </div>
            )}

            {contact.lead_status && (
              <div>
                <p className="text-sm text-muted-foreground">Lead Status</p>
                <p className="font-medium capitalize">{contact.lead_status}</p>
              </div>
            )}

            {contact.lead_source && (
              <div>
                <p className="text-sm text-muted-foreground">Lead Source</p>
                <p className="font-medium">{contact.lead_source}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <CRMContactNotes contactId={contactId} />
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Created: {new Date(contact.created_at).toLocaleDateString()}
          </p>
        </div>
      </Card>

      {/* XODIAK Relationship Anchors */}
      <XODIAKRelationshipView contactId={contactId} limit={10} />
    </div>
  );
};
