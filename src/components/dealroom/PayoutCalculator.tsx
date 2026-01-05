import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Calculator, 
  DollarSign, 
  Users, 
  TrendingUp,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw
} from "lucide-react";
import { BlenderKnowledgeHelper } from "./BlenderKnowledgeHelper";

interface PayoutCalculatorProps {
  dealRoomId: string;
  isAdmin: boolean;
}

interface Participant {
  id: string;
  name: string;
  email: string;
}

interface AttributionRule {
  id: string;
  participant_id: string;
  participant_name?: string;
  credit_type: string;
  payout_percentage: number;
  min_payout: number | null;
  max_payout: number | null;
}

interface PayoutCalculation {
  id: string;
  participant_id: string;
  participant_name?: string;
  compute_credits_in: number;
  action_credits_in: number;
  outcome_credits_in: number;
  total_credits_in: number;
  attribution_percentage: number;
  calculated_payout: number;
  status: string;
}

export const PayoutCalculator = ({ dealRoomId, isAdmin }: PayoutCalculatorProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [rules, setRules] = useState<AttributionRule[]>([]);
  const [calculations, setCalculations] = useState<PayoutCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [totalPoolValue, setTotalPoolValue] = useState("10000");

  useEffect(() => {
    fetchData();
  }, [dealRoomId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [partRes, rulesRes, calcRes] = await Promise.all([
        supabase
          .from("deal_room_participants")
          .select("id, name, email")
          .eq("deal_room_id", dealRoomId),
        (supabase as any)
          .from("blender_attribution_rules")
          .select("*")
          .eq("deal_room_id", dealRoomId)
          .eq("is_active", true),
        (supabase as any)
          .from("blender_payout_calculations")
          .select("*")
          .eq("deal_room_id", dealRoomId)
          .order("calculation_date", { ascending: false }),
      ]);

      const parts = (partRes.data || []) as Participant[];
      setParticipants(parts);

      // Map participant names to rules
      const rulesWithNames = (rulesRes.data || []).map((r: any) => ({
        ...r,
        participant_name: parts.find(p => p.id === r.participant_id)?.name || r.participant_id,
      }));
      setRules(rulesWithNames);

      // Map participant names to calculations
      const calcsWithNames = (calcRes.data || []).map((c: any) => ({
        ...c,
        participant_name: parts.find(p => p.id === c.participant_id)?.name || "Unknown",
      }));
      setCalculations(calcsWithNames);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runCalculation = async () => {
    if (rules.length === 0) {
      toast.error("No attribution rules defined");
      return;
    }

    setCalculating(true);
    try {
      const poolValue = parseFloat(totalPoolValue);
      if (isNaN(poolValue) || poolValue <= 0) {
        throw new Error("Invalid pool value");
      }

      // Group rules by participant
      const participantRules = rules.reduce((acc, rule) => {
        if (!acc[rule.participant_id]) {
          acc[rule.participant_id] = [];
        }
        acc[rule.participant_id].push(rule);
        return acc;
      }, {} as Record<string, AttributionRule[]>);

      // Calculate payouts for each participant
      const newCalculations: any[] = [];
      
      for (const [participantId, pRules] of Object.entries(participantRules)) {
        // Sum up percentage for this participant
        const totalPercentage = pRules.reduce((sum, r) => sum + r.payout_percentage, 0);
        
        // Calculate base payout
        let calculatedPayout = (poolValue * totalPercentage) / 100;
        let minApplied = false;
        let maxApplied = false;

        // Apply min/max constraints
        for (const rule of pRules) {
          if (rule.min_payout && calculatedPayout < rule.min_payout) {
            calculatedPayout = rule.min_payout;
            minApplied = true;
          }
          if (rule.max_payout && calculatedPayout > rule.max_payout) {
            calculatedPayout = rule.max_payout;
            maxApplied = true;
          }
        }

        newCalculations.push({
          deal_room_id: dealRoomId,
          participant_id: participantId,
          compute_credits_in: 0,
          action_credits_in: 0,
          outcome_credits_in: 0,
          attribution_percentage: totalPercentage,
          calculated_payout: calculatedPayout,
          min_payout_applied: minApplied,
          max_payout_applied: maxApplied,
          status: "pending",
        });
      }

      // Insert new calculations
      const { error } = await (supabase as any)
        .from("blender_payout_calculations")
        .insert(newCalculations);

      if (error) throw error;

      toast.success("Payout calculations complete");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Calculation failed");
    } finally {
      setCalculating(false);
    }
  };

  const totalPayout = useMemo(() => 
    calculations.reduce((sum, c) => sum + (c.calculated_payout || 0), 0),
    [calculations]
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Payout Calculator
          </h2>
          <p className="text-sm text-muted-foreground">
            Convert credits to payouts using attribution rules
          </p>
        </div>
        <BlenderKnowledgeHelper conceptKey="payout_calculation" />
      </div>

      {/* Pool Value Input */}
      {isAdmin && (
        <Card className="p-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs">
              <Label>Total Pool Value ($)</Label>
              <Input
                type="number"
                value={totalPoolValue}
                onChange={(e) => setTotalPoolValue(e.target.value)}
                className="text-lg"
              />
            </div>
            <Button 
              onClick={runCalculation} 
              disabled={calculating}
              className="gap-2"
            >
              {calculating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Calculate Payouts
            </Button>
          </div>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-2xl font-bold">{participants.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attribution Rules</p>
              <p className="text-2xl font-bold">{rules.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <DollarSign className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Calculated</p>
              <p className="text-2xl font-bold">${totalPayout.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Calculations List */}
      {calculations.length === 0 ? (
        <Card className="p-8 text-center">
          <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Calculations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Run a calculation to see payout distributions
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
            Payout Breakdown
          </h3>
          {calculations.slice(0, 10).map((calc) => {
            const percentage = calc.attribution_percentage;
            return (
              <Card key={calc.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {calc.participant_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{calc.participant_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{percentage.toFixed(1)}% attribution</span>
                        <Badge variant={calc.status === "paid" ? "default" : "secondary"}>
                          {calc.status === "paid" ? (
                            <><CheckCircle className="w-3 h-3 mr-1" />Paid</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" />Pending</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">
                      ${calc.calculated_payout.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
