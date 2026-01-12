import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Building2 } from "lucide-react";
import { toast } from "sonner";

interface ExportToProspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  output: {
    id: string;
    title: string;
    output_type: string;
    content: any;
  };
  notebookId: string;
}

export function ExportToProspectDialog({
  open,
  onOpenChange,
  output,
  notebookId,
}: ExportToProspectDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedProspectId, setSelectedProspectId] = useState<string>("");
  const [newProspect, setNewProspect] = useState({
    company_name: "",
    slug: "",
  });

  const { data: prospects = [], isLoading: prospectsLoading } = useQuery({
    queryKey: ["prospects", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("prospects")
        .select("id, company_name, slug, status")
        .eq("owner_user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user && open,
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      let prospectId = selectedProspectId;

      // Create new prospect if needed
      if (mode === "new") {
        const slug = newProspect.slug || newProspect.company_name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        const { data: newProspectData, error: createError } = await supabase
          .from("prospects")
          .insert({
            company_name: newProspect.company_name,
            slug,
            owner_user_id: user.id,
            notebook_id: notebookId,
            status: "draft",
          })
          .select()
          .single();

        if (createError) throw createError;
        prospectId = newProspectData.id;
      }

      // Map output_type to media_type
      const mediaTypeMap: Record<string, string> = {
        audio_overview: "audio",
        video_script: "video",
        flashcards: "flashcards",
        quiz: "quiz",
        study_guide: "study_guide",
        briefing: "briefing",
        slides: "slides",
        infographic: "infographic",
        data_table: "data_table",
        mind_map: "mind_map",
      };

      const mediaType = mediaTypeMap[output.output_type] || "briefing";

      // Add media to prospect
      const { error: mediaError } = await supabase
        .from("prospect_media")
        .insert({
          prospect_id: prospectId,
          media_type: mediaType,
          title: output.title,
          content: output.content,
          notebook_output_id: output.id,
          visibility: "public",
        });

      if (mediaError) throw mediaError;

      return prospectId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospects"] });
      onOpenChange(false);
      toast.success("Content exported to prospect page!");
      setSelectedProspectId("");
      setNewProspect({ company_name: "", slug: "" });
    },
    onError: (error) => {
      toast.error("Export failed: " + error.message);
    },
  });

  const canExport = mode === "existing" ? !!selectedProspectId : !!newProspect.company_name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export to Prospect Page</DialogTitle>
          <DialogDescription>
            Add "{output.title}" to a prospect's landing page
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "existing" | "new")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing">Add to existing prospect</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new">Create new prospect page</Label>
            </div>
          </RadioGroup>

          {mode === "existing" && (
            <div className="space-y-2">
              {prospectsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : prospects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No prospect pages yet. Create one first.
                </p>
              ) : (
                <ScrollArea className="h-48 border rounded-lg p-2">
                  <div className="space-y-2">
                    {prospects.map((prospect) => (
                      <div
                        key={prospect.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedProspectId === prospect.id
                            ? "bg-primary/10 border border-primary"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedProspectId(prospect.id)}
                      >
                        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{prospect.company_name}</p>
                          <p className="text-xs text-muted-foreground">/p/{prospect.slug}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {mode === "new" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_company">Company Name *</Label>
                <Input
                  id="new_company"
                  value={newProspect.company_name}
                  onChange={(e) => setNewProspect({ ...newProspect, company_name: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_slug">URL Slug (optional)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/p/</span>
                  <Input
                    id="new_slug"
                    value={newProspect.slug}
                    onChange={(e) => setNewProspect({ 
                      ...newProspect, 
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") 
                    })}
                    placeholder="acme-corp"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => exportMutation.mutate()}
            disabled={!canExport || exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}