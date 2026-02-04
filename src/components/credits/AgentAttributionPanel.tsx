import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bot, 
  Cpu, 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  TrendingUp,
  Coins,
  Activity,
  ExternalLink,
  ChevronRight,
  Layers,
  BarChart3
} from 'lucide-react';
import { useAgents, AgentRun } from '@/hooks/useAgents';
import { format, formatDistanceToNow } from 'date-fns';

interface AgentSummary {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  agentType: string | null;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  totalTokens: number;
  totalComputeCredits: number;
  totalDurationMs: number;
  linkedTasks: number;
  linkedOpportunities: number;
  lastRunAt: string | null;
}

export function AgentAttributionPanel() {
  const { agentRuns, agents, isLoadingRuns } = useAgents();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Aggregate agent summaries
  const agentSummaries = useMemo(() => {
    const summaryMap = new Map<string, AgentSummary>();
    
    agentRuns.forEach(run => {
      const agentId = run.agent_id;
      const existing = summaryMap.get(agentId);
      
      if (existing) {
        existing.totalRuns++;
        if (run.status === 'completed') existing.successfulRuns++;
        if (run.status === 'failed') existing.failedRuns++;
        existing.totalTokens += run.tokens_used || 0;
        existing.totalComputeCredits += run.compute_credits_consumed || 0;
        existing.totalDurationMs += run.duration_ms || 0;
        if (run.linked_task_id) existing.linkedTasks++;
        if (run.linked_opportunity_id) existing.linkedOpportunities++;
        if (run.started_at && (!existing.lastRunAt || run.started_at > existing.lastRunAt)) {
          existing.lastRunAt = run.started_at;
        }
      } else {
        summaryMap.set(agentId, {
          id: agentId,
          name: run.agent?.name || 'Unknown Agent',
          slug: run.agent?.slug || '',
          icon: run.agent?.icon || null,
          agentType: run.agent?.agent_type || null,
          totalRuns: 1,
          successfulRuns: run.status === 'completed' ? 1 : 0,
          failedRuns: run.status === 'failed' ? 1 : 0,
          totalTokens: run.tokens_used || 0,
          totalComputeCredits: run.compute_credits_consumed || 0,
          totalDurationMs: run.duration_ms || 0,
          linkedTasks: run.linked_task_id ? 1 : 0,
          linkedOpportunities: run.linked_opportunity_id ? 1 : 0,
          lastRunAt: run.started_at,
        });
      }
    });
    
    return Array.from(summaryMap.values()).sort((a, b) => b.totalComputeCredits - a.totalComputeCredits);
  }, [agentRuns]);

  // Calculate totals
  const totals = useMemo(() => ({
    runs: agentRuns.length,
    tokens: agentRuns.reduce((sum, r) => sum + (r.tokens_used || 0), 0),
    credits: agentRuns.reduce((sum, r) => sum + (r.compute_credits_consumed || 0), 0),
    successRate: agentRuns.length > 0 
      ? (agentRuns.filter(r => r.status === 'completed').length / agentRuns.length) * 100 
      : 0,
    linkedTasks: agentRuns.filter(r => r.linked_task_id).length,
    linkedOpportunities: agentRuns.filter(r => r.linked_opportunity_id).length,
  }), [agentRuns]);

  // Filter runs
  const filteredRuns = useMemo(() => {
    return agentRuns.filter(run => {
      const matchesSearch = !searchTerm || 
        run.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.input_summary?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [agentRuns, searchTerm, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getAgentTypeColor = (type: string | null) => {
    switch (type) {
      case 'outbound': return 'bg-blue-500/10 text-blue-500';
      case 'enrichment': return 'bg-purple-500/10 text-purple-500';
      case 'analysis': return 'bg-green-500/10 text-green-500';
      case 'automation': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoadingRuns) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Bot className="h-8 w-8 animate-pulse text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Agent Runs</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totals.runs}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Tokens Used</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totals.tokens.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Compute Credits</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totals.credits.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Success Rate</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totals.successRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Linked Tasks</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totals.linkedTasks}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Opportunities</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totals.linkedOpportunities}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Attribution
          </CardTitle>
          <CardDescription>
            Track agent-earned credits and their linked tasks/opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Agent Overview</TabsTrigger>
              <TabsTrigger value="runs">Execution Log</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              {agentSummaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No agent executions recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agentSummaries.map(agent => (
                    <Card key={agent.id} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              {agent.icon ? (
                                <span className="text-lg">{agent.icon}</span>
                              ) : (
                                <Bot className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {agent.agentType && (
                                  <Badge variant="secondary" className={getAgentTypeColor(agent.agentType)}>
                                    {agent.agentType}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {agent.totalRuns} runs
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm font-medium">{agent.totalComputeCredits.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">Credits</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{agent.totalTokens.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Tokens</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {agent.totalRuns > 0 
                                  ? ((agent.successfulRuns / agent.totalRuns) * 100).toFixed(0) 
                                  : 0}%
                              </p>
                              <p className="text-xs text-muted-foreground">Success</p>
                            </div>
                            <div className="text-right min-w-[80px]">
                              <p className="text-sm font-medium">{agent.linkedTasks + agent.linkedOpportunities}</p>
                              <p className="text-xs text-muted-foreground">Linked</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress bar showing credit distribution */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Credit contribution</span>
                            <span>
                              {totals.credits > 0 
                                ? ((agent.totalComputeCredits / totals.credits) * 100).toFixed(1) 
                                : 0}%
                            </span>
                          </div>
                          <Progress 
                            value={totals.credits > 0 ? (agent.totalComputeCredits / totals.credits) * 100 : 0} 
                            className="h-1.5"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="runs" className="mt-4 space-y-4">
              {/* Filters */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search runs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Runs List */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredRuns.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No runs match your filters</p>
                    </div>
                  ) : (
                    filteredRuns.map(run => (
                      <Card 
                        key={run.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedRun(run)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(run.status)}
                              <div>
                                <p className="font-medium text-sm">{run.agent?.name || 'Unknown Agent'}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {run.input_summary || 'No summary available'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm">{(run.compute_credits_consumed || 0).toFixed(3)}</p>
                                <p className="text-xs text-muted-foreground">credits</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">{(run.tokens_used || 0).toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">tokens</p>
                              </div>
                              <div className="text-right min-w-[80px]">
                                <p className="text-xs text-muted-foreground">
                                  {run.started_at 
                                    ? formatDistanceToNow(new Date(run.started_at), { addSuffix: true })
                                    : 'Unknown'}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          
                          {/* Linked entities badges */}
                          {(run.linked_task_id || run.linked_opportunity_id) && (
                            <div className="flex gap-2 mt-2">
                              {run.linked_task_id && (
                                <Badge variant="outline" className="text-xs">
                                  <Layers className="h-3 w-3 mr-1" />
                                  Task Linked
                                </Badge>
                              )}
                              {run.linked_opportunity_id && (
                                <Badge variant="outline" className="text-xs">
                                  <BarChart3 className="h-3 w-3 mr-1" />
                                  Opportunity Linked
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Run Detail Dialog */}
      <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRun && getStatusIcon(selectedRun.status)}
              {selectedRun?.agent?.name || 'Agent Run Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRun && (
            <div className="space-y-4">
              {/* Status and Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedRun.status === 'completed' ? 'default' : 'destructive'}>
                    {selectedRun.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {selectedRun.duration_ms ? `${(selectedRun.duration_ms / 1000).toFixed(2)}s` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-medium">
                    {selectedRun.started_at 
                      ? format(new Date(selectedRun.started_at), 'PPp')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trigger Type</p>
                  <Badge variant="outline">{selectedRun.trigger_type}</Badge>
                </div>
              </div>

              {/* Credit Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Credit Attribution</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {(selectedRun.compute_credits_consumed || 0).toFixed(4)}
                    </p>
                    <p className="text-xs text-muted-foreground">Compute Credits</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(selectedRun.tokens_used || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Tokens Used</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {selectedRun.model_used || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">Model</p>
                  </div>
                </CardContent>
              </Card>

              {/* Input Summary */}
              {selectedRun.input_summary && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Input Summary</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedRun.input_summary}</p>
                </div>
              )}

              {/* Tools Called */}
              {selectedRun.tools_called && selectedRun.tools_called.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tools Called</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRun.tools_called.map((tool, i) => (
                      <Badge key={i} variant="secondary">
                        <Zap className="h-3 w-3 mr-1" />
                        {typeof tool === 'string' ? tool : tool.name || 'Tool'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Entities */}
              <div className="grid grid-cols-2 gap-4">
                {selectedRun.linked_task_id && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Linked Task</p>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Layers className="h-4 w-4 mr-2" />
                      {selectedRun.linked_task_id.slice(0, 8)}...
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </div>
                )}
                {selectedRun.linked_opportunity_id && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Linked Opportunity</p>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {selectedRun.linked_opportunity_id.slice(0, 8)}...
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Contribution Event */}
              {selectedRun.contribution_event_id && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contribution Event</p>
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedRun.contribution_event_id}
                  </Badge>
                </div>
              )}

              {/* Error Message */}
              {selectedRun.error_message && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-sm text-destructive font-medium">Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{selectedRun.error_message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
