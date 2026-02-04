import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Rocket, 
  Building2, 
  Plus, 
  Globe, 
  FolderTree,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Boxes,
  Sparkles
} from "lucide-react";
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
  created_at: string;
  is_platform_feature?: boolean;
  feature_route?: string;
}

export default function MyBusinesses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: effectiveUserId } = useEffectiveUser();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!effectiveUserId) return;

      try {
        const { data, error } = await supabase
          .from("spawned_businesses")
          .select("*")
          .eq("user_id", effectiveUserId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBusinesses(data || []);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [effectiveUserId]);

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    researching: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    generating_erp: "bg-purple-500/10 text-purple-600 border-purple-500/30",
    generating_website: "bg-orange-500/10 text-orange-600 border-orange-500/30",
    active: "bg-green-500/10 text-green-600 border-green-500/30",
    suspended: "bg-red-500/10 text-red-600 border-red-500/30"
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Businesses</h1>
            <p className="text-muted-foreground">Manage your spawned businesses and assets</p>
          </div>
          <Button onClick={() => navigate("/business-spawn")} className="gap-2">
            <Plus className="w-4 h-4" />
            Spawn New Business
          </Button>
        </div>

        {/* Businesses Grid */}
        {businesses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => {
              const hasWebsite = business.website_data && Object.keys(business.website_data).length > 0;
              const hasERP = business.erp_structure && Object.keys(business.erp_structure).length > 0;
              const isPlatformFeature = business.is_platform_feature;
              const BusinessIcon = isPlatformFeature ? Boxes : Building2;

              return (
                <Card 
                  key={business.id} 
                  className={cn(
                    "p-6 hover:shadow-lg transition-shadow cursor-pointer group",
                    isPlatformFeature && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => navigate(`/business-hub/${business.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isPlatformFeature ? "bg-primary/20" : "bg-primary/10"
                    )}>
                      <BusinessIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      {isPlatformFeature && (
                        <Badge variant="outline" className="border-primary/50 text-primary gap-1">
                          <Sparkles className="w-3 h-3" />
                          Platform
                        </Badge>
                      )}
                      <Badge className={cn("border", statusColors[business.status] || statusColors.draft)}>
                        {business.status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {business.status === 'draft' && <Clock className="w-3 h-3 mr-1" />}
                        {business.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-1">{business.business_name}</h3>
                  {business.industry && (
                    <p className="text-sm text-muted-foreground mb-3">{business.industry}</p>
                  )}

                  {business.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {business.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{business.spawn_progress}%</span>
                    </div>
                    <Progress value={business.spawn_progress} className="h-2" />
                  </div>

                  {/* Assets Indicators */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {isPlatformFeature && business.feature_route && (
                      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        <Rocket className="w-3 h-3" />
                        Live Platform
                      </div>
                    )}
                    <div className={cn(
                      "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                      hasWebsite || isPlatformFeature ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                    )}>
                      <Globe className="w-3 h-3" />
                      Website
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                      hasERP ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
                    )}>
                      <FolderTree className="w-3 h-3" />
                      ERP
                    </div>
                  </div>

                  {/* View Button */}
                  <Button variant="ghost" className="w-full justify-between group-hover:bg-primary/5">
                    View Business
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Rocket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Businesses Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start your entrepreneurial journey by spawning your first AGI-powered business. 
              We'll help you with research, structure, and launch.
            </p>
            <Button onClick={() => navigate("/business-spawn")} size="lg" className="gap-2">
              <Rocket className="w-5 h-5" />
              Spawn Your First Business
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
