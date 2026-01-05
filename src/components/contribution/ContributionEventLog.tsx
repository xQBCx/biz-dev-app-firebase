import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Cpu, Target, TrendingUp, User, Bot, Clock,
  CheckCircle2, Zap, FileText, Users, DollarSign, RefreshCw,
  ArrowUpRight, Filter
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContributionEvent {
  id: string;
  actor_type: 'human' | 'agent' | 'system';
  actor_id: string;
  event_type: string;
  event_description: string | null;
  payload: Record<string, unknown> | null;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
  value_category: string | null;
  attribution_tags: string[] | null;
  xodiak_anchor_status: string;
  created_at: string;
  workspace_id: string | null;
  deal_room_id: string | null;
}

interface CreditBalance {
  entity_type: string;
  entity_id: string;
  period_start: string;
  period_end: string;
  compute_credits_earned: number;
  action_credits_earned: number;
  outcome_credits_earned: number;
  total_events: number;
}

const eventTypeIcons: Record<string, React.ReactNode> = {
  task_completed: <CheckCircle2 className="h-4 w-4" />,
  agent_executed: <Bot className="h-4 w-4" />,
  deal_advanced: <TrendingUp className="h-4 w-4" />,
  meeting_held: <Users className="h-4 w-4" />,
  proposal_sent: <FileText className="h-4 w-4" />,
  revenue_generated: <DollarSign className="h-4 w-4" />,
};

const actorTypeColors: Record<string, string> = {
  human: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  agent: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  system: 'bg-muted text-muted-foreground border-border',
};

const anchorStatusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  queued: 'bg-blue-500/10 text-blue-500',
  anchored: 'bg-green-500/10 text-green-500',
  failed: 'bg-destructive/10 text-destructive',
};

export function ContributionEventLog() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActor, setFilterActor] = useState<string>('all');

  const { data: events, isLoading: eventsLoading, refetch } = useQuery({
    queryKey: ['contribution-events', user?.id, filterType, filterActor],
    queryFn: async () => {
      let query = supabase
        .from('contribution_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data, error } = await query;
      if (error) throw error;
      
      let filtered = data as ContributionEvent[];
      if (filterType !== 'all') {
        filtered = filtered.filter(e => e.event_type === filterType);
      }
      if (filterActor !== 'all') {
        filtered = filtered.filter(e => e.actor_type === filterActor);
      }
      return filtered;
    },
    enabled: !!user,
  });

  const { data: creditBalances } = useQuery({
    queryKey: ['credit-balances', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_balances')
        .select('*')
        .eq('entity_id', user?.id)
        .order('period_start', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data as CreditBalance[];
    },
    enabled: !!user,
  });

  const currentBalance = creditBalances?.[0];

  const totalCredits = events?.reduce((acc, e) => ({
    compute: acc.compute + (e.compute_credits || 0),
    action: acc.action + (e.action_credits || 0),
    outcome: acc.outcome + (e.outcome_credits || 0),
  }), { compute: 0, action: 0, outcome: 0 }) || { compute: 0, action: 0, outcome: 0 };

  const eventsByType = events?.reduce((acc, e) => {
    acc[e.actor_type] = (acc[e.actor_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Credit Meters */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-500" />
              Compute Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-500">
              {(currentBalance?.compute_credits_earned || totalCredits.compute).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Tokens & API usage</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Action Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {(currentBalance?.action_credits_earned || totalCredits.action).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Tasks & activities</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Outcome Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {(currentBalance?.outcome_credits_earned || totalCredits.outcome).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Deals & revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {currentBalance?.total_events || events?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Source Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Contribution Event Log
              </CardTitle>
              <CardDescription>
                All contribution events linked to your account and agents
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Select value={filterActor} onValueChange={setFilterActor}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Actor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actors</SelectItem>
                    <SelectItem value="human">Human</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="task_completed">Task Completed</SelectItem>
                    <SelectItem value="agent_executed">Agent Executed</SelectItem>
                    <SelectItem value="deal_advanced">Deal Advanced</SelectItem>
                    <SelectItem value="meeting_held">Meeting Held</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="events">
              <ScrollArea className="h-[400px]">
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : events?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No contribution events yet</p>
                    <p className="text-sm">Complete tasks to start earning credits</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {events?.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${actorTypeColors[event.actor_type]}`}>
                          {event.actor_type === 'human' ? (
                            <User className="h-4 w-4" />
                          ) : event.actor_type === 'agent' ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <Cpu className="h-4 w-4" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {eventTypeIcons[event.event_type] || <Activity className="h-4 w-4" />}
                            <span className="font-medium text-sm">
                              {event.event_description || event.event_type.replace(/_/g, ' ')}
                            </span>
                            <Badge variant="outline" className={anchorStatusColors[event.xodiak_anchor_status]}>
                              {event.xodiak_anchor_status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                            </span>
                            {event.value_category && (
                              <Badge variant="secondary" className="text-xs">
                                {event.value_category}
                              </Badge>
                            )}
                            {event.attribution_tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          {event.compute_credits > 0 && (
                            <div className="text-center">
                              <div className="font-semibold text-cyan-500">
                                +{event.compute_credits.toFixed(1)}
                              </div>
                              <div className="text-muted-foreground">Compute</div>
                            </div>
                          )}
                          {event.action_credits > 0 && (
                            <div className="text-center">
                              <div className="font-semibold text-blue-500">
                                +{event.action_credits.toFixed(1)}
                              </div>
                              <div className="text-muted-foreground">Action</div>
                            </div>
                          )}
                          {event.outcome_credits > 0 && (
                            <div className="text-center">
                              <div className="font-semibold text-green-500">
                                +{event.outcome_credits.toFixed(1)}
                              </div>
                              <div className="text-muted-foreground">Outcome</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="breakdown">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">By Actor Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span>Human</span>
                        </div>
                        <Badge variant="secondary">{eventsByType.human || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-purple-500" />
                          <span>Agent</span>
                        </div>
                        <Badge variant="secondary">{eventsByType.agent || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-muted-foreground" />
                          <span>System</span>
                        </div>
                        <Badge variant="secondary">{eventsByType.system || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">XODIAK Anchor Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['anchored', 'queued', 'pending'].map((status) => {
                        const count = events?.filter(e => e.xodiak_anchor_status === status).length || 0;
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                status === 'anchored' ? 'bg-green-500' :
                                status === 'queued' ? 'bg-blue-500' : 'bg-yellow-500'
                              }`} />
                              <span className="capitalize">{status}</span>
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
