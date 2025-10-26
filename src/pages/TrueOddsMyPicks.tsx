import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrueOddsMyPicks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: bets, isLoading } = useQuery({
    queryKey: ["my-trueodds-bets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("trueodds_bets")
        .select(`
          *,
          trueodds_bet_legs(
            *,
            trueodds_markets(label, category),
            trueodds_outcomes(label)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: wallet } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        // Create wallet if doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({ user_id: user.id, balance: 1000, is_simulation: true })
          .select()
          .single();
        
        if (createError) throw createError;
        return newWallet;
      }
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <p className="mb-4">Sign in to view your picks</p>
          <button onClick={() => navigate("/auth")} className="text-primary underline">
            Sign In
          </button>
        </Card>
      </div>
    );
  }

  const pendingBets = bets?.filter(b => b.status === "PENDING") || [];
  const settledBets = bets?.filter(b => b.status !== "PENDING") || [];
  const wonBets = settledBets.filter(b => b.status === "WON");
  const totalStaked = bets?.reduce((sum, b) => sum + Number(b.stake), 0) || 0;
  const totalWon = wonBets.reduce((sum, b) => sum + Number(b.actual_payout), 0);
  const roi = totalStaked > 0 ? ((totalWon - totalStaked) / totalStaked) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Picks</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold">${Number(wallet?.balance || 0).toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bets</p>
              <p className="text-2xl font-bold">{bets?.length || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${roi >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'} flex items-center justify-center`}>
              {roi >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className={`text-2xl font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">
                {settledBets.length > 0 
                  ? ((wonBets.length / settledBets.length) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bets List */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingBets.length})</TabsTrigger>
          <TabsTrigger value="settled">Settled ({settledBets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </>
          ) : pendingBets.length > 0 ? (
            pendingBets.map((bet) => (
              <Card key={bet.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge>{bet.type}</Badge>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(bet.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant="outline">{bet.status}</Badge>
                </div>
                
                <div className="space-y-2">
                  {bet.trueodds_bet_legs?.map((leg: any) => (
                    <div key={leg.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{leg.trueodds_markets?.label}</span>
                        <span className="text-muted-foreground"> → {leg.trueodds_outcomes?.label}</span>
                      </div>
                      <span className="font-semibold">{Number(leg.locked_odds).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Stake: </span>
                    <span className="font-semibold">${Number(bet.stake).toFixed(2)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Potential: </span>
                    <span className="font-bold text-primary">${Number(bet.potential_payout).toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No pending bets. Explore markets to place your first pick!</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settled" className="space-y-4 mt-4">
          {settledBets.length > 0 ? (
            settledBets.map((bet) => (
              <Card 
                key={bet.id} 
                className={`p-6 ${
                  bet.status === "WON" ? "border-green-500/50" : 
                  bet.status === "LOST" ? "border-red-500/50" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge>{bet.type}</Badge>
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(bet.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge 
                    variant={bet.status === "WON" ? "default" : "destructive"}
                    className={bet.status === "WON" ? "bg-green-600" : ""}
                  >
                    {bet.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {bet.trueodds_bet_legs?.map((leg: any) => (
                    <div key={leg.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{leg.trueodds_markets?.label}</span>
                        <span className="text-muted-foreground"> → {leg.trueodds_outcomes?.label}</span>
                      </div>
                      <span className="font-semibold">{Number(leg.locked_odds).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Staked: </span>
                    <span className="font-semibold">${Number(bet.stake).toFixed(2)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Payout: </span>
                    <span className={`font-bold ${
                      bet.status === "WON" ? "text-green-600" : "text-red-600"
                    }`}>
                      ${Number(bet.actual_payout).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No settled bets yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}