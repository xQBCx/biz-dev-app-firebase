import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { 
  TrendingUp, 
  Award, 
  Zap, 
  DollarSign,
  Activity
} from "lucide-react";

interface BlenderAnalyticsProps {
  dealRoomId: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142 76% 36%)",
  "hsl(48 96% 53%)",
  "hsl(221 83% 53%)",
  "hsl(262 83% 58%)",
  "hsl(0 84% 60%)",
];

export const BlenderAnalytics = ({ dealRoomId }: BlenderAnalyticsProps) => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [usageCredits, setUsageCredits] = useState<any[]>([]);
  const [valueCredits, setValueCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dealRoomId]);

  const fetchData = async () => {
    try {
      const [contribRes, usageRes, valueRes] = await Promise.all([
        supabase.from("credit_contributions").select("*").eq("deal_room_id", dealRoomId),
        supabase.from("credit_usage").select("*"),
        supabase.from("credit_value").select("*").eq("deal_room_id", dealRoomId),
      ]);

      setContributions(contribRes.data || []);
      setUsageCredits(usageRes.data || []);
      setValueCredits(valueRes.data || []);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalContributions = contributions.reduce((sum, c) => sum + (c.credit_amount || 0), 0);
    const totalUsage = usageCredits.reduce((sum, u) => sum + (u.usage_count || 0), 0);
    const totalValue = valueCredits.reduce((sum, v) => sum + (v.amount || 0), 0);
    const roi = totalContributions > 0 ? ((totalValue / totalContributions) * 100) : 0;
    return { totalContributions, totalUsage, totalValue, roi };
  }, [contributions, usageCredits, valueCredits]);

  const contributionsByClassification = useMemo(() => {
    const grouped: Record<string, number> = {};
    contributions.forEach((c) => {
      const key = c.classification || "other";
      grouped[key] = (grouped[key] || 0) + (c.credit_amount || 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [contributions]);

  const usageByType = useMemo(() => {
    const grouped: Record<string, number> = {};
    usageCredits.forEach((u) => {
      const key = u.usage_type || "other";
      grouped[key] = (grouped[key] || 0) + (u.usage_count || 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [usageCredits]);

  const valueOverTime = useMemo(() => {
    const grouped: Record<string, number> = {};
    valueCredits.forEach((v) => {
      const date = new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      grouped[date] = (grouped[date] || 0) + (v.amount || 0);
    });
    return Object.entries(grouped).map(([date, value]) => ({ date, value }));
  }, [valueCredits]);

  if (loading) {
    return <Card className="p-6"><div className="animate-pulse h-64 bg-muted rounded" /></Card>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Blender Analytics
        </h2>
        <p className="text-sm text-muted-foreground">Credit distribution, usage patterns, and ROI metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Award className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Contributions</p>
              <p className="text-2xl font-bold">{stats.totalContributions.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Zap className="w-5 h-5 text-blue-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Usage</p>
              <p className="text-2xl font-bold">{stats.totalUsage.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><DollarSign className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Value</p>
              <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><TrendingUp className="w-5 h-5 text-amber-500" /></div>
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="text-2xl font-bold">{stats.roi.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="distribution">
        <TabsList>
          <TabsTrigger value="distribution">Credits</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="value">Value</TabsTrigger>
        </TabsList>
        <TabsContent value="distribution" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">By Classification</h3>
            {contributionsByClassification.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No data</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={contributionsByClassification} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name }) => name}>
                      {contributionsByClassification.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="usage" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">By Type</h3>
            {usageByType.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No data</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageByType}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="value" className="mt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Over Time</h3>
            {valueOverTime.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">No data</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={valueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Line type="monotone" dataKey="value" stroke="hsl(142 76% 36%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
