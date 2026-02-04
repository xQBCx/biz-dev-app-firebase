import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Package, 
  Plus, 
  Shield,
  Brain,
  Briefcase,
  Users,
  Layers,
  FileText,
  Eye,
  Settings2,
  Coins
} from "lucide-react";
import { BlenderKnowledgeHelper } from "./BlenderKnowledgeHelper";
import { IngredientClassifier } from "./IngredientClassifier";
import { IngredientChangeProposalManager } from "./IngredientChangeProposalManager";
import { format } from "date-fns";

interface Ingredient {
  id: string;
  name: string;
  description: string | null;
  ingredient_type: string;
  is_pre_existing: boolean;
  ownership_status: string;
  owner_id: string | null;
  owner_company_id: string | null;
  created_at: string;
  value_category?: string;
  contribution_weight?: number;
  credit_multiplier?: number;
  ip_classification?: string;
}

interface DealRoomIngredientsProps {
  dealRoomId: string;
  isAdmin: boolean;
}

interface SimpleIngredient {
  id: string;
  name: string;
  description: string | null;
  ingredient_type: string;
}

const ingredientTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  software_module: { label: "Software Module", icon: Layers, color: "bg-blue-500/20 text-blue-600" },
  ai_agent: { label: "AI Agent", icon: Brain, color: "bg-purple-500/20 text-purple-600" },
  security_framework: { label: "Security Framework", icon: Shield, color: "bg-red-500/20 text-red-600" },
  industry_knowledge: { label: "Industry Knowledge", icon: Briefcase, color: "bg-amber-500/20 text-amber-600" },
  capital: { label: "Capital", icon: FileText, color: "bg-emerald-500/20 text-emerald-600" },
  customer_relationships: { label: "Customer Relationships", icon: Users, color: "bg-pink-500/20 text-pink-600" },
  execution_resources: { label: "Execution Resources", icon: Package, color: "bg-cyan-500/20 text-cyan-600" },
  brand_trademark: { label: "Brand/Trademark", icon: Eye, color: "bg-indigo-500/20 text-indigo-600" },
  data_pipeline: { label: "Data Pipeline", icon: Layers, color: "bg-orange-500/20 text-orange-600" },
  governance_framework: { label: "Governance Framework", icon: Shield, color: "bg-teal-500/20 text-teal-600" },
  visualization_system: { label: "Visualization System", icon: Eye, color: "bg-violet-500/20 text-violet-600" },
  other: { label: "Other", icon: Package, color: "bg-muted text-muted-foreground" },
};

export const DealRoomIngredients = ({ 
  dealRoomId, 
  isAdmin 
}: DealRoomIngredientsProps) => {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classifyOpen, setClassifyOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredient_type: "software_module",
    is_pre_existing: true,
    ownership_status: "sole",
  });

  useEffect(() => {
    fetchIngredients();
  }, [dealRoomId]);

  const fetchIngredients = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blender_ingredients")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setIngredients(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter an ingredient name");
      return;
    }

    const { error } = await supabase
      .from("blender_ingredients")
      .insert([{
        name: formData.name,
        description: formData.description || null,
        ingredient_type: formData.ingredient_type as any,
        is_pre_existing: formData.is_pre_existing,
        ownership_status: formData.ownership_status,
      }]);

    if (error) {
      toast.error("Failed to add ingredient");
      console.error(error);
    } else {
      toast.success("Ingredient added successfully");
      setDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        ingredient_type: "software_module",
        is_pre_existing: true,
        ownership_status: "sole",
      });
      fetchIngredients();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading ingredients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Ingredient Registry</h3>
          <BlenderKnowledgeHelper conceptKey="ingredients" />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Register Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Register New Ingredient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Ingredient Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., AI Governance Framework"
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.ingredient_type}
                  onValueChange={(v) => setFormData({ ...formData, ingredient_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ingredientTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this ingredient is and what it does..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="ownership">Ownership Status</Label>
                <Select
                  value={formData.ownership_status}
                  onValueChange={(v) => setFormData({ ...formData, ownership_status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sole">Sole Ownership</SelectItem>
                    <SelectItem value="joint">Joint Ownership</SelectItem>
                    <SelectItem value="licensed">Licensed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pre_existing"
                  checked={formData.is_pre_existing}
                  onChange={(e) => setFormData({ ...formData, is_pre_existing: e.target.checked })}
                  className="rounded border-muted"
                />
                <Label htmlFor="pre_existing" className="text-sm font-normal">
                  This is pre-existing IP (owned before this deal)
                </Label>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Register Ingredient
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ingredients Grid */}
      {ingredients.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Ingredients Registered</h3>
          <p className="text-muted-foreground mb-4">
            Register ingredients (IP, software, frameworks, knowledge) that can be blended into formulations.
          </p>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Register First Ingredient
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ingredient) => {
            const config = ingredientTypeConfig[ingredient.ingredient_type] || ingredientTypeConfig.other;
            const Icon = config.icon;
            
            return (
              <Card key={ingredient.id} className="p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.color.split(" ")[0]}`}>
                    <Icon className={`w-5 h-5 ${config.color.split(" ")[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{ingredient.name}</h4>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {config.label}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setSelectedIngredient(ingredient);
                      setClassifyOpen(true);
                    }}
                  >
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {ingredient.description && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {ingredient.description}
                  </p>
                )}

                {/* Classification Info */}
                {(ingredient.value_category && ingredient.value_category !== "general") && (
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <Coins className="w-3 h-3 text-amber-500" />
                    <span className="text-muted-foreground capitalize">
                      {ingredient.value_category?.replace(/_/g, " ")}
                    </span>
                    {ingredient.credit_multiplier && ingredient.credit_multiplier !== 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {ingredient.credit_multiplier}x
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {ingredient.is_pre_existing ? (
                      <Badge variant="secondary" className="text-xs">Pre-existing</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">New</Badge>
                    )}
                    <Badge variant="outline" className="text-xs capitalize">
                      {ingredient.ownership_status}
                    </Badge>
                  </div>
                  <span>{format(new Date(ingredient.created_at), "MMM d")}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Ingredient Change Proposals */}
      <Card className="p-6">
        <IngredientChangeProposalManager
          dealRoomId={dealRoomId}
          ingredients={ingredients.map(i => ({ 
            id: i.id, 
            name: i.name, 
            description: i.description, 
            ingredient_type: i.ingredient_type 
          } as SimpleIngredient))}
          isAdmin={isAdmin}
          onRefresh={fetchIngredients}
        />
      </Card>

      {/* Ingredient Classifier Modal */}
      {selectedIngredient && (
        <IngredientClassifier
          ingredient={selectedIngredient}
          onUpdate={fetchIngredients}
          open={classifyOpen}
          onOpenChange={setClassifyOpen}
        />
      )}
    </div>
  );
};