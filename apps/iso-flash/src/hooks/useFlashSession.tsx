import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../../packages/supabase-client/src/client";
import type { Location } from "./useLocation";

interface CreateSessionParams {
  location: Location;
  photographerId: string;
  hourlyRate: number;
  deviceUsed: "client_phone" | "photographer_phone";
  allowPhotographerPortfolio: boolean;
  editingRequested: boolean;
  editingFee?: number;
}

export function useFlashSession() {
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: async ({ 
      location, 
      photographerId, 
      hourlyRate,
      deviceUsed,
      allowPhotographerPortfolio,
      editingRequested,
      editingFee
    }: CreateSessionParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("sessions")
        .insert({
          client_id: user.id,
          photographer_id: photographerId,
          location_lat: location.latitude,
          location_lng: location.longitude,
          hourly_rate: hourlyRate,
          status: "pending",
          device_used: deviceUsed,
          allow_photographer_portfolio: allowPhotographerPortfolio,
          editing_requested: editingRequested,
          editing_fee: editingFee,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  return { createSession };
}
