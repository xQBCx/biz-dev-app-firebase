import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Book, Trash2, Brain } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { KnowledgeHub } from "@/components/notebook/KnowledgeHub";

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export default function ResearchStudio() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [activeView, setActiveView] = useState("knowledge");

  const { data: notebooks, isLoading } = useQuery({
    queryKey: ["notebooks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notebooks")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Notebook[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notebooks")
        .insert({
          user_id: user.id,
          title: newTitle,
          description: newDescription || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      toast.success("Notebook created");
      navigate(`/research-studio/${data.id}`);
    },
    onError: (error) => {
      toast.error("Failed to create notebook: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notebooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      toast.success("Notebook deleted");
    },
  });

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeView} onValueChange={setActiveView} className="flex-1 flex flex-col">
        <div className="border-b px-4 py-2 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="knowledge" className="gap-2">
              <Brain className="h-4 w-4" />
              Knowledge Hub
            </TabsTrigger>
            <TabsTrigger value="notebooks" className="gap-2">
              <Book className="h-4 w-4" />
              Notebooks
            </TabsTrigger>
          </TabsList>
          {activeView === "notebooks" && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Notebook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Notebook</DialogTitle>
                  <DialogDescription>
                    Start a new research project with sources.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="My Research Project"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="What is this notebook about?"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => createMutation.mutate()} 
                    disabled={!newTitle.trim() || createMutation.isPending}
                    className="w-full"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Notebook"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="knowledge" className="flex-1 m-0 overflow-hidden">
          <KnowledgeHub />
        </TabsContent>

        <TabsContent value="notebooks" className="flex-1 m-0 p-4 overflow-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-5 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : notebooks?.length === 0 ? (
            <Card className="border-dashed max-w-md mx-auto">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Book className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No notebooks yet</h3>
                <p className="text-muted-foreground text-sm text-center mb-4">
                  Create a notebook to organize research by topic.
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Notebook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notebooks?.map((notebook) => (
                <Card 
                  key={notebook.id} 
                  className="group cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/research-studio/${notebook.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: notebook.color + "20" }}
                      >
                        <Book className="h-5 w-5" style={{ color: notebook.color }} />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this notebook?")) {
                            deleteMutation.mutate(notebook.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg mt-3">{notebook.title}</CardTitle>
                    {notebook.description && (
                      <CardDescription className="line-clamp-2">
                        {notebook.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      Updated {new Date(notebook.updated_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}