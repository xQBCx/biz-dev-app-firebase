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
import { Settings, AlertTriangle, Bot } from "lucide-react";
import { LimitStatusBadge } from "./LimitProgressBar";
import { TopAgent } from "@/hooks/useAIUsageAnalytics";
import { AgentLimitsDialog } from "@/components/agents/AgentLimitsDialog";

interface TopAgentsTableProps {
  agents: TopAgent[];
  onAgentClick?: (agentId: string) => void;
}

export function TopAgentsTable({ agents, onAgentClick }: TopAgentsTableProps) {
  const [selectedAgent, setSelectedAgent] = useState<TopAgent | null>(null);

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
            <TableHead>Agent</TableHead>
            <TableHead>Primary Model</TableHead>
            <TableHead className="text-right">Runs (24h/7d)</TableHead>
            <TableHead className="text-right">Tokens</TableHead>
            <TableHead className="text-right">Est. Cost</TableHead>
            <TableHead>Limit Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No agent activity recorded yet
              </TableCell>
            </TableRow>
          ) : (
            agents.map((agent) => {
              const runPercentUsed = (agent.runs_24h / agent.daily_run_cap) * 100;
              const costPercentUsed = (agent.total_cost / agent.daily_cost_cap_usd) * 100;
              const isNearLimit = runPercentUsed >= 80 || costPercentUsed >= 80;
              const isBlocked = agent.blocked_count > 0;

              return (
                <TableRow
                  key={agent.agent_id}
                  className={`cursor-pointer hover:bg-muted/50 ${isBlocked ? "bg-destructive/5" : ""}`}
                  onClick={() => onAgentClick?.(agent.agent_id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isBlocked && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      <div>
                        <div className="font-medium">{agent.agent_name}</div>
                        <div className="text-xs text-muted-foreground">{agent.agent_slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {agent.primary_model || "gemini"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">{agent.runs_24h}</span>
                    <span className="text-muted-foreground"> / {agent.runs_7d}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatTokens(agent.total_tokens)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {formatCost(agent.total_cost)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <LimitStatusBadge
                        current={agent.runs_24h}
                        max={agent.daily_run_cap}
                        type="runs"
                      />
                      <LimitStatusBadge
                        current={agent.total_cost}
                        max={agent.daily_cost_cap_usd}
                        type="cost"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgent(agent);
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

      {selectedAgent && (
        <AgentLimitsDialog
          agent={{
            id: selectedAgent.agent_id,
            name: selectedAgent.agent_name,
            slug: selectedAgent.agent_slug,
            daily_run_cap: selectedAgent.daily_run_cap,
            daily_cost_cap_usd: selectedAgent.daily_cost_cap_usd,
            cost_ceiling_usd: 0.5,
            max_tokens_per_run: 4000,
          }}
          open={!!selectedAgent}
          onOpenChange={(open) => !open && setSelectedAgent(null)}
        />
      )}
    </>
  );
}
