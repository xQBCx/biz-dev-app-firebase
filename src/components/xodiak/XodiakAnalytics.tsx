import { useMemo } from "react";
import { KPIGrid, DistributionChart, BarChart } from "@/components/analytics";
import { DollarSign, TrendingUp, Users, Shield, Globe, Zap } from "lucide-react";

interface XodiakAnalyticsProps {
  stats: {
    title: string;
    value: string;
    subtitle: string;
    trend: string | null;
  }[];
  adoption: { label: string; value: string }[];
  capabilities: { label: string; value: string }[];
}

export function XodiakAnalytics({ stats, adoption, capabilities }: XodiakAnalyticsProps) {
  const kpis = useMemo(() => [
    {
      title: "Target Capacity",
      value: "$200T+",
      subtitle: "Global infrastructure",
      icon: DollarSign,
    },
    {
      title: "Global Transactions",
      value: "847M",
      icon: TrendingUp,
      trend: { value: 23.1, label: "vs last month" },
    },
    {
      title: "Active Organizations",
      value: "12,847",
      icon: Users,
      trend: { value: 156, label: "new this week" },
    },
    {
      title: "Compliance Score",
      value: "99.8%",
      icon: Shield,
    },
  ], []);

  const adoptionData = useMemo(() => 
    adoption.map(a => ({
      name: a.label,
      value: parseInt(a.value.replace(/[^0-9]/g, "")) || 0,
    }))
  , [adoption]);

  const capabilityData = useMemo(() => [
    { category: "Throughput", value: 1000000 },
    { category: "Security", value: 100 },
    { category: "Settlement", value: 3 },
    { category: "Compliance", value: 99.8 },
  ], []);

  const platformMetrics = useMemo(() => [
    { name: "Governments", value: 127 },
    { name: "Enterprises", value: 342 },
    { name: "NGOs", value: 1247 },
  ], []);

  return (
    <div className="space-y-6">
      <KPIGrid items={kpis} columns={4} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionChart
          title="Platform Adoption"
          description="Users by organization type"
          data={platformMetrics}
          type="donut"
        />
        <BarChart
          title="Adoption by Sector"
          description="Organizations using XODIAK"
          data={adoptionData.map(d => ({ name: d.name, count: d.value }))}
          series={[{ key: "count", label: "Count", color: "hsl(var(--primary))" }]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DistributionChart
          title="Transaction Volume"
          data={[
            { name: "Cross-Border", value: 45 },
            { name: "Domestic", value: 35 },
            { name: "Institutional", value: 20 },
          ]}
          type="pie"
        />
        <DistributionChart
          title="Compliance by Region"
          data={[
            { name: "Americas", value: 99.9 },
            { name: "Europe", value: 99.8 },
            { name: "Asia-Pacific", value: 99.7 },
            { name: "Africa", value: 99.5 },
          ]}
          type="donut"
        />
        <DistributionChart
          title="Security Posture"
          data={[
            { name: "Quantum-Safe", value: 85 },
            { name: "Traditional", value: 15 },
          ]}
          type="donut"
        />
      </div>
    </div>
  );
}
