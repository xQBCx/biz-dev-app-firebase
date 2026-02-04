import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, Download } from "lucide-react";
import { useSessionPhotos, useApproveEditedPhoto } from "@/hooks/usePhotoEditing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface EditedPhotosReviewProps {
  sessionId: string;
}

export function EditedPhotosReview({ sessionId }: EditedPhotosReviewProps) {
  const { data: photos = [], isLoading } = useSessionPhotos(sessionId);
  const approvePhoto = useApproveEditedPhoto();
  const [comparePhoto, setComparePhoto] = useState<any>(null);

  const editedPhotos = photos.filter(
    (p: any) => p.editing_status === "completed" && p.edited_url
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (editedPhotos.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No edited photos available yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {editedPhotos.map((photo: any) => (
        <Card key={photo.id} className="p-4">
          <div className="flex gap-4">
            <div className="flex gap-2">
              <div 
                className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted cursor-pointer"
                onClick={() => setComparePhoto(photo)}
              >
                <img
                  src={photo.original_url}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                  Original
                </div>
              </div>
              <div 
                className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted cursor-pointer"
                onClick={() => setComparePhoto(photo)}
              >
                <img
                  src={photo.edited_url}
                  alt="Edited"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-xs p-1 text-center">
                  Edited
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">Edited Photo</p>
                {photo.client_approved ? (
                  <Badge variant="default">
                    <Check className="h-3 w-3 mr-1" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pending Review</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Edited {new Date(photo.edited_at).toLocaleDateString()}
              </p>

              {!photo.client_approved && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approvePhoto.mutate(photo.id)}
                    disabled={approvePhoto.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setComparePhoto(photo)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Compare
                  </Button>
                </div>
              )}

              {photo.client_approved && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(photo.edited_url, "_blank")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      {/* Compare Dialog */}
      <Dialog open={!!comparePhoto} onOpenChange={() => setComparePhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compare Original vs Edited</DialogTitle>
          </DialogHeader>
          {comparePhoto && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Original</p>
                  <img
                    src={comparePhoto.original_url}
                    alt="Original"
                    className="w-full rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Edited</p>
                  <img
                    src={comparePhoto.edited_url}
                    alt="Edited"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
              {!comparePhoto.client_approved && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setComparePhoto(null)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      approvePhoto.mutate(comparePhoto.id);
                      setComparePhoto(null);
                    }}
                    disabled={approvePhoto.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve Photo
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
