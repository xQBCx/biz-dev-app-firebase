import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Loader2, TrendingUp, DollarSign, Zap, Award, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const CreatorAnalytics = () => {
  const { user } = useAuth();
  const { id: effectiveUserId } = useEffectiveUser();

  const { data: licenses } = useQuery({
    queryKey: ["brand-licenses", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from("creator_brand_licenses")
        .select("*")
        .eq("user_id", effectiveUserId);
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveUserId,
  });

  const { data: businesses } = useQuery({
    queryKey: ["passive-businesses", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from("creator_passive_businesses")
        .select("*")
        .eq("user_id", effectiveUserId);
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveUserId,
  });

  const { data: templates } = useQuery({
    queryKey: ["content-templates-count", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return [];
      const { data, error } = await supabase
        .from("creator_content_templates")
        .select("*")
        .eq("user_id", effectiveUserId);
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveUserId,
  });

  const { data: burnoutScore, isLoading } = useQuery({
    queryKey: ["burnout-score", effectiveUserId],
    queryFn: async () => {
      if (!effectiveUserId) return null;
      const { data, error } = await supabase
        .from("burnout_risk_scores")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveUserId,
  });

  // Calculate metrics
  const totalRoyalties = licenses?.reduce((sum, l) => sum + Number(l.total_earned || 0), 0) || 0;
  const activeBusinesses = businesses?.filter(b => b.status === "launched" || b.status === "scaling").length || 0;
  const monthlyPassiveIncome = businesses?.reduce((sum, b) => sum + (Number(b.monthly_revenue || 0) - Number(b.monthly_expenses || 0)), 0) || 0;
  const totalTemplates = templates?.length || 0;
  const templateUses = templates?.reduce((sum, t) => sum + (t.use_count || 0), 0) || 0;

  // Diversification score (0-100)
  const diversificationScore = Math.min(100, 
    (licenses?.length || 0) * 15 + 
    (activeBusinesses * 20) + 
    (totalTemplates * 5)
  );

  // Automation level
  const automationLevel = businesses?.length 
    ? (businesses.filter(b => b.automation_level === "full").length / businesses.length) * 100 
    : 0;

  const burnoutRisk = burnoutScore?.overall_risk_score || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold">${(totalRoyalties + monthlyPassiveIncome).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Streams</p>
                <p className="text-2xl font-bold">{(licenses?.filter(l => l.status === "active").length || 0) + activeBusinesses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diversification</p>
                <p className="text-2xl font-bold">{diversificationScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${burnoutRisk > 60 ? 'bg-red-500/10' : burnoutRisk > 30 ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                <AlertTriangle className={`h-5 w-5 ${burnoutRisk > 60 ? 'text-red-600' : burnoutRisk > 30 ? 'text-yellow-600' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Burnout Risk</p>
                <p className="text-2xl font-bold">{burnoutRisk}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Creator Health Score
            </CardTitle>
            <CardDescription>Overall sustainability metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Income Diversification</span>
                <span className="font-medium">{diversificationScore}%</span>
              </div>
              <Progress value={diversificationScore} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {diversificationScore < 30 ? "Add more income streams to reduce risk" :
                 diversificationScore < 60 ? "Good progress, consider expanding" :
                 "Excellent diversification!"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Automation Level</span>
                <span className="font-medium">{automationLevel.toFixed(0)}%</span>
              </div>
              <Progress value={automationLevel} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {automationLevel < 30 ? "More automation = less burnout" :
                 automationLevel < 60 ? "Good automation progress" :
                 "Highly automated income!"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Content Leverage</span>
                <span className="font-medium">{templateUses} uses</span>
              </div>
              <Progress value={Math.min(100, templateUses * 5)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {totalTemplates} templates driving efficiency
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
            <CardDescription>Income by category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Brand Royalties</span>
                    <span className="text-lg font-bold text-green-600">${totalRoyalties.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {licenses?.filter(l => l.status === "active").length || 0} active licenses
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Passive Businesses</span>
                    <span className={`text-lg font-bold ${monthlyPassiveIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${monthlyPassiveIncome.toLocaleString()}/mo
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {activeBusinesses} launched businesses
                  </p>
                </div>

                <div className="p-4 border-2 border-dashed rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Monthly Potential</p>
                  <p className="text-2xl font-bold text-primary">
                    ${(monthlyPassiveIncome + (totalRoyalties / 12)).toLocaleString()}/mo
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
