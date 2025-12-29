import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Zap, Loader2 } from "lucide-react";

interface SettlementContractModalProps {
  dealRoomId: string;
  onCreated: () => void;
}

const triggerTypes = [
  { value: "revenue_received", label: "Revenue Received", description: "Trigger when payment is received" },
  { value: "invoice_paid", label: "Invoice Paid", description: "Trigger when an invoice is marked paid" },
  { value: "savings_verified", label: "Savings Verified", description: "Trigger when cost savings are confirmed" },
  { value: "milestone_hit", label: "Milestone Hit", description: "Trigger when a milestone is completed" },
  { value: "usage_threshold", label: "Usage Threshold", description: "Trigger when usage exceeds a threshold" },
  { value: "time_based", label: "Time-Based", description: "Trigger on a schedule (monthly, quarterly)" },
  { value: "manual_approval", label: "Manual Approval", description: "Require admin approval to trigger" },
];

export const SettlementContractModal = ({
  dealRoomId,
  onCreated,
}: SettlementContractModalProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    trigger_type: "revenue_received",
    min_amount: "",
    threshold_value: "",
    schedule: "monthly",
    description: "",
    is_active: true,
  });

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Contract name is required");
      return;
    }

    setSaving(true);
    try {
      const triggerConditions: Record<string, any> = {};
      
      if (formData.min_amount) {
        triggerConditions.min_amount = parseFloat(formData.min_amount);
      }
      if (formData.threshold_value && formData.trigger_type === "usage_threshold") {
        triggerConditions.threshold = parseFloat(formData.threshold_value);
      }
      if (formData.trigger_type === "time_based") {
        triggerConditions.schedule = formData.schedule;
      }

      const { error } = await supabase.from("settlement_contracts").insert({
        deal_room_id: dealRoomId,
        name: formData.name,
        trigger_type: formData.trigger_type,
        trigger_conditions: triggerConditions,
        distribution_logic: { type: "proportional" },
        is_active: formData.is_active,
      });

      if (error) throw error;

      toast.success("Settlement contract created");
      setOpen(false);
      setFormData({
        name: "",
        trigger_type: "revenue_received",
        min_amount: "",
        threshold_value: "",
        schedule: "monthly",
        description: "",
        is_active: true,
      });
      onCreated();
    } catch (error: any) {
      toast.error(error.message || "Failed to create contract");
    } finally {
      setSaving(false);
    }
  };

  const selectedTrigger = triggerTypes.find(t => t.value === formData.trigger_type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Create Settlement Contract
          </DialogTitle>
          <DialogDescription>
            Define when and how funds are automatically distributed to participants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Contract Name</Label>
            <Input
              id="name"
              placeholder="e.g., Monthly Revenue Share"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Trigger Type</Label>
            <Select
              value={formData.trigger_type}
              onValueChange={(v) => setFormData({ ...formData, trigger_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {triggerTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTrigger && (
              <p className="text-sm text-muted-foreground">{selectedTrigger.description}</p>
            )}
          </div>

          {/* Conditional fields based on trigger type */}
          {["revenue_received", "invoice_paid", "savings_verified"].includes(formData.trigger_type) && (
            <div className="space-y-2">
              <Label htmlFor="min_amount">Minimum Amount ($)</Label>
              <Input
                id="min_amount"
                type="number"
                placeholder="0"
                value={formData.min_amount}
                onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Only trigger when amount exceeds this value (leave blank for any amount)
              </p>
            </div>
          )}

          {formData.trigger_type === "usage_threshold" && (
            <div className="space-y-2">
              <Label htmlFor="threshold">Usage Threshold</Label>
              <Input
                id="threshold"
                type="number"
                placeholder="e.g., 1000"
                value={formData.threshold_value}
                onChange={(e) => setFormData({ ...formData, threshold_value: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Number of API calls or resource units to trigger payout
              </p>
            </div>
          )}

          {formData.trigger_type === "time_based" && (
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select
                value={formData.schedule}
                onValueChange={(v) => setFormData({ ...formData, schedule: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Active on Creation</Label>
              <p className="text-sm text-muted-foreground">
                Start monitoring for trigger events immediately
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Contract
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
