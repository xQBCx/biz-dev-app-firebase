import { useState } from "react";
import { useAgents, AgentRun } from "@/hooks/useAgents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bot,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Cpu,
  Wrench,
  Link,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  completed: { color: "bg-green-500/20 text-green-400", icon: <CheckCircle2 className="h-4 w-4" /> },
  failed: { color: "bg-red-500/20 text-red-400", icon: <XCircle className="h-4 w-4" /> },
  running: { color: "bg-blue-500/20 text-blue-400", icon: <Loader2 className="h-4 w-4 animate-spin" /> },
};

export function AgentExecutionLog() {
  const { agentRuns, isLoadingRuns, refetchRuns } = useAgents();
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5 text-primary" />
          Agent Execution Log
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetchRuns()}
          disabled={isLoadingRuns}
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingRuns ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingRuns ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : agentRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bot className="h-12 w-12 mb-2 opacity-50" />
            <p>No agent executions yet</p>
            <p className="text-sm">Run an agent to see execution logs here</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentRuns.map((run) => {
                  const status = statusConfig[run.status] || statusConfig.running;
                  return (
                    <TableRow key={run.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {run.agent?.name || "Unknown Agent"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${status.color} gap-1`}>
                          {status.icon}
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {run.trigger_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {run.tokens_used?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {(run.compute_credits_consumed || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDuration(run.duration_ms)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {run.started_at
                          ? formatDistanceToNow(new Date(run.started_at), { addSuffix: true })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedRun(run)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}

        {/* Run Detail Dialog */}
        <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Execution Details: {selectedRun?.agent?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedRun && (
              <div className="space-y-4">
                {/* Status Row */}
                <div className="flex items-center gap-4">
                  <Badge className={statusConfig[selectedRun.status]?.color || ""}>
                    {statusConfig[selectedRun.status]?.icon}
                    {selectedRun.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Trigger: {selectedRun.trigger_type}
                  </span>
                  {selectedRun.model_used && (
                    <Badge variant="outline">{selectedRun.model_used}</Badge>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Cpu className="h-3 w-3" />
                      Tokens
                    </div>
                    <div className="text-xl font-bold">
                      {selectedRun.tokens_used?.toLocaleString() || 0}
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Zap className="h-3 w-3" />
                      Credits
                    </div>
                    <div className="text-xl font-bold">
                      {(selectedRun.compute_credits_consumed || 0).toFixed(2)}
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Clock className="h-3 w-3" />
                      Duration
                    </div>
                    <div className="text-xl font-bold">
                      {formatDuration(selectedRun.duration_ms)}
                    </div>
                  </Card>
                  <Card className="p-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Wrench className="h-3 w-3" />
                      Tools
                    </div>
                    <div className="text-xl font-bold">
                      {selectedRun.tools_called?.length || 0}
                    </div>
                  </Card>
                </div>

                {/* Input Summary */}
                {selectedRun.input_summary && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Input Summary</h4>
                    <Card className="p-3 bg-muted/50">
                      <p className="text-sm">{selectedRun.input_summary}</p>
                    </Card>
                  </div>
                )}

                {/* Tools Called */}
                {selectedRun.tools_called && selectedRun.tools_called.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Tools Called
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRun.tools_called.map((tool, i) => (
                        <Badge key={i} variant="secondary">
                          {typeof tool === "string" ? tool : JSON.stringify(tool)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Entities */}
                {(selectedRun.linked_task_id || selectedRun.linked_opportunity_id) && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Linked Entities
                    </h4>
                    <div className="flex gap-2">
                      {selectedRun.linked_task_id && (
                        <Badge variant="outline">Task: {selectedRun.linked_task_id.slice(0, 8)}...</Badge>
                      )}
                      {selectedRun.linked_opportunity_id && (
                        <Badge variant="outline">Opportunity: {selectedRun.linked_opportunity_id.slice(0, 8)}...</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Result */}
                {selectedRun.result && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Result</h4>
                    <Card className="p-3 bg-muted/50">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(selectedRun.result, null, 2)}
                      </pre>
                    </Card>
                  </div>
                )}

                {/* Error */}
                {selectedRun.error_message && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-red-400">Error</h4>
                    <Card className="p-3 bg-red-500/10 border-red-500/20">
                      <p className="text-sm text-red-400">{selectedRun.error_message}</p>
                    </Card>
                  </div>
                )}

                {/* Contribution Event */}
                {selectedRun.contribution_event_id && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Contribution Event: {selectedRun.contribution_event_id}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}