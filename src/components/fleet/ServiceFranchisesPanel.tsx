import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Wrench, DollarSign, Percent, CheckCircle } from "lucide-react";

interface ServiceFranchise {
  id: string;
  franchise_code: string;
  franchise_name: string;
  category: string;
  description: string | null;
  icon_name: string | null;
  typical_job_value_min: number | null;
  typical_job_value_max: number | null;
  materials_advance_percent: number;
  platform_fee_percent: number;
  material_referral_percent: number;
  partner_data_share_percent: number;
  proof_requirements: string[];
  is_active: boolean;
}

export const ServiceFranchisesPanel = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    franchise_code: "",
    franchise_name: "",
    category: "",
    description: "",
    typical_job_value_min: "100",
    typical_job_value_max: "5000",
    materials_advance_percent: "30",
    platform_fee_percent: "8",
    material_referral_percent: "3",
    partner_data_share_percent: "2"
  });
  const queryClient = useQueryClient();

  const { data: franchises, isLoading } = useQuery({
    queryKey: ['service-franchises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_franchises')
        .select('*')
        .order('category', { ascending: true });
      if (error) throw error;
      return data as ServiceFranchise[];
    }
  });

  const createFranchise = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('service_franchises').insert({
        franchise_code: data.franchise_code.toUpperCase(),
        franchise_name: data.franchise_name,
        category: data.category,
        description: data.description || null,
        typical_job_value_min: parseFloat(data.typical_job_value_min),
        typical_job_value_max: parseFloat(data.typical_job_value_max),
        materials_advance_percent: parseFloat(data.materials_advance_percent),
        platform_fee_percent: parseFloat(data.platform_fee_percent),
        material_referral_percent: parseFloat(data.material_referral_percent),
        partner_data_share_percent: parseFloat(data.partner_data_share_percent)
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-franchises'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-stats'] });
      toast.success("Franchise created successfully");
      setIsDialogOpen(false);
      setFormData({
        franchise_code: "",
        franchise_name: "",
        category: "",
        description: "",
        typical_job_value_min: "100",
        typical_job_value_max: "5000",
        materials_advance_percent: "30",
        platform_fee_percent: "8",
        material_referral_percent: "3",
        partner_data_share_percent: "2"
      });
    },
    onError: (error) => {
      toast.error("Failed to create franchise: " + error.message);
    }
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('service_franchises')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-franchises'] });
      toast.success("Franchise updated");
    }
  });

  // Group by category
  const groupedFranchises = franchises?.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {} as Record<string, ServiceFranchise[]>);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading franchises...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Service Franchises</h2>
          <p className="text-sm text-muted-foreground">Types of services vendors can perform with revenue distribution</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Franchise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Service Franchise</DialogTitle>
              <DialogDescription>
                Define a new service type with pricing and revenue distribution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Franchise Code</Label>
                  <Input
                    value={formData.franchise_code}
                    onChange={(e) => setFormData({ ...formData, franchise_code: e.target.value })}
                    placeholder="POTHOLE"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Infrastructure"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Franchise Name</Label>
                <Input
                  value={formData.franchise_name}
                  onChange={(e) => setFormData({ ...formData, franchise_name: e.target.value })}
                  placeholder="Pothole Repair"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Road surface repair and patching"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Job Value ($)</Label>
                  <Input
                    type="number"
                    value={formData.typical_job_value_min}
                    onChange={(e) => setFormData({ ...formData, typical_job_value_min: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Job Value ($)</Label>
                  <Input
                    type="number"
                    value={formData.typical_job_value_max}
                    onChange={(e) => setFormData({ ...formData, typical_job_value_max: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Materials Advance %</Label>
                  <Input
                    type="number"
                    value={formData.materials_advance_percent}
                    onChange={(e) => setFormData({ ...formData, materials_advance_percent: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Platform Fee %</Label>
                  <Input
                    type="number"
                    value={formData.platform_fee_percent}
                    onChange={(e) => setFormData({ ...formData, platform_fee_percent: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material Referral %</Label>
                  <Input
                    type="number"
                    value={formData.material_referral_percent}
                    onChange={(e) => setFormData({ ...formData, material_referral_percent: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Partner Data Share %</Label>
                  <Input
                    type="number"
                    value={formData.partner_data_share_percent}
                    onChange={(e) => setFormData({ ...formData, partner_data_share_percent: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => createFranchise.mutate(formData)}
                disabled={!formData.franchise_code || !formData.franchise_name || !formData.category || createFranchise.isPending}
              >
                {createFranchise.isPending ? "Creating..." : "Create Franchise"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(groupedFranchises || {}).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <h3 className="font-semibold text-lg">{category}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((franchise) => (
              <Card key={franchise.id} className={!franchise.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        {franchise.franchise_name}
                      </CardTitle>
                      <CardDescription>{franchise.franchise_code}</CardDescription>
                    </div>
                    <Badge variant={franchise.is_active ? 'default' : 'secondary'}>
                      {franchise.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {franchise.description && (
                    <p className="text-sm text-muted-foreground">{franchise.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      ${franchise.typical_job_value_min?.toLocaleString()} - ${franchise.typical_job_value_max?.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      <span>Advance: {franchise.materials_advance_percent}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      <span>Platform: {franchise.platform_fee_percent}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      <span>Material: {franchise.material_referral_percent}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      <span>Partner: {franchise.partner_data_share_percent}%</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {franchise.proof_requirements?.map((req, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {req.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => toggleActive.mutate({ id: franchise.id, is_active: !franchise.is_active })}
                  >
                    {franchise.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
