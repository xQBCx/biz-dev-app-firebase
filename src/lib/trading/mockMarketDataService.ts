// Mock Market Data Service - Generates realistic OHLCV data for testing
// Will be replaced by Polygon.io API when ready

import { MarketBar, ORBLevels, calculatePMHighLow, calculateORB, getCurrentEST, toEST } from './marketTimeUtils';

export interface MockMarketDataConfig {
  symbol: string;
  basePrice: number;
  volatility: number; // Percentage volatility (e.g., 0.5 for 0.5%)
}

const DEFAULT_CONFIGS: Record<string, MockMarketDataConfig> = {
  SPY: { symbol: 'SPY', basePrice: 478.50, volatility: 0.3 },
  QQQ: { symbol: 'QQQ', basePrice: 412.25, volatility: 0.4 },
  IWM: { symbol: 'IWM', basePrice: 198.75, volatility: 0.5 },
};

// Generate a random price movement
function generatePriceMove(currentPrice: number, volatility: number): number {
  const change = currentPrice * (volatility / 100) * (Math.random() - 0.5) * 2;
  return change;
}

// Generate a single candle
function generateCandle(
  timestamp: Date,
  prevClose: number,
  volatility: number,
  volumeMultiplier: number = 1
): MarketBar {
  const open = prevClose + generatePriceMove(prevClose, volatility * 0.3);
  const move1 = generatePriceMove(open, volatility);
  const move2 = generatePriceMove(open, volatility);
  const close = open + generatePriceMove(open, volatility);
  
  const high = Math.max(open, close, open + Math.abs(move1), open + Math.abs(move2));
  const low = Math.min(open, close, open - Math.abs(move1), open - Math.abs(move2));
  
  // Volume varies throughout the day - higher at open and close
  const baseVolume = 500000 + Math.random() * 1000000;
  const volume = Math.floor(baseVolume * volumeMultiplier);
  
  return {
    timestamp,
    open: parseFloat(open.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    close: parseFloat(close.toFixed(2)),
    volume,
    vwap: parseFloat(((high + low + close) / 3).toFixed(2)),
  };
}

// Generate historical candles for today's session
export function generateHistoricalCandles(
  symbol: string = 'SPY',
  intervalMinutes: number = 5
): MarketBar[] {
  const config = DEFAULT_CONFIGS[symbol] || DEFAULT_CONFIGS.SPY;
  const candles: MarketBar[] = [];
  const now = getCurrentEST();
  
  // Start from 4:00 AM EST (pre-market)
  const startTime = new Date(now);
  startTime.setHours(4, 0, 0, 0);
  
  // Current hour in EST
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  let prevClose = config.basePrice;
  let currentTime = new Date(startTime);
  
  while (currentTime <= now) {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    
    // Skip if we're past current time
    if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
      break;
    }
    
    // Determine volume multiplier based on time of day
    let volumeMultiplier = 1;
    if (hour < 9 || (hour === 9 && minute < 30)) {
      // Pre-market - lower volume
      volumeMultiplier = 0.3;
    } else if (hour === 9 && minute >= 30 && minute < 45) {
      // Opening 15 minutes - highest volume
      volumeMultiplier = 3;
    } else if (hour === 9 || hour === 10) {
      // First hour - high volume
      volumeMultiplier = 2;
    } else if (hour >= 15 && minute >= 30) {
      // Last 30 minutes - high volume
      volumeMultiplier = 2.5;
    }
    
    const candle = generateCandle(new Date(currentTime), prevClose, config.volatility, volumeMultiplier);
    candles.push(candle);
    prevClose = candle.close;
    
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
  }
  
  return candles;
}

// Generate pre-market candles (4:00 AM - 9:30 AM EST)
export function generatePreMarketCandles(
  symbol: string = 'SPY',
  intervalMinutes: number = 5
): MarketBar[] {
  const config = DEFAULT_CONFIGS[symbol] || DEFAULT_CONFIGS.SPY;
  const candles: MarketBar[] = [];
  const now = getCurrentEST();
  
  const startTime = new Date(now);
  startTime.setHours(4, 0, 0, 0);
  
  const endTime = new Date(now);
  endTime.setHours(9, 30, 0, 0);
  
  let prevClose = config.basePrice;
  let currentTime = new Date(startTime);
  
  while (currentTime < endTime && currentTime <= now) {
    const candle = generateCandle(new Date(currentTime), prevClose, config.volatility * 0.7, 0.3);
    candles.push(candle);
    prevClose = candle.close;
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
  }
  
  return candles;
}

// Calculate ORB levels from mock data
export function calculateMockORBLevels(candles: MarketBar[]): ORBLevels | null {
  if (candles.length === 0) return null;
  
  const pmLevels = calculatePMHighLow(candles);
  const orbLevels = calculateORB(candles);
  
  if (!pmLevels) {
    // Generate reasonable PM levels if not enough data
    const lastCandle = candles[candles.length - 1];
    const spread = lastCandle.close * 0.005; // 0.5% spread
    return {
      pmHigh: lastCandle.high + spread,
      pmLow: lastCandle.low - spread,
      orbHigh: lastCandle.high,
      orbLow: lastCandle.low,
      orbMidline: (lastCandle.high + lastCandle.low) / 2,
      calculatedAt: new Date(),
    };
  }
  
  return {
    pmHigh: pmLevels.pmHigh,
    pmLow: pmLevels.pmLow,
    orbHigh: orbLevels?.orbHigh || pmLevels.pmHigh,
    orbLow: orbLevels?.orbLow || pmLevels.pmLow,
    orbMidline: orbLevels?.orbMidline || (pmLevels.pmHigh + pmLevels.pmLow) / 2,
    calculatedAt: new Date(),
  };
}

// Simulate real-time price updates
export function simulateNextCandle(
  lastCandle: MarketBar,
  symbol: string = 'SPY'
): MarketBar {
  const config = DEFAULT_CONFIGS[symbol] || DEFAULT_CONFIGS.SPY;
  const now = getCurrentEST();
  
  // Determine volume multiplier based on current time
  const hour = now.getHours();
  const minute = now.getMinutes();
  let volumeMultiplier = 1;
  
  if (hour < 9 || (hour === 9 && minute < 30)) {
    volumeMultiplier = 0.3;
  } else if (hour === 9 && minute >= 30) {
    volumeMultiplier = 2.5;
  } else if (hour >= 15 && minute >= 30) {
    volumeMultiplier = 2;
  }
  
  return generateCandle(now, lastCandle.close, config.volatility, volumeMultiplier);
}

// Get current mock price
export function getCurrentMockPrice(candles: MarketBar[]): number {
  if (candles.length === 0) return 478.50;
  return candles[candles.length - 1].close;
}

// Simulate price tick (smaller update than full candle)
export function simulatePriceTick(
  currentPrice: number,
  symbol: string = 'SPY'
): number {
  const config = DEFAULT_CONFIGS[symbol] || DEFAULT_CONFIGS.SPY;
  const tickSize = 0.01;
  const ticks = Math.floor(Math.random() * 5) - 2; // -2 to +2 ticks
  return parseFloat((currentPrice + ticks * tickSize + generatePriceMove(currentPrice, config.volatility * 0.1)).toFixed(2));
}
