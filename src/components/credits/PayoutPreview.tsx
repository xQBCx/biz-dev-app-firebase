import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Wallet,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PayoutPreviewProps {
  computeCredits: number;
  actionCredits: number;
  outcomeCredits: number;
  computeRate: number;
  actionRate: number;
  outcomeRate: number;
  threshold: number;
  payoutFrequency: string;
  nextPayoutDate?: string;
}

export function PayoutPreview({
  computeCredits,
  actionCredits,
  outcomeCredits,
  computeRate = 0.001,
  actionRate = 0.01,
  outcomeRate = 0.10,
  threshold = 10,
  payoutFrequency = 'monthly',
  nextPayoutDate,
}: PayoutPreviewProps) {
  const computeValue = computeCredits * computeRate;
  const actionValue = actionCredits * actionRate;
  const outcomeValue = outcomeCredits * outcomeRate;
  const totalValue = computeValue + actionValue + outcomeValue;
  
  const progress = Math.min((totalValue / threshold) * 100, 100);
  const isEligible = totalValue >= threshold;
  const remaining = Math.max(threshold - totalValue, 0);

  return (
    <Card className="relative overflow-hidden">
      {/* Background gradient based on eligibility */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        isEligible 
          ? "bg-gradient-to-br from-emerald-500 to-emerald-600" 
          : "bg-gradient-to-br from-amber-500 to-amber-600"
      )} />

      <CardHeader className="relative">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Payout Preview
          </div>
          <Badge 
            variant={isEligible ? "default" : "secondary"}
            className={cn(
              isEligible && "bg-emerald-500 hover:bg-emerald-600"
            )}
          >
            {isEligible ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" /> Eligible</>
            ) : (
              <><Clock className="h-3 w-3 mr-1" /> Accumulating</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Total value display */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold tracking-tight">
            ${totalValue.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Estimated payout value
          </p>
        </div>

        {/* Progress to threshold */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to ${threshold} threshold</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress 
            value={progress} 
            className={cn(
              "h-3",
              isEligible && "[&>div]:bg-emerald-500"
            )} 
          />
          {!isEligible && (
            <p className="text-xs text-muted-foreground text-center">
              ${remaining.toFixed(2)} more to reach payout threshold
            </p>
          )}
        </div>

        <Separator />

        {/* Credit breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calculator className="h-4 w-4" />
            Credit Breakdown
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 rounded-lg bg-blue-500/5">
              <div>
                <span className="text-blue-500 font-medium">{computeCredits.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">compute</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>× ${computeRate}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-foreground">${computeValue.toFixed(4)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/5">
              <div>
                <span className="text-amber-500 font-medium">{actionCredits.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">action</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>× ${actionRate}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-foreground">${actionValue.toFixed(4)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/5">
              <div>
                <span className="text-emerald-500 font-medium">{outcomeCredits.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">outcome</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>× ${outcomeRate}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-foreground">${outcomeValue.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Payout info */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1" />
            {payoutFrequency.charAt(0).toUpperCase() + payoutFrequency.slice(1)} payouts
          </div>
          {nextPayoutDate && (
            <div className="text-muted-foreground">
              Next: {nextPayoutDate}
            </div>
          )}
        </div>

        {isEligible && (
          <Button className="w-full" size="lg">
            <DollarSign className="h-4 w-4 mr-2" />
            Request Payout
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
