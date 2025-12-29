import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWorkflows, WorkflowTemplate, Workflow } from "@/hooks/useWorkflows";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WhitePaperIcon } from "@/components/whitepaper/WhitePaperIcon";
import { 
  Workflow as WorkflowIcon, Play, Pause, Plus, Search, Clock, CheckCircle2, 
  XCircle, Loader2, Sparkles, Star, TrendingUp, Users, Mail, Brain, 
  Settings, BarChart, Building, Shield, Target, Zap, GitBranch, Filter, Wand2,
  Upload, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIWorkflowGenerator } from "@/components/workflows/AIWorkflowGenerator";
import { FunnelIntakePanel } from "@/components/workflows/FunnelIntakePanel";
import { WorkflowAnalytics } from "@/components/workflows/WorkflowAnalytics";
import { toast } from "sonner";

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  sales: { label: 'Sales & CRM', icon: TrendingUp, color: 'text-blue-500' },
  marketing: { label: 'Marketing', icon: Mail, color: 'text-purple-500' },
  ai: { label: 'AI & Content', icon: Brain, color: 'text-pink-500' },
  operations: { label: 'Operations', icon: Settings, color: 'text-orange-500' },
  erp: { label: 'ERP & Audit', icon: Building, color: 'text-emerald-500' },
};

const complexityConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'bg-green-500/10 text-green-500' },
  intermediate: { label: 'Intermediate', color: 'bg-yellow-500/10 text-yellow-500' },
  advanced: { label: 'Advanced', color: 'bg-red-500/10 text-red-500' },
};

