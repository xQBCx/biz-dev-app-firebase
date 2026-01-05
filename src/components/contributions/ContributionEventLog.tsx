import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Bot, 
  User, 
  Zap, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContributionEvent {
  id: string;
  actor_type: string;
  actor_id: string;
  event_type: string;
  event_description: string | null;
  event_category?: string;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
  value_category: string | null;
  xodiak_anchor_status: string | null;
  created_at: string;
  payload?: Record<string, unknown>;
}

const eventTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  task_completed: { icon: CheckCircle2, color: 'bg-green-500/10 text-green-500', label: 'Task' },
  agent_executed: { icon: Bot, color: 'bg-purple-500/10 text-purple-500', label: 'Agent' },
  outreach_sent: { icon: Zap, color: 'bg-blue-500/10 text-blue-500', label: 'Outreach' },
  meeting_held: { icon: Target, color: 'bg-orange-500/10 text-orange-500', label: 'Meeting' },
  deal_advanced: { icon: TrendingUp, color: 'bg-emerald-500/10 text-emerald-500', label: 'Deal' },
  content_created: { icon: Activity, color: 'bg-pink-500/10 text-pink-500', label: 'Content' },
};

const anchorStatusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Pending' },
  queued: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Queued' },
  anchored: { color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Anchored' },
  failed: { color: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Failed' },
};

export function ContributionEventLog() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['contribution-events'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('contribution_events')
        .select('*')
        .eq('actor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ContributionEvent[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['contribution-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('contribution_events')
        .select('compute_credits, action_credits, outcome_credits, event_type')
        .eq('actor_id', user.id);
      
      if (error) throw error;
      
      const totals = data?.reduce((acc, event) => ({
        compute: acc.compute + (Number(event.compute_credits) || 0),
        action: acc.action + (Number(event.action_credits) || 0),
        outcome: acc.outcome + (Number(event.outcome_credits) || 0),
        count: acc.count + 1,
      }), { compute: 0, action: 0, outcome: 0, count: 0 });
      
      return totals;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats?.count || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compute Credits</p>
                <p className="text-2xl font-bold text-blue-500">{stats?.compute?.toFixed(1) || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Action Credits</p>
                <p className="text-2xl font-bold text-green-500">{stats?.action?.toFixed(1) || 0}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outcome Credits</p>
                <p className="text-2xl font-bold text-purple-500">{stats?.outcome?.toFixed(1) || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Contribution Event Log
          </CardTitle>
          <CardDescription>
            All actions tracked for attribution and monetization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            {events && events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => {
                  const config = eventTypeConfig[event.event_type] || eventTypeConfig.task_completed;
                  const Icon = config.icon;
                  const anchorConfig = anchorStatusConfig[event.xodiak_anchor_status || 'pending'];
                  
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            {event.event_description || event.event_type.replace(/_/g, ' ')}
                          </span>
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                          {event.actor_type === 'agent' ? (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                              <Bot className="h-3 w-3 mr-1" />
                              Agent
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              <User className="h-3 w-3 mr-1" />
                              Human
                            </Badge>
                          )}
                          {anchorConfig && (
                            <Badge variant="outline" className={anchorConfig.color}>
                              {anchorConfig.label}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                          </span>
                          {event.value_category && (
                            <span className="capitalize">{event.value_category}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                          {Number(event.compute_credits) > 0 && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500">
                              +{Number(event.compute_credits).toFixed(1)} compute
                            </span>
                          )}
                          {Number(event.action_credits) > 0 && (
                            <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">
                              +{Number(event.action_credits).toFixed(1)} action
                            </span>
                          )}
                          {Number(event.outcome_credits) > 0 && (
                            <span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-500">
                              +{Number(event.outcome_credits).toFixed(1)} outcome
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>No contribution events yet</p>
                <p className="text-sm">Complete tasks to start earning credits</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
