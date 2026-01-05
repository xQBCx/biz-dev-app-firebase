import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subDays, parseISO, startOfDay } from "date-fns";

interface ContributionEvent {
  id: string;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
  created_at: string;
}

interface CreditTrendChartProps {
  events: ContributionEvent[];
}

export function CreditTrendChart({ events }: CreditTrendChartProps) {
  const chartData = useMemo(() => {
    // Build last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      return {
        date: format(date, "yyyy-MM-dd"),
        label: format(date, "EEE"),
        compute: 0,
        action: 0,
        outcome: 0,
      };
    });

    // Aggregate events by day
    events.forEach((event) => {
      const eventDate = format(startOfDay(parseISO(event.created_at)), "yyyy-MM-dd");
      const dayData = days.find((d) => d.date === eventDate);
      if (dayData) {
        dayData.compute += event.compute_credits;
        dayData.action += event.action_credits;
        dayData.outcome += event.outcome_credits;
      }
    });

    // Calculate cumulative
    let computeSum = 0;
    let actionSum = 0;
    let outcomeSum = 0;

    return days.map((day) => {
      computeSum += day.compute;
      actionSum += day.action;
      outcomeSum += day.outcome;
      return {
        ...day,
        computeCumulative: computeSum,
        actionCumulative: actionSum,
        outcomeCumulative: outcomeSum,
      };
    });
  }, [events]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <div className="font-medium mb-2">{label}</div>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Accumulation</CardTitle>
        <CardDescription>7-day trend of credits earned</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="computeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="actionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outcomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12 }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="computeCumulative"
                name="Compute"
                stroke="hsl(217, 91%, 60%)"
                fill="url(#computeGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="actionCumulative"
                name="Action"
                stroke="hsl(43, 96%, 56%)"
                fill="url(#actionGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="outcomeCumulative"
                name="Outcome"
                stroke="hsl(142, 71%, 45%)"
                fill="url(#outcomeGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
