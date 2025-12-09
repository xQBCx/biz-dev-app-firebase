import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Upload, FileText, Folder, Sparkles, Loader, 
  Check, X, ArrowRight, MessageSquare, BookOpen 
} from "lucide-react";
interface SmartDocumentRouterProps {
  erpConfigId: string;
}

interface DocumentRecommendation {
  suggestedFolder: string;
  suggestedPath: string;
  extractedData: Record<string, any>;
  workflowSuggestions: string[];
  knowledgeBaseRelevance: boolean;
  reasoning: string;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  recommendation: DocumentRecommendation | null;
}

const SmartDocumentRouter = ({ erpConfigId }: SmartDocumentRouterProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [pendingDocs, setPendingDocs] = useState<UploadedDocument[]>([]);
  const { data: documents } = useQuery({
    queryKey: ["erp-documents", erpConfigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("erp_documents")
        .select("*")
        .eq("erp_config_id", erpConfigId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("erpConfigId", erpConfigId);

      const { data, error } = await supabase.functions.invoke("erp-analyze-document", {
        body: { 
          fileName: file.name, 
          fileType: file.type,
          erpConfigId 
        },
      });
      if (error) throw error;
      return { file, recommendation: data };
    },
    onSuccess: ({ file, recommendation }) => {
      const doc: UploadedDocument = {
        id: crypto.randomUUID(),
        fileName: file.name,
        fileType: file.type,
        status: "analyzed",
        recommendation: recommendation as DocumentRecommendation,
      };
      setPendingDocs((prev) => [...prev, doc]);
      setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
    },
    onError: (error: Error, file) => {
      toast.error(`Failed to analyze ${file.name}: ${error.message}`);
      setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ doc, accepted }: { doc: UploadedDocument; accepted: boolean }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase.from("erp_documents").insert({
        erp_config_id: erpConfigId,
        user_id: userId,
        file_name: doc.fileName,
        file_type: doc.fileType,
        ai_analysis: doc.recommendation?.extractedData as any,
        routing_recommendation: doc.recommendation as any,
        status: accepted ? "routed" : "manual",
      });
      if (error) throw error;
    },
    onSuccess: (_, { doc, accepted }) => {
      toast.success(accepted ? "Document routed successfully!" : "Document saved for manual routing");
      setPendingDocs((prev) => prev.filter((d) => d.id !== doc.id));
      queryClient.invalidateQueries({ queryKey: ["erp-documents", erpConfigId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const addToResearchStudioMutation = useMutation({
    mutationFn: async (docId: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("Not authenticated");
      
      // Create a new notebook for this document
      const { data: notebook, error: notebookError } = await supabase
        .from("notebooks")
        .insert({
          user_id: userId,
          title: `ERP Document Analysis`,
          description: `Research notebook for ERP document`,
          icon: "📄",
          color: "#4A90E2",
        })
        .select()
        .single();
      
      if (notebookError) throw notebookError;
      
      // Link the document to the notebook
      await supabase.from("erp_notebook_links").insert({
        erp_document_id: docId,
        notebook_id: notebook.id,
      });
      
      return notebook;
    },
    onSuccess: (notebook) => {
      toast.success("Document added to Research Studio!");
      navigate(`/research-studio/${notebook.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    setUploadingFiles((prev) => [...prev, ...files]);
    files.forEach((file) => analyzeMutation.mutate(file));
  }, [analyzeMutation]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadingFiles((prev) => [...prev, ...files]);
    files.forEach((file) => analyzeMutation.mutate(file));
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Smart Document Router
          </CardTitle>
          <CardDescription>
            Upload documents and let AI recommend where to store them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop files here</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports contracts, proposals, spreadsheets, images, and more
            </p>
            <label>
              <Input
                type="file"
                className="hidden"
                multiple
                onChange={handleFileSelect}
              />
              <Button variant="outline" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Analyzing...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {uploadingFiles.map((file) => (
              <div key={file.name} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Loader className="h-4 w-4 animate-spin" />
                <FileText className="h-4 w-4" />
                <span className="text-sm">{file.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Documents with Recommendations */}
      {pendingDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingDocs.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">{doc.fileType}</p>
                    </div>
                  </div>
                </div>

                {doc.recommendation && (
                  <>
                    <div className="bg-muted rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Suggested Location:</span>
                        <span className="text-sm">{doc.recommendation.suggestedPath}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {doc.recommendation.reasoning}
                      </p>

                      {doc.recommendation.workflowSuggestions?.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">Workflows:</span>
                          {doc.recommendation.workflowSuggestions.map((wf) => (
                            <span key={wf} className="text-xs bg-background px-2 py-0.5 rounded">
                              {wf}
                            </span>
                          ))}
                        </div>
                      )}

                      {doc.recommendation.knowledgeBaseRelevance && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <MessageSquare className="h-3 w-3" />
                          Add to Knowledge Base for AI queries
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveMutation.mutate({ doc, accepted: true })}
                        disabled={saveMutation.isPending}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => saveMutation.mutate({ doc, accepted: false })}
                        disabled={saveMutation.isPending}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Route Manually
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Documents */}
      {documents && documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.routing_recommendation?.suggestedPath || "Manual routing"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addToResearchStudioMutation.mutate(doc.id)}
                      disabled={addToResearchStudioMutation.isPending}
                      title="Ask questions about this document"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                    <span className={`text-xs px-2 py-1 rounded ${
                      doc.status === "routed" ? "bg-primary/10 text-primary" : "bg-muted-foreground/10"
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartDocumentRouter;
