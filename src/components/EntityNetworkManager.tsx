import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Plus, Link2, BarChart3, Building2, Users, Package, 
  TrendingUp, Database, Zap, Target, Workflow
} from "lucide-react";

interface EntityNetworkManagerProps {
  userId: string;
  onEntityCreated?: () => void;
}

export const EntityNetworkManager = ({ userId, onEntityCreated }: EntityNetworkManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [entities, setEntities] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    entity_type: "company" as const,
    description: "",
    health_score: 75,
    importance_weight: 1.0,
    linked_company_id: null as string | null,
    linked_contact_id: null as string | null,
    linked_client_id: null as string | null,
  });

  const [relationshipData, setRelationshipData] = useState({
    source_entity_id: "",
    target_entity_id: "",
    relationship_type: "depends_on" as const,
    strength: 1.0,
    notes: ""
  });

  const entityTypes = [
    { value: "company", label: "Company", icon: Building2 },
    { value: "person", label: "Person", icon: Users },
    { value: "tool", label: "Tool", icon: Zap },
    { value: "product", label: "Product", icon: Package },
    { value: "service", label: "Service", icon: TrendingUp },
    { value: "department", label: "Department", icon: Database },
    { value: "process", label: "Process", icon: Workflow },
    { value: "metric", label: "Metric", icon: BarChart3 },
  ];

  const relationshipTypes = [
    { value: "owns", label: "Owns" },
    { value: "manages", label: "Manages" },
    { value: "reports_to", label: "Reports To" },
    { value: "depends_on", label: "Depends On" },
    { value: "influences", label: "Influences" },
    { value: "trades_with", label: "Trades With" },
    { value: "partners_with", label: "Partners With" },
    { value: "invests_in", label: "Invests In" },
    { value: "integrates_with", label: "Integrates With" },
  ];

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, userId]);

  const loadData = async () => {
    const [entitiesData, companiesData, contactsData, clientsData] = await Promise.all([
      supabase.from("network_entities" as any).select("*").eq("user_id", userId),
      supabase.from("crm_companies").select("id, name").eq("user_id", userId),
      supabase.from("crm_contacts").select("id, first_name, last_name").eq("user_id", userId),
      supabase.from("clients").select("id, name").eq("user_id", userId),
    ]);

    if (entitiesData.data) setEntities(entitiesData.data);
    if (companiesData.data) setCompanies(companiesData.data);
    if (contactsData.data) setContacts(contactsData.data);
    if (clientsData.data) setClients(clientsData.data);
  };

  const handleCreateEntity = async () => {
    try {
      // Generate random position for visualization
      const position_x = Math.random() * 800;
      const position_y = Math.random() * 600;

      const { error } = await supabase.from("network_entities" as any).insert({
        user_id: userId,
        ...formData,
        position_x,
        position_y
      });

      if (error) throw error;

      toast.success("Entity created successfully");
      setIsOpen(false);
      onEntityCreated?.();
      
      // Reset form
      setFormData({
        name: "",
        entity_type: "company",
        description: "",
        health_score: 75,
        importance_weight: 1.0,
        linked_company_id: null,
        linked_contact_id: null,
        linked_client_id: null,
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCreateRelationship = async () => {
    try {
      const { error } = await supabase.from("entity_relationships" as any).insert({
        user_id: userId,
        ...relationshipData
      });

      if (error) throw error;

      toast.success("Relationship created successfully");
      setIsOpen(false);
      onEntityCreated?.();
      
      // Reset form
      setRelationshipData({
        source_entity_id: "",
        target_entity_id: "",
        relationship_type: "depends_on",
        strength: 1.0,
        notes: ""
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="lg" className="gap-2">
        <Plus className="w-4 h-4" />
        Add to Network
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Network Management</DialogTitle>
            <DialogDescription>
              Add entities or relationships to your enterprise network
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">
                <Target className="w-4 h-4 mr-2" />
                Create Entity
              </TabsTrigger>
              <TabsTrigger value="connect">
                <Link2 className="w-4 h-4 mr-2" />
                Create Relationship
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Entity Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Acme Corp, Marketing Tool"
                  />
                </div>

                <div>
                  <Label htmlFor="entity_type">Entity Type</Label>
                  <Select
                    value={formData.entity_type}
                    onValueChange={(value: any) => setFormData({ ...formData, entity_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {entityTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this entity and its role..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="health_score">Health Score (0-100)</Label>
                    <Input
                      id="health_score"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.health_score}
                      onChange={(e) => setFormData({ ...formData, health_score: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="importance">Importance Weight</Label>
                    <Input
                      id="importance"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.importance_weight}
                      onChange={(e) => setFormData({ ...formData, importance_weight: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Link to existing records */}
                <div className="space-y-3">
                  <Label>Link to Existing Record (Optional)</Label>
                  
                  {companies.length > 0 && (
                    <Select
                      value={formData.linked_company_id || ""}
                      onValueChange={(value) => setFormData({ ...formData, linked_company_id: value || null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Link to Company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {clients.length > 0 && (
                    <Select
                      value={formData.linked_client_id || ""}
                      onValueChange={(value) => setFormData({ ...formData, linked_client_id: value || null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Link to Client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <Button onClick={handleCreateEntity} className="w-full">
                Create Entity
              </Button>
            </TabsContent>

            <TabsContent value="connect" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="source">Source Entity</Label>
                  <Select
                    value={relationshipData.source_entity_id}
                    onValueChange={(value) => setRelationshipData({ ...relationshipData, source_entity_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name} ({entity.entity_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="relationship_type">Relationship Type</Label>
                  <Select
                    value={relationshipData.relationship_type}
                    onValueChange={(value: any) => setRelationshipData({ ...relationshipData, relationship_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target">Target Entity</Label>
                  <Select
                    value={relationshipData.target_entity_id}
                    onValueChange={(value) => setRelationshipData({ ...relationshipData, target_entity_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target entity" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name} ({entity.entity_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="strength">Relationship Strength (0-1)</Label>
                  <Input
                    id="strength"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={relationshipData.strength}
                    onChange={(e) => setRelationshipData({ ...relationshipData, strength: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={relationshipData.notes}
                    onChange={(e) => setRelationshipData({ ...relationshipData, notes: e.target.value })}
                    placeholder="Additional details about this relationship..."
                    rows={3}
                  />
                </div>
              </div>

              <Button onClick={handleCreateRelationship} className="w-full">
                Create Relationship
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};