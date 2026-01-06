import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, CheckCircle2, XCircle, Clock, Loader2, ChevronDown, ChevronRight,
  AlertTriangle, Timer, Cpu, DollarSign, Play, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

interface ExecutionRun {
  id: string;
  workflow_id: string;
  run_number: number;
  status: string;
  trigger_type: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  node_count: number;
  nodes_completed: number;
  nodes_failed: number;
  credits_consumed: number;
  error_message: string | null;
  workflow?: { name: string };
}

interface NodeExecution {
  id: string;
  run_id: string;
  node_id: string;
  node_type: string;
  node_name: string;
  execution_order: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  ai_model_used: string | null;
  tokens_consumed: number | null;
}

export function ExecutionMonitor({ workflowId }: { workflowId?: string }) {
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  // Fetch recent execution runs
  const { data: runs = [], isLoading, refetch } = useQuery({
    queryKey: ["workflow-execution-runs", workflowId],
    queryFn: async () => {
      let query = supabase
        .from("workflow_execution_runs")
        .select(`
          *,
          workflow:workflows(name)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (workflowId) {
        query = query.eq("workflow_id", workflowId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExecutionRun[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds for live updates
  });

  // Fetch node executions for expanded run
  const { data: nodeExecutions = [] } = useQuery({
    queryKey: ["workflow-node-executions", expandedRun],
    enabled: !!expandedRun,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_node_executions")
        .select("*")
        .eq("run_id", expandedRun)
        .order("execution_order", { ascending: true });

      if (error) throw error;
      return data as NodeExecution[];
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      case "running": return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "waiting_approval": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500";
      case "failed": return "bg-red-500/10 text-red-500";
      case "running": return "bg-blue-500/10 text-blue-500";
      case "waiting_approval": return "bg-yellow-500/10 text-yellow-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Calculate stats
  const runningCount = runs.filter(r => r.status === "running").length;
  const completedCount = runs.filter(r => r.status === "completed").length;
  const failedCount = runs.filter(r => r.status === "failed").length;
  const totalCredits = runs.reduce((sum, r) => sum + (r.credits_consumed || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{runningCount}</p>
              <p className="text-xs text-muted-foreground">Running</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{failedCount}</p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCredits.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Credits Used</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Execution List */}
      {runs.length === 0 ? (
        <Card className="p-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No executions yet</h3>
          <p className="text-muted-foreground">
            Run a workflow to see execution history here
          </p>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-3">
            {runs.map((run) => (
              <Card key={run.id} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">
                      {expandedRun === run.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                    {getStatusIcon(run.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {run.workflow?.name || "Unknown Workflow"}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Run #{run.run_number}
                        </Badge>
                        <Badge className={cn("text-xs", getStatusColor(run.status))}>
                          {run.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {run.started_at
                            ? formatDistanceToNow(new Date(run.started_at), { addSuffix: true })
                            : "Pending"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {run.duration_ms ? `${(run.duration_ms / 1000).toFixed(2)}s` : "-"}
                        </span>
                        <span>Trigger: {run.trigger_type}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-500">{run.nodes_completed}</span>
                        <span>/</span>
                        <span>{run.node_count}</span>
                        {run.nodes_failed > 0 && (
                          <span className="text-red-500">({run.nodes_failed} failed)</span>
                        )}
                      </div>
                      <Progress
                        value={run.node_count > 0 ? (run.nodes_completed / run.node_count) * 100 : 0}
                        className="h-1 w-24 mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Node Details */}
                {expandedRun === run.id && (
                  <div className="border-t bg-muted/30 p-4">
                    {run.error_message && (
                      <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-500">Error</p>
                            <p className="text-sm text-muted-foreground">{run.error_message}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <h4 className="font-medium mb-3">Node Executions</h4>
                    <div className="space-y-2">
                      {nodeExecutions.map((node) => (
                        <div
                          key={node.id}
                          className="flex items-center gap-3 p-2 rounded bg-background"
                        >
                          {getStatusIcon(node.status)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{node.node_name}</span>
                              <Badge variant="outline" className="text-xs">
                                {node.node_type}
                              </Badge>
                            </div>
                            {node.error_message && (
                              <p className="text-xs text-red-500 mt-1">{node.error_message}</p>
                            )}
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div>{node.duration_ms ? `${node.duration_ms}ms` : "-"}</div>
                            {node.ai_model_used && (
                              <div className="flex items-center gap-1">
                                <Cpu className="w-3 h-3" />
                                {node.tokens_consumed} tokens
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
