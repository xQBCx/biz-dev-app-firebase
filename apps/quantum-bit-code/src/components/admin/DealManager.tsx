import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, ExternalLink } from "lucide-react";

const DealManager = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: deals } = useQuery({
    queryKey: ["deals-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (deal: any) => {
    setEditingDeal(deal);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingDeal(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Deals</h2>
          <p className="text-sm text-muted-foreground">
            Manage investment deals and VDR access
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Deal
        </Button>
      </div>

      <div className="grid gap-4">
        {deals?.map((deal) => (
          <Card key={deal.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-foreground">{deal.title}</h3>
                  {!deal.is_active && (
                    <span className="text-xs text-muted-foreground">(Inactive)</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{deal.short_description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Slug: <code className="bg-muted px-2 py-1 rounded">{deal.slug}</code></span>
                  {deal.includes_digital_asset_acquisitions && (
                    <span className="text-accent">Includes Digital Assets</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/vdr/${deal.slug}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(deal)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {(!deals || deals.length === 0) && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No deals yet. Create your first deal.</p>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDeal ? "Edit Deal" : "Add New Deal"}</DialogTitle>
          </DialogHeader>
          <DealForm
            deal={editingDeal}
            onSuccess={() => {
              setDialogOpen(false);
              setEditingDeal(null);
              queryClient.invalidateQueries({ queryKey: ["deals-admin"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DealForm = ({ deal, onSuccess }: { deal: any; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    title: deal?.title || "",
    slug: deal?.slug || "",
    short_description: deal?.short_description || "",
    detailed_description: deal?.detailed_description || "",
    brand_logo_url: deal?.brand_logo_url || "",
    brand_primary_color: deal?.brand_primary_color || "#1e3a8a",
    brand_accent_color: deal?.brand_accent_color || "#d97706",
    is_active: deal?.is_active ?? true,
    includes_digital_asset_acquisitions: deal?.includes_digital_asset_acquisitions ?? false,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (deal) {
        const { error } = await supabase
          .from("deals")
          .update(formData)
          .eq("id", deal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("deals").insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(deal ? "Deal updated" : "Deal created");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to save deal");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Deal Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL Slug * (used in /vdr/slug)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
          placeholder="my-deal-slug"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="short_description">Short Description</Label>
        <Input
          id="short_description"
          value={formData.short_description}
          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="detailed_description">Detailed Description</Label>
        <Textarea
          id="detailed_description"
          value={formData.detailed_description}
          onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_logo_url">Brand Logo URL</Label>
        <Input
          id="brand_logo_url"
          value={formData.brand_logo_url}
          onChange={(e) => setFormData({ ...formData, brand_logo_url: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand_primary_color">Primary Color</Label>
          <Input
            id="brand_primary_color"
            type="color"
            value={formData.brand_primary_color}
            onChange={(e) => setFormData({ ...formData, brand_primary_color: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand_accent_color">Accent Color</Label>
          <Input
            id="brand_accent_color"
            type="color"
            value={formData.brand_accent_color}
            onChange={(e) => setFormData({ ...formData, brand_accent_color: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="includes_digital_asset_acquisitions"
          checked={formData.includes_digital_asset_acquisitions}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, includes_digital_asset_acquisitions: checked })
          }
        />
        <Label htmlFor="includes_digital_asset_acquisitions">
          Includes Digital Asset Acquisitions
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
        {saveMutation.isPending ? "Saving..." : deal ? "Update Deal" : "Create Deal"}
      </Button>
    </form>
  );
};

export default DealManager;
