import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreditRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealRoomId: string;
  participantId: string;
  onSuccess: () => void;
}

const classificationOptions = [
  { value: "ingredient", label: "Ingredient (IP/Software/Knowledge)" },
  { value: "formulation", label: "Formulation (Customization/Integration)" },
  { value: "distribution", label: "Distribution (Sales/Marketing)" },
  { value: "operations", label: "Operations (Execution/Support)" },
  { value: "capital", label: "Capital (Financial Investment)" },
  { value: "infrastructure", label: "Infrastructure (Compute/Storage)" },
];

export const CreditRegistrationModal = ({
  open,
  onOpenChange,
  dealRoomId,
  participantId,
  onSuccess,
}: CreditRegistrationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    credit_type: "contribution" as "contribution" | "usage" | "value",
    amount: "",
    classification: "",
    description: "",
    evidence_url: "",
  });

  const handleSubmit = async () => {
    if (!formData.amount || !formData.classification) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const tableName = `credit_${formData.credit_type}s`;
      const insertData: any = {
        deal_room_id: dealRoomId,
        participant_id: participantId,
        description: formData.description || null,
      };

      if (formData.credit_type === "contribution") {
        insertData.contribution_amount = parseFloat(formData.amount);
        insertData.classification = formData.classification;
        insertData.evidence_url = formData.evidence_url || null;
      } else if (formData.credit_type === "usage") {
        insertData.usage_count = parseInt(formData.amount);
        insertData.resource_type = formData.classification;
      } else {
        insertData.value_amount = parseFloat(formData.amount);
        insertData.value_type = formData.classification;
      }

      const { error } = await supabase.from(tableName as any).insert([insertData]);

      if (error) throw error;

      toast.success("Credit registered successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        credit_type: "contribution",
        amount: "",
        classification: "",
        description: "",
        evidence_url: "",
      });
    } catch (error) {
      console.error("Error registering credit:", error);
      toast.error("Failed to register credit");
    } finally {
      setLoading(false);
    }
  };

  const getClassificationLabel = () => {
    switch (formData.credit_type) {
      case "contribution":
        return "Classification";
      case "usage":
        return "Resource Type";
      case "value":
        return "Value Type";
    }
  };

  const getAmountLabel = () => {
    switch (formData.credit_type) {
      case "contribution":
        return "Credit Amount";
      case "usage":
        return "Usage Count";
      case "value":
        return "Value Amount ($)";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register Credits</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Credit Type</Label>
            <Select
              value={formData.credit_type}
              onValueChange={(v) =>
                setFormData({ ...formData, credit_type: v as any, classification: "" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contribution">Contribution Credit</SelectItem>
                <SelectItem value="usage">Usage Credit</SelectItem>
                <SelectItem value="value">Value Credit</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.credit_type === "contribution" &&
                "Initial IP, effort, or capital contributions"}
              {formData.credit_type === "usage" &&
                "Track resource consumption (API calls, data access)"}
              {formData.credit_type === "value" &&
                "Real-world value generated (revenue, savings)"}
            </p>
          </div>

          <div>
            <Label>{getClassificationLabel()} *</Label>
            {formData.credit_type === "contribution" ? (
              <Select
                value={formData.classification}
                onValueChange={(v) => setFormData({ ...formData, classification: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  {classificationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={formData.classification}
                onChange={(e) =>
                  setFormData({ ...formData, classification: e.target.value })
                }
                placeholder={
                  formData.credit_type === "usage"
                    ? "e.g., api_call, data_query"
                    : "e.g., revenue, cost_savings"
                }
              />
            )}
          </div>

          <div>
            <Label>{getAmountLabel()} *</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder={formData.credit_type === "usage" ? "1" : "1000"}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe this credit entry..."
              rows={3}
            />
          </div>

          {formData.credit_type === "contribution" && (
            <div>
              <Label>Evidence URL</Label>
              <Input
                value={formData.evidence_url}
                onChange={(e) =>
                  setFormData({ ...formData, evidence_url: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          )}

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Register Credit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
