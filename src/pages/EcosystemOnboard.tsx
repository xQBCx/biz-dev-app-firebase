import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  RefreshCw,
  Globe,
  Building2,
  Database,
  Zap,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  available: boolean;
}

interface Recommendation {
  category: string;
  current_tool: string;
  biz_dev_feature: string;
  benefit: string;
  migration_effort: string;
  data_to_migrate: string[];
  estimated_time: string;
}

const PLATFORMS: Platform[] = [
  {
    id: 'microsoft_365',
    name: 'Microsoft 365',
    description: 'Outlook, Teams, SharePoint, OneDrive, Dynamics',
    icon: Building2,
    color: 'bg-blue-500',
    available: true,
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    description: 'Gmail, Drive, Calendar, Docs, Sheets',
    icon: Globe,
    color: 'bg-red-500',
    available: true,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM, Marketing Hub, Sales Hub',
    icon: Database,
    color: 'bg-orange-500',
    available: true,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sales Cloud, Service Cloud, Marketing Cloud',
    icon: Database,
    color: 'bg-blue-600',
    available: true,
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    description: 'CRM, Analytics, Marketing Automation',
    icon: Database,
    color: 'bg-yellow-500',
    available: true,
  },
  {
    id: 'dynamics',
    name: 'Dynamics 365',
    description: 'Sales, Customer Service, Marketing',
    icon: Building2,
    color: 'bg-purple-500',
    available: true,
  },
];

type Step = 'welcome' | 'platform' | 'authorize' | 'discover' | 'analyze' | 'results';

