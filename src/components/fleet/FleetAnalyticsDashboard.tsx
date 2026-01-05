import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Bot, 
  CheckCircle, 
  Clock, 
  Cpu, 
  DollarSign,
  Download,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";

interface FleetMetric {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down" | "neutral";
}

interface AgentPerformance {
  id: string;
  name: string;
  category: string;
  status: "active" | "idle" | "error";
  successRate: number;
  avgLatency: number;
  tasksCompleted: number;
  creditsEarned: number;
  lastRun: string;
}

interface ResourceUsage {
  resource: string;
  current: number;
  limit: number;
  unit: string;
}

export default function FleetAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fleetMetrics: FleetMetric[] = [
    { label: "Active Agents", value: "24", change: 12, icon: <Bot className="h-4 w-4" />, trend: "up" },
    { label: "Tasks Completed", value: "1,847", change: 23, icon: <CheckCircle className="h-4 w-4" />, trend: "up" },
    { label: "Avg Success Rate", value: "94.2%", change: 2.1, icon: <Activity className="h-4 w-4" />, trend: "up" },
    { label: "Total Credits", value: "12,450", change: -5, icon: <DollarSign className="h-4 w-4" />, trend: "down" },
  ];

  const agentPerformance: AgentPerformance[] = [
    { id: "1", name: "Sales Prospector", category: "sales", status: "active", successRate: 96.5, avgLatency: 1.2, tasksCompleted: 342, creditsEarned: 2840, lastRun: "2 min ago" },
    { id: "2", name: "Invoice Processor", category: "finance", status: "active", successRate: 99.1, avgLatency: 0.8, tasksCompleted: 521, creditsEarned: 3120, lastRun: "5 min ago" },
    { id: "3", name: "Content Generator", category: "marketing", status: "idle", successRate: 87.3, avgLatency: 2.4, tasksCompleted: 189, creditsEarned: 1560, lastRun: "1 hour ago" },
    { id: "4", name: "Task Scheduler", category: "operations", status: "active", successRate: 94.8, avgLatency: 0.5, tasksCompleted: 478, creditsEarned: 2890, lastRun: "1 min ago" },
    { id: "5", name: "Lead Qualifier", category: "sales", status: "error", successRate: 72.1, avgLatency: 3.1, tasksCompleted: 156, creditsEarned: 890, lastRun: "15 min ago" },
    { id: "6", name: "Report Builder", category: "analytics", status: "active", successRate: 91.4, avgLatency: 1.8, tasksCompleted: 161, creditsEarned: 1150, lastRun: "10 min ago" },
  ];

  const resourceUsage: ResourceUsage[] = [
    { resource: "Compute Tokens", current: 847500, limit: 1000000, unit: "tokens" },
    { resource: "API Calls", current: 12847, limit: 50000, unit: "calls" },
    { resource: "Storage", current: 2.4, limit: 10, unit: "GB" },
    { resource: "Concurrent Agents", current: 8, limit: 25, unit: "agents" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "idle": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "error": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredAgents = selectedCategory === "all" 
    ? agentPerformance 
    : agentPerformance.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Fleet Analytics</h1>
          <p className="text-muted-foreground">Monitor and optimize your agent fleet performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Fleet Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {fleetMetrics.map((metric) => (
          <Card key={metric.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {metric.icon}
                </div>
                <Badge variant="outline" className={metric.trend === "up" ? "text-green-400" : "text-red-400"}>
                  {metric.trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(metric.change)}%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="performance">Agent Performance</TabsTrigger>
          <TabsTrigger value="resources">Resource Usage</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Performance Table */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Agent Performance Metrics
              </CardTitle>
              <CardDescription>Individual agent statistics and health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Agent</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Success Rate</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">Latency</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">Tasks</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Credits</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">Last Run</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent) => (
                      <tr key={agent.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">{agent.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{agent.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={agent.successRate} 
                              className="w-16 h-2"
                            />
                            <span className={agent.successRate >= 90 ? "text-green-400" : agent.successRate >= 75 ? "text-yellow-400" : "text-red-400"}>
                              {agent.successRate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">
                          {agent.avgLatency}s
                        </td>
                        <td className="py-3 px-2 text-foreground hidden md:table-cell">
                          {agent.tasksCompleted.toLocaleString()}
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-primary font-medium">{agent.creditsEarned.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell">
                          {agent.lastRun}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {resourceUsage.map((resource) => (
              <Card key={resource.resource} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{resource.resource}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {resource.current.toLocaleString()} / {resource.limit.toLocaleString()} {resource.unit}
                    </span>
                  </div>
                  <Progress 
                    value={(resource.current / resource.limit) * 100} 
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {((resource.current / resource.limit) * 100).toFixed(1)}% utilized
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Cost Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Idle Agent Detected</p>
                  <p className="text-sm text-muted-foreground">Content Generator has been idle for 1 hour. Consider scheduling or disabling.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <TrendingDown className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Token Usage Optimized</p>
                  <p className="text-sm text-muted-foreground">Invoice Processor reduced token usage by 15% through caching.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">98.5%</p>
                <p className="text-sm text-muted-foreground">System Uptime</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">1.4s</p>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Fleet Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-3xl font-bold text-green-400">4</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-3xl font-bold text-yellow-400">1</p>
                  <p className="text-sm text-muted-foreground">Idle</p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-3xl font-bold text-red-400">1</p>
                  <p className="text-sm text-muted-foreground">Error</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
