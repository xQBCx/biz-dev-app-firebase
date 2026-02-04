import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Image,
  Music,
  Video,
  File,
  Download,
  Trash2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Upload,
  Paperclip
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatFileSize, getFileTypeInfo } from "@/lib/fileUtils";
import { ENTITY_TYPE_LABELS, type EntityAttachment } from "@/lib/attachmentUtils";
import { format } from "date-fns";

interface EntityAttachmentsSectionProps {
  entityType: string;
  entityId: string;
  title?: string;
  className?: string;
  showUploadButton?: boolean;
}

export function EntityAttachmentsSection({
  entityType,
  entityId,
  title = "Attachments",
  className,
  showUploadButton = true
}: EntityAttachmentsSectionProps) {
  const [attachments, setAttachments] = useState<EntityAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAttachments();
  }, [entityType, entityId]);

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("entity_attachments")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAttachments(data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      toast.error("Failed to load attachments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (attachment: EntityAttachment) => {
    if (!confirm(`Delete "${attachment.filename}"?`)) return;

    setIsDeleting(attachment.id);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(attachment.storage_bucket)
        .remove([attachment.storage_path]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }

      // Delete record
      const { error } = await supabase
        .from("entity_attachments")
        .delete()
        .eq("id", attachment.id);

      if (error) throw error;

      setAttachments(prev => prev.filter(a => a.id !== attachment.id));
      toast.success("Attachment deleted");
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("Failed to delete attachment");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownload = async (attachment: EntityAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from(attachment.storage_bucket)
        .createSignedUrl(attachment.storage_path, 60);

      if (error) throw error;

      // Open in new tab
      window.open(data.signedUrl, "_blank");
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("Failed to download file");
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-4 w-4" />;
    
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (fileType.startsWith("audio/")) return <Music className="h-4 w-4" />;
    if (fileType.startsWith("video/")) return <Video className="h-4 w-4" />;
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4" />;
    
    return <File className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Paperclip className="h-5 w-5" />
          {title}
          {attachments.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {attachments.length}
            </Badge>
          )}
        </CardTitle>
        {showUploadButton && (
          <Button variant="outline" size="sm" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No attachments yet</p>
            <p className="text-xs mt-1">
              Drop files into the chat to attach them here
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded bg-muted text-muted-foreground">
                      {getFileIcon(attachment.file_type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.filename}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {attachment.file_size && (
                          <span>{formatFileSize(attachment.file_size)}</span>
                        )}
                        <span>•</span>
                        <span>{format(new Date(attachment.created_at), "MMM d, yyyy")}</span>
                        {attachment.attached_via_chat && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              Chat
                            </span>
                          </>
                        )}
                        {attachment.ai_suggested && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-primary">
                              <Sparkles className="h-3 w-3" />
                              AI
                            </span>
                          </>
                        )}
                      </div>
                      {attachment.notes && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {attachment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(attachment)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(attachment)}
                      disabled={isDeleting === attachment.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
