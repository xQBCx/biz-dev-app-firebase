import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Plus, FileText, Scale, Copyright, AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";

type IPProject = {
  id: string;
  type: "patent" | "trademark" | "copyright";
  title: string;
  description: string | null;
  status: string;
  priority: string;
  filing_date: string | null;
  grant_date: string | null;
  registration_number: string | null;
  jurisdiction: string | null;
  created_at: string;
};

type IPTask = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
};

const typeIcons = {
  patent: FileText,
  trademark: Scale,
  copyright: Copyright,
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/20 text-blue-400",
  filed: "bg-yellow-500/20 text-yellow-400",
  granted: "bg-green-500/20 text-green-400",
  registered: "bg-green-500/20 text-green-400",
  rejected: "bg-destructive/20 text-destructive",
  abandoned: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  low: "border-muted-foreground/30",
  medium: "border-blue-500/50",
  high: "border-yellow-500/50",
  critical: "border-destructive/50",
};

export default function IPProjectManager() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<{
    type: "patent" | "trademark" | "copyright";
    title: string;
    description: string;
    priority: string;
  }>({
    type: "patent",
    title: "",
    description: "",
    priority: "medium",
  });
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["ip-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_projects")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as IPProject[];
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ["ip-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ip_tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as IPTask[];
    },
  });

  const addProjectMutation = useMutation({
    mutationFn: async (project: typeof newProject) => {
      const { error } = await supabase.from("ip_projects").insert(project);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-projects"] });
      toast.success("IP project created");
      setIsAddDialogOpen(false);
      setNewProject({ type: "patent", title: "", description: "", priority: "medium" });
    },
    onError: (error) => toast.error(error.message),
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("ip_projects").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-projects"] });
      toast.success("Project status updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const addTaskMutation = useMutation({
    mutationFn: async (task: typeof newTask & { project_id: string }) => {
      const { error } = await supabase.from("ip_tasks").insert(task);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-tasks"] });
      toast.success("Task added");
      setIsTaskDialogOpen(false);
      setNewTask({ title: "", description: "", priority: "medium" });
    },
    onError: (error) => toast.error(error.message),
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("ip_tasks")
        .update({ 
          status, 
          completed_at: status === "done" ? new Date().toISOString() : null 
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ip-tasks"] });
      toast.success("Task updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const filteredProjects = projects?.filter(
    (p) => selectedType === "all" || p.type === selectedType
  );

  const getTasksForProject = (projectId: string) =>
    tasks?.filter((t) => t.project_id === projectId) || [];

  const getProjectStats = () => {
    if (!projects) return { patents: 0, trademarks: 0, copyrights: 0, total: 0 };
    return {
      patents: projects.filter((p) => p.type === "patent").length,
      trademarks: projects.filter((p) => p.type === "trademark").length,
      copyrights: projects.filter((p) => p.type === "copyright").length,
      total: projects.length,
    };
  };

  const stats = getProjectStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.patents}</div>
            <p className="text-sm text-muted-foreground">Patents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.trademarks}</div>
            <p className="text-sm text-muted-foreground">Trademarks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.copyrights}</div>
            <p className="text-sm text-muted-foreground">Copyrights</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="patent">Patents</SelectItem>
            <SelectItem value="trademark">Trademarks</SelectItem>
            <SelectItem value="copyright">Copyrights</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add IP Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add IP Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={newProject.type}
                onValueChange={(v) => setNewProject({ ...newProject, type: v as "patent" | "trademark" | "copyright" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patent">Patent</SelectItem>
                  <SelectItem value="trademark">Trademark</SelectItem>
                  <SelectItem value="copyright">Copyright</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
              <Select
                value={newProject.priority}
                onValueChange={(v) => setNewProject({ ...newProject, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => addProjectMutation.mutate(newProject)}
                disabled={!newProject.title || addProjectMutation.isPending}
                className="w-full"
              >
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List */}
      <Accordion type="multiple" className="space-y-4">
        {filteredProjects?.map((project) => {
          const Icon = typeIcons[project.type];
          const projectTasks = getTasksForProject(project.id);
          const completedTasks = projectTasks.filter((t) => t.status === "done").length;

          return (
            <AccordionItem
              key={project.id}
              value={project.id}
              className={`border-l-4 ${priorityColors[project.priority]} rounded-lg overflow-hidden`}
            >
              <Card className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-4 flex-1">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                    <Badge className={statusColors[project.status]}>{project.status}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {completedTasks}/{projectTasks.length} tasks
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    {/* Status Update */}
                    <div className="flex gap-2 flex-wrap">
                      {["draft", "in_progress", "filed", project.type === "trademark" ? "registered" : "granted"].map(
                        (status) => (
                          <Button
                            key={status}
                            variant={project.status === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateProjectMutation.mutate({ id: project.id, status })}
                          >
                            {status.replace("_", " ")}
                          </Button>
                        )
                      )}
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Tasks</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedProjectId(project.id);
                            setIsTaskDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Task
                        </Button>
                      </div>
                      {projectTasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tasks yet</p>
                      ) : (
                        <div className="space-y-2">
                          {projectTasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  updateTaskMutation.mutate({
                                    id: task.id,
                                    status: task.status === "done" ? "todo" : "done",
                                  })
                                }
                              >
                                {task.status === "done" ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                              <span
                                className={
                                  task.status === "done"
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }
                              >
                                {task.title}
                              </span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                {task.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <Select
              value={newTask.priority}
              onValueChange={(v) => setNewTask({ ...newTask, priority: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() =>
                selectedProjectId &&
                addTaskMutation.mutate({ ...newTask, project_id: selectedProjectId })
              }
              disabled={!newTask.title || addTaskMutation.isPending}
              className="w-full"
            >
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
