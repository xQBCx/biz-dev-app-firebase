import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Settings, Sparkles, Vote, Clock, Scale } from "lucide-react";
import { useMutationGuard } from "@/hooks/useMutationGuard";

interface DealRoomSettingsPanelProps {
  dealRoomId: string;
  aiAnalysisEnabled: boolean;
  votingEnabled: boolean;
  votingRule: string;
  timeHorizon: string;
  isAdmin: boolean;
  onUpdate: () => void;
}

export const DealRoomSettingsPanel = ({
  dealRoomId,
  aiAnalysisEnabled,
  votingEnabled,
  votingRule,
  timeHorizon,
  isAdmin,
  onUpdate,
}: DealRoomSettingsPanelProps) => {
  const { guardMutation, canMutate } = useMutationGuard();
  const [updating, setUpdating] = useState<string | null>(null);

  const updateSetting = guardMutation(async (field: string, value: boolean | string) => {
    setUpdating(field);
    try {
      const { error } = await supabase
        .from("deal_rooms")
        .update({ [field]: value })
        .eq("id", dealRoomId);

      if (error) throw error;

      toast.success("Setting updated", {
        description: `${formatFieldName(field)} has been ${typeof value === "boolean" ? (value ? "enabled" : "disabled") : "updated"}.`,
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating setting:", error);
      toast.error("Failed to update setting");
    } finally {
      setUpdating(null);
    }
  });

  const formatFieldName = (field: string): string => {
    const names: Record<string, string> = {
      ai_analysis_enabled: "AI Analysis",
      voting_enabled: "DAO Voting",
      voting_rule: "Voting Rule",
      time_horizon: "Time Horizon",
    };
    return names[field] || field;
  };

  const votingRuleLabels: Record<string, string> = {
    unanimous: "Unanimous (all must agree)",
    majority: "Majority",
    weighted: "Weighted (by contribution)",
    founder_override: "Founder Override",
  };

  const timeHorizonLabels: Record<string, string> = {
    one_time: "One-time",
    recurring: "Recurring",
    perpetual: "Perpetual",
  };

  const isDisabled = !isAdmin || !canMutate;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Deal Room Settings</CardTitle>
        </div>
        <CardDescription>
          Configure features and governance options for this deal room
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Analysis Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <Label className="font-medium">AI Analysis</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI-powered analysis, fairness scoring, and deal structure generation
              </p>
            </div>
          </div>
          <Switch
            checked={aiAnalysisEnabled}
            onCheckedChange={(v) => updateSetting("ai_analysis_enabled", v)}
            disabled={isDisabled || updating === "ai_analysis_enabled"}
          />
        </div>

        {/* DAO Voting Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Vote className="w-5 h-5 text-primary" />
            <div>
              <Label className="font-medium">DAO Voting</Label>
              <p className="text-sm text-muted-foreground">
                Enable governance voting on questions and decisions
              </p>
            </div>
          </div>
          <Switch
            checked={votingEnabled}
            onCheckedChange={(v) => updateSetting("voting_enabled", v)}
            disabled={isDisabled || updating === "voting_enabled"}
          />
        </div>

        {/* Voting Rule Select */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-primary" />
            <div>
              <Label className="font-medium">Voting Rule</Label>
              <p className="text-sm text-muted-foreground">
                How voting decisions are determined
              </p>
            </div>
          </div>
          <Select
            value={votingRule}
            onValueChange={(v) => updateSetting("voting_rule", v)}
            disabled={isDisabled || updating === "voting_rule"}
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(votingRuleLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Horizon Select */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <Label className="font-medium">Time Horizon</Label>
              <p className="text-sm text-muted-foreground">
                Duration type for this deal
              </p>
            </div>
          </div>
          <Select
            value={timeHorizon}
            onValueChange={(v) => updateSetting("time_horizon", v)}
            disabled={isDisabled || updating === "time_horizon"}
          >
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(timeHorizonLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isAdmin && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Only admins can modify these settings
          </p>
        )}
      </CardContent>
    </Card>
  );
};
