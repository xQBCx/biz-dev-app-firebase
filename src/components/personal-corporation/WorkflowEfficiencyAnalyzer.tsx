import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Workflow, TrendingUp, Clock, DollarSign, Plus, Loader2, Play, Pause } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PersonalWorkflow {
  id: string;
  workflow_type: string;
  name: string;
  description: string;
  time_invested_weekly: number;
  value_generated_weekly: number;
  efficiency_score: number;
  is_active: boolean;
  execution_count: number;
  last_executed_at: string | null;
}

export const WorkflowEfficiencyAnalyzer = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    workflow_type: 'income_generation',
    time_invested_weekly: 0,
    value_generated_weekly: 0
  });

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['personal-workflows', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('personal_workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('efficiency_score', { ascending: false });
      
      if (error) throw error;
      return data as PersonalWorkflow[];
    },
    enabled: !!user?.id
  });

  const addWorkflowMutation = useMutation({
    mutationFn: async (workflow: typeof newWorkflow) => {
      if (!user?.id) throw new Error("Not authenticated");
      const efficiencyScore = workflow.time_invested_weekly > 0 
        ? workflow.value_generated_weekly / workflow.time_invested_weekly 
        : 0;
      
      const { error } = await supabase
        .from('personal_workflows')
        .insert({
          user_id: user.id,
          ...workflow,
          efficiency_score: efficiencyScore
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-workflows'] });
      setDialogOpen(false);
      setNewWorkflow({ name: '', description: '', workflow_type: 'income_generation', time_invested_weekly: 0, value_generated_weekly: 0 });
      toast.success("Workflow added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add workflow: " + error.message);
    }
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('personal_workflows')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-workflows'] });
      toast.success("Workflow status updated");
    }
  });

  const getWorkflowTypeColor = (type: string) => {
    switch (type) {
      case 'income_generation': return 'bg-green-500/10 text-green-700';
      case 'growth_learning': return 'bg-blue-500/10 text-blue-700';
      case 'recovery_sustainability': return 'bg-purple-500/10 text-purple-700';
      case 'relationship_maintenance': return 'bg-orange-500/10 text-orange-700';
      default: return 'bg-muted';
    }
  };

  const totalTimeInvested = workflows?.reduce((sum, w) => sum + w.time_invested_weekly, 0) || 0;
  const totalValueGenerated = workflows?.reduce((sum, w) => sum + w.value_generated_weekly, 0) || 0;
  const avgEfficiency = workflows?.length ? totalValueGenerated / Math.max(totalTimeInvested, 1) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows?.filter(w => w.is_active).length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Weekly Time Invested</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTimeInvested.toFixed(1)} hrs</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Weekly Value Generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalValueGenerated.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Efficiency ($/hr)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${avgEfficiency.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Value-Creation Workflows</CardTitle>
            <CardDescription>How your assets convert to value</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Workflow</DialogTitle>
                <DialogDescription>Define a value-creation pattern</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                    placeholder="e.g., Client Outreach Pipeline"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newWorkflow.workflow_type} onValueChange={(v) => setNewWorkflow({ ...newWorkflow, workflow_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income_generation">Income Generation</SelectItem>
                      <SelectItem value="growth_learning">Growth & Learning</SelectItem>
                      <SelectItem value="recovery_sustainability">Recovery & Sustainability</SelectItem>
                      <SelectItem value="relationship_maintenance">Relationship Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time Invested (hrs/week)</Label>
                    <Input 
                      type="number"
                      step="0.5"
                      value={newWorkflow.time_invested_weekly}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, time_invested_weekly: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Value Generated ($/week)</Label>
                    <Input 
                      type="number"
                      value={newWorkflow.value_generated_weekly}
                      onChange={(e) => setNewWorkflow({ ...newWorkflow, value_generated_weekly: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                    placeholder="Describe this workflow..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => addWorkflowMutation.mutate(newWorkflow)}
                  disabled={!newWorkflow.name || addWorkflowMutation.isPending}
                >
                  {addWorkflowMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Add Workflow
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
          ) : workflows?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Workflow className="h-12 w-12 mx-auto mb-2" />
              <p>No workflows defined yet. Add your first value-creation workflow!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows?.map((workflow) => {
                const efficiency = workflow.time_invested_weekly > 0 
                  ? workflow.value_generated_weekly / workflow.time_invested_weekly 
                  : 0;
                const maxEfficiency = Math.max(...(workflows?.map(w => w.efficiency_score) || [1]));
                
                return (
                  <div key={workflow.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Workflow className={`h-5 w-5 ${workflow.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {workflow.name}
                            {!workflow.is_active && <Badge variant="secondary">Paused</Badge>}
                          </h4>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWorkflowMutation.mutate({ id: workflow.id, is_active: !workflow.is_active })}
                      >
                        {workflow.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={getWorkflowTypeColor(workflow.workflow_type)}>
                        {workflow.workflow_type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workflow.time_invested_weekly} hrs/wk
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${workflow.value_generated_weekly}/wk
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        ${efficiency.toFixed(2)}/hr
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Efficiency Score</span>
                        <span>{((workflow.efficiency_score / maxEfficiency) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(workflow.efficiency_score / maxEfficiency) * 100} className="h-2" />
                    </div>

                    {workflow.execution_count > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Executed {workflow.execution_count} times
                        {workflow.last_executed_at && ` • Last: ${new Date(workflow.last_executed_at).toLocaleDateString()}`}
                      </p>
                    )}
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
