import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Unlock, Shield, Loader2 } from "lucide-react";

export const EncodingHistory = () => {
  const { user } = useAuth();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["qbc-encoding-logs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qbc_encoding_log")
        .select("*, qbc_lattices(lattice_name)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case "encode":
        return <Lock className="h-4 w-4 text-green-500" />;
      case "decode":
        return <Unlock className="h-4 w-4 text-blue-500" />;
      case "verify":
        return <Shield className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case "encode":
        return "bg-green-500/10 text-green-600";
      case "decode":
        return "bg-blue-500/10 text-blue-600";
      case "verify":
        return "bg-amber-500/10 text-amber-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Recent Activity</h4>
        <Badge variant="secondary">{logs?.length || 0} operations</Badge>
      </div>

      <div className="space-y-2">
        {logs?.map((log) => (
          <div
            key={log.id}
            className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
          >
            <div className={`p-2 rounded-lg ${getOperationColor(log.operation)}`}>
              {getOperationIcon(log.operation)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium capitalize">{log.operation}</span>
                <Badge variant="outline" className="text-xs">
                  {log.encoding_type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Hash: {log.content_hash?.slice(0, 24)}...
              </p>
            </div>

            <div className="text-right text-sm text-muted-foreground">
              <p>{new Date(log.created_at).toLocaleDateString()}</p>
              <p className="text-xs">{new Date(log.created_at).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}

        {(!logs || logs.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No encoding history yet</p>
            <p className="text-sm">Your encode/decode operations will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};
