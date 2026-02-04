import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Types for Trading Command module
export type TradingSkillLevel = 'recruit' | 'trainee' | 'operator' | 'specialist' | 'commander' | 'strategist';
export type TradingSessionStatus = 'simulation' | 'live' | 'paused' | 'graduated';
export type TradeType = 'buy' | 'sell' | 'short' | 'cover';
export type TradeStatus = 'pending' | 'executed' | 'cancelled' | 'expired';
export type CapitalAllocationType = 'reinvest' | 'long_term_hold' | 'ecosystem_company' | 'co_investment' | 'company_formation' | 'withdrawal';

export interface TradingProfile {
  id: string;
  user_id: string;
  skill_level: TradingSkillLevel;
  session_status: TradingSessionStatus;
  risk_tolerance: number;
  max_position_size_percent: number;
  max_daily_loss_percent: number;
  max_weekly_loss_percent: number;
  simulation_start_date: string | null;
  simulation_capital: number;
  live_capital: number;
  total_simulated_pnl: number;
  total_live_pnl: number;
  graduation_criteria_met: boolean;
  graduation_date: string | null;
  preferred_strategies: string[];
  trading_hours: unknown;
  created_at: string;
  updated_at: string;
}

export interface TradingPlaybook {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  risk_level: number;
  min_skill_level: TradingSkillLevel;
  rules: unknown;
  entry_criteria: unknown;
  exit_criteria: unknown;
  position_sizing_rules: unknown;
  stop_loss_rules: unknown;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradingCurriculum {
  id: string;
  title: string;
  description: string | null;
  module_order: number;
  skill_level_required: TradingSkillLevel;
  content: unknown;
  learning_objectives: string[];
  practical_exercises: unknown;
  assessment_criteria: unknown;
  estimated_hours: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurriculumProgress {
  id: string;
  user_id: string;
  curriculum_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  started_at: string | null;
  completed_at: string | null;
  assessment_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradeJournalEntry {
  id: string;
  user_id: string;
  is_simulation: boolean;
  playbook_id: string | null;
  symbol: string;
  trade_type: TradeType;
  status: TradeStatus;
  entry_price: number | null;
  exit_price: number | null;
  shares: number;
  entry_time: string | null;
  exit_time: string | null;
  stop_loss_price: number | null;
  take_profit_price: number | null;
  realized_pnl: number | null;
  fees: number;
  rule_adherence_score: number | null;
  pre_trade_notes: string | null;
  post_trade_notes: string | null;
  lessons_learned: string | null;
  emotional_state: string | null;
  market_conditions: unknown;
  created_at: string;
  updated_at: string;
}

export interface PerformanceSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  is_simulation: boolean;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number | null;
  avg_winner: number | null;
  avg_loser: number | null;
  profit_factor: number | null;
  max_drawdown_percent: number | null;
  sharpe_ratio: number | null;
  rule_adherence_avg: number | null;
  capital_at_snapshot: number | null;
  daily_pnl: number | null;
  weekly_pnl: number | null;
  monthly_pnl: number | null;
  created_at: string;
}

export interface CapitalAllocation {
  id: string;
  user_id: string;
  allocation_type: CapitalAllocationType;
  amount: number;
  source_description: string | null;
  target_entity_id: string | null;
  target_entity_type: string | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'executed' | 'cancelled';
  approved_by: string | null;
  approved_at: string | null;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Skill level display config
export const skillLevelConfig: Record<TradingSkillLevel, { label: string; color: string; description: string }> = {
  recruit: { label: 'Recruit', color: 'bg-slate-500', description: 'Beginning your capital command training' },
  trainee: { label: 'Trainee', color: 'bg-blue-500', description: 'Learning the fundamentals of disciplined trading' },
  operator: { label: 'Operator', color: 'bg-green-500', description: 'Executing strategies with consistency' },
  specialist: { label: 'Specialist', color: 'bg-yellow-500', description: 'Mastering specific market conditions' },
  commander: { label: 'Commander', color: 'bg-orange-500', description: 'Leading capital operations with precision' },
  strategist: { label: 'Strategist', color: 'bg-purple-500', description: 'Architecting complex capital strategies' },
};

// Trading profile hooks
export function useTradingProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trading-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('trading_command_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as TradingProfile | null;
    },
    enabled: !!user?.id,
  });
}

export function useCreateTradingProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<TradingProfile>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trading_command_profiles')
        .insert({
          user_id: user.id,
          skill_level: profile.skill_level || 'recruit',
          session_status: profile.session_status || 'simulation',
          risk_tolerance: profile.risk_tolerance || 2,
          simulation_start_date: new Date().toISOString(),
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading-profile'] });
      toast.success('Trading profile created - Welcome, Recruit!');
    },
    onError: (error) => {
      toast.error('Failed to create trading profile');
      console.error('Trading profile creation error:', error);
    },
  });
}

