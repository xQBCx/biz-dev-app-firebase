import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { SignalDetailPanel } from "./SignalDetailPanel";
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
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  PanelRightOpen,
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
  deal_room_id?: string;
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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedActivity, setSelectedActivity] = useState<AgentActivity | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        
        const enrichedFallback = (fallbackData || []).map((activity: any) => ({
          ...activity,
          deal_room_id: dealRoomId,
        }));
        setActivities(enrichedFallback as AgentActivity[]);
        return;
      }

      const enrichedActivities = (data || []).map((activity: any) => ({
        ...activity,
        deal_room_id: dealRoomId,
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
          const newActivity = { ...payload.new, deal_room_id: dealRoomId } as AgentActivity;
          setActivities((prev) => [newActivity, ...prev]);
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
      (activity.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      JSON.stringify(activity.activity_data).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAgent = filterAgent === "all" || activity.agent_slug === filterAgent;
    const matchesOutcome = filterOutcome === "all" || activity.outcome_type === filterOutcome;
    
    return matchesSearch && matchesAgent && matchesOutcome;
  });

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyActivityData = async (activity: AgentActivity) => {
    const data = activity.activity_data || {};
    const textToCopy = [
      data.company_name && `Company: ${data.company_name}`,
      data.talking_point && `Talking Point: ${data.talking_point}`,
      data.source_url && `Source: ${data.source_url}`,
      data.signal_title && `Signal: ${data.signal_title}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(textToCopy || JSON.stringify(data, null, 2));
      setCopiedId(activity.id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

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
            Real-time log of all external agent activities • Click cards to expand or open details
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
            placeholder="Search activities, companies, signals..."
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
            {agents.filter((agent) => agent && agent.trim() !== '').map((agent) => (
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
            const isExpanded = expandedCards.has(activity.id);
            const data = activity.activity_data || {};
            
            return (
              <Collapsible
                key={activity.id}
                open={isExpanded}
                onOpenChange={() => toggleExpand(activity.id)}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer">
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
                              {/* Show company name inline if available */}
                              {(data.company_name || activity.company_name) && (
                                <div className="flex items-center gap-2 mt-1 text-sm font-medium text-foreground">
                                  → {String(data.company_name || activity.company_name)}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                {activity.contact_name && (
                                  <span>Contact: {activity.contact_name}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0 flex items-start gap-2">
                              <div>
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
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0 border-t">
                      <div className="pt-4 space-y-3">
                        {/* Talking Point */}
                        {data.talking_point && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">Talking Point</div>
                            <p className="text-sm">{String(data.talking_point)}</p>
                          </div>
                        )}

                        {/* Signal Title */}
                        {(data.signal_title || data.title) && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Signal</div>
                            <p className="text-sm font-medium">{String(data.signal_title || data.title)}</p>
                          </div>
                        )}

                        {/* Source URL */}
                        {data.source_url && (
                          <a
                            href={String(data.source_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:underline text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Source Article
                          </a>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyActivityData(activity);
                            }}
                          >
                            {copiedId === activity.id ? (
                              <Check className="w-4 h-4 mr-2 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 mr-2" />
                            )}
                            Copy
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedActivity(activity);
                            }}
                          >
                            <PanelRightOpen className="w-4 h-4 mr-2" />
                            Open Details & Actions
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Signal Detail Panel */}
      <SignalDetailPanel
        activity={selectedActivity}
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        onRefresh={fetchActivities}
      />
    </div>
  );
};
