import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoaderFullScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Building2, 
  Globe, 
  FolderTree, 
  FileSearch,
  Network,
  ExternalLink,
  Rocket,
  CheckCircle2,
  Clock,
  Edit,
  Share2,
  Settings,
  Link2
} from "lucide-react";
import { ERPStructureView } from "@/components/business/ERPStructureView";
import { WebsitePreview } from "@/components/business/WebsitePreview";
import { ResearchView } from "@/components/business/ResearchView";
import { ModuleEnablePanel } from "@/components/business/ModuleEnablePanel";
import { BusinessHubChatBar } from "@/components/business/BusinessHubChatBar";
import { DomainManagement } from "@/components/business/DomainManagement";
import { WhitePaperIcon } from "@/components/whitepaper/WhitePaperIcon";
import { cn } from "@/lib/utils";

interface Business {
  id: string;
  business_name: string;
  status: string;
  spawn_progress: number;
  industry?: string;
  description?: string;
  erp_structure?: any;
  website_data?: any;
  research_data?: any;
  offers_tags?: string[];
  needs_tags?: string[];
  enabled_modules?: Record<string, boolean>;
  created_at: string;
  total_ai_tokens_used?: number;
}

export default function BusinessHub() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!id) {
        navigate("/business-spawn");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("spawned_businesses")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        const modules = (data?.enabled_modules as Record<string, boolean>) || {};
        setBusiness({ ...data, enabled_modules: modules });
        setEnabledModules(modules);
      } catch (error) {
        console.error("Error fetching business:", error);
        toast.error("Failed to load business");
        navigate("/business-spawn");
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id, navigate]);

  if (loading) {
    return <LoaderFullScreen />;
  }

  if (!business) {
    return null;
  }

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    researching: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    generating_erp: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    generating_website: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    active: "bg-green-500/10 text-green-600 border-green-500/30",
    suspended: "bg-red-500/10 text-red-600 border-red-500/30"
  };

  const hasWebsite = business.website_data && Object.keys(business.website_data).length > 0;
  const hasERP = business.erp_structure && Object.keys(business.erp_structure).length > 0;
  const hasResearch = business.research_data && Object.keys(business.research_data).length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/my-businesses")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                My Businesses
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{business.business_name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {business.industry && <span>{business.industry}</span>}
                    <span>•</span>
                    <span>Created {new Date(business.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn("border", statusColors[business.status] || statusColors.draft)}>
                {business.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {business.status === 'draft' && <Clock className="w-3 h-3 mr-1" />}
                {business.status.replace('_', ' ')}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => navigate(`/business-spawn?continue=${id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Continue Building
              </Button>
              <Button size="sm" disabled={business.status !== 'active'}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <Building2 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="website" className="gap-2" disabled={!hasWebsite}>
              <Globe className="w-4 h-4" />
              Website
              {hasWebsite && <CheckCircle2 className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="erp" className="gap-2" disabled={!hasERP}>
              <FolderTree className="w-4 h-4" />
              ERP Structure
              {hasERP && <CheckCircle2 className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="research" className="gap-2" disabled={!hasResearch}>
              <FileSearch className="w-4 h-4" />
              Research
              {hasResearch && <CheckCircle2 className="w-3 h-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="network" className="gap-2">
              <Network className="w-4 h-4" />
              Network
            </TabsTrigger>
            <TabsTrigger value="domains" className="gap-2">
              <Link2 className="w-4 h-4" />
              Domains
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-2">
              <Settings className="w-4 h-4" />
              Modules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Business Info */}
              <Card className="p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold mb-4">Business Profile</h2>
                {business.description && (
                  <p className="text-muted-foreground mb-6">{business.description}</p>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  {business.offers_tags && business.offers_tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">What We Offer</h3>
                      <div className="flex flex-wrap gap-2">
                        {business.offers_tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {business.needs_tags && business.needs_tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">What We Need</h3>
                      <div className="flex flex-wrap gap-2">
                        {business.needs_tags.map((tag, i) => (
                          <Badge key={i} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Generation Stats</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{business.spawn_progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AI Tokens Used</span>
                      <span className="font-medium">{business.total_ai_tokens_used?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Website</span>
                      <span>{hasWebsite ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ERP Structure</span>
                      <span>{hasERP ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}</span>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                  <div className="space-y-2">
                    {hasWebsite && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => setActiveTab("website")}
                      >
                        <Globe className="w-4 h-4" />
                        View Website
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                    )}
                    {hasERP && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => setActiveTab("erp")}
                      >
                        <FolderTree className="w-4 h-4" />
                        View ERP Structure
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      onClick={() => navigate(`/business-spawn?continue=${id}`)}
                    >
                      <Rocket className="w-4 h-4" />
                      Continue Building
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="website">
            {hasWebsite ? (
              <WebsitePreview websiteData={business.website_data} businessName={business.business_name} />
            ) : (
              <Card className="p-12 text-center">
                <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Website Not Generated Yet</h3>
                <p className="text-muted-foreground mb-4">Continue building your business to generate your website.</p>
                <Button onClick={() => navigate(`/business-spawn?continue=${id}`)}>
                  Continue Building
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="erp">
            {hasERP ? (
              <ERPStructureView erpData={business.erp_structure} businessName={business.business_name} />
            ) : (
              <Card className="p-12 text-center">
                <FolderTree className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">ERP Structure Not Generated Yet</h3>
                <p className="text-muted-foreground mb-4">Continue building your business to generate your organizational structure.</p>
                <Button onClick={() => navigate(`/business-spawn?continue=${id}`)}>
                  Continue Building
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="research">
            {hasResearch ? (
              <ResearchView researchData={business.research_data} businessName={business.business_name} />
            ) : (
              <Card className="p-12 text-center">
                <FileSearch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Market Research Not Available</h3>
                <p className="text-muted-foreground mb-4">Research data will appear here after market analysis is complete.</p>
                <Button onClick={() => navigate(`/business-spawn?continue=${id}`)}>
                  Continue Building
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="network">
            <Card className="p-12 text-center">
              <Network className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Network Connections</h3>
              <p className="text-muted-foreground mb-4">
                Launch your business to discover complementary partners in the network.
              </p>
              {business.status !== 'active' && (
                <Button disabled>Launch to Connect</Button>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="domains">
            <DomainManagement 
              businessId={business.id} 
              businessName={business.business_name} 
            />
          </TabsContent>

          <TabsContent value="modules">
            <ModuleEnablePanel
              businessId={business.id}
              businessType={business.industry}
              enabledModules={enabledModules}
              onModuleToggle={(key, enabled) => {
                setEnabledModules(prev => ({ ...prev, [key]: enabled }));
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Chat Bar */}
      <BusinessHubChatBar 
        businessId={business.id} 
        businessName={business.business_name} 
      />
    </div>
  );
}
