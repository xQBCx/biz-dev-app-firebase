import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Brain, 
  Network, 
  Zap, 
  MessageSquare, 
  Settings, 
  Activity,
  Target,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  Shield,
  TrendingUp,
  Users,
  Wallet,
  Calendar,
  FileText,
  Send
} from "lucide-react";

// Agent types with their specializations
const EXPERT_AGENTS = [
  {
    id: "crm-agent",
    name: "CRM Agent",
    icon: Users,
    category: "sales",
    description: "Deal tracking, pipeline management, contact intelligence",
    capabilities: ["deal_analysis", "contact_lookup", "pipeline_forecast"],
    status: "active",
    queriesHandled: 1247,
    avgResponseTime: 1.2,
    successRate: 94.5,
    memoryItems: 156
  },
  {
    id: "finance-agent",
    name: "Finance Agent",
    icon: Wallet,
    category: "finance",
    description: "Revenue tracking, expense analysis, financial forecasting",
    capabilities: ["revenue_report", "expense_tracking", "cash_flow"],
    status: "active",
    queriesHandled: 892,
    avgResponseTime: 1.8,
    successRate: 97.2,
    memoryItems: 89
  },
  {
    id: "task-agent",
    name: "Task Agent",
    icon: Target,
    category: "operations",
    description: "Task scheduling, priority optimization, deadline management",
    capabilities: ["task_creation", "priority_sort", "deadline_alert"],
    status: "active",
    queriesHandled: 2156,
    avgResponseTime: 0.9,
    successRate: 98.1,
    memoryItems: 234
  },
  {
    id: "collaboration-agent",
    name: "Collaboration Agent",
    icon: Network,
    category: "operations",
    description: "Partner coordination, deal room management, attribution",
    capabilities: ["partner_match", "deal_room_setup", "credit_split"],
    status: "active",
    queriesHandled: 456,
    avgResponseTime: 2.1,
    successRate: 91.8,
    memoryItems: 67
  },
  {
    id: "automation-agent",
    name: "Automation Agent",
    icon: Zap,
    category: "automation",
    description: "Workflow orchestration, trigger management, process optimization",
    capabilities: ["workflow_run", "trigger_setup", "process_audit"],
    status: "active",
    queriesHandled: 1089,
    avgResponseTime: 1.5,
    successRate: 95.6,
    memoryItems: 112
  },
  {
    id: "schedule-agent",
    name: "Schedule Agent",
    icon: Calendar,
    category: "operations",
    description: "Calendar optimization, meeting scheduling, energy mapping",
    capabilities: ["calendar_optimize", "meeting_book", "energy_map"],
    status: "idle",
    queriesHandled: 678,
    avgResponseTime: 1.1,
    successRate: 96.3,
    memoryItems: 78
  }
];

// Routing rules for meta-cognition
const ROUTING_RULES = [
  { pattern: "deal|pipeline|contact|lead|opportunity", targetAgent: "crm-agent", confidence: 0.95 },
  { pattern: "revenue|expense|budget|invoice|payment", targetAgent: "finance-agent", confidence: 0.92 },
  { pattern: "task|todo|deadline|priority|assign", targetAgent: "task-agent", confidence: 0.97 },
  { pattern: "partner|collaboration|deal room|credit|attribution", targetAgent: "collaboration-agent", confidence: 0.89 },
  { pattern: "workflow|automate|trigger|process|schedule", targetAgent: "automation-agent", confidence: 0.91 },
  { pattern: "calendar|meeting|schedule|availability|time", targetAgent: "schedule-agent", confidence: 0.94 }
];

