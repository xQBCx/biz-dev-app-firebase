import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Activity, 
  Loader2, 
  RefreshCw, 
  Search, 
  Bot, 
  Calendar, 
  Mail, 
  MessageSquare, 
  Target,
  DollarSign,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";

interface AgentActivityFeedProps {
  dealRoomId: string;
}

interface AgentActivity {
  id: string;
  agent_slug: string;
  external_platform: string;
  activity_type: string;
  outcome_type: string | null;
  outcome_value: number | null;
  activity_data: Record<string, unknown>;
  target_contact_id: string | null;
  target_company_id: string | null;
  created_at: string;
  contact_name?: string;
  company_name?: string;
}

const outcomeIcons: Record<string, any> = {
  meeting_set: Calendar,
  reply_received: MessageSquare,
  trigger_detected: Target,
  enrichment_complete: CheckCircle,
  draft_created: Mail,
  other: Activity,
};

const outcomeColors: Record<string, string> = {
  meeting_set: "bg-emerald-500/20 text-emerald-600",
  reply_received: "bg-blue-500/20 text-blue-600",
  trigger_detected: "bg-amber-500/20 text-amber-600",
  enrichment_complete: "bg-purple-500/20 text-purple-600",
  draft_created: "bg-primary/20 text-primary",
  other: "bg-muted text-muted-foreground",
};

export const AgentActivityFeed = ({ dealRoomId }: AgentActivityFeedProps) => {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [filterOutcome, setFilterOutcome] = useState<string>("all");
  const [agents, setAgents] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("external_agent_activities")
        .select(`
          *,
          crm_contacts(first_name, last_name),
          crm_companies(name)
        `)
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false })
        .limit(100);

      const { data, error } = await query;

      if (error) {
        console.log("Fetching all activities instead:", error);
        // Fallback without deal_room_id filter
        const { data: fallbackData } = await supabase
          .from("external_agent_activities")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        
        setActivities((fallbackData as AgentActivity[]) || []);
        return;
      }

      const enrichedActivities = (data || []).map((activity: any) => ({
        ...activity,
        contact_name: activity.crm_contacts 
          ? `${activity.crm_contacts.first_name || ''} ${activity.crm_contacts.last_name || ''}`.trim()
          : null,
        company_name: activity.crm_companies?.name || null,
      }));

      setActivities(enrichedActivities);

      // Extract unique agents
      const uniqueAgents = [...new Set(enrichedActivities.map((a: AgentActivity) => a.agent_slug))];
      setAgents(uniqueAgents);

      // Calculate total value
      const total = enrichedActivities.reduce((sum: number, a: AgentActivity) => sum + (a.outcome_value || 0), 0);
      setTotalValue(total);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, [dealRoomId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`agent-activities-${dealRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'external_agent_activities',
          filter: `deal_room_id=eq.${dealRoomId}`,
        },
        (payload) => {
          setActivities((prev) => [payload.new as AgentActivity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealRoomId]);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.agent_slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.activity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.contact_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (activity.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesAgent = filterAgent === "all" || activity.agent_slug === filterAgent;
    const matchesOutcome = filterOutcome === "all" || activity.outcome_type === filterOutcome;
    
    return matchesSearch && matchesAgent && matchesOutcome;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Agent Activity Feed
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time log of all external agent activities
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="px-4 py-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-emerald-600">${totalValue.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">attributed</span>
          </Card>
          <Button variant="outline" size="sm" onClick={fetchActivities}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger className="w-full sm:w-48">
            <Bot className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {agents.map((agent) => (
              <SelectItem key={agent} value={agent}>
                {agent}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterOutcome} onValueChange={setFilterOutcome}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="meeting_set">Meeting Set</SelectItem>
            <SelectItem value="reply_received">Reply Received</SelectItem>
            <SelectItem value="trigger_detected">Trigger Detected</SelectItem>
            <SelectItem value="enrichment_complete">Enrichment Complete</SelectItem>
            <SelectItem value="draft_created">Draft Created</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <Card className="p-8 text-center">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
          <p className="text-muted-foreground">
            Agent activities will appear here when external agents send webhook events
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => {
            const OutcomeIcon = outcomeIcons[activity.outcome_type || 'other'] || Activity;
            const outcomeColor = outcomeColors[activity.outcome_type || 'other'];
            
            return (
              <Card key={activity.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${outcomeColor}`}>
                    <OutcomeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            <Bot className="w-3 h-3 mr-1" />
                            {activity.agent_slug}
                          </Badge>
                          <span className="font-medium">{activity.activity_type}</span>
                          {activity.outcome_type && (
                            <Badge className={`text-xs ${outcomeColor}`}>
                              {activity.outcome_type.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          {activity.contact_name && (
                            <span>→ {activity.contact_name}</span>
                          )}
                          {activity.company_name && (
                            <span className="text-xs">@ {activity.company_name}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {activity.outcome_value && (
                          <div className="text-emerald-600 font-semibold">
                            +${activity.outcome_value}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    {activity.activity_data && Object.keys(activity.activity_data).length > 0 && (
                      <div className="mt-2 text-xs bg-muted/50 rounded p-2">
                        <pre className="whitespace-pre-wrap break-all">
                          {JSON.stringify(activity.activity_data, null, 2).substring(0, 200)}
                          {JSON.stringify(activity.activity_data).length > 200 ? '...' : ''}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
