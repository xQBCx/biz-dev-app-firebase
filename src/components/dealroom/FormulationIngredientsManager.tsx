import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { 
  Plus, 
  Beaker, 
  Loader2, 
  Trash2,
  Lock,
  Weight,
  Coins,
  User,
  Bot,
  AlertTriangle
} from "lucide-react";

interface FormulationIngredientsManagerProps {
  formulationId: string;
  dealRoomId: string;
  isLocked: boolean;
  isAdmin: boolean;
}

interface Ingredient {
  id: string;
  formulation_id: string;
  contributor_id: string;
  contributor_type: string;
  ingredient_type: string;
  description: string | null;
  value_weight: number;
  credit_multiplier: number;
  ownership_percent: number;
  created_at: string;
}

const ingredientTypes = [
  { value: "human_contribution", label: "Human Contribution", description: "Work by team members" },
  { value: "agent_contribution", label: "Agent Contribution", description: "AI/automated work" },
  { value: "ip_asset", label: "IP Asset", description: "Patents, code, designs" },
  { value: "capital", label: "Capital", description: "Financial investment" },
  { value: "relationship", label: "Relationship", description: "Client/partner intro" },
  { value: "infrastructure", label: "Infrastructure", description: "Platform/tools provided" },
];

const contributorTypes = [
  { value: "human", label: "Human", icon: User },
  { value: "agent", label: "Agent/AI", icon: Bot },
];

