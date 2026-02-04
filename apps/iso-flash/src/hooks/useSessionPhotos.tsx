import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSessionPhotos(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["session-photos", sessionId],
    queryFn: async () => {
      if (!sessionId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("id, photo_url, created_at, sender_id")
        .eq("session_id", sessionId)
        .not("photo_url", "is", null)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });
}
