import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Percent, Users, Plus, Loader2, Settings, Trash2 } from "lucide-react";
import { BlenderKnowledgeHelper } from "./BlenderKnowledgeHelper";

interface AttributionRulesPanelProps {
  dealRoomId: string;
  isAdmin: boolean;
}

interface AttributionRule {
  id: string;
  participant_id: string;
  participant_name?: string;
  credit_type: string;
  payout_percentage: number;
  min_payout: number | null;
  max_payout: number | null;
  is_active: boolean;
}

interface Participant {
  id: string;
  user_id: string;
  role: string;
  profiles?: { full_name: string; email: string };
}

const creditTypes = [
  { value: "contribution", label: "Contribution Credits", description: "Initial IP/effort contributions" },
  { value: "usage", label: "Usage Credits", description: "Runtime resource consumption" },
  { value: "value", label: "Value Credits", description: "Verified outcome-based value" },
];

export const AttributionRulesPanel = ({
  dealRoomId,
  isAdmin,
}: AttributionRulesPanelProps) => {
  const [rules, setRules] = useState<AttributionRule[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    participant_id: "",
    credit_type: "contribution",
    payout_percentage: "10",
    min_payout: "",
    max_payout: "",
  });

  useEffect(() => {
    fetchData();
  }, [dealRoomId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch participants
      const { data: partData } = await supabase
        .from("deal_room_participants")
        .select("id, user_id, role, profiles(full_name, email)")
        .eq("deal_room_id", dealRoomId);
      
      setParticipants((partData as any) || []);

      // Fetch attribution rules
      const { data: rulesData } = await supabase
        .from("blender_attribution_rules")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false });

      if (rulesData) {
        // Map participant names
        const rulesWithNames = rulesData.map((rule: any) => {
          const participant = (partData as any)?.find((p: any) => p.id === rule.participant_id);
          return {
            ...rule,
            participant_name: participant?.profiles?.full_name || participant?.profiles?.email || "Unknown",
          };
        });
        setRules(rulesWithNames);
      }
    } catch (error) {
      console.error("Error fetching attribution data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.participant_id) {
      toast.error("Please select a participant");
      return;
    }

    const percentage = parseFloat(formData.payout_percentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error("Payout percentage must be between 0 and 100");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("blender_attribution_rules").insert({
        deal_room_id: dealRoomId,
        participant_id: formData.participant_id,
        credit_type: formData.credit_type,
        payout_percentage: percentage,
        min_payout: formData.min_payout ? parseFloat(formData.min_payout) : null,
        max_payout: formData.max_payout ? parseFloat(formData.max_payout) : null,
        is_active: true,
      });

      if (error) throw error;

      toast.success("Attribution rule created");
      setDialogOpen(false);
      setFormData({
        participant_id: "",
        credit_type: "contribution",
        payout_percentage: "10",
        min_payout: "",
        max_payout: "",
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create rule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from("blender_attribution_rules")
        .delete()
        .eq("id", ruleId);

      if (error) throw error;
      toast.success("Rule deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete rule");
    }
  };

  const totalPercentage = rules
    .filter(r => r.is_active)
    .reduce((sum, r) => sum + r.payout_percentage, 0);

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
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Attribution Rules</h3>
          <BlenderKnowledgeHelper conceptKey="credit_types" />
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
                  Define how credits convert to payouts for each participant
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Participant</Label>
                  <Select
                    value={formData.participant_id}
                    onValueChange={(v) => setFormData({ ...formData, participant_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select participant" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {(p.profiles as any)?.full_name || (p.profiles as any)?.email || "Unknown"} ({p.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Credit Type</Label>
                  <Select
                    value={formData.credit_type}
                    onValueChange={(v) => setFormData({ ...formData, credit_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {creditTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="percentage">Payout Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.payout_percentage}
                    onChange={(e) => setFormData({ ...formData, payout_percentage: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_payout">Min Payout ($)</Label>
                    <Input
                      id="min_payout"
                      type="number"
                      placeholder="Optional"
                      value={formData.min_payout}
                      onChange={(e) => setFormData({ ...formData, min_payout: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_payout">Max Payout ($)</Label>
                    <Input
                      id="max_payout"
                      type="number"
                      placeholder="Optional"
                      value={formData.max_payout}
                      onChange={(e) => setFormData({ ...formData, max_payout: e.target.value })}
                    />
                  </div>
                </div>
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

      {/* Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            <span className="font-medium">Total Allocation</span>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${totalPercentage > 100 ? "text-destructive" : "text-emerald-500"}`}>
              {totalPercentage.toFixed(1)}%
            </span>
            {totalPercentage > 100 && (
              <p className="text-xs text-destructive">Over-allocated!</p>
            )}
          </div>
        </div>
      </Card>

      {/* Rules List */}
      {rules.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Attribution Rules</h3>
          <p className="text-muted-foreground">
            Define how credits convert to payouts for each participant
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const creditType = creditTypes.find(t => t.value === rule.credit_type);
            return (
              <Card key={rule.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{rule.participant_name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{creditType?.label}</Badge>
                        {!rule.is_active && <Badge variant="outline">Inactive</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{rule.payout_percentage}%</p>
                      {(rule.min_payout || rule.max_payout) && (
                        <p className="text-xs text-muted-foreground">
                          {rule.min_payout ? `Min: $${rule.min_payout}` : ""}
                          {rule.min_payout && rule.max_payout ? " • " : ""}
                          {rule.max_payout ? `Max: $${rule.max_payout}` : ""}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
