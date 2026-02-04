import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const NarrativeManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNarrative, setEditingNarrative] = useState<any>(null);

  const { data: narratives, isLoading } = useQuery({
    queryKey: ["narratives-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_asset_narratives")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("digital_asset_narratives")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["narratives-admin"] });
      toast({ title: "Narrative deleted successfully" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Strategic Narratives Manager</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingNarrative(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Narrative
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNarrative ? "Edit Narrative" : "Add New Narrative"}
              </DialogTitle>
            </DialogHeader>
            <NarrativeForm
              narrative={editingNarrative}
              onSuccess={() => {
                setIsDialogOpen(false);
                setEditingNarrative(null);
                queryClient.invalidateQueries({ queryKey: ["narratives-admin"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {narratives?.map((narrative) => (
            <Card key={narrative.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-accent" />
                    <h3 className="text-lg font-semibold text-foreground">{narrative.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{narrative.body}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setEditingNarrative(narrative);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteMutation.mutate(narrative.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const NarrativeForm = ({ narrative, onSuccess }: { narrative?: any; onSuccess: () => void }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: narrative?.title || "",
    body: narrative?.body || "",
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (narrative) {
        const { error } = await supabase
          .from("digital_asset_narratives")
          .update(data)
          .eq("id", narrative.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("digital_asset_narratives").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Narrative ${narrative ? "updated" : "created"} successfully` });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={8}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        {narrative ? "Update Narrative" : "Add Narrative"}
      </Button>
    </form>
  );
};

export default NarrativeManager;
