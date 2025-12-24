import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Truck, Mail, Globe, Percent } from "lucide-react";

interface FleetPartner {
  id: string;
  partner_name: string;
  partner_type: string;
  contact_email: string | null;
  contact_name: string | null;
  revenue_share_percent: number;
  status: string;
  total_data_points_received: number;
  total_leads_generated: number;
  total_revenue_shared: number;
  created_at: string;
}

export const FleetPartnersPanel = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    partner_name: "",
    partner_type: "vehicle_fleet",
    contact_email: "",
    contact_name: "",
    revenue_share_percent: "2.00"
  });
  const queryClient = useQueryClient();

  const { data: partners, isLoading } = useQuery({
    queryKey: ['fleet-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet_partners')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as FleetPartner[];
    }
  });

  const createPartner = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('fleet_partners').insert({
        partner_name: data.partner_name,
        partner_type: data.partner_type,
        contact_email: data.contact_email || null,
        contact_name: data.contact_name || null,
        revenue_share_percent: parseFloat(data.revenue_share_percent)
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-partners'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-stats'] });
      toast.success("Partner added successfully");
      setIsDialogOpen(false);
      setFormData({
        partner_name: "",
        partner_type: "vehicle_fleet",
        contact_email: "",
        contact_name: "",
        revenue_share_percent: "2.00"
      });
    },
    onError: (error) => {
      toast.error("Failed to add partner: " + error.message);
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('fleet_partners')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-partners'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-stats'] });
      toast.success("Partner status updated");
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vehicle_fleet: "Vehicle Fleet",
      municipality: "Municipality",
      delivery_service: "Delivery Service",
      rideshare: "Rideshare",
      other: "Other"
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading partners...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Fleet Data Partners</h2>
          <p className="text-sm text-muted-foreground">Companies providing visual data from their vehicle fleets</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Fleet Partner</DialogTitle>
              <DialogDescription>
                Register a new partner who will provide visual data from their fleet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Partner Name</Label>
                <Input
                  value={formData.partner_name}
                  onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                  placeholder="Tesla, Waymo, City of Houston..."
                />
              </div>
              <div className="space-y-2">
                <Label>Partner Type</Label>
                <Select
                  value={formData.partner_type}
                  onValueChange={(value) => setFormData({ ...formData, partner_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vehicle_fleet">Vehicle Fleet</SelectItem>
                    <SelectItem value="municipality">Municipality</SelectItem>
                    <SelectItem value="delivery_service">Delivery Service</SelectItem>
                    <SelectItem value="rideshare">Rideshare</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="Partnership Manager"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="partner@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Revenue Share %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.revenue_share_percent}
                  onChange={(e) => setFormData({ ...formData, revenue_share_percent: e.target.value })}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => createPartner.mutate(formData)}
                disabled={!formData.partner_name || createPartner.isPending}
              >
                {createPartner.isPending ? "Adding..." : "Add Partner"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {partners?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Partners Yet</h3>
            <p className="text-muted-foreground mb-4">Add your first fleet data partner to start receiving visual intelligence</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {partners?.map((partner) => (
            <Card key={partner.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{partner.partner_name}</CardTitle>
                    <CardDescription>{getTypeLabel(partner.partner_type)}</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(partner.status)}>{partner.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Data Points</p>
                    <p className="font-semibold">{partner.total_data_points_received.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Leads Generated</p>
                    <p className="font-semibold">{partner.total_leads_generated}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenue Share</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {partner.revenue_share_percent}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Shared</p>
                    <p className="font-semibold">${partner.total_revenue_shared.toLocaleString()}</p>
                  </div>
                </div>
                {partner.contact_email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {partner.contact_email}
                  </div>
                )}
                <div className="flex gap-2">
                  {partner.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateStatus.mutate({ id: partner.id, status: 'active' })}
                    >
                      Activate
                    </Button>
                  )}
                  {partner.status === 'active' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: partner.id, status: 'suspended' })}
                    >
                      Suspend
                    </Button>
                  )}
                  {partner.status === 'suspended' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateStatus.mutate({ id: partner.id, status: 'active' })}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
