import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Upload, Link, Youtube, Database, FileText, Globe, Music, Trash2, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface NotebookSourcesProps {
  notebookId: string;
  sources: any[];
}

const sourceTypeIcons: Record<string, any> = {
  pdf: FileText,
  document: FileText,
  url: Globe,
  youtube: Youtube,
  audio: Music,
  text: FileText,
  crm_company: Database,
  crm_contact: Database,
  crm_deal: Database,
  task: Database,
  workflow: Database,
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle,
  failed: XCircle,
};

export function NotebookSources({ notebookId, sources }: NotebookSourcesProps) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addTab, setAddTab] = useState("upload");
  const [urlInput, setUrlInput] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  const addSourceMutation = useMutation({
    mutationFn: async (params: { source_type: string; title: string; content?: string; source_url?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("notebook_sources")
        .insert({
          notebook_id: notebookId,
          user_id: user.id,
          source_type: params.source_type,
          title: params.title,
          content: params.content,
          source_url: params.source_url,
          processing_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger processing via edge function
      await supabase.functions.invoke("notebook-process-source", {
        body: { sourceId: data.id },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-sources", notebookId] });
      setIsAddOpen(false);
      setUrlInput("");
      setTextTitle("");
      setTextContent("");
      toast.success("Source added and processing started");
    },
    onError: (error) => {
      toast.error("Failed to add source: " + error.message);
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notebook_sources")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-sources", notebookId] });
      toast.success("Source removed");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const filePath = `${user.id}/${notebookId}/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from("notebook-files")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      return;
    }

    const fileType = file.type.includes("pdf") ? "pdf" : 
                     file.type.includes("audio") ? "audio" : "document";

    addSourceMutation.mutate({
      source_type: fileType,
      title: file.name,
      source_url: filePath,
    });
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;

    const isYoutube = urlInput.includes("youtube.com") || urlInput.includes("youtu.be");
    
    addSourceMutation.mutate({
      source_type: isYoutube ? "youtube" : "url",
      title: urlInput,
      source_url: urlInput,
    });
  };

  const handleTextAdd = () => {
    if (!textTitle.trim() || !textContent.trim()) return;

    addSourceMutation.mutate({
      source_type: "text",
      title: textTitle,
      content: textContent,
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm">Sources ({sources.length})</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Source</DialogTitle>
              <DialogDescription>
                Upload files, paste URLs, or add text content.
              </DialogDescription>
            </DialogHeader>
            <Tabs value={addTab} onValueChange={setAddTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="platform">Platform</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4 pt-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    PDF, DOCX, TXT, MP3, WAV
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.mp3,.wav,.m4a"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Website or YouTube URL</Label>
                  <Input
                    placeholder="https://..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleUrlAdd} 
                  disabled={!urlInput.trim() || addSourceMutation.isPending}
                  className="w-full"
                >
                  {addSourceMutation.isPending ? "Adding..." : "Add URL"}
                </Button>
              </TabsContent>

              <TabsContent value="text" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Note title"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <textarea
                    className="w-full min-h-[150px] p-3 text-sm border rounded-md resize-none"
                    placeholder="Paste or type your content here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleTextAdd} 
                  disabled={!textTitle.trim() || !textContent.trim() || addSourceMutation.isPending}
                  className="w-full"
                >
                  {addSourceMutation.isPending ? "Adding..." : "Add Text"}
                </Button>
              </TabsContent>

              <TabsContent value="platform" className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Connect data from your Biz Dev App:
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Database className="h-4 w-4 mr-2" />
                    CRM Companies (coming soon)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Database className="h-4 w-4 mr-2" />
                    CRM Deals (coming soon)
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Database className="h-4 w-4 mr-2" />
                    Tasks & Workflows (coming soon)
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-2">
          {sources.map((source) => {
            const Icon = sourceTypeIcons[source.source_type] || FileText;
            const StatusIcon = statusIcons[source.processing_status] || Clock;
            const isProcessing = source.processing_status === "processing";

            return (
              <div
                key={source.id}
                className="group p-3 rounded-lg border bg-background hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{source.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusIcon className={`h-3 w-3 ${isProcessing ? "animate-spin" : ""} ${
                        source.processing_status === "completed" ? "text-green-500" :
                        source.processing_status === "failed" ? "text-red-500" :
                        "text-muted-foreground"
                      }`} />
                      <span className="text-xs text-muted-foreground capitalize">
                        {source.processing_status}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteSourceMutation.mutate(source.id)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}