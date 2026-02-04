import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Location } from "./useLocation";

interface CreateBookingParams {
  location: Location;
  photographerId: string;
  hourlyRate: number;
  scheduledAt: Date;
  deviceUsed: "client_phone" | "photographer_phone";
  allowPhotographerPortfolio: boolean;
  editingRequested: boolean;
  editingFee?: number;
}

export function useBooking() {
  const queryClient = useQueryClient();

  const createBooking = useMutation({
    mutationFn: async ({ 
      location, 
      photographerId, 
      hourlyRate,
      scheduledAt,
      deviceUsed,
      allowPhotographerPortfolio,
      editingRequested,
      editingFee
    }: CreateBookingParams) => {
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
          status: "scheduled",
          scheduled_at: scheduledAt.toISOString(),
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
      queryClient.invalidateQueries({ queryKey: ["scheduled-sessions"] });
    },
  });

  return { createBooking };
}

export function useScheduledSessions(userId?: string) {
  return useQuery({
    queryKey: ["scheduled-sessions", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("sessions")
        .select("*, photographer:profiles!photographer_id(*), client:profiles!client_id(*)")
        .or(`client_id.eq.${userId},photographer_id.eq.${userId}`)
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}
