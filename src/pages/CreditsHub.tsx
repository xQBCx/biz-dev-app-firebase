import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins, TrendingUp, Users, Calculator, Award, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreditSystemDashboard } from "@/components/credits/CreditSystemDashboard";
import { ContributionEventsList } from "@/components/credits/ContributionEventsList";
import { PayoutCalculator } from "@/components/credits/PayoutCalculator";
import { CreditLeaderboard } from "@/components/credits/CreditLeaderboard";
import { ContributionAnalytics } from "@/components/credits/ContributionAnalytics";
import { CreditSourceBreakdown } from "@/components/credits/CreditSourceBreakdown";
import { AgentAttributionPanel } from "@/components/credits/AgentAttributionPanel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function CreditsHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch contribution events for breakdown chart
  const { data: events = [] } = useQuery({
    queryKey: ["contribution-events-breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contribution_events")
        .select("id, actor_type, compute_credits, action_credits, outcome_credits")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <>
      <Helmet>
        <title>Credits Hub | Contribution & Monetization</title>
        <meta
          name="description"
          content="Track your credits, contributions, and earnings across the platform"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Credits Hub
                </h1>
                <p className="text-muted-foreground">
                  Track contributions, credits, and earnings
                </p>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto gap-1">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 py-2">
                <Coins className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 py-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2 py-2">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2 py-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Agents</span>
              </TabsTrigger>
              <TabsTrigger value="breakdown" className="flex items-center gap-2 py-2">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Breakdown</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2 py-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger value="payout" className="flex items-center gap-2 py-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Payout</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <CreditSystemDashboard />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <ContributionAnalytics />
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <CreditLeaderboard />
            </TabsContent>

            <TabsContent value="agents" className="space-y-6">
              <AgentAttributionPanel />
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-6">
              <CreditSourceBreakdown events={events} />
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <ContributionEventsList />
            </TabsContent>

            <TabsContent value="payout" className="space-y-6">
              <PayoutCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
