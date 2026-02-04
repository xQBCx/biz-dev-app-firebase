import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Link as LinkIcon, QrCode, DollarSign, TrendingUp } from "lucide-react";
import logo from "@/assets/logo.png";
import PaymentLinksList from "@/components/merchant/PaymentLinksList";
import CreatePaymentLinkDialog from "@/components/merchant/CreatePaymentLinkDialog";
import QRCodeGenerator from "@/components/merchant/QRCodeGenerator";

const MerchantDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [stats, setStats] = useState({ activeLinks: 0, totalVolume: 0, transactionCount: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "admin") {
        navigate("/admin");
        return;
      }

      const { data: merchantData } = await supabase
        .from("merchants")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setMerchant(merchantData);
      if (merchantData) {
        await fetchStats(merchantData.id);
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchStats = async (merchantId: string) => {
    const { count: linkCount } = await supabase
      .from("payment_links")
      .select("*", { count: "exact", head: true })
      .eq("merchant_id", merchantId)
      .eq("is_active", true);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount")
      .eq("merchant_id", merchantId);

    const totalVolume = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    setStats({
      activeLinks: linkCount || 0,
      totalVolume,
      transactionCount: transactions?.length || 0,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Merchant Account</CardTitle>
            <CardDescription>
              Your account hasn't been set up as a merchant yet. Please contact your administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="BizDev Logo" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">{merchant.business_name}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Links</CardTitle>
              <LinkIcon className="h-4 w-4 text-blue-light" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeLinks}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-light" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.transactionCount}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-light" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${stats.totalVolume.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Merchant Portal</CardTitle>
            <CardDescription>Manage your payment links and QR codes</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="links" className="w-full">
              <TabsList>
                <TabsTrigger value="links">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Payment Links
                </TabsTrigger>
                <TabsTrigger value="qr">
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Codes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="links" className="mt-6">
                <div className="space-y-4">
                  <Button onClick={() => setShowCreateLink(true)} className="bg-primary hover:bg-primary/90">
                    Create Payment Link
                  </Button>
                  <PaymentLinksList merchantId={merchant.id} onUpdate={() => fetchStats(merchant.id)} />
                </div>
              </TabsContent>
              <TabsContent value="qr" className="mt-6">
                <QRCodeGenerator merchantId={merchant.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <CreatePaymentLinkDialog 
        open={showCreateLink} 
        onOpenChange={setShowCreateLink}
        merchantId={merchant.id}
        onSuccess={() => fetchStats(merchant.id)}
      />
    </div>
  );
};

export default MerchantDashboard;