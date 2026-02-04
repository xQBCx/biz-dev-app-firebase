import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Bot, Plus, Loader2, Copy, Check, Trash2, ExternalLink, Zap } from "lucide-react";

interface AgentRegistrationPanelProps {
  dealRoomId: string;
  isAdmin: boolean;
}

interface RegisteredAgent {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
  capabilities?: unknown[];
  config_schema?: Record<string, unknown>;
}

const platformOptions = [
  { value: "lindy_ai", label: "Lindy.ai", description: "AI workflow automation" },
  { value: "airia", label: "Airia", description: "Enterprise AI orchestration" },
  { value: "zapier", label: "Zapier", description: "No-code automation" },
  { value: "make", label: "Make (Integromat)", description: "Visual automation" },
  { value: "n8n", label: "n8n", description: "Open-source workflow" },
  { value: "custom", label: "Custom", description: "Custom integration" },
];

const agentCategories = [
  { value: "signal_detection", label: "Signal Detection", icon: "📡" },
  { value: "enrichment", label: "Data Enrichment", icon: "📊" },
  { value: "outreach", label: "Outreach & Sequencing", icon: "📧" },
  { value: "scheduling", label: "Scheduling & Follow-up", icon: "📅" },
  { value: "intelligence", label: "Intelligence & Briefing", icon: "🧠" },
  { value: "other", label: "Other", icon: "⚡" },
];

export const AgentRegistrationPanel = ({
  dealRoomId,
  isAdmin,
}: AgentRegistrationPanelProps) => {
  const [agents, setAgents] = useState<RegisteredAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    category: "signal_detection",
    external_platform: "lindy_ai",
  });

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("instincts_agents")
        .select("id, slug, name, description, category, is_active, created_at, capabilities, config_schema")
        .eq("is_partner_agent", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error fetching agents:", error);
        setAgents([]);
      } else {
        setAgents(data || []);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
    }
  }, [dealRoomId]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'bdv_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setSaving(true);
    try {
      const apiKey = generateApiKey();
      
      const { error } = await supabase.from("instincts_agents").insert({
        name: formData.name,
        slug: `partner_${formData.slug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        description: formData.description || null,
        category: formData.category,
        is_active: true,
        is_partner_agent: true,
        capabilities: [formData.external_platform],
        config_schema: {
          platform: formData.external_platform,
          deal_room_id: dealRoomId,
          api_key: apiKey,
        },
      });

      if (error) throw error;

      toast.success("Agent registered successfully");
      setDialogOpen(false);
      setFormData({
        name: "",
        slug: "",
        description: "",
        category: "signal_detection",
        external_platform: "lindy_ai",
      });
      fetchAgents();
    } catch (error: any) {
      toast.error(error.message || "Failed to register agent");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from("instincts_agents")
        .delete()
        .eq("id", agentId);

      if (error) throw error;
      toast.success("Agent removed");
      fetchAgents();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove agent");
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard");
  };

  const getWebhookUrl = () => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'eoskcsbytaurtqrnuraw';
    return `https://${projectId}.supabase.co/functions/v1/log-external-agent-activity`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Partner Agents
          </h3>
          <p className="text-sm text-muted-foreground">
            Register external agents that will log activity to this deal room
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Register Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Register Partner Agent
                </DialogTitle>
                <DialogDescription>
                  Register an external agent (Lindy.ai, Airia, etc.) to log activities to this deal room
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agent Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Signal Scout"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      placeholder="e.g., signal_scout"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What does this agent do?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select
                    value={formData.external_platform}
                    onValueChange={(v) => setFormData({ ...formData, external_platform: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <div>
                            <p className="font-medium">{platform.label}</p>
                            <p className="text-xs text-muted-foreground">{platform.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {agentCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Register Agent
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Webhook URL Card */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium">Webhook Endpoint</span>
            </div>
            <code className="text-xs bg-background px-2 py-1 rounded block truncate">
              {getWebhookUrl()}
            </code>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(getWebhookUrl(), 'webhook')}
          >
            {copiedId === 'webhook' ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Card>

      {/* Agents List */}
      {agents.length === 0 ? (
        <Card className="p-8 text-center">
          <Bot className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Agents Registered</h3>
          <p className="text-muted-foreground mb-4">
            Register external agents to start logging activities to this deal room
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => {
            const category = agentCategories.find(c => c.value === agent.category);
            const configSchema = agent.config_schema as Record<string, unknown> | undefined;
            const platformValue = configSchema?.platform as string;
            const platform = platformOptions.find(p => p.value === platformValue);
            const apiKey = configSchema?.api_key as string | undefined;
            
            return (
              <Card key={agent.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                      {category?.icon || "⚡"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium">{agent.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {platform?.label || platformValue || "Custom"}
                        </Badge>
                        {agent.is_active ? (
                          <Badge className="bg-emerald-500/20 text-emerald-600 text-xs">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {agent.description || `Slug: ${agent.slug}`}
                      </p>
                      {apiKey && (
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {apiKey.substring(0, 12)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(apiKey, agent.id)}
                          >
                            {copiedId === agent.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={`/instincts/agents/${agent.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(agent.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