// Recent orchestration events
const ORCHESTRATION_EVENTS = [
  {
    id: "1",
    timestamp: "2 min ago",
    query: "What's the status of the Acme Corp deal?",
    routedTo: "crm-agent",
    confidence: 0.96,
    status: "completed",
    responseTime: 1.1
  },
  {
    id: "2",
    timestamp: "5 min ago",
    query: "Schedule a follow-up meeting with the design team",
    routedTo: "schedule-agent",
    confidence: 0.94,
    status: "completed",
    responseTime: 1.3
  },
  {
    id: "3",
    timestamp: "8 min ago",
    query: "Create a task to review the Q4 financial report",
    routedTo: "task-agent",
    confidence: 0.91,
    status: "completed",
    responseTime: 0.8
  },
  {
    id: "4",
    timestamp: "12 min ago",
    query: "What's our revenue forecast for next quarter?",
    routedTo: "finance-agent",
    confidence: 0.93,
    status: "completed",
    responseTime: 2.1
  },
  {
    id: "5",
    timestamp: "15 min ago",
    query: "Set up a workflow for new lead notifications",
    routedTo: "automation-agent",
    confidence: 0.88,
    status: "processing",
    responseTime: null
  }
];

// Agent memories for learning
const AGENT_MEMORIES = [
  {
    agentId: "crm-agent",
    memoryType: "preference",
    content: "User prefers deal updates in bullet format",
    confidence: 0.89,
    usageCount: 23
  },
  {
    agentId: "task-agent",
    memoryType: "pattern",
    content: "High-priority tasks usually relate to client deadlines",
    confidence: 0.92,
    usageCount: 45
  },
  {
    agentId: "finance-agent",
    memoryType: "preference",
    content: "User wants revenue rounded to nearest thousand",
    confidence: 0.85,
    usageCount: 18
  },
  {
    agentId: "schedule-agent",
    memoryType: "pattern",
    content: "User prefers morning meetings for strategic discussions",
    confidence: 0.91,
    usageCount: 31
  }
];

const categoryColors: Record<string, string> = {
  sales: "bg-blue-500/10 text-blue-500",
  finance: "bg-emerald-500/10 text-emerald-500",
  operations: "bg-purple-500/10 text-purple-500",
  automation: "bg-amber-500/10 text-amber-500"
};

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-500",
  idle: "bg-muted text-muted-foreground",
  error: "bg-destructive/10 text-destructive"
};

