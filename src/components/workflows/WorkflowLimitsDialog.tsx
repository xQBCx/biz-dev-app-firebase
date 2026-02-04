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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Loader2, Settings, Hash, Zap } from "lucide-react";
import { LimitProgressBar } from "@/components/admin/LimitProgressBar";

interface WorkflowLimitsDialogProps {
  workflow: {
    id: string;
    name: string;
    daily_run_cap: number;
    enabled_for_ai: boolean;
  };
  currentUsage?: {
    runs_24h: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowLimitsDialog({
  workflow,
  currentUsage,
  open,
  onOpenChange,
}: WorkflowLimitsDialogProps) {
  const queryClient = useQueryClient();

  const [dailyRunCap, setDailyRunCap] = useState(workflow.daily_run_cap);
  const [enabledForAi, setEnabledForAi] = useState(workflow.enabled_for_ai);

  const updateLimitsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("workflows")
        .update({
          daily_run_cap: dailyRunCap,
          enabled_for_ai: enabledForAi,
        })
        .eq("id", workflow.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Workflow limits updated successfully");
      queryClient.invalidateQueries({ queryKey: ["ai-usage-top-workflows"] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update limits: " + (error as Error).message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Workflow Settings: {workflow.name}
          </DialogTitle>
          <DialogDescription>
            Configure daily limits and AI settings for this workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Usage */}
          {currentUsage && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <LimitProgressBar
                current={currentUsage.runs_24h}
                max={dailyRunCap}
                label="Daily Usage (last 24h)"
              />
            </div>
          )}

          {/* AI Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="enabledForAi" className="text-sm font-medium">
                  AI Enabled
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow AI nodes to execute in this workflow
                </p>
              </div>
            </div>
            <Switch
              id="enabledForAi"
              checked={enabledForAi}
              onCheckedChange={setEnabledForAi}
            />
          </div>

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
                max={500}
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
              Maximum number of workflow executions allowed per day
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
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
