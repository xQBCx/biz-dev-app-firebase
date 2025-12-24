import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Camera, Users, Briefcase, DollarSign, Settings } from "lucide-react";
import { FleetPartnersPanel } from "@/components/fleet/FleetPartnersPanel";
import { FleetDataIntakePanel } from "@/components/fleet/FleetDataIntakePanel";
import { ServiceFranchisesPanel } from "@/components/fleet/ServiceFranchisesPanel";
import { ServiceVendorsPanel } from "@/components/fleet/ServiceVendorsPanel";
import { FleetWorkOrdersPanel } from "@/components/fleet/FleetWorkOrdersPanel";
import { RevenueDistributionPanel } from "@/components/fleet/RevenueDistributionPanel";

const FleetIntelligence = () => {
  const [activeTab, setActiveTab] = useState("partners");

  // Fetch summary stats
  const { data: stats } = useQuery({
    queryKey: ['fleet-stats'],
    queryFn: async () => {
      const [partners, intake, franchises, vendors, orders] = await Promise.all([
        supabase.from('fleet_partners').select('id, status', { count: 'exact' }),
        supabase.from('fleet_data_intake').select('id, processing_status', { count: 'exact' }),
        supabase.from('service_franchises').select('id', { count: 'exact' }),
        supabase.from('service_vendors').select('id, verification_status', { count: 'exact' }),
        supabase.from('fleet_work_orders').select('id, status, total_cost', { count: 'exact' })
      ]);

      const activePartners = partners.data?.filter(p => p.status === 'active').length || 0;
      const pendingIntake = intake.data?.filter(i => i.processing_status === 'pending').length || 0;
      const verifiedVendors = vendors.data?.filter(v => v.verification_status === 'verified').length || 0;
      const completedOrders = orders.data?.filter(o => o.status === 'completed') || [];
      const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.total_cost) || 0), 0);

      return {
        totalPartners: partners.count || 0,
        activePartners,
        pendingIntake,
        totalFranchises: franchises.count || 0,
        totalVendors: vendors.count || 0,
        verifiedVendors,
        totalOrders: orders.count || 0,
        completedOrders: completedOrders.length,
        totalRevenue
      };
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fleet Intelligence Partners</h1>
        <p className="text-muted-foreground mt-1">
          Partner with vehicle fleets for visual data, generate leads, and manage service delivery with blockchain-backed payments
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Partners</CardDescription>
            <CardTitle className="text-2xl">{stats?.activePartners || 0}/{stats?.totalPartners || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Active</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Data Queue</CardDescription>
            <CardTitle className="text-2xl">{stats?.pendingIntake || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Pending</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Franchises</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalFranchises || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Service Types</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vendors</CardDescription>
            <CardTitle className="text-2xl">{stats?.verifiedVendors || 0}/{stats?.totalVendors || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Verified</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Work Orders</CardDescription>
            <CardTitle className="text-2xl">{stats?.completedOrders || 0}/{stats?.totalOrders || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Completed</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue</CardDescription>
            <CardTitle className="text-2xl">${(stats?.totalRevenue || 0).toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default">Total</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full overflow-x-auto justify-start">
          <TabsTrigger value="partners" className="flex items-center gap-2 flex-shrink-0">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Partners</span>
          </TabsTrigger>
          <TabsTrigger value="intake" className="flex items-center gap-2 flex-shrink-0">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Data Intake</span>
          </TabsTrigger>
          <TabsTrigger value="franchises" className="flex items-center gap-2 flex-shrink-0">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Franchises</span>
          </TabsTrigger>
          <TabsTrigger value="vendors" className="flex items-center gap-2 flex-shrink-0">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Vendors</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2 flex-shrink-0">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Work Orders</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2 flex-shrink-0">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Revenue</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="mt-6">
          <FleetPartnersPanel />
        </TabsContent>
        <TabsContent value="intake" className="mt-6">
          <FleetDataIntakePanel />
        </TabsContent>
        <TabsContent value="franchises" className="mt-6">
          <ServiceFranchisesPanel />
        </TabsContent>
        <TabsContent value="vendors" className="mt-6">
          <ServiceVendorsPanel />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <FleetWorkOrdersPanel />
        </TabsContent>
        <TabsContent value="revenue" className="mt-6">
          <RevenueDistributionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FleetIntelligence;
