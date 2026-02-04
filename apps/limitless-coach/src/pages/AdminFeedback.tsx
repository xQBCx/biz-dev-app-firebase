import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MessageSquare, User, Calendar, Trash2 } from "lucide-react";

interface Feedback {
  id: string;
  user_id: string | null;
  feedback_type: string;
  title: string;
  description: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const { toast } = useToast();

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("platform_feedback")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f));
      toast({ title: "Status updated" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveNotes = async (id: string) => {
    try {
      const { error } = await supabase
        .from("platform_feedback")
        .update({ admin_notes: notesValue })
        .eq("id", id);

      if (error) throw error;
      
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, admin_notes: notesValue } : f));
      setEditingNotes(null);
      toast({ title: "Notes saved" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteFeedback = async (id: string) => {
    try {
      const { error } = await supabase
        .from("platform_feedback")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setFeedback(prev => prev.filter(f => f.id !== id));
      toast({ title: "Feedback deleted" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      suggestion: "bg-blue-500/20 text-blue-400",
      bug: "bg-red-500/20 text-red-400",
      complaint: "bg-orange-500/20 text-orange-400",
      other: "bg-gray-500/20 text-gray-400",
    };
    return variants[type] || variants.other;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: "bg-green-500/20 text-green-400",
      reviewing: "bg-yellow-500/20 text-yellow-400",
      planned: "bg-purple-500/20 text-purple-400",
      completed: "bg-blue-500/20 text-blue-400",
      dismissed: "bg-gray-500/20 text-gray-400",
    };
    return variants[status] || variants.new;
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Platform Feedback</h1>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading feedback...</p>
          ) : feedback.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No feedback submitted yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                          {item.user_id && (
                            <>
                              <User className="h-4 w-4 ml-2" />
                              <span>Logged in user</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeBadge(item.feedback_type)}>
                          {item.feedback_type}
                        </Badge>
                        <Badge className={getStatusBadge(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-foreground">{item.description}</p>
                    
                    <div className="flex items-center gap-4">
                      <Select
                        value={item.status}
                        onValueChange={(value) => updateStatus(item.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteFeedback(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {editingNotes === item.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Add admin notes..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveNotes(item.id)}>
                            Save Notes
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingNotes(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {item.admin_notes ? (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm text-muted-foreground mb-1">Admin Notes:</p>
                            <p className="text-sm">{item.admin_notes}</p>
                            <Button
                              size="sm"
                              variant="link"
                              className="p-0 h-auto mt-2"
                              onClick={() => {
                                setEditingNotes(item.id);
                                setNotesValue(item.admin_notes || "");
                              }}
                            >
                              Edit notes
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingNotes(item.id);
                              setNotesValue("");
                            }}
                          >
                            Add Notes
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminFeedback;
