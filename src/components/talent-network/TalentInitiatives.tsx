import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Plus, 
  Globe, 
  Target, 
  Users, 
  DollarSign,
  Loader2,
  ExternalLink,
  Droplets,
  Zap,
  Cpu,
  Building
} from "lucide-react";

const CATEGORIES = [
  { value: "clean_water", label: "Clean Water", icon: Droplets },
  { value: "clean_energy", label: "Clean Energy", icon: Zap },
  { value: "ai_tech", label: "AI Technology", icon: Cpu },
  { value: "infrastructure", label: "Infrastructure", icon: Building },
  { value: "other", label: "Other", icon: Target },
];

const TARGET_ROLES = [
  "influencer",
  "professional",
  "executive",
  "ambassador",
  "advisor",
];

const COMPENSATION_TYPES = [
  { value: "equity", label: "Equity" },
  { value: "revenue_share", label: "Revenue Share" },
  { value: "salary", label: "Salary" },
  { value: "sweat_equity", label: "Sweat Equity" },
  { value: "stock_options", label: "Stock Options" },
];

export function TalentInitiatives() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newInitiative, setNewInitiative] = useState({
    name: "",
    description: "",
    website_url: "",
    category: "",
    target_roles: [] as string[],
    compensation_types: [] as string[],
  });

  const { data: initiatives = [], isLoading } = useQuery({
    queryKey: ["talent-initiatives", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talent_initiatives")
        .select("*, talent_initiative_matches(count)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addInitiativeMutation = useMutation({
    mutationFn: async (initiative: typeof newInitiative) => {
      const { error } = await supabase
        .from("talent_initiatives")
        .insert({
          ...initiative,
          user_id: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-initiatives"] });
      setIsAddOpen(false);
      setNewInitiative({
        name: "",
        description: "",
        website_url: "",
        category: "",
        target_roles: [],
        compensation_types: [],
      });
      toast.success("Initiative created!");
    },
    onError: (error) => {
      toast.error("Failed to create: " + error.message);
    },
  });

  const toggleRole = (role: string) => {
    setNewInitiative((prev) => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter((r) => r !== role)
        : [...prev.target_roles, role],
    }));
  };

  const toggleCompensation = (type: string) => {
    setNewInitiative((prev) => ({
      ...prev,
      compensation_types: prev.compensation_types.includes(type)
        ? prev.compensation_types.filter((t) => t !== type)
        : [...prev.compensation_types, type],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Your Initiatives</h2>
          <p className="text-sm text-muted-foreground">
            Define projects and opportunities to match talent to
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Initiative
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Initiative</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-4 py-4">
                <div>
                  <Label>Initiative Name</Label>
                  <Input
                    value={newInitiative.name}
                    onChange={(e) => setNewInitiative({ ...newInitiative, name: e.target.value })}
                    placeholder="e.g., SineLabs.net Ambassador Program"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newInitiative.description}
                    onChange={(e) => setNewInitiative({ ...newInitiative, description: e.target.value })}
                    placeholder="What is this initiative about?"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Website URL</Label>
                  <Input
                    value={newInitiative.website_url}
                    onChange={(e) => setNewInitiative({ ...newInitiative, website_url: e.target.value })}
                    placeholder="https://sinelabs.net"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newInitiative.category}
                    onValueChange={(v) => setNewInitiative({ ...newInitiative, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-2 block">Target Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {TARGET_ROLES.map((role) => (
                      <div key={role} className="flex items-center gap-2">
                        <Checkbox
                          checked={newInitiative.target_roles.includes(role)}
                          onCheckedChange={() => toggleRole(role)}
                        />
                        <span className="text-sm capitalize">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Compensation Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {COMPENSATION_TYPES.map((comp) => (
                      <div key={comp.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={newInitiative.compensation_types.includes(comp.value)}
                          onCheckedChange={() => toggleCompensation(comp.value)}
                        />
                        <span className="text-sm">{comp.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => addInitiativeMutation.mutate(newInitiative)}
                  disabled={!newInitiative.name || addInitiativeMutation.isPending}
                >
                  {addInitiativeMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Create Initiative
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : initiatives.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No initiatives yet. Create projects like SineLabs.net or Infinity Force Grid OS to match talent.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initiatives.map((initiative: any) => {
            const catConfig = CATEGORIES.find((c) => c.value === initiative.category);
            const CatIcon = catConfig?.icon || Target;
            const matchCount = initiative.talent_initiative_matches?.[0]?.count || 0;

            return (
              <Card key={initiative.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CatIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{initiative.name}</CardTitle>
                        {initiative.website_url && (
                          <a 
                            href={initiative.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" />
                            {new URL(initiative.website_url).hostname}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <Badge variant={initiative.status === "active" ? "default" : "secondary"}>
                      {initiative.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {initiative.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {initiative.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {initiative.target_roles?.map((role: string) => (
                      <Badge key={role} variant="outline" className="text-xs capitalize">
                        <Users className="h-3 w-3 mr-1" />
                        {role}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {initiative.compensation_types?.map((type: string) => (
                      <Badge key={type} variant="outline" className="text-xs bg-green-500/10 text-green-700">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {type.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      {matchCount} matched talent
                    </span>
                    <Button variant="outline" size="sm">
                      View Matches
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
