import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, Link, User, Loader2 } from "lucide-react";

interface Proposal {
  id: string;
  title: string;
  status: string;
}

interface DealRoom {
  id: string;
  name: string;
  status: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface InvitationAssetLinkerProps {
  linkedProposalId?: string;
  linkedDealRoomId?: string;
  fromContactId?: string;
  redirectTo?: string;
  introductionNote?: string;
  onProposalChange: (id: string | undefined) => void;
  onDealRoomChange: (id: string | undefined) => void;
  onContactChange: (id: string | undefined) => void;
  onRedirectChange: (path: string) => void;
  onNoteChange: (note: string) => void;
}

export const InvitationAssetLinker = ({
  linkedProposalId,
  linkedDealRoomId,
  fromContactId,
  redirectTo = "",
  introductionNote = "",
  onProposalChange,
  onDealRoomChange,
  onContactChange,
  onRedirectChange,
  onNoteChange,
}: InvitationAssetLinkerProps) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAssets();
    }
  }, [user]);

  const loadAssets = async () => {
    try {
      const [proposalsRes, dealRoomsRes, contactsRes] = await Promise.all([
        supabase
          .from("generated_proposals")
          .select("id, title, status")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("deal_rooms")
          .select("id, name, status")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("crm_contacts")
          .select("id, first_name, last_name, email")
          .eq("user_id", user?.id)
          .order("first_name", { ascending: true })
          .limit(100),
      ]);

      if (proposalsRes.data) setProposals(proposalsRes.data);
      if (dealRoomsRes.data) setDealRooms(dealRoomsRes.data);
      if (contactsRes.data) setContacts(contactsRes.data);
    } catch (error) {
      console.error("Error loading assets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Link className="w-4 h-4" />
          Asset Linking & Attribution
        </CardTitle>
        <CardDescription className="text-xs">
          Link proposals, deal rooms, and track introductions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Link to Proposal */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <FileText className="w-3 h-3" />
            Link to Proposal
          </Label>
          <Select
            value={linkedProposalId || "none"}
            onValueChange={(value) => onProposalChange(value === "none" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a proposal to show on first login" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No proposal linked</SelectItem>
              {proposals.map((proposal) => (
                <SelectItem key={proposal.id} value={proposal.id}>
                  {proposal.title} ({proposal.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Link to Deal Room */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Briefcase className="w-3 h-3" />
            Link to Deal Room
          </Label>
          <Select
            value={linkedDealRoomId || "none"}
            onValueChange={(value) => onDealRoomChange(value === "none" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a deal room to add invitee to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No deal room linked</SelectItem>
              {dealRooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} ({room.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Attribution Contact (Facilitator) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <User className="w-3 h-3" />
            Introduction Facilitated By
          </Label>
          <Select
            value={fromContactId || "none"}
            onValueChange={(value) => onContactChange(value === "none" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Who made this introduction? (for XODIAK attribution)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Direct invitation (no facilitator)</SelectItem>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name} ({contact.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Redirect */}
        <div className="space-y-2">
          <Label className="text-sm">Custom Redirect Path (optional)</Label>
          <Input
            placeholder="/proposals/abc123 or /deal-rooms/xyz"
            value={redirectTo}
            onChange={(e) => onRedirectChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Where to redirect the user after they accept the invitation
          </p>
        </div>

        {/* Introduction Note */}
        <div className="space-y-2">
          <Label className="text-sm">Introduction Context (for XODIAK ledger)</Label>
          <Textarea
            placeholder="Notes about this introduction for the relationship ledger..."
            value={introductionNote}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};
