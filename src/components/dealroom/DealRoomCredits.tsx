import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, 
  Activity, 
  TrendingUp, 
  Users,
  Package,
  Zap,
  ArrowRight,
  Info
} from "lucide-react";
import { BlenderKnowledgeHelper } from "./BlenderKnowledgeHelper";
import { format } from "date-fns";

interface CreditContribution {
  id: string;
  participant_id: string;
  classification: string;
  credits_amount: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  participant?: {
    name: string;
    email: string;
  };
  ingredient?: {
    name: string;
    ingredient_type: string;
  };
}

interface CreditUsage {
  id: string;
  usage_type: string;
  usage_count: number;
  compute_hours: number;
  recorded_at: string;
}

interface CreditValue {
  id: string;
  value_type: string;
  amount: number;
  currency: string;
  source_description: string | null;
  verified_at: string | null;
  created_at: string;
}

interface DealRoomCreditsProps {
  dealRoomId: string;
  myParticipantId?: string;
  isAdmin: boolean;
}

const classificationLabels: Record<string, { label: string; color: string }> = {
  ingredient_one_time: { label: "One-Time Ingredient", color: "bg-blue-500/20 text-blue-600" },
  ingredient_embedded: { label: "Embedded Ingredient", color: "bg-emerald-500/20 text-emerald-600" },
  formulation_effort: { label: "Formulation Effort", color: "bg-purple-500/20 text-purple-600" },
  process_governance: { label: "Process Governance", color: "bg-amber-500/20 text-amber-600" },
  distribution_origination: { label: "Distribution/Origination", color: "bg-pink-500/20 text-pink-600" },
  execution_deployment: { label: "Execution/Deployment", color: "bg-cyan-500/20 text-cyan-600" },
  risk_assumption: { label: "Risk Assumption", color: "bg-red-500/20 text-red-600" },
};

export const DealRoomCredits = ({ 
  dealRoomId, 
  myParticipantId,
  isAdmin 
}: DealRoomCreditsProps) => {
  const [contributions, setContributions] = useState<CreditContribution[]>([]);
  const [usageCredits, setUsageCredits] = useState<CreditUsage[]>([]);
  const [valueCredits, setValueCredits] = useState<CreditValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("contributions");

  useEffect(() => {
    fetchCredits();
  }, [dealRoomId]);

  const fetchCredits = async () => {
    setLoading(true);
    
    // Fetch contribution credits with participant info
    const { data: contribData } = await supabase
      .from("credit_contributions")
      .select(`
        *,
        participant:deal_room_participants(name, email),
        ingredient:blender_ingredients(name, ingredient_type)
      `)
      .eq("deal_room_id", dealRoomId)
      .order("created_at", { ascending: false });

    if (contribData) setContributions(contribData);

    // Fetch usage credits
    if (contribData && contribData.length > 0) {
      const creditIds = contribData.map(c => c.id);
      const { data: usageData } = await supabase
        .from("credit_usage")
        .select("*")
        .in("contribution_credit_id", creditIds)
        .order("recorded_at", { ascending: false })
        .limit(50);
      
      if (usageData) setUsageCredits(usageData);
    }

    // Fetch value credits
    const { data: valueData } = await supabase
      .from("credit_value")
      .select("*")
      .eq("deal_room_id", dealRoomId)
      .order("created_at", { ascending: false });

    if (valueData) setValueCredits(valueData);

    setLoading(false);
  };

  const totalContributionCredits = contributions.reduce((sum, c) => sum + (c.credits_amount || 0), 0);
  const totalUsageCount = usageCredits.reduce((sum, u) => sum + u.usage_count, 0);
  const totalValueGenerated = valueCredits.reduce((sum, v) => sum + v.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading credits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Credit Flow Visualization */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Credit System Overview</h3>
          <BlenderKnowledgeHelper compact showTitle={false} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Contribution Credits */}
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Contribution Credits</span>
              <BlenderKnowledgeHelper conceptKey="contribution_credits" />
            </div>
            <p className="text-3xl font-bold text-blue-500">
              {totalContributionCredits.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {contributions.length} active contributions
            </p>
          </Card>

          {/* Usage Credits */}
          <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <span className="font-medium">Usage Events</span>
              <BlenderKnowledgeHelper conceptKey="usage_credits" />
            </div>
            <p className="text-3xl font-bold text-amber-500">
              {totalUsageCount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tracked automatically
            </p>
          </Card>

          {/* Value Credits */}
          <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span className="font-medium">Value Generated</span>
              <BlenderKnowledgeHelper conceptKey="value_credits" />
            </div>
            <p className="text-3xl font-bold text-emerald-500">
              ${totalValueGenerated.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {valueCredits.filter(v => v.verified_at).length} verified
            </p>
          </Card>
        </div>

        {/* Flow Arrow */}
        <div className="flex items-center justify-center gap-4 py-4 text-muted-foreground">
          <span className="text-sm">Contributions</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm">Usage</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm">Value</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-sm font-medium text-primary">Payouts</span>
        </div>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contributions" className="gap-2">
            <Award className="w-4 h-4" />
            Contributions ({contributions.length})
          </TabsTrigger>
          <TabsTrigger value="usage" className="gap-2">
            <Activity className="w-4 h-4" />
            Usage Log ({usageCredits.length})
          </TabsTrigger>
          <TabsTrigger value="value" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Value ({valueCredits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contributions" className="mt-4">
          {contributions.length === 0 ? (
            <Card className="p-8 text-center">
              <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Contributions Yet</h3>
              <p className="text-muted-foreground mb-4">
                Contribution credits are issued when participants add ingredients or formulations to this deal.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {contributions.map((contrib) => (
                <Card key={contrib.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {contrib.participant?.name || "Unknown Participant"}
                        </span>
                        <Badge className={classificationLabels[contrib.classification]?.color || ""}>
                          {classificationLabels[contrib.classification]?.label || contrib.classification}
                        </Badge>
                      </div>
                      {contrib.description && (
                        <p className="text-sm text-muted-foreground">{contrib.description}</p>
                      )}
                      {contrib.ingredient && (
                        <div className="flex items-center gap-2 mt-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {contrib.ingredient.name} ({contrib.ingredient.ingredient_type})
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {contrib.credits_amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">credits</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <span>Added {format(new Date(contrib.created_at), "MMM d, yyyy")}</span>
                    {!contrib.is_active && (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          {usageCredits.length === 0 ? (
            <Card className="p-8 text-center">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Usage Recorded Yet</h3>
              <p className="text-muted-foreground">
                Usage credits are tracked automatically when contributions are used in production.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {usageCredits.map((usage) => (
                <Card key={usage.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Activity className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {usage.usage_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(usage.recorded_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{usage.usage_count}x</p>
                    {usage.compute_hours > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {usage.compute_hours.toFixed(2)} compute hrs
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="value" className="mt-4">
          {valueCredits.length === 0 ? (
            <Card className="p-8 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Value Generated Yet</h3>
              <p className="text-muted-foreground">
                Value credits appear when contributions produce measurable outcomes like revenue or cost savings.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {valueCredits.map((value) => (
                <Card key={value.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize">
                          {value.value_type.replace(/_/g, " ")}
                        </Badge>
                        {value.verified_at && (
                          <Badge className="bg-emerald-500/20 text-emerald-600">
                            Verified
                          </Badge>
                        )}
                      </div>
                      {value.source_description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {value.source_description}
                        </p>
                      )}
                    </div>
                    <p className="text-xl font-bold text-emerald-500">
                      ${value.amount.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(value.created_at), "MMM d, yyyy")}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};