import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface HubSpotConfigDialogProps {
  dealRoomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SyncPreferences {
  sync_meetings: boolean;
  sync_emails: boolean;
  sync_deals: boolean;
  auto_sync: boolean;
}

const defaultSyncPreferences: SyncPreferences = {
  sync_meetings: true,
  sync_emails: true,
  sync_deals: true,
  auto_sync: true,
};

export function HubSpotConfigDialog({ dealRoomId, open, onOpenChange }: HubSpotConfigDialogProps) {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [syncPreferences, setSyncPreferences] = useState<SyncPreferences>(defaultSyncPreferences);

  // Fetch existing integration config
  const { data: existingConfig, isLoading } = useQuery({
    queryKey: ['hubspot-config', dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_room_integrations')
        .select('*')
        .eq('deal_room_id', dealRoomId)
        .eq('integration_type', 'hubspot')
        .maybeSingle();

      if (error) throw error;
      
      if (data?.sync_preferences && typeof data.sync_preferences === 'object' && !Array.isArray(data.sync_preferences)) {
        const prefs = data.sync_preferences as Record<string, unknown>;
        setSyncPreferences({
          sync_meetings: Boolean(prefs.sync_meetings ?? true),
          sync_emails: Boolean(prefs.sync_emails ?? true),
          sync_deals: Boolean(prefs.sync_deals ?? true),
          auto_sync: Boolean(prefs.auto_sync ?? true),
        });
      }
      
      return data;
    },
    enabled: open,
  });

  // Save configuration mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const syncPrefsJson: Json = {
        sync_meetings: syncPreferences.sync_meetings,
        sync_emails: syncPreferences.sync_emails,
        sync_deals: syncPreferences.sync_deals,
        auto_sync: syncPreferences.auto_sync,
      };

      if (existingConfig) {
        const { error } = await supabase
          .from('deal_room_integrations')
          .update({
            api_key_encrypted: apiKey || existingConfig.api_key_encrypted,
            sync_preferences: syncPrefsJson,
            is_connected: testResult === 'success' || existingConfig.is_connected,
          })
          .eq('id', existingConfig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('deal_room_integrations')
          .insert({
            deal_room_id: dealRoomId,
            integration_type: 'hubspot',
            api_key_encrypted: apiKey,
            sync_preferences: syncPrefsJson,
            is_connected: testResult === 'success',
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hubspot-config', dealRoomId] });
      toast.success("HubSpot configuration saved");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to save configuration");
      console.error(error);
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!existingConfig) return;
      
      const { error } = await supabase
        .from('deal_room_integrations')
        .delete()
        .eq('id', existingConfig.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hubspot-config', dealRoomId] });
      toast.success("HubSpot disconnected");
      setApiKey("");
      setTestResult(null);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to disconnect");
      console.error(error);
    },
  });

  const handleTestConnection = async () => {
    if (!apiKey && !existingConfig?.api_key_encrypted) {
      toast.error("Please enter an API key first");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Simulate API test - in production, this would call HubSpot API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For now, simulate success if API key is provided
    const success = !!(apiKey || existingConfig?.api_key_encrypted);
    setTestResult(success ? 'success' : 'error');
    setIsTesting(false);

    if (success) {
      toast.success("Connection test successful");
    } else {
      toast.error("Connection test failed");
    }
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img 
              src="https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png" 
              alt="HubSpot" 
              className="h-5 w-5" 
            />
            Configure HubSpot Integration
          </DialogTitle>
          <DialogDescription>
            Connect your HubSpot account to sync agent activities and deal data.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor="api-key">HubSpot API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder={existingConfig?.api_key_encrypted ? "••••••••••••" : "Enter your HubSpot API key"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : testResult === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : testResult === 'error' ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    "Test"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Find your API key in HubSpot Settings → Integrations → API Key
              </p>
            </div>

            {/* Sync Preferences */}
            <div className="space-y-4">
              <Label>Sync Preferences</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sync-meetings" className="text-sm font-normal">Sync Meetings</Label>
                  <p className="text-xs text-muted-foreground">Sync scheduled meetings to HubSpot</p>
                </div>
                <Switch
                  id="sync-meetings"
                  checked={syncPreferences.sync_meetings}
                  onCheckedChange={(checked) => 
                    setSyncPreferences(prev => ({ ...prev, sync_meetings: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sync-emails" className="text-sm font-normal">Sync Emails</Label>
                  <p className="text-xs text-muted-foreground">Sync email activities to HubSpot</p>
                </div>
                <Switch
                  id="sync-emails"
                  checked={syncPreferences.sync_emails}
                  onCheckedChange={(checked) => 
                    setSyncPreferences(prev => ({ ...prev, sync_emails: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sync-deals" className="text-sm font-normal">Sync Deal Updates</Label>
                  <p className="text-xs text-muted-foreground">Sync deal stage changes to HubSpot</p>
                </div>
                <Switch
                  id="sync-deals"
                  checked={syncPreferences.sync_deals}
                  onCheckedChange={(checked) => 
                    setSyncPreferences(prev => ({ ...prev, sync_deals: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync" className="text-sm font-normal">Auto-sync enabled</Label>
                  <p className="text-xs text-muted-foreground">Automatically sync new activities</p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={syncPreferences.auto_sync}
                  onCheckedChange={(checked) => 
                    setSyncPreferences(prev => ({ ...prev, auto_sync: checked }))
                  }
                />
              </div>
            </div>

            {/* Connection Status */}
            {existingConfig?.is_connected && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Connected to HubSpot</span>
                {existingConfig.last_sync_at && (
                  <span className="text-xs text-green-600 ml-auto">
                    Last sync: {new Date(existingConfig.last_sync_at).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {existingConfig?.is_connected && (
            <Button
              variant="destructive"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
              className="sm:mr-auto"
            >
              {disconnectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Disconnect
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
