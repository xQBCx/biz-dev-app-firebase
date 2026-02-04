import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Bot, User } from "lucide-react";

interface ContributionEvent {
  id: string;
  actor_type: string;
  compute_credits: number;
  action_credits: number;
  outcome_credits: number;
}

interface CreditSourceBreakdownProps {
  events: ContributionEvent[];
}

const COLORS = {
  human: "hsl(217, 91%, 60%)",
  agent: "hsl(280, 87%, 65%)",
};

export function CreditSourceBreakdown({ events }: CreditSourceBreakdownProps) {
  const breakdown = useMemo(() => {
    const humanCredits = events
      .filter((e) => e.actor_type === "human")
      .reduce((sum, e) => sum + e.compute_credits + e.action_credits + e.outcome_credits, 0);

    const agentCredits = events
      .filter((e) => e.actor_type === "agent")
      .reduce((sum, e) => sum + e.compute_credits + e.action_credits + e.outcome_credits, 0);

    const humanEvents = events.filter((e) => e.actor_type === "human").length;
    const agentEvents = events.filter((e) => e.actor_type === "agent").length;

    return {
      pieData: [
        { name: "Human", value: humanCredits, color: COLORS.human },
        { name: "Agent", value: agentCredits, color: COLORS.agent },
      ].filter((d) => d.value > 0),
      humanCredits,
      agentCredits,
      humanEvents,
      agentEvents,
      total: humanCredits + agentCredits,
    };
  }, [events]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <div className="font-medium">{data.name}</div>
        <div className="text-muted-foreground">
          {data.value.toFixed(1)} credits ({((data.value / breakdown.total) * 100).toFixed(0)}%)
        </div>
      </div>
    );
  };

  if (breakdown.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Sources</CardTitle>
          <CardDescription>Human vs Agent contribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No credit data yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Sources</CardTitle>
        <CardDescription>Human vs Agent contribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {breakdown.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <User className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <div className="font-medium">{breakdown.humanCredits.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">
                  Human ({breakdown.humanEvents} events)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Bot className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <div className="font-medium">{breakdown.agentCredits.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">
                  Agent ({breakdown.agentEvents} events)
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
