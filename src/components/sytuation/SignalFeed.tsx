import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Radio, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Plus,
  Database,
  User,
  Activity,
  Bell,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SignalFeedProps {
  userId?: string;
}

const signalTypeIcons: Record<string, React.ElementType> = {
  data: Database,
  sensor: Activity,
  report: Info,
  system_log: Activity,
  financial: AlertTriangle,
  alert: AlertCircle,
  human_input: User,
};

const severityColors: Record<string, string> = {
  info: "text-muted-foreground",
  warning: "text-primary",
  alert: "text-destructive",
  critical: "text-destructive",
};

export function SignalFeed({ userId }: SignalFeedProps) {
  const [newSignal, setNewSignal] = useState("");
  const queryClient = useQueryClient();

  // Fetch recent signals (not tied to a situation)
  const { data: signals = [], refetch } = useQuery({
    queryKey: ['signals', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('situation_signals')
        .select('*')
        .eq('user_id', userId)
        .is('situation_id', null)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Add signal mutation
  const addSignalMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) throw new Error("Not authenticated");
      
      const { error } = await supabase.from('situation_signals').insert({
        user_id: userId,
        signal_type: 'human_input',
        source: 'Manual Entry',
        content,
        severity: 'info',
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewSignal("");
      refetch();
      toast.success("Signal logged");
    },
    onError: () => {
      toast.error("Failed to log signal");
    },
  });

  const handleAddSignal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSignal.trim()) return;
    addSignalMutation.mutate(newSignal);
  };

  return (
    <div className="border border-border rounded-lg bg-card h-fit sticky top-4">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium flex items-center gap-2">
          <Radio className="h-4 w-4" />
          Signal Feed
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Live inputs and observations
        </p>
      </div>

      {/* Add Signal */}
      <form onSubmit={handleAddSignal} className="p-3 border-b border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Log a signal..."
            value={newSignal}
            onChange={(e) => setNewSignal(e.target.value)}
            className="text-sm h-8"
          />
          <Button type="submit" size="sm" disabled={addSignalMutation.isPending}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </form>

      {/* Signal List */}
      <div className="max-h-[400px] overflow-y-auto">
        {signals.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <Bell className="h-6 w-6 mx-auto mb-2 opacity-50" />
            No signals yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {signals.map((signal: any) => {
              const Icon = signalTypeIcons[signal.signal_type] || Info;
              return (
                <div key={signal.id} className="p-3 hover:bg-muted/30">
                  <div className="flex items-start gap-2">
                    <Icon className={cn("h-4 w-4 mt-0.5", severityColors[signal.severity])} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{signal.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{signal.source}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(signal.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {signal.ai_interpretation && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          AI: {signal.ai_interpretation}
                        </p>
                      )}
                    </div>
                    {signal.severity !== 'info' && (
                      <Badge variant="outline" className={cn("text-xs", severityColors[signal.severity])}>
                        {signal.severity}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
