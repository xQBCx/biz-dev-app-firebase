import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Cpu, DollarSign, Zap } from "lucide-react";

interface ModelUsage {
  model_provider: string;
  model_name: string;
  tokens_input: number;
  tokens_output: number;
  requests_count: number;
  total_cost: number;
  usage_date: string;
}

const MODEL_COLORS: Record<string, string> = {
  "google/gemini-2.5-flash": "bg-blue-500",
  "google/gemini-2.5-pro": "bg-blue-600",
  "openai/gpt-5": "bg-green-600",
  "openai/gpt-5-mini": "bg-green-500",
  "openai/gpt-5-nano": "bg-green-400",
};

const MODEL_LABELS: Record<string, string> = {
  "google/gemini-2.5-flash": "Gemini Flash",
  "google/gemini-2.5-pro": "Gemini Pro",
  "openai/gpt-5": "GPT-5",
  "openai/gpt-5-mini": "GPT-5 Mini",
  "openai/gpt-5-nano": "GPT-5 Nano",
};

export function ModelUsageStats() {
  const { data: usage = [], isLoading } = useQuery({
    queryKey: ["ai-model-usage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_model_usage")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ModelUsage[];
    },
  });

  // Aggregate stats by model
  const modelStats = usage.reduce(
    (acc, u) => {
      const key = u.model_name;
      if (!acc[key]) {
        acc[key] = {
          model: key,
          provider: u.model_provider,
          totalTokens: 0,
          requests: 0,
          cost: 0,
        };
      }
      acc[key].totalTokens += u.tokens_input + u.tokens_output;
      acc[key].requests += u.requests_count;
      acc[key].cost += u.total_cost || 0;
      return acc;
    },
    {} as Record<string, { model: string; provider: string; totalTokens: number; requests: number; cost: number }>
  );

  const sortedStats = Object.values(modelStats).sort((a, b) => b.requests - a.requests);
  const totalRequests = sortedStats.reduce((sum, s) => sum + s.requests, 0);
  const totalTokens = sortedStats.reduce((sum, s) => sum + s.totalTokens, 0);
  const totalCost = sortedStats.reduce((sum, s) => sum + s.cost, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
              </div>
              <Brain className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tokens Processed</p>
                <p className="text-2xl font-bold">{(totalTokens / 1000).toFixed(1)}K</p>
              </div>
              <Cpu className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Cost</p>
                <p className="text-2xl font-bold">${totalCost.toFixed(4)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Models Used</p>
                <p className="text-2xl font-bold">{sortedStats.length}</p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Model Usage Breakdown</CardTitle>
          <CardDescription>AI arbitrage across multiple providers</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No model usage data yet</p>
              <p className="text-sm">Analyze bills to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedStats.map((stat) => {
                const percentage = totalRequests > 0 ? (stat.requests / totalRequests) * 100 : 0;
                const color = MODEL_COLORS[stat.model] || "bg-primary";

                return (
                  <div key={stat.model} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="font-medium">
                          {MODEL_LABELS[stat.model] || stat.model}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {stat.provider}
                        </Badge>
                      </div>
                      <div className="text-right text-sm">
                        <span className="font-medium">{stat.requests} requests</span>
                        <span className="text-muted-foreground ml-2">
                          ({(stat.totalTokens / 1000).toFixed(1)}K tokens)
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Arbitrage Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>AI Arbitrage Strategy</CardTitle>
          <CardDescription>
            Intelligent model routing for cost optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Fast Extraction</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Quick data extraction from bills
              </p>
              <Badge>Gemini Flash</Badge>
            </div>

            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Deep Analysis</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Complex optimization recommendations
              </p>
              <Badge>GPT-5 Mini</Badge>
            </div>

            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">High-Stakes Decisions</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Critical cost optimization
              </p>
              <Badge>GPT-5</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
