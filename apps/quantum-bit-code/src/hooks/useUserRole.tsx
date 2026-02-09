import { useQuery } from "@tanstack/react-query";
import { supabase } from "packages/supabase-client/src";

export const useUserRole = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!session?.user?.id,
  });

  return {
    isAdmin: isAdmin ?? false,
    isLoading,
    userId: session?.user?.id,
  };
};
