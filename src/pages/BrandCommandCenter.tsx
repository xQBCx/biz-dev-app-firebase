import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Building2, 
  Plus, 
  Settings, 
  Play, 
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Image,
  FileText,
  Video,
  Mic,
  Mail,
  Share2,
  Bell,
  Zap,
  RefreshCw,
  Send,
  Eye,
  Trash2,
  Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface BrandConfig {
  id: string;
  franchise_id: string | null;
  user_id: string;
  brand_voice: string | null;
  content_themes: string[] | null;
  target_audiences: string[] | null;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  automation_enabled: boolean;
  automation_schedule: string;
  signal_boost_enabled: boolean;
  signal_boost_threshold: number;
  content_types_enabled: string[];
  upn_broadcast_enabled: boolean;
  notification_email: string | null;
  last_content_generated_at: string | null;
  created_at: string;
  franchises?: {
    name: string;
    brand_name: string;
    logo_url: string | null;
  } | null;
}

interface ContentItem {
  id: string;
  brand_config_id: string;
  content_type: string;
  title: string;
  content: string | null;
  media_url: string | null;
  market_driver: string | null;
  status: string;
  priority: string;
  created_at: string;
  brand_marketing_config?: {
    franchises?: {
      brand_name: string;
    } | null;
  } | null;
}

const contentTypeIcons: Record<string, React.ElementType> = {
  blog: FileText,
  social_post: Share2,
  email: Mail,
  image: Image,
  flyer: Image,
  video: Video,
  audio: Mic,
};

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-600", icon: Clock },
  approved: { color: "bg-blue-500/10 text-blue-600", icon: CheckCircle },
  deployed: { color: "bg-green-500/10 text-green-600", icon: CheckCircle },
  rejected: { color: "bg-red-500/10 text-red-600", icon: XCircle },
};

