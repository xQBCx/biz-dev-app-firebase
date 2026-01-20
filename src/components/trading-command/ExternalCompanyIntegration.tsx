import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateEquityStake } from "@/hooks/useCapitalFormation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, GitBranch, Link2, Plus, ExternalLink } from "lucide-react";

export function ExternalCompanyIntegration() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    repository_url: "",
    stake_type: "equity",
    ownership_percentage: "",
  });
  
  const createStakeMutation = useCreateEquityStake();

  // Fetch spawned businesses as external company examples
  const { data: spawnedBusinesses } = useQuery({
    queryKey: ['spawned-businesses-for-integration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spawned_businesses')
        .select('id, business_name, custom_domain, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const handleAddCompany = async () => {
    // Create equity stake for external company
    await createStakeMutation.mutateAsync({
      entity_type: 'external_company',
      entity_id: crypto.randomUUID(),
      entity_name: newCompany.name,
      stake_type: newCompany.stake_type,
      ownership_percentage: newCompany.ownership_percentage ? parseFloat(newCompany.ownership_percentage) : undefined,
      acquisition_date: new Date().toISOString().split('T')[0],
    });
    
    setShowAddDialog(false);
    setNewCompany({
      name: "",
      repository_url: "",
      stake_type: "equity",
      ownership_percentage: "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'launched':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Launched</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case 'spawning':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Spawning</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              External Company Integration
            </CardTitle>
            <CardDescription>
              Connect external businesses via Deep Code Fusion for portfolio tracking
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add External Company</DialogTitle>
                <DialogDescription>
                  Link an external company to your portfolio and optionally connect its codebase
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Company Name</Label>
                  <Input
                    placeholder="Enter company name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>GitHub Repository (Optional)</Label>
                  <Input
                    placeholder="https://github.com/owner/repo"
                    value={newCompany.repository_url}
                    onChange={(e) => setNewCompany({ ...newCompany, repository_url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Connect a repository to enable Deep Code Fusion analysis
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Stake Type</Label>
                    <Select
                      value={newCompany.stake_type}
                      onValueChange={(v) => setNewCompany({ ...newCompany, stake_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="options">Options</SelectItem>
                        <SelectItem value="convertible">Convertible Note</SelectItem>
                        <SelectItem value="profit_share">Profit Share</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Ownership %</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={newCompany.ownership_percentage}
                      onChange={(e) => setNewCompany({ ...newCompany, ownership_percentage: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCompany}
                  disabled={!newCompany.name || createStakeMutation.isPending}
                >
                  {createStakeMutation.isPending ? "Adding..." : "Add Company"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!spawnedBusinesses || spawnedBusinesses.length === 0 ? (
          <div className="text-center py-8">
            <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Connected Companies</h3>
            <p className="text-muted-foreground mb-4">
              Add external companies to track equity positions and optionally import their codebases
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {spawnedBusinesses.map((business) => (
              <div
                key={business.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{business.business_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {business.custom_domain && (
                        <a
                          href={`https://${business.custom_domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <GitBranch className="h-3 w-3" />
                          {business.custom_domain}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(business.status || 'pending')}
                  <Button variant="outline" size="sm">
                    <Link2 className="h-4 w-4 mr-2" />
                    Link to Portfolio
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
