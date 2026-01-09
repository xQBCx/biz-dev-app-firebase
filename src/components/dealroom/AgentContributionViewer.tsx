import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Coins, 
  CheckCircle, 
  Clock, 
  Link2, 
  ExternalLink,
  RefreshCw,
  TrendingUp,
  Anchor
} from "lucide-react";
import { format } from "date-fns";

interface ContributionEvent {
  id: string;
  event_type: string;
  event_description: string | null;
  action_credits: number | null;
  compute_credits: number | null;
  outcome_credits: number | null;
  created_at: string;
  payload: any;
  xodiak_anchor_status: string | null;
  xodiak_tx_hash: string | null;
  actor_type: string;
  deal_room_id: string | null;
}

interface AgentContributionViewerProps {
  dealRoomId: string;
}

export function AgentContributionViewer({ dealRoomId }: AgentContributionViewerProps) {
  const [events, setEvents] = useState<ContributionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCredits: 0,
    anchoredCount: 0,
    pendingCount: 0,
  });

  useEffect(() => {
    fetchContributionEvents();
  }, [dealRoomId]);

  const fetchContributionEvents = async () => {
    setLoading(true);
    try {
      // Fetch contribution events that are agent-related for this deal room
      const { data, error } = await supabase
        .from("contribution_events")
        .select("*")
        .eq("actor_type", "agent")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const events = (data || []) as unknown as ContributionEvent[];
      setEvents(events);

      // Calculate stats
      const totalCredits = events.reduce((sum: number, e: ContributionEvent) => {
        return sum + (e.action_credits || 0) + (e.compute_credits || 0) + (e.outcome_credits || 0);
      }, 0);

      const anchoredCount = events.filter((e: ContributionEvent) => e.xodiak_anchor_status === 'anchored').length;
      const pendingCount = events.filter((e: ContributionEvent) => e.xodiak_anchor_status !== 'anchored').length;

      setStats({ totalCredits, anchoredCount, pendingCount });
    } catch (error) {
      console.error("Error fetching contribution events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalCredits = (event: ContributionEvent) => {
    return (event.action_credits || 0) + (event.compute_credits || 0) + (event.outcome_credits || 0);
  };

  const getAgentSlug = (event: ContributionEvent) => {
    const payload = event.payload as Record<string, any> | null;
    return payload?.agent_slug || "Unknown Agent";
  };

  const getOutcomeType = (event: ContributionEvent) => {
    const payload = event.payload as Record<string, any> | null;
    return payload?.outcome_type || event.event_type;
  };

  const isAnchored = (event: ContributionEvent) => {
    return event.xodiak_anchor_status === 'anchored';
  };


  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Agent Contribution Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          Agent Contribution Events
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchContributionEvents}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              Total Credits
            </div>
            <div className="text-2xl font-bold text-primary">
              {stats.totalCredits.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Anchor className="w-4 h-4" />
              Anchored
            </div>
            <div className="text-2xl font-bold text-emerald-500">
              {stats.anchoredCount}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              Pending
            </div>
            <div className="text-2xl font-bold text-amber-500">
              {stats.pendingCount}
            </div>
          </div>
        </div>

        {/* Events List */}
        <ScrollArea className="h-[400px]">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No agent contribution events yet</p>
              <p className="text-sm mt-1">
                Events will appear here when agents perform attributed actions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">
                          {getAgentSlug(event)}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {getOutcomeType(event)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.event_description || "Agent activity"}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{format(new Date(event.created_at), "MMM d, h:mm a")}</span>
                        {isAnchored(event) ? (
                          <div className="flex items-center gap-1 text-emerald-500">
                            <CheckCircle className="w-3 h-3" />
                            <span>Anchored</span>
                            {event.xodiak_tx_hash && (
                              <a
                                href={`https://explorer.xodiak.io/tx/${event.xodiak_tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center gap-0.5"
                              >
                                <Link2 className="w-3 h-3" />
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Clock className="w-3 h-3" />
                            <span>Pending Anchor</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-primary">
                        +{getTotalCredits(event)}
                      </div>
                      <div className="text-xs text-muted-foreground">credits</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
