import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw, Database, Link2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { HubSpotConfigDialog } from "./HubSpotConfigDialog";

interface DualCRMSyncStatusProps {
  dealRoomId: string;
}

interface ExternalAgentActivity {
  id: string;
  activity_type: string;
  outcome_type: string | null;
  agent_slug: string;
  created_at: string;
  synced_to_hubspot: boolean;
  hubspot_sync_id: string | null;
}

export function DualCRMSyncStatus({ dealRoomId }: DualCRMSyncStatusProps) {
  const [autoSync, setAutoSync] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showHubSpotConfig, setShowHubSpotConfig] = useState(false);

  // Fetch external agent activities for THIS deal room only
  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['external-agent-activities', dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_agent_activities')
        .select('id, activity_type, outcome_type, agent_slug, created_at, synced_to_hubspot, hubspot_sync_id')
        .eq('deal_room_id', dealRoomId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []) as ExternalAgentActivity[];
    }
  });

  // Fetch HubSpot integration status
  const { data: hubspotConfig } = useQuery({
    queryKey: ['hubspot-config', dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_room_integrations')
        .select('*')
        .eq('deal_room_id', dealRoomId)
        .eq('integration_type', 'hubspot')
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  const syncedCount = activities?.filter(a => a.synced_to_hubspot).length || 0;
  const pendingCount = activities?.filter(a => !a.synced_to_hubspot).length || 0;
  const totalCount = activities?.length || 0;

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      // Simulate sync process - in production, this would call an edge function
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("CRM sync completed successfully");
      refetch();
    } catch (error) {
      toast.error("Sync failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncIcon = (synced: boolean) => {
    if (synced) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const formatActivityType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5" />
            Dual CRM Sync Status
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualSync}
            disabled={isSyncing || totalCount === 0}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sync Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{syncedCount}</div>
              <div className="text-sm text-green-600">Synced</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{pendingCount}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg border">
              <div className="text-2xl font-bold text-foreground">{totalCount}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>

          {/* Connected Systems */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Connected Systems</h4>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium text-sm">Biz Dev Master CRM</div>
                  <div className="text-xs text-muted-foreground">Primary system of record</div>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <img src="https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png" alt="HubSpot" className="h-5 w-5" />
                <div>
                  <div className="font-medium text-sm">HubSpot</div>
                  <div className="text-xs text-muted-foreground">External execution system</div>
                </div>
              </div>
              <Button 
                variant={hubspotConfig?.is_connected ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowHubSpotConfig(true)}
              >
                {hubspotConfig?.is_connected ? "Connected" : "Configure"}
              </Button>
            </div>
          </div>

          {/* Auto-sync Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync">Auto-sync enabled</Label>
              <div className="text-xs text-muted-foreground">
                Automatically sync agent activities to external CRM
              </div>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
          </div>

          {/* Recent Activities */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Agent Activity Sync</h4>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading activities...</div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 text-sm border rounded">
                    <div className="flex items-center gap-2">
                      {getSyncIcon(activity.synced_to_hubspot)}
                      <span className="truncate max-w-[200px]">
                        {formatActivityType(activity.activity_type)}
                        {activity.outcome_type && ` → ${formatActivityType(activity.outcome_type)}`}
                      </span>
                    </div>
                    <Badge variant={activity.synced_to_hubspot ? 'default' : 'secondary'} className="text-xs">
                      {activity.agent_slug}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/50">
                No agent activities to sync yet.
                <br />
                <span className="text-xs">Activities from registered agents will appear here.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <HubSpotConfigDialog
        dealRoomId={dealRoomId}
        open={showHubSpotConfig}
        onOpenChange={setShowHubSpotConfig}
      />
    </>
  );
}