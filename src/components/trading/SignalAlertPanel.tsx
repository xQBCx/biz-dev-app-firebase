import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Volume2, 
  Target, 
  CheckCircle2,
  XCircle,
  Zap,
  AlertOctagon
} from 'lucide-react';
import { Signal } from '@/lib/trading/signalEngine';
import { formatPrice, formatCurrency } from '@/lib/trading/riskCalculator';

interface SignalAlertPanelProps {
  signal: Signal | null;
  onAcknowledge?: () => void;
  onExecute?: () => void;
}

export function SignalAlertPanel({ signal, onAcknowledge, onExecute }: SignalAlertPanelProps) {
  if (!signal) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">Waiting for Signal</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoring for ORB breakout with volume confirmation
          </p>
        </CardContent>
      </Card>
    );
  }

  const isLong = signal.type === 'breakout_long';
  const isShort = signal.type === 'breakout_short';
  const isAnomaly = signal.isAnomaly;

  // Determine card styling based on signal type
  const getCardStyle = () => {
    if (isAnomaly) return 'border-2 border-red-500/50 bg-red-500/5';
    if (!signal.isValid) return 'border-2 border-yellow-500/50 bg-yellow-500/5';
    if (isLong) return 'border-2 border-green-500/50 bg-green-500/5';
    if (isShort) return 'border-2 border-red-500/50 bg-red-500/5';
    return '';
  };

  return (
    <Card className={`transition-all ${getCardStyle()}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isAnomaly ? (
              <>
                <AlertOctagon className="h-5 w-5 text-red-500" />
                <span className="text-red-500">VPA ANOMALY</span>
              </>
            ) : isLong ? (
              <>
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-green-500">LONG SIGNAL</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-red-500" />
                <span className="text-red-500">SHORT SIGNAL</span>
              </>
            )}
          </CardTitle>
          <Badge variant={signal.isValid ? 'default' : 'destructive'}>
            {signal.symbol}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Anomaly Warning */}
        {isAnomaly && signal.anomalyReason && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-500">{signal.anomalyReason}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Price movement not supported by volume. High probability of failure.
              </p>
            </div>
          </div>
        )}

        {/* Signal Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
            <div className="text-xl font-bold">${formatPrice(signal.candle.close)}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">ORB Line</div>
            <div className="text-xl font-bold">${formatPrice(signal.orbLine)}</div>
          </div>
        </div>

        {/* Condition Checks */}
        <div className="space-y-2">
          <div className="text-sm font-medium mb-2">Validation Checks</div>
          
          {/* Condition A: Breakout */}
          <div className="flex items-center justify-between p-2 rounded bg-muted/30">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Breakout Confirmed</span>
            </div>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>

          {/* Condition B: Volume */}
          <div className="flex items-center justify-between p-2 rounded bg-muted/30">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Volume {signal.volumeRatio.toFixed(2)}x avg
              </span>
            </div>
            {signal.volumeRatio > 1 && !isAnomaly ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>

          {/* Condition C: Risk Distance */}
          <div className="flex items-center justify-between p-2 rounded bg-muted/30">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Stop Distance ${signal.distanceToStop.toFixed(2)}
              </span>
            </div>
            {signal.distanceToStop <= 0.60 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </div>

        {/* Rejection Reasons */}
        {signal.rejectionReasons.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-yellow-500 text-sm">Warnings</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {signal.rejectionReasons.map((reason, i) => (
                <li key={i}>• {reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {signal.isValid && !isAnomaly ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onAcknowledge}
              >
                Dismiss
              </Button>
              <Button 
                className={`flex-1 ${isLong ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                onClick={onExecute}
              >
                Execute Trade
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={onAcknowledge}
            >
              Acknowledge & Continue Monitoring
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
