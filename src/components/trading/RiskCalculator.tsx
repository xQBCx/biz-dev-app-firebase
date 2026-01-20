import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, Target, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { 
  calculatePositionSize, 
  formatCurrency, 
  formatPrice,
  getRiskLevelColor
} from '@/lib/trading/riskCalculator';

interface RiskCalculatorProps {
  accountBalance: number;
  entryPrice?: number;
  stopLossPrice?: number;
  direction: 'long' | 'short';
  symbol: string;
  onCalculationChange?: (result: ReturnType<typeof calculatePositionSize>) => void;
}

export function RiskCalculator({
  accountBalance,
  entryPrice: initialEntry,
  stopLossPrice: initialStop,
  direction,
  symbol,
  onCalculationChange
}: RiskCalculatorProps) {
  const [entryPrice, setEntryPrice] = useState(initialEntry || 0);
  const [stopLossPrice, setStopLossPrice] = useState(initialStop || 0);

  const calculation = useMemo(() => {
    const result = calculatePositionSize(accountBalance, entryPrice, stopLossPrice, direction);
    onCalculationChange?.(result);
    return result;
  }, [accountBalance, entryPrice, stopLossPrice, direction, onCalculationChange]);

  const riskPercentage = (calculation.maxRiskAmount / accountBalance) * 100;
  const riskColor = getRiskLevelColor(riskPercentage);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Risk Calculator
          <Badge variant="outline" className="ml-auto">
            2% Rule Enforced
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Account Info */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account Balance</span>
            <span className="text-lg font-bold">{formatCurrency(accountBalance)}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-muted-foreground">Max Risk (2%)</span>
            <span className={`font-semibold text-${riskColor}-500`}>
              {formatCurrency(calculation.maxRiskAmount)}
            </span>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entry">Entry Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="entry"
                type="number"
                step="0.01"
                value={entryPrice || ''}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stop">Stop Loss</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="stop"
                type="number"
                step="0.01"
                value={stopLossPrice || ''}
                onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {!calculation.isValid && calculation.validationErrors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm text-destructive space-y-1">
                {calculation.validationErrors.map((error, i) => (
                  <p key={i}>{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Calculated Values */}
        {calculation.isValid && (
          <div className="space-y-3">
            {/* Position Size - Main highlight */}
            <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Position Size</div>
              <div className="text-4xl font-bold text-primary">
                {calculation.shares} <span className="text-lg">shares</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                of {symbol}
              </div>
            </div>

            {/* Risk Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Shield className="h-3 w-3" />
                  Risk Per Share
                </div>
                <div className="font-semibold">{formatCurrency(calculation.riskPerShare)}</div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Target className="h-3 w-3" />
                  Target 1 (1.5R)
                </div>
                <div className="font-semibold">${formatPrice(calculation.target1Price)}</div>
              </div>
            </div>

            {/* Exit Strategy */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-500">Exit Strategy</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Target 1 Exit:</span>
                  <span className="ml-2 font-medium">{calculation.target1Shares} shares (75%)</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Runner:</span>
                  <span className="ml-2 font-medium">{calculation.runnerShares} shares (25%)</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-green-500/20">
                <span className="text-muted-foreground text-sm">Potential Profit at T1:</span>
                <span className="ml-2 font-bold text-green-500">
                  {formatCurrency(calculation.potentialProfit)}
                </span>
              </div>
            </div>

            {/* Risk/Reward */}
            <div className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-3">
              <span className="text-muted-foreground">Risk/Reward Ratio</span>
              <Badge variant={calculation.riskRewardRatio >= 1.5 ? 'default' : 'secondary'}>
                1:{calculation.riskRewardRatio.toFixed(1)}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