const Workflows = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const {
    templates,
    workflows,
    recentRuns,
    isLoading,
    createFromTemplate,
    createWorkflow,
    toggleWorkflow,
    deleteWorkflow,
    runWorkflow,
    isCreating,
    isRunning,
    getFeaturedTemplates,
  } = useWorkflows();

  const [activeTab, setActiveTab] = useState("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showFunnelIntake, setShowFunnelIntake] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowCategory, setNewWorkflowCategory] = useState("sales");
  const [newWorkflowDescription, setNewWorkflowDescription] = useState("");

  if (loading) return null;
  if (!user) {
    navigate("/auth");
    return null;
  }

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredTemplates = getFeaturedTemplates().slice(0, 4);

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) return;
    await createWorkflow({
      name: newWorkflowName,
      category: newWorkflowCategory,
      description: newWorkflowDescription,
    });
    setShowNewWorkflow(false);
    setNewWorkflowName("");
    setNewWorkflowDescription("");
    setActiveTab("my-workflows");
  };

  const handleAIGenerated = async (workflow: any) => {
    try {
      await createWorkflow({
        name: workflow.name,
        category: workflow.category,
        description: workflow.description,
      });
      // TODO: Update the created workflow with nodes from AI
      setShowAIGenerator(false);
      setActiveTab("my-workflows");
      toast.success("AI-generated workflow created!");
    } catch (err) {
      toast.error("Failed to create workflow");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center">
              <WorkflowIcon className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Workflow Automation</h1>
              <p className="text-muted-foreground">Build, customize, and run native workflows</p>
            </div>
            <WhitePaperIcon moduleKey="workflows" moduleName="Workflow Automation" variant="button" />
          </div>
          <div className="flex gap-2">
          <Dialog open={showFunnelIntake} onOpenChange={setShowFunnelIntake}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Funnel Intake
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Funnel Intake
                </DialogTitle>
              </DialogHeader>
              <FunnelIntakePanel
                onFunnelCreated={() => {
                  setShowFunnelIntake(false);
                  setActiveTab("my-workflows");
                  toast.success("Funnel workflow created!");
                }}
                onClose={() => setShowFunnelIntake(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wand2 className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Workflow Generator
                </DialogTitle>
              </DialogHeader>
              <AIWorkflowGenerator
                onGenerated={handleAIGenerated}
                onClose={() => setShowAIGenerator(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={showNewWorkflow} onOpenChange={setShowNewWorkflow}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Workflow Name</Label>
                  <Input
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    placeholder="My Custom Workflow"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={newWorkflowCategory} onValueChange={setNewWorkflowCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className={cn("w-4 h-4", config.color)} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={newWorkflowDescription}
                    onChange={(e) => setNewWorkflowDescription(e.target.value)}
                    placeholder="What does this workflow do?"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewWorkflow(false)}>Cancel</Button>
                <Button onClick={handleCreateWorkflow} disabled={!newWorkflowName.trim() || isCreating}>
                  {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="templates" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="my-workflows" className="gap-2">
              <WorkflowIcon className="w-4 h-4" />
              My Workflows
              {workflows.length > 0 && (
                <Badge variant="secondary" className="ml-1">{workflows.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="w-4 h-4" />
              Run History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Featured Templates */}
            {featuredTemplates.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Featured Templates
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {featuredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onUse={() => {
                        createFromTemplate(template.id);
                        setActiveTab("my-workflows");
                      }}
                      isCreating={isCreating}
                      featured
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className="gap-1"
                  >
                    <config.icon className={cn("w-4 h-4", selectedCategory !== key && config.color)} />
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Template Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <Card className="p-12 text-center">
                <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No templates match your criteria</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => {
                      createFromTemplate(template.id);
                      setActiveTab("my-workflows");
                    }}
                    isCreating={isCreating}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Workflows Tab */}
          <TabsContent value="my-workflows" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : workflows.length === 0 ? (
              <Card className="p-12 text-center">
                <WorkflowIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first workflow from a template or build one from scratch
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setActiveTab("templates")}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Browse Templates
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewWorkflow(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Blank
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onToggle={(active) => toggleWorkflow({ id: workflow.id, is_active: active })}
                    onRun={() => runWorkflow(workflow.id)}
                    onDelete={() => deleteWorkflow(workflow.id)}
                    isRunning={isRunning}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : recentRuns.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No run history</h3>
                <p className="text-muted-foreground">
                  Run a workflow to see execution history here
                </p>
              </Card>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {recentRuns.map((run) => {
                    const workflow = workflows.find(w => w.id === run.workflow_id);
                    return (
                      <Card key={run.id} className="p-4">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(run.status)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{workflow?.name || 'Unknown Workflow'}</p>
                            <p className="text-sm text-muted-foreground">
                              {run.trigger_type} trigger • {new Date(run.started_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={run.status === 'completed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>
                              {run.status}
                            </Badge>
                            {run.duration_ms && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {(run.duration_ms / 1000).toFixed(2)}s
                              </p>
                            )}
                          </div>
                        </div>
                        {run.error_message && (
                          <p className="text-sm text-red-500 mt-2 bg-red-500/10 rounded p-2">
                            {run.error_message}
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <WorkflowAnalytics workflows={workflows} recentRuns={recentRuns} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Template Card Component
function TemplateCard({
  template,
  onUse,
  isCreating,
  featured = false,
}: {
  template: WorkflowTemplate;
  onUse: () => void;
  isCreating: boolean;
  featured?: boolean;
}) {
  const config = categoryConfig[template.category] || { label: template.category, icon: WorkflowIcon, color: 'text-muted-foreground' };
  const complexity = complexityConfig[template.complexity] || complexityConfig.beginner;

  return (
    <Card className={cn(
      "group hover:shadow-lg transition-all duration-200",
      featured && "border-primary/50 bg-gradient-to-br from-primary/5 to-transparent"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <config.icon className={cn("w-5 h-5", config.color)} />
            <Badge variant="outline" className="text-xs">{config.label}</Badge>
          </div>
          <Badge className={cn("text-xs", complexity.color)}>{complexity.label}</Badge>
        </div>
        <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">+{template.tags.length - 3}</Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {template.estimated_time_saved_hours && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{template.estimated_time_saved_hours}h saved
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {template.use_count}
            </span>
          </div>
          <Button size="sm" onClick={onUse} disabled={isCreating}>
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span className="ml-1">Use</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Workflow Card Component
function WorkflowCard({
  workflow,
  onToggle,
  onRun,
  onDelete,
  isRunning,
}: {
  workflow: Workflow;
  onToggle: (active: boolean) => void;
  onRun: () => void;
  onDelete: () => void;
  isRunning: boolean;
}) {
  const config = categoryConfig[workflow.category] || { label: workflow.category, icon: WorkflowIcon, color: 'text-muted-foreground' };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          workflow.is_active ? "bg-green-500/10" : "bg-muted"
        )}>
          <config.icon className={cn("w-5 h-5", workflow.is_active ? "text-green-500" : "text-muted-foreground")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{workflow.name}</h3>
            {workflow.is_draft && (
              <Badge variant="outline" className="text-xs">Draft</Badge>
            )}
            <Badge variant={workflow.is_active ? "default" : "secondary"} className="text-xs">
              {workflow.is_active ? "Active" : "Paused"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {workflow.description || "No description"}
          </p>
          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <span>{workflow.run_count} runs</span>
            <span>{workflow.success_count} successful</span>
            {workflow.last_run_at && (
              <span>Last run: {new Date(workflow.last_run_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(!workflow.is_active)}
          >
            {workflow.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            onClick={onRun}
            disabled={isRunning}
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default Workflows;
