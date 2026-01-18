import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Radar, Clock, TrendingUp, Play, AlertCircle, LockKeyhole } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface ScannerPreferences {
  is_active: boolean;
  scan_frequency: string;
  last_scan_at: string | null;
  next_scan_at: string | null;
  opportunities_found: number;
}

export const OpportunityScannerSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [preferences, setPreferences] = useState<ScannerPreferences | null>(null);

  useEffect(() => {
    if (user) {
      checkAccessAndLoadPreferences();
    }
  }, [user]);

  const checkAccessAndLoadPreferences = async () => {
    try {
      // Check if user has admin-granted access
      const { data: toggle, error: toggleError } = await supabase
        .from('user_feature_toggles')
        .select('is_enabled')
        .eq('user_id', user!.id)
        .eq('feature_name', 'opportunity_scanner_access')
        .maybeSingle();

      if (toggleError) throw toggleError;

      const accessGranted = toggle?.is_enabled ?? false;
      setHasAccess(accessGranted);

      if (accessGranted) {
        // Load user preferences
        const { data: prefs, error: prefsError } = await supabase
          .from('user_scanner_preferences')
          .select('*')
          .eq('user_id', user!.id)
          .maybeSingle();

        if (prefsError) throw prefsError;

        if (prefs) {
          setPreferences({
            is_active: prefs.is_active,
            scan_frequency: prefs.scan_frequency,
            last_scan_at: prefs.last_scan_at,
            next_scan_at: prefs.next_scan_at,
            opportunities_found: prefs.opportunities_found,
          });
        } else {
          // Create default preferences
          const { data: newPrefs, error: createError } = await supabase
            .from('user_scanner_preferences')
            .insert({
              user_id: user!.id,
              is_active: true,
              scan_frequency: 'daily',
            })
            .select()
            .single();

          if (createError) throw createError;

          setPreferences({
            is_active: newPrefs.is_active,
            scan_frequency: newPrefs.scan_frequency,
            last_scan_at: null,
            next_scan_at: null,
            opportunities_found: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error loading scanner settings:', error);
      toast({
        title: "Error",
        description: "Failed to load scanner settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof ScannerPreferences, value: unknown) => {
    if (!preferences) return;

    try {
      const { error } = await supabase
        .from('user_scanner_preferences')
        .update({ [key]: value })
        .eq('user_id', user!.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, [key]: value } : null);

      toast({
        title: "Settings Updated",
        description: key === 'is_active' 
          ? value 
            ? "Scanner is now active for your account."
            : "Scanner has been paused."
          : "Your scanner preferences have been updated.",
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    }
  };

  const runManualScan = async () => {
    setScanning(true);
    try {
      // Get user's active watchlists
      const { data: watchlists, error: watchlistError } = await supabase
        .from('opportunity_watchlist')
        .select('id')
        .eq('user_id', user!.id)
        .eq('is_active', true);

      if (watchlistError) throw watchlistError;

      if (!watchlists || watchlists.length === 0) {
        toast({
          title: "No Watchlists",
          description: "Create a watchlist in Opportunity Discovery first.",
          variant: "destructive",
        });
        return;
      }

      let totalOpportunities = 0;

      for (const watchlist of watchlists) {
        const { data, error } = await supabase.functions.invoke('opportunity-scanner', {
          body: { watchlist_id: watchlist.id, user_id: user!.id }
        });

        if (error) throw error;
        totalOpportunities += data?.opportunities_found || 0;
      }

      // Update local state
      const now = new Date().toISOString();
      setPreferences(prev => prev ? {
        ...prev,
        last_scan_at: now,
        opportunities_found: (prev.opportunities_found || 0) + totalOpportunities
      } : null);

      toast({
        title: "Scan Complete",
        description: `Found ${totalOpportunities} new opportunities.`,
      });
    } catch (error) {
      console.error('Error running scan:', error);
      toast({
        title: "Scan Failed",
        description: "Failed to run opportunity scan.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Opportunity Scanner</CardTitle>
          </div>
          <CardDescription>
            AI-powered business opportunity discovery is not enabled for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Contact an administrator to enable this feature.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-primary" />
            <CardTitle>Opportunity Scanner</CardTitle>
          </div>
          <Badge variant={preferences?.is_active ? "default" : "secondary"}>
            {preferences?.is_active ? "Active" : "Paused"}
          </Badge>
        </div>
        <CardDescription>
          AI-powered scanner that discovers business opportunities matching your watchlist criteria.
          Toggle off when you have enough on your plate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div>
            <p className="font-medium">Enable Scanner for Me</p>
            <p className="text-sm text-muted-foreground">
              Turn off during busy periods to pause opportunity discovery
            </p>
          </div>
          <Switch
            checked={preferences?.is_active ?? false}
            onCheckedChange={(checked) => updatePreference('is_active', checked)}
          />
        </div>

        {/* Frequency Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Scan Frequency</label>
          <Select
            value={preferences?.scan_frequency || 'daily'}
            onValueChange={(value) => updatePreference('scan_frequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Every Hour</SelectItem>
              <SelectItem value="every_6_hours">Every 6 Hours</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Last Scan</span>
            </div>
            <p className="text-sm font-medium">
              {preferences?.last_scan_at 
                ? formatDistanceToNow(new Date(preferences.last_scan_at), { addSuffix: true })
                : 'Never'
              }
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Next Scan</span>
            </div>
            <p className="text-sm font-medium">
              {preferences?.next_scan_at && preferences?.is_active
                ? format(new Date(preferences.next_scan_at), 'MMM d, h:mm a')
                : preferences?.is_active ? 'Pending' : 'Paused'
              }
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Total Found</span>
            </div>
            <p className="text-sm font-medium">
              {preferences?.opportunities_found || 0} opportunities
            </p>
          </div>
        </div>

        {/* Manual Trigger */}
        <Button 
          onClick={runManualScan} 
          disabled={scanning}
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          {scanning ? 'Scanning...' : 'Run Scan Now'}
        </Button>
      </CardContent>
    </Card>
  );
};
