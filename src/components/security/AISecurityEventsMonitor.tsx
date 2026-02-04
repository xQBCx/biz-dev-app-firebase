import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Info,
  Search,
  RefreshCw,
  Eye,
  Clock,
  MapPin,
  User,
  Activity,
  TrendingUp,
  Filter,
  Download,
  Bell,
} from "lucide-react";

interface SecurityEvent {
  id: string;
  eventType: string;
  eventAction: string;
  eventSource: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  outcome: "success" | "failure" | "blocked";
  userId: string | null;
  ipAddress: string;
  resourceType: string;
  riskScore: number;
  timestamp: string;
  threatIndicators: string[];
}

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "1",
    eventType: "authentication",
    eventAction: "login_attempt",
    eventSource: "auth_service",
    severity: "critical",
    outcome: "blocked",
    userId: null,
    ipAddress: "192.168.1.100",
    resourceType: "user_account",
    riskScore: 95,
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    threatIndicators: ["brute_force", "known_malicious_ip"],
  },
  {
    id: "2",
    eventType: "data_access",
    eventAction: "bulk_export",
    eventSource: "api_gateway",
    severity: "high",
    outcome: "success",
    userId: "user_123",
    ipAddress: "10.0.0.50",
    resourceType: "customer_data",
    riskScore: 78,
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    threatIndicators: ["unusual_volume", "off_hours_access"],
  },
  {
    id: "3",
    eventType: "permission_change",
    eventAction: "role_escalation",
    eventSource: "admin_panel",
    severity: "high",
    outcome: "failure",
    userId: "user_456",
    ipAddress: "172.16.0.25",
    resourceType: "user_roles",
    riskScore: 82,
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    threatIndicators: ["privilege_escalation_attempt"],
  },
  {
    id: "4",
    eventType: "api_access",
    eventAction: "rate_limit_exceeded",
    eventSource: "api_gateway",
    severity: "medium",
    outcome: "blocked",
    userId: "user_789",
    ipAddress: "203.0.113.45",
    resourceType: "api_endpoint",
    riskScore: 55,
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    threatIndicators: ["rate_limit_abuse"],
  },
  {
    id: "5",
    eventType: "file_access",
    eventAction: "download",
    eventSource: "storage_service",
    severity: "low",
    outcome: "success",
    userId: "user_321",
    ipAddress: "10.0.0.100",
    resourceType: "document",
    riskScore: 25,
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    threatIndicators: [],
  },
  {
    id: "6",
    eventType: "agent_execution",
    eventAction: "unauthorized_tool_call",
    eventSource: "agent_runtime",
    severity: "critical",
    outcome: "blocked",
    userId: null,
    ipAddress: "internal",
    resourceType: "agent_tool",
    riskScore: 92,
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    threatIndicators: ["agent_boundary_violation", "tool_injection"],
  },
];

const threatStats = {
  critical: 2,
  high: 3,
  medium: 8,
  low: 15,
  blockedToday: 45,
  investigationsPending: 5,
};

export default function AISecurityEventsMonitor() {
  const [events] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "bg-destructive text-destructive-foreground",
      high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      info: "bg-muted text-muted-foreground",
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Shield className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    const colors = {
      success: "text-green-400",
      failure: "text-red-400",
      blocked: "text-orange-400",
    };
    return colors[outcome as keyof typeof colors] || "text-muted-foreground";
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.eventAction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.resourceType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity =
      selectedSeverity === "all" || event.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Security Events Monitor</h1>
            <p className="text-muted-foreground">
              Real-time threat detection and incident response
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Threat Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-destructive">
                    {threatStats.critical}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-500/50 bg-orange-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">High</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {threatStats.high}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Medium</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {threatStats.medium}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-yellow-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/50 bg-blue-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Low</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {threatStats.low}
                  </p>
                </div>
                <Info className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Blocked Today</p>
                  <p className="text-2xl font-bold text-green-400">
                    {threatStats.blockedToday}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {threatStats.investigationsPending}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">Live Events</TabsTrigger>
            <TabsTrigger value="threats">Active Threats</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {["all", "critical", "high", "medium", "low"].map((sev) => (
                  <Button
                    key={sev}
                    variant={selectedSeverity === sev ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSeverity(sev)}
                    className="capitalize"
                  >
                    {sev}
                  </Button>
                ))}
              </div>
            </div>

            {/* Events List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Security Events ({filteredEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}
                            >
                              {getSeverityIcon(event.severity)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium capitalize">
                                  {event.eventAction.replace(/_/g, " ")}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {event.eventType}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getOutcomeColor(event.outcome)}`}
                                >
                                  {event.outcome}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(event.timestamp)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.ipAddress}
                                </span>
                                {event.userId && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {event.userId}
                                  </span>
                                )}
                              </div>
                              {event.threatIndicators.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  {event.threatIndicators.map((indicator) => (
                                    <Badge
                                      key={indicator}
                                      variant="secondary"
                                      className="text-xs bg-destructive/20 text-destructive"
                                    >
                                      {indicator.replace(/_/g, " ")}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                Risk Score
                              </p>
                              <p
                                className={`text-lg font-bold ${
                                  event.riskScore >= 80
                                    ? "text-destructive"
                                    : event.riskScore >= 50
                                      ? "text-orange-400"
                                      : "text-green-400"
                                }`}
                              >
                                {event.riskScore}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="threats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  Active Threat Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Brute Force Attack Pattern",
                      severity: "critical",
                      occurrences: 23,
                      lastSeen: "2 minutes ago",
                    },
                    {
                      name: "Unusual Data Export Volume",
                      severity: "high",
                      occurrences: 5,
                      lastSeen: "15 minutes ago",
                    },
                    {
                      name: "Agent Boundary Violation",
                      severity: "critical",
                      occurrences: 2,
                      lastSeen: "5 minutes ago",
                    },
                    {
                      name: "Rate Limit Abuse",
                      severity: "medium",
                      occurrences: 45,
                      lastSeen: "1 hour ago",
                    },
                  ].map((threat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                        <div>
                          <p className="font-medium">{threat.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last seen: {threat.lastSeen}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {threat.occurrences}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            occurrences
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Investigate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Event Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Authentication Events", value: 1240, change: "+12%" },
                      { label: "Data Access Events", value: 856, change: "-5%" },
                      { label: "Permission Changes", value: 45, change: "+23%" },
                      { label: "Agent Executions", value: 2341, change: "+8%" },
                    ].map((metric, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted-foreground">
                          {metric.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{metric.value}</span>
                          <Badge
                            variant="outline"
                            className={
                              metric.change.startsWith("+")
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {metric.change}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: "Critical (80-100)", percent: 8, color: "bg-destructive" },
                      { label: "High (60-79)", percent: 15, color: "bg-orange-500" },
                      { label: "Medium (40-59)", percent: 32, color: "bg-yellow-500" },
                      { label: "Low (0-39)", percent: 45, color: "bg-green-500" },
                    ].map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span>{item.percent}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} transition-all`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
