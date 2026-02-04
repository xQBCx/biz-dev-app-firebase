import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, Clock, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Transaction = {
  id: string;
  booking_id: string;
  amount: number;
  transaction_type: string;
  status: string;
  stripe_fee: number;
  net_amount: number;
  processed_at: string;
};

type Earnings = {
  total_earned: number;
  available_balance: number;
  pending_balance: number;
  total_withdrawn: number;
  last_payout_date: string | null;
  stripe_account_id: string | null;
};

export default function PartnerBilling() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stripeEnabled, setStripeEnabled] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", user.id)
        .single();

      if (!membership) return;

      // Load earnings
      const { data: earningsData } = await supabase
        .from("partner_earnings")
        .select("*")
        .eq("business_id", membership.business_id)
        .maybeSingle();

      if (earningsData) {
        setEarnings(earningsData);
      } else {
        // Initialize earnings record
        await supabase
          .from("partner_earnings")
          .insert({
            business_id: membership.business_id,
            total_earned: 0,
            available_balance: 0,
            pending_balance: 0,
            total_withdrawn: 0,
          });
      }

      // Load transactions
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("partner_business_id", membership.business_id)
        .order("processed_at", { ascending: false })
        .limit(50);

      setTransactions(transactionsData || []);
    } catch (error) {
      console.error("Error loading billing data:", error);
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    toast({
      title: "Stripe Required",
      description: "Please add your Stripe API key to enable payouts. Once configured, payouts will be processed automatically.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">
          Manage your earnings and payouts
        </p>
      </div>

      {/* Stripe Setup Alert */}
      {!stripeEnabled && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Stripe Integration Required</AlertTitle>
          <AlertDescription>
            To accept payments and process payouts, you need to add your Stripe API key. 
            Contact your admin to configure Stripe integration.
          </AlertDescription>
        </Alert>
      )}

      {/* Earnings Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earnings?.total_earned || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(earnings?.available_balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(earnings?.pending_balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Processing (7-day hold)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(earnings?.total_withdrawn || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {earnings?.last_payout_date
                ? `Last: ${new Date(earnings.last_payout_date).toLocaleDateString()}`
                : "No payouts yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Section */}
      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>
            Withdraw your available balance to your bank account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Available for withdrawal</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(earnings?.available_balance || 0)}
              </p>
            </div>
            <Button
              onClick={requestPayout}
              disabled={!earnings?.available_balance || earnings?.available_balance <= 0}
              size="lg"
            >
              Request Payout
            </Button>
          </div>
          {!earnings?.stripe_account_id && (
            <p className="text-sm text-muted-foreground">
              You need to connect your bank account via Stripe Connect before requesting payouts.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View all your payments, refunds, and payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Stripe Fee</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.processed_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.booking_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="capitalize">
                      {transaction.transaction_type}
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell className="text-red-600">
                      -{formatCurrency(transaction.stripe_fee)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.net_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}