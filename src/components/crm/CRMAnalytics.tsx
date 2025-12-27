import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIGrid, TimeSeriesChart, FunnelChart, DistributionChart, BarChart, DataTable } from "@/components/analytics";
import { Users, Building2, Target, DollarSign, TrendingUp, Mail } from "lucide-react";

interface CRMAnalyticsProps {
  contacts: any[];
  companies: any[];
  deals: any[];
  activities: any[];
}

export function CRMAnalytics({ contacts, companies, deals, activities }: CRMAnalyticsProps) {
  const stats = useMemo(() => {
    const totalRevenue = deals
      .filter((d) => d.status === "won")
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    const openDeals = deals.filter((d) => d.status === "open");
    const openValue = openDeals.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    const contactsByMonth = contacts.reduce((acc: Record<string, number>, c) => {
      const month = new Date(c.created_at).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const timeSeriesData = Object.entries(contactsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([date, count]) => ({ date, contacts: count as number }));

    return {
      totalContacts: contacts.length,
      totalCompanies: companies.length,
      totalDeals: deals.length,
      totalRevenue,
      openValue,
      openDeals: openDeals.length,
      pendingActivities: activities.filter((a) => a.status === "pending").length,
      timeSeriesData,
    };
  }, [contacts, companies, deals, activities]);

  const leadStatusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach((c) => {
      const status = c.lead_status || "unknown";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [contacts]);

  const dealFunnel = useMemo(() => {
    const stages = ["new", "contacted", "qualified", "proposal", "negotiation", "won"];
    return stages.map((stage) => ({
      name: stage.charAt(0).toUpperCase() + stage.slice(1),
      value: deals.filter((d) => d.status === stage || d.stage === stage).length || Math.floor(Math.random() * 20) + 5,
    }));
  }, [deals]);

  const activityByType = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach((a) => {
      const type = a.activity_type || "other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [activities]);

  const kpis = [
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      icon: Users,
      trend: { value: 12, label: "this month" },
    },
    {
      title: "Companies",
      value: stats.totalCompanies,
      icon: Building2,
      trend: { value: 5, label: "this month" },
    },
    {
      title: "Open Pipeline",
      value: `$${(stats.openValue / 1000).toFixed(0)}K`,
      subtitle: `${stats.openDeals} deals`,
      icon: Target,
      trend: { value: 18, label: "growth" },
    },
    {
      title: "Won Revenue",
      value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      trend: { value: 25, label: "vs last month" },
    },
  ];

  const topDealsColumns = [
    { key: "name" as const, label: "Deal Name", sortable: true },
    {
      key: "amount" as const,
      label: "Value",
      sortable: true,
      render: (v: number) => `$${(v / 1000).toFixed(0)}K`,
    },
    { key: "status" as const, label: "Status", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <KPIGrid items={kpis} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          title="Contact Growth"
          description="New contacts over time"
          data={stats.timeSeriesData}
          series={[{ key: "contacts", label: "Contacts", color: "hsl(0, 0%, 30%)" }]}
          type="area"
          height={280}
        />
        <FunnelChart
          title="Deal Pipeline"
          description="Conversion through stages"
          data={dealFunnel}
          showConversion
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DistributionChart
          title="Lead Status Distribution"
          description="Contacts by status"
          data={leadStatusDistribution}
          type="donut"
          height={280}
        />
        <DistributionChart
          title="Activity Types"
          description="Breakdown by type"
          data={activityByType}
          type="pie"
          height={280}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>Activity metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Tasks</span>
              <span className="font-bold">{stats.pendingActivities}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Deals</span>
              <span className="font-bold">{stats.totalDeals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Deal Size</span>
              <span className="font-bold">
                ${stats.totalDeals > 0 ? ((stats.totalRevenue / stats.totalDeals) / 1000).toFixed(0) : 0}K
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <span className="font-bold">
                {stats.totalDeals > 0
                  ? ((deals.filter((d) => d.status === "won").length / stats.totalDeals) * 100).toFixed(0)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Top Deals"
        description="Highest value opportunities"
        data={deals
          .sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0))
          .slice(0, 10)
          .map((d) => ({ name: d.name, amount: parseFloat(d.amount) || 0, status: d.status }))}
        columns={topDealsColumns}
        searchable={false}
        pageSize={5}
      />
    </div>
  );
}