export function useUpdateTradingProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<TradingProfile>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trading_command_profiles')
        .update(updates as any)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trading-profile'] });
      toast.success('Profile updated');
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    },
  });
}

// Playbook hooks
export function useTradingPlaybooks() {
  return useQuery({
    queryKey: ['trading-playbooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trading_playbooks')
        .select('*')
        .eq('is_active', true)
        .order('risk_level');

      if (error) throw error;
      return data as TradingPlaybook[];
    },
  });
}

// Curriculum hooks
export function useTradingCurriculum() {
  return useQuery({
    queryKey: ['trading-curriculum'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trading_curriculum')
        .select('*')
        .eq('is_active', true)
        .order('module_order');

      if (error) throw error;
      return data as TradingCurriculum[];
    },
  });
}

export function useCurriculumProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['curriculum-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('trading_curriculum_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as CurriculumProgress[];
    },
    enabled: !!user?.id,
  });
}

export function useUpdateCurriculumProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ curriculumId, status }: { curriculumId: string; status: CurriculumProgress['status'] }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const updates: any = {
        user_id: user.id,
        curriculum_id: curriculumId,
        status,
      };

      if (status === 'in_progress' && !updates.started_at) {
        updates.started_at = new Date().toISOString();
      }
      if (status === 'completed' || status === 'mastered') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('trading_curriculum_progress')
        .upsert(updates, { onConflict: 'user_id,curriculum_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum-progress'] });
      toast.success('Progress updated');
    },
    onError: (error) => {
      toast.error('Failed to update progress');
      console.error('Progress update error:', error);
    },
  });
}

// Trade journal hooks
export function useTradeJournal(isSimulation?: boolean) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trade-journal', user?.id, isSimulation],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('trading_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (isSimulation !== undefined) {
        query = query.eq('is_simulation', isSimulation);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TradeJournalEntry[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateTrade() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trade: Partial<TradeJournalEntry>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trading_journal')
        .insert({
          user_id: user.id,
          symbol: trade.symbol,
          trade_type: trade.trade_type,
          shares: trade.shares,
          is_simulation: trade.is_simulation ?? true,
          entry_price: trade.entry_price,
          stop_loss_price: trade.stop_loss_price,
          take_profit_price: trade.take_profit_price,
          playbook_id: trade.playbook_id,
          pre_trade_notes: trade.pre_trade_notes,
          entry_time: new Date().toISOString(),
          status: 'executed',
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-journal'] });
      toast.success('Trade logged');
    },
    onError: (error) => {
      toast.error('Failed to log trade');
      console.error('Trade creation error:', error);
    },
  });
}

export function useCloseTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tradeId, exitPrice, postTradeNotes, lessonsLearned }: { 
      tradeId: string; 
      exitPrice: number; 
      postTradeNotes?: string;
      lessonsLearned?: string;
    }) => {
      // First get the trade to calculate P&L
      const { data: trade, error: fetchError } = await supabase
        .from('trading_journal')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (fetchError) throw fetchError;

      const entryPrice = trade.entry_price || 0;
      const shares = trade.shares || 0;
      const isBuy = trade.trade_type === 'buy' || trade.trade_type === 'cover';
      const pnl = isBuy 
        ? (exitPrice - entryPrice) * shares 
        : (entryPrice - exitPrice) * shares;

      const { data, error } = await supabase
        .from('trading_journal')
        .update({
          exit_price: exitPrice,
          exit_time: new Date().toISOString(),
          realized_pnl: pnl,
          post_trade_notes: postTradeNotes,
          lessons_learned: lessonsLearned,
          status: 'executed',
        } as any)
        .eq('id', tradeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trade-journal'] });
      const pnl = (data as any).realized_pnl || 0;
      if (pnl >= 0) {
        toast.success(`Trade closed: +$${pnl.toFixed(2)}`);
      } else {
        toast.info(`Trade closed: -$${Math.abs(pnl).toFixed(2)}`);
      }
    },
    onError: (error) => {
      toast.error('Failed to close trade');
      console.error('Trade close error:', error);
    },
  });
}

// Performance hooks
export function usePerformanceSnapshots() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['performance-snapshots', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('trading_performance_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('snapshot_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as PerformanceSnapshot[];
    },
    enabled: !!user?.id,
  });
}

// Capital allocation hooks
export function useCapitalAllocations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['capital-allocations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('capital_allocations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CapitalAllocation[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateCapitalAllocation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (allocation: Partial<CapitalAllocation>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('capital_allocations')
        .insert({
          user_id: user.id,
          allocation_type: allocation.allocation_type,
          amount: allocation.amount,
          source_description: allocation.source_description,
          target_entity_id: allocation.target_entity_id,
          target_entity_type: allocation.target_entity_type,
          notes: allocation.notes,
          status: 'pending',
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['capital-allocations'] });
      toast.success('Capital allocation submitted for review');
    },
    onError: (error) => {
      toast.error('Failed to create allocation');
      console.error('Allocation creation error:', error);
    },
  });
}
