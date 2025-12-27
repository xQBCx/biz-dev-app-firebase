import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KPIGrid, TimeSeriesChart, DistributionChart, FunnelChart, DataTable } from "@/components/analytics";
import { Handshake, DollarSign, Users, FileCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DealRoom {
  id: string;
  name: string;
  category: string;
  status: string;
  expected_deal_size_min: number | null;
  expected_deal_size_max: number | null;
  participant_count?: number;
  created_at: string;
}

interface DealRoomAnalyticsProps {
  dealRooms: DealRoom[];
}

export function DealRoomAnalytics({ dealRooms }: DealRoomAnalyticsProps) {
  const stats = useMemo(() => {
    const activeRooms = dealRooms.filter((r) => r.status === "active" || r.status === "voting").length;
    const executedRooms = dealRooms.filter((r) => r.status === "executed").length;
    const totalParticipants = dealRooms.reduce((sum, r) => sum + (r.participant_count || 0), 0);

    const totalDealValue = dealRooms.reduce((sum, r) => {
      const avgValue = ((r.expected_deal_size_min || 0) + (r.expected_deal_size_max || 0)) / 2;
      return sum + avgValue;
    }, 0);

    // Group by month
    const roomsByMonth = dealRooms.reduce((acc: Record<string, number>, r) => {
      const month = new Date(r.created_at).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const timeSeriesData = Object.entries(roomsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([date, count]) => ({ date, rooms: count }));

    return {
      totalRooms: dealRooms.length,
      activeRooms,
      executedRooms,
      totalParticipants,
      totalDealValue,
      timeSeriesData,
    };
  }, [dealRooms]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    dealRooms.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [dealRooms]);

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    dealRooms.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [dealRooms]);

  const statusFunnel = [
    { name: "Draft", value: dealRooms.filter((r) => r.status === "draft").length },
    { name: "Active", value: dealRooms.filter((r) => r.status === "active").length },
    { name: "Voting", value: dealRooms.filter((r) => r.status === "voting").length },
    { name: "Approved", value: dealRooms.filter((r) => r.status === "approved").length },
    { name: "Executed", value: dealRooms.filter((r) => r.status === "executed").length },
  ];

  const kpis = [
    {
      title: "Total Deal Rooms",
      value: stats.totalRooms,
      icon: Handshake,
      trend: { value: 10, label: "this month" },
    },
    {
      title: "Active Rooms",
      value: stats.activeRooms,
      icon: FileCheck,
    },
    {
      title: "Total Value",
      value: `$${(stats.totalDealValue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      trend: { value: 25, label: "pipeline" },
    },
    {
      title: "Participants",
      value: stats.totalParticipants,
      icon: Users,
    },
  ];

  const roomsTableColumns = [
    { key: "name" as const, label: "Name", sortable: true },
    { key: "category" as const, label: "Category", sortable: true },
    {
      key: "status" as const,
      label: "Status",
      render: (s: string) => <Badge variant="outline">{s}</Badge>,
    },
    {
      key: "expected_deal_size_max" as const,
      label: "Est. Value",
      render: (v: number | null) => (v ? `$${(v / 1000).toFixed(0)}K` : "TBD"),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <KPIGrid items={kpis} columns={4} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          title="Deal Rooms Created"
          description="New rooms over time"
          data={stats.timeSeriesData}
          series={[{ key: "rooms", label: "Rooms", color: "hsl(0, 0%, 30%)" }]}
          type="area"
          height={280}
        />
        <FunnelChart
          title="Deal Room Pipeline"
          description="Status progression"
          data={statusFunnel}
          showConversion
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistributionChart
          title="By Status"
          description="Room status breakdown"
          data={statusDistribution}
          type="donut"
          height={280}
        />
        <DistributionChart
          title="By Category"
          description="Deal types"
          data={categoryDistribution}
          type="pie"
          height={280}
        />
      </div>

      <DataTable
        title="All Deal Rooms"
        description="Complete list with metrics"
        data={dealRooms.map(r => ({ ...r } as Record<string, unknown>))}
        columns={roomsTableColumns as any}
        pageSize={10}
      />
    </div>
  );
}
