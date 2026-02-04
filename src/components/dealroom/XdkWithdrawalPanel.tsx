import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Wallet, 
  ArrowDownToLine, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  DollarSign,
  Banknote,
  History
} from "lucide-react";
import { format } from "date-fns";

interface XdkWithdrawalPanelProps {
  userId: string;
  dealRoomId?: string;
}

interface WithdrawalRequest {
  id: string;
  xdk_amount: number;
  usd_amount: number;
  exchange_rate: number;
  withdrawal_method: string;
  status: string;
  bank_account_last4: string | null;
  created_at: string;
  processed_at: string | null;
}

export function XdkWithdrawalPanel({ userId, dealRoomId }: XdkWithdrawalPanelProps) {
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Fetch user's XDK account
  const { data: xdkAccount, isLoading: loadingAccount } = useQuery({
    queryKey: ["user-xdk-account", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xodiak_accounts")
        .select("*")
        .eq("user_id", userId)
        .eq("account_type", "user")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    }
  });

  // Fetch current exchange rate (default 1:1)
  const { data: exchangeRateData } = useQuery({
    queryKey: ["xdk-exchange-rate"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xdk_exchange_rates")
        .select("xdk_rate")
        .eq("base_currency", "USD")
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching exchange rate:", error);
        return { xdk_rate: 1.0 };
      }
      return data || { xdk_rate: 1.0 };
    }
  });

  // Fetch withdrawal history
  const { data: withdrawals, isLoading: loadingWithdrawals } = useQuery({
    queryKey: ["xdk-withdrawals", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xdk_withdrawal_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as WithdrawalRequest[];
    }
  });

  // Submit withdrawal request
  const submitWithdrawal = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(withdrawAmount);

      const { data, error } = await supabase.functions.invoke("xdk-withdraw", {
        body: { 
          amount,
          withdrawal_method: "manual", // MVP: manual processing
          deal_room_id: dealRoomId
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Withdrawal request submitted!", {
        description: `$${data.usd_amount?.toFixed(2)} will be processed within 2-3 business days.`
      });
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: ["user-xdk-account", userId] });
      queryClient.invalidateQueries({ queryKey: ["xdk-withdrawals", userId] });
    },
    onError: (error) => {
      toast.error("Withdrawal failed", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    }
  });

  const balance = xdkAccount?.balance || 0;
  // XDK rate is how many XDK per 1 USD, so USD = XDK / rate (or XDK * (1/rate))
  // If rate is 1.0, then 1 XDK = 1 USD
  const xdkRate = exchangeRateData?.xdk_rate || 1.0;
  const rate = 1 / Number(xdkRate); // Convert to USD per XDK
  const withdrawAmountNum = parseFloat(withdrawAmount) || 0;
  const usdAmount = withdrawAmountNum * rate;
  const isValidAmount = withdrawAmountNum > 0 && withdrawAmountNum <= Number(balance);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/20 text-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500/20 text-blue-600"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge className="bg-destructive/20 text-destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loadingAccount) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!xdkAccount) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-amber-600" />
            No XDK Wallet Found
          </CardTitle>
          <CardDescription>
            You need to set up your XDK wallet before you can withdraw funds. 
            Go to the Participants section to create your platform wallet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownToLine className="h-5 w-5 text-primary" />
          Withdraw Funds
        </CardTitle>
        <CardDescription>
          Convert your XDK balance to USD and transfer to your bank account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US").format(Number(balance))} XDK
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ≈ {formatCurrency(Number(balance) * rate)} USD @ {rate}x rate
              </p>
            </div>
            <Wallet className="h-10 w-10 text-primary/40" />
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount to Withdraw (XDK)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                className="pl-9"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={balance}
              />
            </div>
            {withdrawAmountNum > 0 && (
              <p className="text-sm text-muted-foreground">
                You will receive: <span className="font-semibold text-foreground">{formatCurrency(usdAmount)}</span>
              </p>
            )}
            {withdrawAmountNum > balance && (
              <p className="text-sm text-destructive">
                Amount exceeds available balance
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWithdrawAmount((balance * 0.5).toString())}
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWithdrawAmount(balance.toString())}
            >
              Max
            </Button>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Withdrawal Method:</span>
              <span className="font-medium">Manual Processing (Admin Approved)</span>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              Funds typically arrive within 2-3 business days after admin approval
            </p>
          </div>

          <Button
            className="w-full gap-2"
            onClick={() => submitWithdrawal.mutate()}
            disabled={!isValidAmount || submitWithdrawal.isPending}
          >
            {submitWithdrawal.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-4 w-4" />
                Request Withdrawal
              </>
            )}
          </Button>
        </div>

        {/* Withdrawal History */}
        {withdrawals && withdrawals.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <History className="h-4 w-4" />
                Withdrawal History
              </h4>
              <div className="space-y-2">
                {withdrawals.map((withdrawal) => (
                  <div 
                    key={withdrawal.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {new Intl.NumberFormat("en-US").format(Number(withdrawal.xdk_amount))} XDK
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium text-primary">
                          {formatCurrency(Number(withdrawal.usd_amount))}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(withdrawal.created_at), "MMM d, yyyy 'at' h:mm a")}
                        {withdrawal.bank_account_last4 && ` • ****${withdrawal.bank_account_last4}`}
                      </p>
                    </div>
                    {getStatusBadge(withdrawal.status || "pending")}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
