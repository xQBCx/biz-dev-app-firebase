import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, AlertTriangle, Workflow, Pause } from "lucide-react";
import { LimitStatusBadge } from "./LimitProgressBar";
import { TopWorkflow } from "@/hooks/useAIUsageAnalytics";
import { WorkflowLimitsDialog } from "@/components/workflows/WorkflowLimitsDialog";

interface TopWorkflowsTableProps {
  workflows: TopWorkflow[];
  onWorkflowClick?: (workflowId: string) => void;
}

export function TopWorkflowsTable({ workflows, onWorkflowClick }: TopWorkflowsTableProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<TopWorkflow | null>(null);

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(3)}`;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workflow</TableHead>
            <TableHead className="text-right">Runs (24h/7d)</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Est. Cost</TableHead>
            <TableHead className="text-right">Avg/Run</TableHead>
            <TableHead>Limit Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                <Workflow className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No workflow activity recorded yet
              </TableCell>
            </TableRow>
          ) : (
            workflows.map((workflow) => {
              const runPercentUsed = (workflow.runs_24h / workflow.daily_run_cap) * 100;
              const isNearLimit = runPercentUsed >= 80;
              const isBlocked = workflow.blocked_count > 0 || !workflow.enabled_for_ai;

              return (
                <TableRow
                  key={workflow.workflow_id}
                  className={`cursor-pointer hover:bg-muted/50 ${isBlocked ? "bg-destructive/5" : ""}`}
                  onClick={() => onWorkflowClick?.(workflow.workflow_id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isBlocked && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      {!workflow.enabled_for_ai && <Pause className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <div className="font-medium">{workflow.workflow_name}</div>
                        {!workflow.enabled_for_ai && (
                          <span className="text-xs text-muted-foreground">AI Disabled</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">{workflow.runs_24h}</span>
                    <span className="text-muted-foreground"> / {workflow.runs_7d}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatTokens(workflow.total_tokens)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCost(workflow.total_credits)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCost(workflow.avg_cost_per_run)}
                  </TableCell>
                  <TableCell>
                    <LimitStatusBadge
                      current={workflow.runs_24h}
                      max={workflow.daily_run_cap}
                      type="runs"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkflow(workflow);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {selectedWorkflow && (
        <WorkflowLimitsDialog
          workflow={{
            id: selectedWorkflow.workflow_id,
            name: selectedWorkflow.workflow_name,
            daily_run_cap: selectedWorkflow.daily_run_cap,
            enabled_for_ai: selectedWorkflow.enabled_for_ai,
          }}
          currentUsage={{
            runs_24h: selectedWorkflow.runs_24h,
          }}
          open={!!selectedWorkflow}
          onOpenChange={(open) => !open && setSelectedWorkflow(null)}
        />
      )}
    </>
  );
}
