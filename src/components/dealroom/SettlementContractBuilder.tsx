import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { FileText, DollarSign, Shield, Clock, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Database, Json } from "@/integrations/supabase/types";

interface SettlementContractBuilderProps {
  dealRoomId: string;
  onCreated?: () => void;
}

interface PayoutRecipient {
  user_id: string;
  share_percent: number;
  role: string;
}

type SettlementTrigger = Database["public"]["Enums"]["settlement_trigger"];

const triggerTypes: { value: SettlementTrigger; label: string; description: string }[] = [
  { value: "revenue_received", label: "Revenue Received", description: "Triggers when payment is received" },
  { value: "invoice_paid", label: "Invoice Paid", description: "Triggers when an invoice is marked as paid" },
  { value: "time_based", label: "Time-Based (Retainer)", description: "Triggers on a recurring schedule" },
  { value: "milestone_hit", label: "Milestone Hit", description: "Triggers when a project milestone is completed" },
  { value: "manual_approval", label: "Manual Approval", description: "Requires manual trigger by admin" },
  { value: "usage_threshold", label: "Usage Threshold", description: "Triggers when usage threshold is reached" },
  { value: "savings_verified", label: "Savings Verified", description: "Triggers when savings are verified" }
];

const revenueSourceTypes = [
  { value: "retainer", label: "Retainer", description: "Recurring fixed payment" },
  { value: "meeting_fee", label: "Meeting Fee", description: "Per-meeting success fee" },
  { value: "deal_commission", label: "Deal Commission", description: "Percentage of closed deal value" },
  { value: "milestone_payment", label: "Milestone Payment", description: "Project milestone completion" },
  { value: "platform_fee", label: "Platform Fee", description: "Platform usage or subscription fee" }
];

const confirmationSources = [
  { value: "hubspot", label: "HubSpot", description: "Verify via HubSpot CRM" },
  { value: "salesforce", label: "Salesforce", description: "Verify via Salesforce CRM" },
  { value: "manual", label: "Manual Approval", description: "Require admin confirmation" },
  { value: "webhook", label: "External Webhook", description: "Verify via external system webhook" }
];

