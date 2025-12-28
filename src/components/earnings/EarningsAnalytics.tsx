import { useMemo } from "react";
import { KPIGrid, TimeSeriesChart, DistributionChart, BarChart, DataTable } from "@/components/analytics";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";

interface Commission {
  id: string;
  commission_tier: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  app_registry: {
    app_name: string;
  };
}

interface EarningsAnalyticsProps {
  commissions: Commission[];
  stats: {
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    totalReferrals: number;
  };
}

export function EarningsAnalytics({ commissions, stats }: EarningsAnalyticsProps) {
  const timeSeriesData = useMemo(() => {
    const byDate: Record<string, number> = {};
    commissions.forEach(c => {
      const date = new Date(c.created_at).toISOString().slice(0, 10);
      byDate[date] = (byDate[date] || 0) + c.commission_amount;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, amount]) => ({ date, earnings: amount }));
  }, [commissions]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    commissions.forEach(c => {
      counts[c.status] = (counts[c.status] || 0) + c.commission_amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value: Math.round(value * 100) / 100 
    }));
  }, [commissions]);

  const tierDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    commissions.forEach(c => {
      const tier = `Tier ${c.commission_tier}`;
      counts[tier] = (counts[tier] || 0) + c.commission_amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      value: Math.round(value * 100) / 100 
    }));
  }, [commissions]);

  const appDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    commissions.forEach(c => {
      const appName = c.app_registry?.app_name || "Unknown";
      counts[appName] = (counts[appName] || 0) + c.commission_amount;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [commissions]);

  const kpis = [
    {
      title: "Total Earnings",
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      trend: { value: 12, label: "vs last month" },
    },
    {
      title: "Pending Payout",
      value: `$${stats.pendingEarnings.toFixed(2)}`,
      icon: Clock,
    },
    {
      title: "Paid Out",
      value: `$${stats.paidEarnings.toFixed(2)}`,
      icon: TrendingUp,
    },
    {
      title: "Total Referrals",
      value: stats.totalReferrals,
      icon: Users,
      trend: { value: 8, label: "vs last month" },
    },
  ];

  const commissionsTableColumns = [
    { key: "id" as const, label: "App", render: (_: string, row: Commission) => row.app_registry?.app_name || "Unknown" },
    { key: "commission_tier" as const, label: "Tier", render: (v: number) => `Tier ${v}` },
    { key: "commission_rate" as const, label: "Rate", render: (v: number) => `${v}%` },
    { key: "commission_amount" as const, label: "Amount", render: (v: number) => `$${v.toFixed(2)}` },
    { key: "status" as const, label: "Status" },
  ];

  const appBarData = appDistribution.map(d => ({ name: d.name, earnings: d.value }));

  return (
    <div className="space-y-6">
      <KPIGrid items={kpis} columns={4} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TimeSeriesChart
          title="Earnings Over Time"
          description="Commission earnings by day"
          data={timeSeriesData}
          series={[{ key: "earnings", label: "Earnings ($)", color: "hsl(var(--chart-1))" }]}
          type="area"
        />
        <DistributionChart
          title="Earnings by Status"
          data={statusDistribution}
          type="donut"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionChart
          title="Earnings by Tier"
          data={tierDistribution}
          type="pie"
        />
        <BarChart
          title="Top Earning Apps"
          description="Highest commission generators"
          data={appBarData}
          series={[{ key: "earnings", label: "Earnings ($)", color: "hsl(var(--primary))" }]}
        />
      </div>

      <DataTable
        title="Commission History"
        data={commissions.slice(0, 20) as unknown as Record<string, unknown>[]}
        columns={commissionsTableColumns as any}
      />
    </div>
  );
}
