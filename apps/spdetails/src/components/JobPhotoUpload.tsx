import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressImage } from "@/lib/imageCompression";

type JobPhoto = {
  id: string;
  image_url: string;
  image_type: "before" | "after";
  created_at: string;
};

interface JobPhotoUploadProps {
  bookingId: string;
}

export function JobPhotoUpload({ bookingId }: JobPhotoUploadProps) {
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotos();
  }, [bookingId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("job_photos")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setPhotos((data || []) as JobPhoto[]);
    } catch (error: any) {
      console.error("Error fetching photos:", error);
    }
  };

  const uploadPhoto = async (file: File, imageType: "before" | "after") => {
    try {
      setUploading(true);

      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Compress image before upload
      const compressedFile = await compressImage(file);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage
      const fileExt = compressedFile.name.split(".").pop();
      const fileName = `${bookingId}/${imageType}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("job-photos")
        .upload(fileName, compressedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("job-photos")
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from("job_photos")
        .insert({
          booking_id: bookingId,
          uploaded_by: user.id,
          image_url: publicUrl,
          image_type: imageType,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: `${imageType} photo uploaded successfully`,
      });

      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/job-photos/");
      const filePath = urlParts[1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("job-photos")
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("job_photos")
        .delete()
        .eq("id", photoId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Photo deleted",
      });

      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const beforePhotos = photos.filter(p => p.image_type === "before");
  const afterPhotos = photos.filter(p => p.image_type === "after");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Job Photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Before Photos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Before Photos</Label>
            <Label
              htmlFor="before-upload"
              className="cursor-pointer"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Before
                </span>
              </Button>
            </Label>
            <Input
              id="before-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadPhoto(file, "before");
                e.target.value = "";
              }}
            />
          </div>
          
          {beforePhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {beforePhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.image_url}
                    alt="Before"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deletePhoto(photo.id, photo.image_url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No before photos uploaded</p>
          )}
        </div>

        {/* After Photos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>After Photos</Label>
            <Label
              htmlFor="after-upload"
              className="cursor-pointer"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload After
                </span>
              </Button>
            </Label>
            <Input
              id="after-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadPhoto(file, "after");
                e.target.value = "";
              }}
            />
          </div>
          
          {afterPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {afterPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.image_url}
                    alt="After"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deletePhoto(photo.id, photo.image_url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No after photos uploaded</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
