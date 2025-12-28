import { useMemo } from "react";
import { KPIGrid, TimeSeriesChart, DistributionChart, BarChart, DataTable } from "@/components/analytics";
import { Truck, Users, DollarSign, Briefcase, Camera, Settings } from "lucide-react";

interface FleetAnalyticsProps {
  stats: {
    totalPartners: number;
    activePartners: number;
    pendingIntake: number;
    totalFranchises: number;
    totalVendors: number;
    verifiedVendors: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
  } | undefined;
}

export function FleetAnalytics({ stats }: FleetAnalyticsProps) {
  const kpis = useMemo(() => [
    {
      title: "Active Partners",
      value: `${stats?.activePartners || 0}/${stats?.totalPartners || 0}`,
      subtitle: "Fleet partners",
      icon: Truck,
      trend: { value: 15, label: "vs last month" },
    },
    {
      title: "Pending Intake",
      value: stats?.pendingIntake || 0,
      subtitle: "Data queue",
      icon: Camera,
    },
    {
      title: "Service Franchises",
      value: stats?.totalFranchises || 0,
      subtitle: "Service types",
      icon: Settings,
    },
    {
      title: "Verified Vendors",
      value: `${stats?.verifiedVendors || 0}/${stats?.totalVendors || 0}`,
      subtitle: "Service providers",
      icon: Users,
    },
    {
      title: "Work Orders",
      value: `${stats?.completedOrders || 0}/${stats?.totalOrders || 0}`,
      subtitle: "Completed",
      icon: Briefcase,
      trend: { value: 23, label: "vs last month" },
    },
    {
      title: "Total Revenue",
      value: `$${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`,
      subtitle: "All time",
      icon: DollarSign,
      trend: { value: 18, label: "vs last month" },
    },
  ], [stats]);

  const statusDistribution = useMemo(() => [
    { name: "Active Partners", value: stats?.activePartners || 0 },
    { name: "Inactive Partners", value: (stats?.totalPartners || 0) - (stats?.activePartners || 0) },
  ], [stats]);

  const vendorDistribution = useMemo(() => [
    { name: "Verified", value: stats?.verifiedVendors || 0 },
    { name: "Pending Verification", value: (stats?.totalVendors || 0) - (stats?.verifiedVendors || 0) },
  ], [stats]);

  const orderCompletion = useMemo(() => [
    { name: "Completed", value: stats?.completedOrders || 0 },
    { name: "In Progress", value: (stats?.totalOrders || 0) - (stats?.completedOrders || 0) },
  ], [stats]);

  const performanceData = useMemo(() => [
    { name: "Partners", active: stats?.activePartners || 0, total: stats?.totalPartners || 0 },
    { name: "Vendors", active: stats?.verifiedVendors || 0, total: stats?.totalVendors || 0 },
    { name: "Orders", active: stats?.completedOrders || 0, total: stats?.totalOrders || 0 },
  ], [stats]);

  return (
    <div className="space-y-6">
      <KPIGrid items={kpis} columns={3} />

      <div className="grid gap-6 lg:grid-cols-3">
        <DistributionChart
          title="Partner Status"
          data={statusDistribution}
          type="donut"
        />
        <DistributionChart
          title="Vendor Verification"
          data={vendorDistribution}
          type="donut"
        />
        <DistributionChart
          title="Order Completion"
          data={orderCompletion}
          type="donut"
        />
      </div>

      <BarChart
        title="Performance Overview"
        description="Active vs total across categories"
        data={performanceData}
        series={[
          { key: "active", label: "Active/Completed", color: "hsl(var(--primary))" },
          { key: "total", label: "Total", color: "hsl(var(--muted-foreground))" },
        ]}
      />
    </div>
  );
}
