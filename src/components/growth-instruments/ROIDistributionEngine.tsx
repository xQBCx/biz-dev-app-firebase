import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, Loader2, TrendingUp, ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export const ROIDistributionEngine = () => {
  const { user } = useAuth();

  const { data: instruments, isLoading } = useQuery({
    queryKey: ["growth-instruments-roi", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("human_growth_instruments")
        .select(`
          *,
          growth_instrument_milestones (
            id,
            status,
            release_percent
          ),
          growth_instrument_investments (
            id,
            amount,
            investor_user_id,
            status
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: distributions, isLoading: distLoading } = useQuery({
    queryKey: ["my-distributions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("growth_instrument_distributions")
        .select(`
          *,
          growth_instrument_investments!inner (
            investor_user_id
          )
        `)
        .eq("growth_instrument_investments.investor_user_id", user.id)
        .order("distributed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const totalDistributed = distributions?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  const calculateMilestoneProgress = (instrument: any) => {
    const milestones = instrument.growth_instrument_milestones || [];
    if (milestones.length === 0) return 0;
    const completed = milestones.filter((m: any) => m.status === "completed" || m.status === "verified").length;
    return (completed / milestones.length) * 100;
  };

  const calculateReleasedFunds = (instrument: any) => {
    const milestones = instrument.growth_instrument_milestones || [];
    const completedPercent = milestones
      .filter((m: any) => m.status === "completed" || m.status === "verified")
      .reduce((sum: number, m: any) => sum + Number(m.release_percent || 0), 0);
    return (Number(instrument.funded_amount) * completedPercent) / 100;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <ArrowDownRight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">${totalDistributed.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Active Instruments</p>
                <p className="text-2xl font-bold">
                  {instruments?.filter(i => i.status === "in_progress" || i.status === "funded").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {instruments?.filter(i => i.status === "completed").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fund Release Status</CardTitle>
            <CardDescription>Progress-based fund releases by instrument</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : instruments && instruments.length > 0 ? (
              <div className="space-y-4">
                {instruments.map((inst) => {
                  const progress = calculateMilestoneProgress(inst);
                  const released = calculateReleasedFunds(inst);
                  const investors = (inst.growth_instrument_investments as any[])?.length || 0;
                  
                  return (
                    <div key={inst.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{inst.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {investors} investor{investors !== 1 ? "s" : ""} • {inst.upside_share_percent}% upside share
                          </p>
                        </div>
                        <Badge variant="secondary" className={
                          inst.status === "completed" ? "bg-green-500/10 text-green-600" :
                          inst.status === "in_progress" ? "bg-blue-500/10 text-blue-600" :
                          "bg-muted"
                        }>
                          {inst.status.replace("_", " ")}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Milestone Progress</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-xs text-muted-foreground">Funded</p>
                          <p className="font-medium">${Number(inst.funded_amount).toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-green-500/10 rounded">
                          <p className="text-xs text-muted-foreground">Released</p>
                          <p className="font-medium text-green-600">${released.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No instruments to track</p>
                <p className="text-sm">Create growth instruments to start tracking ROI</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution History</CardTitle>
            <CardDescription>ROI payments received from investments</CardDescription>
          </CardHeader>
          <CardContent>
            {distLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : distributions && distributions.length > 0 ? (
              <div className="space-y-3">
                {distributions.map((dist) => (
                  <div key={dist.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        dist.distribution_type === "roi" ? "bg-green-500/10" :
                        dist.distribution_type === "bonus" ? "bg-purple-500/10" :
                        "bg-yellow-500/10"
                      }`}>
                        {dist.distribution_type === "roi" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : dist.distribution_type === "bonus" ? (
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm capitalize">{dist.distribution_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(dist.distributed_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">+${Number(dist.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ArrowDownRight className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No distributions yet</p>
                <p className="text-sm">Distributions appear as milestones are completed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
