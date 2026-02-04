import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Clock, DollarSign, TrendingDown, Plus, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Liability {
  id: string;
  liability_type: string;
  title: string;
  description: string;
  severity: string;
  estimated_impact: number;
  due_date: string | null;
  status: string;
  created_at: string;
}

export const LiabilityScanner = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLiability, setNewLiability] = useState({
    title: '',
    description: '',
    liability_type: 'time_debt',
    severity: 'medium',
    estimated_impact: 0,
    due_date: ''
  });

  const { data: liabilities, isLoading } = useQuery({
    queryKey: ['personal-liabilities', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('personal_liabilities')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('severity', { ascending: false });
      
      if (error) throw error;
      return data as Liability[];
    },
    enabled: !!user?.id
  });

  const addLiabilityMutation = useMutation({
    mutationFn: async (liability: typeof newLiability) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from('personal_liabilities')
        .insert({
          user_id: user.id,
          ...liability,
          due_date: liability.due_date || null
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-liabilities'] });
      setDialogOpen(false);
      setNewLiability({ title: '', description: '', liability_type: 'time_debt', severity: 'medium', estimated_impact: 0, due_date: '' });
      toast.success("Liability added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add liability: " + error.message);
    }
  });

  const resolveLiabilityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('personal_liabilities')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-liabilities'] });
      toast.success("Liability resolved!");
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getLiabilityIcon = (type: string) => {
    switch (type) {
      case 'burnout_risk': return AlertTriangle;
      case 'platform_dependence': return TrendingDown;
      case 'financial_obligation': return DollarSign;
      case 'time_debt': return Clock;
      default: return AlertTriangle;
    }
  };

  const totalImpact = liabilities?.reduce((sum, l) => sum + (l.estimated_impact || 0), 0) || 0;
  const criticalCount = liabilities?.filter(l => l.severity === 'critical' || l.severity === 'high').length || 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Liabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liabilities?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical/High Priority</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Estimated Impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalImpact.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Liabilities List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tracked Liabilities</CardTitle>
            <CardDescription>Obligations, risks, and time debts affecting your corporation</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Liability
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Liability</DialogTitle>
                <DialogDescription>Track a new obligation or risk</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={newLiability.title}
                    onChange={(e) => setNewLiability({ ...newLiability, title: e.target.value })}
                    placeholder="e.g., Overdue client deliverable"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newLiability.liability_type} onValueChange={(v) => setNewLiability({ ...newLiability, liability_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="burnout_risk">Burnout Risk</SelectItem>
                      <SelectItem value="platform_dependence">Platform Dependence</SelectItem>
                      <SelectItem value="financial_obligation">Financial Obligation</SelectItem>
                      <SelectItem value="time_debt">Time Debt</SelectItem>
                      <SelectItem value="overcommitment">Overcommitment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={newLiability.severity} onValueChange={(v) => setNewLiability({ ...newLiability, severity: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estimated Impact ($)</Label>
                  <Input 
                    type="number"
                    value={newLiability.estimated_impact}
                    onChange={(e) => setNewLiability({ ...newLiability, estimated_impact: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date (optional)</Label>
                  <Input 
                    type="date"
                    value={newLiability.due_date}
                    onChange={(e) => setNewLiability({ ...newLiability, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={newLiability.description}
                    onChange={(e) => setNewLiability({ ...newLiability, description: e.target.value })}
                    placeholder="Details about this liability..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => addLiabilityMutation.mutate(newLiability)}
                  disabled={!newLiability.title || addLiabilityMutation.isPending}
                >
                  {addLiabilityMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Add Liability
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : liabilities?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No active liabilities! Your corporation is running clean.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {liabilities?.map((liability) => {
                const Icon = getLiabilityIcon(liability.liability_type);
                return (
                  <div key={liability.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium">{liability.title}</h4>
                        <Badge variant={getSeverityColor(liability.severity)}>
                          {liability.severity}
                        </Badge>
                        <Badge variant="outline">{liability.liability_type.replace('_', ' ')}</Badge>
                      </div>
                      {liability.description && (
                        <p className="text-sm text-muted-foreground mt-1">{liability.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {liability.estimated_impact > 0 && (
                          <span>Impact: ${liability.estimated_impact.toLocaleString()}</span>
                        )}
                        {liability.due_date && (
                          <span>Due: {new Date(liability.due_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => resolveLiabilityMutation.mutate(liability.id)}
                      disabled={resolveLiabilityMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
