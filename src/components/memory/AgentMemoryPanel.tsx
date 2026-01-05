import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  History,
  Lightbulb,
  MessageSquare,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
  RefreshCw,
  Clock,
  Target,
  Star,
  Trash2,
  Eye,
  ChevronRight,
  Activity
} from "lucide-react";

// Mock data for agent memories
const mockAgentMemories = [
  {
    id: "1",
    agent_name: "Sales Intelligence Agent",
    agent_slug: "sales-intel",
    memory_type: "preference",
    pattern: "User prefers concise bullet-point summaries over lengthy paragraphs",
    confidence: 0.94,
    usage_count: 47,
    last_used_at: "2026-01-05T10:30:00Z",
    created_at: "2025-12-15T08:00:00Z",
    category: "communication_style"
  },
  {
    id: "2",
    agent_name: "Task Intelligence Agent",
    agent_slug: "task-intel",
    memory_type: "behavior",
    pattern: "User typically schedules high-priority tasks in morning hours (8-11 AM)",
    confidence: 0.87,
    usage_count: 32,
    last_used_at: "2026-01-05T09:15:00Z",
    created_at: "2025-12-20T14:00:00Z",
    category: "scheduling"
  },
  {
    id: "3",
    agent_name: "CRM Agent",
    agent_slug: "crm-agent",
    memory_type: "context",
    pattern: "Active deal with Acme Corp - $2.4M enterprise license, Q1 close target",
    confidence: 0.99,
    usage_count: 18,
    last_used_at: "2026-01-04T16:45:00Z",
    created_at: "2025-12-28T11:30:00Z",
    category: "deals"
  },
  {
    id: "4",
    agent_name: "Finance Agent",
    agent_slug: "finance-agent",
    memory_type: "preference",
    pattern: "User requires approval for expenses over $5,000",
    confidence: 0.92,
    usage_count: 12,
    last_used_at: "2026-01-03T14:20:00Z",
    created_at: "2026-01-02T09:00:00Z",
    category: "policies"
  },
  {
    id: "5",
    agent_name: "Automation Agent",
    agent_slug: "automation-agent",
    memory_type: "behavior",
    pattern: "User automates repetitive data entry tasks but prefers manual review for client communications",
    confidence: 0.89,
    usage_count: 25,
    last_used_at: "2026-01-05T08:00:00Z",
    created_at: "2025-12-18T10:00:00Z",
    category: "automation_preferences"
  }
];

const mockConversationContext = [
  {
    id: "c1",
    agent_name: "Sales Intelligence Agent",
    context_summary: "Discussed Q1 pipeline strategy and identified 3 at-risk deals",
    key_entities: ["Acme Corp", "TechFlow Inc", "Global Systems"],
    last_interaction: "2026-01-05T10:30:00Z",
    message_count: 24,
    active: true
  },
  {
    id: "c2",
    agent_name: "Task Intelligence Agent",
    context_summary: "Optimized daily schedule based on energy patterns and meeting cadence",
    key_entities: ["Weekly standup", "Client calls", "Deep work blocks"],
    last_interaction: "2026-01-05T09:15:00Z",
    message_count: 15,
    active: true
  },
  {
    id: "c3",
    agent_name: "CRM Agent",
    context_summary: "Updated contact records and scheduled follow-ups for enterprise leads",
    key_entities: ["Enterprise leads", "Follow-up cadence", "Contact enrichment"],
    last_interaction: "2026-01-04T16:45:00Z",
    message_count: 31,
    active: false
  }
];

