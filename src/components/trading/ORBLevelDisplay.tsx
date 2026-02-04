import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/trading/riskCalculator';

interface ORBLevelDisplayProps {
  pmHigh: number | null;
  pmLow: number | null;
  orbHigh: number | null;
  orbLow: number | null;
  orbMidline: number | null;
  currentPrice?: number;
}

export function ORBLevelDisplay({
  pmHigh,
  pmLow,
  orbHigh,
  orbLow,
  orbMidline,
  currentPrice
}: ORBLevelDisplayProps) {
  const hasPreMarket = pmHigh !== null && pmLow !== null;
  const hasORB = orbHigh !== null && orbLow !== null;

  // Determine price position relative to levels
  const getPricePosition = () => {
    if (!currentPrice || !orbHigh || !orbLow) return 'neutral';
    if (currentPrice > orbHigh) return 'above';
    if (currentPrice < orbLow) return 'below';
    return 'inside';
  };

  const pricePosition = getPricePosition();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          Key Levels
          {hasORB && (
            <Badge 
              variant={pricePosition === 'above' ? 'default' : pricePosition === 'below' ? 'destructive' : 'secondary'}
              className="ml-2"
            >
              {pricePosition === 'above' && <TrendingUp className="h-3 w-3 mr-1" />}
              {pricePosition === 'below' && <TrendingDown className="h-3 w-3 mr-1" />}
              {pricePosition === 'inside' && <Minus className="h-3 w-3 mr-1" />}
              {pricePosition === 'above' ? 'Above ORB' : pricePosition === 'below' ? 'Below ORB' : 'In Range'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Price */}
        {currentPrice && (
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Current Price</div>
            <div className="text-2xl font-bold text-primary">${formatPrice(currentPrice)}</div>
          </div>
        )}

        {/* ORB Levels */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Opening Range Breakout</div>
          
          <div className="grid grid-cols-3 gap-2">
            {/* ORB High */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
              <div className="text-xs text-green-500 mb-1">ORB High</div>
              <div className="text-lg font-bold text-green-500">
                {orbHigh !== null ? `$${formatPrice(orbHigh)}` : '—'}
              </div>
            </div>
            
            {/* Midline */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
              <div className="text-xs text-yellow-500 mb-1">Midline</div>
              <div className="text-lg font-bold text-yellow-500">
                {orbMidline !== null ? `$${formatPrice(orbMidline)}` : '—'}
              </div>
            </div>
            
            {/* ORB Low */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
              <div className="text-xs text-red-500 mb-1">ORB Low</div>
              <div className="text-lg font-bold text-red-500">
                {orbLow !== null ? `$${formatPrice(orbLow)}` : '—'}
              </div>
            </div>
          </div>
          
          {!hasORB && (
            <p className="text-xs text-center text-muted-foreground">
              ORB levels calculate at 09:45 EST
            </p>
          )}
        </div>

        {/* Pre-Market Levels */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Pre-Market Range</div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* PM High */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 flex items-center justify-between">
              <span className="text-xs text-blue-500">PM High</span>
              <span className="font-medium text-blue-500">
                {pmHigh !== null ? `$${formatPrice(pmHigh)}` : '—'}
              </span>
            </div>
            
            {/* PM Low */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 flex items-center justify-between">
              <span className="text-xs text-blue-500">PM Low</span>
              <span className="font-medium text-blue-500">
                {pmLow !== null ? `$${formatPrice(pmLow)}` : '—'}
              </span>
            </div>
          </div>
          
          {!hasPreMarket && (
            <p className="text-xs text-center text-muted-foreground">
              Pre-market levels populate during 04:00-09:30 EST
            </p>
          )}
        </div>

        {/* ORB Range Info */}
        {hasORB && orbHigh !== null && orbLow !== null && (
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <span className="text-xs text-muted-foreground">ORB Range: </span>
            <span className="text-sm font-medium">
              ${formatPrice(orbHigh - orbLow)} ({((orbHigh - orbLow) / orbLow * 100).toFixed(2)}%)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
