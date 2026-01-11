import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  User, 
  Target,
  MessageSquare,
  FileVideo,
  Check
} from "lucide-react";

export function TalentMatching() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedInitiative, setSelectedInitiative] = useState<string>("");

  const { data: initiatives = [] } = useQuery({
    queryKey: ["talent-initiatives", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talent_initiatives")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "active");
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["talent-contacts-for-matching", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("*")
        .eq("user_id", user?.id)
        .not("talent_type", "is", null);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: existingMatches = [] } = useQuery({
    queryKey: ["talent-matches", user?.id, selectedInitiative],
    queryFn: async () => {
      const query = supabase
        .from("talent_initiative_matches")
        .select("*, crm_contacts(*), talent_initiatives(*)")
        .eq("user_id", user?.id);
      
      if (selectedInitiative) {
        query.eq("initiative_id", selectedInitiative);
      }
      
      const { data, error } = await query.order("match_score", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const matchMutation = useMutation({
    mutationFn: async ({ initiativeId, contactId }: { initiativeId: string; contactId: string }) => {
      // Call edge function to generate match analysis
      const response = await supabase.functions.invoke("talent-match", {
        body: { initiativeId, contactId },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-matches"] });
      toast.success("Match created with AI analysis!");
    },
    onError: (error) => {
      toast.error("Failed to create match: " + error.message);
    },
  });

  const autoMatchMutation = useMutation({
    mutationFn: async (initiativeId: string) => {
      const response = await supabase.functions.invoke("talent-auto-match", {
        body: { initiativeId },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["talent-matches"] });
      toast.success(`Found ${data.matchesCreated} potential matches!`);
    },
    onError: (error) => {
      toast.error("Auto-match failed: " + error.message);
    },
  });

  const selectedInitiativeData = initiatives.find((i: any) => i.id === selectedInitiative);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Matching Engine</h2>
          <p className="text-sm text-muted-foreground">
            Match talent profiles to your initiatives with AI-powered analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedInitiative} onValueChange={setSelectedInitiative}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select initiative" />
            </SelectTrigger>
            <SelectContent>
              {initiatives.map((init: any) => (
                <SelectItem key={init.id} value={init.id}>
                  {init.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedInitiative && (
            <Button 
              className="gap-2"
              onClick={() => autoMatchMutation.mutate(selectedInitiative)}
              disabled={autoMatchMutation.isPending}
            >
              {autoMatchMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Auto-Match All
            </Button>
          )}
        </div>
      </div>

      {!selectedInitiative ? (
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select an initiative to view and create matches</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Talent */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Available Talent
              </CardTitle>
              <CardDescription>
                Click to create a match with {selectedInitiativeData?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {contacts.filter((c: any) => 
                !existingMatches.some((m: any) => m.contact_id === c.id)
              ).map((contact: any) => (
                <div 
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => matchMutation.mutate({ 
                    initiativeId: selectedInitiative, 
                    contactId: contact.id 
                  })}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {contact.talent_type}
                      </p>
                    </div>
                  </div>
                  {matchMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
              {contacts.filter((c: any) => 
                !existingMatches.some((m: any) => m.contact_id === c.id)
              ).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All talent has been matched
                </p>
              )}
            </CardContent>
          </Card>

          {/* Existing Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="h-4 w-4" />
                Matched Talent
              </CardTitle>
              <CardDescription>
                {existingMatches.length} matches for this initiative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {existingMatches.map((match: any) => (
                <div 
                  key={match.id}
                  className="p-3 rounded-lg border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {match.crm_contacts?.first_name} {match.crm_contacts?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {match.proposed_role || match.crm_contacts?.talent_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {match.match_score && (
                        <Badge variant="secondary">{match.match_score}%</Badge>
                      )}
                      <Badge variant={
                        match.status === "accepted" ? "default" :
                        match.status === "declined" ? "destructive" :
                        "outline"
                      }>
                        {match.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {match.match_reason && (
                    <p className="text-xs text-muted-foreground">
                      {match.match_reason}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="gap-1 flex-1">
                      <MessageSquare className="h-3 w-3" />
                      Outreach
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 flex-1">
                      <FileVideo className="h-3 w-3" />
                      Generate Vision
                    </Button>
                  </div>
                </div>
              ))}
              {existingMatches.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No matches yet. Click on talent to create a match.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
