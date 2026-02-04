import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Users, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import MerchantList from "@/components/admin/MerchantList";
import CreateMerchantDialog from "@/components/admin/CreateMerchantDialog";

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateMerchant, setShowCreateMerchant] = useState(false);
  const [stats, setStats] = useState({ totalMerchants: 0, activeLinks: 0, totalVolume: 0 });
  const navigate = useNavigate();
  const { toast } = useToast();

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

      if (profile?.role !== "admin") {
        navigate("/merchant");
        return;
      }

      setIsAdmin(true);
      await fetchStats();
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

  const fetchStats = async () => {
    const { count: merchantCount } = await supabase
      .from("merchants")
      .select("*", { count: "exact", head: true });

    const { count: linkCount } = await supabase
      .from("payment_links")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount");

    const totalVolume = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    setStats({
      totalMerchants: merchantCount || 0,
      activeLinks: linkCount || 0,
      totalVolume,
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="BizDev Logo" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
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
              <CardTitle className="text-sm font-medium">Total Merchants</CardTitle>
              <Users className="h-4 w-4 text-blue-light" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalMerchants}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Payment Links</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-light" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeLinks}</div>
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
            <div className="flex items-center justify-between gap-6">
              <div>
                <CardTitle>Merchant Management</CardTitle>
                <CardDescription>Create and manage merchant accounts</CardDescription>
              </div>
              <Button onClick={() => setShowCreateMerchant(true)} className="bg-primary hover:bg-primary/90 flex-shrink-0">
                <Plus className="mr-2 h-4 w-4" />
                Add Merchant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Merchants</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6">
                <MerchantList onUpdate={fetchStats} />
              </TabsContent>
              <TabsContent value="active" className="mt-6">
                <MerchantList status="active" onUpdate={fetchStats} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <CreateMerchantDialog 
        open={showCreateMerchant} 
        onOpenChange={setShowCreateMerchant}
        onSuccess={fetchStats}
      />
    </div>
  );
};

export default AdminDashboard;