// Signal Detection Engine - Breakout + VPA + Risk Check
import { MarketBar, isRegularSession, getESTTime } from './marketTimeUtils';

export interface Signal {
  type: 'breakout_long' | 'breakout_short' | 'anomaly';
  symbol: string;
  candle: MarketBar;
  orbLine: number;
  avgVolume3: number;
  volumeRatio: number;
  distanceToStop: number;
  isValid: boolean;
  rejectionReasons: string[];
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface SignalValidationResult {
  conditionA: { passed: boolean; reason?: string };
  conditionB: { passed: boolean; reason?: string };
  conditionC: { passed: boolean; reason?: string };
  overallValid: boolean;
  isAnomaly: boolean;
  anomalyReason?: string;
}

// Constants for validation
const MAX_STOP_DISTANCE = 0.60; // $0.60 max stop distance for indices
const MIN_VOLUME_RATIO = 1.0; // Volume must be > average

// Check if candle is a valid breakout (Condition A)
export function checkBreakout(
  candle: MarketBar,
  orbHigh: number,
  orbLow: number
): { direction: 'long' | 'short' | null; passed: boolean; reason?: string } {
  // Long: Candle CLOSE is > ORB_High (body close, not wicks)
  if (candle.close > orbHigh) {
    return { direction: 'long', passed: true };
  }
  
  // Short: Candle CLOSE is < ORB_Low
  if (candle.close < orbLow) {
    return { direction: 'short', passed: true };
  }

  return { 
    direction: null, 
    passed: false, 
    reason: `Price ${candle.close.toFixed(2)} within ORB range (${orbLow.toFixed(2)} - ${orbHigh.toFixed(2)})`
  };
}

// Check Volume Price Analysis (Condition B)
export function checkVPA(
  currentVolume: number,
  previousVolume: number,
  avgVolume3: number,
  priceChange: number
): { passed: boolean; volumeRatio: number; isAnomaly: boolean; reason?: string; anomalyReason?: string } {
  const volumeRatio = currentVolume / avgVolume3;
  
  // Volume must be greater than average of last 3 candles
  if (volumeRatio <= MIN_VOLUME_RATIO) {
    return {
      passed: false,
      volumeRatio,
      isAnomaly: false,
      reason: `Volume ratio ${volumeRatio.toFixed(2)}x below threshold (need >1.0x)`
    };
  }

  // VPA Anomaly: Price rises but volume is lower than previous candle
  if (priceChange > 0 && currentVolume < previousVolume) {
    return {
      passed: false,
      volumeRatio,
      isAnomaly: true,
      reason: 'VPA Anomaly detected',
      anomalyReason: 'ANOMALY - DO NOT TRADE: Price rising on declining volume'
    };
  }

  // VPA Anomaly: Price falls but volume is lower than previous candle (weak sellers)
  if (priceChange < 0 && currentVolume < previousVolume) {
    return {
      passed: false,
      volumeRatio,
      isAnomaly: true,
      reason: 'VPA Anomaly detected',
      anomalyReason: 'ANOMALY - DO NOT TRADE: Price falling on declining volume'
    };
  }

  return {
    passed: true,
    volumeRatio,
    isAnomaly: false
  };
}

// Check Risk Distance (Condition C)
export function checkRiskDistance(
  entryPrice: number,
  orbLine: number,
  direction: 'long' | 'short'
): { passed: boolean; distance: number; reason?: string } {
  const distance = Math.abs(entryPrice - orbLine);
  
  if (distance > MAX_STOP_DISTANCE) {
    return {
      passed: false,
      distance,
      reason: `Stop too wide ($${distance.toFixed(2)}). Wait for pullback. Max: $${MAX_STOP_DISTANCE}`
    };
  }

  return {
    passed: true,
    distance
  };
}

// Calculate average volume of last N candles
export function calculateAvgVolume(bars: MarketBar[], count: number = 3): number {
  if (bars.length < count) return 0;
  const lastN = bars.slice(-count);
  return lastN.reduce((sum, bar) => sum + bar.volume, 0) / count;
}

// Main signal detection function
export function detectSignal(
  currentCandle: MarketBar,
  previousCandles: MarketBar[],
  orbHigh: number,
  orbLow: number,
  symbol: string
): Signal | null {
  // Only generate signals during regular session (after 09:45)
  if (!isRegularSession(currentCandle.timestamp)) {
    return null;
  }

  // Need at least 3 previous candles for VPA
  if (previousCandles.length < 3) {
    return null;
  }

  const rejectionReasons: string[] = [];
  let isAnomaly = false;
  let anomalyReason: string | undefined;

  // Condition A: Breakout Check
  const breakout = checkBreakout(currentCandle, orbHigh, orbLow);
  if (!breakout.passed || !breakout.direction) {
    return null; // No signal if not a breakout
  }

  const orbLine = breakout.direction === 'long' ? orbHigh : orbLow;
  
  // Condition B: VPA Check
  const avgVolume3 = calculateAvgVolume(previousCandles, 3);
  const previousCandle = previousCandles[previousCandles.length - 1];
  const priceChange = currentCandle.close - currentCandle.open;
  
  const vpa = checkVPA(
    currentCandle.volume,
    previousCandle.volume,
    avgVolume3,
    priceChange
  );

  if (!vpa.passed) {
    rejectionReasons.push(vpa.reason || 'VPA check failed');
  }
  if (vpa.isAnomaly) {
    isAnomaly = true;
    anomalyReason = vpa.anomalyReason;
  }

  // Condition C: Risk Distance Check
  const riskCheck = checkRiskDistance(currentCandle.close, orbLine, breakout.direction);
  if (!riskCheck.passed) {
    rejectionReasons.push(riskCheck.reason || 'Risk check failed');
  }

  // Determine if signal is valid
  const isValid = breakout.passed && vpa.passed && riskCheck.passed && !isAnomaly;

  return {
    type: isAnomaly ? 'anomaly' : (breakout.direction === 'long' ? 'breakout_long' : 'breakout_short'),
    symbol,
    candle: currentCandle,
    orbLine,
    avgVolume3,
    volumeRatio: vpa.volumeRatio,
    distanceToStop: riskCheck.distance,
    isValid,
    rejectionReasons,
    isAnomaly,
    anomalyReason
  };
}

// Validate a signal with detailed breakdown
export function validateSignal(
  candle: MarketBar,
  previousCandles: MarketBar[],
  orbHigh: number,
  orbLow: number
): SignalValidationResult {
  const breakout = checkBreakout(candle, orbHigh, orbLow);
  
  let conditionA = { passed: breakout.passed, reason: breakout.reason };
  let conditionB = { passed: false, reason: 'Insufficient candle history' };
  let conditionC = { passed: false, reason: 'No breakout direction' };
  let isAnomaly = false;
  let anomalyReason: string | undefined;

  if (previousCandles.length >= 3) {
    const avgVolume3 = calculateAvgVolume(previousCandles, 3);
    const previousCandle = previousCandles[previousCandles.length - 1];
    const priceChange = candle.close - candle.open;
    
    const vpa = checkVPA(candle.volume, previousCandle.volume, avgVolume3, priceChange);
    conditionB = { passed: vpa.passed, reason: vpa.reason };
    isAnomaly = vpa.isAnomaly;
    anomalyReason = vpa.anomalyReason;
  }

  if (breakout.direction) {
    const orbLine = breakout.direction === 'long' ? orbHigh : orbLow;
    const riskCheck = checkRiskDistance(candle.close, orbLine, breakout.direction);
    conditionC = { passed: riskCheck.passed, reason: riskCheck.reason };
  }

  return {
    conditionA,
    conditionB,
    conditionC,
    overallValid: conditionA.passed && conditionB.passed && conditionC.passed && !isAnomaly,
    isAnomaly,
    anomalyReason
  };
}
