import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, File, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  notes?: string;
  uploaded_at: string;
}

interface DealDocumentUploadProps {
  dealId: string;
  documents: Document[];
  onDocumentsChange: () => void;
}

export const DealDocumentUpload = ({ dealId, documents, onDocumentsChange }: DealDocumentUploadProps) => {
  const { user } = useAuth();
  const { activeClientId } = useActiveClient();
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${dealId}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('construction-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('construction-documents')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('crm_deal_documents')
        .insert({
          deal_id: dealId,
          user_id: user.id,
          client_id: activeClientId || null,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          notes: notes || null,
        });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully");
      setNotes("");
      if (e.target) e.target.value = "";
      onDocumentsChange();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!confirm("Delete this document?")) return;

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/construction-documents/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('construction-documents').remove([filePath]);
      }

      const { error } = await supabase
        .from('crm_deal_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast.success("Document deleted");
      onDocumentsChange();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Documents</h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="document-notes">Notes (optional)</Label>
          <Textarea
            id="document-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a description or note about this document..."
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
              <Upload className="w-5 h-5" />
              <span>Click to upload document</span>
            </div>
            <Input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </Label>
        </div>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No documents uploaded yet
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{doc.file_name}</p>
                  {doc.notes && (
                    <p className="text-sm text-muted-foreground truncate">{doc.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                    {doc.file_size && ` • ${(doc.file_size / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(doc.file_url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(doc.id, doc.file_url)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
