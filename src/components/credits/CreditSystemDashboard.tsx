import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  Zap, 
  Target, 
  TrendingUp,
  Clock,
  User,
  Bot,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';
import { AnimatedCreditMeter } from './AnimatedCreditMeter';
import { PayoutPreview } from './PayoutPreview';
import { ContributionEventsList } from './ContributionEventsList';
import { cn } from '@/lib/utils';

interface CreditBalance {
  id: string;
  entity_type: string;
  entity_id: string;
  period_start: string;
  period_end: string;
  compute_credits_earned: number;
  compute_credits_used: number;
  action_credits_earned: number;
  action_credits_used: number;
  outcome_credits_earned: number;
  outcome_credits_used: number;
  total_events: number;
  last_event_at: string;
}

interface CreditTransaction {
  id: string;
  entity_type: string;
  entity_id: string;
  credit_type: string;
  amount: number;
  source_type: string;
  description: string;
  created_at: string;
}

interface DealRoomRule {
  id: string;
  deal_room_id: string;
  compute_to_usd: number;
  action_to_usd: number;
  outcome_to_usd: number;
  min_payout_threshold: number;
  payout_frequency: string;
  active: boolean;
}

export function CreditSystemDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch credit balances
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['credit-balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_balances')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      return data as CreditBalance[];
    }
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['credit-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as CreditTransaction[];
    }
  });

  // Fetch deal room rules
  const { data: dealRoomRules } = useQuery({
    queryKey: ['deal-room-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_room_credit_rules')
        .select('*')
        .eq('active', true);
      
      if (error) throw error;
      return data as DealRoomRule[];
    }
  });

  // Calculate totals
  const currentPeriod = balances?.[0];
  const previousPeriod = balances?.[1];
  
  const totalCompute = currentPeriod?.compute_credits_earned || 0;
  const totalComputeUsed = currentPeriod?.compute_credits_used || 0;
  const totalAction = currentPeriod?.action_credits_earned || 0;
  const totalActionUsed = currentPeriod?.action_credits_used || 0;
  const totalOutcome = currentPeriod?.outcome_credits_earned || 0;
  const totalOutcomeUsed = currentPeriod?.outcome_credits_used || 0;
  
  // Previous period for trends
  const prevCompute = previousPeriod?.compute_credits_earned || 0;
  const prevAction = previousPeriod?.action_credits_earned || 0;
  const prevOutcome = previousPeriod?.outcome_credits_earned || 0;

  // Get payout rules
  const defaultRule = dealRoomRules?.[0];
  const computeRate = defaultRule?.compute_to_usd || 0.001;
  const actionRate = defaultRule?.action_to_usd || 0.01;
  const outcomeRate = defaultRule?.outcome_to_usd || 0.10;
  const payoutThreshold = defaultRule?.min_payout_threshold || 10;
  const payoutFrequency = defaultRule?.payout_frequency || 'monthly';

  const getCreditTypeIcon = (type: string) => {
    switch (type) {
      case 'compute': return <Cpu className="h-4 w-4" />;
      case 'action': return <Zap className="h-4 w-4" />;
      case 'outcome': return <Target className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getCreditTypeColor = (type: string) => {
    switch (type) {
      case 'compute': return 'text-blue-500 bg-blue-500/10';
      case 'action': return 'text-amber-500 bg-amber-500/10';
      case 'outcome': return 'text-emerald-500 bg-emerald-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Animated Credit Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatedCreditMeter
          title="Compute Credits"
          description="Tokens, API calls & runtime"
          icon={Cpu}
          variant="compute"
          earned={totalCompute}
          used={totalComputeUsed}
          previousEarned={prevCompute}
          dollarValue={totalCompute * computeRate}
        />
        <AnimatedCreditMeter
          title="Action Credits"
          description="Tasks, outreach & activities"
          icon={Zap}
          variant="action"
          earned={totalAction}
          used={totalActionUsed}
          previousEarned={prevAction}
          dollarValue={totalAction * actionRate}
        />
        <AnimatedCreditMeter
          title="Outcome Credits"
          description="Deals, revenue & results"
          icon={Target}
          variant="outcome"
          earned={totalOutcome}
          used={totalOutcomeUsed}
          previousEarned={prevOutcome}
          dollarValue={totalOutcome * outcomeRate}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payout">Payout</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Period History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credit History by Period</CardTitle>
              </CardHeader>
              <CardContent>
                {balancesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : balances?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No credit history yet. Complete tasks to earn credits!
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {balances?.map((balance) => (
                      <div key={balance.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {balance.entity_type === 'agent' ? (
                              <Bot className="h-4 w-4 text-purple-500" />
                            ) : (
                              <User className="h-4 w-4 text-blue-500" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {balance.entity_type}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">
                              {format(new Date(balance.period_start), 'MMM yyyy')}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              {balance.total_events} events
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-500 font-mono">{balance.compute_credits_earned.toFixed(1)}C</span>
                          <span className="text-amber-500 font-mono">{balance.action_credits_earned.toFixed(1)}A</span>
                          <span className="text-emerald-500 font-mono">{balance.outcome_credits_earned.toFixed(1)}O</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Payout Preview */}
            <PayoutPreview
              computeCredits={totalCompute - totalComputeUsed}
              actionCredits={totalAction - totalActionUsed}
              outcomeCredits={totalOutcome - totalOutcomeUsed}
              computeRate={computeRate}
              actionRate={actionRate}
              outcomeRate={outcomeRate}
              threshold={payoutThreshold}
              payoutFrequency={payoutFrequency}
            />
          </div>
        </TabsContent>

        <TabsContent value="payout" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PayoutPreview
              computeCredits={totalCompute - totalComputeUsed}
              actionCredits={totalAction - totalActionUsed}
              outcomeCredits={totalOutcome - totalOutcomeUsed}
              computeRate={computeRate}
              actionRate={actionRate}
              outcomeRate={outcomeRate}
              threshold={payoutThreshold}
              payoutFrequency={payoutFrequency}
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payout Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <span className="text-sm text-muted-foreground">Compute Credit Rate</span>
                    <span className="font-mono font-medium">${computeRate.toFixed(4)}/credit</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <span className="text-sm text-muted-foreground">Action Credit Rate</span>
                    <span className="font-mono font-medium">${actionRate.toFixed(4)}/credit</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <span className="text-sm text-muted-foreground">Outcome Credit Rate</span>
                    <span className="font-mono font-medium">${outcomeRate.toFixed(4)}/credit</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <span className="text-sm text-muted-foreground">Minimum Payout</span>
                    <span className="font-mono font-medium">${payoutThreshold.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border">
                    <span className="text-sm text-muted-foreground">Frequency</span>
                    <Badge variant="outline">{payoutFrequency}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          <ContributionEventsList />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : transactions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {transactions?.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full", getCreditTypeColor(tx.credit_type))}>
                          {getCreditTypeIcon(tx.credit_type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{tx.description || tx.source_type}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(tx.created_at), 'MMM d, HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={cn(
                          "font-mono font-medium",
                          tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'
                        )}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