export const FormulationIngredientsManager = ({
  formulationId,
  dealRoomId,
  isLocked,
  isAdmin,
}: FormulationIngredientsManagerProps) => {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    contributor_id: "",
    contributor_type: "human",
    ingredient_type: "human_contribution",
    description: "",
    value_weight: 1.0,
    credit_multiplier: 1.0,
    ownership_percent: 10,
  });

  useEffect(() => {
    fetchData();
  }, [formulationId, dealRoomId]);

  const fetchData = async () => {
    try {
      const [ingredientsRes, participantsRes] = await Promise.all([
        supabase
          .from("deal_room_ingredients")
          .select("*")
          .eq("formulation_id", formulationId)
          .order("created_at", { ascending: true }),
        supabase
          .from("deal_room_participants")
          .select("id, user_id, role, profiles(full_name, email)")
          .eq("deal_room_id", dealRoomId),
      ]);

      if (ingredientsRes.error) throw ingredientsRes.error;
      setIngredients(ingredientsRes.data || []);
      setParticipants((participantsRes.data as any) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalOwnership = ingredients.reduce((sum, i) => sum + (i.ownership_percent || 0), 0);

  const handleCreate = async () => {
    if (!formData.contributor_id.trim()) {
      toast.error("Please provide a contributor ID");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("deal_room_ingredients")
        .insert({
          formulation_id: formulationId,
          contributor_id: formData.contributor_id.trim(),
          contributor_type: formData.contributor_type,
          ingredient_type: formData.ingredient_type,
          description: formData.description.trim() || null,
          value_weight: formData.value_weight,
          credit_multiplier: formData.credit_multiplier,
          ownership_percent: formData.ownership_percent,
        });

      if (error) throw error;

      toast.success("Ingredient added");
      setDialogOpen(false);
      setFormData({
        contributor_id: "",
        contributor_type: "human",
        ingredient_type: "human_contribution",
        description: "",
        value_weight: 1.0,
        credit_multiplier: 1.0,
        ownership_percent: 10,
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to add ingredient");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ingredientId: string) => {
    if (isLocked) {
      toast.error("Cannot modify locked formulation");
      return;
    }

    try {
      const { error } = await supabase
        .from("deal_room_ingredients")
        .delete()
        .eq("id", ingredientId);

      if (error) throw error;
      toast.success("Ingredient removed");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove ingredient");
    }
  };

  const handleOwnershipUpdate = async (ingredientId: string, newOwnership: number) => {
    if (isLocked) return;

    try {
      const { error } = await supabase
        .from("deal_room_ingredients")
        .update({ ownership_percent: newOwnership })
        .eq("id", ingredientId);

      if (error) throw error;
      setIngredients(prev => 
        prev.map(i => i.id === ingredientId ? { ...i, ownership_percent: newOwnership } : i)
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update ownership");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Formulation Ingredients</h3>
        </div>
        {isAdmin && !isLocked && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Ingredient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-primary" />
                  Add Ingredient
                </DialogTitle>
                <DialogDescription>
                  Add a new contributor ingredient to this formulation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Contributor ID *</Label>
                  <Select
                    value={formData.contributor_id}
                    onValueChange={(v) => setFormData({ ...formData, contributor_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select contributor" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((p) => (
                        <SelectItem key={p.user_id} value={p.user_id}>
                          {p.profiles?.full_name || p.profiles?.email || "Unknown"} ({p.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Contributor Type</Label>
                  <Select
                    value={formData.contributor_type}
                    onValueChange={(v) => setFormData({ ...formData, contributor_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contributorTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this contribution..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ingredient Type</Label>
                  <Select
                    value={formData.ingredient_type}
                    onValueChange={(v) => setFormData({ ...formData, ingredient_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredientTypes.map((type) => (
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Weight className="w-4 h-4" />
                      Ownership %
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.ownership_percent}
                      onChange={(e) => setFormData({ ...formData, ownership_percent: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Value Weight</Label>
                    <Input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={formData.value_weight}
                      onChange={(e) => setFormData({ ...formData, value_weight: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      Multiplier
                    </Label>
                    <Input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={formData.credit_multiplier}
                      onChange={(e) => setFormData({ ...formData, credit_multiplier: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving} className="gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add Ingredient
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Locked Warning */}
      {isLocked && (
        <Card className="p-4 border-amber-500/50 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-700">Formulation Locked</p>
              <p className="text-sm text-amber-600/80">
                This formulation is active. Ingredients cannot be modified.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Ownership Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Weight className="w-5 h-5 text-primary" />
            <span className="font-medium">Total Ownership Allocation</span>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${totalOwnership !== 100 ? "text-amber-500" : "text-emerald-500"}`}>
              {totalOwnership.toFixed(1)}%
            </span>
            {totalOwnership !== 100 && (
              <p className="text-xs text-amber-500 flex items-center gap-1 justify-end">
                <AlertTriangle className="w-3 h-3" />
                Should equal 100%
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Ingredients List */}
      {ingredients.length === 0 ? (
        <Card className="p-8 text-center">
          <Beaker className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Ingredients Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add ingredients to define how value is attributed in this formulation
          </p>
          {isAdmin && !isLocked && (
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Ingredient
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {ingredients.map((ingredient) => {
            const typeConfig = ingredientTypes.find(t => t.value === ingredient.ingredient_type);
            const ContribIcon = ingredient.contributor_type === "agent" ? Bot : User;
            const contributor = participants.find(p => p.user_id === ingredient.contributor_id);
            
            return (
              <Card key={ingredient.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ContribIcon className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-medium">
                        {contributor?.profiles?.full_name || contributor?.profiles?.email || ingredient.contributor_id}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {typeConfig?.label || ingredient.ingredient_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {ingredient.contributor_type}
                      </Badge>
                    </div>
                    {ingredient.description && (
                      <p className="text-sm text-muted-foreground">{ingredient.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-muted-foreground" />
                        {isLocked ? (
                          <span className="text-lg font-bold">{ingredient.ownership_percent}%</span>
                        ) : (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="w-20 text-right"
                            value={ingredient.ownership_percent}
                            onChange={(e) => handleOwnershipUpdate(ingredient.id, parseFloat(e.target.value) || 0)}
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ×{ingredient.credit_multiplier} multiplier • {ingredient.value_weight} weight
                      </p>
                    </div>
                    
                    {isAdmin && !isLocked && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(ingredient.id)}
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
