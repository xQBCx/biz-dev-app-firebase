import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Bot, Wrench, ListChecks, Shield, Plus, Activity } from "lucide-react";
import { toast } from "sonner";

interface MCPAgent {
  agent_id: string;
  name: string;
  capabilities: string[];
  allowed_tools: string[];
  policy: any;
  is_active: boolean;
  created_at: string;
}

interface MCPTool {
  tool_id: string;
  name: string;
  version?: string;
  description?: string;
  auth_type?: string;
  is_active: boolean;
  created_at: string;
}

interface MCPTask {
  task_id: string;
  agent_id: string;
  tool_id?: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  input?: any;
  output?: any;
  created_by: string;
  created_at: string;
}

const MCPAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [agents, setAgents] = useState<MCPAgent[]>([]);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [tasks, setTasks] = useState<MCPTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [showNewTool, setShowNewTool] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    checkAdminStatus();
  }, [user, navigate]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (error) throw error;

      if (!data) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      loadData();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/dashboard");
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [agentsRes, toolsRes, tasksRes] = await Promise.all([
        supabase.from("mcp_agents").select("*").order("created_at", { ascending: false }),
        supabase.from("mcp_tools").select("*").order("created_at", { ascending: false }),
        supabase.from("mcp_tasks").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      if (agentsRes.error) throw agentsRes.error;
      if (toolsRes.error) throw toolsRes.error;
      if (tasksRes.error) throw tasksRes.error;

      setAgents((agentsRes.data || []) as MCPAgent[]);
      setTools((toolsRes.data || []) as MCPTool[]);
      setTasks((tasksRes.data || []) as MCPTask[]);
    } catch (error) {
      console.error("Error loading MCP data:", error);
      toast.error("Failed to load MCP data");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("mcp_agents")
        .update({ is_active: !currentStatus })
        .eq("agent_id", agentId);

      if (error) throw error;
      toast.success(`Agent ${!currentStatus ? "activated" : "deactivated"}`);
      loadData();
    } catch (error) {
      console.error("Error toggling agent:", error);
      toast.error("Failed to update agent");
    }
  };

  const toggleToolStatus = async (toolId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("mcp_tools")
        .update({ is_active: !currentStatus })
        .eq("tool_id", toolId);

      if (error) throw error;
      toast.success(`Tool ${!currentStatus ? "activated" : "deactivated"}`);
      loadData();
    } catch (error) {
      console.error("Error toggling tool:", error);
      toast.error("Failed to update tool");
    }
  };

  const createAgent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from("mcp_agents").insert({
        agent_id: formData.get("agent_id") as string,
        name: formData.get("name") as string,
        capabilities: (formData.get("capabilities") as string).split(",").map(c => c.trim()),
        allowed_tools: (formData.get("allowed_tools") as string).split(",").map(t => t.trim()).filter(Boolean),
        policy: {},
        is_active: true,
      });

      if (error) throw error;
      toast.success("Agent created successfully");
      setShowNewAgent(false);
      loadData();
    } catch (error: any) {
      console.error("Error creating agent:", error);
      toast.error(error.message || "Failed to create agent");
    }
  };

  const createTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase.from("mcp_tools").insert({
        tool_id: formData.get("tool_id") as string,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        auth_type: formData.get("auth_type") as string,
        is_active: true,
      });

      if (error) throw error;
      toast.success("Tool created successfully");
      setShowNewTool(false);
      loadData();
    } catch (error: any) {
      console.error("Error creating tool:", error);
      toast.error(error.message || "Failed to create tool");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-depth">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">MCP Admin</h1>
            <p className="text-muted-foreground">Manage agents, tools, and automation workflows</p>
          </div>
        </div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="agents" className="gap-2">
              <Bot className="w-4 h-4" />
              Agents ({agents.length})
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Wrench className="w-4 h-4" />
              Tools ({tools.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <ListChecks className="w-4 h-4" />
              Tasks ({tasks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Agents are AI workers that can execute tasks using registered tools
              </p>
              <Dialog open={showNewAgent} onOpenChange={setShowNewAgent}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Agent
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Agent</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={createAgent} className="space-y-4">
                    <div>
                      <Label htmlFor="agent_id">Agent ID</Label>
                      <Input id="agent_id" name="agent_id" required placeholder="e.g., email:assistant" />
                    </div>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" required placeholder="e.g., Email Assistant" />
                    </div>
                    <div>
                      <Label htmlFor="capabilities">Capabilities (comma-separated)</Label>
                      <Input id="capabilities" name="capabilities" required placeholder="e.g., send, schedule, analyze" />
                    </div>
                    <div>
                      <Label htmlFor="allowed_tools">Allowed Tools (comma-separated, optional)</Label>
                      <Input id="allowed_tools" name="allowed_tools" placeholder="e.g., kb:rag, crm:import" />
                    </div>
                    <Button type="submit" className="w-full">Create Agent</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading agents...</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {agents.map((agent) => (
                  <Card key={agent.agent_id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Bot className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">{agent.agent_id}</p>
                        </div>
                      </div>
                      <Switch
                        checked={agent.is_active}
                        onCheckedChange={() => toggleAgentStatus(agent.agent_id, agent.is_active)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Capabilities</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.map((cap) => (
                            <Badge key={cap} variant="secondary" className="text-xs">{cap}</Badge>
                          ))}
                        </div>
                      </div>
                      {agent.allowed_tools.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Allowed Tools</p>
                          <div className="flex flex-wrap gap-1">
                            {agent.allowed_tools.map((tool) => (
                              <Badge key={tool} variant="outline" className="text-xs">{tool}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Tools are capabilities that agents can use to perform actions
              </p>
              <Dialog open={showNewTool} onOpenChange={setShowNewTool}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Tool
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Tool</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={createTool} className="space-y-4">
                    <div>
                      <Label htmlFor="tool_id">Tool ID</Label>
                      <Input id="tool_id" name="tool_id" required placeholder="e.g., email:sender" />
                    </div>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" required placeholder="e.g., Email Sender" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" placeholder="Describe what this tool does..." />
                    </div>
                    <div>
                      <Label htmlFor="auth_type">Auth Type</Label>
                      <Input id="auth_type" name="auth_type" placeholder="e.g., internal, oauth2, apiKey" />
                    </div>
                    <Button type="submit" className="w-full">Create Tool</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading tools...</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {tools.map((tool) => (
                  <Card key={tool.tool_id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Wrench className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{tool.name}</h3>
                          <p className="text-sm text-muted-foreground">{tool.tool_id}</p>
                        </div>
                      </div>
                      <Switch
                        checked={tool.is_active}
                        onCheckedChange={() => toggleToolStatus(tool.tool_id, tool.is_active)}
                      />
                    </div>
                    {tool.description && (
                      <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {tool.auth_type && (
                        <Badge variant="outline">{tool.auth_type}</Badge>
                      )}
                      {tool.version && (
                        <span>v{tool.version}</span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View and monitor task execution history across all agents
            </p>

            {isLoading ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Loading tasks...</p>
              </Card>
            ) : tasks.length === 0 ? (
              <Card className="p-12 text-center">
                <ListChecks className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tasks yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Card key={task.task_id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                        <div>
                          <p className="font-medium">{task.agent_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {task.tool_id || "No tool"}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.created_at).toLocaleString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MCPAdmin;
