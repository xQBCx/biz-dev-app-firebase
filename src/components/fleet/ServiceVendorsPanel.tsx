import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Users, Mail, Phone, MapPin, Star, Briefcase, DollarSign } from "lucide-react";

interface ServiceVendor {
  id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  service_radius_miles: number;
  certifications: string[] | null;
  wallet_address: string | null;
  verification_status: string;
  rating: number;
  total_jobs_completed: number;
  total_revenue_earned: number;
  created_at: string;
}

export const ServiceVendorsPanel = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    service_radius_miles: "25",
    wallet_address: ""
  });
  const queryClient = useQueryClient();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['service-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_vendors')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ServiceVendor[];
    }
  });

  const createVendor = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('service_vendors').insert({
        user_id: user?.id,
        business_name: data.business_name,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || null,
        service_radius_miles: parseInt(data.service_radius_miles),
        wallet_address: data.wallet_address || null
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-stats'] });
      toast.success("Vendor registered successfully");
      setIsDialogOpen(false);
      setFormData({
        business_name: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        service_radius_miles: "25",
        wallet_address: ""
      });
    },
    onError: (error) => {
      toast.error("Failed to register vendor: " + error.message);
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('service_vendors')
        .update({ verification_status: status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['fleet-stats'] });
      toast.success("Vendor status updated");
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading vendors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Service Vendors</h2>
          <p className="text-sm text-muted-foreground">Verified contractors who perform work orders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Register Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Vendor</DialogTitle>
              <DialogDescription>
                Add a contractor to perform service work orders
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="ABC Repair Services"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="john@abcrepair.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Service Radius (miles)</Label>
                <Input
                  type="number"
                  value={formData.service_radius_miles}
                  onChange={(e) => setFormData({ ...formData, service_radius_miles: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Blockchain Wallet Address (optional)</Label>
                <Input
                  value={formData.wallet_address}
                  onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                  placeholder="0x..."
                />
              </div>
              <Button 
                className="w-full" 
                onClick={() => createVendor.mutate(formData)}
                disabled={!formData.business_name || !formData.contact_name || !formData.contact_email || createVendor.isPending}
              >
                {createVendor.isPending ? "Registering..." : "Register Vendor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {vendors?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Vendors Yet</h3>
            <p className="text-muted-foreground mb-4">Register vendors to perform work orders</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Register Vendor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors?.map((vendor) => (
            <Card key={vendor.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{vendor.business_name}</CardTitle>
                    <CardDescription>{vendor.contact_name}</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(vendor.verification_status)}>
                    {vendor.verification_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {vendor.contact_email}
                  </div>
                  {vendor.contact_phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {vendor.contact_phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {vendor.service_radius_miles} mile radius
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-semibold">{vendor.total_jobs_completed}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Jobs</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">{(vendor.total_revenue_earned / 1000).toFixed(1)}k</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Earned</p>
                  </div>
                </div>
                {vendor.certifications && vendor.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {vendor.certifications.map((cert, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{cert}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  {vendor.verification_status === 'pending' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => updateStatus.mutate({ id: vendor.id, status: 'verified' })}
                      >
                        Verify
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStatus.mutate({ id: vendor.id, status: 'rejected' })}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {vendor.verification_status === 'verified' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus.mutate({ id: vendor.id, status: 'suspended' })}
                    >
                      Suspend
                    </Button>
                  )}
                  {vendor.verification_status === 'suspended' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateStatus.mutate({ id: vendor.id, status: 'verified' })}
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
