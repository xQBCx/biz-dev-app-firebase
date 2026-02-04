import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
}

interface DealTaskManagerProps {
  dealId: string;
  tasks: Task[];
  onTasksChange: () => void;
}

export const DealTaskManager = ({ dealId, tasks, onTasksChange }: DealTaskManagerProps) => {
  const { user } = useAuth();
  const { activeClientId } = useActiveClient();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });

  const handleAddTask = async () => {
    if (!user || !newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      const { error } = await supabase.from("crm_deal_tasks").insert({
        deal_id: dealId,
        user_id: user.id,
        client_id: activeClientId || null,
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Task added");
      setNewTask({ title: "", description: "", priority: "medium", due_date: "" });
      setShowAddTask(false);
      onTasksChange();
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task");
    }
  };

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    const completedAt = newStatus === "completed" ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from("crm_deal_tasks")
        .update({ status: newStatus, completed_at: completedAt })
        .eq("id", taskId);

      if (error) throw error;
      toast.success(`Task marked as ${newStatus}`);
      onTasksChange();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;

    try {
      const { error } = await supabase.from("crm_deal_tasks").delete().eq("id", taskId);
      if (error) throw error;
      toast.success("Task deleted");
      onTasksChange();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    high: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Tasks</h3>
        <Button size="sm" onClick={() => setShowAddTask(!showAddTask)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {showAddTask && (
        <Card className="p-4 mb-4 bg-accent/50">
          <div className="space-y-3">
            <div>
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title..."
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add task details..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
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
              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddTask} size="sm">
                Save Task
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAddTask(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No tasks yet. Add your first task to get started.
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 border border-border rounded-lg transition-all ${
                task.status === "completed" ? "opacity-60" : ""
              }`}
            >
              <button
                onClick={() => handleToggleStatus(task.id, task.status)}
                className="mt-1 flex-shrink-0"
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4
                    className={`font-medium ${
                      task.status === "completed" ? "line-through" : ""
                    }`}
                  >
                    {task.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className={priorityColors[task.priority as keyof typeof priorityColors]}
                  >
                    {task.priority}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {task.due_date && (
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  )}
                  {task.completed_at && (
                    <span>Completed: {new Date(task.completed_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(task.id)}
                className="flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
