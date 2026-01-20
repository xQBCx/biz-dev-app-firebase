import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { isCircuitBreakerTriggered, calculateLockoutEnd } from '@/lib/trading/circuitBreaker';

export interface TradingSession {
  id: string;
  user_id: string;
  session_date: string;
  account_balance: number;
  loss_count: number;
  is_locked: boolean;
  locked_until: string | null;
  preflight_completed: boolean;
  preflight_completed_at: string | null;
  preflight_calm_focused: boolean;
  preflight_loss_limit_defined: boolean;
  preflight_risk_accepted: boolean;
  pm_high: number | null;
  pm_low: number | null;
  orb_high: number | null;
  orb_low: number | null;
  orb_midline: number | null;
  orb_calculated_at: string | null;
  daily_pnl: number;
  trades_won: number;
  trades_lost: number;
  created_at: string;
  updated_at: string;
}

export function useTradingSession() {
  const { user } = useAuth();
  const [session, setSession] = useState<TradingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Fetch or create today's session
  const fetchOrCreateSession = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const today = getTodayDate();

      // Try to fetch existing session
      const { data: existingSession, error: fetchError } = await supabase
        .from('trading_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_date', today)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingSession) {
        setSession(existingSession as TradingSession);
      } else {
        // Create new session for today
        const { data: newSession, error: createError } = await supabase
          .from('trading_sessions')
          .insert({
            user_id: user.id,
            session_date: today,
            account_balance: 2000 // Default starting balance
          })
          .select()
          .single();

        if (createError) throw createError;
        setSession(newSession as TradingSession);
      }
    } catch (err: any) {
      console.error('Error fetching/creating trading session:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Complete pre-flight checklist
  const completePreflight = useCallback(async (
    calmFocused: boolean,
    lossLimitDefined: boolean,
    riskAccepted: boolean
  ) => {
    if (!session?.id) return false;

    try {
      const { data, error } = await supabase
        .from('trading_sessions')
        .update({
          preflight_completed: true,
          preflight_completed_at: new Date().toISOString(),
          preflight_calm_focused: calmFocused,
          preflight_loss_limit_defined: lossLimitDefined,
          preflight_risk_accepted: riskAccepted
        })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      setSession(data as TradingSession);
      return true;
    } catch (err: any) {
      console.error('Error completing preflight:', err);
      setError(err.message);
      return false;
    }
  }, [session?.id]);

  // Update ORB levels
  const updateORBLevels = useCallback(async (
    pmHigh: number,
    pmLow: number,
    orbHigh: number,
    orbLow: number,
    orbMidline: number
  ) => {
    if (!session?.id) return false;

    try {
      const { data, error } = await supabase
        .from('trading_sessions')
        .update({
          pm_high: pmHigh,
          pm_low: pmLow,
          orb_high: orbHigh,
          orb_low: orbLow,
          orb_midline: orbMidline,
          orb_calculated_at: new Date().toISOString()
        })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      setSession(data as TradingSession);
      return true;
    } catch (err: any) {
      console.error('Error updating ORB levels:', err);
      setError(err.message);
      return false;
    }
  }, [session?.id]);

  // Record a loss and check circuit breaker
  const recordLoss = useCallback(async () => {
    if (!session?.id) return false;

    try {
      const newLossCount = (session.loss_count || 0) + 1;
      const shouldLock = newLossCount >= 2;
      
      const updateData: any = {
        loss_count: newLossCount,
        trades_lost: (session.trades_lost || 0) + 1
      };

      if (shouldLock) {
        updateData.is_locked = true;
        updateData.locked_until = calculateLockoutEnd(24).toISOString();
      }

      const { data, error } = await supabase
        .from('trading_sessions')
        .update(updateData)
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      setSession(data as TradingSession);
      return shouldLock;
    } catch (err: any) {
      console.error('Error recording loss:', err);
      setError(err.message);
      return false;
    }
  }, [session]);

  // Record a win
  const recordWin = useCallback(async (pnl: number) => {
    if (!session?.id) return false;

    try {
      const { data, error } = await supabase
        .from('trading_sessions')
        .update({
          trades_won: (session.trades_won || 0) + 1,
          daily_pnl: (session.daily_pnl || 0) + pnl
        })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      setSession(data as TradingSession);
      return true;
    } catch (err: any) {
      console.error('Error recording win:', err);
      setError(err.message);
      return false;
    }
  }, [session]);

  // Update account balance
  const updateBalance = useCallback(async (newBalance: number) => {
    if (!session?.id) return false;

    try {
      const { data, error } = await supabase
        .from('trading_sessions')
        .update({ account_balance: newBalance })
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;
      setSession(data as TradingSession);
      return true;
    } catch (err: any) {
      console.error('Error updating balance:', err);
      setError(err.message);
      return false;
    }
  }, [session?.id]);

  // Computed values
  const canTrade = session ? 
    session.preflight_completed && 
    !isCircuitBreakerTriggered({
      lossCount: session.loss_count,
      isLocked: session.is_locked,
      lockedUntil: session.locked_until ? new Date(session.locked_until) : null,
      lockReason: null
    }) : false;

  const isLocked = session?.is_locked && session.locked_until 
    ? new Date(session.locked_until) > new Date() 
    : false;

  const orbReady = session?.orb_high !== null && session?.orb_low !== null;

  useEffect(() => {
    fetchOrCreateSession();
  }, [fetchOrCreateSession]);

  return {
    session,
    loading,
    error,
    canTrade,
    isLocked,
    orbReady,
    preflightCompleted: session?.preflight_completed || false,
    lossCount: session?.loss_count || 0,
    lockedUntil: session?.locked_until ? new Date(session.locked_until) : null,
    completePreflight,
    updateORBLevels,
    recordLoss,
    recordWin,
    updateBalance,
    refresh: fetchOrCreateSession
  };
}