export function SettlementContractBuilder({ dealRoomId, onCreated }: SettlementContractBuilderProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    triggerType: "revenue_received" as SettlementTrigger,
    revenueSourceType: "meeting_fee",
    payoutAmount: "",
    payoutPriority: "3",
    isActive: true,
    // Confirmation settings
    requiresConfirmation: true,
    confirmationSource: "hubspot",
    // Escrow settings
    minimumEscrowRequired: "",
    // Trigger conditions
    minimumAmount: "",
    threshold: "",
    schedule: ""
  });

  const [recipients, setRecipients] = useState<PayoutRecipient[]>([]);

  const createContract = useMutation({
    mutationFn: async () => {
      // Build trigger conditions based on type
      const triggerConditions: Record<string, string | number> = {};
      if (formData.triggerType === "time_based" && formData.schedule) {
        triggerConditions.schedule = formData.schedule;
      }
      if (formData.minimumAmount) {
        triggerConditions.minimum_amount = parseFloat(formData.minimumAmount);
      }
      if (formData.threshold) {
        triggerConditions.threshold = parseFloat(formData.threshold);
      }

      // Build distribution logic
      const distributionLogic: Record<string, unknown> = {
        type: "fixed",
        amount: parseFloat(formData.payoutAmount),
        recipients: recipients.length > 0 ? recipients : undefined
      };

      const { error } = await supabase
        .from("settlement_contracts")
        .insert([{
          deal_room_id: dealRoomId,
          name: formData.name,
          trigger_type: formData.triggerType,
          trigger_conditions: triggerConditions as unknown as Json,
          distribution_logic: distributionLogic as unknown as Json,
          payout_priority: parseInt(formData.payoutPriority),
          revenue_source_type: formData.revenueSourceType,
          external_confirmation_required: formData.requiresConfirmation,
          external_confirmation_source: formData.requiresConfirmation ? formData.confirmationSource : null,
          minimum_escrow_required: formData.minimumEscrowRequired ? parseFloat(formData.minimumEscrowRequired) : null,
          is_active: formData.isActive
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlement-contracts", dealRoomId] });
      queryClient.invalidateQueries({ queryKey: ["retainer-contracts", dealRoomId] });
      toast.success("Settlement contract created");
      onCreated?.();
      // Reset form
      setFormData({
        name: "",
        description: "",
        triggerType: "revenue_received",
        revenueSourceType: "meeting_fee",
        payoutAmount: "",
        payoutPriority: "3",
        isActive: true,
        requiresConfirmation: true,
        confirmationSource: "hubspot",
        minimumEscrowRequired: "",
        minimumAmount: "",
        threshold: "",
        schedule: ""
      });
      setRecipients([]);
    },
    onError: (error) => {
      toast.error(`Failed to create contract: ${error.message}`);
    }
  });

  const addRecipient = () => {
    setRecipients([...recipients, { user_id: "", share_percent: 0, role: "partner" }]);
  };

  const updateRecipient = (index: number, field: keyof PayoutRecipient, value: string | number) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const totalSharePercent = recipients.reduce((sum, r) => sum + (r.share_percent || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Settlement Contract Builder
        </CardTitle>
        <CardDescription>
          Create enforceable payout contracts with confirmation gating
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="contract-name">Contract Name *</Label>
            <Input
              id="contract-name"
              placeholder="e.g., The View Pro Meeting Fee"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and terms of this contract..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>
        </div>

        {/* Contract Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Revenue Source Type</Label>
            <Select 
              value={formData.revenueSourceType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, revenueSourceType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {revenueSourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Trigger Type</Label>
            <Select 
              value={formData.triggerType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, triggerType: value as SettlementTrigger }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {triggerTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payout Settings */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payout-amount">Payout Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="payout-amount"
                type="number"
                placeholder="0.00"
                className="pl-9"
                value={formData.payoutAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, payoutAmount: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Priority (Lower = First)</Label>
            <Select 
              value={formData.payoutPriority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, payoutPriority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Highest (Retainers)</SelectItem>
                <SelectItem value="2">2 - High</SelectItem>
                <SelectItem value="3">3 - Medium</SelectItem>
                <SelectItem value="4">4 - Low</SelectItem>
                <SelectItem value="5">5 - Lowest (Success Fees)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-escrow">Min Escrow Required</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="min-escrow"
                type="number"
                placeholder="0.00"
                className="pl-9"
                value={formData.minimumEscrowRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumEscrowRequired: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Confirmation Gating */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="confirmation">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Confirmation Gating
                {formData.requiresConfirmation && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Enabled</span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require External Confirmation</Label>
                  <p className="text-xs text-muted-foreground">
                    Payout won't execute until confirmed by external system
                  </p>
                </div>
                <Switch
                  checked={formData.requiresConfirmation}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresConfirmation: checked }))}
                />
              </div>
              {formData.requiresConfirmation && (
                <div className="space-y-2">
                  <Label>Confirmation Source</Label>
                  <Select 
                    value={formData.confirmationSource}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, confirmationSource: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {confirmationSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="schedule">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule & Conditions
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              {formData.triggerType === "time_based" && (
                <div className="space-y-2">
                  <Label htmlFor="schedule">Cron Schedule</Label>
                  <Input
                    id="schedule"
                    placeholder="0 0 1 * * (monthly on 1st)"
                    value={formData.schedule}
                    onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Examples: "0 0 1 * *" (monthly), "0 0 * * 0" (weekly), "0 0 * * *" (daily)
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-amount">Minimum Amount Threshold</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.minimumAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumAmount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Trigger Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="0"
                    value={formData.threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, threshold: e.target.value }))}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="recipients">
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Payout Recipients
                {recipients.length > 0 && (
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                    {recipients.length} recipients ({totalSharePercent}%)
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-end gap-2 p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label>User ID</Label>
                    <Input
                      placeholder="user-uuid"
                      value={recipient.user_id}
                      onChange={(e) => updateRecipient(index, "user_id", e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label>Share %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={recipient.share_percent}
                      onChange={(e) => updateRecipient(index, "share_percent", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Role</Label>
                    <Select 
                      value={recipient.role}
                      onValueChange={(value) => updateRecipient(index, "role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="originator">Originator</SelectItem>
                        <SelectItem value="executor">Executor</SelectItem>
                        <SelectItem value="platform">Platform</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeRecipient(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addRecipient}>
                + Add Recipient
              </Button>
              {totalSharePercent > 100 && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Total share exceeds 100%
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Active Toggle & Submit */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label>Contract Active</Label>
          </div>
          <Button 
            onClick={() => createContract.mutate()}
            disabled={!formData.name || !formData.payoutAmount || createContract.isPending || totalSharePercent > 100}
          >
            {createContract.isPending ? "Creating..." : "Create Contract"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
