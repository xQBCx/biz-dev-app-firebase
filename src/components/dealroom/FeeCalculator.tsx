import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Calculator, ArrowRight } from "lucide-react";

interface FeeCalculatorProps {
  onAmountChange: (grossAmount: string) => void;
  currentBalance?: number;
}

// Stripe fee structure: 2.9% + $0.30
const STRIPE_PERCENTAGE = 0.029;
const STRIPE_FIXED = 0.30;

export function FeeCalculator({ onAmountChange, currentBalance = 0 }: FeeCalculatorProps) {
  const [useNetTarget, setUseNetTarget] = useState(false);
  const [targetNetAmount, setTargetNetAmount] = useState("");
  const [directAmount, setDirectAmount] = useState("");

  // Calculate gross amount needed to achieve target net
  const calculateGrossFromNet = (netTarget: number): number => {
    if (netTarget <= 0) return 0;
    // Formula: Gross = (Net + Fixed Fee) / (1 - Percentage Fee)
    return (netTarget + STRIPE_FIXED) / (1 - STRIPE_PERCENTAGE);
  };

  // Calculate net amount after fees from gross
  const calculateNetFromGross = (gross: number): number => {
    if (gross <= 0) return 0;
    return gross - (gross * STRIPE_PERCENTAGE) - STRIPE_FIXED;
  };

  useEffect(() => {
    if (useNetTarget) {
      const netNum = parseFloat(targetNetAmount) || 0;
      const grossNeeded = calculateGrossFromNet(netNum);
      onAmountChange(grossNeeded > 0 ? grossNeeded.toFixed(2) : "");
    } else {
      onAmountChange(directAmount);
    }
  }, [useNetTarget, targetNetAmount, directAmount, onAmountChange]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const netNum = parseFloat(targetNetAmount) || 0;
  const grossNeeded = calculateGrossFromNet(netNum);
  const stripeFee = grossNeeded - netNum;
  
  const directNum = parseFloat(directAmount) || 0;
  const netFromDirect = calculateNetFromGross(directNum);

  return (
    <div className="space-y-4">
      {/* Toggle between direct amount and target net */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <Label htmlFor="net-target-toggle" className="font-medium">
              Target Net Amount
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Calculate how much to deposit so recipient receives exact amount
          </p>
        </div>
        <Switch
          id="net-target-toggle"
          checked={useNetTarget}
          onCheckedChange={(checked) => {
            setUseNetTarget(checked);
            // Clear the other field when switching
            if (checked) {
              setDirectAmount("");
            } else {
              setTargetNetAmount("");
            }
          }}
        />
      </div>

      {useNetTarget ? (
        <>
          {/* Target Net Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="target-net">Recipient Should Receive (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="target-net"
                type="number"
                placeholder="500.00"
                value={targetNetAmount}
                onChange={(e) => setTargetNetAmount(e.target.value)}
                className="pl-9"
                min="10"
                step="0.01"
              />
            </div>
          </div>

          {/* Fee Breakdown */}
          {netNum > 0 && (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Fee Breakdown</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Target Net Amount</span>
                  <span className="font-medium">{formatCurrency(netNum)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Stripe Fee (~2.9% + $0.30)</span>
                  <span>+ {formatCurrency(stripeFee)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>You Pay</span>
                  <span className="text-primary">{formatCurrency(grossNeeded)}</span>
                </div>
              </div>

              {/* Projected Balance */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm">Projected Treasury Balance</span>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-primary">
                    {formatCurrency(currentBalance + netNum)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Direct Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="direct-amount">Amount to Deposit (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="direct-amount"
                type="number"
                placeholder="500.00"
                value={directAmount}
                onChange={(e) => setDirectAmount(e.target.value)}
                className="pl-9"
                min="10"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum $10.00 • ~3% processing fee applies
            </p>
          </div>

          {/* Show what recipient will get */}
          {directNum >= 10 && (
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>You Pay</span>
                <span className="font-medium">{formatCurrency(directNum)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Stripe Fee (~2.9% + $0.30)</span>
                <span>- {formatCurrency(directNum - netFromDirect)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Treasury Receives</span>
                <span className="text-primary">{formatCurrency(netFromDirect)}</span>
              </div>

              {/* Projected Balance */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm">Projected Treasury Balance</span>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-primary">
                    {formatCurrency(currentBalance + netFromDirect)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
