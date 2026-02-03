import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Shield, DollarSign, Zap, Hash } from "lucide-react";

interface AgentLimitsDialogProps {
  agent: {
    id: string;
    name: string;
    slug: string;
    daily_run_cap: number;
    daily_cost_cap_usd: number;
    cost_ceiling_usd: number;
    max_tokens_per_run: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentLimitsDialog({ agent, open, onOpenChange }: AgentLimitsDialogProps) {
  const queryClient = useQueryClient();
  
  const [dailyRunCap, setDailyRunCap] = useState(agent.daily_run_cap);
  const [dailyCostCapUsd, setDailyCostCapUsd] = useState(agent.daily_cost_cap_usd);
  const [costCeilingUsd, setCostCeilingUsd] = useState(agent.cost_ceiling_usd);
  const [maxTokensPerRun, setMaxTokensPerRun] = useState(agent.max_tokens_per_run);

  const updateLimitsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("instincts_agents")
        .update({
          daily_run_cap: dailyRunCap,
          daily_cost_cap_usd: dailyCostCapUsd,
          cost_ceiling_usd: costCeilingUsd,
          max_tokens_per_run: maxTokensPerRun,
        })
        .eq("id", agent.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agent limits updated successfully");
      queryClient.invalidateQueries({ queryKey: ["ai-usage-top-agents"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update limits: " + (error as Error).message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configure Limits: {agent.name}
          </DialogTitle>
          <DialogDescription>
            Set daily limits and per-run constraints for this agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Daily Run Cap */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="dailyRunCap">Daily Run Cap</Label>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                id="dailyRunCap"
                value={[dailyRunCap]}
                onValueChange={([v]) => setDailyRunCap(v)}
                min={10}
                max={1000}
                step={10}
                className="flex-1"
              />
              <Input
                type="number"
                value={dailyRunCap}
                onChange={(e) => setDailyRunCap(Number(e.target.value))}
                className="w-20"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum number of agent runs allowed per day
            </p>
          </div>

          {/* Daily Cost Cap */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="dailyCostCap">Daily Cost Cap (USD)</Label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="dailyCostCap"
                type="number"
                step="0.50"
                min="0.50"
                max="100"
                value={dailyCostCapUsd}
                onChange={(e) => setDailyCostCapUsd(Number(e.target.value))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum total AI cost allowed per day for this agent
            </p>
          </div>

          {/* Per-Run Cost Ceiling */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="costCeiling">Per-Run Cost Ceiling (USD)</Label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="costCeiling"
                type="number"
                step="0.01"
                min="0.01"
                max="5"
                value={costCeilingUsd}
                onChange={(e) => setCostCeilingUsd(Number(e.target.value))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum cost allowed for a single agent run
            </p>
          </div>

          {/* Max Tokens Per Run */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="maxTokens">Max Tokens Per Run</Label>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                id="maxTokens"
                value={[maxTokensPerRun]}
                onValueChange={([v]) => setMaxTokensPerRun(v)}
                min={500}
                max={16000}
                step={500}
                className="flex-1"
              />
              <Input
                type="number"
                value={maxTokensPerRun}
                onChange={(e) => setMaxTokensPerRun(Number(e.target.value))}
                className="w-24"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum tokens the agent can consume in a single run
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => updateLimitsMutation.mutate()}
            disabled={updateLimitsMutation.isPending}
          >
            {updateLimitsMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Limits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
