import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Photo {
  id: string;
  photo_url: string;
  created_at: string;
}

interface PhotoGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photos: Photo[];
  sessionId: string;
}

export function PhotoGallery({ open, onOpenChange, photos, sessionId }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleDownload = async (photoUrl: string, index: number) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session-${sessionId}-photo-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Photo downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download photo");
    }
  };

  const handleDownloadAll = async () => {
    toast.info(`Downloading ${photos.length} photos...`);
    for (let i = 0; i < photos.length; i++) {
      await handleDownload(photos[i].photo_url, i);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Session Photos ({photos.length})</DialogTitle>
          </DialogHeader>

          {photos.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No photos from this session yet
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <Button onClick={handleDownloadAll} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download All Photos
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-2">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative group cursor-pointer aspect-square overflow-hidden rounded-lg border border-border bg-muted"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={photo.photo_url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-colors flex items-center justify-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(photo.photo_url, index);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          {selectedIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {selectedIndex < photos.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={goToNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center gap-4">
            <img
              src={photos[selectedIndex].photo_url}
              alt={`Photo ${selectedIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIndex + 1} / {photos.length}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(photos[selectedIndex].photo_url, selectedIndex)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