export default function AgentOrchestrationHub() {
  const [testQuery, setTestQuery] = useState("");
  const [routingResult, setRoutingResult] = useState<{
    agent: string;
    confidence: number;
    reasoning: string;
  } | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const simulateRouting = () => {
    if (!testQuery.trim()) return;
    
    setIsRouting(true);
    
    // Simulate routing delay
    setTimeout(() => {
      const queryLower = testQuery.toLowerCase();
      let bestMatch = { agent: "task-agent", confidence: 0.5, pattern: "default" };
      
      for (const rule of ROUTING_RULES) {
        const regex = new RegExp(rule.pattern, "i");
        if (regex.test(queryLower)) {
          if (rule.confidence > bestMatch.confidence) {
            bestMatch = { 
              agent: rule.targetAgent, 
              confidence: rule.confidence,
              pattern: rule.pattern
            };
          }
        }
      }
      
      const agent = EXPERT_AGENTS.find(a => a.id === bestMatch.agent);
      setRoutingResult({
        agent: agent?.name || "Unknown Agent",
        confidence: bestMatch.confidence,
        reasoning: `Matched pattern: "${bestMatch.pattern}" with ${(bestMatch.confidence * 100).toFixed(0)}% confidence`
      });
      setIsRouting(false);
    }, 800);
  };

  const totalQueries = EXPERT_AGENTS.reduce((sum, a) => sum + a.queriesHandled, 0);
  const avgSuccessRate = EXPERT_AGENTS.reduce((sum, a) => sum + a.successRate, 0) / EXPERT_AGENTS.length;
  const activeAgents = EXPERT_AGENTS.filter(a => a.status === "active").length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Agent Orchestration Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Multi-agent coordination with intelligent query routing
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button>
              <Activity className="h-4 w-4 mr-2" />
              Live Monitor
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                  <p className="text-2xl font-bold">{activeAgents}/{EXPERT_AGENTS.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Network className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Queries</p>
                  <p className="text-2xl font-bold">{totalQueries.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Success Rate</p>
                  <p className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Memories</p>
                  <p className="text-2xl font-bold">
                    {EXPERT_AGENTS.reduce((sum, a) => sum + a.memoryItems, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Database className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="agents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="agents">Expert Agents</TabsTrigger>
            <TabsTrigger value="routing">Query Routing</TabsTrigger>
            <TabsTrigger value="memories">Agent Memories</TabsTrigger>
            <TabsTrigger value="events">Orchestration Log</TabsTrigger>
          </TabsList>

          {/* Expert Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXPERT_AGENTS.map((agent) => {
                const IconComponent = agent.icon;
                return (
                  <Card key={agent.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{agent.name}</CardTitle>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className={categoryColors[agent.category]}>
                                {agent.category}
                              </Badge>
                              <Badge variant="secondary" className={statusColors[agent.status]}>
                                {agent.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Switch checked={agent.status === "active"} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Success Rate</span>
                          <span className="font-medium">{agent.successRate}%</span>
                        </div>
                        <Progress value={agent.successRate} className="h-1.5" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div>
                          <p className="font-semibold">{agent.queriesHandled}</p>
                          <p className="text-xs text-muted-foreground">Queries</p>
                        </div>
                        <div>
                          <p className="font-semibold">{agent.avgResponseTime}s</p>
                          <p className="text-xs text-muted-foreground">Avg Time</p>
                        </div>
                        <div>
                          <p className="font-semibold">{agent.memoryItems}</p>
                          <p className="text-xs text-muted-foreground">Memories</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Query Routing Tab */}
          <TabsContent value="routing" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Test Routing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Test Query Routing
                  </CardTitle>
                  <CardDescription>
                    Enter a query to see which agent would handle it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., What's the status of my deals?"
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && simulateRouting()}
                    />
                    <Button onClick={simulateRouting} disabled={isRouting || !testQuery.trim()}>
                      {isRouting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Route"
                      )}
                    </Button>
                  </div>

                  {routingResult && (
                    <div className="p-4 rounded-lg bg-muted/50 border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Routed to:</span>
                        <Badge className="bg-primary">{routingResult.agent}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={routingResult.confidence * 100} className="w-24 h-2" />
                          <span className="text-sm font-medium">
                            {(routingResult.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {routingResult.reasoning}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Routing Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Routing Rules
                  </CardTitle>
                  <CardDescription>
                    Pattern-based query routing configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {ROUTING_RULES.map((rule, index) => {
                        const agent = EXPERT_AGENTS.find(a => a.id === rule.targetAgent);
                        return (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                          >
                            <div className="flex-1">
                              <code className="text-xs bg-background px-2 py-1 rounded">
                                {rule.pattern}
                              </code>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground mx-3" />
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{agent?.name}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {(rule.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agent Memories Tab */}
          <TabsContent value="memories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Learned Preferences & Patterns
                </CardTitle>
                <CardDescription>
                  Agent memories that improve response quality over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {AGENT_MEMORIES.map((memory, index) => {
                    const agent = EXPERT_AGENTS.find(a => a.id === memory.agentId);
                    return (
                      <div 
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border"
                      >
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {agent && <agent.icon className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{agent?.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {memory.memoryType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{memory.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Confidence: {(memory.confidence * 100).toFixed(0)}%</span>
                            <span>Used {memory.usageCount} times</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orchestration Log Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Orchestration Events
                </CardTitle>
                <CardDescription>
                  Live feed of query routing and agent execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {ORCHESTRATION_EVENTS.map((event) => {
                      const agent = EXPERT_AGENTS.find(a => a.id === event.routedTo);
                      return (
                        <div 
                          key={event.id}
                          className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border"
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                            event.status === "completed" 
                              ? "bg-green-500/10" 
                              : "bg-amber-500/10"
                          }`}>
                            {event.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">"{event.query}"</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                {agent?.name}
                              </span>
                              <span>Confidence: {(event.confidence * 100).toFixed(0)}%</span>
                              {event.responseTime && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {event.responseTime}s
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {event.timestamp}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
