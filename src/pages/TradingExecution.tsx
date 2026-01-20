import { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { PreFlightChecklist } from '@/components/trading/PreFlightChecklist';
import { CircuitBreakerLockout } from '@/components/trading/CircuitBreakerLockout';
import { MarketStatusBar } from '@/components/trading/MarketStatusBar';
import { ORBLevelDisplay } from '@/components/trading/ORBLevelDisplay';
import { RiskCalculator } from '@/components/trading/RiskCalculator';
import { SignalAlertPanel } from '@/components/trading/SignalAlertPanel';
import { ExecutionPanel } from '@/components/trading/ExecutionPanel';
import { useTradingSession } from '@/hooks/useTradingSession';
import { Loader2 } from 'lucide-react';
import { calculatePositionSize, PositionSizeResult } from '@/lib/trading/riskCalculator';

export default function TradingExecution() {
  const { 
    session, 
    loading, 
    canTrade, 
    isLocked, 
    preflightCompleted,
    lossCount,
    lockedUntil,
    refresh
  } = useTradingSession();

  const [positionSize, setPositionSize] = useState<PositionSizeResult | null>(null);
  const [direction] = useState<'long' | 'short'>('long');
  const [symbol] = useState('SPY');

  // Demo current price (would come from market data API)
  const currentPrice = 478.50;

  if (loading) {
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
              {/* Left Column - Chart area placeholder */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-muted/30 border-2 border-dashed rounded-xl h-[400px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg font-medium">Live Chart</p>
                    <p className="text-sm">Connect Polygon.io API for real-time data</p>
                  </div>
                </div>

                {/* ORB Levels */}
                <ORBLevelDisplay
                  pmHigh={session?.pm_high || null}
                  pmLow={session?.pm_low || null}
                  orbHigh={session?.orb_high || null}
                  orbLow={session?.orb_low || null}
                  orbMidline={session?.orb_midline || null}
                  currentPrice={currentPrice}
                />
              </div>

              {/* Right Column - Trading Controls */}
              <div className="space-y-4">
                {/* Signal Alert */}
                <SignalAlertPanel signal={null} />

                {/* Risk Calculator */}
                <RiskCalculator
                  accountBalance={session?.account_balance || 2000}
                  entryPrice={currentPrice}
                  stopLossPrice={currentPrice - 0.50}
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
