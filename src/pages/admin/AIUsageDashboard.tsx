import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  DollarSign,
  Zap,
  AlertTriangle,
  RefreshCw,
  Download,
  Bot,
  Workflow,
} from "lucide-react";
import { useAIUsageAnalytics } from "@/hooks/useAIUsageAnalytics";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { TopAgentsTable } from "@/components/admin/TopAgentsTable";
import { TopWorkflowsTable } from "@/components/admin/TopWorkflowsTable";

export default function AIUsageDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const {
    dailyUsage,
    topAgents,
    topWorkflows,
    summary,
    blockedAgents,
    blockedWorkflows,
    isLoading,
    refetch,
  } = useAIUsageAnalytics();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const chartData = dailyUsage.map((d) => ({
    date: d.usage_date,
    requests: d.total_requests,
    tokens: d.total_tokens / 1000, // Show in K
    cost: d.total_cost,
  }));

  const hasBlockedItems = blockedAgents.length > 0 || blockedWorkflows.length > 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Usage Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor AI costs, usage patterns, and limit enforcement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Blocked Items Alert */}
      {hasBlockedItems && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Automations Paused</AlertTitle>
          <AlertDescription>
            {blockedAgents.length > 0 && (
              <span>
                {blockedAgents.length} agent{blockedAgents.length > 1 ? "s" : ""} hit their daily cap.{" "}
              </span>
            )}
            {blockedWorkflows.length > 0 && (
              <span>
                {blockedWorkflows.length} workflow{blockedWorkflows.length > 1 ? "s" : ""} hit their daily cap or have AI disabled.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totalRequests)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.totalTokens)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blocked Runs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.blockedRuns}</div>
            <p className="text-xs text-muted-foreground">
              {summary.blockedRuns > 0 ? "Limit hits detected" : "All within limits"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <TimeSeriesChart
        title="Daily AI Usage Trends"
        description="Requests, tokens (K), and cost over the last 30 days"
        data={chartData}
        series={[
          { key: "requests", label: "Requests", color: "hsl(var(--primary))" },
          { key: "tokens", label: "Tokens (K)", color: "hsl(var(--chart-2))" },
          { key: "cost", label: "Cost ($)", color: "hsl(var(--chart-3))" },
        ]}
        type="area"
        height={300}
      />

      {/* Top Agents & Workflows Tables */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Top Agents
            {blockedAgents.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {blockedAgents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Top Workflows
            {blockedWorkflows.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {blockedWorkflows.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Top Agents by Usage</CardTitle>
              <CardDescription>
                Agents ranked by total cost in the last 7 days. Click to view details or configure limits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopAgentsTable agents={topAgents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Top Workflows by Usage</CardTitle>
              <CardDescription>
                Workflows ranked by total credits consumed in the last 7 days. Click to configure limits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopWorkflowsTable workflows={topWorkflows} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
