import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KPIGrid, TimeSeriesChart, DistributionChart, DataTable } from "@/components/analytics";
import { Radio, Trophy, TrendingUp, Users, MessageSquare, ThumbsUp } from "lucide-react";

export function BroadcastAnalytics() {
  const { data: achievements } = useQuery({
    queryKey: ["broadcast-achievements-analytics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bd_achievements")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: interactions } = useQuery({
    queryKey: ["broadcast-interactions-analytics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("achievement_interactions")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const stats = useMemo(() => {
    const verifiedAchievements = achievements?.filter(a => a.verified).length || 0;
    const totalInteractions = interactions?.length || 0;
    const likes = interactions?.filter(i => i.interaction_type === "like").length || 0;
    const comments = interactions?.filter(i => i.interaction_type === "comment").length || 0;

    // Group by date
    const achievementsByDate = (achievements || []).reduce((acc: Record<string, number>, a) => {
      const date = new Date(a.created_at).toISOString().slice(0, 10);
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const timeSeriesData = Object.entries(achievementsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, count]) => ({ date, achievements: count }));

    return {
      totalAchievements: achievements?.length || 0,
      verifiedAchievements,
      totalInteractions,
      likes,
      comments,
      timeSeriesData,
    };
  }, [achievements, interactions]);

  const achievementsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    (achievements || []).forEach(a => {
      counts[a.achievement_type || "general"] = (counts[a.achievement_type || "general"] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [achievements]);

  const interactionsByType = useMemo(() => [
    { name: "Likes", value: stats.likes },
    { name: "Comments", value: stats.comments },
    { name: "Other", value: stats.totalInteractions - stats.likes - stats.comments },
  ], [stats]);

  const kpis = [
    {
      title: "Total Achievements",
      value: stats.totalAchievements,
      icon: Trophy,
      trend: { value: 15, label: "vs last month" },
    },
    {
      title: "Verified",
      value: stats.verifiedAchievements,
      icon: Radio,
    },
    {
      title: "Total Interactions",
      value: stats.totalInteractions,
      icon: Users,
      trend: { value: 28, label: "vs last month" },
    },
    {
      title: "Engagement Rate",
      value: stats.totalAchievements > 0 
        ? `${((stats.totalInteractions / stats.totalAchievements) * 100).toFixed(1)}%`
        : "0%",
      icon: TrendingUp,
    },
  ];

  const achievementsTableColumns = [
    { key: "title" as const, label: "Title" },
    { key: "achievement_type" as const, label: "Type" },
    { key: "verified" as const, label: "Verified", render: (v: boolean) => v ? "Yes" : "No" },
    { key: "created_at" as const, label: "Date", render: (v: string) => new Date(v).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <KPIGrid items={kpis} columns={4} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TimeSeriesChart
          title="Achievements Over Time"
          description="New achievements submitted"
          data={stats.timeSeriesData}
          series={[{ key: "achievements", label: "Achievements", color: "hsl(var(--primary))" }]}
          type="area"
        />
        <DistributionChart
          title="Interactions Breakdown"
          data={interactionsByType}
          type="donut"
        />
      </div>

      <DistributionChart
        title="Achievements by Type"
        data={achievementsByType}
        type="pie"
        showLegend
      />

      <DataTable
        title="Recent Achievements"
        data={(achievements || []).slice(0, 20)}
        columns={achievementsTableColumns}
      />
    </div>
  );
}
