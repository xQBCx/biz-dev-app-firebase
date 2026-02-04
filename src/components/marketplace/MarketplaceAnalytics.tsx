import { useMemo } from "react";
import { KPIGrid, TimeSeriesChart, DistributionChart, FunnelChart, DataTable } from "@/components/analytics";
import { Package, TrendingUp, Users, Handshake } from "lucide-react";

interface MarketplaceAnalyticsProps {
  listings: any[];
  connections: any[];
  requests: any[];
}

export function MarketplaceAnalytics({ listings, connections, requests }: MarketplaceAnalyticsProps) {
  const stats = useMemo(() => {
    const activeListings = listings.filter(l => l.status === "active").length;
    const activeConnections = connections.filter(c => c.status === "active").length;
    const pendingRequests = requests.length;
    
    // Group listings by date
    const listingsByDate = listings.reduce((acc: Record<string, number>, listing) => {
      const date = new Date(listing.created_at).toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const timeSeriesData = Object.entries(listingsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, count]) => ({ date, listings: count as number }));

    return {
      totalListings: listings.length,
      activeListings,
      activeConnections,
      pendingRequests,
      timeSeriesData,
    };
  }, [listings, connections, requests]);

  const listingsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach(l => {
      counts[l.listing_type || "other"] = (counts[l.listing_type || "other"] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [listings]);

  const listingsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach(l => {
      counts[l.category || "other"] = (counts[l.category || "other"] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [listings]);

  const connectionFunnel = [
    { name: "Listings Created", value: stats.totalListings },
    { name: "Pending Requests", value: stats.pendingRequests + stats.activeConnections },
    { name: "Active Partnerships", value: stats.activeConnections },
  ];

  const kpis = [
    {
      title: "Total Listings",
      value: stats.totalListings,
      icon: Package,
      trend: { value: 12, label: "vs last month" },
    },
    {
      title: "Active Listings",
      value: stats.activeListings,
      icon: TrendingUp,
    },
    {
      title: "Active Partnerships",
      value: stats.activeConnections,
      icon: Handshake,
      trend: { value: 8, label: "vs last month" },
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: Users,
    },
  ];

  const listingsTableColumns = [
    { key: "title" as const, label: "Title" },
    { key: "listing_type" as const, label: "Type" },
    { key: "category" as const, label: "Category" },
    { key: "status" as const, label: "Status" },
  ];

  return (
    <div className="space-y-6">
      <KPIGrid items={kpis} columns={4} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TimeSeriesChart
          title="Listings Over Time"
          description="Number of listings created"
          data={stats.timeSeriesData}
          series={[{ key: "listings", label: "Listings", color: "hsl(var(--primary))" }]}
          type="area"
        />
        <FunnelChart
          title="Partnership Funnel"
          description="From listing to active partnership"
          data={connectionFunnel}
          showConversion
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionChart
          title="Listings by Type"
          data={listingsByType}
          type="donut"
        />
        <DistributionChart
          title="Listings by Category"
          data={listingsByCategory}
          type="pie"
        />
      </div>

      <DataTable
        title="All Listings"
        data={listings}
        columns={listingsTableColumns}
      />
    </div>
  );
}
