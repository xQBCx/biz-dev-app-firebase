import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";
import { useActiveClient } from "@/hooks/useActiveClient";
import { useInstincts } from "@/hooks/useInstincts";
import { useContributionEvents, TaskContributorType, TaskValueCategory } from "@/hooks/useContributionEvents";
import { LoaderFullScreen, Loader } from "@/components/ui/loader";
import { supabase } from "@/integrations/supabase/client";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Plus, CheckCircle2, Clock, AlertCircle, Calendar as CalendarIcon, Filter, Bot, User, Zap } from "lucide-react";
import { PrintTasksDialog } from "@/components/PrintTasksDialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  subject: string;
  description: string | null;
  activity_type: string;
  status: string;
  priority: string;
  due_date: string | null;
  contact_id: string | null;
  company_id: string | null;
  deal_id: string | null;
  created_at: string;
  updated_at: string;
  outcome: string | null;
  tags: string[] | null;
  // New contribution fields
  task_type: TaskContributorType | null;
  value_category: TaskValueCategory | null;
  linked_opportunity_id: string | null;
  estimated_value_weight: number | null;
}

export default function Tasks() {
  const { user } = useAuth();
  const { id: effectiveUserId, isImpersonating } = useEffectiveUser();
  const { activeClientId } = useActiveClient();
  const { trackEntityCreated, trackEntityUpdated, trackClick } = useInstincts();
  const { trackTaskCreated, trackTaskCompleted } = useContributionEvents();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  
  // New task form state with contribution fields
  const [newTask, setNewTask] = useState({
    subject: "",
    description: "",
    activity_type: "task",
    status: "pending",
    priority: "medium",
    due_date: null as Date | null,
    task_type: "human" as TaskContributorType,
    value_category: "" as TaskValueCategory | "",
    linked_opportunity_id: "",
  });

  const fetchTasks = async () => {
    if (!effectiveUserId) return;

    try {
      // Use effectiveUserId for impersonation support
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [effectiveUserId]);

  const createTask = async () => {
    if (!user || !newTask.subject) return;

    setIsCreating(true);
    try {
      const { data, error } = await supabase.from('crm_activities').insert({
        user_id: user.id,
        client_id: activeClientId || null,
        subject: newTask.subject,
        description: newTask.description || null,
        activity_type: newTask.activity_type,
        status: newTask.status,
        priority: newTask.priority,
        due_date: newTask.due_date?.toISOString() || null,
        task_type: newTask.task_type,
        value_category: newTask.value_category || null,
        linked_opportunity_id: newTask.linked_opportunity_id || null,
      } as any).select();

      if (error) throw error;

      const taskId = data?.[0]?.id || '';
      
      // Track task creation in Instincts
      trackEntityCreated('tasks', taskId, newTask.subject, undefined);
      
      // Emit contribution event
      trackTaskCreated(
        taskId, 
        newTask.subject, 
        newTask.value_category || undefined,
        newTask.linked_opportunity_id || undefined
      );

      toast.success("Task created successfully!");
      setNewTask({
        subject: "",
        description: "",
        activity_type: "task",
        status: "pending",
        priority: "medium",
        due_date: null,
        task_type: "human",
        value_category: "",
        linked_opportunity_id: "",
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Failed to create task");
    } finally {
      setIsCreating(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const task = tasks.find(t => t.id === taskId);
    try {
      const { error } = await supabase
        .from('crm_activities')
        .update({ 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null 
        })
        .eq('id', taskId);

      if (error) throw error;

      // Track task status update in Instincts  
      trackEntityUpdated('tasks', taskId, task?.subject || '', undefined);
      
      // Emit contribution event for task completion
      if (status === 'completed' && task) {
        trackTaskCompleted(
          taskId, 
          task.subject,
          task.value_category || undefined,
          task.linked_opportunity_id || undefined
        );
      }

      toast.success("Task updated!");
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Failed to update task");
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleTaskDetailClose = () => {
    setShowTaskDetail(false);
    setSelectedTask(null);
    fetchTasks();
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return <LoaderFullScreen />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            Manage all your tasks, activities, and to-dos in one place
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Title *</Label>
                <Input
                  id="subject"
                  value={newTask.subject}
                  onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Add task details..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contribution Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task_type">Contributor Type</Label>
                  <Select value={newTask.task_type} onValueChange={(value: TaskContributorType) => setNewTask({ ...newTask, task_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="human">
                        <span className="flex items-center gap-2"><User className="h-3 w-3" /> Human</span>
                      </SelectItem>
                      <SelectItem value="agent">
                        <span className="flex items-center gap-2"><Bot className="h-3 w-3" /> Agent</span>
                      </SelectItem>
                      <SelectItem value="hybrid">
                        <span className="flex items-center gap-2"><Zap className="h-3 w-3" /> Hybrid</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value_category">Value Category</Label>
                  <Select value={newTask.value_category} onValueChange={(value: TaskValueCategory) => setNewTask({ ...newTask, value_category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="outreach">Outreach</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="ops">Operations</SelectItem>
                      <SelectItem value="ip">IP / Content</SelectItem>
                      <SelectItem value="architecture">Architecture</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newTask.due_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.due_date ? format(newTask.due_date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.due_date || undefined}
                      onSelect={(date) => setNewTask({ ...newTask, due_date: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button onClick={createTask} disabled={isCreating || !newTask.subject} className="w-full">
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PrintTasksDialog tasks={tasks} />
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No tasks found. Create your first task to get started!
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        {task.task_type === 'agent' && <Bot className="h-4 w-4 text-purple-500" />}
                        {task.task_type === 'hybrid' && <Zap className="h-4 w-4 text-amber-500" />}
                        <CardTitle className="text-lg">{task.subject}</CardTitle>
                      </div>
                      {task.description && (
                        <CardDescription className="line-clamp-2">
                          {task.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {task.value_category && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {task.value_category}
                          </Badge>
                        )}
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(task.due_date), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {task.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, 'completed');
                        }}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {task.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task.id, 'in_progress');
                        }}
                      >
                        Start
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="board" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['pending', 'in_progress', 'completed'].map((status) => (
              <div key={status} className="space-y-4">
                <h3 className="font-semibold capitalize flex items-center gap-2">
                  {getStatusIcon(status)}
                  {status.replace('_', ' ')}
                  <Badge variant="secondary">
                    {filteredTasks.filter(t => t.status === status).length}
                  </Badge>
                </h3>
                <div className="space-y-2">
                  {filteredTasks.filter(t => t.status === status).map((task) => (
                    <Card 
                      key={task.id} 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="space-y-2">
                        <div className="font-medium">{task.subject}</div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(task.due_date), "MMM d")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedTask && (
        <TaskDetailModal
          task={{
            id: selectedTask.id,
            title: selectedTask.subject,
            description: selectedTask.description || "",
            status: selectedTask.status,
            priority: selectedTask.priority,
            due_date: selectedTask.due_date || "",
            category: selectedTask.activity_type,
          }}
          open={showTaskDetail}
          onOpenChange={handleTaskDetailClose}
          onUpdate={fetchTasks}
        />
      )}
    </div>
  );
}
