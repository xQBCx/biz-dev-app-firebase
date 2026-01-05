import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  ChevronDown,
  ChevronUp,
  Zap,
  Bot,
  Coins,
  Calendar,
  Timer,
  FileJson,
  Terminal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AgentRun {
  id: string;
  agent_id: string;
  agent_name?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  trigger_type: 'manual' | 'scheduled' | 'event' | 'webhook';
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  tokens_used?: number;
  credits_earned?: number;
  input_summary?: string;
  output_summary?: string;
  error_message?: string;
  tools_called?: string[];
  linked_task_id?: string;
  linked_opportunity_id?: string;
  metadata?: Record<string, unknown>;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: Clock },
  running: { label: 'Running', color: 'bg-blue-500/20 text-blue-400', icon: Play },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-destructive/20 text-destructive', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-amber-500/20 text-amber-400', icon: AlertTriangle }
};

const TRIGGER_CONFIG = {
  manual: { label: 'Manual', icon: Play },
  scheduled: { label: 'Scheduled', icon: Calendar },
  event: { label: 'Event', icon: Zap },
  webhook: { label: 'Webhook', icon: Terminal }
};

// Mock data for demonstration
const mockAgentRuns: AgentRun[] = [
  {
    id: '1',
    agent_id: 'sales-intel',
    agent_name: 'Sales Intelligence Agent',
    status: 'completed',
    trigger_type: 'scheduled',
    started_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 3540000).toISOString(),
    duration_ms: 60000,
    tokens_used: 2450,
    credits_earned: 12.5,
    input_summary: 'Analyzed 15 leads from HubSpot integration',
    output_summary: 'Identified 3 high-priority opportunities, updated CRM records',
    tools_called: ['crm_search', 'lead_scoring', 'email_draft'],
    linked_opportunity_id: 'opp-123'
  },
  {
    id: '2',
    agent_id: 'task-planner',
    agent_name: 'Task Intelligence Agent',
    status: 'running',
    trigger_type: 'event',
    started_at: new Date(Date.now() - 120000).toISOString(),
    tokens_used: 890,
    input_summary: 'Processing daily task optimization request',
    tools_called: ['calendar_read', 'task_fetch']
  },
  {
    id: '3',
    agent_id: 'content-gen',
    agent_name: 'Content Generation Agent',
    status: 'failed',
    trigger_type: 'manual',
    started_at: new Date(Date.now() - 7200000).toISOString(),
    completed_at: new Date(Date.now() - 7180000).toISOString(),
    duration_ms: 20000,
    tokens_used: 1200,
    input_summary: 'Generate blog post about AI automation',
    error_message: 'Rate limit exceeded. Please try again in 60 seconds.',
    tools_called: ['web_search', 'content_write']
  },
  {
    id: '4',
    agent_id: 'deal-analyzer',
    agent_name: 'Deal Room Analyzer',
    status: 'completed',
    trigger_type: 'webhook',
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 86300000).toISOString(),
    duration_ms: 100000,
    tokens_used: 5600,
    credits_earned: 28.0,
    input_summary: 'Webhook triggered: New formulation submitted for review',
    output_summary: 'Validated attribution rules, calculated preliminary payout distribution',
    tools_called: ['formulation_validate', 'payout_calculate', 'notify_participants'],
    linked_task_id: 'task-456'
  },
  {
    id: '5',
    agent_id: 'outreach-bot',
    agent_name: 'Outreach Automation Agent',
    status: 'pending',
    trigger_type: 'scheduled',
    started_at: new Date(Date.now() + 1800000).toISOString(),
    input_summary: 'Scheduled: Send follow-up emails to cold leads'
  }
];

