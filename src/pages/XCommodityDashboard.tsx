import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Boxes, 
  TrendingUp, 
  Shield, 
  Users, 
  FileCheck, 
  Wallet,
  ArrowRight,
  Activity,
  Globe,
  Zap,
  BarChart3,
  ShoppingCart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Stats {
  activeListings: number;
  verifiedDeals: number;
  totalVolume: number;
  activeBrokers: number;
}

export default function XCommodityDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<Stats>({
    activeListings: 0,
    verifiedDeals: 0,
    totalVolume: 0,
    activeBrokers: 0
  });
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkProfile();
      fetchStats();
    }
  }, [user]);

  const checkProfile = async () => {
    const { data } = await supabase
      .from('commodity_user_profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single();
    
    setHasProfile(!!data);
    setLoading(false);
  };

  const fetchStats = async () => {
    // Fetch stats from the database
    const [listingsRes, dealsRes, profilesRes] = await Promise.all([
      supabase.from('commodity_listings').select('id', { count: 'exact' }).in('status', ['active', 'verified']),
      supabase.from('commodity_deals').select('id, total_value', { count: 'exact' }).eq('status', 'completed'),
      supabase.from('commodity_user_profiles').select('id', { count: 'exact' }).eq('user_type', 'broker')
    ]);

    const totalVolume = dealsRes.data?.reduce((sum, deal) => sum + (Number(deal.total_value) || 0), 0) || 0;

    setStats({
      activeListings: listingsRes.count || 0,
      verifiedDeals: dealsRes.count || 0,
      totalVolume,
      activeBrokers: profilesRes.count || 0
    });
  };

  const features = [
    {
      title: "Verified Marketplace",
      description: "Browse physically verified commodity listings with Okari GX integration",
      icon: ShoppingCart,
      route: "/xcommodity/marketplace",
      color: "text-emerald-500"
    },
    {
      title: "Deal Rooms",
      description: "Secure negotiation with smart escrow and document verification",
      icon: FileCheck,
      route: "/xcommodity/deals",
      color: "text-blue-500"
    },
    {
      title: "Broker Network",
      description: "Smart mandate tracking with automatic commission protection",
      icon: Users,
      route: "/xcommodity/brokers",
      color: "text-purple-500"
    },
    {
      title: "Okari Telemetry",
      description: "Real-time tank levels, flow data, and physical verification",
      icon: Activity,
      route: "/xcommodity/okari",
      color: "text-orange-500"
    }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
    return `$${amount.toFixed(0)}`;
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg border bg-card p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Boxes className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">xCOMMODITYx</h1>
            <p className="text-muted-foreground">
              The Operating System for Verified Physical Trade • Powered by Okari GX
            </p>
          </div>
        </div>
        
        <div className="relative mt-6 flex flex-wrap gap-3">
          {!hasProfile && !loading && (
            <Button onClick={() => navigate('/xcommodity/onboard')}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/xcommodity/marketplace')}>
            Browse Marketplace
          </Button>
          <Button variant="outline" onClick={() => navigate('/xcommodity/deals/new')}>
            Create Listing
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{stats.activeListings}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <ShoppingCart className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-emerald-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              Verified products available
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Deals</p>
                <p className="text-2xl font-bold">{stats.verifiedDeals}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <FileCheck className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <Shield className="h-4 w-4 mr-1" />
              Escrow protected
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Volume Traded</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <Globe className="h-4 w-4 mr-1" />
              Global transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Brokers</p>
                <p className="text-2xl font-bold">{stats.activeBrokers}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Users className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <Wallet className="h-4 w-4 mr-1" />
              Commission protected
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          <TabsTrigger value="verification">Verification Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <Card 
                key={feature.title}
                className="cursor-pointer transition-all hover:border-primary/50"
                onClick={() => navigate(feature.route)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted`}>
                      <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Value Proposition */}
          <Card>
            <CardHeader>
              <CardTitle>No "Phantom" Products. No Trust Issues.</CardTitle>
              <CardDescription>
                xCOMMODITYx solves the fundamental problems in commodity trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Physical Verification</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Products linked to Okari GX sensors. See real-time tank levels 
                    and verified custody states before you commit.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-blue-500">
                    <Wallet className="h-5 w-5" />
                    <span className="font-medium">Smart Escrow</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatic "Verify-then-Pay" sequence. Funds release only when 
                    physical verification conditions are met.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-500">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">Broker Protection</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Commissions hard-coded into deal contracts. Automatic splits 
                    eliminate circumvention fears.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="how-it-works" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>The Deal Flow</CardTitle>
              <CardDescription>How xCOMMODITYx eliminates the "Chicken & Egg" standoff</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: "Listing with Verification",
                    description: "Seller creates listing linked to Okari GX device or uploads SGS documentation. System validates physical custody."
                  },
                  {
                    step: 2,
                    title: "Buyer Discovery",
                    description: "Buyers browse verified listings. Green checkmarks indicate Okari Live verification. Brokers generate Smart Mandate links."
                  },
                  {
                    step: 3,
                    title: "Escrow Deposit",
                    description: "Buyer deposits funds into platform escrow. Smart contract locks funds - seller cannot access until conditions met."
                  },
                  {
                    step: 4,
                    title: "Proof of Product",
                    description: "Seller authorizes verification. System queries Okari node or validates SGS hash. Real-time tank data confirms custody."
                  },
                  {
                    step: 5,
                    title: "Execution & Settlement",
                    description: "Buyer approves. Escrow releases to logistics. Injection monitored via Okari flow meters. Commissions auto-distributed."
                  }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Silver Tier</CardTitle>
                  <Badge variant="secondary">Basic</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    Verified corporate documents (KYC)
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    Standard escrow access
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    Document upload verification
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-500/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gold Tier</CardTitle>
                  <Badge className="bg-amber-500">Trusted</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    History of successful deals
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Priority escrow processing
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Enhanced visibility in marketplace
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Platinum Tier</CardTitle>
                  <Badge className="bg-primary">Okari Verified</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Physical assets connected to Okari GX
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Real-time custody verification
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Maximum trust badge + priority
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
