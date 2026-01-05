import { useState, useEffect } from "react";
import { useContributionEvents } from "@/hooks/useContributionEvents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Cpu, 
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Bot,
  User,
  FileText,
  Mail,
  Phone,
  Calendar,
  Anchor
} from "lucide-react";
import { format } from "date-fns";
import { AgentExecutionLog } from "@/components/agents/AgentExecutionLog";

interface CreditBalance {
  compute_credits_earned: number;
  action_credits_earned: number;
  outcome_credits_earned: number;
  total_events: number;
}

interface ContributionEvent {
  id: string;
  actor_type: string;
  event_type: string;
  event_description: string | null;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
  xodiak_anchor_status: string;
  created_at: string;
}

const eventTypeIcons: Record<string, React.ReactNode> = {
  task_created: <FileText className="h-4 w-4" />,
  task_completed: <CheckCircle2 className="h-4 w-4" />,
  email_sent: <Mail className="h-4 w-4" />,
  call_made: <Phone className="h-4 w-4" />,
  meeting_scheduled: <Calendar className="h-4 w-4" />,
  meeting_held: <Calendar className="h-4 w-4" />,
  agent_executed: <Bot className="h-4 w-4" />,
  deal_created: <Target className="h-4 w-4" />,
  deal_advanced: <TrendingUp className="h-4 w-4" />,
};

const anchorStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  queued: "bg-blue-500/10 text-blue-500",
  anchored: "bg-green-500/10 text-green-500",
  skipped: "bg-muted text-muted-foreground",
};

export function CreditsDashboard() {
  const { getCurrentCredits, getRecentEvents } = useContributionEvents();
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [events, setEvents] = useState<ContributionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [creditsData, eventsData] = await Promise.all([
        getCurrentCredits(),
        getRecentEvents(50),
      ]);
      setCredits(creditsData);
      setEvents(eventsData);
      setIsLoading(false);
    };
    fetchData();
  }, [getCurrentCredits, getRecentEvents]);

  const totalCredits = credits 
    ? credits.compute_credits_earned + credits.action_credits_earned + credits.outcome_credits_earned
    : 0;

  return (
    <div className="space-y-6">
      {/* Credit Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-500" />
              Compute Credits
            </CardTitle>
            <CardDescription>Tokens, API calls, runtime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credits?.compute_credits_earned.toFixed(1) || "0.0"}
            </div>
            <Progress 
              value={Math.min((credits?.compute_credits_earned || 0) / 100 * 100, 100)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Action Credits
            </CardTitle>
            <CardDescription>Tasks, emails, enrichments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credits?.action_credits_earned.toFixed(1) || "0.0"}
            </div>
            <Progress 
              value={Math.min((credits?.action_credits_earned || 0) / 50 * 100, 100)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Outcome Credits
            </CardTitle>
            <CardDescription>Meetings, deals, revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credits?.outcome_credits_earned.toFixed(1) || "0.0"}
            </div>
            <Progress 
              value={Math.min((credits?.outcome_credits_earned || 0) / 25 * 100, 100)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Contribution Summary</span>
            <Badge variant="secondary">
              {credits?.total_events || 0} events this period
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalCredits.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{events.filter(e => e.xodiak_anchor_status === 'anchored').length}</div>
              <div className="text-sm text-muted-foreground">Anchored Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{events.filter(e => e.actor_type === 'agent').length}</div>
              <div className="text-sm text-muted-foreground">Agent Actions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{events.filter(e => e.outcome_credits > 0).length}</div>
              <div className="text-sm text-muted-foreground">Outcomes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Execution Log */}
      <AgentExecutionLog />

      {/* Event Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contribution Events</CardTitle>
          <CardDescription>Your activity log with XODIAK anchor status</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No contribution events yet. Complete tasks to start earning credits!
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-0.5">
                      {event.actor_type === 'agent' ? (
                        <Bot className="h-5 w-5 text-purple-500" />
                      ) : (
                        eventTypeIcons[event.event_type] || <User className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">
                          {event.event_description || event.event_type.replace(/_/g, ' ')}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${anchorStatusColors[event.xodiak_anchor_status] || ''}`}
                        >
                          <Anchor className="h-3 w-3 mr-1" />
                          {event.xodiak_anchor_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.created_at), "MMM d, h:mm a")}
                        </span>
                        {event.compute_credits > 0 && (
                          <span className="text-blue-500">+{event.compute_credits.toFixed(1)} compute</span>
                        )}
                        {event.action_credits > 0 && (
                          <span className="text-amber-500">+{event.action_credits.toFixed(1)} action</span>
                        )}
                        {event.outcome_credits > 0 && (
                          <span className="text-green-500">+{event.outcome_credits.toFixed(1)} outcome</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
