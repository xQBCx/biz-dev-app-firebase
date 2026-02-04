import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileText, Brain, TrendingDown, Zap, RefreshCw, DollarSign, BarChart3, Lightbulb, Link2 } from "lucide-react";
import { BillUploadDialog } from "@/components/billing/BillUploadDialog";
import { BillCard } from "@/components/billing/BillCard";
import { BillAnalysisPanel } from "@/components/billing/BillAnalysisPanel";
import { RecommendationsPanel } from "@/components/billing/RecommendationsPanel";
import { ModelUsageStats } from "@/components/billing/ModelUsageStats";

interface Bill {
  id: string;
  bill_name: string;
  bill_type: string;
  vendor_name: string | null;
  amount: number | null;
  currency: string;
  status: string;
  file_url: string;
  created_at: string;
  extracted_data: Record<string, unknown>;
}

interface Recommendation {
  id: string;
  recommendation_type: string;
  current_cost: number | null;
  potential_savings: number | null;
  confidence_score: number | null;
  reasoning: string | null;
  action_steps: string[];
  status: string;
}

export default function BillIntelligence() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [activeTab, setActiveTab] = useState("bills");

  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ["company-bills", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_bills")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Bill[];
    },
    enabled: !!user?.id,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["bill-recommendations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bill_recommendations")
        .select("*")
        .eq("user_id", user?.id)
        .order("potential_savings", { ascending: false });
      if (error) throw error;
      return data as Recommendation[];
    },
    enabled: !!user?.id,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("bill-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "company_bills", filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["company-bills"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bill_recommendations", filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["bill-recommendations"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Stats calculations
  const totalBills = bills.length;
  const analyzedBills = bills.filter(b => b.status === "analyzed").length;
  const totalSpend = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
  const potentialSavings = recommendations.reduce((sum, r) => sum + (r.potential_savings || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bill Intelligence</h1>
            <p className="text-muted-foreground">
              AI-powered bill analysis and optimization recommendations
            </p>
          </div>
          <Button onClick={() => setUploadOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Bill
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bills</p>
                  <p className="text-2xl font-bold">{totalBills}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <Progress value={(analyzedBills / Math.max(totalBills, 1)) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{analyzedBills} analyzed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spend</p>
                  <p className="text-2xl font-bold">${totalSpend.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-600">${potentialSavings.toLocaleString()}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {recommendations.filter(r => r.status === "pending").length} recommendations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI Models Used</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Multi-model analysis</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="bills" className="gap-2">
              <FileText className="h-4 w-4" />
              Bills
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="linked" className="gap-2">
              <Link2 className="h-4 w-4" />
              Linked Accounts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bills" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {billsLoading ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Loading bills...
                    </CardContent>
                  </Card>
                ) : bills.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No bills uploaded yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Upload your first bill to get AI-powered analysis and savings recommendations
                      </p>
                      <Button onClick={() => setUploadOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Bill
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  bills.map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      isSelected={selectedBill?.id === bill.id}
                      onSelect={() => setSelectedBill(bill)}
                    />
                  ))
                )}
              </div>

              <div>
                {selectedBill ? (
                  <BillAnalysisPanel bill={selectedBill} />
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Brain className="h-8 w-8 mx-auto mb-4 opacity-50" />
                      <p>Select a bill to view analysis</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-4">
            <RecommendationsPanel recommendations={recommendations} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <ModelUsageStats />
          </TabsContent>

          <TabsContent value="linked" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Linked Billing Accounts</CardTitle>
                <CardDescription>
                  Connect your billing accounts for automatic optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 text-center">
                <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Link your utility, telecom, and SaaS accounts for real-time monitoring and automated savings
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <BillUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} userId={user?.id || ""} />
      </div>
    </div>
  );
}
