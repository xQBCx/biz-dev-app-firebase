import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Trash2,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  Users,
  TrendingUp,
  Save
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Workflow {
  id: string;
  name: string;
  webhook_url: string;
  is_active: boolean;
  workflow_type: string;
  description?: string;
  config: any;
}

export const LindyAIWorkflows = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    webhook_url: '',
    workflow_type: 'email',
    description: ''
  });
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    if (user) loadWorkflows();
  }, [user]);

  const loadWorkflows = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('crm_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'lindy_ai');

    if (!error && data) {
      setWorkflows(data as any);
    }
  };

  const saveWorkflow = async () => {
    if (!user || !newWorkflow.name || !newWorkflow.webhook_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { error } = await supabase
      .from('crm_integrations')
      .insert({
        user_id: user.id,
        integration_name: newWorkflow.name,
        integration_type: 'lindy_ai',
        webhook_url: newWorkflow.webhook_url,
        is_active: true,
        config: {
          workflow_type: newWorkflow.workflow_type,
          description: newWorkflow.description
        }
      });

    if (error) {
      toast.error('Failed to save workflow');
      console.error(error);
    } else {
      toast.success('Workflow saved successfully');
      setShowNewForm(false);
      setNewWorkflow({ name: '', webhook_url: '', workflow_type: 'email', description: '' });
      loadWorkflows();
    }
  };

  const triggerWorkflow = async (workflow: Workflow) => {
    if (!selectedContacts.length) {
      toast.error('Please select contacts first');
      return;
    }

    try {
      const { data: contacts } = await supabase
        .from('crm_contacts')
        .select('*')
        .in('id', selectedContacts);

      const response = await fetch(workflow.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          workflow_id: workflow.id,
          workflow_name: workflow.name,
          contacts: contacts,
          triggered_by: user?.email,
          timestamp: new Date().toISOString()
        })
      });

      toast.success(`Workflow "${workflow.name}" triggered for ${selectedContacts.length} contacts`);
    } catch (error) {
      console.error('Error triggering workflow:', error);
      toast.error('Failed to trigger workflow');
    }
  };

  const toggleWorkflow = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('crm_integrations')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (!error) {
      toast.success(`Workflow ${!currentState ? 'activated' : 'paused'}`);
      loadWorkflows();
    }
  };

  const deleteWorkflow = async (id: string) => {
    const { error } = await supabase
      .from('crm_integrations')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Workflow deleted');
      loadWorkflows();
    }
  };

  const workflowIcons = {
    email: Mail,
    sms: MessageSquare,
    call: Phone,
    meeting: Calendar,
    nurture: Users,
    followup: TrendingUp
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            AI Workflow Automation
          </h2>
          <p className="text-muted-foreground text-sm">
            Powered by Biz Dev AI Engine
          </p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {showNewForm && (
        <Card className="p-6 shadow-elevated border border-border">
          <h3 className="font-semibold mb-4">Create New Workflow</h3>
          <div className="space-y-4">
            <div>
              <Label>Workflow Name *</Label>
              <Input
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                placeholder="e.g., Welcome Email Sequence"
              />
            </div>

            <div>
              <Label>Workflow Type</Label>
              <select
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                value={newWorkflow.workflow_type}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, workflow_type: e.target.value })}
              >
                <option value="email">Email Campaign</option>
                <option value="sms">SMS Outreach</option>
                <option value="call">Call Sequence</option>
                <option value="meeting">Meeting Scheduler</option>
                <option value="nurture">Lead Nurture</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>

            <div>
              <Label>Webhook URL *</Label>
              <Input
                value={newWorkflow.webhook_url}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, webhook_url: e.target.value })}
                placeholder="https://your-workflow-webhook-url.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Get this from your Lindy.ai workflow settings
              </p>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                placeholder="Describe what this workflow does..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveWorkflow}>
                <Save className="w-4 h-4 mr-2" />
                Save Workflow
              </Button>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow) => {
          const Icon = workflowIcons[workflow.config?.workflow_type as keyof typeof workflowIcons] || Zap;
          
          return (
            <Card key={workflow.id} className="p-6 shadow-elevated border border-border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {workflow.config?.workflow_type}
                    </p>
                  </div>
                </div>
                <Badge variant={workflow.is_active ? "default" : "secondary"}>
                  {workflow.is_active ? 'Active' : 'Paused'}
                </Badge>
              </div>

              {workflow.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {workflow.description}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => triggerWorkflow(workflow)}
                  className="flex-1"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Run
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleWorkflow(workflow.id, workflow.is_active)}
                >
                  {workflow.is_active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteWorkflow(workflow.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {workflows.length === 0 && !showNewForm && (
        <Card className="p-12 text-center shadow-elevated border border-border">
          <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Workflows Yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first AI workflow to automate outreach and engagement
          </p>
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Workflow
          </Button>
        </Card>
      )}
    </div>
  );
};
