import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Play, 
  Lock, 
  CheckCircle,
  Clock,
  FlaskConical,
  History,
  Users
} from "lucide-react";
import { FormulationIngredientsManager } from "./FormulationIngredientsManager";
import { FormulationReviewPanel } from "./FormulationReviewPanel";
import { BlenderKnowledgeHelper } from "./BlenderKnowledgeHelper";
import { format } from "date-fns";

interface ChemicalBlenderProps {
  dealRoomId: string;
  isAdmin: boolean;
}

interface Formulation {
  id: string;
  deal_room_id: string;
  name: string;
  description: string | null;
  version_number: number;
  status: string;
  activated_at: string | null;
  activated_by: string | null;
  created_at: string;
  created_by: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: Clock },
  pending_review: { label: "Pending Review", color: "bg-amber-500/20 text-amber-600", icon: Users },
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-600", icon: CheckCircle },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground", icon: History },
};

export const ChemicalBlender = ({ dealRoomId, isAdmin }: ChemicalBlenderProps) => {
  const { user } = useAuth();
  const [formulations, setFormulations] = useState<Formulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFormulation, setSelectedFormulation] = useState<Formulation | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchFormulations();
  }, [dealRoomId]);

  const fetchFormulations = async () => {
    try {
      const { data, error } = await supabase
        .from("deal_room_formulations")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setFormulations(data || []);
    } catch (error) {
      console.error("Error fetching formulations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Please provide a formulation name");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("deal_room_formulations")
        .insert({
          deal_room_id: dealRoomId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          version: 1,
          status: "draft",
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Formulation created");
      setDialogOpen(false);
      setFormData({ name: "", description: "" });
      fetchFormulations();
      
      // Open the new formulation for ingredient configuration
      setSelectedFormulation(data);
      setActiveTab("configure");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create formulation");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (formulationId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === "active") {
        updates.activated_at = new Date().toISOString();
        updates.activated_by = user?.id;
      }

      const { error } = await supabase
        .from("deal_room_formulations")
        .update(updates)
        .eq("id", formulationId);

      if (error) throw error;
      toast.success(`Formulation status updated to ${statusConfig[newStatus]?.label || newStatus}`);
      fetchFormulations();
      
      if (selectedFormulation?.id === formulationId) {
        setSelectedFormulation({ ...selectedFormulation, status: newStatus, ...updates });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const activeFormulation = formulations.find(f => f.status === "active");

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            Chemical Blender
          </h2>
          <p className="text-sm text-muted-foreground">
            Define attribution rules and ingredient formulations for deal compensation
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Formulation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-primary" />
                  Create Formulation
                </DialogTitle>
                <DialogDescription>
                  Create a new formulation to define attribution rules for this deal room
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Formulation Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Q1 Revenue Split v1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the purpose and scope of this formulation..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving} className="gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Formulation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Active Formulation Banner */}
      {activeFormulation && (
        <Card className="p-4 border-emerald-500/50 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Lock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-emerald-700">Active Formulation: {activeFormulation.name}</p>
                <p className="text-sm text-emerald-600/80">
                  v{activeFormulation.version_number} • Activated {activeFormulation.activated_at ? format(new Date(activeFormulation.activated_at), "MMM d, yyyy") : ""}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedFormulation(activeFormulation);
                setActiveTab("configure");
              }}
            >
              View Details
            </Button>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <Beaker className="w-4 h-4" />
            Formulations
          </TabsTrigger>
          {selectedFormulation && (
            <TabsTrigger value="configure" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              Configure: {selectedFormulation.name}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {formulations.length === 0 ? (
                <Card className="p-8 text-center">
                  <FlaskConical className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No Formulations Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first formulation to define attribution rules
                  </p>
                  {isAdmin && (
                    <Button onClick={() => setDialogOpen(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Formulation
                    </Button>
                  )}
                </Card>
              ) : (
                formulations.map((f) => {
                  const StatusIcon = statusConfig[f.status]?.icon || Clock;
                  const isActive = f.status === "active";
                  
                  return (
                    <Card 
                      key={f.id} 
                      className={`p-4 cursor-pointer transition-colors hover:border-primary/50 ${
                        selectedFormulation?.id === f.id ? "border-primary" : ""
                      }`}
                      onClick={() => {
                        setSelectedFormulation(f);
                        setActiveTab("configure");
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{f.name}</h3>
                            {isActive && <Lock className="w-4 h-4 text-amber-500" />}
                          </div>
                          {f.description && (
                            <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Created {format(new Date(f.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusConfig[f.status]?.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[f.status]?.label || f.status}
                          </Badge>
                          <Badge variant="outline">v{f.version_number}</Badge>
                        </div>
                      </div>
                      
                      {isAdmin && !isActive && (
                        <div className="mt-4 pt-3 border-t flex gap-2">
                          {f.status === "draft" && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(f.id, "pending_review");
                              }}
                            >
                              <Users className="w-4 h-4" />
                              Submit for Review
                            </Button>
                          )}
                          {f.status === "pending_review" && (
                            <Button 
                              size="sm" 
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(f.id, "active");
                              }}
                            >
                              <Play className="w-4 h-4" />
                              Activate
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
            <BlenderKnowledgeHelper />
          </div>
        </TabsContent>

        <TabsContent value="configure" className="mt-6">
          {selectedFormulation && (
            <div className="space-y-6">
              {/* Formulation Header */}
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{selectedFormulation.name}</h3>
                      <Badge className={statusConfig[selectedFormulation.status]?.color}>
                        {statusConfig[selectedFormulation.status]?.label || selectedFormulation.status}
                      </Badge>
                      <Badge variant="outline">v{selectedFormulation.version_number}</Badge>
                    </div>
                    {selectedFormulation.description && (
                      <p className="text-muted-foreground mt-1">{selectedFormulation.description}</p>
                    )}
                  </div>
                  {isAdmin && selectedFormulation.status !== "active" && (
                    <Select
                      value={selectedFormulation.status}
                      onValueChange={(v) => handleStatusChange(selectedFormulation.id, v)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                        <SelectItem value="active">Activate</SelectItem>
                        <SelectItem value="archived">Archive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </Card>

              {/* Configuration Tabs */}
              <Tabs defaultValue="ingredients">
                <TabsList>
                  <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                  <TabsTrigger value="attribution">Attribution Rules</TabsTrigger>
                  <TabsTrigger value="reviews">Partner Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="ingredients" className="mt-4">
                  <FormulationIngredientsManager 
                    formulationId={selectedFormulation.id}
                    dealRoomId={dealRoomId}
                    isLocked={selectedFormulation.status === "active"}
                    isAdmin={isAdmin}
                  />
                </TabsContent>

                <TabsContent value="attribution" className="mt-4">
                  <Card className="p-6">
                    <p className="text-muted-foreground text-center py-8">
                      Attribution rules are defined through ingredients with weights and credit multipliers.
                      Add ingredients in the Ingredients tab to build your attribution model.
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-4">
                  <FormulationReviewPanel 
                    formulationId={selectedFormulation.id}
                    dealRoomId={dealRoomId}
                    isAdmin={isAdmin}
                    status={selectedFormulation.status}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
