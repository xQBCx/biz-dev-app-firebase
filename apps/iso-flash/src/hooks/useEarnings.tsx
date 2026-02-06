import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../../packages/supabase-client/src/client";

export interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  completedSessions: number;
  averageEarnings: number;
  transactions: Array<{
    id: string;
    clientName: string;
    amount: number;
    date: string;
    duration: number;
  }>;
}

export function useEarnings(photographerId?: string) {
  return useQuery({
    queryKey: ["earnings", photographerId],
    queryFn: async (): Promise<EarningsData> => {
      if (!photographerId) {
        return {
          totalEarnings: 0,
          monthlyEarnings: 0,
          weeklyEarnings: 0,
          completedSessions: 0,
          averageEarnings: 0,
          transactions: [],
        };
      }

      const { data: sessions, error } = await supabase
        .from("sessions")
        .select("*, client:profiles!client_id(*)")
        .eq("photographer_id", photographerId)
        .eq("status", "completed")
        .order("ended_at", { ascending: false });

      if (error) throw error;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const totalEarnings = sessions?.reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
      const monthlyEarnings = sessions?.filter(s => new Date(s.ended_at) >= startOfMonth)
        .reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
      const weeklyEarnings = sessions?.filter(s => new Date(s.ended_at) >= startOfWeek)
        .reduce((sum, s) => sum + (s.total_amount || 0), 0) || 0;
      const completedSessions = sessions?.length || 0;
      const averageEarnings = completedSessions > 0 ? totalEarnings / completedSessions : 0;

      const transactions = sessions?.map(s => ({
        id: s.id,
        clientName: s.client?.full_name || "Client",
        amount: s.total_amount || 0,
        date: s.ended_at,
        duration: s.duration_minutes || 0,
      })) || [];

      return {
        totalEarnings,
        monthlyEarnings,
        weeklyEarnings,
        completedSessions,
        averageEarnings,
        transactions,
      };
    },
    enabled: !!photographerId,
  });
}
