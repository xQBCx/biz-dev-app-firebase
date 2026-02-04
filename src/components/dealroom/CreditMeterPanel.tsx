import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gauge, Zap, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

interface CreditMeterPanelProps {
  dealRoomId: string;
}

type CreditMeter = Database["public"]["Tables"]["platform_credit_meters"]["Row"];
type CreditUsage = Database["public"]["Tables"]["platform_credit_usage"]["Row"];

export function CreditMeterPanel({ dealRoomId }: CreditMeterPanelProps) {
  // Fetch credit meters for this deal room
  const { data: meters, isLoading: metersLoading } = useQuery({
    queryKey: ["credit-meters", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_credit_meters")
        .select("*")
        .eq("deal_room_id", dealRoomId);

      if (error) throw error;
      return data;
    }
  });

  // Fetch recent usage
  const { data: recentUsage } = useQuery({
    queryKey: ["credit-usage", dealRoomId],
    queryFn: async () => {
      const meterIds = meters?.map(m => m.id) || [];
      if (meterIds.length === 0) return [];

      const { data, error } = await supabase
        .from("platform_credit_usage")
        .select("*")
        .in("meter_id", meterIds)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!meters?.length
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "lindy.ai": return "🤖";
      case "n8n": return "⚡";
      case "hubspot": return "🔶";
      default: return "📊";
    }
  };

  const getUsagePercent = (consumed: number | null, purchased: number | null) => {
    const used = consumed || 0;
    const allocated = purchased || 0;
    return allocated > 0 ? Math.min((used / allocated) * 100, 100) : 0;
  };

  const getUsageStatus = (percent: number) => {
    if (percent >= 90) return { variant: "destructive" as const, label: "Critical" };
    if (percent >= 75) return { variant: "secondary" as const, label: "High" };
    if (percent >= 50) return { variant: "outline" as const, label: "Moderate" };
    return { variant: "default" as const, label: "Normal" };
  };

  // Calculate totals
  const totalCost = meters?.reduce((sum, m) => sum + ((m.credits_consumed || 0) * (m.cost_per_credit || 0)), 0) || 0;
  const totalBilled = meters?.reduce((sum, m) => {
    const cost = (m.credits_consumed || 0) * (m.cost_per_credit || 0);
    return sum + cost + (cost * ((m.markup_percentage || 0) / 100));
  }, 0) || 0;
  const totalMargin = totalBilled - totalCost;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              Credit Metering
            </CardTitle>
            <CardDescription>
              Platform usage tracking with cost pass-through
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">
              Cost: {formatCurrency(totalCost)}
            </Badge>
            <Badge variant="default">
              Margin: {formatCurrency(totalMargin)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Credit Meters Grid */}
        {metersLoading ? (
          <div className="text-sm text-muted-foreground">Loading meters...</div>
        ) : meters?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Gauge className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No credit meters configured for this Deal Room</p>
            <p className="text-xs mt-1">Meters are auto-created when platform integrations are used</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {meters?.map((meter) => {
              const usagePercent = getUsagePercent(meter.credits_consumed, meter.credits_purchased);
              const status = getUsageStatus(usagePercent);
              const rawCost = (meter.credits_consumed || 0) * (meter.cost_per_credit || 0);
              const billedCost = rawCost + (rawCost * ((meter.markup_percentage || 0) / 100));

              return (
                <div 
                  key={meter.id}
                  className="p-4 border rounded-lg bg-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getPlatformIcon(meter.platform_name)}</span>
                      <div>
                        <p className="font-medium">{meter.platform_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {meter.credit_type} • {meter.markup_percentage || 0}% markup
                        </p>
                      </div>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{(meter.credits_consumed || 0).toLocaleString()} / {(meter.credits_purchased || 0).toLocaleString()} credits</span>
                      <span>{usagePercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                  </div>

                  <div className="flex justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      Raw: {formatCurrency(rawCost)}
                    </div>
                    <div className="font-medium text-primary">
                      Billed: {formatCurrency(billedCost)}
                    </div>
                  </div>

                  {usagePercent >= 90 && (
                    <div className="flex items-center gap-2 p-2 bg-destructive/10 text-destructive rounded text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      Credits nearly exhausted - workflows may pause
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Usage Activity */}
        {recentUsage && recentUsage.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Usage
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentUsage.map((usage) => (
                <div 
                  key={usage.id}
                  className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">
                      {usage.action_type}
                    </span>
                    {usage.agent_id && (
                      <span className="text-xs text-muted-foreground">
                        by agent
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs">
                      {usage.credits_used} credits
                    </span>
                    <span className="font-medium">
                      {formatCurrency(usage.billed_cost || 0)}
                    </span>
                    {usage.created_at && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(usage.created_at), "h:mm a")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
