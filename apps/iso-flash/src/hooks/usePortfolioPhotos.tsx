import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePortfolioPhotos(photographerId: string | undefined) {
  return useQuery({
    queryKey: ["portfolio-photos", photographerId],
    queryFn: async () => {
      if (!photographerId) return [];

      const { data, error } = await supabase
        .from("portfolio_photos")
        .select("*")
        .eq("photographer_id", photographerId)
        .order("display_order", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!photographerId,
  });
}
