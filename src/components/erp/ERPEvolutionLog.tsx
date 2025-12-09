import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ArrowRight, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface ERPEvolutionLogProps {
  erpConfigId: string;
}

interface EvolutionEntry {
  id: string;
  change_type: string;
  change_description: string;
  trigger_source: string;
  ai_reasoning: string;
  applied_at: string;
  previous_state: Record<string, any>;
  new_state: Record<string, any>;
}

const ERPEvolutionLog = ({ erpConfigId }: ERPEvolutionLogProps) => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["erp-evolution-log", erpConfigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("erp_evolution_log")
        .select("*")
        .eq("erp_config_id", erpConfigId)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data as EvolutionEntry[];
    },
  });

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "folder_added":
        return "📁";
      case "folder_removed":
        return "🗑️";
      case "workflow_added":
        return "⚡";
      case "integration_added":
        return "🔗";
      case "structure_optimized":
        return "✨";
      default:
        return "📝";
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "folder_added":
      case "workflow_added":
      case "integration_added":
        return "text-green-500";
      case "folder_removed":
        return "text-red-500";
      case "structure_optimized":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Evolution History
        </CardTitle>
        <CardDescription>
          Track how your ERP structure evolves over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading...
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {logs.map((log, idx) => (
                <div key={log.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span>{getChangeIcon(log.change_type)}</span>
                        <span className={`font-medium capitalize ${getChangeColor(log.change_type)}`}>
                          {log.change_type.replace("_", " ")}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.applied_at), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    
                    <p className="text-sm">{log.change_description}</p>
                    
                    {log.ai_reasoning && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted rounded p-2">
                        <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{log.ai_reasoning}</span>
                      </div>
                    )}
                    
                    {log.trigger_source && (
                      <div className="text-xs text-muted-foreground">
                        Triggered by: {log.trigger_source}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No evolution history yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Changes to your ERP structure will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ERPEvolutionLog;
