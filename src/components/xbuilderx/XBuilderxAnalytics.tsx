import { useMemo } from "react";
import { KPIGrid, DistributionChart, BarChart, DataTable } from "@/components/analytics";
import { Globe, DollarSign, Building2, Target, TrendingUp, Users } from "lucide-react";

interface XBuilderxAnalyticsProps {
  opportunities: any[];
  regionalData: any[];
  sectorData: any[];
}

export function XBuilderxAnalytics({ opportunities, regionalData, sectorData }: XBuilderxAnalyticsProps) {
  const stats = useMemo(() => {
    const totalValue = opportunities.reduce((sum, o) => {
      const value = parseFloat(o.value?.replace(/[$TB,]/g, "") || "0");
      return sum + value;
    }, 0);

    const avgMatchScore = opportunities.length > 0
      ? opportunities.reduce((sum, o) => sum + (o.matchScore || 0), 0) / opportunities.length
      : 0;

    return {
      totalOpportunities: opportunities.length,
      totalValue,
      avgMatchScore: Math.round(avgMatchScore),
      totalRegions: regionalData.length,
      totalSectors: sectorData.length,
    };
  }, [opportunities, regionalData, sectorData]);

  const opportunitiesByStage = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach(o => {
      counts[o.stage || "Unknown"] = (counts[o.stage || "Unknown"] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [opportunities]);

  const opportunitiesByType = useMemo(() => {
    const counts: Record<string, number> = {};
    opportunities.forEach(o => {
      counts[o.type || "Other"] = (counts[o.type || "Other"] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [opportunities]);

  const regionalBarData = useMemo(() => 
    regionalData.map(r => ({
      name: r.region,
      projects: r.projects,
    }))
  , [regionalData]);

  const sectorBarData = useMemo(() =>
    sectorData.map(s => ({
      name: s.name,
      count: s.count,
    }))
  , [sectorData]);

  const kpis = [
    {
      title: "Active Opportunities",
      value: stats.totalOpportunities,
      icon: Target,
      trend: { value: 23, label: "vs last month" },
    },
    {
      title: "Pipeline Value",
      value: `$${stats.totalValue.toFixed(1)}B`,
      icon: DollarSign,
      trend: { value: 15, label: "vs last month" },
    },
    {
      title: "Avg Match Score",
      value: `${stats.avgMatchScore}%`,
      icon: TrendingUp,
    },
    {
      title: "Regions Covered",
      value: stats.totalRegions,
      icon: Globe,
    },
  ];

  const opportunitiesTableColumns = [
    { key: "title", label: "Project" },
    { key: "country", label: "Country" },
    { key: "value", label: "Value" },
    { key: "stage", label: "Stage" },
    { key: "matchScore", label: "Match", render: (v: number) => `${v}%` },
  ];

  return (
    <div className="space-y-6">
      <KPIGrid items={kpis} columns={4} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionChart
          title="Opportunities by Stage"
          data={opportunitiesByStage}
          type="donut"
        />
        <DistributionChart
          title="Opportunities by Type"
          data={opportunitiesByType}
          type="pie"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart
          title="Projects by Region"
          description="Active opportunities per region"
          data={regionalBarData}
          series={[{ key: "projects", label: "Projects", color: "hsl(var(--primary))" }]}
        />
        <BarChart
          title="Projects by Sector"
          description="Opportunities per sector"
          data={sectorBarData}
          series={[{ key: "count", label: "Count", color: "hsl(var(--chart-2))" }]}
        />
      </div>

      <DataTable
        title="Top Opportunities"
        data={opportunities.slice(0, 10)}
        columns={opportunitiesTableColumns}
      />
    </div>
  );
}
