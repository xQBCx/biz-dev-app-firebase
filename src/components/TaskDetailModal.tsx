import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Send, 
  Sparkles,
  Plus,
  X,
  AtSign
} from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  category: string;
}

interface TaskNote {
  id: string;
  content: string;
  user_id: string;
  mentions: string[];
  created_at: string;
  profiles?: { full_name: string; email: string };
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  position: number;
}

interface TaskDetailModalProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function TaskDetailModal({ task, open, onOpenChange, onUpdate }: TaskDetailModalProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<TaskNote[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newNote, setNewNote] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  useEffect(() => {
    if (open && task) {
      fetchNotes();
      fetchSubtasks();
    }
  }, [open, task]);

  const fetchNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const { data, error } = await supabase
        .from("task_notes")
        .select("*")
        .eq("task_id", task.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(n => n.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]));
        const notesWithProfiles = data.map(note => ({
          ...note,
          profiles: profileMap.get(note.user_id)
        }));
        setNotes(notesWithProfiles as TaskNote[]);
      } else {
        setNotes([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const fetchSubtasks = async () => {
    try {
      const { data, error } = await supabase
        .from("task_subtasks")
        .select("*")
        .eq("task_id", task.id)
        .order("position");

      if (error) throw error;
      setSubtasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Extract @mentions from note
      const mentionRegex = /@(\w+)/g;
      const mentions = Array.from(newNote.matchAll(mentionRegex)).map(m => m[1]);

      const { error } = await supabase
        .from("task_notes")
        .insert({
          task_id: task.id,
          user_id: user.id,
          content: newNote,
          mentions: mentions,
        });

      if (error) throw error;

      setNewNote("");
      fetchNotes();
      toast({
        title: "Note added",
        description: "Your note has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;

    try {
      const { error } = await supabase
        .from("task_subtasks")
        .insert({
          task_id: task.id,
          title: newSubtask,
          position: subtasks.length,
        });

      if (error) throw error;

      setNewSubtask("");
      fetchSubtasks();
      toast({
        title: "Subtask added",
        description: "Your subtask has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleSubtask = async (subtask: Subtask) => {
    try {
      const { error } = await supabase
        .from("task_subtasks")
        .update({ completed: !subtask.completed })
        .eq("id", subtask.id);

      if (error) throw error;
      fetchSubtasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteSubtask = async (id: string) => {
    try {
      const { error } = await supabase
        .from("task_subtasks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchSubtasks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const askAI = async () => {
    if (!aiInput.trim()) return;

    setIsLoadingAI(true);
    setAiResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("task-assistant", {
        body: {
          taskId: task.id,
          taskTitle: task.title,
          taskDescription: task.description,
          question: aiInput,
          context: {
            notes: notes.map(n => n.content),
            subtasks: subtasks.map(s => s.title),
          }
        }
      });

      if (error) throw error;

      setAiResponse(data.response);
      setAiInput("");
    } catch (error: any) {
      toast({
        title: "AI Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const totalSubtasks = subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-2xl">{task.title}</DialogTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge variant="outline">{task.status}</Badge>
              <Badge variant="outline">{task.category}</Badge>
              {task.due_date && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="notes" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">
              <MessageSquare className="w-4 h-4 mr-2" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="subtasks">
              <CheckSquare className="w-4 h-4 mr-2" />
              Subtasks ({completedSubtasks}/{totalSubtasks})
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Task Description
              </h3>
              <p className="text-sm text-muted-foreground">
                {task.description || "No description provided."}
              </p>
            </Card>

            <div className="space-y-3">
              {isLoadingNotes ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading notes...</p>
              ) : notes.length > 0 ? (
                notes.map((note) => (
                  <Card key={note.id} className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {note.profiles?.full_name?.[0] || note.profiles?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {note.profiles?.full_name || note.profiles?.email || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        {note.mentions && note.mentions.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <AtSign className="w-3 h-3" />
                            Mentioned: {note.mentions.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
              )}
            </div>

            <Card className="p-4">
              <Textarea
                placeholder="Add a note... (Use @ to mention someone)"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[100px] mb-2"
              />
              <Button onClick={addNote} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="subtasks" className="space-y-4 mt-4">
            {totalSubtasks > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Card>
            )}

            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <Card key={subtask.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => toggleSubtask(subtask)}
                    />
                    <span
                      className={`flex-1 ${
                        subtask.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {subtask.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSubtask(subtask.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {subtasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No subtasks yet.
                </p>
              )}
            </div>

            <Card className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSubtask()}
                />
                <Button onClick={addSubtask}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Task Assistant
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ask questions, get advice, or research information related to this task.
              </p>

              {aiResponse && (
                <Card className="p-4 mb-4 bg-background">
                  <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
                </Card>
              )}

              <Textarea
                placeholder="Ask AI anything about this task... e.g., 'What are best practices for this?' or 'Research information about...'"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="min-h-[100px] mb-2 bg-background"
              />
              <Button
                onClick={askAI}
                disabled={isLoadingAI || !aiInput.trim()}
                className="w-full"
              >
                {isLoadingAI ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ask AI
                  </>
                )}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
