import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatPrice, calculatePnL, isTarget1Hit, isStopHit } from '@/lib/trading/riskCalculator';

interface Position {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  shares: number;
  stopLossPrice: number;
  originalStopLoss: number;
  target1Price: number;
  target1Shares: number;
  target1Hit: boolean;
  breakevenTriggered: boolean;
  runnerShares: number;
  currentPnL: number;
  status: 'active' | 'partial' | 'closed' | 'stopped_out';
}

interface ActivePositionManagerProps {
  position: Position;
  currentPrice: number;
  onClosePosition: (exitReason: string) => Promise<void>;
}

export function ActivePositionManager({
  position,
  currentPrice,
  onClosePosition
}: ActivePositionManagerProps) {
  const [pnl, setPnL] = useState(position.currentPnL);
  const [t1Hit, setT1Hit] = useState(position.target1Hit);
  const [stopHit, setStopHit] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isLong = position.direction === 'long';

  useEffect(() => {
    // Calculate real-time PnL
    const currentShares = t1Hit ? position.runnerShares : position.shares;
    const newPnL = calculatePnL(position.entryPrice, currentPrice, currentShares, position.direction);
    setPnL(newPnL);

    // Check if Target 1 hit
    if (!t1Hit && isTarget1Hit(currentPrice, position.target1Price, position.direction)) {
      setT1Hit(true);
    }

    // Check if stop hit
    const activeStop = position.breakevenTriggered ? position.entryPrice : position.stopLossPrice;
    if (isStopHit(currentPrice, activeStop, position.direction)) {
      setStopHit(true);
    }
  }, [currentPrice, position, t1Hit]);

  // Calculate progress to Target 1
  const calculateProgress = () => {
    const totalDistance = Math.abs(position.target1Price - position.entryPrice);
    const currentDistance = isLong 
      ? currentPrice - position.entryPrice 
      : position.entryPrice - currentPrice;
    
    const progress = (currentDistance / totalDistance) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const handleClosePosition = async (reason: string) => {
    setIsClosing(true);
    await onClosePosition(reason);
    setIsClosing(false);
  };

  const getPnLColor = () => {
    if (pnl > 0) return 'text-green-500';
    if (pnl < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const activeStop = position.breakevenTriggered ? position.entryPrice : position.stopLossPrice;

  return (
    <Card className={`border-2 ${isLong ? 'border-green-500/30' : 'border-red-500/30'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isLong ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            Active {isLong ? 'Long' : 'Short'} Position
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{position.symbol}</Badge>
            {t1Hit && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                T1 Hit
              </Badge>
            )}
            {position.breakevenTriggered && (
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                <Shield className="h-3 w-3 mr-1" />
                BE
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* P&L Display */}
        <div className={`bg-muted/50 rounded-xl p-4 text-center ${pnl > 0 ? 'bg-green-500/10' : pnl < 0 ? 'bg-red-500/10' : ''}`}>
          <div className="text-sm text-muted-foreground mb-1">Unrealized P&L</div>
          <div className={`text-4xl font-bold ${getPnLColor()}`}>
            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Current: ${formatPrice(currentPrice)}
          </div>
        </div>

        {/* Progress to Target 1 */}
        {!t1Hit && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to Target 1</span>
              <span className="font-medium">{calculateProgress().toFixed(0)}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
        )}

        {/* Position Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Entry</div>
            <div className="font-semibold">${formatPrice(position.entryPrice)}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Shares</div>
            <div className="font-semibold">{t1Hit ? position.runnerShares : position.shares}</div>
          </div>
        </div>

        {/* Stops and Targets */}
        <div className="space-y-2">
          {/* Target 1 */}
          <div className={`flex items-center justify-between p-2 rounded ${t1Hit ? 'bg-green-500/10' : 'bg-muted/30'}`}>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-sm">Target 1 (1.5R)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">${formatPrice(position.target1Price)}</span>
              {t1Hit && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
          </div>

          {/* Stop Loss */}
          <div className={`flex items-center justify-between p-2 rounded ${stopHit ? 'bg-red-500/10' : 'bg-muted/30'}`}>
            <div className="flex items-center gap-2">
              {position.breakevenTriggered ? (
                <Shield className="h-4 w-4 text-blue-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {position.breakevenTriggered ? 'Breakeven Stop' : 'Stop Loss'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">${formatPrice(activeStop)}</span>
              {stopHit && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
        </div>

        {/* T1 Hit Info */}
        {t1Hit && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium text-sm">Target 1 Achieved!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Exited {position.target1Shares} shares. Running {position.runnerShares} shares with breakeven stop.
            </p>
          </div>
        )}

        {/* Stop Hit Warning */}
        {stopHit && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium text-sm">Stop Loss Triggered!</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Position will be closed at next available price.
            </p>
          </div>
        )}

        {/* Manual Close Button */}
        <Button
          variant="outline"
          className="w-full"
          disabled={isClosing}
          onClick={() => handleClosePosition('manual_close')}
        >
          {isClosing ? 'Closing...' : 'Close Position Manually'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Stop loss is enforced automatically. No manual overrides.
        </p>
      </CardContent>
    </Card>
  );
}
