import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Beaker, 
  Tag, 
  TrendingUp, 
  Shield, 
  Coins, 
  Loader2,
  Save
} from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  ingredient_type: string;
  value_category?: string;
  contribution_weight?: number;
  credit_multiplier?: number;
  ip_classification?: string;
}

interface IngredientClassifierProps {
  ingredient: Ingredient;
  onUpdate: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const valueCategoryOptions = [
  { value: "general", label: "General", description: "Standard contribution" },
  { value: "lead", label: "Lead Generation", description: "Customer acquisition" },
  { value: "meeting", label: "Meeting/Demo", description: "Sales interactions" },
  { value: "ip", label: "Intellectual Property", description: "Patents, code, designs" },
  { value: "revenue", label: "Revenue", description: "Direct income generation" },
  { value: "automation", label: "Automation", description: "Process optimization" },
];

const ipClassificationOptions = [
  { value: "internal", label: "Internal", description: "Developed in-house" },
  { value: "licensed", label: "Licensed", description: "Third-party licensed" },
  { value: "open_source", label: "Open Source", description: "OSS components" },
  { value: "proprietary", label: "Proprietary", description: "Exclusive ownership" },
  { value: "collaborative", label: "Collaborative", description: "Joint development" },
];

export const IngredientClassifier = ({
  ingredient,
  onUpdate,
  open,
  onOpenChange,
}: IngredientClassifierProps) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    value_category: ingredient.value_category || "general",
    contribution_weight: ingredient.contribution_weight?.toString() || "1.0",
    credit_multiplier: ingredient.credit_multiplier?.toString() || "1.0",
    ip_classification: ingredient.ip_classification || "internal",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("blender_ingredients")
        .update({
          value_category: formData.value_category,
          contribution_weight: parseFloat(formData.contribution_weight),
          credit_multiplier: parseFloat(formData.credit_multiplier),
          ip_classification: formData.ip_classification,
        })
        .eq("id", ingredient.id);

      if (error) throw error;
      toast.success("Ingredient classification updated");
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update classification");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" />
            Classify Ingredient
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Ingredient Info */}
          <Card className="p-4 bg-muted/50">
            <p className="font-medium">{ingredient.name}</p>
            <Badge variant="outline" className="mt-1">
              {ingredient.ingredient_type.replace(/_/g, " ")}
            </Badge>
          </Card>

          {/* Value Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Value Category
            </Label>
            <Select
              value={formData.value_category}
              onValueChange={(v) => setFormData({ ...formData, value_category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {valueCategoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contribution Weight */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Contribution Weight
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={formData.contribution_weight}
              onChange={(e) => setFormData({ ...formData, contribution_weight: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Higher weight = greater share of formulation value
            </p>
          </div>

          {/* Credit Multiplier */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Credit Multiplier
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              max="5"
              value={formData.credit_multiplier}
              onChange={(e) => setFormData({ ...formData, credit_multiplier: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Multiplier applied when calculating credit payouts
            </p>
          </div>

          {/* IP Classification */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              IP Classification
            </Label>
            <Select
              value={formData.ip_classification}
              onValueChange={(v) => setFormData({ ...formData, ip_classification: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ipClassificationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Classification
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
