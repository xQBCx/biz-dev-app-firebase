import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Briefcase,
  Target,
  Zap,
  Star,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MintingStats {
  baseMultiplier: number;
  activityScore: number;
  engagementScore: number;
  dealParticipation: number;
  platformTenure: number;
  totalMintingPower: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

interface DynamicMintingStatsProps {
  userId: string;
}

const TIER_CONFIG = {
  bronze: { color: 'bg-amber-700', label: 'Bronze', minPower: 0 },
  silver: { color: 'bg-slate-400', label: 'Silver', minPower: 50 },
  gold: { color: 'bg-yellow-500', label: 'Gold', minPower: 100 },
  platinum: { color: 'bg-slate-300', label: 'Platinum', minPower: 200 },
  diamond: { color: 'bg-cyan-400', label: 'Diamond', minPower: 500 }
};

export function DynamicMintingStats({ userId }: DynamicMintingStatsProps) {
  const [stats, setStats] = useState<MintingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateMintingStats();
  }, [userId]);

  const calculateMintingStats = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Fetch user's activity data
      const [
        { data: profile },
        { data: dealParticipants },
        { data: xdkAccount },
        { data: transactions }
      ] = await Promise.all([
        supabase.from('profiles').select('created_at').eq('id', userId).single(),
        supabase.from('deal_room_participants').select('id, invitation_accepted_at').eq('user_id', userId),
        supabase.from('xodiak_accounts').select('balance, nonce').eq('user_id', userId).eq('account_type', 'user').maybeSingle(),
        supabase.from('xodiak_transactions').select('id').or(`from_address.eq.xdk1user${userId.replace(/-/g, '').slice(0, 32)}`).limit(100)
      ]);

      // Calculate Platform Tenure Score (0-25 points)
      const accountAgeInDays = profile?.created_at 
        ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const tenureScore = Math.min(25, Math.floor(accountAgeInDays / 30) * 5); // 5 points per month, max 25

      // Calculate Deal Participation Score (0-30 points)
      const activeDeals = dealParticipants?.filter(p => p.invitation_accepted_at !== null).length || 0;
      const dealScore = Math.min(30, activeDeals * 10); // 10 points per active deal, max 30

      // Calculate Activity Score (0-25 points)
      const txCount = transactions?.length || 0;
      const nonce = xdkAccount?.nonce || 0;
      const activityScore = Math.min(25, Math.floor((txCount + nonce) / 5) * 5); // Based on transaction activity

      // Calculate Engagement Score (0-20 points)
      const balance = parseFloat(xdkAccount?.balance?.toString() || '0');
      const engagementScore = Math.min(20, Math.floor(balance / 500) * 5); // 5 points per 500 XDK held

      // Calculate total minting power
      const totalMintingPower = tenureScore + dealScore + activityScore + engagementScore;

      // Determine tier
      let tier: MintingStats['tier'] = 'bronze';
      if (totalMintingPower >= 500) tier = 'diamond';
      else if (totalMintingPower >= 200) tier = 'platinum';
      else if (totalMintingPower >= 100) tier = 'gold';
      else if (totalMintingPower >= 50) tier = 'silver';

      // Base multiplier based on tier
      const baseMultipliers = { bronze: 1.0, silver: 1.25, gold: 1.5, platinum: 2.0, diamond: 3.0 };

      setStats({
        baseMultiplier: baseMultipliers[tier],
        activityScore,
        engagementScore,
        dealParticipation: dealScore,
        platformTenure: tenureScore,
        totalMintingPower,
        tier
      });
    } catch (error) {
      console.error('Error calculating minting stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Calculating your minting power...
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Unable to calculate minting stats
        </CardContent>
      </Card>
    );
  }

  const tierConfig = TIER_CONFIG[stats.tier];
  const nextTier = stats.tier === 'diamond' ? null : 
    stats.tier === 'platinum' ? 'diamond' :
    stats.tier === 'gold' ? 'platinum' :
    stats.tier === 'silver' ? 'gold' : 'silver';
  
  const nextTierThreshold = nextTier ? TIER_CONFIG[nextTier].minPower : stats.totalMintingPower;
  const currentTierThreshold = TIER_CONFIG[stats.tier].minPower;
  const progressToNextTier = nextTier 
    ? ((stats.totalMintingPower - currentTierThreshold) / (nextTierThreshold - currentTierThreshold)) * 100
    : 100;

  return (
    <div className="space-y-4">
      {/* Main Minting Power Card */}
      <Card className="border-primary/20 overflow-hidden">
        <div className={`h-2 ${tierConfig.color}`} />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Dynamic Minting Power
              </CardTitle>
              <CardDescription>
                Your minting multiplier affects XDK rewards from settlements and platform activities
              </CardDescription>
            </div>
            <Badge className={`${tierConfig.color} text-white text-lg px-4 py-1`}>
              <Award className="h-4 w-4 mr-1" />
              {tierConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Power Score */}
          <div className="text-center py-4">
            <div className="text-5xl font-bold text-primary">
              {stats.totalMintingPower}
            </div>
            <div className="text-muted-foreground">Total Minting Power</div>
            <div className="mt-2 text-lg font-semibold text-emerald-500">
              {stats.baseMultiplier}x Multiplier
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {TIER_CONFIG[nextTier].label}</span>
                <span>{stats.totalMintingPower} / {nextTierThreshold}</span>
              </div>
              <Progress value={progressToNextTier} className="h-2" />
            </div>
          )}

          {/* Score Breakdown */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Platform Tenure</span>
              </div>
              <div className="flex items-center justify-between">
                <Progress value={(stats.platformTenure / 25) * 100} className="flex-1 mr-3 h-2" />
                <span className="font-semibold">{stats.platformTenure}/25</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Deal Participation</span>
              </div>
              <div className="flex items-center justify-between">
                <Progress value={(stats.dealParticipation / 30) * 100} className="flex-1 mr-3 h-2" />
                <span className="font-semibold">{stats.dealParticipation}/30</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Activity Score</span>
              </div>
              <div className="flex items-center justify-between">
                <Progress value={(stats.activityScore / 25) * 100} className="flex-1 mr-3 h-2" />
                <span className="font-semibold">{stats.activityScore}/25</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Engagement Score</span>
              </div>
              <div className="flex items-center justify-between">
                <Progress value={(stats.engagementScore / 20) * 100} className="flex-1 mr-3 h-2" />
                <span className="font-semibold">{stats.engagementScore}/20</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">How to Increase Your Minting Power</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Participate in more Deal Rooms (+10 per active deal)</li>
                  <li>• Hold more XDK in your wallet (+5 per 500 XDK)</li>
                  <li>• Stay active with transactions and platform usage</li>
                  <li>• Your tenure grows automatically over time</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
