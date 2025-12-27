import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KPIGrid, TimeSeriesChart, DistributionChart, BarChart, DataTable } from "@/components/analytics";
import { Workflow, CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkflowAnalyticsProps {
  workflows: any[];
  recentRuns: any[];
}

export function WorkflowAnalytics({ workflows, recentRuns }: WorkflowAnalyticsProps) {
  const stats = useMemo(() => {
    const activeWorkflows = workflows.filter((w) => w.is_active).length;
    const completedRuns = recentRuns.filter((r) => r.status === "completed").length;
    const failedRuns = recentRuns.filter((r) => r.status === "failed").length;
    const successRate = recentRuns.length > 0 ? (completedRuns / recentRuns.length) * 100 : 0;

    // Group runs by date
    const runsByDate = recentRuns.reduce((acc: Record<string, { completed: number; failed: number }>, run) => {
      const date = new Date(run.started_at).toISOString().slice(0, 10);
      if (!acc[date]) acc[date] = { completed: 0, failed: 0 };
      if (run.status === "completed") acc[date].completed++;
      if (run.status === "failed") acc[date].failed++;
      return acc;
    }, {});

    const timeSeriesData = Object.entries(runsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, counts]) => ({ date, completed: counts.completed, failed: counts.failed }));

    return {
      totalWorkflows: workflows.length,
      activeWorkflows,
      completedRuns,
      failedRuns,
      successRate,
      timeSeriesData,
    };
  }, [workflows, recentRuns]);

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    workflows.forEach((w) => {
      const cat = w.category || "other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [workflows]);

  const triggerDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    recentRuns.forEach((r) => {
      const trigger = r.trigger_type || "manual";
      counts[trigger] = (counts[trigger] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [recentRuns]);

  const kpis = [
    {
      title: "Total Workflows",
      value: stats.totalWorkflows,
      icon: Workflow,
      trend: { value: 8, label: "this month" },
    },
    {
      title: "Active",
      value: stats.activeWorkflows,
      subtitle: `${stats.totalWorkflows - stats.activeWorkflows} paused`,
      icon: Zap,
    },
    {
      title: "Completed Runs",
      value: stats.completedRuns,
      icon: CheckCircle2,
      trend: { value: 15, label: "this week" },
    },
    {
      title: "Success Rate",
      value: `${stats.successRate.toFixed(0)}%`,
      subtitle: `${stats.failedRuns} failed`,
      icon: Clock,
      trend: { value: stats.successRate >= 90 ? 2 : -5, label: "change" },
    },
  ];

  const recentRunsColumns = [
    {
      key: "workflow_id" as const,
      label: "Workflow",
      render: (id: string) => {
        const wf = workflows.find((w) => w.id === id);
        return wf?.name || "Unknown";
      },
    },
    {
      key: "status" as const,
      label: "Status",
      render: (status: string) => (
        <Badge
          variant={status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary"}
        >
          {status}
        </Badge>
      ),
    },
    { key: "trigger_type" as const, label: "Trigger" },
    {
      key: "started_at" as const,
      label: "Started",
      render: (v: string) => new Date(v).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      <KPIGrid items={kpis} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          title="Run History"
          description="Completed vs failed runs"
          data={stats.timeSeriesData}
          series={[
            { key: "completed", label: "Completed", color: "hsl(142, 70%, 45%)" },
            { key: "failed", label: "Failed", color: "hsl(0, 70%, 50%)" },
          ]}
          type="line"
          height={280}
        />
        <div className="grid grid-cols-2 gap-4">
          <DistributionChart
            title="By Category"
            description="Workflow categories"
            data={categoryDistribution}
            type="donut"
            height={250}
            showLegend={false}
          />
          <DistributionChart
            title="Trigger Types"
            description="How runs are started"
            data={triggerDistribution}
            type="pie"
            height={250}
            showLegend={false}
          />
        </div>
      </div>

      <DataTable
        title="Recent Runs"
        description="Latest workflow executions"
        data={recentRuns.slice(0, 20)}
        columns={recentRunsColumns}
        searchable={false}
        pageSize={10}
      />
    </div>
  );
}
