import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../packages/supabase-client/src/client";
import { toast } from "sonner";

export function useSessionPhotos(sessionId?: string) {
  return useQuery({
    queryKey: ["session-photos", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];

      const { data, error } = await supabase
        .from("session_photos")
        .select("*")
        .eq("session_id", sessionId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!sessionId,
  });
}

export function usePhotosNeedingEdit(photographerId?: string) {
  return useQuery({
    queryKey: ["photos-needing-edit", photographerId],
    queryFn: async () => {
      if (!photographerId) return [];

      const { data, error } = await supabase
        .from("session_photos")
        .select("*, session:sessions!inner(*, client:profiles!client_id(*))")
        .eq("session.photographer_id", photographerId)
        .eq("session.editing_requested", true)
        .in("editing_status", ["pending_edit", "in_progress"])
        .order("uploaded_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!photographerId,
  });
}

export function useUploadEditedPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, editedFile }: { photoId: string; editedFile: File }) => {
      // Upload edited photo to storage
      const fileExt = editedFile.name.split(".").pop();
      const filePath = `edited/${photoId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("session-photos")
        .upload(filePath, editedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("session-photos")
        .getPublicUrl(filePath);

      // Update photo record
      const { error: updateError } = await supabase
        .from("session_photos")
        .update({
          edited_url: publicUrl,
          editing_status: "completed",
          edited_at: new Date().toISOString(),
        })
        .eq("id", photoId);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-photos"] });
      queryClient.invalidateQueries({ queryKey: ["photos-needing-edit"] });
      toast.success("Edited photo uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to upload edited photo: " + error.message);
    },
  });
}

export function useApproveEditedPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from("session_photos")
        .update({
          client_approved: true,
          approved_at: new Date().toISOString(),
        })
        .eq("id", photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-photos"] });
      toast.success("Photo approved!");
    },
    onError: (error: Error) => {
      toast.error("Failed to approve photo: " + error.message);
    },
  });
}

export function useUpdateEditingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, status }: { photoId: string; status: string }) => {
      const { error } = await supabase
        .from("session_photos")
        .update({ editing_status: status })
        .eq("id", photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-photos"] });
      queryClient.invalidateQueries({ queryKey: ["photos-needing-edit"] });
    },
  });
}
