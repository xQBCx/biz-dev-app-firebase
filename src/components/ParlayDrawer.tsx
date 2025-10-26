import { useParlayStore } from "@/hooks/useParlayStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function ParlayDrawer() {
  const { legs, stake, isOpen, removeLeg, setStake, clearParlay, closeDrawer } = useParlayStore();
  const { toast } = useToast();
  const [isPlacing, setIsPlacing] = useState(false);

  // Calculate combined odds
  const combinedOdds = legs.reduce((acc, leg) => acc * leg.odds, 1);
  
  // Calculate correlation factor (simplified)
  const getCorrelationFactor = () => {
    if (legs.length < 2) return 1;
    
    // Check for same category correlation
    const categories = legs.map(l => l.marketCategory);
    const uniqueCategories = new Set(categories);
    
    // Penalty for highly correlated markets
    if (uniqueCategories.size === 1 && legs.length > 2) {
      return 0.85; // 15% penalty for same category
    }
    if (uniqueCategories.size < legs.length) {
      return 0.92; // 8% penalty for some overlap
    }
    return 1; // No penalty for uncorrelated
  };

  const correlationFactor = getCorrelationFactor();
  const adjustedOdds = combinedOdds * correlationFactor;
  const potentialPayout = stake * adjustedOdds;

  // Quality meter (based on correlation and number of legs)
  const getQualityScore = () => {
    if (legs.length === 0) return 0;
    const diversityScore = correlationFactor * 100;
    const legScore = Math.min(legs.length * 15, 50);
    return Math.round((diversityScore + legScore) / 1.5);
  };

  const qualityScore = getQualityScore();

  const getQualityColor = () => {
    if (qualityScore >= 75) return "text-green-600";
    if (qualityScore >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const handlePlaceParlay = async () => {
    if (legs.length < 2) {
      toast({
        title: "Minimum 2 legs required",
        description: "Add at least 2 markets to create a parlay",
        variant: "destructive",
      });
      return;
    }

    setIsPlacing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to place bets",
          variant: "destructive",
        });
        return;
      }

      // Create bet
      const { data: bet, error: betError } = await supabase
        .from("trueodds_bets")
        .insert({
          user_id: user.id,
          type: "PARLAY",
          stake,
          potential_payout: potentialPayout,
          status: "PENDING",
        })
        .select()
        .single();

      if (betError) throw betError;

      // Create bet legs
      const legInserts = legs.map(leg => ({
        bet_id: bet.id,
        market_id: leg.marketId,
        outcome_id: leg.outcomeId,
        locked_odds: leg.odds,
      }));

      const { error: legsError } = await supabase
        .from("trueodds_bet_legs")
        .insert(legInserts);

      if (legsError) throw legsError;

      toast({
        title: "Parlay placed!",
        description: `${legs.length}-leg parlay for $${stake.toFixed(2)}`,
      });

      clearParlay();
      closeDrawer();
    } catch (error: any) {
      toast({
        title: "Failed to place parlay",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={closeDrawer}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Parlay Builder
          </SheetTitle>
          <SheetDescription>
            Combine multiple markets for bigger payouts
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Parlay Quality Meter */}
          {legs.length >= 2 && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Parlay Quality</span>
                <span className={`text-2xl font-bold ${getQualityColor()}`}>
                  {qualityScore}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    qualityScore >= 75 ? "bg-green-600" :
                    qualityScore >= 50 ? "bg-yellow-600" : "bg-red-600"
                  }`}
                  style={{ width: `${qualityScore}%` }}
                />
              </div>
              {correlationFactor < 1 && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  Correlated markets detected - odds adjusted by {((1 - correlationFactor) * 100).toFixed(0)}%
                </div>
              )}
            </div>
          )}

          {/* Legs List */}
          <div className="space-y-3">
            {legs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No selections yet</p>
                <p className="text-xs mt-1">Browse markets and add to parlay</p>
              </div>
            ) : (
              legs.map((leg, index) => (
                <div key={leg.marketId} className="p-3 border rounded-lg bg-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {leg.marketCategory}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Leg {index + 1}</span>
                      </div>
                      <p className="text-sm font-medium line-clamp-1">{leg.marketLabel}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {leg.outcomeLabel}
                        </Badge>
                        <span className="text-sm font-semibold text-primary">
                          {leg.odds.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLeg(leg.marketId)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {legs.length > 0 && (
            <>
              <Separator />

              {/* Odds Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Combined Odds</span>
                  <span className="font-semibold">{combinedOdds.toFixed(2)}</span>
                </div>
                {correlationFactor < 1 && (
                  <div className="flex justify-between text-yellow-600">
                    <span>Correlation Adjustment</span>
                    <span>×{correlationFactor.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Final Odds</span>
                  <span className="text-primary">{adjustedOdds.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Stake Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Stake Amount</label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="text-lg"
                  placeholder="Enter stake"
                />
              </div>

              {/* Potential Payout */}
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-medium">Potential Payout</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    ${potentialPayout.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {legs.length}-leg parlay • ${stake.toFixed(2)} stake
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={clearParlay}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handlePlaceParlay}
                  disabled={legs.length < 2 || isPlacing}
                  className="flex-1"
                >
                  {isPlacing ? "Placing..." : "Place Parlay"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
