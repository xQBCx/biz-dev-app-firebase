import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Building2, Briefcase, Loader2, Pencil, Trash2 } from "lucide-react";

const roleLabels: Record<string, string> = { owner: "Owner", consultant: "Consultant", distributor: "Distributor" };

export const DriveByCompanies = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", role: "owner", parent_group: "", description: "" });

  const { data: companies, isLoading } = useQuery({
    queryKey: ["biz-companies", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("biz_company").select(`*, product_bundle (id, name, category)`).eq("user_id", user.id).eq("active", true).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Not authenticated");
      const { data: company, error } = await supabase.from("biz_company").insert({ user_id: user.id, name: data.name, role: data.role, parent_group: data.parent_group || null, description: data.description || null }).select().single();
      if (error) throw error;
      return company;
    },
    onSuccess: () => { toast({ title: "Company added successfully!" }); queryClient.invalidateQueries({ queryKey: ["biz-companies"] }); setIsDialogOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to add company", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("biz_company").update({ name: data.name, role: data.role, parent_group: data.parent_group || null, description: data.description || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Company updated!" }); queryClient.invalidateQueries({ queryKey: ["biz-companies"] }); setIsDialogOpen(false); setEditingCompany(null); resetForm(); },
    onError: () => toast({ title: "Failed to update company", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("biz_company").update({ active: false }).eq("id", id); if (error) throw error; },
    onSuccess: () => { toast({ title: "Company removed" }); queryClient.invalidateQueries({ queryKey: ["biz-companies"] }); },
    onError: () => toast({ title: "Failed to remove company", variant: "destructive" }),
  });

  const resetForm = () => setFormData({ name: "", role: "owner", parent_group: "", description: "" });
  const openEditDialog = (company: any) => { setEditingCompany(company); setFormData({ name: company.name, role: company.role, parent_group: company.parent_group || "", description: company.description || "" }); setIsDialogOpen(true); };
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); editingCompany ? updateMutation.mutate({ id: editingCompany.id, data: formData }) : createMutation.mutate(formData); };

  const groupedCompanies = companies?.reduce((acc: any, company: any) => { const group = company.parent_group || "Other"; if (!acc[group]) acc[group] = []; acc[group].push(company); return acc; }, {});

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold">Your Companies</h2><p className="text-sm text-muted-foreground">Companies you own, consult for, or distribute products for</p></div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingCompany(null); resetForm(); } }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Company</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingCompany ? "Edit Company" : "Add Company"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Company Name</Label><Input id="name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g., EnWaTel" required /></div>
              <div className="space-y-2"><Label htmlFor="role">Your Role</Label><Select value={formData.role} onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="owner">Owner</SelectItem><SelectItem value="consultant">Consultant</SelectItem><SelectItem value="distributor">Distributor</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="parent_group">Parent Group (Optional)</Label><Input id="parent_group" value={formData.parent_group} onChange={(e) => setFormData((prev) => ({ ...prev, parent_group: e.target.value }))} placeholder="e.g., Energy, Water, Telecom" /></div>
              <div className="space-y-2"><Label htmlFor="description">Description (Optional)</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} placeholder="Brief description..." rows={3} /></div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>{(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingCompany ? "Update Company" : "Add Company"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!companies?.length ? <Card><CardContent className="py-12 text-center"><Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">No companies yet</h3><p className="text-muted-foreground mt-1">Add companies you work with to auto-route leads</p></CardContent></Card> : (
        Object.entries(groupedCompanies || {}).map(([group, groupCompanies]: any) => (
          <div key={group} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{group}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupCompanies.map((company: any) => (
                <Card key={company.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div><CardTitle className="text-base">{company.name}</CardTitle><Badge variant="outline" className="mt-1">{roleLabels[company.role]}</Badge></div>
                      <div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEditDialog(company)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(company.id)}><Trash2 className="h-4 w-4" /></Button></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {company.description && <p className="text-sm text-muted-foreground mb-3">{company.description}</p>}
                    {company.product_bundle?.length > 0 && <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" />Product Bundles</p><div className="flex flex-wrap gap-1">{company.product_bundle.map((bundle: any) => <Badge key={bundle.id} variant="secondary" className="text-xs">{bundle.name}</Badge>)}</div></div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
