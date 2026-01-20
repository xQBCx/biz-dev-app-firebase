import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssetMapVisualizer } from "@/components/personal-corporation/AssetMapVisualizer";
import { LiabilityScanner } from "@/components/personal-corporation/LiabilityScanner";
import { PersonalPnLStatement } from "@/components/personal-corporation/PersonalPnLStatement";
import { WorkflowEfficiencyAnalyzer } from "@/components/personal-corporation/WorkflowEfficiencyAnalyzer";
import { BurnoutRiskMonitor } from "@/components/personal-corporation/BurnoutRiskMonitor";
import { LifecycleFlowVisualization } from "@/components/personal-corporation/LifecycleFlowVisualization";
import { Briefcase, TrendingUp, AlertTriangle, Workflow, Activity, RefreshCw } from "lucide-react";
import { useState } from "react";

const PersonalCorporation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("assets");

  const { data: latestSnapshot, isLoading: snapshotLoading, refetch: refetchSnapshot } = useQuery({
    queryKey: ['personal-asset-snapshot', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('personal_asset_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const { data: burnoutScore, isLoading: burnoutLoading } = useQuery({
    queryKey: ['burnout-risk-score', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('burnout_risk_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-500";
    if (score < 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return "Low Risk";
    if (score < 60) return "Moderate Risk";
    return "High Risk";
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-primary" />
            My Corporation
          </h1>
          <p className="text-muted-foreground mt-1">
            View yourself as an optimized economic entity with assets, liabilities, and workflows.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetchSnapshot()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Total Asset Value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${latestSnapshot?.total_asset_value?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {latestSnapshot?.snapshot_date || 'Never'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Network Size
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestSnapshot?.network_size || 0} contacts
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg strength: {latestSnapshot?.relationship_strength_avg || 0}/10
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Workflow className="h-4 w-4" />
              Spawned Businesses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestSnapshot?.spawned_businesses_count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              IP pieces: {latestSnapshot?.content_pieces_count || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Burnout Risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getRiskColor(burnoutScore?.overall_risk_score || 0)}`}>
                {burnoutScore?.overall_risk_score || 0}%
              </span>
              <Badge variant={burnoutScore?.overall_risk_score < 30 ? "default" : burnoutScore?.overall_risk_score < 60 ? "secondary" : "destructive"}>
                {getRiskLabel(burnoutScore?.overall_risk_score || 0)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Trend: {burnoutScore?.trend || 'stable'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto">
          <TabsTrigger value="lifecycle" className="text-xs md:text-sm">Lifecycle</TabsTrigger>
          <TabsTrigger value="assets" className="text-xs md:text-sm">Assets</TabsTrigger>
          <TabsTrigger value="liabilities" className="text-xs md:text-sm">Liabilities</TabsTrigger>
          <TabsTrigger value="pnl" className="text-xs md:text-sm">P&L</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs md:text-sm">Workflows</TabsTrigger>
          <TabsTrigger value="burnout" className="text-xs md:text-sm">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="lifecycle" className="space-y-4">
          <LifecycleFlowVisualization />
        </TabsContent>
          <TabsTrigger value="liabilities" className="text-xs md:text-sm">Liabilities</TabsTrigger>
          <TabsTrigger value="pnl" className="text-xs md:text-sm">P&L</TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs md:text-sm">Workflows</TabsTrigger>
          <TabsTrigger value="burnout" className="text-xs md:text-sm">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <AssetMapVisualizer snapshot={latestSnapshot} isLoading={snapshotLoading} />
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <LiabilityScanner />
        </TabsContent>

        <TabsContent value="pnl" className="space-y-4">
          <PersonalPnLStatement />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <WorkflowEfficiencyAnalyzer />
        </TabsContent>

        <TabsContent value="burnout" className="space-y-4">
          <BurnoutRiskMonitor burnoutScore={burnoutScore} isLoading={burnoutLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalCorporation;
