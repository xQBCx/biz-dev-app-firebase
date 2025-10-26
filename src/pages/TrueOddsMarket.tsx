import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, Clock, Plus, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useParlayStore } from "@/hooks/useParlayStore";
import { ParlayDrawer } from "@/components/ParlayDrawer";

export default function TrueOddsMarket() {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { legs, addLeg, openDrawer } = useParlayStore();

  const { data: market, isLoading: marketLoading } = useQuery({
    queryKey: ["trueodds-market", marketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trueodds_markets")
        .select("*")
        .eq("id", marketId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: outcomes, isLoading: outcomesLoading } = useQuery({
    queryKey: ["trueodds-outcomes", marketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trueodds_outcomes")
        .select("*")
        .eq("market_id", marketId);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: signals, isLoading: signalsLoading } = useQuery({
    queryKey: ["trueodds-signals", marketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trueodds_signals")
        .select("*")
        .eq("market_id", marketId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getSignalIcon = (kind: string) => {
    return Number(signals?.find(s => s.kind === kind)?.impact || 0) > 0 
      ? <TrendingUp className="h-4 w-4 text-green-600" />
      : <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getImpactColor = (impact: string | number) => {
    const num = Number(impact);
    if (num > 0) return "text-green-600";
    if (num < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const handleAddToParlay = (outcomeId: string, outcomeLabel: string, odds: number) => {
    if (!market) return;
    
    addLeg({
      marketId: market.id,
      marketLabel: market.label,
      marketCategory: market.category,
      outcomeId,
      outcomeLabel,
      odds,
      signalScore: Number(market.signal_score),
    });

    toast({
      title: "Added to parlay",
      description: `${outcomeLabel} - ${market.label}`,
    });

    openDrawer();
  };

  const isInParlay = (outcomeId: string) => {
    return legs.some(leg => leg.marketId === market?.id && leg.outcomeId === outcomeId);
  };

  if (marketLoading || outcomesLoading || signalsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <p>Market not found</p>
          <Button onClick={() => navigate("/trueodds/explore")} className="mt-4">
            Browse Markets
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate("/trueodds/explore")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Markets
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Market Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <Badge className="mb-3">{market.category}</Badge>
            <h1 className="text-3xl font-bold mb-2">{market.label}</h1>
            {market.description && (
              <p className="text-muted-foreground mb-4">{market.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Closes {new Date(market.close_at).toLocaleString()}
              </div>
              <Badge variant="outline">
                Signal Score: {Number(market.signal_score).toFixed(2)}
              </Badge>
            </div>
          </Card>

          {/* Outcomes */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Place Your Pick</h2>
            <div className="space-y-3">
              {outcomes?.map((outcome) => (
                <div key={outcome.id} className="p-4 rounded-lg border-2 border-border">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">{outcome.label}</span>
                      <span className="text-2xl font-bold text-primary">
                        {Number(outcome.live_odds).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      variant={isInParlay(outcome.id) ? "secondary" : "outline"}
                      onClick={() => handleAddToParlay(outcome.id, outcome.label, Number(outcome.live_odds))}
                      className="gap-2 w-full"
                    >
                      {isInParlay(outcome.id) ? (
                        <>
                          <Check className="h-4 w-4" />
                          In Parlay
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add to Parlay
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Signal Feed */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Signal Feed</h2>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Signals</TabsTrigger>
                <TabsTrigger value="high">High Impact</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-3 mt-4">
                {signals && signals.length > 0 ? (
                  signals.map((signal) => (
                    <div key={signal.id} className="border-l-4 border-primary/30 pl-4 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getSignalIcon(signal.kind)}
                            <Badge variant="outline">{signal.kind}</Badge>
                            <span className="text-xs text-muted-foreground">{signal.source}</span>
                          </div>
                          <p className="text-sm">{signal.summary}</p>
                          {signal.url && (
                            <a href={signal.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1">
                              Source <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Weight: {Number(signal.weight).toFixed(2)}</div>
                          <div className={`text-sm font-semibold ${getImpactColor(signal.impact)}`}>
                            {Number(signal.impact) > 0 ? "+" : ""}{Number(signal.impact).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No signals yet for this market</p>
                )}
              </TabsContent>

              <TabsContent value="high" className="space-y-3 mt-4">
                {signals?.filter(s => Number(s.weight) > 0.5).map((signal) => (
                  <div key={signal.id} className="border-l-4 border-primary pl-4 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getSignalIcon(signal.kind)}
                          <Badge variant="default">{signal.kind}</Badge>
                          <span className="text-xs text-muted-foreground">{signal.source}</span>
                        </div>
                        <p className="text-sm font-medium">{signal.summary}</p>
                      </div>
                      <div className={`text-lg font-bold ${getImpactColor(signal.impact)}`}>
                        {Number(signal.impact) > 0 ? "+" : ""}{Number(signal.impact).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar - Quick Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Market Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="default">{market.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Odds</span>
                <span className="font-medium">{Number(market.base_odds).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Live Odds</span>
                <span className="font-bold text-primary">{Number(market.live_odds).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Signal Count</span>
                <span className="font-medium">{signals?.length || 0}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-2">🎯 Simulation Mode</h3>
            <p className="text-sm text-muted-foreground">
              You're in skill-based prediction mode. No real money settlement. Build your strategy and track your ROI!
            </p>
          </Card>
        </div>
      </div>

      <ParlayDrawer />
    </div>
  );
}