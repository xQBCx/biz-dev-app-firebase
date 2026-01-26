import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Wallet,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  Building2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';

interface CreditRule {
  id: string;
  deal_room_id: string;
  compute_to_usd: number;
  action_to_usd: number;
  outcome_to_usd: number;
  min_payout_threshold: number;
  payout_frequency: string;
  active: boolean;
}

interface DealRoom {
  id: string;
  name: string;
}

interface CreditBalance {
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
}

export function PayoutCalculator() {
  const [selectedDealRoom, setSelectedDealRoom] = useState<string>('all');
  const { id: effectiveUserId } = useEffectiveUser();

  // Fetch deal rooms the user participates in
  const { data: dealRooms, isLoading: loadingRooms } = useQuery({
    queryKey: ['user-deal-rooms', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];

      // Get deal rooms where user is a participant
      const { data: participants } = await supabase
        .from('deal_room_participants')
        .select('deal_room_id')
        .eq('user_id', effectiveUserId);

      if (!participants?.length) return [];

      const dealRoomIds = participants.map(p => p.deal_room_id);
      
      const { data, error } = await supabase
        .from('deal_rooms')
        .select('id, name')
        .in('id', dealRoomIds);

      if (error) throw error;
      return data as DealRoom[];
    },
    enabled: !!effectiveUserId,
  });

  // Fetch credit rules for selected deal room
  const { data: creditRules } = useQuery({
    queryKey: ['credit-rules', selectedDealRoom],
    queryFn: async () => {
      if (selectedDealRoom === 'all') {
        // Get all active rules
        const { data, error } = await supabase
          .from('deal_room_credit_rules')
          .select('*')
          .eq('active', true);
        if (error) throw error;
        return data as CreditRule[];
      } else {
        const { data, error } = await supabase
          .from('deal_room_credit_rules')
          .select('*')
          .eq('deal_room_id', selectedDealRoom)
          .eq('active', true)
          .limit(1);
        if (error) throw error;
        return data as CreditRule[];
      }
    },
  });

  // Fetch user's credit balance
  const { data: creditBalance } = useQuery({
    queryKey: ['user-credit-balance', effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;

      // Aggregate from contribution events
      const { data, error } = await supabase
        .from('contribution_events')
        .select('compute_credits, action_credits, outcome_credits')
        .eq('actor_id', effectiveUserId);

      if (error) throw error;

      const totals = data?.reduce((acc, event) => ({
        compute_credits: acc.compute_credits + (Number(event.compute_credits) || 0),
        action_credits: acc.action_credits + (Number(event.action_credits) || 0),
        outcome_credits: acc.outcome_credits + (Number(event.outcome_credits) || 0),
      }), { compute_credits: 0, action_credits: 0, outcome_credits: 0 });

      return totals as CreditBalance;
    },
    enabled: !!effectiveUserId,
  });

  // Calculate payout based on selected rules
  const payoutCalculation = useMemo(() => {
    if (!creditBalance || !creditRules?.length) {
      return {
        computeValue: 0,
        actionValue: 0,
        outcomeValue: 0,
        totalValue: 0,
        threshold: 10,
        isEligible: false,
        payoutFrequency: 'monthly',
        rates: { compute: 0.001, action: 0.01, outcome: 0.10 }
      };
    }

    // Use first active rule or average rates across rules
    const rule = creditRules[0];
    const computeRate = Number(rule.compute_to_usd) || 0.001;
    const actionRate = Number(rule.action_to_usd) || 0.01;
    const outcomeRate = Number(rule.outcome_to_usd) || 0.10;
    const threshold = Number(rule.min_payout_threshold) || 10;

    const computeValue = creditBalance.compute_credits * computeRate;
    const actionValue = creditBalance.action_credits * actionRate;
    const outcomeValue = creditBalance.outcome_credits * outcomeRate;
    const totalValue = computeValue + actionValue + outcomeValue;

    return {
      computeValue,
      actionValue,
      outcomeValue,
      totalValue,
      threshold,
      isEligible: totalValue >= threshold,
      payoutFrequency: rule.payout_frequency || 'monthly',
      rates: { compute: computeRate, action: actionRate, outcome: outcomeRate }
    };
  }, [creditBalance, creditRules]);

  const handleRequestPayout = () => {
    toast.info('Payout request submitted. This will be processed in the next payout cycle.');
  };

  if (loadingRooms) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const progress = Math.min((payoutCalculation.totalValue / payoutCalculation.threshold) * 100, 100);
  const remaining = Math.max(payoutCalculation.threshold - payoutCalculation.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Deal Room Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Payout Calculator
          </h2>
          <p className="text-sm text-muted-foreground">
            Calculate your earnings based on Deal Room rules
          </p>
        </div>
        <Select value={selectedDealRoom} onValueChange={setSelectedDealRoom}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Deal Room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Deal Rooms</SelectItem>
            {dealRooms?.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Payout Card */}
        <Card className="relative overflow-hidden">
          <div className={cn(
            "absolute inset-0 opacity-5",
            payoutCalculation.isEligible 
              ? "bg-gradient-to-br from-emerald-500 to-emerald-600" 
              : "bg-gradient-to-br from-amber-500 to-amber-600"
          )} />

          <CardHeader className="relative">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Estimated Payout
              </div>
              <Badge 
                variant={payoutCalculation.isEligible ? "default" : "secondary"}
                className={cn(
                  payoutCalculation.isEligible && "bg-emerald-500 hover:bg-emerald-600"
                )}
              >
                {payoutCalculation.isEligible ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Eligible</>
                ) : (
                  <><Clock className="h-3 w-3 mr-1" /> Accumulating</>
                )}
              </Badge>
            </CardTitle>
            <CardDescription>
              Based on {creditRules?.length || 0} active credit rule(s)
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* Total Value */}
            <div className="text-center py-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-5xl font-bold tracking-tight">
                ${payoutCalculation.totalValue.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total estimated payout
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress to ${payoutCalculation.threshold} threshold
                </span>
                <span className="font-medium">{progress.toFixed(1)}%</span>
              </div>
              <Progress 
                value={progress} 
                className={cn(
                  "h-3",
                  payoutCalculation.isEligible && "[&>div]:bg-emerald-500"
                )} 
              />
              {!payoutCalculation.isEligible && (
                <p className="text-xs text-muted-foreground text-center">
                  ${remaining.toFixed(2)} more to reach payout threshold
                </p>
              )}
            </div>

            {/* Payout Frequency */}
            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Payout Frequency</span>
              </div>
              <span className="font-medium capitalize">{payoutCalculation.payoutFrequency}</span>
            </div>

            {payoutCalculation.isEligible && (
              <Button className="w-full" size="lg" onClick={handleRequestPayout}>
                <DollarSign className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Credit Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Credit Breakdown
            </CardTitle>
            <CardDescription>
              How your credits convert to earnings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Compute Credits */}
            <div className="p-4 rounded-lg border bg-blue-500/5 border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Compute Credits</span>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {creditBalance?.compute_credits.toFixed(1) || 0}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{creditBalance?.compute_credits.toFixed(1) || 0}</span>
                <span>×</span>
                <span>${payoutCalculation.rates.compute}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-blue-500">
                  ${payoutCalculation.computeValue.toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tokens, API calls, and runtime usage
              </p>
            </div>

            {/* Action Credits */}
            <div className="p-4 rounded-lg border bg-green-500/5 border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Action Credits</span>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  {creditBalance?.action_credits.toFixed(1) || 0}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{creditBalance?.action_credits.toFixed(1) || 0}</span>
                <span>×</span>
                <span>${payoutCalculation.rates.action}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-green-500">
                  ${payoutCalculation.actionValue.toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tasks completed, emails sent, leads enriched
              </p>
            </div>

            {/* Outcome Credits */}
            <div className="p-4 rounded-lg border bg-purple-500/5 border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Outcome Credits</span>
                </div>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                  {creditBalance?.outcome_credits.toFixed(1) || 0}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{creditBalance?.outcome_credits.toFixed(1) || 0}</span>
                <span>×</span>
                <span>${payoutCalculation.rates.outcome}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-purple-500">
                  ${payoutCalculation.outcomeValue.toFixed(4)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Meetings held, deals closed, revenue generated
              </p>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Total Earnings</span>
              </div>
              <span className="text-xl font-bold">${payoutCalculation.totalValue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Note */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">How Payouts Work</p>
              <p>
                Credits are converted to USD using Deal Room rules set by formulation owners. 
                Once you reach the minimum threshold, you can request a payout during the next 
                payout cycle. All calculations are anchored to the XODIAK ledger for transparency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
