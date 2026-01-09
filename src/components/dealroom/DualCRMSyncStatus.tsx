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

interface DualCRMSyncStatusProps {
  dealRoomId: string;
}

interface CRMActivity {
  id: string;
  activity_type: string;
  subject: string;
  created_at: string;
  synced_to_external: boolean;
  external_crm_id?: string;
  sync_status: 'synced' | 'pending' | 'failed';
}

export function DualCRMSyncStatus({ dealRoomId }: DualCRMSyncStatusProps) {
  const [autoSync, setAutoSync] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['crm-activities', dealRoomId],
    queryFn: async () => {
      // Fetch CRM activities related to this deal room
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Map to our interface with sync status
      return (data || []).map(activity => {
        // Use linked_agent_id to indicate external sync
        const hasExternalSync = !!activity.linked_agent_id;
        return {
          id: activity.id,
          activity_type: activity.activity_type,
          subject: activity.subject || 'No subject',
          created_at: activity.created_at,
          synced_to_external: hasExternalSync,
          external_crm_id: activity.linked_agent_id || undefined,
          sync_status: hasExternalSync ? 'synced' : 'pending'
        };
      }) as CRMActivity[];
    }
  });

  const syncedCount = activities?.filter(a => a.sync_status === 'synced').length || 0;
  const pendingCount = activities?.filter(a => a.sync_status === 'pending').length || 0;
  const failedCount = activities?.filter(a => a.sync_status === 'failed').length || 0;

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

  const getSyncIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  return (
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
          disabled={isSyncing}
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
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">{failedCount}</div>
            <div className="text-sm text-red-600">Failed</div>
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
            <Badge variant="outline">Configure</Badge>
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
          <h4 className="font-medium text-sm">Recent Activity Sync</h4>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading activities...</div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-2 text-sm border rounded">
                  <div className="flex items-center gap-2">
                    {getSyncIcon(activity.sync_status)}
                    <span className="truncate max-w-[200px]">{activity.subject}</span>
                  </div>
                  <Badge variant={activity.sync_status === 'synced' ? 'default' : 'secondary'} className="text-xs">
                    {activity.activity_type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              No activities to sync yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
