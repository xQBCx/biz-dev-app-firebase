import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatPrice, PositionSizeResult } from '@/lib/trading/riskCalculator';
import { isNoTradeZone, getMarketStatus } from '@/lib/trading/marketTimeUtils';

interface ExecutionPanelProps {
  symbol: string;
  direction: 'long' | 'short';
  positionSize: PositionSizeResult;
  isLocked: boolean;
  hasActivePosition: boolean;
  onExecute: () => Promise<void>;
}

export function ExecutionPanel({
  symbol,
  direction,
  positionSize,
  isLocked,
  hasActivePosition,
  onExecute
}: ExecutionPanelProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  
  const inNoTradeZone = isNoTradeZone();
  const marketStatus = getMarketStatus();
  
  const canExecute = 
    positionSize.isValid && 
    !isLocked && 
    !inNoTradeZone && 
    !hasActivePosition &&
    marketStatus === 'open';

  const getDisabledReason = () => {
    if (isLocked) return 'Circuit breaker active - trading locked';
    if (inNoTradeZone) return 'Market settling. Wait for ORB formation.';
    if (marketStatus === 'closed') return 'Market is closed';
    if (marketStatus === 'pre-market') return 'Wait for regular session';
    if (hasActivePosition) return 'Close current position first';
    if (!positionSize.isValid) return 'Fix position size errors';
    return '';
  };

  const handleExecute = async () => {
    if (!canExecute) return;
    
    setIsExecuting(true);
    try {
      await onExecute();
    } finally {
      setIsExecuting(false);
    }
  };

  const isLong = direction === 'long';

  return (
    <Card className={`border-2 ${isLong ? 'border-green-500/30' : 'border-red-500/30'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLong ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <span>{isLong ? 'Long' : 'Short'} Execution</span>
          </div>
          <Badge variant="outline">{symbol}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Shares</span>
            <span className="text-2xl font-bold">{positionSize.shares}</span>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Entry</span>
              <div className="font-semibold">${formatPrice(positionSize.entryPrice)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Stop Loss</span>
              <div className="font-semibold text-red-500">${formatPrice(positionSize.stopLossPrice)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Target 1</span>
              <div className="font-semibold text-green-500">${formatPrice(positionSize.target1Price)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Risk Amount</span>
              <div className="font-semibold">{formatCurrency(positionSize.maxRiskAmount)}</div>
            </div>
          </div>
        </div>

        {/* Exit Plan Reminder */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-primary mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium text-sm">Automated Exit Plan</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Target 1: Sell {positionSize.target1Shares} shares at ${formatPrice(positionSize.target1Price)}</li>
            <li>• After T1: Move stop to breakeven (${formatPrice(positionSize.entryPrice)})</li>
            <li>• Runner: {positionSize.runnerShares} shares trail with breakeven stop</li>
          </ul>
        </div>

        {/* Disabled Warning */}
        {!canExecute && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
            {isLocked ? (
              <Lock className="h-4 w-4 text-yellow-500 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
            )}
            <span className="text-sm text-yellow-500">{getDisabledReason()}</span>
          </div>
        )}

        {/* Execute Button */}
        <Button
          className={`w-full h-14 text-lg font-bold ${
            isLong 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
          disabled={!canExecute || isExecuting}
          onClick={handleExecute}
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Executing...
            </>
          ) : isLocked ? (
            <>
              <Lock className="mr-2 h-5 w-5" />
              TRADING LOCKED
            </>
          ) : (
            <>
              {isLong ? (
                <TrendingUp className="mr-2 h-5 w-5" />
              ) : (
                <TrendingDown className="mr-2 h-5 w-5" />
              )}
              {isLong ? 'BUY' : 'SELL'} {positionSize.shares} SHARES
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Position size is auto-calculated. No manual overrides allowed.
        </p>
      </CardContent>
    </Card>
  );
}
