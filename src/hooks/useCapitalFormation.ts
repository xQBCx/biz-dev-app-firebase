import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

// Types
export interface EquityStake {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  stake_type: string;
  ownership_percentage: number | null;
  share_count: number | null;
  vesting_schedule: {
    cliff_months?: number;
    vesting_months?: number;
    vested_percentage?: number;
  } | null;
  acquisition_date: string | null;
  acquisition_cost: number | null;
  current_valuation: number | null;
  status: string;
  xodiak_anchor_hash: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CapitalInvestment {
  id: string;
  user_id: string;
  equity_stake_id: string | null;
  investment_type: string;
  amount: number;
  share_price: number | null;
  shares_acquired: number | null;
  instrument: string | null;
  transaction_date: string;
  notes: string | null;
  xodiak_anchor_hash: string | null;
  created_at: string;
}

export interface OwnershipEvent {
  id: string;
  user_id: string;
  equity_stake_id: string | null;
  event_type: string;
  amount: number | null;
  share_count: number | null;
  description: string | null;
  event_date: string;
  xodiak_anchor_hash: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PortfolioSummary {
  user_id: string;
  total_positions: number;
  active_positions: number;
  total_invested: number;
  total_current_value: number;
  total_unrealized_gain: number;
  total_return_percentage: number;
}

// Equity Stakes
export const useEquityStakes = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['equity-stakes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equity_stakes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EquityStake[];
    },
    enabled: !!user,
  });
};

export const useCreateEquityStake = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      entity_type: string;
      entity_id: string;
      entity_name: string;
      stake_type: string;
      ownership_percentage?: number;
      share_count?: number;
      vesting_schedule?: Record<string, unknown>;
      acquisition_date?: string;
      acquisition_cost?: number;
      current_valuation?: number;
    }) => {
      const { error } = await supabase
        .from('equity_stakes')
        .insert([{
          user_id: user!.id,
          entity_type: data.entity_type,
          entity_id: data.entity_id,
          entity_name: data.entity_name,
          stake_type: data.stake_type,
          ownership_percentage: data.ownership_percentage,
          share_count: data.share_count,
          vesting_schedule: data.vesting_schedule as Record<string, unknown>,
          acquisition_date: data.acquisition_date,
          acquisition_cost: data.acquisition_cost,
          current_valuation: data.current_valuation,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equity-stakes'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
      toast({ title: "Equity Stake Added", description: "New position has been recorded." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateEquityStake = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, current_valuation }: { 
      id: string; 
      status?: string;
      current_valuation?: number;
    }) => {
      const { error } = await supabase
        .from('equity_stakes')
        .update({ 
          status, 
          current_valuation,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equity-stakes'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-summary'] });
      toast({ title: "Equity Stake Updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

  return useQuery({
    queryKey: ['capital-investments', user?.id, equityStakeId],
    queryFn: async () => {
      let query = supabase
        .from('capital_investments')
        .select('*')
        .eq('user_id', user!.id)
        .order('transaction_date', { ascending: false });

      if (equityStakeId) {
        query = query.eq('equity_stake_id', equityStakeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CapitalInvestment[];
    },
    enabled: !!user,
  });
};

export const useCreateCapitalInvestment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      equity_stake_id?: string;
      investment_type: string;
      amount: number;
      share_price?: number;
      shares_acquired?: number;
      instrument?: string;
      transaction_date: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('capital_investments')
        .insert([{
          user_id: user!.id,
          equity_stake_id: data.equity_stake_id,
          investment_type: data.investment_type,
          amount: data.amount,
          share_price: data.share_price,
          shares_acquired: data.shares_acquired,
          instrument: data.instrument,
          transaction_date: data.transaction_date,
          notes: data.notes,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capital-investments'] });
      queryClient.invalidateQueries({ queryKey: ['equity-stakes'] });
      toast({ title: "Investment Recorded", description: "Capital investment has been logged." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Ownership Events
export const useOwnershipEvents = (equityStakeId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ownership-events', user?.id, equityStakeId],
    queryFn: async () => {
      let query = supabase
        .from('ownership_events')
        .select('*')
        .eq('user_id', user!.id)
        .order('event_date', { ascending: false });

      if (equityStakeId) {
        query = query.eq('equity_stake_id', equityStakeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OwnershipEvent[];
    },
    enabled: !!user,
  });
};

export const useCreateOwnershipEvent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      equity_stake_id?: string;
      event_type: string;
      amount?: number;
      share_count?: number;
      description?: string;
      event_date: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { error } = await supabase
        .from('ownership_events')
        .insert([{
          user_id: user!.id,
          equity_stake_id: data.equity_stake_id,
          event_type: data.event_type,
          amount: data.amount,
          share_count: data.share_count,
          description: data.description,
          event_date: data.event_date,
          metadata: (data.metadata || {}) as Record<string, unknown>,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownership-events'] });
      queryClient.invalidateQueries({ queryKey: ['equity-stakes'] });
      toast({ title: "Event Recorded", description: "Ownership event has been logged." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Portfolio Summary
export const usePortfolioSummary = () => {
  const { data: stakes } = useEquityStakes();
  const { data: investments } = useCapitalInvestments();
  const { data: events } = useOwnershipEvents();

  const activeStakes = stakes?.filter(s => ['active', 'vesting', 'fully_vested'].includes(s.status)) || [];
  const totalInvested = stakes?.reduce((sum, s) => sum + (s.acquisition_cost || 0), 0) || 0;
  const totalCurrentValue = stakes?.reduce((sum, s) => sum + (s.current_valuation || 0), 0) || 0;
  const totalDividends = events?.filter(e => e.event_type === 'dividend').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  return {
    totalPositions: stakes?.length || 0,
    activePositions: activeStakes.length,
    totalInvested,
    totalCurrentValue,
    unrealizedGain: totalCurrentValue - totalInvested,
    totalDividends,
    returnPercentage: totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0,
    stakes,
    investments,
    events,
  };
};
