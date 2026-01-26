import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ShieldCheck, Star, Handshake, Fuel, Clock, CheckCircle, XCircle, Award, DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";
import { OkariTelemetryWidget } from "@/components/xcommodity/OkariTelemetryWidget";

const tierColors: Record<string, string> = { silver: "bg-slate-500", gold: "bg-amber-500", platinum: "bg-gradient-to-r from-purple-500 to-blue-500" };

export default function XCommodityProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id: effectiveUserId } = useEffectiveUser();
  const [profile, setProfile] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveUserId) fetchProfileData();
  }, [effectiveUserId]);

  const fetchProfileData = async () => {
    if (!effectiveUserId) return;
    try {
      const { data: profileData, error } = await supabase.from("commodity_user_profiles").select("*").eq("user_id", effectiveUserId).single();
      if (error) { navigate("/xcommodity/onboard"); return; }
      setProfile(profileData);

      const { data: dealsData } = await supabase.from("commodity_deals").select("id, deal_number, status, total_value, created_at, product_type").or(`buyer_profile_id.eq.${profileData.id},seller_profile_id.eq.${profileData.id}`).order("created_at", { ascending: false }).limit(10);
      setDeals(dealsData || []);

      const { data: devicesData } = await supabase.from("commodity_okari_devices").select("*").eq("owner_user_id", effectiveUserId);
      setDevices(devicesData || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    return `$${amount.toFixed(0)}`;
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!profile) return null;

  const tier = profile.trust_tier || "silver";
  const tierProgress = tier === "platinum" ? 100 : tier === "gold" ? 66 : 33;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/xcommodity")}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile.company_name || "My Profile"}</h1>
          </div>
          <Badge className={`${tierColors[tier]} text-white px-4 py-2`}><Award className="h-4 w-4 mr-2" />{tier.toUpperCase()} TIER</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Handshake className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{profile.completed_deals || 0}</p><p className="text-sm text-muted-foreground">Total Deals</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><DollarSign className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{formatCurrency(profile.total_volume_traded || 0)}</p><p className="text-sm text-muted-foreground">Volume Traded</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Star className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{profile.kyc_verified ? "Verified" : "Pending"}</p><p className="text-sm text-muted-foreground">KYC Status</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Fuel className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{devices.length}</p><p className="text-sm text-muted-foreground">Okari Devices</p></div></div></CardContent></Card>
        </div>

        <Card className="mb-8">
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Trust Tier Progress</CardTitle></CardHeader>
          <CardContent>
            <Progress value={tierProgress} className="h-3" />
            <div className="flex justify-between text-sm mt-4">
              <span className={tierProgress >= 33 ? "" : "text-muted-foreground"}>Silver</span>
              <span className={tierProgress >= 66 ? "" : "text-muted-foreground"}>Gold</span>
              <span className={tierProgress >= 100 ? "" : "text-muted-foreground"}>Platinum</span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="deals">
          <TabsList className="mb-6"><TabsTrigger value="deals">Deal History</TabsTrigger><TabsTrigger value="devices">Okari Devices</TabsTrigger></TabsList>
          <TabsContent value="deals">
            <Card>
              <CardContent className="pt-6">
                {deals.length > 0 ? deals.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-4 border rounded-lg mb-2 cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/xcommodity/deals/${d.id}`)}>
                    <div className="flex items-center gap-4">
                      {d.status === "completed" ? <CheckCircle className="h-4 w-4 text-green-500" /> : d.status === "cancelled" ? <XCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-yellow-500" />}
                      <div><p className="font-medium">{d.deal_number}</p><p className="text-sm text-muted-foreground">{d.product_type}</p></div>
                    </div>
                    <p className="font-medium">{formatCurrency(d.total_value || 0)}</p>
                  </div>
                )) : <p className="text-muted-foreground text-center py-8">No deals yet</p>}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="devices">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {devices.length > 0 ? devices.map((d) => (
                <OkariTelemetryWidget key={d.id} deviceId={d.device_id} />
              )) : <Card className="col-span-2"><CardContent className="py-12 text-center"><Fuel className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No Okari devices connected</p></CardContent></Card>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
