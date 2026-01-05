import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Cpu, 
  Zap, 
  Target, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  User,
  Bot
} from 'lucide-react';
import { format } from 'date-fns';

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
  const totalCompute = currentPeriod?.compute_credits_earned || 0;
  const totalAction = currentPeriod?.action_credits_earned || 0;
  const totalOutcome = currentPeriod?.outcome_credits_earned || 0;
  
  // Calculate estimated payout
  const defaultRule = dealRoomRules?.[0];
  const estimatedPayout = defaultRule 
    ? (totalCompute * (defaultRule.compute_to_usd || 0.001)) +
      (totalAction * (defaultRule.action_to_usd || 0.01)) +
      (totalOutcome * (defaultRule.outcome_to_usd || 0.10))
    : (totalCompute * 0.001) + (totalAction * 0.01) + (totalOutcome * 0.10);

  const payoutThreshold = defaultRule?.min_payout_threshold || 10;
  const payoutProgress = Math.min((estimatedPayout / payoutThreshold) * 100, 100);

  // Group transactions by type
  const computeTransactions = transactions?.filter(t => t.credit_type === 'compute') || [];
  const actionTransactions = transactions?.filter(t => t.credit_type === 'action') || [];
  const outcomeTransactions = transactions?.filter(t => t.credit_type === 'outcome') || [];

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
      {/* Credit Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-500" />
              Compute Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{totalCompute.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tokens & API calls
            </p>
            <div className="mt-3 flex items-center text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3 mr-1" />
              ${(totalCompute * 0.001).toFixed(4)} value
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Action Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{totalAction.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks, outreach & activities
            </p>
            <div className="mt-3 flex items-center text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3 mr-1" />
              ${(totalAction * 0.01).toFixed(4)} value
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-500" />
              Outcome Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{totalOutcome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Deals, revenue & results
            </p>
            <div className="mt-3 flex items-center text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3 mr-1" />
              ${(totalOutcome * 0.10).toFixed(4)} value
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Estimated Payout Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold">${estimatedPayout.toFixed(2)}</span>
              <Badge variant={estimatedPayout >= payoutThreshold ? "default" : "secondary"}>
                {estimatedPayout >= payoutThreshold ? 'Ready for Payout' : `$${payoutThreshold.toFixed(2)} threshold`}
              </Badge>
            </div>
            <Progress value={payoutProgress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{payoutProgress.toFixed(1)}% to payout</span>
              <span>Frequency: {defaultRule?.payout_frequency || 'monthly'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
                <div className="space-y-3">
                  {balances?.map((balance) => (
                    <div key={balance.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
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
                        <span className="text-blue-500">{balance.compute_credits_earned.toFixed(1)} C</span>
                        <span className="text-amber-500">{balance.action_credits_earned.toFixed(1)} A</span>
                        <span className="text-emerald-500">{balance.outcome_credits_earned.toFixed(1)} O</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
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
                <div className="space-y-2">
                  {transactions?.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getCreditTypeColor(tx.credit_type)}`}>
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
                        <span className={`font-mono font-medium ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
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

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  Compute ({computeTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                {computeTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No compute credits yet</p>
                ) : (
                  <div className="space-y-2">
                    {computeTransactions.slice(0, 10).map((tx) => (
                      <div key={tx.id} className="text-sm p-2 rounded bg-blue-500/5">
                        <div className="font-medium">+{tx.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground truncate">{tx.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Action ({actionTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                {actionTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No action credits yet</p>
                ) : (
                  <div className="space-y-2">
                    {actionTransactions.slice(0, 10).map((tx) => (
                      <div key={tx.id} className="text-sm p-2 rounded bg-amber-500/5">
                        <div className="font-medium">+{tx.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground truncate">{tx.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-500" />
                  Outcome ({outcomeTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                {outcomeTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No outcome credits yet</p>
                ) : (
                  <div className="space-y-2">
                    {outcomeTransactions.slice(0, 10).map((tx) => (
                      <div key={tx.id} className="text-sm p-2 rounded bg-emerald-500/5">
                        <div className="font-medium">+{tx.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground truncate">{tx.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
