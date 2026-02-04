import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Sun, 
  Sunrise, 
  Loader2, 
  Check, 
  Lock,
  AlertTriangle
} from 'lucide-react';
import { 
  getMarketStatus, 
  getMarketStatusMessage, 
  formatESTTime,
  getTimeUntilNextEvent,
  getCurrentEST
} from '@/lib/trading/marketTimeUtils';

interface MarketStatusBarProps {
  lossCount: number;
  dailyPnL: number;
  isLocked?: boolean;
}

export function MarketStatusBar({ lossCount, dailyPnL, isLocked }: MarketStatusBarProps) {
  const [currentTime, setCurrentTime] = useState(getCurrentEST());
  const [status, setStatus] = useState(getMarketStatus());
  const [nextEvent, setNextEvent] = useState(getTimeUntilNextEvent());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(getCurrentEST());
      setStatus(getMarketStatus(now));
      setNextEvent(getTimeUntilNextEvent(now));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'pre-market':
        return <Sunrise className="h-4 w-4" />;
      case 'settling':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'open':
        return <Check className="h-4 w-4" />;
      case 'closed':
        return <Lock className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    if (isLocked) return 'bg-red-500/10 text-red-500';
    switch (status) {
      case 'pre-market':
        return 'bg-blue-500/10 text-blue-500';
      case 'settling':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'open':
        return 'bg-green-500/10 text-green-500';
      case 'closed':
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPnLColor = () => {
    if (dailyPnL > 0) return 'text-green-500';
    if (dailyPnL < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getLossCountBadge = () => {
    if (lossCount >= 2) return 'bg-red-500/10 text-red-500 border-red-500/30';
    if (lossCount === 1) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    return 'bg-green-500/10 text-green-500 border-green-500/30';
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg border">
      {/* Market Status */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getMarketStatusMessage()}</span>
        </div>
        
        {/* Current Time EST */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-mono">{formatESTTime(currentTime)}</span>
          <span className="text-xs">EST</span>
        </div>

        {/* Next Event */}
        {status !== 'open' && (
          <div className="text-sm text-muted-foreground">
            <span className="text-xs uppercase tracking-wide">Next: </span>
            <span className="font-medium">{nextEvent.event}</span>
            <span className="text-xs ml-1">({nextEvent.minutes}m)</span>
          </div>
        )}
      </div>

      {/* Trading Stats */}
      <div className="flex items-center gap-4">
        {/* Daily P&L */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase">Daily P&L:</span>
          <span className={`font-bold ${getPnLColor()}`}>
            {dailyPnL >= 0 ? '+' : ''}{dailyPnL.toFixed(2)}
          </span>
        </div>

        {/* Loss Counter */}
        <Badge 
          variant="outline" 
          className={`flex items-center gap-1.5 ${getLossCountBadge()}`}
        >
          {lossCount >= 2 && <AlertTriangle className="h-3 w-3" />}
          <span>{lossCount}/2 Losses</span>
        </Badge>

        {/* Circuit Breaker Status */}
        {isLocked && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>LOCKED</span>
          </Badge>
        )}
      </div>
    </div>
  );
}
