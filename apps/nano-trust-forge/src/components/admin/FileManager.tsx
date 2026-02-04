import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Folder, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FileManager = () => {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: deals } = useQuery({
    queryKey: ["deals-for-files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("id, title, slug")
        .eq("is_active", true)
        .order("title");

      if (error) throw error;
      return data;
    },
  });

  const { data: folders } = useQuery({
    queryKey: ["folders-admin", selectedDeal],
    queryFn: async () => {
      if (!selectedDeal) return [];
      
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("deal_id", selectedDeal)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!selectedDeal,
  });

  const { data: files } = useQuery({
    queryKey: ["files-admin", selectedDeal],
    queryFn: async () => {
      if (!selectedDeal) return [];

      const { data, error } = await supabase
        .from("files")
        .select("*, folders(name)")
        .eq("deal_id", selectedDeal)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!selectedDeal,
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders-admin"] });
      toast.success("Folder deleted");
    },
    onError: () => {
      toast.error("Failed to delete folder");
    },
  });

  const deleteFile = useMutation({
    mutationFn: async (file: any) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("data-room")
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("files")
        .delete()
        .eq("id", file.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files-admin"] });
      toast.success("File deleted");
    },
    onError: () => {
      toast.error("Failed to delete file");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Files & Folders</h2>
          <p className="text-sm text-muted-foreground">
            Manage data room documents for deals
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setFolderDialogOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button onClick={() => setFileDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Deal Selector */}
      <Card className="p-6">
        <Label>Select Deal</Label>
        <Select value={selectedDeal} onValueChange={setSelectedDeal}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Choose a deal to manage files" />
          </SelectTrigger>
          <SelectContent>
            {deals?.map((deal) => (
              <SelectItem key={deal.id} value={deal.id}>
                {deal.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {selectedDeal && (
        <>
          {/* Folders */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Folders</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders?.map((folder) => (
                <Card key={folder.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Folder className="h-8 w-8 text-accent" />
                      <div>
                        <p className="font-semibold text-foreground">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">Folder</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFolder.mutate(folder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {(!folders || folders.length === 0) && (
                <p className="text-sm text-muted-foreground col-span-full">No folders yet</p>
              )}
            </div>
          </div>

          {/* Files */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Files</h3>
            <div className="space-y-2">
              {files?.map((file) => (
                <Card key={file.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-6 w-6 text-accent" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{file.file_type || "Unknown type"}</span>
                          {file.folders && (
                            <>
                              <span>•</span>
                              <span>{file.folders.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile.mutate(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {(!files || files.length === 0) && (
                <p className="text-sm text-muted-foreground">No files yet</p>
              )}
            </div>
          </div>
        </>
      )}

      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <FolderForm
            dealId={selectedDeal}
            onSuccess={() => {
              setFolderDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["folders-admin"] });
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <FileUploadForm
            dealId={selectedDeal}
            folders={folders || []}
            onSuccess={() => {
              setFileDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["files-admin"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FolderForm = ({ dealId, onSuccess }: { dealId: string; onSuccess: () => void }) => {
  const [name, setName] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("folders").insert({
        deal_id: dealId,
        name: name.trim(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Folder created");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to create folder");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Folder Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Financial Statements"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
        {saveMutation.isPending ? "Creating..." : "Create Folder"}
      </Button>
    </form>
  );
};

const FileUploadForm = ({
  dealId,
  folders,
  onSuccess,
}: {
  dealId: string;
  folders: any[];
  onSuccess: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [folderId, setFolderId] = useState<string>("");

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");

      // Generate unique storage path
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${dealId}/${timestamp}_${safeName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("data-room")
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { error: dbError } = await supabase.from("files").insert({
        deal_id: dealId,
        folder_id: folderId || null,
        name: file.name,
        storage_path: storagePath,
        file_type: file.type,
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success("File uploaded");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to upload file");
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        uploadMutation.mutate();
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="folder">Folder (optional)</Label>
        <Select value={folderId} onValueChange={setFolderId}>
          <SelectTrigger>
            <SelectValue placeholder="Root folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Root folder</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File *</Label>
        <Input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <p className="text-xs text-muted-foreground">Max file size: 20MB</p>
      </div>

      <Button type="submit" className="w-full" disabled={uploadMutation.isPending || !file}>
        {uploadMutation.isPending ? "Uploading..." : "Upload File"}
      </Button>
    </form>
  );
};

export default FileManager;
