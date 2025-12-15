import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, DollarSign, TrendingUp, CreditCard, FileText, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

const StoreLaunchRevenue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: projects } = useQuery({
    queryKey: ["store-launch-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: revenueEvents } = useQuery({
    queryKey: ["store-launch-revenue-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_revenue_events")
        .select("*, store_launch_projects(name)")
        .order("event_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: agreements } = useQuery({
    queryKey: ["store-launch-revenue-agreements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_revenue_agreements")
        .select("*, store_launch_projects(name)");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: payouts } = useQuery({
    queryKey: ["store-launch-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_launch_payouts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate totals
  const totalGross = revenueEvents?.reduce((sum, e) => sum + Number(e.gross_amount), 0) || 0;
  const totalStoreFees = revenueEvents?.reduce((sum, e) => sum + Number(e.store_fee || 0), 0) || 0;
  const totalNet = revenueEvents?.reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;
  const totalPlatformShare = revenueEvents?.reduce((sum, e) => sum + Number(e.platform_share), 0) || 0;
  const totalPaid = payouts?.filter((p) => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const verificationMethods = [
    { id: "stripe", name: "Stripe", description: "Connect your Stripe account for automatic tracking" },
    { id: "revenuecat", name: "RevenueCat", description: "Connect your RevenueCat account" },
    { id: "app_store_connect", name: "App Store Connect", description: "Upload financial reports from Apple" },
    { id: "google_play", name: "Google Play", description: "Upload financial reports from Google" },
    { id: "manual", name: "Manual Upload", description: "Upload financial statements manually" },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate("/store-launch")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Store Launch
      </Button>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Revenue Share Dashboard</h1>
        <p className="text-muted-foreground">
          Track your app revenue and platform share (5% lifetime)
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              Gross Revenue
            </div>
            <div className="text-2xl font-bold">${totalGross.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CreditCard className="h-4 w-4" />
              Store Fees
            </div>
            <div className="text-2xl font-bold">${totalStoreFees.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              Net Revenue
            </div>
            <div className="text-2xl font-bold">${totalNet.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              Platform Share (5%)
            </div>
            <div className="text-2xl font-bold">${totalPlatformShare.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Revenue by App</CardTitle>
              <CardDescription>Breakdown of revenue across your apps</CardDescription>
            </CardHeader>
            <CardContent>
              {!projects?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No apps yet. Create your first app to start tracking revenue.
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => {
                    const projectRevenue = revenueEvents?.filter((e) => e.project_id === project.id) || [];
                    const projectGross = projectRevenue.reduce((sum, e) => sum + Number(e.gross_amount), 0);
                    const projectShare = projectRevenue.reduce((sum, e) => sum + Number(e.platform_share), 0);
                    const agreement = agreements?.find((a) => a.project_id === project.id);

                    return (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {agreement?.is_verified ? (
                              <Badge className="bg-green-500/20 text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Verification Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${projectGross.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            ${projectShare.toLocaleString()} platform share
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>Free Tier Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium">5% of gross revenue</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">Lifetime of app</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Minimum Payout</span>
                  <span className="font-medium">$100</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Payout Frequency</span>
                  <span className="font-medium">Monthly</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Required Verification</span>
                  <span className="font-medium">At least one revenue source</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Revenue events from your apps</CardDescription>
            </CardHeader>
            <CardContent>
              {!revenueEvents?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>App</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Store Fee</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead className="text-right">Platform (5%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{new Date(event.event_date).toLocaleDateString()}</TableCell>
                        <TableCell>{(event as any).store_launch_projects?.name || "—"}</TableCell>
                        <TableCell className="capitalize">{event.event_type}</TableCell>
                        <TableCell className="text-right">${Number(event.gross_amount).toFixed(2)}</TableCell>
                        <TableCell className="text-right">${Number(event.store_fee || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-right">${Number(event.net_amount).toFixed(2)}</TableCell>
                        <TableCell className="text-right">${Number(event.platform_share).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your platform share payouts</CardDescription>
            </CardHeader>
            <CardContent>
              {!payouts?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payouts yet. Payouts occur monthly when balance exceeds $100.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {new Date(payout.period_start).toLocaleDateString()} – {new Date(payout.period_end).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${Number(payout.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">{payout.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6 mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Revenue Verification</CardTitle>
              <CardDescription>
                Connect at least one revenue source to verify your app earnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{method.name}</h4>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  <Button variant="outline">
                    Connect
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreLaunchRevenue;
