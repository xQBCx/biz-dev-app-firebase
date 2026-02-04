import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUserApproval = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: approvalStatus, isLoading } = useQuery({
    queryKey: ["userApproval", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { isApproved: false, profile: null };

      const { data, error } = await supabase
        .from("profiles")
        .select("is_approved, approved_at, full_name")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking approval status:", error);
        return { isApproved: false, profile: null };
      }

      // If no profile exists, user is not approved
      if (!data) {
        return { isApproved: false, profile: null };
      }

      return {
        isApproved: data.is_approved ?? false,
        profile: data,
      };
    },
    enabled: !!session?.user?.id,
  });

  return {
    isApproved: approvalStatus?.isApproved ?? false,
    profile: approvalStatus?.profile ?? null,
    isLoading,
    userId: session?.user?.id,
    isAuthenticated: !!session?.user?.id,
  };
};
