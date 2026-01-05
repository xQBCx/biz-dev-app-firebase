import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Beaker, Loader2, Percent, Play, Lock, CheckCircle } from "lucide-react";
import { BlenderKnowledgeHelper } from "./BlenderKnowledgeHelper";
import { FormulationActivator } from "./FormulationActivator";

interface FormulationBuilderProps {
  dealRoomId: string;
  isAdmin: boolean;
}

export const FormulationBuilder = ({ dealRoomId, isAdmin }: FormulationBuilderProps) => {
  const [formulations, setFormulations] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activatorOpen, setActivatorOpen] = useState(false);
  const [selectedFormulation, setSelectedFormulation] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    selected_ingredients: [] as { id: string; weight: number }[],
  });

  useEffect(() => {
    fetchData();
  }, [dealRoomId]);

  const fetchData = async () => {
    try {
      const { data: fData } = await supabase
        .from("blender_formulations")
        .select("*")
        .order("created_at", { ascending: false });
      
      const { data: iData } = await supabase
        .from("blender_ingredients")
        .select("*")
        .order("created_at", { ascending: false });
      
      setFormulations((fData || []).filter((f: any) => f.deal_room_id === dealRoomId));
      setIngredients((iData || []).filter((i: any) => i.deal_room_id === dealRoomId && i.is_active));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (id: string) => {
    setFormData((prev) => {
      const existing = prev.selected_ingredients.find((i) => i.id === id);
      if (existing) {
        return { ...prev, selected_ingredients: prev.selected_ingredients.filter((i) => i.id !== id) };
      }
      return { ...prev, selected_ingredients: [...prev.selected_ingredients, { id, weight: 100 / (prev.selected_ingredients.length + 1) }] };
    });
  };

  const updateWeight = (id: string, weight: number) => {
    setFormData((prev) => ({
      ...prev,
      selected_ingredients: prev.selected_ingredients.map((i) => (i.id === id ? { ...i, weight } : i)),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.selected_ingredients.length === 0) {
      toast.error("Provide name and select ingredients");
      return;
    }
    setSaving(true);
    try {
      const { data: formulation, error } = await supabase
        .from("blender_formulations")
        .insert([{ deal_room_id: dealRoomId, name: formData.name, description: formData.description || null }])
        .select()
        .single();
      if (error) throw error;

      const inserts = formData.selected_ingredients.map((i) => ({
        formulation_id: formulation.id,
        ingredient_id: i.id,
        weight_percent: i.weight,
      }));
      await supabase.from("formulation_ingredients").insert(inserts);

      toast.success("Formulation created");
      setDialogOpen(false);
      setFormData({ name: "", description: "", selected_ingredients: [] });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create formulation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Card className="p-6"><div className="animate-pulse h-32 bg-muted rounded" /></Card>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Beaker className="w-5 h-5 text-primary" />
            Formulation Builder
          </h2>
          <p className="text-sm text-muted-foreground">Compose ingredients into solutions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />New Formulation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Formulation</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Select Ingredients *</Label>
                {ingredients.length === 0 ? (
                  <Card className="p-4 text-center text-muted-foreground">No ingredients yet</Card>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                    {ingredients.map((ing: any) => {
                      const sel = formData.selected_ingredients.find((i) => i.id === ing.id);
                      return (
                        <div key={ing.id} className={`flex items-center gap-3 p-3 rounded-lg border ${sel ? "border-primary bg-primary/5" : "border-border"}`}>
                          <Checkbox checked={!!sel} onCheckedChange={() => toggleIngredient(ing.id)} />
                          <div className="flex-1">
                            <div className="font-medium">{ing.name}</div>
                            <div className="text-xs text-muted-foreground">{ing.ingredient_type}</div>
                          </div>
                          {sel && (
                            <div className="flex items-center gap-2">
                              <Percent className="w-4 h-4 text-muted-foreground" />
                              <Input type="number" className="w-20" value={sel.weight} onChange={(e) => updateWeight(ing.id, parseFloat(e.target.value) || 0)} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <Button onClick={handleSubmit} disabled={saving} className="w-full gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {formulations.length === 0 ? (
            <Card className="p-8 text-center">
              <Beaker className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Formulations Yet</h3>
              <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" />Create</Button>
            </Card>
          ) : (
            formulations.map((f: any) => {
              const isActive = f.is_active || f.formulation_status === "active";
              return (
                <Card key={f.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{f.name}</h3>
                        {isActive && <Lock className="w-4 h-4 text-amber-500" />}
                      </div>
                      {f.description && <p className="text-sm text-muted-foreground">{f.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? (
                          <><CheckCircle className="w-3 h-3 mr-1" />Active</>
                        ) : (
                          f.formulation_status || "draft"
                        )}
                      </Badge>
                      <Badge variant="outline">v{f.version || 1}</Badge>
                    </div>
                  </div>
                  {isAdmin && !isActive && (
                    <div className="mt-4 pt-3 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => {
                          setSelectedFormulation(f);
                          setActivatorOpen(true);
                        }}
                      >
                        <Play className="w-4 h-4" />
                        Activate
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
        <BlenderKnowledgeHelper />
      </div>

      {/* Formulation Activator */}
      {selectedFormulation && (
        <FormulationActivator
          formulation={selectedFormulation}
          dealRoomId={dealRoomId}
          onUpdate={fetchData}
          open={activatorOpen}
          onOpenChange={setActivatorOpen}
        />
      )}
    </div>
  );
};
