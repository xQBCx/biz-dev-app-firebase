import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Check, Webhook, Plus, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LindyIntegration {
  id: string;
  name: string;
  workflow_id: string;
  agent_id: string;
  is_active: boolean;
  webhook_url: string;
  created_at: string;
}

export const LindyIntegration = () => {
  const [integrations, setIntegrations] = useState<LindyIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewIntegration, setShowNewIntegration] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const webhookBaseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lindy-webhook`;

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lindy_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error('Failed to load Lindy integrations');
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase.from('lindy_integrations').insert({
        name: formData.get('name') as string,
        workflow_id: formData.get('workflow_id') as string,
        agent_id: formData.get('agent_id') as string,
        webhook_url: webhookBaseUrl,
        is_active: true,
      });

      if (error) throw error;

      toast.success('Lindy integration created');
      setShowNewIntegration(false);
      loadIntegrations();
    } catch (error: any) {
      console.error('Error creating integration:', error);
      toast.error(error.message || 'Failed to create integration');
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lindy_integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Integration deleted');
      loadIntegrations();
    } catch (error: any) {
      console.error('Error deleting integration:', error);
      toast.error(error.message || 'Failed to delete integration');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Lindy.ai Integrations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connect Lindy.ai workflows to your MCP agents
          </p>
        </div>
        <Dialog open={showNewIntegration} onOpenChange={setShowNewIntegration}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Integration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Lindy Integration</DialogTitle>
            </DialogHeader>
            <form onSubmit={createIntegration} className="space-y-4">
              <div>
                <Label htmlFor="name">Integration Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="e.g., Lead Capture Workflow"
                />
              </div>
              <div>
                <Label htmlFor="workflow_id">Lindy Workflow ID</Label>
                <Input
                  id="workflow_id"
                  name="workflow_id"
                  required
                  placeholder="Your Lindy workflow identifier"
                />
              </div>
              <div>
                <Label htmlFor="agent_id">MCP Agent</Label>
                <Select name="agent_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crm:sync">CRM Sync Agent</SelectItem>
                    <SelectItem value="email:assistant">Email Assistant</SelectItem>
                    <SelectItem value="kb:rag">Knowledge Base Agent</SelectItem>
                    <SelectItem value="general:assistant">General Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Create Integration
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 bg-muted/50">
        <div className="flex items-start gap-3">
          <Webhook className="w-5 h-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Webhook Endpoint</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-background rounded text-sm">{webhookBaseUrl}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(webhookBaseUrl, 'webhook')}
              >
                {copiedId === 'webhook' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use this URL in your Lindy.ai workflows to send events to Biz Dev App
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading integrations...</p>
          </Card>
        ) : integrations.length === 0 ? (
          <Card className="p-12 text-center">
            <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No Lindy integrations yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first integration to connect Lindy.ai workflows
            </p>
          </Card>
        ) : (
          integrations.map((integration) => (
            <Card key={integration.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold">{integration.name}</h3>
                    <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                      {integration.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Workflow ID:</span>
                      <code className="px-2 py-0.5 bg-muted rounded text-xs">
                        {integration.workflow_id}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(integration.workflow_id, integration.id)}
                      >
                        {copiedId === integration.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">MCP Agent:</span>
                      <Badge variant="outline">{integration.agent_id}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      Created {new Date(integration.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('https://lindy.ai', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteIntegration(integration.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          How to Connect Lindy.ai
        </h3>
        <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
          <li>Create a new integration above and copy the webhook URL</li>
          <li>In your Lindy.ai workflow, add a "Webhook" action</li>
          <li>Paste the webhook URL and configure the payload format</li>
          <li>Test the connection by triggering your Lindy workflow</li>
          <li>Check the Workflows page to see the task execution</li>
        </ol>
      </Card>
    </div>
  );
};