export function AgentRunHistory() {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setRuns(mockAgentRuns);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleExpanded = (runId: string) => {
    setExpandedRuns(prev => {
      const next = new Set(prev);
      if (next.has(runId)) {
        next.delete(runId);
      } else {
        next.add(runId);
      }
      return next;
    });
  };

  const filteredRuns = runs.filter(run => {
    const matchesSearch = !searchQuery || 
      run.agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.input_summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.output_summary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    const matchesTrigger = triggerFilter === 'all' || run.trigger_type === triggerFilter;
    
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'active' && ['pending', 'running'].includes(run.status)) ||
      (activeTab === 'completed' && run.status === 'completed') ||
      (activeTab === 'failed' && run.status === 'failed');
    
    return matchesSearch && matchesStatus && matchesTrigger && matchesTab;
  });

  const stats = {
    total: runs.length,
    running: runs.filter(r => r.status === 'running').length,
    completed: runs.filter(r => r.status === 'completed').length,
    failed: runs.filter(r => r.status === 'failed').length,
    totalTokens: runs.reduce((acc, r) => acc + (r.tokens_used || 0), 0),
    totalCredits: runs.reduce((acc, r) => acc + (r.credits_earned || 0), 0)
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Agent Run History</h1>
              <p className="text-muted-foreground">Monitor and analyze agent execution logs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Bot className="h-4 w-4" />
                <span className="text-xs">Total Runs</span>
              </div>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Play className="h-4 w-4" />
                <span className="text-xs">Running</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{stats.running}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs">Completed</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <XCircle className="h-4 w-4" />
                <span className="text-xs">Failed</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-xs">Tokens Used</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Coins className="h-4 w-4" />
                <span className="text-xs">Credits Earned</span>
              </div>
              <p className="text-2xl font-bold text-amber-400">{stats.totalCredits.toFixed(1)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agent runs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={triggerFilter} onValueChange={setTriggerFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Triggers</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50">
            <TabsTrigger value="all">All Runs</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>
                  {filteredRuns.length} run{filteredRuns.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {filteredRuns.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No agent runs found matching your filters</p>
                      </div>
                    ) : (
                      filteredRuns.map((run) => {
                        const StatusIcon = STATUS_CONFIG[run.status].icon;
                        const TriggerIcon = TRIGGER_CONFIG[run.trigger_type].icon;
                        const isExpanded = expandedRuns.has(run.id);

                        return (
                          <Collapsible key={run.id} open={isExpanded} onOpenChange={() => toggleExpanded(run.id)}>
                            <div className="border border-border/50 rounded-lg overflow-hidden">
                              <CollapsibleTrigger asChild>
                                <div className="p-4 hover:bg-accent/5 cursor-pointer transition-colors">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className={`p-2 rounded-lg ${STATUS_CONFIG[run.status].color}`}>
                                        <StatusIcon className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <h4 className="font-medium">{run.agent_name || 'Unknown Agent'}</h4>
                                          <Badge variant="outline" className="text-xs">
                                            <TriggerIcon className="h-3 w-3 mr-1" />
                                            {TRIGGER_CONFIG[run.trigger_type].label}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 truncate">
                                          {run.input_summary || 'No input summary'}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                          <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(run.started_at), 'MMM d, HH:mm')}
                                          </span>
                                          {run.duration_ms && (
                                            <span className="flex items-center gap-1">
                                              <Timer className="h-3 w-3" />
                                              {formatDuration(run.duration_ms)}
                                            </span>
                                          )}
                                          {run.tokens_used && (
                                            <span className="flex items-center gap-1">
                                              <Zap className="h-3 w-3" />
                                              {run.tokens_used.toLocaleString()} tokens
                                            </span>
                                          )}
                                          {run.credits_earned && (
                                            <span className="flex items-center gap-1 text-amber-400">
                                              <Coins className="h-3 w-3" />
                                              +{run.credits_earned.toFixed(1)} credits
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className={STATUS_CONFIG[run.status].color}>
                                        {STATUS_CONFIG[run.status].label}
                                      </Badge>
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              
                              <CollapsibleContent>
                                <div className="border-t border-border/50 p-4 bg-muted/30 space-y-4">
                                  {/* Output/Error */}
                                  {run.output_summary && (
                                    <div>
                                      <h5 className="text-sm font-medium mb-1 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        Output
                                      </h5>
                                      <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                                        {run.output_summary}
                                      </p>
                                    </div>
                                  )}
                                  {run.error_message && (
                                    <div>
                                      <h5 className="text-sm font-medium mb-1 flex items-center gap-2 text-destructive">
                                        <XCircle className="h-4 w-4" />
                                        Error
                                      </h5>
                                      <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                                        {run.error_message}
                                      </p>
                                    </div>
                                  )}

                                  {/* Tools Called */}
                                  {run.tools_called && run.tools_called.length > 0 && (
                                    <div>
                                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <Terminal className="h-4 w-4" />
                                        Tools Called
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {run.tools_called.map((tool, i) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {tool}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Linked Resources */}
                                  {(run.linked_task_id || run.linked_opportunity_id) && (
                                    <div>
                                      <h5 className="text-sm font-medium mb-2">Linked Resources</h5>
                                      <div className="flex gap-2">
                                        {run.linked_task_id && (
                                          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                                            Task: {run.linked_task_id}
                                          </Badge>
                                        )}
                                        {run.linked_opportunity_id && (
                                          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                                            Opportunity: {run.linked_opportunity_id}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedRun(run)}>
                                          <FileJson className="h-4 w-4 mr-2" />
                                          View Full Log
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                                        <DialogHeader>
                                          <DialogTitle>Run Details: {run.agent_name}</DialogTitle>
                                          <DialogDescription>
                                            Run ID: {run.id}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                                          {JSON.stringify(run, null, 2)}
                                        </pre>
                                      </DialogContent>
                                    </Dialog>
                                    {run.status === 'failed' && (
                                      <Button variant="outline" size="sm">
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Retry
                                      </Button>
                                    )}
                                    {run.status === 'running' && (
                                      <Button variant="outline" size="sm" className="text-amber-400">
                                        <Pause className="h-4 w-4 mr-2" />
                                        Cancel
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })
                    )}
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

export default AgentRunHistory;