const mockLearnedPatterns = [
  {
    id: "p1",
    pattern_name: "Morning Priority Focus",
    pattern_type: "scheduling",
    description: "High-priority tasks are most effective when scheduled between 8-11 AM",
    success_rate: 0.87,
    times_applied: 156,
    source_interactions: 42
  },
  {
    id: "p2",
    pattern_name: "Deal Close Acceleration",
    pattern_type: "sales",
    description: "Deals progress faster with bi-weekly stakeholder touchpoints",
    success_rate: 0.79,
    times_applied: 23,
    source_interactions: 18
  },
  {
    id: "p3",
    pattern_name: "Automation Candidate Detection",
    pattern_type: "automation",
    description: "Tasks repeated 3+ times weekly with consistent inputs are automation candidates",
    success_rate: 0.92,
    times_applied: 67,
    source_interactions: 89
  },
  {
    id: "p4",
    pattern_name: "Communication Style Matching",
    pattern_type: "communication",
    description: "Bullet-point summaries preferred for updates, detailed analysis for decisions",
    success_rate: 0.95,
    times_applied: 234,
    source_interactions: 112
  }
];

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getMemoryTypeBadge(type: string) {
  const variants: Record<string, { color: string; icon: React.ReactNode }> = {
    preference: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Star className="h-3 w-3" /> },
    behavior: { color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: <Activity className="h-3 w-3" /> },
    context: { color: "bg-green-500/10 text-green-400 border-green-500/20", icon: <MessageSquare className="h-3 w-3" /> }
  };
  const variant = variants[type] || variants.context;
  return (
    <Badge variant="outline" className={`${variant.color} gap-1`}>
      {variant.icon}
      {type}
    </Badge>
  );
}

export default function AgentMemoryPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const filteredMemories = mockAgentMemories.filter(memory =>
    memory.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.agent_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const agents = [...new Set(mockAgentMemories.map(m => m.agent_name))];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Agent Memory Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage AI agent conversation context and learned patterns
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync Memory
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Memories</p>
                  <p className="text-2xl font-bold">{mockAgentMemories.length}</p>
                </div>
                <Brain className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Contexts</p>
                  <p className="text-2xl font-bold">{mockConversationContext.filter(c => c.active).length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Learned Patterns</p>
                  <p className="text-2xl font-bold">{mockLearnedPatterns.length}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-purple-400 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                  <p className="text-2xl font-bold">
                    {(mockAgentMemories.reduce((acc, m) => acc + m.confidence, 0) / mockAgentMemories.length * 100).toFixed(0)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="memories" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="memories" className="gap-2">
              <Brain className="h-4 w-4" />
              Agent Memories
            </TabsTrigger>
            <TabsTrigger value="context" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversation Context
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Learned Patterns
            </TabsTrigger>
          </TabsList>

          {/* Agent Memories Tab */}
          <TabsContent value="memories" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedAgent === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAgent(null)}
                >
                  All Agents
                </Button>
                {agents.map(agent => (
                  <Button
                    key={agent}
                    variant={selectedAgent === agent ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    {agent.replace(" Agent", "")}
                  </Button>
                ))}
              </div>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredMemories
                  .filter(m => !selectedAgent || m.agent_name === selectedAgent)
                  .map(memory => (
                    <Card key={memory.id} className="hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="font-medium">
                                {memory.agent_name}
                              </Badge>
                              {getMemoryTypeBadge(memory.memory_type)}
                              <Badge variant="outline" className="text-xs">
                                {memory.category.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-sm">{memory.pattern}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {(memory.confidence * 100).toFixed(0)}% confidence
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                Used {memory.usage_count}x
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(memory.last_used_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={memory.confidence * 100} className="w-16 h-2" />
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Conversation Context Tab */}
          <TabsContent value="context" className="space-y-4">
            <div className="grid gap-4">
              {mockConversationContext.map(context => (
                <Card key={context.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${context.active ? "bg-green-500 animate-pulse" : "bg-muted"}`} />
                          <h3 className="font-semibold">{context.agent_name}</h3>
                          <Badge variant={context.active ? "default" : "secondary"}>
                            {context.active ? "Active" : "Idle"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{context.context_summary}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {context.key_entities.map(entity => (
                            <Badge key={entity} variant="outline" className="text-xs">
                              {entity}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {context.message_count} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last: {formatTimeAgo(context.last_interaction)}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View Full Context
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Learned Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {mockLearnedPatterns.map(pattern => (
                <Card key={pattern.id} className="hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          {pattern.pattern_name}
                        </CardTitle>
                        <CardDescription>
                          <Badge variant="outline" className="mt-1">
                            {pattern.pattern_type}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">
                          {(pattern.success_rate * 100).toFixed(0)}%
                        </div>
                        <p className="text-xs text-muted-foreground">success rate</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="h-4 w-4" />
                        Applied {pattern.times_applied}x
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <History className="h-4 w-4" />
                        From {pattern.source_interactions} interactions
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
