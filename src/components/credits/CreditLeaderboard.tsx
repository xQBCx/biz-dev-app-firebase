import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Cpu, 
  Zap, 
  Target,
  TrendingUp,
  Bot,
  User,
  Flame,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  entity_id: string;
  entity_type: string;
  entity_name: string;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
  total_credits: number;
  total_events: number;
  rank: number;
}

type CreditType = "total" | "compute" | "action" | "outcome";
type TimeRange = "week" | "month" | "all";

const rankIcons: Record<number, { icon: React.ReactNode; color: string }> = {
  1: { icon: <Crown className="h-5 w-5" />, color: "text-yellow-500" },
  2: { icon: <Medal className="h-5 w-5" />, color: "text-slate-400" },
  3: { icon: <Medal className="h-5 w-5" />, color: "text-amber-600" },
};

const creditTypeConfig: Record<CreditType, { icon: React.ReactNode; label: string; color: string }> = {
  total: { icon: <Trophy className="h-4 w-4" />, label: "Total", color: "text-primary" },
  compute: { icon: <Cpu className="h-4 w-4" />, label: "Compute", color: "text-blue-500" },
  action: { icon: <Zap className="h-4 w-4" />, label: "Action", color: "text-amber-500" },
  outcome: { icon: <Target className="h-4 w-4" />, label: "Outcome", color: "text-green-500" },
};

export function CreditLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creditType, setCreditType] = useState<CreditType>("total");
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [viewType, setViewType] = useState<"humans" | "agents" | "all">("all");

  useEffect(() => {
    fetchLeaderboard();
  }, [creditType, timeRange, viewType]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (timeRange) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0);
    }

    // Query contribution events aggregated by actor
    let query = supabase
      .from("contribution_events")
      .select("actor_id, actor_type, compute_credits, action_credits, outcome_credits");
    
    if (timeRange !== "all") {
      query = query.gte("created_at", startDate.toISOString());
    }

    if (viewType === "humans") {
      query = query.eq("actor_type", "human");
    } else if (viewType === "agents") {
      query = query.eq("actor_type", "agent");
    }

    const { data: events, error } = await query;

    if (error) {
      console.error("Error fetching leaderboard:", error);
      setIsLoading(false);
      return;
    }

    // Aggregate by actor
    const aggregated = new Map<string, {
      entity_id: string;
      entity_type: string;
      compute_credits: number;
      action_credits: number;
      outcome_credits: number;
      total_events: number;
    }>();

    events?.forEach((event) => {
      const existing = aggregated.get(event.actor_id) || {
        entity_id: event.actor_id,
        entity_type: event.actor_type,
        compute_credits: 0,
        action_credits: 0,
        outcome_credits: 0,
        total_events: 0,
      };
      
      existing.compute_credits += Number(event.compute_credits || 0);
      existing.action_credits += Number(event.action_credits || 0);
      existing.outcome_credits += Number(event.outcome_credits || 0);
      existing.total_events += 1;
      
      aggregated.set(event.actor_id, existing);
    });

    // Convert to array and calculate totals
    let leaderboard = Array.from(aggregated.values()).map((entry) => ({
      ...entry,
      entity_name: entry.entity_type === "agent" ? `Agent ${entry.entity_id.slice(0, 8)}` : `User ${entry.entity_id.slice(0, 8)}`,
      total_credits: entry.compute_credits + entry.action_credits + entry.outcome_credits,
      rank: 0,
    }));

    // Sort by selected credit type
    const sortKey = creditType === "total" ? "total_credits" : `${creditType}_credits`;
    leaderboard.sort((a, b) => {
      const aVal = creditType === "total" ? a.total_credits : 
        creditType === "compute" ? a.compute_credits :
        creditType === "action" ? a.action_credits : a.outcome_credits;
      const bVal = creditType === "total" ? b.total_credits : 
        creditType === "compute" ? b.compute_credits :
        creditType === "action" ? b.action_credits : b.outcome_credits;
      return bVal - aVal;
    });

    // Assign ranks
    leaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    setEntries(leaderboard.slice(0, 25)); // Top 25
    setIsLoading(false);
  };

  const getScoreForType = (entry: LeaderboardEntry): number => {
    switch (creditType) {
      case "compute": return entry.compute_credits;
      case "action": return entry.action_credits;
      case "outcome": return entry.outcome_credits;
      default: return entry.total_credits;
    }
  };

  const maxScore = entries.length > 0 ? getScoreForType(entries[0]) : 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Credit Leaderboard
            </CardTitle>
            <CardDescription>Top contributors by credit type</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={viewType} onValueChange={(v) => setViewType(v as "humans" | "agents" | "all")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="humans">Humans</SelectItem>
                <SelectItem value="agents">Agents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={creditType} onValueChange={(v) => setCreditType(v as CreditType)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            {(Object.entries(creditTypeConfig) as [CreditType, typeof creditTypeConfig.total][]).map(([key, config]) => (
              <TabsTrigger key={key} value={key} className="gap-1.5">
                <span className={config.color}>{config.icon}</span>
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Loading leaderboard...
              </div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Trophy className="h-12 w-12 opacity-20" />
                <p>No contributions yet</p>
                <p className="text-sm">Complete tasks to appear on the leaderboard!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry) => {
                  const score = getScoreForType(entry);
                  const barWidth = maxScore > 0 ? (score / maxScore) * 100 : 0;
                  const rankConfig = rankIcons[entry.rank];
                  const config = creditTypeConfig[creditType];
                  
                  return (
                    <div 
                      key={entry.entity_id}
                      className={cn(
                        "relative flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-accent/50",
                        entry.rank <= 3 && "border-primary/20 bg-primary/5"
                      )}
                    >
                      {/* Rank */}
                      <div className="w-8 flex justify-center">
                        {rankConfig ? (
                          <span className={rankConfig.color}>{rankConfig.icon}</span>
                        ) : (
                          <span className="text-muted-foreground font-medium">#{entry.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn(
                          "text-sm font-medium",
                          entry.entity_type === "agent" ? "bg-purple-500/10 text-purple-500" : "bg-primary/10 text-primary"
                        )}>
                          {entry.entity_type === "agent" ? (
                            <Bot className="h-5 w-5" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{entry.entity_name}</span>
                          {entry.rank === 1 && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Flame className="h-3 w-3 text-orange-500" />
                              Top
                            </Badge>
                          )}
                          {entry.total_events >= 50 && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Star className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </div>
                        
                        {/* Progress bar background */}
                        <div className="relative mt-2 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                              creditType === "compute" && "bg-blue-500",
                              creditType === "action" && "bg-amber-500",
                              creditType === "outcome" && "bg-green-500",
                              creditType === "total" && "bg-primary"
                            )}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{entry.total_events} events</span>
                          <span className="text-blue-500">C: {entry.compute_credits.toFixed(1)}</span>
                          <span className="text-amber-500">A: {entry.action_credits.toFixed(1)}</span>
                          <span className="text-green-500">O: {entry.outcome_credits.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div className={cn("text-lg font-bold", config.color)}>
                          {score.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">credits</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Tabs>

        {/* Summary Stats */}
        {entries.length > 0 && (
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {entries.reduce((sum, e) => sum + e.total_credits, 0).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Credits</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {entries.length}
              </div>
              <div className="text-xs text-muted-foreground">Contributors</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {entries.reduce((sum, e) => sum + e.total_events, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
