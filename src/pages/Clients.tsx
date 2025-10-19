import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Search, Edit, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  logo_url: string | null;
  contact_email: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

const Clients = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { activeClientId, setActiveClient } = useActiveClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    industry: "",
    contact_email: "",
    notes: "",
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingClient) {
        const { error } = await supabase
          .from("clients")
          .update({
            ...formData,
            domain: formData.domain || null,
            industry: formData.industry || null,
            contact_email: formData.contact_email || null,
            notes: formData.notes || null,
          })
          .eq("id", editingClient.id);

        if (error) throw error;
        toast.success("Client updated successfully");
      } else {
        const { error } = await supabase.from("clients").insert({
          user_id: user.id,
          ...formData,
          domain: formData.domain || null,
          industry: formData.industry || null,
          contact_email: formData.contact_email || null,
          notes: formData.notes || null,
        });

        if (error) throw error;
        toast.success("Client created successfully");
      }

      setIsDialogOpen(false);
      setEditingClient(null);
      setFormData({ name: "", domain: "", industry: "", contact_email: "", notes: "" });
      loadClients();
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error("Failed to save client");
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      domain: client.domain || "",
      industry: client.industry || "",
      contact_email: client.contact_email || "",
      notes: client.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client? This will also delete all associated CRM data.")) {
      return;
    }

    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      toast.success("Client deleted successfully");
      loadClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    }
  };

  const handleSetActive = (client: Client) => {
    setActiveClient(client.id, client.name);
    toast.success(`Switched to ${client.name}`);
  };

  const filteredClients = clients.filter((client) =>
    `${client.name} ${client.industry || ""} ${client.domain || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Client Workspaces</h1>
            <p className="text-muted-foreground">
              Manage multiple clients and switch between workspaces
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingClient(null);
                setFormData({ name: "", domain: "", industry: "", contact_email: "", notes: "" });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? "Edit Client" : "Add New Client"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="The View Pro"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="domain">Website</Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                      placeholder="theviewpro.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="Technology, Real Estate, etc."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="bill@theviewpro.com"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Project details, special requirements, etc."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingClient ? "Update Client" : "Create Client"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <Card className="p-12 text-center shadow-elevated border border-border">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Clients Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start by adding your first client workspace
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Client
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-10 h-10 text-primary" />
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      {client.industry && (
                        <p className="text-sm text-muted-foreground">{client.industry}</p>
                      )}
                    </div>
                  </div>
                  {activeClientId === client.id && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {client.domain && (
                    <p className="text-muted-foreground truncate">{client.domain}</p>
                  )}
                  {client.contact_email && (
                    <p className="text-muted-foreground truncate">{client.contact_email}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={activeClientId === client.id ? "secondary" : "default"}
                    className="flex-1"
                    onClick={() => handleSetActive(client)}
                  >
                    {activeClientId === client.id ? "Active" : "Switch"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(client.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
