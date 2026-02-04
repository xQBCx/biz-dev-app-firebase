import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Check, Clock, AlertCircle, Eye } from "lucide-react";
import { usePhotosNeedingEdit, useUploadEditedPhoto, useUpdateEditingStatus } from "@/hooks/usePhotoEditing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface PhotoEditingWorkflowProps {
  photographerId: string;
}

export function PhotoEditingWorkflow({ photographerId }: PhotoEditingWorkflowProps) {
  const { data: photos = [], isLoading } = usePhotosNeedingEdit(photographerId);
  const uploadEditedPhoto = useUploadEditedPhoto();
  const updateStatus = useUpdateEditingStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<any>(null);

  const pendingPhotos = photos.filter((p: any) => p.editing_status === "pending_edit");
  const inProgressPhotos = photos.filter((p: any) => p.editing_status === "in_progress");

  const handleFileSelect = async (photoId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    await uploadEditedPhoto.mutateAsync({ photoId, editedFile: file });
    setSelectedPhotoId(null);
  };

  const handleStartEditing = (photoId: string) => {
    updateStatus.mutate({ photoId, status: "in_progress" });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">No photos requiring editing at the moment</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending ({pendingPhotos.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressPhotos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 mt-4">
          {pendingPhotos.map((photo: any) => (
            <Card key={photo.id} className="p-4">
              <div className="flex gap-4">
                <div 
                  className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                  onClick={() => setPreviewPhoto(photo)}
                >
                  <img
                    src={photo.original_url}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">
                      {photo.session?.client?.full_name || "Client"}
                    </p>
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Uploaded {new Date(photo.uploaded_at).toLocaleDateString()}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleStartEditing(photo.id)}
                    disabled={updateStatus.isPending}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Start Editing
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-3 mt-4">
          {inProgressPhotos.map((photo: any) => (
            <Card key={photo.id} className="p-4">
              <div className="flex gap-4">
                <div 
                  className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
                  onClick={() => setPreviewPhoto(photo)}
                >
                  <img
                    src={photo.original_url}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">
                      {photo.session?.client?.full_name || "Client"}
                    </p>
                    <Badge variant="default">
                      <Clock className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Uploaded {new Date(photo.uploaded_at).toLocaleDateString()}
                  </p>
                  <input
                    ref={selectedPhotoId === photo.id ? fileInputRef : null}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(photo.id, e)}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedPhotoId(photo.id);
                      setTimeout(() => fileInputRef.current?.click(), 0);
                    }}
                    disabled={uploadEditedPhoto.isPending}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload Edited Version
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <div className="space-y-4">
              <img
                src={previewPhoto.original_url}
                alt="Preview"
                className="w-full rounded-lg"
              />
              <div className="text-sm text-muted-foreground">
                <p>Client: {previewPhoto.session?.client?.full_name || "Unknown"}</p>
                <p>Uploaded: {new Date(previewPhoto.uploaded_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
