import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  TrendingUp,
  Clock,
  Loader2
} from "lucide-react";
import { BlenderKnowledgeHelper } from "./BlenderKnowledgeHelper";
import { format } from "date-fns";

interface UsageTrackingPanelProps {
  dealRoomId: string;
}

interface UsageLog {
  id: string;
  ingredient_id: string;
  ingredient_name?: string;
  usage_type: string;
  quantity: number;
  unit: string;
  cost_incurred: number;
  recorded_at: string;
}

interface UsageSummary {
  ingredient_id: string;
  ingredient_name: string;
  total_usage: number;
  total_cost: number;
  usage_count: number;
}

const usageTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  api_call: { label: "API Call", icon: Zap, color: "text-blue-500" },
  compute: { label: "Compute", icon: Cpu, color: "text-purple-500" },
  storage: { label: "Storage", icon: Database, color: "text-amber-500" },
  data_access: { label: "Data Access", icon: Activity, color: "text-emerald-500" },
};

export const UsageTrackingPanel = ({ dealRoomId }: UsageTrackingPanelProps) => {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [summaries, setSummaries] = useState<UsageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
    
    // Set up realtime subscription
    const channel = supabase
      .channel(`usage-${dealRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blender_usage_logs',
        },
        (payload) => {
          setLogs(prev => [payload.new as UsageLog, ...prev].slice(0, 50));
          updateSummaries(payload.new as UsageLog);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealRoomId]);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      // Fetch ingredients for this deal room - using any cast since types may not be regenerated
      const { data: ingredients } = await (supabase as any)
        .from("blender_ingredients")
        .select("id, name")
        .eq("deal_room_id", dealRoomId);

      if (!ingredients || ingredients.length === 0) {
        setLoading(false);
        return;
      }

      const ingredientIds = (ingredients as any[]).map((i: any) => i.id);
      const ingredientMap = new Map((ingredients as any[]).map((i: any) => [i.id, i.name]));

      // Fetch usage logs
      const { data: logsData } = await (supabase as any)
        .from("blender_usage_logs")
        .select("*")
        .in("ingredient_id", ingredientIds)
        .order("recorded_at", { ascending: false })
        .limit(50);

      if (logsData) {
        const logsWithNames = (logsData as any[]).map((log: any) => ({
          ...log,
          ingredient_name: ingredientMap.get(log.ingredient_id) || "Unknown",
        }));
        setLogs(logsWithNames);

        // Calculate summaries
        const summaryMap = new Map<string, UsageSummary>();
        logsData.forEach((log: any) => {
          const existing = summaryMap.get(log.ingredient_id);
          if (existing) {
            existing.total_usage += log.quantity;
            existing.total_cost += log.cost_incurred || 0;
            existing.usage_count += 1;
          } else {
            summaryMap.set(log.ingredient_id, {
              ingredient_id: log.ingredient_id,
              ingredient_name: ingredientMap.get(log.ingredient_id) || "Unknown",
              total_usage: log.quantity,
              total_cost: log.cost_incurred || 0,
              usage_count: 1,
            });
          }
        });
        setSummaries(Array.from(summaryMap.values()));
      }
    } catch (error) {
      console.error("Error fetching usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSummaries = (newLog: UsageLog) => {
    setSummaries(prev => {
      const existing = prev.find(s => s.ingredient_id === newLog.ingredient_id);
      if (existing) {
        return prev.map(s => 
          s.ingredient_id === newLog.ingredient_id
            ? {
                ...s,
                total_usage: s.total_usage + newLog.quantity,
                total_cost: s.total_cost + (newLog.cost_incurred || 0),
                usage_count: s.usage_count + 1,
              }
            : s
        );
      }
      return prev;
    });
  };

  const totalCost = summaries.reduce((sum, s) => sum + s.total_cost, 0);
  const totalUsage = logs.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Real-time Usage Tracking</h3>
        <BlenderKnowledgeHelper conceptKey="usage_credits" />
        <Badge variant="outline" className="ml-auto gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-medium">Total Events</span>
          </div>
          <p className="text-3xl font-bold">{totalUsage}</p>
          <p className="text-sm text-muted-foreground">Tracked operations</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <span className="font-medium">Total Cost</span>
          </div>
          <p className="text-3xl font-bold text-emerald-500">
            ${totalCost.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">Resource consumption</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-purple-500" />
            <span className="font-medium">Active Ingredients</span>
          </div>
          <p className="text-3xl font-bold text-purple-500">{summaries.length}</p>
          <p className="text-sm text-muted-foreground">With usage</p>
        </Card>
      </div>

      {/* Usage by Ingredient */}
      {summaries.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-4">Usage by Ingredient</h4>
          <div className="space-y-4">
            {summaries.map((summary) => {
              const maxUsage = Math.max(...summaries.map(s => s.total_usage));
              const percentage = (summary.total_usage / maxUsage) * 100;
              
              return (
                <div key={summary.ingredient_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{summary.ingredient_name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {summary.usage_count} calls
                      </span>
                      <span className="font-medium text-emerald-500">
                        ${summary.total_cost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      <div>
        <h4 className="font-medium mb-4">Recent Activity</h4>
        {logs.length === 0 ? (
          <Card className="p-8 text-center">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Usage Data</h3>
            <p className="text-muted-foreground">
              Usage will be tracked automatically as ingredients are used
            </p>
          </Card>
        ) : (
          <Card className="divide-y">
            {logs.slice(0, 10).map((log) => {
              const config = usageTypeConfig[log.usage_type] || usageTypeConfig.api_call;
              const Icon = config.icon;
              
              return (
                <div key={log.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{log.ingredient_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        <span>{log.quantity} {log.unit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      ${(log.cost_incurred || 0).toFixed(4)}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(log.recorded_at), "h:mm:ss a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
};
