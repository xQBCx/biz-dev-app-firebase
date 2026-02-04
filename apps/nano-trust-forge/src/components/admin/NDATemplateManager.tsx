import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NDATemplateManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: templates } = useQuery({
    queryKey: ["nda-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nda_templates")
        .select("*, deals(title)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">NDA Templates</h2>
          <p className="text-sm text-muted-foreground">
            Manage non-disclosure agreement templates for deals
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates?.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">{template.title}</h3>
                  <Badge variant="secondary">v{template.version}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {template.deals?.title || "Global Template"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.body.substring(0, 200)}...
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}

        {(!templates || templates.length === 0) && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No NDA templates yet. Create your first template.</p>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit NDA Template" : "Add New NDA Template"}</DialogTitle>
          </DialogHeader>
          <NDATemplateForm
            template={editingTemplate}
            onSuccess={() => {
              setDialogOpen(false);
              setEditingTemplate(null);
              queryClient.invalidateQueries({ queryKey: ["nda-templates"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const NDATemplateForm = ({ template, onSuccess }: { template: any; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    title: template?.title || "",
    body: template?.body || "",
    deal_id: template?.deal_id || "",
    version: template?.version || 1,
  });

  const { data: deals } = useQuery({
    queryKey: ["deals-for-nda"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("id, title, slug")
        .eq("is_active", true)
        .order("title");

      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const saveData = {
        ...formData,
        deal_id: formData.deal_id || null,
      };

      if (template) {
        const { error } = await supabase
          .from("nda_templates")
          .update(saveData)
          .eq("id", template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("nda_templates").insert(saveData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(template ? "Template updated" : "Template created");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to save template");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Template Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Standard NDA for Investor Access"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deal_id">Deal (optional - leave blank for global)</Label>
        <Select
          value={formData.deal_id}
          onValueChange={(value) => setFormData({ ...formData, deal_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a deal or leave blank for global" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Global Template</SelectItem>
            {deals?.map((deal) => (
              <SelectItem key={deal.id} value={deal.id}>
                {deal.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="version">Version</Label>
        <Input
          id="version"
          type="number"
          value={formData.version}
          onChange={(e) => setFormData({ ...formData, version: parseInt(e.target.value) })}
          min="1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">NDA Text *</Label>
        <Textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={20}
          placeholder="Enter the full NDA text here..."
          required
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          This will be displayed to users before they can access the data room
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
        {saveMutation.isPending ? "Saving..." : template ? "Update Template" : "Create Template"}
      </Button>
    </form>
  );
};

export default NDATemplateManager;
