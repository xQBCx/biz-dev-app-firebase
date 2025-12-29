import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Brain, 
  Cpu, 
  DollarSign, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  TrendingUp,
  Shield,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ModelUsage {
  model_name: string;
  model_provider: string;
  tokens_input: number;
  tokens_output: number;
  requests_count: number;
  total_cost: number;
  usage_date: string;
}

interface PlatformUsage {
  resource_subtype: string;
  quantity: number;
  estimated_cost_usd: number;
  created_at: string;
}

const MODEL_TIERS: Record<string, { tier: string; color: string; label: string }> = {
  "google/gemini-2.5-flash-lite": { tier: "nano", color: "bg-emerald-500", label: "Flash Lite (Nano)" },
  "google/gemini-2.5-flash": { tier: "fast", color: "bg-blue-500", label: "Flash (Fast)" },
  "google/gemini-2.5-pro": { tier: "pro", color: "bg-purple-500", label: "Pro" },
  "google/gemini-3-pro-preview": { tier: "premium", color: "bg-amber-500", label: "Gemini 3 (Premium)" },
  "openai/gpt-5": { tier: "premium", color: "bg-green-600", label: "GPT-5" },
  "openai/gpt-5-mini": { tier: "pro", color: "bg-green-500", label: "GPT-5 Mini" },
  "openai/gpt-5-nano": { tier: "fast", color: "bg-green-400", label: "GPT-5 Nano" },
};

// Daily budget limit (configurable per user later)
const DAILY_COST_LIMIT = 1.0;
const DAILY_REQUEST_LIMIT = 100;

export function AIUsageDashboard() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [safeMode, setSafeMode] = useState(false);

  // Fetch aggregated model usage
  const { data: modelUsage = [] } = useQuery({
    queryKey: ["ai-model-usage-dashboard"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from("ai_model_usage")
        .select("*")
        .gte("usage_date", sevenDaysAgo.toISOString().split('T')[0])
        .order("usage_date", { ascending: false });
      if (error) throw error;
      return data as ModelUsage[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch today's platform usage for the user
  const { data: todayUsage } = useQuery({
    queryKey: ["ai-today-usage", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("platform_usage_logs")
        .select("resource_subtype, quantity, estimated_cost_usd, created_at")
        .eq("user_id", user.id)
        .eq("resource_type", "ai_tokens")
        .gte("created_at", `${today}T00:00:00.000Z`);
      
      if (error) throw error;
      return data as PlatformUsage[];
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  // Calculate today's stats
  const todayStats = {
    totalTokens: todayUsage?.reduce((sum, u) => sum + (u.quantity || 0), 0) || 0,
    totalCost: todayUsage?.reduce((sum, u) => sum + (u.estimated_cost_usd || 0), 0) || 0,
    requestCount: todayUsage?.length || 0,
  };

  // Aggregate stats by model (7-day)
  const modelStats = modelUsage.reduce(
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
      acc[key].totalTokens += (u.tokens_input || 0) + (u.tokens_output || 0);
      acc[key].requests += u.requests_count || 0;
      acc[key].cost += u.total_cost || 0;
      return acc;
    },
    {} as Record<string, { model: string; provider: string; totalTokens: number; requests: number; cost: number }>
  );

  const sortedStats = Object.values(modelStats).sort((a, b) => b.requests - a.requests);
  const totalRequests = sortedStats.reduce((sum, s) => sum + s.requests, 0);
  const totalCost = sortedStats.reduce((sum, s) => sum + s.cost, 0);

  // Budget warnings
  const costPercentUsed = (todayStats.totalCost / DAILY_COST_LIMIT) * 100;
  const requestsPercentUsed = (todayStats.requestCount / DAILY_REQUEST_LIMIT) * 100;
  const isNearLimit = costPercentUsed > 80 || requestsPercentUsed > 80;
  const isOverLimit = costPercentUsed >= 100 || requestsPercentUsed >= 100;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className={`transition-colors ${isNearLimit ? 'border-amber-500/50' : ''} ${isOverLimit ? 'border-destructive/50' : ''}`}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Usage</CardTitle>
                  <CardDescription>
                    Today: {todayStats.requestCount} requests · ${todayStats.totalCost.toFixed(4)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isNearLimit && !isOverLimit && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Near Limit
                  </Badge>
                )}
                {isOverLimit && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    AI Paused
                  </Badge>
                )}
                {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {/* Mini progress bar always visible */}
            <div className="mt-3 space-y-1">
              <Progress value={Math.min(costPercentUsed, 100)} className="h-1.5" />
              <p className="text-xs text-muted-foreground text-right">
                ${todayStats.totalCost.toFixed(4)} / ${DAILY_COST_LIMIT.toFixed(2)} daily budget
              </p>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Today's Usage Meters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Daily Cost</span>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">${todayStats.totalCost.toFixed(4)}</p>
                <Progress value={Math.min(costPercentUsed, 100)} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {costPercentUsed.toFixed(0)}% of ${DAILY_COST_LIMIT.toFixed(2)} limit
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Requests Today</span>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{todayStats.requestCount}</p>
                <Progress value={Math.min(requestsPercentUsed, 100)} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {requestsPercentUsed.toFixed(0)}% of {DAILY_REQUEST_LIMIT} limit
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tokens Today</span>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{(todayStats.totalTokens / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Across all AI operations
                </p>
              </div>
            </div>

            {/* Safe Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Safe Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Force low-cost models only (Flash Lite / Nano tier)
                  </p>
                </div>
              </div>
              <Switch checked={safeMode} onCheckedChange={setSafeMode} />
            </div>

            {/* 7-Day Model Breakdown */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                7-Day Model Distribution
              </h4>
              {sortedStats.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No usage data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedStats.map((stat) => {
                    const modelInfo = MODEL_TIERS[stat.model] || { tier: 'unknown', color: 'bg-gray-500', label: stat.model };
                    const percentage = totalRequests > 0 ? (stat.requests / totalRequests) * 100 : 0;

                    return (
                      <div key={stat.model} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${modelInfo.color}`} />
                            <span className="font-medium">{modelInfo.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {modelInfo.tier}
                            </Badge>
                          </div>
                          <div className="text-right text-muted-foreground">
                            {stat.requests} req · ${stat.cost.toFixed(4)}
                          </div>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 7-Day Summary */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="text-sm text-muted-foreground">7-Day Total</p>
                <p className="font-medium">{totalRequests} requests · ${totalCost.toFixed(4)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open('https://lovable.dev/settings', '_blank')}>
                Top Up Credits
              </Button>
            </div>

            {/* AI Paused Warning */}
            {isOverLimit && (
              <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">AI Features Paused</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You've reached your daily usage limit. Top up your credits or wait until tomorrow to continue using AI features.
                    </p>
                    <Button variant="default" size="sm" className="mt-3" onClick={() => window.open('https://lovable.dev/settings', '_blank')}>
                      Add Credits
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
