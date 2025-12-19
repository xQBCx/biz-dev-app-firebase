import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Network, 
  Plus, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Users,
  ArrowRightLeft,
  Zap,
  Globe,
  Building2,
  Database
} from "lucide-react";

interface EcosystemApp {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  app_type: string;
  status: string;
  webhook_url: string | null;
  last_heartbeat: string | null;
  created_at: string;
  features?: AppFeature[];
}

interface AppFeature {
  id: string;
  feature_name: string;
  is_enabled: boolean;
  sync_status: string | null;
  last_sync_at: string | null;
}

interface ContactSyncStats {
  inbound: number;
  outbound: number;
  total: number;
}

const AVAILABLE_FEATURES = [
  { name: 'crm', label: 'CRM Management', icon: Users, description: 'Contact, company, and deal management' },
  { name: 'marketing', label: 'Marketing Automation', icon: Zap, description: 'Lead discovery and email campaigns' },
  { name: 'workflows', label: 'Workflow Builder', icon: RefreshCw, description: 'Visual workflow automation' },
  { name: 'erp', label: 'ERP Generator', icon: Database, description: 'AI-generated ERP systems' },
  { name: 'analytics', label: 'Analytics Dashboard', icon: Globe, description: 'Activity tracking and insights' },
  { name: 'email', label: 'Unified Inbox', icon: Globe, description: 'Multi-account email management' },
  { name: 'calendar', label: 'Smart Scheduler', icon: Clock, description: 'AI-powered scheduling' },
  { name: 'ai_assistant', label: 'AI Assistant', icon: Zap, description: 'Context-aware AI across modules' },
];

