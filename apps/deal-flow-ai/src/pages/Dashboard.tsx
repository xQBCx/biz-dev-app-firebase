import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { Home, Users, TrendingUp, DollarSign, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBuyers: 0,
    activeDeals: 0,
    totalSpread: 0,
  });

  const [pipelineData, setPipelineData] = useState([
    { name: "New Leads", count: 0, color: "hsl(var(--muted-foreground))" },
    { name: "Analyzed", count: 0, color: "hsl(var(--info))" },
    { name: "Seller Outreach", count: 0, color: "hsl(var(--warning))" },
    { name: "Under Contract", count: 0, color: "hsl(var(--secondary))" },
    { name: "Buyer Marketing", count: 0, color: "hsl(var(--success))" },
    { name: "Closed", count: 0, color: "hsl(var(--primary))" },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch properties count
    const { count: propertiesCount } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true });

    // Fetch buyers count
    const { count: buyersCount } = await supabase
      .from("buyers")
      .select("*", { count: "exact", head: true })
      .eq("status", "ACTIVE");

    // Fetch active deals (not CLOSED or DEAD)
    const { count: activeDealsCount } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .not("status", "in", '("CLOSED","DEAD")');

    // Fetch total spread
    const { data: spreadsData } = await supabase
      .from("properties")
      .select("spread")
      .not("spread", "is", null);

    const totalSpread = spreadsData?.reduce((sum, item) => sum + (Number(item.spread) || 0), 0) || 0;

    // Fetch pipeline data
    const { data: pipelineCountsData } = await supabase
      .from("properties")
      .select("status");

    const stageCounts = pipelineCountsData?.reduce((acc: any, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    setPipelineData([
      { name: "New Leads", count: stageCounts?.NEW_LEAD || 0, color: "hsl(var(--muted-foreground))" },
      { name: "Analyzed", count: stageCounts?.ANALYZED || 0, color: "hsl(var(--info))" },
      { name: "Seller Outreach", count: (stageCounts?.SELLER_OUTREACH || 0) + (stageCounts?.SELLER_NEGOTIATING || 0), color: "hsl(var(--warning))" },
      { name: "Under Contract", count: stageCounts?.UNDER_CONTRACT || 0, color: "hsl(var(--secondary))" },
      { name: "Buyer Marketing", count: (stageCounts?.BUYER_MARKETING || 0) + (stageCounts?.BUYER_FOUND || 0), color: "hsl(var(--success))" },
      { name: "Closed", count: stageCounts?.CLOSED || 0, color: "hsl(var(--primary))" },
    ]);

    setStats({
      totalProperties: propertiesCount || 0,
      totalBuyers: buyersCount || 0,
      activeDeals: activeDealsCount || 0,
      totalSpread: totalSpread,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your real estate wholesaling pipeline
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Properties"
            value={stats.totalProperties}
            icon={Home}
            description="All properties in system"
          />
          <StatsCard
            title="Active Buyers"
            value={stats.totalBuyers}
            icon={Users}
            description="Ready to close deals"
          />
          <StatsCard
            title="Active Deals"
            value={stats.activeDeals}
            icon={TrendingUp}
            description="In progress"
          />
          <StatsCard
            title="Total Spread"
            value={`$${stats.totalSpread.toLocaleString()}`}
            icon={DollarSign}
            description="Projected profit"
          />
        </div>

        {/* Pipeline Chart */}
        <PipelineChart stages={pipelineData} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link to="/properties">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Upload className="h-5 w-5 text-secondary" />
                <span className="font-semibold">Import Properties</span>
                <span className="text-xs text-muted-foreground">Upload CSV of new leads</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2" disabled>
              <Sparkles className="h-5 w-5 text-secondary" />
              <span className="font-semibold">AI Analysis</span>
              <span className="text-xs text-muted-foreground">Coming soon</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
