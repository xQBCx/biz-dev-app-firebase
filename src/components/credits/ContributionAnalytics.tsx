import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from "recharts";
import { format, subDays, subMonths, startOfDay, startOfWeek, startOfMonth, parseISO, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import {
  TrendingUp, TrendingDown, Activity, BarChart3, PieChartIcon,
  Calendar, Cpu, Zap, Target, Bot, User, Clock, Anchor
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContributionEvent {
  id: string;
  actor_type: string;
  event_type: string;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
  xodiak_anchor_status: string;
  created_at: string;
  value_category: string | null;
}

type TimeRange = "7d" | "30d" | "90d";

const COLORS = {
  compute: "hsl(217, 91%, 60%)",
  action: "hsl(43, 96%, 56%)",
  outcome: "hsl(142, 71%, 45%)",
  human: "hsl(217, 91%, 60%)",
  agent: "hsl(280, 87%, 65%)",
};

export function ContributionAnalytics() {
  const [events, setEvents] = useState<ContributionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  useEffect(() => {
    fetchEvents();
  }, [timeRange]);

  const fetchEvents = async () => {
    setIsLoading(true);
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = subDays(new Date(), days);

    const { data, error } = await supabase
      .from("contribution_events")
      .select("id, actor_type, event_type, compute_credits, action_credits, outcome_credits, xodiak_anchor_status, created_at, value_category")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setIsLoading(false);
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalCompute = events.reduce((sum, e) => sum + Number(e.compute_credits || 0), 0);
    const totalAction = events.reduce((sum, e) => sum + Number(e.action_credits || 0), 0);
    const totalOutcome = events.reduce((sum, e) => sum + Number(e.outcome_credits || 0), 0);
    const total = totalCompute + totalAction + totalOutcome;

    const humanEvents = events.filter(e => e.actor_type === "human");
    const agentEvents = events.filter(e => e.actor_type === "agent");
    const anchoredEvents = events.filter(e => e.xodiak_anchor_status === "anchored");

    // Calculate daily average
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const dailyAvg = total / days;

    // Compare to previous period (simplified)
    const midpoint = Math.floor(events.length / 2);
    const firstHalf = events.slice(0, midpoint).reduce((sum, e) => 
      sum + Number(e.compute_credits || 0) + Number(e.action_credits || 0) + Number(e.outcome_credits || 0), 0);
    const secondHalf = events.slice(midpoint).reduce((sum, e) => 
      sum + Number(e.compute_credits || 0) + Number(e.action_credits || 0) + Number(e.outcome_credits || 0), 0);
    const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

    return {
      total,
      totalCompute,
      totalAction,
      totalOutcome,
      eventCount: events.length,
      humanCount: humanEvents.length,
      agentCount: agentEvents.length,
      anchoredCount: anchoredEvents.length,
      dailyAvg,
      trend,
    };
  }, [events, timeRange]);

  // Daily trend data
  const dailyTrend = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const interval = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date(),
    });

    return interval.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayEvents = events.filter(e => 
        format(parseISO(e.created_at), "yyyy-MM-dd") === dateStr
      );

      return {
        date: format(date, timeRange === "7d" ? "EEE" : "MMM d"),
        compute: dayEvents.reduce((sum, e) => sum + Number(e.compute_credits || 0), 0),
        action: dayEvents.reduce((sum, e) => sum + Number(e.action_credits || 0), 0),
        outcome: dayEvents.reduce((sum, e) => sum + Number(e.outcome_credits || 0), 0),
        events: dayEvents.length,
      };
    });
  }, [events, timeRange]);

  // Event type breakdown
  const eventTypeBreakdown = useMemo(() => {
    const breakdown = new Map<string, { count: number; credits: number }>();
    
    events.forEach(e => {
      const existing = breakdown.get(e.event_type) || { count: 0, credits: 0 };
      existing.count += 1;
      existing.credits += Number(e.compute_credits || 0) + Number(e.action_credits || 0) + Number(e.outcome_credits || 0);
      breakdown.set(e.event_type, existing);
    });

    return Array.from(breakdown.entries())
      .map(([name, data]) => ({
        name: name.replace(/_/g, " "),
        ...data,
      }))
      .sort((a, b) => b.credits - a.credits)
      .slice(0, 8);
  }, [events]);

  // Actor breakdown for pie chart
  const actorBreakdown = useMemo(() => {
    const humanCredits = events
      .filter(e => e.actor_type === "human")
      .reduce((sum, e) => sum + Number(e.compute_credits || 0) + Number(e.action_credits || 0) + Number(e.outcome_credits || 0), 0);
    const agentCredits = events
      .filter(e => e.actor_type === "agent")
      .reduce((sum, e) => sum + Number(e.compute_credits || 0) + Number(e.action_credits || 0) + Number(e.outcome_credits || 0), 0);

    return [
      { name: "Human", value: humanCredits, color: COLORS.human },
      { name: "Agent", value: agentCredits, color: COLORS.agent },
    ].filter(d => d.value > 0);
  }, [events]);

  // Credit type breakdown
  const creditTypeBreakdown = useMemo(() => [
    { name: "Compute", value: stats.totalCompute, color: COLORS.compute },
    { name: "Action", value: stats.totalAction, color: COLORS.action },
    { name: "Outcome", value: stats.totalOutcome, color: COLORS.outcome },
  ].filter(d => d.value > 0), [stats]);

  // Hourly heatmap data
  const hourlyPattern = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: i === 0 ? "12am" : i === 12 ? "12pm" : i > 12 ? `${i-12}pm` : `${i}am`,
      count: 0,
      credits: 0,
    }));

    events.forEach(e => {
      const hour = new Date(e.created_at).getHours();
      hours[hour].count += 1;
      hours[hour].credits += Number(e.compute_credits || 0) + Number(e.action_credits || 0) + Number(e.outcome_credits || 0);
    });

    return hours;
  }, [events]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <div className="font-medium mb-2">{label}</div>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Activity className="h-5 w-5 animate-spin mr-2" />
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Contribution Analytics
          </h2>
          <p className="text-muted-foreground">Patterns and trends in your platform activity</p>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{stats.total.toFixed(1)}</p>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm",
                stats.trend >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {stats.trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(stats.trend).toFixed(0)}%
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold">{stats.dailyAvg.toFixed(1)}</p>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.eventCount}</p>
              </div>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {stats.humanCount}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Bot className="h-3 w-3 mr-1" />
                  {stats.agentCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anchored</p>
                <p className="text-2xl font-bold">{stats.anchoredCount}</p>
              </div>
              <Anchor className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-2">
            <Clock className="h-4 w-4" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          {/* Stacked Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Accumulation Over Time</CardTitle>
              <CardDescription>Daily credits earned by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="computeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.compute} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.compute} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="actionGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.action} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.action} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="outcomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.outcome} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.outcome} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="compute" name="Compute" stroke={COLORS.compute} fill="url(#computeGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="action" name="Action" stroke={COLORS.action} fill="url(#actionGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="outcome" name="Outcome" stroke={COLORS.outcome} fill="url(#outcomeGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Event Count Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Event Volume</CardTitle>
              <CardDescription>Number of contribution events per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="events" name="Events" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Actor Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Contributor Type</CardTitle>
                <CardDescription>Human vs Agent contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={actorBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {actorBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Credit Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Credit Distribution</CardTitle>
                <CardDescription>Compute vs Action vs Outcome</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={creditTypeBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {creditTypeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Type Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Event Types</CardTitle>
              <CardDescription>Most valuable contribution categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventTypeBreakdown} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="credits" name="Credits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {/* Hourly Activity Pattern */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Activity Pattern</CardTitle>
              <CardDescription>When contributions happen throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyPattern}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10 }}
                      interval={2}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Events" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Credit Type Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Cpu className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Compute Credits</p>
                    <p className="text-2xl font-bold">{stats.totalCompute.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 ? ((stats.totalCompute / stats.total) * 100).toFixed(0) : 0}% of total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-amber-500/10">
                    <Zap className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Action Credits</p>
                    <p className="text-2xl font-bold">{stats.totalAction.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 ? ((stats.totalAction / stats.total) * 100).toFixed(0) : 0}% of total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Target className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Outcome Credits</p>
                    <p className="text-2xl font-bold">{stats.totalOutcome.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.total > 0 ? ((stats.totalOutcome / stats.total) * 100).toFixed(0) : 0}% of total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
