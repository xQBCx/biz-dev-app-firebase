import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2, BookOpen, Building2, Package, Loader2 } from "lucide-react";
import { useInstincts } from "@/hooks/useInstincts";

interface PlaybookRule {
  id: string;
  category_pattern: string;
  company_id: string | null;
  bundle_id: string | null;
  priority: number;
  pain_points: string[];
  benefits: string[];
  script_notes: string | null;
  is_active: boolean;
  company?: { name: string };
  bundle?: { name: string };
}

export const DriveByPlaybooks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackEntityCreated, trackEntityUpdated, trackEntityDeleted } = useInstincts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PlaybookRule | null>(null);

  const [formData, setFormData] = useState({
    category_pattern: "",
    company_id: "",
    bundle_id: "",
    priority: 1,
    pain_points: "",
    benefits: "",
    script_notes: "",
    is_active: true,
  });

  const { data: companies } = useQuery({
    queryKey: ["biz-companies", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("biz_company").select("id, name").eq("user_id", user.id).eq("active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: bundles } = useQuery({
    queryKey: ["product-bundles", formData.company_id],
    queryFn: async () => {
      if (!formData.company_id) return [];
      const { data, error } = await supabase.from("product_bundle").select("id, name").eq("company_id", formData.company_id);
      if (error) throw error;
      return data;
    },
    enabled: !!formData.company_id,
  });

  const { data: rules, isLoading } = useQuery({
    queryKey: ["playbook-rules", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("product_bundle")
        .select(`
          id, name, category, playbook_slug,
          biz_company (id, name, user_id)
        `)
        .not("category", "is", null);
      if (error) throw error;
      // Filter to user's companies and transform
      return data?.filter((b: any) => b.biz_company?.user_id === user.id) || [];
    },
    enabled: !!user,
  });

  const createBundleMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("product_bundle").insert({
        company_id: data.company_id,
        name: data.category_pattern,
        category: data.category_pattern,
        playbook_slug: data.category_pattern.toLowerCase().replace(/\s+/g, "-"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      trackEntityCreated("driveby", "playbook_rule", "new", formData.category_pattern);
      toast({ title: "Playbook rule created!" });
      queryClient.invalidateQueries({ queryKey: ["playbook-rules"] });
      queryClient.invalidateQueries({ queryKey: ["product-bundles"] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => toast({ title: "Failed to create rule", variant: "destructive" }),
  });

  const deleteBundleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_bundle").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      trackEntityDeleted("driveby", "playbook_rule", id, "Deleted");
      toast({ title: "Rule deleted" });
      queryClient.invalidateQueries({ queryKey: ["playbook-rules"] });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => {
    setFormData({ category_pattern: "", company_id: "", bundle_id: "", priority: 1, pain_points: "", benefits: "", script_notes: "", is_active: true });
    setEditingRule(null);
  };

  const handleSubmit = () => {
    if (!formData.category_pattern || !formData.company_id) {
      toast({ title: "Category and Company are required", variant: "destructive" });
      return;
    }
    createBundleMutation.mutate(formData);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Playbook Rules</h2>
          <p className="text-sm text-muted-foreground">Define how captured businesses get matched to your companies</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Add Rule</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingRule ? "Edit Rule" : "New Playbook Rule"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category Pattern</Label>
                <Input placeholder="e.g., Cooling Towers, HVAC, Apartments" value={formData.category_pattern} onChange={(e) => setFormData((p) => ({ ...p, category_pattern: e.target.value }))} />
                <p className="text-xs text-muted-foreground">AI-detected categories that trigger this rule</p>
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={formData.company_id} onValueChange={(v) => setFormData((p) => ({ ...p, company_id: v, bundle_id: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                  <SelectContent>
                    {companies?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {bundles && bundles.length > 0 && (
                <div className="space-y-2">
                  <Label>Product Bundle (optional)</Label>
                  <Select value={formData.bundle_id} onValueChange={(v) => setFormData((p) => ({ ...p, bundle_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select bundle" /></SelectTrigger>
                    <SelectContent>
                      {bundles.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Pain Points (one per line)</Label>
                <Textarea placeholder="Chemical spend too high&#10;Biofilm buildup&#10;Corrosion issues" value={formData.pain_points} onChange={(e) => setFormData((p) => ({ ...p, pain_points: e.target.value }))} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Benefits (one per line)</Label>
                <Textarea placeholder="75% chemical reduction&#10;10% energy savings&#10;85% blowdown cut" value={formData.benefits} onChange={(e) => setFormData((p) => ({ ...p, benefits: e.target.value }))} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Script Notes</Label>
                <Textarea placeholder="Key questions to ask, qualifiers..." value={formData.script_notes} onChange={(e) => setFormData((p) => ({ ...p, script_notes: e.target.value }))} rows={2} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={createBundleMutation.isPending}>
                  {createBundleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingRule ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!rules?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No playbook rules yet</h3>
            <p className="text-muted-foreground mt-1">Create rules to auto-route captured businesses to your companies</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule: any) => (
            <Card key={rule.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">{rule.category}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{rule.biz_company?.name}</span>
                      </div>
                      {rule.name && (
                        <>
                          <span className="text-muted-foreground">→</span>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{rule.name}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {rule.playbook_slug && <p className="text-sm text-muted-foreground">Playbook: {rule.playbook_slug}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => deleteBundleMutation.mutate(rule.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};