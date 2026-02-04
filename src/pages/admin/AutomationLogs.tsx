import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Json } from "@/integrations/supabase/types";

interface AutomationLog {
  id: string;
  message: string;
  run_time: string;
  workflow_id: string | null;
  agent_id: string | null;
  execution_metadata: Json;
  created_at: string;
}

export default function AutomationLogs() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: logs, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["automation-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_automation_logs")
        .select("*")
        .order("run_time", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AutomationLog[];
    },
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
  });

  // Manual trigger for testing
  const triggerManualRun = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("sanity-check-cron");
      if (error) throw error;
      console.log("Manual trigger result:", data);
      refetch();
    } catch (err) {
      console.error("Manual trigger failed:", err);
    }
  };

  const getStatusBadge = (metadata: Json) => {
    const meta = metadata as Record<string, unknown> | null;
    if (!meta) return <Badge variant="secondary">Unknown</Badge>;
    
    if (meta.error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="default" className="bg-green-600">Success</Badge>;
  };

  const getModelBadge = (metadata: Json) => {
    const meta = metadata as Record<string, unknown> | null;
    if (!meta?.model_used) return null;
    
    const model = String(meta.model_used);
    if (model.includes("gemini")) {
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Gemini</Badge>;
    }
    if (model.includes("perplexity")) {
      return <Badge variant="outline" className="text-purple-600 border-purple-600">Perplexity</Badge>;
    }
    if (model === "fallback") {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Fallback</Badge>;
    }
    return <Badge variant="outline">{model}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Cloud Automation Logs
              </CardTitle>
              <CardDescription>
                Proving the workflow engine runs autonomously in the cloud
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "text-green-600" : "text-muted-foreground"}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "Auto" : "Paused"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
              <Button size="sm" onClick={triggerManualRun}>
                Manual Trigger
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status summary */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{logs?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm">
                  {dataUpdatedAt 
                    ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latest Run</p>
                <p className="text-sm">
                  {logs?.[0]?.run_time 
                    ? formatDistanceToNow(new Date(logs[0].run_time), { addSuffix: true })
                    : "No runs yet"}
                </p>
              </div>
            </div>
          </div>

          {/* Logs list */}
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : logs?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No automation logs yet.</p>
                <p className="text-sm">Click "Manual Trigger" to test or wait for scheduled runs.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs?.map((log) => {
                  const meta = log.execution_metadata as Record<string, unknown> | null;
                  return (
                    <div
                      key={log.id}
                      className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(log.execution_metadata)}
                            {getModelBadge(log.execution_metadata)}
                            {meta?.trigger === "cron" && (
                              <Badge variant="secondary">Scheduled</Badge>
                            )}
                          </div>
                          <p className="text-sm break-words">{log.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              {new Date(log.run_time).toLocaleString()}
                            </span>
                            {meta?.duration_ms && (
                              <span>{Number(meta.duration_ms)}ms</span>
                            )}
                            {meta?.tokens_used && Number(meta.tokens_used) > 0 && (
                              <span>{String(meta.tokens_used)} tokens</span>
                            )}
                          </div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">How to Verify Cloud Execution</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>1. Close this browser tab</strong> — The workflow runs independently.
          </p>
          <p>
            <strong>2. Wait 10-15 minutes</strong> — New logs should appear every ~5 minutes.
          </p>
          <p>
            <strong>3. Return and check</strong> — You should see multiple new rows with unique timestamps.
          </p>
          <p className="text-xs mt-4">
            Each log shows: AI-generated message, model used (Gemini/Perplexity), execution time, and whether it was scheduled or manual.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
