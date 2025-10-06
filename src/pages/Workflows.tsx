import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Workflow, Play, Clock, CheckCircle2, XCircle, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MCPAgent {
  agent_id: string;
  name: string;
  capabilities: string[];
  is_active: boolean;
}

interface MCPTask {
  task_id: string;
  agent_id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  input?: any;
  output?: any;
  created_at: string;
  updated_at: string;
}

const Workflows = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [agents, setAgents] = useState<MCPAgent[]>([]);
  const [tasks, setTasks] = useState<MCPTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [taskInput, setTaskInput] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, loading, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [agentsRes, tasksRes] = await Promise.all([
        supabase.from("mcp_agents").select("agent_id, name, capabilities, is_active").eq("is_active", true),
        supabase.from("mcp_tasks").select("*").eq("created_by", user!.id).order("created_at", { ascending: false }).limit(20),
      ]);

      if (agentsRes.error) throw agentsRes.error;
      if (tasksRes.error) throw tasksRes.error;

      setAgents((agentsRes.data || []) as MCPAgent[]);
      setTasks((tasksRes.data || []) as MCPTask[]);
    } catch (error) {
      console.error("Error loading workflows:", error);
      toast.error("Failed to load workflows");
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async () => {
    if (!selectedAgent || !taskInput.trim()) {
      toast.error("Please select an agent and provide task details");
      return;
    }

    try {
      const { error } = await supabase.from("mcp_tasks").insert({
        agent_id: selectedAgent,
        status: "queued",
        input: { instruction: taskInput, timestamp: new Date().toISOString() },
        created_by: user!.id,
      });

      if (error) throw error;

      toast.success("Task created successfully");
      setShowNewTask(false);
      setTaskInput("");
      setSelectedAgent("");
      loadData();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.message || "Failed to create task");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'queued':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-depth">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Workflow className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Workflows & Automation</h1>
              <p className="text-muted-foreground">Create and manage automated tasks</p>
            </div>
          </div>
          <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Automation Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agent">Select Agent</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.agent_id} value={agent.agent_id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedAgent && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Agent capabilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {agents.find(a => a.agent_id === selectedAgent)?.capabilities.map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-xs">{cap}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="taskInput">Task Instructions</Label>
                  <Textarea
                    id="taskInput"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Describe what you want this agent to do..."
                    rows={4}
                  />
                </div>
                <Button onClick={createTask} className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Available Agents Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Available Agents</h2>
          {isLoading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading agents...</p>
            </Card>
          ) : agents.length === 0 ? (
            <Card className="p-12 text-center">
              <Workflow className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No agents available yet</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <Card key={agent.agent_id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Workflow className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-xs text-muted-foreground">{agent.agent_id}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">{cap}</Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tasks History Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
          {isLoading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Loading tasks...</p>
            </Card>
          ) : tasks.length === 0 ? (
            <Card className="p-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No tasks yet</p>
              <p className="text-sm text-muted-foreground">Create your first automation task to get started</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.task_id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{agents.find(a => a.agent_id === task.agent_id)?.name || task.agent_id}</p>
                          <Badge variant={getStatusColor(task.status)} className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                        {task.input?.instruction && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.input.instruction}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(task.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workflows;
