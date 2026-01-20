import { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PreFlightChecklist } from '@/components/trading/PreFlightChecklist';
import { CircuitBreakerLockout } from '@/components/trading/CircuitBreakerLockout';
import { MarketStatusBar } from '@/components/trading/MarketStatusBar';
import { ORBLevelDisplay } from '@/components/trading/ORBLevelDisplay';
import { RiskCalculator } from '@/components/trading/RiskCalculator';
import { SignalAlertPanel } from '@/components/trading/SignalAlertPanel';
import { ExecutionPanel } from '@/components/trading/ExecutionPanel';
import { LiveCandlestickChart } from '@/components/trading/LiveCandlestickChart';
import { useTradingSession } from '@/hooks/useTradingSession';
import { useMarketData } from '@/hooks/useMarketData';
import { Loader2 } from 'lucide-react';
import { PositionSizeResult } from '@/lib/trading/riskCalculator';
import { detectSignal, Signal } from '@/lib/trading/signalEngine';

export default function TradingExecution() {
  const { 
    session, 
    loading, 
    isLocked, 
    preflightCompleted,
    lossCount,
    lockedUntil,
    refresh
  } = useTradingSession();

  const {
    candles,
    currentPrice,
    orbLevels,
    isLoading: marketLoading,
  } = useMarketData({ symbol: 'SPY', autoRefresh: true });

  const [positionSize, setPositionSize] = useState<PositionSizeResult | null>(null);
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const symbol = 'SPY';

  // Run signal detection when candles update
  useEffect(() => {
    if (candles.length < 5 || !orbLevels) return;

    const lastCandles = candles.slice(-10);
    const currentCandle = lastCandles[lastCandles.length - 1];
    const previousCandles = lastCandles.slice(0, -1);

    const signal = detectSignal(
      currentCandle,
      previousCandles,
      orbLevels.orbHigh,
      orbLevels.orbLow,
      symbol
    );

    if (signal) {
      setCurrentSignal(signal);
      setDirection(signal.type === 'breakout_long' ? 'long' : 'short');
    }
  }, [candles, orbLevels, symbol]);

  if (loading || marketLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Show circuit breaker lockout
  if (isLocked && lockedUntil) {
    return <CircuitBreakerLockout lockedUntil={lockedUntil} lossCount={lossCount} />;
  }

  // Show pre-flight checklist
  if (!preflightCompleted) {
    return <PreFlightChecklist onComplete={refresh} />;
  }

  // Calculate stop loss based on ORB levels
  const stopLossPrice = direction === 'long' 
    ? (orbLevels?.orbLow || currentPrice - 0.50)
    : (orbLevels?.orbHigh || currentPrice + 0.50);

  const handleExecute = async () => {
    console.log('Executing trade with position size:', positionSize);
    // Trade execution logic would go here
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Trading Execution</h1>
                <p className="text-muted-foreground">Discipline Over Dopamine</p>
              </div>
            </div>

            {/* Market Status Bar */}
            <MarketStatusBar 
              lossCount={lossCount}
              dailyPnL={session?.daily_pnl || 0}
              isLocked={isLocked}
            />

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Left Column - Live Chart */}
              <div className="lg:col-span-2 space-y-4">
                <LiveCandlestickChart
                  candles={candles}
                  orbLevels={orbLevels}
                  currentPrice={currentPrice}
                  symbol={symbol}
                  isLoading={marketLoading}
                />

                {/* ORB Levels */}
                <ORBLevelDisplay
                  pmHigh={orbLevels?.pmHigh || null}
                  pmLow={orbLevels?.pmLow || null}
                  orbHigh={orbLevels?.orbHigh || null}
                  orbLow={orbLevels?.orbLow || null}
                  orbMidline={orbLevels?.orbMidline || null}
                  currentPrice={currentPrice}
                />
              </div>

              {/* Right Column - Trading Controls */}
              <div className="space-y-4">
                {/* Signal Alert */}
                <SignalAlertPanel signal={currentSignal} />

                {/* Risk Calculator */}
                <RiskCalculator
                  accountBalance={session?.account_balance || 2000}
                  entryPrice={currentPrice}
                  stopLossPrice={stopLossPrice}
                  direction={direction}
                  symbol={symbol}
                  onCalculationChange={setPositionSize}
                />

                {/* Execution Panel */}
                {positionSize && (
                  <ExecutionPanel
                    symbol={symbol}
                    direction={direction}
                    positionSize={positionSize}
                    isLocked={isLocked}
                    hasActivePosition={false}
                    onExecute={handleExecute}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
