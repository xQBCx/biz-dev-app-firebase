import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, Plus, Search, Filter, Shield, Trash2, Edit, Save, X
} from "lucide-react";
import { useEnterpriseRisks } from "@/hooks/useEnterpriseRisks";
import { useToast } from "@/hooks/use-toast";
import { TopRisksTable } from "@/components/risk/TopRisksTable";

const CATEGORIES = [
  { value: 'strategic', label: 'Strategic' },
  { value: 'operational', label: 'Operational' },
  { value: 'financial', label: 'Financial' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'technology', label: 'Technology' },
  { value: 'reputational', label: 'Reputational' },
];

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'mitigated', label: 'Mitigated' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'closed', label: 'Closed' },
];

export default function RiskRegister() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { risks, loading, createRisk, updateRisk, deleteRisk, refresh } = useEnterpriseRisks();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<string | null>(searchParams.get('id'));

  // New risk form state
  const [newRisk, setNewRisk] = useState({
    title: "",
    description: "",
    category: "operational",
    likelihood_score: 3,
    impact_score: 3,
    status: "active",
    mitigation_strategy: "",
  });

  const filteredRisks = risks.filter(risk => {
    const matchesSearch = !searchQuery || 
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.risk_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "all" || risk.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || risk.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateRisk = async () => {
    try {
      await createRisk(newRisk);
      toast({ title: "Risk created successfully" });
      setIsCreateDialogOpen(false);
      setNewRisk({
        title: "",
        description: "",
        category: "operational",
        likelihood_score: 3,
        impact_score: 3,
        status: "active",
        mitigation_strategy: "",
      });
    } catch (error: any) {
      toast({ title: "Failed to create risk", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteRisk = async (id: string) => {
    if (!confirm("Are you sure you want to delete this risk?")) return;
    try {
      await deleteRisk(id);
      toast({ title: "Risk deleted successfully" });
    } catch (error: any) {
      toast({ title: "Failed to delete risk", description: error.message, variant: "destructive" });
    }
  };

  const selectedRisk = editingRisk ? risks.find(r => r.id === editingRisk) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/risk-center')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              Enterprise Risk Register
            </h1>
            <p className="text-muted-foreground text-sm">
              Identify, assess, and track organizational risks
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Risk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Risk</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={newRisk.title}
                  onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                  placeholder="Risk title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newRisk.description}
                  onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                  placeholder="Describe the risk..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newRisk.category} onValueChange={(v) => setNewRisk({ ...newRisk, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newRisk.status} onValueChange={(v) => setNewRisk({ ...newRisk, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Likelihood (1-5)</Label>
                  <Select 
                    value={String(newRisk.likelihood_score)} 
                    onValueChange={(v) => setNewRisk({ ...newRisk, likelihood_score: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} - {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][n-1]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Impact (1-5)</Label>
                  <Select 
                    value={String(newRisk.impact_score)} 
                    onValueChange={(v) => setNewRisk({ ...newRisk, impact_score: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} - {['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'][n-1]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Inherent Risk Score</div>
                <div className="text-2xl font-bold">
                  {newRisk.likelihood_score * newRisk.impact_score}
                  <span className="text-sm font-normal ml-2">
                    ({newRisk.likelihood_score * newRisk.impact_score >= 20 ? 'Critical' : 
                      newRisk.likelihood_score * newRisk.impact_score >= 12 ? 'High' :
                      newRisk.likelihood_score * newRisk.impact_score >= 6 ? 'Medium' : 'Low'})
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mitigation Strategy</Label>
                <Textarea
                  value={newRisk.mitigation_strategy}
                  onChange={(e) => setNewRisk({ ...newRisk, mitigation_strategy: e.target.value })}
                  placeholder="Describe mitigation approaches..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRisk} disabled={!newRisk.title}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Risk
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search risks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{filteredRisks.length}</div>
            <div className="text-sm text-muted-foreground">Matching Risks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {filteredRisks.filter(r => (r.inherent_risk_score || 0) >= 20).length}
            </div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {filteredRisks.filter(r => (r.inherent_risk_score || 0) >= 12 && (r.inherent_risk_score || 0) < 20).length}
            </div>
            <div className="text-sm text-muted-foreground">High</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {filteredRisks.filter(r => r.status === 'mitigated').length}
            </div>
            <div className="text-sm text-muted-foreground">Mitigated</div>
          </CardContent>
        </Card>
      </div>

      {/* Risks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Register</CardTitle>
          <CardDescription>
            {filteredRisks.length} of {risks.length} risks shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TopRisksTable 
            risks={filteredRisks} 
            onViewRisk={(id) => setEditingRisk(id)} 
            showAll 
          />
        </CardContent>
      </Card>

      {/* Risk Detail Dialog */}
      {selectedRisk && (
        <Dialog open={!!editingRisk} onOpenChange={(open) => !open && setEditingRisk(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant="outline">{selectedRisk.risk_id}</Badge>
                {selectedRisk.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="font-medium capitalize">{selectedRisk.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium capitalize">{selectedRisk.status}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Description</div>
                <div>{selectedRisk.description || 'No description'}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Likelihood</div>
                  <div className="text-xl font-bold">{selectedRisk.likelihood_score || '-'}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Impact</div>
                  <div className="text-xl font-bold">{selectedRisk.impact_score || '-'}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Inherent Score</div>
                  <div className="text-xl font-bold">{selectedRisk.inherent_risk_score || '-'}</div>
                </div>
              </div>
              {selectedRisk.mitigation_strategy && (
                <div>
                  <div className="text-sm text-muted-foreground">Mitigation Strategy</div>
                  <div>{selectedRisk.mitigation_strategy}</div>
                </div>
              )}
              <div className="flex justify-between pt-4 border-t">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    handleDeleteRisk(selectedRisk.id);
                    setEditingRisk(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Risk
                </Button>
                <Button variant="outline" onClick={() => setEditingRisk(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
