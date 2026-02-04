import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Building2, MapPin, TrendingUp, DollarSign, Users, ExternalLink } from "lucide-react";

interface GymBrand {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  affiliate_program_type: string;
  affiliate_network: string | null;
  commission_structure: Record<string, unknown>;
  partnership_status: string;
  contact_info: Record<string, unknown>;
  notes: string | null;
  created_at: string;
}

interface GymLocation {
  id: string;
  gym_brand_id: string | null;
  name: string;
  address: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  phone: string | null;
  website: string | null;
  referral_link: string | null;
  promo_code: string | null;
  monthly_price_estimate: number | null;
  is_active: boolean;
  featured: boolean;
  amenities: string[];
  gym_brands: { name: string } | null;
}

interface GymReferral {
  id: string;
  user_id: string | null;
  gym_location_id: string;
  source: string;
  clicked_at: string;
  converted: boolean;
  commission_amount: number | null;
  commission_status: string;
  gym_locations: { name: string; city: string } | null;
}

export default function AdminGymPartners() {
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch gym brands
  const { data: brands } = useQuery({
    queryKey: ["admin-gym-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_brands")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as GymBrand[];
    },
  });

  // Fetch gym locations
  const { data: locations } = useQuery({
    queryKey: ["admin-gym-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_locations")
        .select(`*, gym_brands(name)`)
        .order("city");
      if (error) throw error;
      return data as GymLocation[];
    },
  });

  // Fetch referrals
  const { data: referrals } = useQuery({
    queryKey: ["admin-gym-referrals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_referrals")
        .select(`*, gym_locations(name, city)`)
        .order("clicked_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as GymReferral[];
    },
  });

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (brand: { name: string; website?: string | null; affiliate_program_type?: string; partnership_status?: string; notes?: string | null }) => {
      const { error } = await supabase.from("gym_brands").insert([brand]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gym-brands"] });
      setBrandDialogOpen(false);
      toast({ title: "Gym brand created" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: async (location: { name: string; city: string; state: string; gym_brand_id?: string | null; address?: string | null; zip_code?: string | null; phone?: string | null; website?: string | null; referral_link?: string | null; promo_code?: string | null; monthly_price_estimate?: number | null }) => {
      const { error } = await supabase.from("gym_locations").insert([location]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gym-locations"] });
      setLocationDialogOpen(false);
      toast({ title: "Gym location created" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500";
      case "negotiating": return "bg-yellow-500/10 text-yellow-500";
      case "outreach": return "bg-blue-500/10 text-blue-500";
      case "prospect": return "bg-gray-500/10 text-gray-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  // Stats
  const totalReferrals = referrals?.length || 0;
  const conversions = referrals?.filter(r => r.converted).length || 0;
  const conversionRate = totalReferrals > 0 ? ((conversions / totalReferrals) * 100).toFixed(1) : 0;
  const totalCommissions = referrals?.reduce((sum, r) => sum + (r.commission_amount || 0), 0) || 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gym Partners</h1>
                <p className="text-muted-foreground">Manage gym partnerships, locations, and referrals</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Brand
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Gym Brand</DialogTitle>
                      <DialogDescription>Add a new gym chain or franchise</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createBrandMutation.mutate({
                        name: formData.get("name") as string,
                        website: formData.get("website") as string || null,
                        affiliate_program_type: formData.get("affiliate_program_type") as string,
                        partnership_status: formData.get("partnership_status") as string,
                        notes: formData.get("notes") as string || null,
                      });
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Brand Name</Label>
                        <Input id="name" name="name" required placeholder="Planet Fitness" />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" name="website" placeholder="https://planetfitness.com" />
                      </div>
                      <div>
                        <Label htmlFor="affiliate_program_type">Affiliate Program Type</Label>
                        <Select name="affiliate_program_type" defaultValue="none">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="direct">Direct</SelectItem>
                            <SelectItem value="network">Affiliate Network</SelectItem>
                            <SelectItem value="corporate_wellness">Corporate Wellness</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="partnership_status">Partnership Status</Label>
                        <Select name="partnership_status" defaultValue="prospect">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="prospect">Prospect</SelectItem>
                            <SelectItem value="outreach">Outreach</SelectItem>
                            <SelectItem value="negotiating">Negotiating</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" placeholder="Contact info, next steps, etc." />
                      </div>
                      <Button type="submit" className="w-full" disabled={createBrandMutation.isPending}>
                        Create Brand
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Gym Location</DialogTitle>
                      <DialogDescription>Add a specific gym location</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createLocationMutation.mutate({
                        name: formData.get("name") as string,
                        gym_brand_id: formData.get("gym_brand_id") as string || null,
                        address: formData.get("address") as string || null,
                        city: formData.get("city") as string,
                        state: formData.get("state") as string,
                        zip_code: formData.get("zip_code") as string || null,
                        phone: formData.get("phone") as string || null,
                        website: formData.get("website") as string || null,
                        referral_link: formData.get("referral_link") as string || null,
                        promo_code: formData.get("promo_code") as string || null,
                        monthly_price_estimate: formData.get("monthly_price_estimate") ? parseFloat(formData.get("monthly_price_estimate") as string) : null,
                      });
                    }} className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="name">Location Name</Label>
                        <Input id="name" name="name" required placeholder="Planet Fitness - Galleria" />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="gym_brand_id">Brand (Optional)</Label>
                        <Select name="gym_brand_id">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands?.map(brand => (
                              <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" placeholder="123 Main St" />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" required placeholder="Houston" />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" name="state" required placeholder="TX" maxLength={2} />
                      </div>
                      <div>
                        <Label htmlFor="zip_code">Zip Code</Label>
                        <Input id="zip_code" name="zip_code" placeholder="77001" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" placeholder="(713) 555-1234" />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" name="website" placeholder="https://..." />
                      </div>
                      <div>
                        <Label htmlFor="monthly_price_estimate">Monthly Price ($)</Label>
                        <Input id="monthly_price_estimate" name="monthly_price_estimate" type="number" placeholder="25" />
                      </div>
                      <div>
                        <Label htmlFor="referral_link">Referral Link</Label>
                        <Input id="referral_link" name="referral_link" placeholder="https://..." />
                      </div>
                      <div>
                        <Label htmlFor="promo_code">Promo Code</Label>
                        <Input id="promo_code" name="promo_code" placeholder="LIMITLESS10" />
                      </div>
                      <div className="col-span-2">
                        <Button type="submit" className="w-full" disabled={createLocationMutation.isPending}>
                          Create Location
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{brands?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {brands?.filter(b => b.partnership_status === 'active').length || 0} active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{locations?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {locations?.filter(l => l.is_active).length || 0} active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Referral Clicks</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalReferrals}</div>
                  <p className="text-xs text-muted-foreground">
                    {conversionRate}% conversion rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Est. Commissions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalCommissions.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {conversions} conversions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="brands">
              <TabsList>
                <TabsTrigger value="brands">Brands ({brands?.length || 0})</TabsTrigger>
                <TabsTrigger value="locations">Locations ({locations?.length || 0})</TabsTrigger>
                <TabsTrigger value="referrals">Referrals ({referrals?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="brands" className="mt-4">
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Program Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brands?.map(brand => (
                        <TableRow key={brand.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {brand.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{brand.affiliate_program_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(brand.partnership_status)}>
                              {brand.partnership_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {brand.notes || "-"}
                          </TableCell>
                          <TableCell>
                            {brand.website && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={brand.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!brands || brands.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No gym brands yet. Add your first one!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="locations" className="mt-4">
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Promo Code</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations?.map(location => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">{location.name}</TableCell>
                          <TableCell>{location.gym_brands?.name || "-"}</TableCell>
                          <TableCell>{location.city}, {location.state}</TableCell>
                          <TableCell>
                            {location.promo_code ? (
                              <Badge variant="secondary" className="font-mono">{location.promo_code}</Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            {location.monthly_price_estimate ? `$${location.monthly_price_estimate}/mo` : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {location.is_active && <Badge variant="outline" className="text-green-500">Active</Badge>}
                              {location.featured && <Badge variant="secondary">Featured</Badge>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!locations || locations.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No gym locations yet. Add your first one!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="referrals" className="mt-4">
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Gym</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Converted</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals?.map(referral => (
                        <TableRow key={referral.id}>
                          <TableCell>{new Date(referral.clicked_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {referral.gym_locations?.name || "Unknown"}
                            <span className="text-muted-foreground text-sm block">
                              {referral.gym_locations?.city}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{referral.source}</Badge>
                          </TableCell>
                          <TableCell>
                            {referral.converted ? (
                              <Badge className="bg-green-500/10 text-green-500">Yes</Badge>
                            ) : (
                              <Badge variant="secondary">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {referral.commission_amount ? `$${referral.commission_amount}` : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{referral.commission_status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!referrals || referrals.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No referrals yet. Share gym links to start tracking!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