export default function EcosystemHub() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [apps, setApps] = useState<EcosystemApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<EcosystemApp | null>(null);
  const [syncStats, setSyncStats] = useState<Record<string, ContactSyncStats>>({});
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [newApp, setNewApp] = useState({
    name: '',
    slug: '',
    description: '',
    appType: 'external',
    webhookUrl: '',
    supabaseUrl: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadApps();
    }
  }, [user]);

  const loadApps = async () => {
    try {
      const { data: appsData, error: appsError } = await supabase
        .from('ecosystem_apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      // Load features for each app
      const appsWithFeatures = await Promise.all(
        (appsData || []).map(async (app) => {
          const { data: features } = await supabase
            .from('ecosystem_app_features')
            .select('*')
            .eq('ecosystem_app_id', app.id);
          
          return { ...app, features: features || [] };
        })
      );

      setApps(appsWithFeatures);

      // Load sync stats
      const stats: Record<string, ContactSyncStats> = {};
      for (const app of appsWithFeatures) {
        const { count: inbound } = await supabase
          .from('ecosystem_contact_sync')
          .select('*', { count: 'exact', head: true })
          .eq('target_app_id', app.id);
        
        const { count: outbound } = await supabase
          .from('ecosystem_contact_sync')
          .select('*', { count: 'exact', head: true })
          .eq('source_app_id', app.id);
        
        stats[app.id] = {
          inbound: inbound || 0,
          outbound: outbound || 0,
          total: (inbound || 0) + (outbound || 0),
        };
      }
      setSyncStats(stats);
    } catch (error) {
      console.error('Error loading apps:', error);
      toast({ title: "Error", description: "Failed to load ecosystem apps", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterApp = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('ecosystem-register', {
        body: newApp,
      });

      if (error) throw error;

      toast({
        title: "App Registered",
        description: `${newApp.name} registered successfully. API Key: ${data.apiKey?.slice(0, 20)}...`,
      });

      setRegisterDialogOpen(false);
      setNewApp({ name: '', slug: '', description: '', appType: 'external', webhookUrl: '', supabaseUrl: '' });
      loadApps();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleFeature = async (appId: string, featureName: string, enabled: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('ecosystem-provision', {
        body: { appId, featureName, enabled },
      });

      if (error) throw error;

      toast({
        title: enabled ? "Feature Enabled" : "Feature Disabled",
        description: `${featureName} has been ${enabled ? 'enabled' : 'disabled'}`,
      });

      loadApps();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      active: { variant: "default", icon: CheckCircle },
      pending: { variant: "secondary", icon: Clock },
      authorized: { variant: "default", icon: CheckCircle },
      suspended: { variant: "destructive", icon: AlertCircle },
      disconnected: { variant: "outline", icon: AlertCircle },
    };
    const { variant, icon: Icon } = config[status] || config.pending;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getAppTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      lovable_child: Network,
      microsoft_365: Building2,
      google_workspace: Globe,
      hubspot: Database,
      salesforce: Database,
      external: Globe,
    };
    return icons[type] || Globe;
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ecosystem Hub</h1>
              <p className="text-muted-foreground">
                Manage connected apps, provision features, and sync contacts across your ecosystem
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/ecosystem/onboard')}>
                <Globe className="h-4 w-4 mr-2" />
                Connect External System
              </Button>
              <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Register App
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Register New App</DialogTitle>
                    <DialogDescription>
                      Add a new app to your ecosystem. Child apps can receive feature configurations and sync data.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">App Name</Label>
                      <Input
                        id="name"
                        value={newApp.name}
                        onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                        placeholder="SP Details"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={newApp.slug}
                        onChange={(e) => setNewApp({ ...newApp, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        placeholder="sp-details"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appType">App Type</Label>
                      <Select value={newApp.appType} onValueChange={(v) => setNewApp({ ...newApp, appType: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lovable_child">Lovable Child App</SelectItem>
                          <SelectItem value="external">External App</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
                      <Input
                        id="webhookUrl"
                        value={newApp.webhookUrl}
                        onChange={(e) => setNewApp({ ...newApp, webhookUrl: e.target.value })}
                        placeholder="https://your-app.com/api/biz-dev-webhook"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newApp.description}
                        onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                        placeholder="Describe what this app does..."
                      />
                    </div>
                  </div>
                  <Button onClick={handleRegisterApp} className="w-full">
                    Register App
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Connected Apps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apps.length}</div>
                <p className="text-xs text-muted-foreground">
                  {apps.filter(a => a.status === 'active').length} active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Features Enabled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {apps.reduce((acc, app) => acc + (app.features?.filter(f => f.is_enabled).length || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">across all apps</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Contacts Synced</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(syncStats).reduce((acc, s) => acc + s.total, 0)}
                </div>
                <p className="text-xs text-muted-foreground">bidirectional</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ecosystem Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-lg font-semibold">Healthy</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Apps Grid */}
          <Tabs defaultValue="apps" className="space-y-4">
            <TabsList>
              <TabsTrigger value="apps">Connected Apps</TabsTrigger>
              <TabsTrigger value="features">Feature Matrix</TabsTrigger>
              <TabsTrigger value="sync">Contact Sync</TabsTrigger>
            </TabsList>

            <TabsContent value="apps" className="space-y-4">
              {apps.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Network className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Apps Connected</h3>
                    <p className="text-muted-foreground text-center max-w-md mt-2">
                      Register your first app to start building your ecosystem. Child apps can receive
                      features and sync contacts bidirectionally.
                    </p>
                    <Button className="mt-4" onClick={() => setRegisterDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Register First App
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {apps.map((app) => {
                    const AppIcon = getAppTypeIcon(app.app_type);
                    return (
                      <Card 
                        key={app.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedApp(app)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <AppIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{app.name}</CardTitle>
                                <CardDescription>{app.slug}</CardDescription>
                              </div>
                            </div>
                            {getStatusBadge(app.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {app.description || 'No description'}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {app.features?.filter(f => f.is_enabled).length || 0} features enabled
                            </span>
                            <span className="text-muted-foreground flex items-center gap-1">
                              <ArrowRightLeft className="h-3 w-3" />
                              {syncStats[app.id]?.total || 0} synced
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Provisioning</CardTitle>
                  <CardDescription>
                    Enable or disable features for each connected app. Changes are synced via webhook.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Feature</th>
                          {apps.map((app) => (
                            <th key={app.id} className="text-center py-3 px-4 font-medium">
                              {app.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {AVAILABLE_FEATURES.map((feature) => (
                          <tr key={feature.name} className="border-b">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <feature.icon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{feature.label}</div>
                                  <div className="text-xs text-muted-foreground">{feature.description}</div>
                                </div>
                              </div>
                            </td>
                            {apps.map((app) => {
                              const appFeature = app.features?.find(f => f.feature_name === feature.name);
                              return (
                                <td key={app.id} className="text-center py-3 px-4">
                                  <Switch
                                    checked={appFeature?.is_enabled || false}
                                    onCheckedChange={(checked) => handleToggleFeature(app.id, feature.name, checked)}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sync" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Sync Overview</CardTitle>
                  <CardDescription>
                    Track contact flow between Biz Dev and connected apps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {apps.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Network className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{app.name}</div>
                            <div className="text-sm text-muted-foreground">{app.slug}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">
                              {syncStats[app.id]?.inbound || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Inbound</div>
                          </div>
                          <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">
                              {syncStats[app.id]?.outbound || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Outbound</div>
                          </div>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Now
                          </Button>
                        </div>
                      </div>
                    ))}
                    {apps.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No apps connected yet. Register an app to start syncing contacts.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* App Details Dialog */}
          {selectedApp && (
            <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {selectedApp.name}
                  </DialogTitle>
                  <DialogDescription>
                    Manage features and settings for this app
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Status</span>
                      {getStatusBadge(selectedApp.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Type</span>
                      <Badge variant="outline">{selectedApp.app_type.replace('_', ' ')}</Badge>
                    </div>
                    {selectedApp.webhook_url && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Webhook</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {selectedApp.webhook_url.slice(0, 40)}...
                        </code>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Enabled Features</h4>
                    <div className="grid gap-3">
                      {AVAILABLE_FEATURES.map((feature) => {
                        const appFeature = selectedApp.features?.find(f => f.feature_name === feature.name);
                        return (
                          <div key={feature.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <feature.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{feature.label}</span>
                            </div>
                            <Switch
                              checked={appFeature?.is_enabled || false}
                              onCheckedChange={(checked) => handleToggleFeature(selectedApp.id, feature.name, checked)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
