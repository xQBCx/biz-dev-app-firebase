import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  userId: string;
}

export function EditProfileDialog({ open, onOpenChange, profile, userId }: EditProfileDialogProps) {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [hourlyRate, setHourlyRate] = useState(profile?.hourly_rate?.toString() || "25");
  const [experienceLevel, setExperienceLevel] = useState(profile?.experience_level || "intermediate");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const updates: any = {
        full_name: fullName,
        bio: bio || null,
      };

      if (profile?.is_photographer) {
        updates.hourly_rate = parseFloat(hourlyRate) || 25;
        updates.experience_level = experienceLevel;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Profile updated successfully");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate();
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${i}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('portfolio-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-photos')
          .getPublicUrl(fileName);

        // Save to portfolio_photos table
        const { error: dbError } = await supabase
          .from('portfolio_photos')
          .insert({
            photographer_id: userId,
            photo_url: publicUrl,
            display_order: i,
          });

        if (dbError) throw dbError;
      }

      toast.success("Portfolio photos uploaded!");
      queryClient.invalidateQueries({ queryKey: ["portfolio", userId] });
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast.error("Failed to upload photos");
    } finally {
      setUploadingPhotos(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          {profile?.is_photographer && (
            <>
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="1"
                  step="1"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="25"
                  required
                />
              </div>

              <div>
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (5-10 years)</SelectItem>
                    <SelectItem value="expert">Expert (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="portfolio">Portfolio Photos</Label>
                <div className="mt-2">
                  <input
                    id="portfolio"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePortfolioUpload}
                    disabled={uploadingPhotos}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={uploadingPhotos}
                    onClick={() => document.getElementById('portfolio')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingPhotos ? "Uploading..." : "Upload Portfolio Photos"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload multiple photos to showcase your work
                </p>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
