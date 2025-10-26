import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TrendingUp, TrendingDown, Clock, Trophy, BarChart3, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type MarketCategory = "SPORTS" | "STOCKS" | "CRYPTO" | "WORLD";

export default function TrueOddsExplore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = (searchParams.get("category") as MarketCategory) || "SPORTS";
  const [category, setCategory] = useState<MarketCategory>(initialCategory);

  const { data: markets, isLoading } = useQuery({
    queryKey: ["trueodds-markets", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trueodds_markets")
        .select(`
          *,
          trueodds_outcomes(*)
        `)
        .eq("category", category)
        .eq("status", "OPEN")
        .order("close_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const getCategoryIcon = (cat: MarketCategory) => {
    switch (cat) {
      case "SPORTS": return <Trophy className="h-4 w-4" />;
      case "STOCKS": return <TrendingUp className="h-4 w-4" />;
      case "CRYPTO": return <BarChart3 className="h-4 w-4" />;
      case "WORLD": return <Globe className="h-4 w-4" />;
    }
  };

  const formatOdds = (odds: string | number) => Number(odds).toFixed(2);
  
  const getSignalScoreBadge = (score: string | number) => {
    const numScore = Number(score);
    if (numScore > 0.3) return <Badge variant="default" className="bg-green-600"><TrendingUp className="h-3 w-3 mr-1" /> Strong</Badge>;
    if (numScore < -0.3) return <Badge variant="destructive"><TrendingDown className="h-3 w-3 mr-1" /> Weak</Badge>;
    return <Badge variant="secondary">Neutral</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Explore Markets</h1>
        <p className="text-muted-foreground">Browse live prediction markets with transparent odds</p>
      </div>

      <Tabs value={category} onValueChange={(v) => setCategory(v as MarketCategory)}>
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 mb-8">
          <TabsTrigger value="SPORTS" className="gap-2">
            <Trophy className="h-4 w-4" />
            Sports
          </TabsTrigger>
          <TabsTrigger value="STOCKS" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Stocks
          </TabsTrigger>
          <TabsTrigger value="CRYPTO" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Crypto
          </TabsTrigger>
          <TabsTrigger value="WORLD" className="gap-2">
            <Globe className="h-4 w-4" />
            World
          </TabsTrigger>
        </TabsList>

        <TabsContent value={category} className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </>
          ) : markets && markets.length > 0 ? (
            markets.map((market) => (
              <Card 
                key={market.id} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/trueodds/market/${market.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="mt-1">{getCategoryIcon(market.category)}</div>
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{market.label}</h3>
                        {market.description && (
                          <p className="text-sm text-muted-foreground">{market.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {getSignalScoreBadge(market.signal_score)}
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Closes {new Date(market.close_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {market.trueodds_outcomes?.slice(0, 2).map((outcome: any) => (
                      <div key={outcome.id} className="flex justify-between items-center bg-muted/50 rounded-lg px-4 py-2">
                        <span className="font-medium text-sm">{outcome.label}</span>
                        <span className="text-lg font-bold text-primary">{formatOdds(outcome.live_odds)}</span>
                      </div>
                    ))}
                    <Button size="sm" className="mt-2">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No open markets in this category yet. Check back soon!</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}