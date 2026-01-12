import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MessageSquare, FileText, Headphones, GraduationCap, Presentation, Network } from "lucide-react";
import { toast } from "sonner";
import { NotebookSources } from "@/components/notebook/NotebookSources";
import { NotebookChat } from "@/components/notebook/NotebookChat";
import { NotebookStudio } from "@/components/notebook/NotebookStudio";

export default function NotebookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sources");

  const { data: notebook, isLoading } = useQuery({
    queryKey: ["notebook", id],
    queryFn: async () => {
      if (!id) throw new Error("No notebook ID");

      const { data, error } = await supabase
        .from("notebooks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: sources } = useQuery({
    queryKey: ["notebook-sources", id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from("notebook_sources")
        .select("*")
        .eq("notebook_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <p>Notebook not found</p>
        <Button onClick={() => navigate("/research-studio")} variant="link">
          Back to Research Studio
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="border-b px-4 py-3 flex items-center gap-4 bg-background">
        <Button variant="ghost" size="icon" onClick={() => navigate("/research-studio")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{notebook.title}</h1>
          <p className="text-xs text-muted-foreground truncate">
            {sources?.length || 0} sources • Updated {new Date(notebook.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left sidebar - Sources */}
        <div className="w-80 border-r flex-shrink-0 overflow-y-auto bg-muted/30">
          <NotebookSources notebookId={id!} sources={sources || []} />
        </div>

        {/* Main content area */}
        <div className="flex-1 min-h-0 flex flex-col min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
            <div className="border-b px-4">
              <TabsList className="h-12 gap-2 bg-transparent">
                <TabsTrigger value="sources" className="gap-2 data-[state=active]:bg-muted">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Sources</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-muted">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="studio" className="gap-2 data-[state=active]:bg-muted">
                  <Presentation className="h-4 w-4" />
                  <span className="hidden sm:inline">Studio</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="sources" className="flex-1 min-h-0 overflow-y-auto m-0 p-4">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-lg font-medium mb-4">Source Overview</h2>
                {sources?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Add sources using the panel on the left to get started.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sources?.map((source: any) => (
                      <div key={source.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{source.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {source.source_type} • {source.processing_status}
                        </p>
                        {source.summary && (
                          <p className="text-sm mt-2">{source.summary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="chat" className="flex-1 min-h-0 overflow-hidden m-0">
              <NotebookChat notebookId={id!} sources={sources || []} />
            </TabsContent>

            <TabsContent value="studio" className="flex-1 min-h-0 overflow-y-auto m-0 p-4">
              <NotebookStudio notebookId={id!} sources={sources || []} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}