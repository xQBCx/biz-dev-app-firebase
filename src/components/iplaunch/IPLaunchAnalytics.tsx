import { useMemo } from "react";
import { KPIGrid, TimeSeriesChart, DistributionChart, FunnelChart, DataTable } from "@/components/analytics";
import { FileText, Stamp, CheckCircle2, Clock, DollarSign } from "lucide-react";

interface Application {
  id: string;
  application_type: string;
  sub_type: string;
  status: string;
  payment_model: string;
  invention_title?: string;
  mark_text?: string;
  created_at: string;
  applicant_name: string;
}

interface IPLaunchAnalyticsProps {
  applications: Application[];
}

export function IPLaunchAnalytics({ applications }: IPLaunchAnalyticsProps) {
  const stats = useMemo(() => {
    const patents = applications.filter(a => a.application_type === "patent").length;
    const trademarks = applications.filter(a => a.application_type === "trademark").length;
    const pending = applications.filter(a => a.status === "pending_review" || a.status === "pending_payment").length;
    const filed = applications.filter(a => a.status === "filed").length;
    const approved = applications.filter(a => a.status === "approved").length;

    // Group by date
    const appsByDate = applications.reduce((acc: Record<string, number>, app) => {
      const date = new Date(app.created_at).toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const timeSeriesData = Object.entries(appsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, count]) => ({ date, applications: count }));

    return {
      total: applications.length,
      patents,
      trademarks,
      pending,
      filed,
      approved,
      timeSeriesData,
    };
  }, [applications]);

  const typeDistribution = useMemo(() => [
    { name: "Patents", value: stats.patents },
    { name: "Trademarks", value: stats.trademarks },
  ], [stats]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => {
      const label = a.status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const paymentModelDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => {
      const label = a.payment_model === "pay" ? "Standard Fee" : "Equity Share";
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const statusFunnel = [
    { name: "Total Applications", value: stats.total },
    { name: "Under Review", value: stats.pending + stats.filed + stats.approved },
    { name: "Filed with USPTO", value: stats.filed + stats.approved },
    { name: "Approved", value: stats.approved },
  ];

  const kpis = [
    {
      title: "Total Applications",
      value: stats.total,
      icon: FileText,
    },
    {
      title: "Patents",
      value: stats.patents,
      icon: FileText,
      trend: { value: 20, label: "vs last month" },
    },
    {
      title: "Trademarks",
      value: stats.trademarks,
      icon: Stamp,
      trend: { value: 15, label: "vs last month" },
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
    },
  ];

  const applicationsTableColumns = [
    { 
      key: "invention_title" as const, 
      label: "Title",
      render: (v: string | undefined, row: Application) => v || row.mark_text || "Untitled"
    },
    { key: "application_type" as const, label: "Type" },
    { key: "status" as const, label: "Status" },
    { key: "payment_model" as const, label: "Payment" },
  ];

  return (
    <div className="space-y-6">
      <KPIGrid items={kpis} columns={4} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TimeSeriesChart
          title="Applications Over Time"
          description="New IP applications submitted"
          data={stats.timeSeriesData}
          series={[{ key: "applications", label: "Applications", color: "hsl(var(--primary))" }]}
          type="area"
        />
        <FunnelChart
          title="Application Pipeline"
          description="From submission to approval"
          data={statusFunnel}
          showConversion
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DistributionChart
          title="By Type"
          data={typeDistribution}
          type="donut"
        />
        <DistributionChart
          title="By Status"
          data={statusDistribution}
          type="pie"
        />
        <DistributionChart
          title="Payment Model"
          data={paymentModelDistribution}
          type="donut"
        />
      </div>

      <DataTable
        title="All Applications"
        data={applications as unknown as Record<string, unknown>[]}
        columns={applicationsTableColumns as any}
      />
    </div>
  );
}
