import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Users, Link as LinkIcon, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Commission {
  id: string;
  commission_tier: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  app_registry: {
    app_name: string;
  };
  referred_user: {
    email: string;
  };
}

export default function Earnings() {
  const { session } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    totalReferrals: 0,
  });
  const [referralLink, setReferralLink] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchEarnings();
      generateReferralLink();
    }
  }, [session]);

  const fetchEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from("affiliate_commissions")
        .select(`
          *,
          app_registry (app_name)
        `)
        .eq("affiliate_user_id", session?.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const commissionsData = data || [];
      setCommissions(commissionsData as any);

      // Calculate stats
      const totalEarnings = commissionsData.reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0);
      const pendingEarnings = commissionsData
        .filter(c => c.status === "pending" || c.status === "approved")
        .reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0);
      const paidEarnings = commissionsData
        .filter(c => c.status === "paid")
        .reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0);
      const totalReferrals = new Set(commissionsData.map(c => c.referred_user_id)).size;

      setStats({
        totalEarnings,
        pendingEarnings,
        paidEarnings,
        totalReferrals,
      });
    } catch (error: any) {
      toast.error("Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = () => {
    const link = `${window.location.origin}/ecosystem/app-store?ref=${session?.user?.id}`;
    setReferralLink(link);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "approved":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "destructive";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          Earnings Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your affiliate commissions and referral earnings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">All-time commissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">${stats.pendingEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${stats.paidEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Your Referral Link
          </CardTitle>
          <CardDescription>
            Share this link to earn commissions on app purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={copyReferralLink}>Copy Link</Button>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>View all your affiliate earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading commissions...</p>
            </div>
          ) : commissions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No commissions yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start referring customers using your referral link above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {commissions.map((commission) => (
                <div
                  key={commission.id}
                  className="flex items-center justify-between p-4 border rounded-lg transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{commission.app_registry.app_name}</span>
                      <Badge variant="outline">Tier {commission.commission_tier}</Badge>
                      <Badge variant={getStatusColor(commission.status)}>
                        {commission.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(commission.created_at).toLocaleDateString()} • {commission.commission_rate}% commission
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${commission.commission_amount.toFixed(2)}
                    </div>
                    {commission.paid_at && (
                      <p className="text-xs text-muted-foreground">
                        Paid {new Date(commission.paid_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
