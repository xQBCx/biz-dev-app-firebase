import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Loader2, PiggyBank, ArrowUpRight, Calendar } from "lucide-react";
import { format } from "date-fns";

export const InvestmentAllocationPanel = () => {
  const { user } = useAuth();

  const { data: instruments, isLoading } = useQuery({
    queryKey: ["growth-instruments-funding", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("human_growth_instruments")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["draft", "seeking_funding", "funded", "in_progress"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: investments, isLoading: investmentsLoading } = useQuery({
    queryKey: ["my-investments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("growth_instrument_investments")
        .select(`
          *,
          human_growth_instruments (
            title,
            instrument_type,
            status,
            upside_share_percent
          )
        `)
        .eq("investor_user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  const activeInvestments = investments?.filter(inv => inv.status === "active").length || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <PiggyBank className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold">${totalInvested.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Investments</p>
                <p className="text-2xl font-bold">{activeInvestments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ArrowUpRight className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Expected Return</p>
                <p className="text-2xl font-bold">
                  {investments && investments.length > 0
                    ? (investments.reduce((sum, inv) => sum + (Number(inv.expected_return_percent) || 0), 0) / investments.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seeking Funding</CardTitle>
            <CardDescription>Your instruments ready for investment</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : instruments && instruments.filter(i => i.status === "seeking_funding").length > 0 ? (
              <div className="space-y-4">
                {instruments.filter(i => i.status === "seeking_funding").map((inst) => {
                  const progress = inst.target_amount > 0 ? (Number(inst.funded_amount) / Number(inst.target_amount)) * 100 : 0;
                  return (
                    <div key={inst.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{inst.title}</h4>
                          <p className="text-sm text-muted-foreground">{inst.instrument_type}</p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                          {progress.toFixed(0)}% funded
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          ${Number(inst.funded_amount).toLocaleString()} raised
                        </span>
                        <span className="font-medium">
                          ${Number(inst.target_amount).toLocaleString()} goal
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No instruments seeking funding</p>
                <p className="text-sm">Update a draft instrument to start seeking investors</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Investments</CardTitle>
            <CardDescription>Investments you've made in growth instruments</CardDescription>
          </CardHeader>
          <CardContent>
            {investmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : investments && investments.length > 0 ? (
              <div className="space-y-3">
                {investments.map((inv) => (
                  <div key={inv.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">
                          {(inv.human_growth_instruments as any)?.title || "Unknown Instrument"}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {(inv.human_growth_instruments as any)?.instrument_type}
                        </p>
                      </div>
                      <Badge variant="secondary" className={
                        inv.status === "active" ? "bg-green-500/10 text-green-600" : "bg-muted"
                      }>
                        {inv.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">${Number(inv.amount).toLocaleString()}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(inv.investment_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No investments yet</p>
                <p className="text-sm">Invest in growth instruments to earn performance-backed returns</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
