import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Bot, 
  User, 
  CheckCircle, 
  Clock, 
  Shield,
  Cpu,
  Zap,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ContributionEvent {
  id: string;
  actor_type: string;
  actor_id: string;
  event_type: string;
  event_description: string;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
  xodiak_anchor_status: string;
  created_at: string;
  value_category: string;
}

export function ContributionEventsList() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['contribution-events-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contribution_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ContributionEvent[];
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'anchored':
        return (
          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
            <CheckCircle className="h-3 w-3 mr-1" />
            Anchored
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'queued':
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10">
            <Shield className="h-3 w-3 mr-1" />
            Queued
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">{status}</Badge>
        );
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      task_completed: 'Task Completed',
      meeting_held: 'Meeting Held',
      deal_advanced: 'Deal Advanced',
      content_created: 'Content Created',
      lead_generated: 'Lead Generated',
      agent_executed: 'Agent Executed',
      outreach_sent: 'Outreach Sent',
      revenue_recognized: 'Revenue Recognized',
    };
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      lead: 'text-blue-500 bg-blue-500/10',
      meeting: 'text-purple-500 bg-purple-500/10',
      deal: 'text-emerald-500 bg-emerald-500/10',
      revenue: 'text-amber-500 bg-amber-500/10',
      outreach: 'text-cyan-500 bg-cyan-500/10',
      content: 'text-pink-500 bg-pink-500/10',
      ip: 'text-indigo-500 bg-indigo-500/10',
      support: 'text-orange-500 bg-orange-500/10',
      automation: 'text-violet-500 bg-violet-500/10',
    };
    return colors[category] || 'text-muted-foreground bg-muted';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Contribution Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading events...</div>
        ) : events?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No contribution events yet. Complete tasks to start earning credits!
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {events?.map((event) => (
                <div 
                  key={event.id} 
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-full mt-0.5",
                        event.actor_type === 'agent' 
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-blue-500/10 text-blue-500"
                      )}>
                        {event.actor_type === 'agent' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {getEventTypeLabel(event.event_type)}
                          </span>
                          {event.value_category && (
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getCategoryColor(event.value_category))}
                            >
                              {event.value_category}
                            </Badge>
                          )}
                        </div>
                        {event.event_description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {event.event_description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground">
                            {format(new Date(event.created_at), 'MMM d, HH:mm')}
                          </span>
                          {getStatusBadge(event.xodiak_anchor_status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 text-xs shrink-0">
                      {event.compute_credits > 0 && (
                        <div className="flex items-center gap-1 text-blue-500">
                          <Cpu className="h-3 w-3" />
                          +{event.compute_credits.toFixed(1)}
                        </div>
                      )}
                      {event.action_credits > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Zap className="h-3 w-3" />
                          +{event.action_credits.toFixed(1)}
                        </div>
                      )}
                      {event.outcome_credits > 0 && (
                        <div className="flex items-center gap-1 text-emerald-500">
                          <Target className="h-3 w-3" />
                          +{event.outcome_credits.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
