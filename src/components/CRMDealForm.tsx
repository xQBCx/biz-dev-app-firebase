import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CRMDealFormProps {
  dealId?: string;
  onSuccess?: () => void;
}

export const CRMDealForm = ({ dealId, onSuccess }: CRMDealFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    stage: "qualification",
    probability: "25",
    expected_close_date: "",
    description: "",
    deal_type: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("crm_deals")
        .insert({
          ...formData,
          user_id: user.id,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          probability: formData.probability ? parseInt(formData.probability) : 0,
          expected_close_date: formData.expected_close_date || null,
        });

      if (error) throw error;

      toast.success("Deal created successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/crm");
      }
    } catch (error) {
      console.error("Error creating deal:", error);
      toast.error("Failed to create deal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Deal Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stage">Stage</Label>
          <Select
            value={formData.stage}
            onValueChange={(value) => setFormData({ ...formData, stage: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qualification">Qualification</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="expected_close_date">Expected Close Date</Label>
          <Input
            id="expected_close_date"
            type="date"
            value={formData.expected_close_date}
            onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="deal_type">Deal Type</Label>
        <Input
          id="deal_type"
          value={formData.deal_type}
          onChange={(e) => setFormData({ ...formData, deal_type: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Creating..." : "Create Deal"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate("/crm")}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
