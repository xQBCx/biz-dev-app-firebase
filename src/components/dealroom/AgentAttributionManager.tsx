import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, Plus, Loader2, Trash2, Settings, Bot } from "lucide-react";

interface AgentAttributionManagerProps {
  dealRoomId: string;
  isAdmin: boolean;
}

interface AttributionRule {
  id: string;
  agent_slug: string | null;
  outcome_type: string;
  base_amount: number | null;
  percentage_of_deal: number | null;
  is_active: boolean;
  conditions: Record<string, unknown> | null;
  created_at: string;
}

const outcomeTypes = [
  { value: "meeting_set", label: "Meeting Set", defaultAmount: 250 },
  { value: "meeting_held", label: "Meeting Held", defaultAmount: 500 },
  { value: "reply_received", label: "Reply Received", defaultAmount: 50 },
  { value: "trigger_detected", label: "Trigger Detected", defaultAmount: 25 },
  { value: "enrichment_complete", label: "Enrichment Complete", defaultAmount: 15 },
  { value: "draft_created", label: "Draft Created", defaultAmount: 5 },
  { value: "qualified_lead", label: "Qualified Lead", defaultAmount: 100 },
  { value: "proposal_sent", label: "Proposal Sent", defaultAmount: 75 },
  { value: "deal_closed", label: "Deal Closed", defaultAmount: 0 }, // Uses percentage
];

export const AgentAttributionManager = ({
  dealRoomId,
  isAdmin,
}: AgentAttributionManagerProps) => {
  const [rules, setRules] = useState<AttributionRule[]>([]);
  const [agents, setAgents] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    agent_slug: "all",
    outcome_type: "meeting_set",
    base_amount: "250",
    percentage_of_deal: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rulesData, error } = await (supabase as any)
        .from("agent_attribution_rules")
        .select("id, agent_slug, outcome_type, base_amount, percentage_of_deal, is_active, conditions, created_at")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching rules:", error);
      } else {
        setRules(rulesData || []);
      }

      const { data: agentsData } = await (supabase as any)
        .from("instincts_agents")
        .select("slug, name")
        .eq("is_partner_agent", true)
        .eq("is_active", true);

      setAgents(agentsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [dealRoomId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!formData.outcome_type) {
      toast.error("Please select an outcome type");
      return;
    }

    const baseAmount = formData.base_amount ? parseFloat(formData.base_amount) : null;
    const percentage = formData.percentage_of_deal ? parseFloat(formData.percentage_of_deal) : null;

    if (!baseAmount && !percentage) {
      toast.error("Please specify either a base amount or percentage");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("agent_attribution_rules").insert({
        deal_room_id: dealRoomId,
        agent_slug: formData.agent_slug === "all" ? null : formData.agent_slug,
        outcome_type: formData.outcome_type,
        base_amount: baseAmount,
        percentage_of_deal: percentage,
        is_active: true,
        split_rules: {},
      });

      if (error) throw error;

      toast.success("Attribution rule created");
      setDialogOpen(false);
      setFormData({
        agent_slug: "all",
        outcome_type: "meeting_set",
        base_amount: "250",
        percentage_of_deal: "",
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create rule");
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("agent_attribution_rules")
        .update({ is_active: isActive })
        .eq("id", ruleId);

      if (error) throw error;
      toast.success(isActive ? "Rule activated" : "Rule deactivated");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update rule");
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from("agent_attribution_rules")
        .delete()
        .eq("id", ruleId);

      if (error) throw error;
      toast.success("Rule deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete rule");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Agent Attribution Rules
          </h3>
          <p className="text-sm text-muted-foreground">
            Define credit values for each outcome type
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Create Attribution Rule
                </DialogTitle>
                <DialogDescription>
                  Define how agent outcomes are valued in this deal room
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Agent (optional)</Label>
                  <Select
                    value={formData.agent_slug}
                    onValueChange={(v) => setFormData({ ...formData, agent_slug: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All agents" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents (Default)</SelectItem>
                      {agents.filter((agent) => agent.slug && agent.slug.trim() !== '').map((agent) => (
                        <SelectItem key={agent.slug} value={agent.slug}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Leave as "All Agents" to apply to any agent, or select a specific agent
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Outcome Type</Label>
                  <Select
                    value={formData.outcome_type}
                    onValueChange={(v) => {
                      const outcomeType = outcomeTypes.find(o => o.value === v);
                      setFormData({ 
                        ...formData, 
                        outcome_type: v,
                        base_amount: outcomeType?.defaultAmount?.toString() || "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outcomeTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center justify-between w-full gap-4">
                            <span>{type.label}</span>
                            <Badge variant="outline" className="text-xs">
                              ${type.defaultAmount}
                            </Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_amount">Fixed Amount ($)</Label>
                    <Input
                      id="base_amount"
                      type="number"
                      min="0"
                      placeholder="e.g., 250"
                      value={formData.base_amount}
                      onChange={(e) => setFormData({ ...formData, base_amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentage">% of Deal</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g., 2.5"
                      value={formData.percentage_of_deal}
                      onChange={(e) => setFormData({ ...formData, percentage_of_deal: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  If both are set, the fixed amount applies. Use percentage for deal-value-based attribution.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <Card className="p-8 text-center">
          <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Attribution Rules</h3>
          <p className="text-muted-foreground mb-4">
            Default values will be used. Add custom rules to override.
          </p>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Default Values:</p>
            <ul className="space-y-1">
              <li>Meeting Set: $250</li>
              <li>Reply Received: $50</li>
              <li>Trigger Detected: $25</li>
            </ul>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const outcomeType = outcomeTypes.find(o => o.value === rule.outcome_type);
            
            return (
              <Card key={rule.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {outcomeType?.label || rule.outcome_type}
                        </span>
                        {rule.agent_slug ? (
                          <Badge variant="secondary" className="text-xs">
                            <Bot className="w-3 h-3 mr-1" />
                            {rule.agent_slug}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">All Agents</Badge>
                        )}
                        {!rule.is_active && (
                          <Badge variant="destructive" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.base_amount 
                          ? `$${rule.base_amount} per occurrence`
                          : `${rule.percentage_of_deal}% of deal value`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">
                        {rule.base_amount 
                          ? `$${rule.base_amount}`
                          : `${rule.percentage_of_deal}%`
                        }
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
