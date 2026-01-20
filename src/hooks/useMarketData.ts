import { useState, useEffect, useCallback, useMemo } from 'react';
import { MarketBar, ORBLevels, getCurrentEST, isPreMarket, isNoTradeZone, isRegularSession, getMarketStatus } from '@/lib/trading/marketTimeUtils';
import { 
  generateHistoricalCandles, 
  calculateMockORBLevels, 
  simulateNextCandle,
  simulatePriceTick,
  getCurrentMockPrice 
} from '@/lib/trading/mockMarketDataService';

export interface MarketDataState {
  candles: MarketBar[];
  currentPrice: number;
  orbLevels: ORBLevels | null;
  marketStatus: ReturnType<typeof getMarketStatus>;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date;
}

export interface UseMarketDataOptions {
  symbol?: string;
  intervalMinutes?: number;
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

export function useMarketData(options: UseMarketDataOptions = {}) {
  const {
    symbol = 'SPY',
    intervalMinutes = 5,
    autoRefresh = true,
    refreshIntervalMs = 5000, // Update every 5 seconds
  } = options;

  const [state, setState] = useState<MarketDataState>({
    candles: [],
    currentPrice: 0,
    orbLevels: null,
    marketStatus: 'closed',
    isLoading: true,
    error: null,
    lastUpdate: new Date(),
  });

  // Initialize with historical data
  const initializeData = useCallback(() => {
    try {
      const candles = generateHistoricalCandles(symbol, intervalMinutes);
      const orbLevels = calculateMockORBLevels(candles);
      const currentPrice = getCurrentMockPrice(candles);
      const marketStatus = getMarketStatus();

      setState({
        candles,
        currentPrice,
        orbLevels,
        marketStatus,
        isLoading: false,
        error: null,
        lastUpdate: new Date(),
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load market data',
      }));
    }
  }, [symbol, intervalMinutes]);

  // Simulate price updates
  const updatePrice = useCallback(() => {
    setState(prev => {
      if (prev.candles.length === 0) return prev;

      const newPrice = simulatePriceTick(prev.currentPrice, symbol);
      const marketStatus = getMarketStatus();

      // Every minute, potentially add a new candle
      const now = getCurrentEST();
      const lastCandle = prev.candles[prev.candles.length - 1];
      const timeSinceLastCandle = now.getTime() - lastCandle.timestamp.getTime();
      
      let newCandles = prev.candles;
      if (timeSinceLastCandle >= intervalMinutes * 60 * 1000) {
        const newCandle = simulateNextCandle(lastCandle, symbol);
        newCandles = [...prev.candles.slice(-100), newCandle]; // Keep last 100 candles
      }

      return {
        ...prev,
        candles: newCandles,
        currentPrice: newPrice,
        marketStatus,
        lastUpdate: new Date(),
      };
    });
  }, [symbol, intervalMinutes]);

  // Initialize on mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Auto-refresh price updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(updatePrice, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalMs, updatePrice]);

  // Refresh data manually
  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    initializeData();
  }, [initializeData]);

  // Computed values
  const computed = useMemo(() => {
    const { candles, currentPrice, orbLevels } = state;
    
    if (!orbLevels) {
      return {
        priceVsORBHigh: 0,
        priceVsORBLow: 0,
        priceVsMidline: 0,
        isAboveORBHigh: false,
        isBelowORBLow: false,
        orbRange: 0,
        orbRangePercent: 0,
      };
    }

    const orbRange = orbLevels.orbHigh - orbLevels.orbLow;
    const orbMidpoint = (orbLevels.orbHigh + orbLevels.orbLow) / 2;

    return {
      priceVsORBHigh: currentPrice - orbLevels.orbHigh,
      priceVsORBLow: currentPrice - orbLevels.orbLow,
      priceVsMidline: currentPrice - orbLevels.orbMidline,
      isAboveORBHigh: currentPrice > orbLevels.orbHigh,
      isBelowORBLow: currentPrice < orbLevels.orbLow,
      orbRange,
      orbRangePercent: (orbRange / orbMidpoint) * 100,
    };
  }, [state]);

  return {
    ...state,
    ...computed,
    refresh,
    isPreMarket: isPreMarket(),
    isNoTradeZone: isNoTradeZone(),
    isRegularSession: isRegularSession(),
  };
}
