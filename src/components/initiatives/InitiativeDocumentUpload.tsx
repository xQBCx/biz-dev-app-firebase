import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatFileSize } from "@/lib/fileUtils";
import {
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  FileAudio,
  Film,
  Link2,
  Trash2,
  Download,
  Sparkles,
  Loader2,
  ExternalLink,
  Brain,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  X,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface InitiativeDocument {
  id: string;
  initiative_id: string;
  file_name: string;
  file_type: string | null;
  file_size_bytes: number | null;
  file_path: string;
  storage_bucket: string;
  notes?: string | null;
  link_type: string | null;
  external_url: string | null;
  ai_analysis: any | null;
  suggested_folder_path: string | null;
  extraction_status: string | null;
  created_at: string | null;
  metadata: any | null;
}

interface InitiativeDocumentUploadProps {
  initiativeId: string;
  documents: InitiativeDocument[];
  onDocumentsChange: () => void;
}

const ACCEPTED_FILE_TYPES = [
  // Documents
  ".pdf", ".docx", ".doc", ".txt", ".rtf",
  // Spreadsheets
  ".xlsx", ".xls", ".csv",
  // Presentations
  ".pptx", ".ppt",
  // Images
  ".png", ".jpg", ".jpeg", ".gif", ".webp",
  // Audio
  ".mp3", ".wav", ".m4a", ".ogg"
].join(",");

export function InitiativeDocumentUpload({
  initiativeId,
  documents,
  onDocumentsChange
}: InitiativeDocumentUploadProps) {
  const { user } = useAuth();
  const { activeClientId } = useActiveClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedDoc, setSelectedDoc] = useState<InitiativeDocument | null>(null);
  const [linkForm, setLinkForm] = useState({
    name: "",
    url: "",
    notes: ""
  });

  const getFileIcon = (fileName: string, fileType: string | null, linkType: string | null) => {
    if (linkType === "external_url" || linkType === "google_drive") {
      return <Link2 className="w-5 h-5 text-blue-500" />;
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeType = fileType?.toLowerCase() || "";

    if (mimeType.includes("image") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) {
      return <Image className="w-5 h-5 text-purple-500" />;
    }
    if (mimeType.includes("pdf") || ext === "pdf") {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (mimeType.includes("spreadsheet") || ["xlsx", "xls", "csv"].includes(ext || "")) {
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    }
    if (mimeType.includes("audio") || ["mp3", "wav", "m4a", "ogg"].includes(ext || "")) {
      return <FileAudio className="w-5 h-5 text-orange-500" />;
    }
    if (mimeType.includes("video") || ["mp4", "mov", "avi"].includes(ext || "")) {
      return <Film className="w-5 h-5 text-pink-500" />;
    }
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  const detectLinkType = (url: string): string => {
    if (url.includes("docs.google.com") || url.includes("drive.google.com") || 
        url.includes("sheets.google.com") || url.includes("slides.google.com")) {
      return "google_drive";
    }
    return "external_url";
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!user) return;
    setIsUploading(true);

    try {
      for (const file of files) {
        // Check file size (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 20MB)`);
          continue;
        }

        // Upload to storage
        const filePath = `${user.id}/${initiativeId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("initiative-documents")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Create database record
        const { error: dbError } = await supabase
          .from("initiative_documents")
          .insert({
            initiative_id: initiativeId,
            user_id: user.id,
            file_name: file.name,
            file_type: file.type,
            file_size_bytes: file.size,
            file_path: filePath,
            storage_bucket: "initiative-documents",
            link_type: "uploaded",
            extraction_status: "pending"
          });

        if (dbError) {
          console.error("Database error:", dbError);
          toast.error(`Failed to save ${file.name} metadata`);
        }
      }

      toast.success(`Uploaded ${files.length} file(s)`);
      onDocumentsChange();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = async () => {
    if (!user || !linkForm.name || !linkForm.url) {
      toast.error("Please provide a name and URL");
      return;
    }

    try {
      const linkType = detectLinkType(linkForm.url);
      
      const { error } = await supabase
        .from("initiative_documents")
        .insert({
          initiative_id: initiativeId,
          user_id: user.id,
          file_name: linkForm.name,
          file_path: linkForm.url,
          storage_bucket: "external",
          link_type: linkType,
          external_url: linkForm.url,
          metadata: { notes: linkForm.notes },
          extraction_status: "pending"
        });

      if (error) throw error;

      toast.success("Link added successfully");
      setShowLinkDialog(false);
      setLinkForm({ name: "", url: "", notes: "" });
      onDocumentsChange();
    } catch (error) {
      console.error("Error adding link:", error);
      toast.error("Failed to add link");
    }
  };

  const handleAnalyzeDocument = async (doc: InitiativeDocument) => {
    if (!user) return;
    setIsAnalyzing(doc.id);

    try {
      const { data, error } = await supabase.functions.invoke("erp-analyze-document", {
        body: {
          fileName: doc.file_name,
          fileType: doc.file_type,
          erpConfigId: null // Will use default config
        }
      });

      if (error) throw error;

      // Update document with analysis
      await supabase
        .from("initiative_documents")
        .update({
          ai_analysis: data,
          suggested_folder_path: data.suggestedPath,
          extraction_status: "completed"
        })
        .eq("id", doc.id);

      setAnalysisResult(data);
      setSelectedDoc(doc);
      setShowAnalysisDialog(true);
      onDocumentsChange();
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze document");
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleDownload = async (doc: InitiativeDocument) => {
    if (doc.external_url) {
      window.open(doc.external_url, "_blank");
      return;
    }

    if (!doc.file_path || doc.link_type !== "uploaded") {
      toast.error("No file to download");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from(doc.storage_bucket)
        .createSignedUrl(doc.file_path, 3600);

      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (doc: InitiativeDocument) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      // Delete from storage if uploaded
      if (doc.link_type === "uploaded" && doc.file_path) {
        await supabase.storage
          .from(doc.storage_bucket)
          .remove([doc.file_path]);
      }

      // Delete from database
      const { error } = await supabase
        .from("initiative_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      toast.success("Document deleted");
      onDocumentsChange();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    }
  };

  const getExtractionStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Analyzed</Badge>;
      case "processing":
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-dashed border-2">
        <CardContent className="p-6">
          <div
            className={`relative flex flex-col items-center justify-center py-8 rounded-lg transition-colors ${
              dragActive ? "bg-primary/10 border-primary" : "bg-muted/30"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="text-center mb-2">
                  <span className="font-medium">Drag and drop files here</span>
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse (PDFs, images, docs, spreadsheets, audio)
                </p>
                <div className="flex gap-2">
                  <label>
                    <input
                      type="file"
                      multiple
                      accept={ACCEPTED_FILE_TYPES}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span><Upload className="w-4 h-4 mr-2" />Upload Files</span>
                    </Button>
                  </label>
                  <Button variant="outline" size="sm" onClick={() => setShowLinkDialog(true)}>
                    <Link2 className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Documents ({documents.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload files or add links to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="shrink-0 mt-0.5">
                      {getFileIcon(doc.file_name, doc.file_type, doc.link_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{doc.file_name}</p>
                        {getExtractionStatusBadge(doc.extraction_status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {doc.file_size_bytes && <span>{formatFileSize(doc.file_size_bytes)}</span>}
                        <span>•</span>
                        <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}</span>
                        {doc.link_type !== "uploaded" && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs py-0">
                              {doc.link_type === "google_drive" ? "Google" : "Link"}
                            </Badge>
                          </>
                        )}
                      </div>
                      {doc.suggested_folder_path && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-primary">
                          <FolderOpen className="w-3 h-3" />
                          <span>{doc.suggested_folder_path}</span>
                        </div>
                      )}
                      {doc.metadata?.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{doc.metadata.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleAnalyzeDocument(doc)}
                        disabled={isAnalyzing === doc.id}
                      >
                        {isAnalyzing === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownload(doc)}
                      >
                        {doc.external_url ? (
                          <ExternalLink className="w-4 h-4" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add External Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Link Name</Label>
              <Input
                placeholder="e.g., Project Proposal Doc"
                value={linkForm.name}
                onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                placeholder="https://docs.google.com/..."
                value={linkForm.url}
                onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Supports Google Docs, Sheets, Slides, Drive, and any external URL
              </p>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Add any notes about this link..."
                value={linkForm.notes}
                onChange={(e) => setLinkForm({ ...linkForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink}>
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Document Analysis
            </DialogTitle>
          </DialogHeader>
          {analysisResult && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground text-sm">Document</Label>
                <p className="font-medium">{selectedDoc?.file_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Suggested Location</Label>
                <div className="flex items-center gap-2 mt-1">
                  <FolderOpen className="w-4 h-4 text-primary" />
                  <span className="font-medium">{analysisResult.suggestedPath}</span>
                </div>
              </div>
              {analysisResult.extractedData && Object.keys(analysisResult.extractedData).length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-sm">Extracted Information</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-lg text-sm">
                    {Object.entries(analysisResult.extractedData).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analysisResult.workflowSuggestions?.length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-sm">Suggested Workflows</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {analysisResult.workflowSuggestions.map((wf: string, i: number) => (
                      <Badge key={i} variant="secondary">{wf}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {analysisResult.knowledgeBaseRelevance && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="text-sm">Recommended for AI Knowledge Base</span>
                </div>
              )}
              {analysisResult.reasoning && (
                <div>
                  <Label className="text-muted-foreground text-sm">AI Reasoning</Label>
                  <p className="text-sm mt-1">{analysisResult.reasoning}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnalysisDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              toast.success("Document organized to suggested location");
              setShowAnalysisDialog(false);
            }}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
