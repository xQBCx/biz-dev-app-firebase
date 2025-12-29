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
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { 
  Brain, 
  Plug, 
  Search, 
  Zap, 
  Shield, 
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Plus,
  ExternalLink,
  DollarSign,
  Sparkles,
  Target,
  Heart,
  GitBranch,
  Database,
  Code
} from "lucide-react";
import { DeepIntegrationDialog } from "@/components/system-intelligence/DeepIntegrationDialog";

interface Platform {
  id: string;
  platform_slug: string;
  platform_name: string;
  platform_category: string;
  description: string | null;
  website_url: string | null;
  optimization_score: number;
  common_gaps: string[];
  recommended_modules: string[];
}

interface Connection {
  id: string;
  connection_name: string | null;
  connection_status: string;
  last_sync_at: string | null;
  discovered_projects: any;
  external_platform_registry: Platform;
}

interface ProjectImport {
  id: string;
  external_project_name: string;
  import_status: string;
  analysis_score: number | null;
  revenue_potential_estimate: string | null;
  time_savings_estimate: string | null;
  identified_gaps: any;
  recommended_modules: any;
}

interface Recommendation {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  primary_benefit: string | null;
  estimated_value: string | null;
  status: string;
  related_module_slug: string | null;
}

const categoryIcons: Record<string, any> = {
  ai_builder: Brain,
  no_code: Zap,
  low_code: Zap,
  automation: RefreshCw,
  cloud: Plug,
  database: Shield,
  design: Sparkles,
  productivity: Target,
  ecommerce: DollarSign,
  version_control: Users,
};

const benefitIcons: Record<string, { icon: any; color: string; label: string }> = {
  more_money: { icon: DollarSign, color: 'text-green-500', label: 'More Revenue' },
  more_time: { icon: Clock, color: 'text-blue-500', label: 'Save Time' },
  less_liability: { icon: Shield, color: 'text-orange-500', label: 'Reduce Risk' },
  help_others: { icon: Heart, color: 'text-pink-500', label: 'Help Others' },
};

