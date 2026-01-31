import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FundRequest {
  id: string;
  deal_room_id: string;
  requested_by: string;
  requested_from_participant_id: string;
  requested_from_user_id: string;
  amount: number;
  currency: string;
  purpose: string;
  due_date: string | null;
  status: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  paid_amount: number | null;
  xdk_amount: number | null;
  xdk_tx_hash: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface UseFundRequestsOptions {
  dealRoomId?: string;
  status?: string;
  asRecipient?: boolean;
}

export function useFundRequests(options: UseFundRequestsOptions = {}) {
  const { dealRoomId, status, asRecipient } = options;

  return useQuery({
    queryKey: ["fund-requests", dealRoomId, status, asRecipient],
    queryFn: async (): Promise<FundRequest[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from("fund_contribution_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (dealRoomId) {
        query = query.eq("deal_room_id", dealRoomId);
      }

      if (status) {
        query = query.eq("status", status);
      }

      if (asRecipient) {
        query = query.eq("requested_from_user_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as FundRequest[];
    },
  });
}

export function usePendingFundRequests() {
  return useQuery({
    queryKey: ["pending-fund-requests"],
    queryFn: async (): Promise<FundRequest[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("fund_contribution_requests")
        .select("*")
        .eq("requested_from_user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as FundRequest[];
    },
  });
}
