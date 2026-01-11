import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  UserPlus, 
  Search, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Globe, 
  Sparkles, 
  Loader2,
  User,
  Building2,
  Star
} from "lucide-react";

const TALENT_TYPES = [
  { value: "influencer", label: "Influencer", icon: Star },
  { value: "professional", label: "Professional", icon: User },
  { value: "executive", label: "Executive", icon: Building2 },
  { value: "ambassador", label: "Ambassador", icon: Globe },
  { value: "advisor", label: "Advisor", icon: Sparkles },
];

const LEARNING_STYLES = [
  { value: "audio", label: "Audio Overview" },
  { value: "video", label: "Video Overview" },
  { value: "slides", label: "Slide Deck" },
  { value: "infographic", label: "Infographic" },
  { value: "text", label: "Written Document" },
  { value: "flashcards", label: "Flashcards/Quiz" },
];

export function TalentProfiles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    talent_type: "",
    linkedin_url: "",
    instagram_url: "",
    youtube_url: "",
    preferred_learning_style: "",
    talent_notes: "",
  });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["talent-contacts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("*")
        .eq("user_id", user?.id)
        .not("talent_type", "is", null)
        .order("potential_match_score", { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addContactMutation = useMutation({
    mutationFn: async (contact: typeof newContact) => {
      const { error } = await supabase
        .from("crm_contacts")
        .insert({
          ...contact,
          user_id: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-contacts"] });
      setIsAddOpen(false);
      setNewContact({
        first_name: "",
        last_name: "",
        email: "",
        talent_type: "",
        linkedin_url: "",
        instagram_url: "",
        youtube_url: "",
        preferred_learning_style: "",
        talent_notes: "",
      });
      toast.success("Talent profile added!");
    },
    onError: (error) => {
      toast.error("Failed to add profile: " + error.message);
    },
  });

  const researchMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const response = await supabase.functions.invoke("talent-research", {
        body: { contactId },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-contacts"] });
      toast.success("Research completed!");
    },
    onError: (error) => {
      toast.error("Research failed: " + error.message);
    },
  });

  const filteredContacts = contacts.filter((c: any) => {
    const matchesSearch = 
      c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || c.talent_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search talent profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TALENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Talent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Talent Profile</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={newContact.first_name}
                      onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={newContact.last_name}
                      onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Talent Type</Label>
                  <Select
                    value={newContact.talent_type}
                    onValueChange={(v) => setNewContact({ ...newContact, talent_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TALENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={newContact.linkedin_url}
                    onChange={(e) => setNewContact({ ...newContact, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input
                    value={newContact.instagram_url}
                    onChange={(e) => setNewContact({ ...newContact, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <Label>YouTube URL</Label>
                  <Input
                    value={newContact.youtube_url}
                    onChange={(e) => setNewContact({ ...newContact, youtube_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div>
                  <Label>Preferred Learning Style</Label>
                  <Select
                    value={newContact.preferred_learning_style}
                    onValueChange={(v) => setNewContact({ ...newContact, preferred_learning_style: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How do they prefer info?" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEARNING_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={newContact.talent_notes}
                    onChange={(e) => setNewContact({ ...newContact, talent_notes: e.target.value })}
                    placeholder="Why are they a good fit?"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => addContactMutation.mutate(newContact)}
                  disabled={!newContact.first_name || !newContact.talent_type || addContactMutation.isPending}
                >
                  {addContactMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Add Talent Profile
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Talent Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredContacts.length === 0 ? (
      <Card className="py-12">
        <CardContent className="text-center text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No talent profiles found. Add influencers, professionals, or executives to match to your initiatives.</p>
        </CardContent>
      </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact: any) => {
            const typeConfig = TALENT_TYPES.find((t) => t.value === contact.talent_type);
            const TypeIcon = typeConfig?.icon || User;

            return (
              <Card key={contact.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {contact.first_name} {contact.last_name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {contact.email}
                        </CardDescription>
                      </div>
                    </div>
                    {contact.potential_match_score && (
                      <Badge variant="secondary" className="ml-2">
                        {contact.potential_match_score}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Badge variant="outline">{typeConfig?.label || contact.talent_type}</Badge>
                    {contact.preferred_learning_style && (
                      <Badge variant="outline" className="text-xs">
                        Prefers: {contact.preferred_learning_style}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Social Links */}
                  <div className="flex gap-2">
                    {contact.linkedin_url && (
                      <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                    {contact.instagram_url && (
                      <a href={contact.instagram_url} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                    {contact.youtube_url && (
                      <a href={contact.youtube_url} target="_blank" rel="noopener noreferrer">
                        <Youtube className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                  </div>

                  {contact.talent_notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {contact.talent_notes}
                    </p>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => researchMutation.mutate(contact.id)}
                    disabled={researchMutation.isPending}
                  >
                    {researchMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Research with AI
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