export default function SystemIntelligence() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [projectImports, setProjectImports] = useState<ProjectImport[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deepIntegrationOpen, setDeepIntegrationOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load platforms
      const { data: platformsData } = await supabase
        .from('external_platform_registry')
        .select('*')
        .eq('is_active', true)
        .order('popularity_rank', { ascending: true });
      
      setPlatforms(platformsData || []);

      // Load connections
      const { data: connectionsData } = await supabase
        .from('user_platform_connections')
        .select('*, external_platform_registry(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      setConnections(connectionsData || []);

      // Load project imports
      const { data: importsData } = await supabase
        .from('platform_project_imports')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      setProjectImports(importsData || []);

      // Load recommendations
      const { data: recsData } = await supabase
        .from('platform_recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'pending')
        .order('priority', { ascending: true })
        .limit(10);
      
      setRecommendations(recsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectPlatform = async (platform: Platform) => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('platform-connect', {
        body: {
          action: 'initiate',
          platformSlug: platform.platform_slug,
          connectionData: { name: `${platform.platform_name} Connection` },
        },
      });

      if (error) throw error;

      toast({
        title: "Connection Initiated",
        description: data.message,
      });

      setConnectDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDiscoverProjects = async (connectionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('platform-connect', {
        body: {
          action: 'discover',
          connectionId,
        },
      });

      if (error) throw error;

      toast({
        title: "Discovery Complete",
        description: data.message,
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Discovery Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAnalyzeProject = async (importId: string, connectionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('platform-analyze', {
        body: { importId, connectionId },
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: `Score: ${data.analysisScore}. Found ${data.gapsFound} gaps and generated ${data.recommendationsGenerated} recommendations.`,
      });

      loadData();
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredPlatforms = platforms.filter(p =>
    p.platform_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.platform_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    connectedPlatforms: connections.filter(c => c.connection_status === 'connected').length,
    analyzedProjects: projectImports.filter(p => p.import_status === 'analyzed').length,
    activeRecommendations: recommendations.length,
    avgScore: projectImports.length > 0 
      ? Math.round(projectImports.reduce((acc, p) => acc + (p.analysis_score || 0), 0) / projectImports.length)
      : 0,
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
        <DeepIntegrationDialog 
          open={deepIntegrationOpen} 
          onOpenChange={setDeepIntegrationOpen}
          onSuccess={loadData}
        />
        <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                <span>System Intelligence</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Connect external platforms, discover projects, and optimize for more money, time, and peace of mind
              </p>
            </div>
            <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Platform
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Connect a Platform</DialogTitle>
                  <DialogDescription>
                    Select a platform to connect. We'll discover your projects and provide optimization recommendations.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Search platforms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredPlatforms.map((platform) => {
                        const Icon = categoryIcons[platform.platform_category] || Plug;
                        const isConnected = connections.some(
                          c => c.external_platform_registry?.platform_slug === platform.platform_slug
                        );
                        
                        return (
                          <Card 
                            key={platform.id}
                            className={`cursor-pointer hover:border-primary transition-colors ${
                              isConnected ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : ''
                            }`}
                            onClick={() => !isConnected && setSelectedPlatform(platform)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">{platform.platform_name}</h4>
                                  <p className="text-xs text-muted-foreground capitalize">
                                    {platform.platform_category.replace(/_/g, ' ')}
                                  </p>
                                  {isConnected && (
                                    <Badge variant="secondary" className="mt-1 text-xs">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Connected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {selectedPlatform && (
                    <Card className="border-primary">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Connect to {selectedPlatform.platform_name}</CardTitle>
                        <CardDescription>{selectedPlatform.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Common optimization opportunities:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedPlatform.common_gaps?.map((gap, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {gap.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => handleConnectPlatform(selectedPlatform)}
                            disabled={connecting}
                          >
                            {connecting ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Plug className="h-4 w-4 mr-2" />
                            )}
                            Connect
                          </Button>
                          {selectedPlatform.website_url && (
                            <Button variant="outline" asChild>
                              <a href={selectedPlatform.website_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Value Proposition Banner */}
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="py-4 px-3 sm:px-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                  {Object.entries(benefitIcons).map(([key, { icon: Icon, color, label }]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color} flex-shrink-0`} />
                      <span className="text-xs sm:text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground italic text-center lg:text-right">
                  "In the business of helping people, there's unlimited opportunity for success"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.connectedPlatforms}</div>
                <p className="text-xs text-muted-foreground">of {platforms.length} available</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Analyzed Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.analyzedProjects}</div>
                <p className="text-xs text-muted-foreground">{projectImports.length} total discovered</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeRecommendations}</div>
                <p className="text-xs text-muted-foreground">ready to implement</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Optimization Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{stats.avgScore}%</div>
                  <Progress value={stats.avgScore} className="flex-1 h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="connections" className="space-y-4">
            <TabsList className="w-full sm:w-auto flex flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="connections" className="flex-1 sm:flex-none text-xs sm:text-sm">Connections</TabsTrigger>
              <TabsTrigger value="projects" className="flex-1 sm:flex-none text-xs sm:text-sm">Projects</TabsTrigger>
              <TabsTrigger value="deep" className="flex-1 sm:flex-none text-xs sm:text-sm">Deep Integration</TabsTrigger>
              <TabsTrigger value="recommendations" className="flex-1 sm:flex-none text-xs sm:text-sm">Recommendations</TabsTrigger>
              <TabsTrigger value="catalog" className="flex-1 sm:flex-none text-xs sm:text-sm">Catalog</TabsTrigger>
            </TabsList>

            <TabsContent value="connections" className="space-y-4">
              {connections.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Plug className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Platforms Connected</h3>
                    <p className="text-muted-foreground text-center max-w-md mt-2">
                      Connect your Lovable projects, Replit repls, n8n workflows, or any other platform to discover optimization opportunities.
                    </p>
                    <Button className="mt-4" onClick={() => setConnectDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Your First Platform
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {connections.map((connection) => {
                    const platform = connection.external_platform_registry;
                    const Icon = categoryIcons[platform?.platform_category] || Plug;
                    const projectCount = connection.discovered_projects?.length || 0;
                    
                    return (
                      <Card key={connection.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle>{platform?.platform_name}</CardTitle>
                                <CardDescription>{connection.connection_name}</CardDescription>
                              </div>
                            </div>
                            <Badge variant={connection.connection_status === 'connected' ? 'default' : 'secondary'}>
                              {connection.connection_status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Projects discovered:</span>
                            <span className="font-medium">{projectCount}</span>
                          </div>
                          {connection.last_sync_at && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Last sync:</span>
                              <span>{new Date(connection.last_sync_at).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleDiscoverProjects(connection.id)}
                            >
                              <Search className="h-4 w-4 mr-2" />
                              Discover Projects
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              {projectImports.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Projects Discovered</h3>
                    <p className="text-muted-foreground text-center max-w-md mt-2">
                      Connect a platform and run discovery to find your projects.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {projectImports.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{project.external_project_name}</CardTitle>
                            <CardDescription>Status: {project.import_status}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {project.analysis_score !== null && (
                              <Badge variant={project.analysis_score >= 70 ? 'default' : project.analysis_score >= 40 ? 'secondary' : 'destructive'}>
                                Score: {project.analysis_score}%
                              </Badge>
                            )}
                            {project.import_status === 'discovered' && (
                              <Button size="sm" onClick={() => handleAnalyzeProject(project.id, project.id)}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Analyze
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {project.import_status === 'analyzed' && (
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {project.revenue_potential_estimate && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Revenue Potential</p>
                                  <p className="font-medium">{project.revenue_potential_estimate}</p>
                                </div>
                              </div>
                            )}
                            {project.time_savings_estimate && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Time Savings</p>
                                  <p className="font-medium">{project.time_savings_estimate}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <div>
                                <p className="text-xs text-muted-foreground">Gaps Found</p>
                                <p className="font-medium">{project.identified_gaps?.length || 0}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Recommendations</p>
                                <p className="font-medium">{project.recommended_modules?.length || 0}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="deep" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Deep Platform Integration
                  </CardTitle>
                  <CardDescription>
                    Connect with your credentials to enable code analysis, database discovery, and detailed integration roadmaps
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-dashed">
                      <CardContent className="p-4 text-center">
                        <GitBranch className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <h4 className="font-medium">GitHub</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Connect via Personal Access Token to discover repos and analyze codebases
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-dashed">
                      <CardContent className="p-4 text-center">
                        <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <h4 className="font-medium">Supabase</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Connect with project URL and keys to analyze database schemas
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-dashed">
                      <CardContent className="p-4 text-center">
                        <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <h4 className="font-medium">Lovable</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Link Lovable projects for ecosystem integration analysis
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button onClick={() => setDeepIntegrationOpen(true)} size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Deep Integration
                    </Button>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">What happens after you connect:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Your credentials are stored securely (encrypted)</li>
                      <li>• We discover your projects, repos, and databases</li>
                      <li>• When you're ready, trigger analysis to get optimization roadmaps</li>
                      <li>• Get specific recommendations for integrating into the Biz Dev ecosystem</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {recommendations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No Recommendations Yet</h3>
                    <p className="text-muted-foreground text-center max-w-md mt-2">
                      Analyze your projects to get personalized optimization recommendations.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => {
                    const benefit = rec.primary_benefit ? benefitIcons[rec.primary_benefit] : null;
                    
                    return (
                      <Card key={rec.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {benefit && (
                                <div className={`p-2 rounded-lg bg-background ${benefit.color}`}>
                                  <benefit.icon className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <CardTitle className="text-lg">{rec.title}</CardTitle>
                                <CardDescription>{rec.description}</CardDescription>
                              </div>
                            </div>
                            <Badge variant={rec.priority === 'high' ? 'default' : rec.priority === 'critical' ? 'destructive' : 'secondary'}>
                              {rec.priority} priority
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                              {rec.estimated_value && (
                                <span className="text-green-600 font-medium">{rec.estimated_value}</span>
                              )}
                              {rec.related_module_slug && (
                                <Badge variant="outline">{rec.related_module_slug}</Badge>
                              )}
                            </div>
                            <Button size="sm">
                              Implement
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="catalog" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {platforms.slice(0, 18).map((platform) => {
                  const Icon = categoryIcons[platform.platform_category] || Plug;
                  const isConnected = connections.some(
                    c => c.external_platform_registry?.platform_slug === platform.platform_slug
                  );
                  
                  return (
                    <Card key={platform.id} className={isConnected ? 'border-green-500/50' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{platform.platform_name}</CardTitle>
                              <CardDescription className="text-xs capitalize">
                                {platform.platform_category.replace(/_/g, ' ')}
                              </CardDescription>
                            </div>
                          </div>
                          {isConnected && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {platform.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{platform.optimization_score}%</span>
                            <span className="text-xs text-muted-foreground">opportunity</span>
                          </div>
                          {!isConnected && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedPlatform(platform);
                                setConnectDialogOpen(true);
                              }}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}