export default function EcosystemOnboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [authorizationId, setAuthorizationId] = useState<string | null>(null);
  const [discoverySessionId, setDiscoverySessionId] = useState<string | null>(null);
  const [discoveredData, setDiscoveredData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handlePlatformSelect = async (platform: Platform) => {
    setSelectedPlatform(platform);
    setCurrentStep('authorize');
  };

  const handleAuthorize = async () => {
    if (!selectedPlatform) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('oauth-initiate', {
        body: {
          platform: selectedPlatform.id,
          redirectUri: window.location.origin + '/ecosystem/onboard/callback',
        },
      });

      if (error) throw error;

      setAuthorizationId(data.authorizationId);
      
      // For demo purposes, simulate successful authorization
      // In production, this would redirect to OAuth and handle callback
      toast({
        title: "Authorization Simulated",
        description: "In production, you would be redirected to " + selectedPlatform.name + " to authorize access.",
      });

      // Simulate authorization success
      await supabase
        .from('external_system_authorizations')
        .update({
          authorization_status: 'authorized',
          authorized_at: new Date().toISOString(),
          scopes_granted: ['read_contacts', 'read_calendar', 'read_files'],
        })
        .eq('id', data.authorizationId);

      setCurrentStep('discover');
      handleDiscover(data.authorizationId);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDiscover = async (authId: string) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate discovery progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const { data, error } = await supabase.functions.invoke('system-discover', {
        body: { authorizationId: authId },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setDiscoverySessionId(data.sessionId);
      setDiscoveredData(data.discoveredData);

      setCurrentStep('analyze');
      handleAnalyze(data.sessionId);
    } catch (error: any) {
      toast({ title: "Discovery Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async (sessionId: string) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 400);

      const { data, error } = await supabase.functions.invoke('system-analyze', {
        body: { sessionId },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      setCurrentStep('results');
    } catch (error: any) {
      toast({ title: "Analysis Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getEffortBadge = (effort: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return <Badge className={colors[effort] || colors.medium}>{effort}</Badge>;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Connect Your Business Systems</CardTitle>
              <CardDescription className="text-base">
                Let us analyze your current tools and show you how Biz Dev can enhance or replace them.
                We'll securely connect to your systems and provide personalized recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Secure OAuth Connection</div>
                    <div className="text-sm text-muted-foreground">
                      We never store your passwords. You authorize access through official OAuth.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">AI-Powered Analysis</div>
                    <div className="text-sm text-muted-foreground">
                      Our AI analyzes your usage patterns and suggests optimal integrations.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Easy Migration</div>
                    <div className="text-sm text-muted-foreground">
                      One-click migration of contacts, data, and workflows.
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => navigate('/ecosystem/hub')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Hub
                </Button>
                <Button className="flex-1" onClick={() => setCurrentStep('platform')}>
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'platform':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Select Your Platform</h2>
              <p className="text-muted-foreground mt-2">
                Choose the business system you want to analyze and connect
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PLATFORMS.map((platform) => (
                <Card
                  key={platform.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPlatform?.id === platform.id ? 'ring-2 ring-primary' : ''
                  } ${!platform.available ? 'opacity-50' : ''}`}
                  onClick={() => platform.available && handlePlatformSelect(platform)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${platform.color}`}>
                        <platform.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        {!platform.available && (
                          <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{platform.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        );

      case 'authorize':
        return (
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full ${selectedPlatform?.color} flex items-center justify-center mb-4`}>
                {selectedPlatform && <selectedPlatform.icon className="h-8 w-8 text-white" />}
              </div>
              <CardTitle>Connect to {selectedPlatform?.name}</CardTitle>
              <CardDescription>
                You'll be redirected to {selectedPlatform?.name} to authorize Biz Dev to access your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="text-sm font-medium">Permissions Requested:</div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Read contacts and companies</li>
                  <li>• Read calendar events</li>
                  <li>• Read email metadata (not content)</li>
                  <li>• Read file structure (not content)</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep('platform')} disabled={isProcessing}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button className="flex-1" onClick={handleAuthorize} disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Authorize Access
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'discover':
        return (
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle>Discovering Your Systems</CardTitle>
              <CardDescription>
                Scanning {selectedPlatform?.name} to understand your current setup...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="text-center text-sm text-muted-foreground">
                {progress < 30 && "Connecting to API..."}
                {progress >= 30 && progress < 60 && "Scanning contacts and companies..."}
                {progress >= 60 && progress < 90 && "Analyzing usage patterns..."}
                {progress >= 90 && "Finalizing discovery..."}
              </div>
            </CardContent>
          </Card>
        );

      case 'analyze':
        return (
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <CardTitle>AI Analysis in Progress</CardTitle>
              <CardDescription>
                Generating personalized recommendations based on your setup...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="text-center text-sm text-muted-foreground">
                {progress < 50 && "Mapping your tools to Biz Dev features..."}
                {progress >= 50 && progress < 80 && "Calculating migration complexity..."}
                {progress >= 80 && "Building recommendations..."}
              </div>
            </CardContent>
          </Card>
        );

      case 'results':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Analysis Complete</h2>
              <p className="text-muted-foreground mt-2">
                Here's what we found and our recommendations for your business
              </p>
            </div>

            {/* Discovered Data Summary */}
            {discoveredData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    What We Found in {selectedPlatform?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{discoveredData.data_volumes?.contacts || 0}</div>
                      <div className="text-sm text-muted-foreground">Contacts</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{discoveredData.data_volumes?.emails || 0}</div>
                      <div className="text-sm text-muted-foreground">Emails</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{discoveredData.data_volumes?.files || 0}</div>
                      <div className="text-sm text-muted-foreground">Files</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{discoveredData.apps_in_use?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Apps in Use</div>
                    </div>
                  </div>
                  {discoveredData.apps_in_use && (
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Apps Detected:</div>
                      <div className="flex flex-wrap gap-2">
                        {discoveredData.apps_in_use.map((app: string) => (
                          <Badge key={app} variant="secondary">{app}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recommended Actions
                </CardTitle>
                <CardDescription>
                  Based on your setup, here's how Biz Dev can help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium">{rec.biz_dev_feature}</div>
                          <div className="text-sm text-muted-foreground">
                            Currently using: {rec.current_tool}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getEffortBadge(rec.migration_effort)}
                          <Badge variant="outline">{rec.estimated_time}</Badge>
                        </div>
                      </div>
                      <p className="text-sm mt-2">{rec.benefit}</p>
                      {rec.data_to_migrate && rec.data_to_migrate.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {rec.data_to_migrate.map((data) => (
                            <Badge key={data} variant="secondary" className="text-xs">
                              {data}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button size="sm" className="mt-3">
                        Enable Feature
                      </Button>
                    </div>
                  ))}
                  {recommendations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      No specific recommendations generated. Your system is already optimized!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => navigate('/ecosystem/hub')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Ecosystem Hub
              </Button>
              <Button onClick={() => setCurrentStep('platform')}>
                Connect Another System
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (authLoading) {
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
        <div className="flex-1 p-6">
          {/* Progress indicator */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {['welcome', 'platform', 'authorize', 'discover', 'results'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step
                        ? 'bg-primary text-primary-foreground'
                        : ['welcome', 'platform', 'authorize', 'discover', 'results'].indexOf(currentStep) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {['welcome', 'platform', 'authorize', 'discover', 'results'].indexOf(currentStep) > index ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 4 && (
                    <div
                      className={`w-16 h-0.5 ${
                        ['welcome', 'platform', 'authorize', 'discover', 'results'].indexOf(currentStep) > index
                          ? 'bg-green-500'
                          : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {renderStep()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