export default function BrandCommandCenter() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandConfig | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showContentPreview, setShowContentPreview] = useState(false);

  // Fetch brand configs with franchise data
  const { data: brandConfigs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['brand-marketing-configs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('brand_marketing_config')
        .select(`
          *,
          franchises (
            name,
            brand_name,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BrandConfig[];
    },
    enabled: !!user?.id,
  });

  // Fetch content queue
  const { data: contentQueue = [], isLoading: loadingContent, refetch: refetchContent } = useQuery({
    queryKey: ['marketing-content-queue', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('marketing_content_queue')
        .select(`
          *,
          brand_marketing_config (
            franchises (
              brand_name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ContentItem[];
    },
    enabled: !!user?.id,
  });

  // Fetch available franchises for linking
  const { data: franchises = [] } = useQuery({
    queryKey: ['franchises-for-brands', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('franchises')
        .select('id, name, brand_name, logo_url')
        .order('brand_name');
      if (error) throw error;
      return data;
    },
  });

  // Create brand config mutation
  const createConfigMutation = useMutation({
    mutationFn: async (data: Partial<BrandConfig>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('brand_marketing_config')
        .insert({ ...data, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-marketing-configs'] });
      setShowConfigDialog(false);
      toast.success('Brand configuration created');
    },
    onError: (error) => {
      toast.error(`Failed to create config: ${error.message}`);
    },
  });

  // Update content status mutation
  const updateContentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = user?.id;
      }
      const { error } = await supabase
        .from('marketing_content_queue')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-content-queue'] });
      toast.success('Content status updated');
    },
  });

  // Generate content mutation
  const generateContentMutation = useMutation({
    mutationFn: async (brandConfigId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-brand-content', {
        body: { brandConfigId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['marketing-content-queue'] });
      toast.success(`Generated ${data.contentCount} content items`);
    },
    onError: (error) => {
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  // Deploy content mutation
  const deployContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const { data, error } = await supabase.functions.invoke('deploy-brand-content', {
        body: { contentId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-content-queue'] });
      toast.success('Content deployed successfully');
    },
  });

  // Stats
  const pendingCount = contentQueue.filter(c => c.status === 'pending').length;
  const approvedCount = contentQueue.filter(c => c.status === 'approved').length;
  const deployedCount = contentQueue.filter(c => c.status === 'deployed').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Brand Command Center
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Automated content generation and deployment for all your brands
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => refetchContent()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowConfigDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Brands</p>
                    <p className="text-2xl font-bold">{brandConfigs.filter(b => b.automation_enabled).length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ready to Deploy</p>
                    <p className="text-2xl font-bold">{approvedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Deployed Today</p>
                    <p className="text-2xl font-bold">{deployedCount}</p>
                  </div>
                  <Send className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="queue">
              <Bell className="h-4 w-4 mr-2" />
              Content Queue
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="brands">
              <Building2 className="h-4 w-4 mr-2" />
              Brand Settings
            </TabsTrigger>
            <TabsTrigger value="deployed">
              <Radio className="h-4 w-4 mr-2" />
              Deployed Content
            </TabsTrigger>
          </TabsList>

          {/* Content Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            {loadingContent ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : contentQueue.filter(c => c.status !== 'deployed').length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending content</h3>
                <p className="text-muted-foreground mb-4">
                  Generate content for your brands to see items here
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contentQueue.filter(c => c.status !== 'deployed').map((item) => {
                  const Icon = contentTypeIcons[item.content_type] || FileText;
                  const statusConf = statusConfig[item.status] || statusConfig.pending;
                  const StatusIcon = statusConf.icon;
                  
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-medium line-clamp-1">
                                {item.title}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {item.brand_marketing_config?.franchises?.brand_name || 'Unknown Brand'}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={cn("text-xs", statusConf.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {item.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {item.market_driver && (
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            <Zap className="h-3 w-3 inline mr-1" />
                            {item.market_driver}
                          </p>
                        )}
                        
                        {item.media_url && (
                          <img 
                            src={item.media_url} 
                            alt={item.title}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedContent(item);
                              setShowContentPreview(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          {item.status === 'pending' && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => updateContentMutation.mutate({ id: item.id, status: 'approved' })}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => updateContentMutation.mutate({ id: item.id, status: 'rejected' })}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {item.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => deployContentMutation.mutate(item.id)}
                              disabled={deployContentMutation.isPending}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Deploy
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Brand Settings Tab */}
          <TabsContent value="brands" className="space-y-4">
            {loadingConfigs ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : brandConfigs.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No brands configured</h3>
                <p className="text-muted-foreground mb-4">
                  Link a franchise to start generating automated content
                </p>
                <Button onClick={() => setShowConfigDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {brandConfigs.map((config) => (
                  <Card key={config.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {config.franchises?.logo_url ? (
                          <img 
                            src={config.franchises.logo_url} 
                            alt="" 
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div 
                            className="h-12 w-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: config.primary_color }}
                          >
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base">
                            {config.franchises?.brand_name || 'Unnamed Brand'}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {config.content_types_enabled?.length || 0} content types enabled
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Automation</span>
                        <Badge variant={config.automation_enabled ? "default" : "secondary"}>
                          {config.automation_enabled ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Signal Boost</span>
                        <Badge variant={config.signal_boost_enabled ? "default" : "secondary"}>
                          {config.signal_boost_enabled ? `≥${config.signal_boost_threshold}` : 'Off'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">UPN Broadcast</span>
                        <Badge variant={config.upn_broadcast_enabled ? "default" : "secondary"}>
                          {config.upn_broadcast_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setSelectedBrand(config);
                            setShowConfigDialog(true);
                          }}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Settings
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => generateContentMutation.mutate(config.id)}
                          disabled={generateContentMutation.isPending}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Deployed Content Tab */}
          <TabsContent value="deployed" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {contentQueue.filter(c => c.status === 'deployed').map((item) => {
                  const Icon = contentTypeIcons[item.content_type] || FileText;
                  return (
                    <Card key={item.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <Icon className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.brand_marketing_config?.franchises?.brand_name} • {item.content_type}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {new Date(item.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {contentQueue.filter(c => c.status === 'deployed').length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No deployed content yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Brand Dialog */}
      <BrandConfigDialog
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        franchises={franchises}
        existingConfig={selectedBrand}
        onSave={(data) => createConfigMutation.mutate(data)}
        isLoading={createConfigMutation.isPending}
      />

      {/* Content Preview Dialog */}
      <Dialog open={showContentPreview} onOpenChange={setShowContentPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              {selectedContent.market_driver && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Market Driver</p>
                  <p className="text-sm">{selectedContent.market_driver}</p>
                </div>
              )}
              
              {selectedContent.media_url && (
                <img 
                  src={selectedContent.media_url} 
                  alt={selectedContent.title}
                  className="w-full rounded-lg"
                />
              )}
              
              {selectedContent.content && (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {selectedContent.content}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Brand Config Dialog Component
function BrandConfigDialog({
  open,
  onOpenChange,
  franchises,
  existingConfig,
  onSave,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  franchises: { id: string; name: string; brand_name: string; logo_url: string | null }[];
  existingConfig: BrandConfig | null;
  onSave: (data: Partial<BrandConfig>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    franchise_id: '',
    brand_voice: 'professional, innovative, trustworthy',
    content_themes: ['industry news', 'thought leadership', 'product updates'],
    target_audiences: ['business owners', 'decision makers'],
    automation_enabled: true,
    automation_schedule: '0 6 * * *',
    signal_boost_enabled: true,
    signal_boost_threshold: 70,
    content_types_enabled: ['blog', 'social_post', 'email', 'image'],
    upn_broadcast_enabled: true,
    notification_email: '',
  });

  useEffect(() => {
    if (existingConfig) {
      setFormData({
        franchise_id: existingConfig.franchise_id || '',
        brand_voice: existingConfig.brand_voice || '',
        content_themes: existingConfig.content_themes || [],
        target_audiences: existingConfig.target_audiences || [],
        automation_enabled: existingConfig.automation_enabled,
        automation_schedule: existingConfig.automation_schedule,
        signal_boost_enabled: existingConfig.signal_boost_enabled,
        signal_boost_threshold: existingConfig.signal_boost_threshold,
        content_types_enabled: existingConfig.content_types_enabled || [],
        upn_broadcast_enabled: existingConfig.upn_broadcast_enabled,
        notification_email: existingConfig.notification_email || '',
      });
    }
  }, [existingConfig]);

  const handleSubmit = () => {
    onSave({
      franchise_id: formData.franchise_id || null,
      brand_voice: formData.brand_voice,
      content_themes: formData.content_themes,
      target_audiences: formData.target_audiences,
      automation_enabled: formData.automation_enabled,
      automation_schedule: formData.automation_schedule,
      signal_boost_enabled: formData.signal_boost_enabled,
      signal_boost_threshold: formData.signal_boost_threshold,
      content_types_enabled: formData.content_types_enabled,
      upn_broadcast_enabled: formData.upn_broadcast_enabled,
      notification_email: formData.notification_email || null,
    });
  };

  const contentTypes = [
    { id: 'blog', label: 'Blog Posts', icon: FileText },
    { id: 'social_post', label: 'Social Posts', icon: Share2 },
    { id: 'email', label: 'Email Campaigns', icon: Mail },
    { id: 'image', label: 'Images & Flyers', icon: Image },
    { id: 'video', label: 'Video Scripts', icon: Video },
    { id: 'audio', label: 'Audio Content', icon: Mic },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingConfig ? 'Edit Brand Configuration' : 'Add Brand Configuration'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Franchise Selection */}
          <div>
            <Label>Link to Franchise</Label>
            <Select 
              value={formData.franchise_id} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, franchise_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a franchise..." />
              </SelectTrigger>
              <SelectContent>
                {franchises.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.brand_name || f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand Voice */}
          <div>
            <Label>Brand Voice</Label>
            <Textarea
              value={formData.brand_voice}
              onChange={(e) => setFormData(prev => ({ ...prev, brand_voice: e.target.value }))}
              placeholder="e.g., professional, innovative, friendly, authoritative"
              rows={2}
            />
          </div>

          {/* Content Types */}
          <div>
            <Label className="mb-3 block">Content Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {contentTypes.map(({ id, label, icon: Icon }) => {
                const isEnabled = formData.content_types_enabled.includes(id);
                return (
                  <div 
                    key={id}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                      isEnabled ? "border-primary bg-primary/5" : "border-border"
                    )}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        content_types_enabled: isEnabled
                          ? prev.content_types_enabled.filter(t => t !== id)
                          : [...prev.content_types_enabled, id]
                      }));
                    }}
                  >
                    <Icon className={cn("h-4 w-4", isEnabled ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-sm">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Automation Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Automation</Label>
                <p className="text-xs text-muted-foreground">Generate content on schedule</p>
              </div>
              <Switch
                checked={formData.automation_enabled}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, automation_enabled: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Signal Boost</Label>
                <p className="text-xs text-muted-foreground">
                  Generate extra content when high-priority signals detected (urgency ≥{formData.signal_boost_threshold})
                </p>
              </div>
              <Switch
                checked={formData.signal_boost_enabled}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, signal_boost_enabled: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>UPN Broadcast</Label>
                <p className="text-xs text-muted-foreground">Publish to Universal Professional Network</p>
              </div>
              <Switch
                checked={formData.upn_broadcast_enabled}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, upn_broadcast_enabled: v }))}
              />
            </div>
          </div>

          {/* Notification Email */}
          <div>
            <Label>Notification Email</Label>
            <Input
              type="email"
              value={formData.notification_email}
              onChange={(e) => setFormData(prev => ({ ...prev, notification_email: e.target.value }))}
              placeholder="you@company.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get notified when marketing strategies are ready
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
            {existingConfig ? 'Update' : 'Create'} Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}