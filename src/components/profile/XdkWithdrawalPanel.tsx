import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  ArrowRightLeft, 
  DollarSign, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface XdkAccount {
  address: string;
  balance: number;
}

interface ExchangeRate {
  base_currency: string;
  xdk_rate: number;
}

interface WithdrawalRequest {
  id: string;
  xdk_amount: number;
  usd_amount: number;
  exchange_rate: number;
  status: string;
  created_at: string;
  processed_at: string | null;
  payout_processor: string | null;
}

interface XdkWithdrawalPanelProps {
  account: XdkAccount;
  exchangeRate: ExchangeRate | null;
  onWithdrawComplete?: () => void;
}

export function XdkWithdrawalPanel({ account, exchangeRate, onWithdrawComplete }: XdkWithdrawalPanelProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rate = exchangeRate ? parseFloat(exchangeRate.xdk_rate.toString()) : 1;
  const balance = parseFloat(account.balance.toString());
  const amountNum = parseFloat(amount) || 0;
  const usdAmount = amountNum * rate;

  // Check if user has Stripe Connect set up
  const { data: stripeStatus } = useQuery({
    queryKey: ['stripe-connect-status-withdrawal'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-stripe-connect-status');
      if (error) return { connected: false, payouts_enabled: false };
      return data;
    }
  });

  const hasStripeConnect = stripeStatus?.connected && stripeStatus?.payouts_enabled;

  // Fetch withdrawal history
  const { data: withdrawals, refetch: refetchWithdrawals } = useQuery({
    queryKey: ['xdk-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xdk_withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as WithdrawalRequest[];
    }
  });

  const handleWithdraw = async () => {
    if (amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (amountNum < 10) {
      toast.error('Minimum withdrawal is 10 XDK');
      return;
    }

    try {
      setIsSubmitting(true);

      // Determine withdrawal method based on Stripe Connect status
      const withdrawalMethod = hasStripeConnect ? 'stripe_connect' : 'manual';

      const { data, error } = await supabase.functions.invoke('xdk-withdraw', {
        body: {
          amount: amountNum,
          withdrawal_method: withdrawalMethod
        }
      });

      if (error) throw error;

      if (data.success) {
        const arrivalTime = hasStripeConnect ? '1-2 business days' : data.estimated_arrival;
        toast.success('Withdrawal request submitted!', {
          description: `$${data.usd_amount.toFixed(2)} USD will be processed within ${arrivalTime}`
        });
        setAmount("");
        refetchWithdrawals();
        onWithdrawComplete?.();
      } else {
        throw new Error(data.error || 'Withdrawal failed');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.message || 'Failed to submit withdrawal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-primary"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Withdrawal Form */}
      <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Withdraw XDK to USD
        </CardTitle>
        <CardDescription>
          Convert your XDK tokens to USD at the fixed 1:1 rate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available Balance</span>
            <span className="font-semibold">{balance.toLocaleString()} XDK</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span className="font-semibold">1 XDK = $1.00 USD (fixed)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payout Method</span>
            <span className="font-semibold flex items-center gap-1">
              {hasStripeConnect ? (
                <>
                  <Zap className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600">Fast Payout (Stripe)</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  Manual Processing
                </>
              )}
            </span>
          </div>
        </div>

          <div className="space-y-2">
            <Label>Amount to Withdraw (XDK)</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-20"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 text-xs"
                onClick={() => setAmount(balance.toString())}
              >
                Max
              </Button>
            </div>
            {amountNum > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                You will receive approximately <span className="font-semibold text-foreground">${usdAmount.toFixed(2)} USD</span>
              </div>
            )}
          </div>

        <Alert className={hasStripeConnect ? "border-emerald-500/50 bg-emerald-500/5" : ""}>
          <AlertCircle className={`h-4 w-4 ${hasStripeConnect ? "text-emerald-500" : ""}`} />
          <AlertDescription>
            {hasStripeConnect ? (
              <>
                <strong className="text-emerald-600">Fast Payout enabled!</strong> Withdrawals will be sent to your connected bank account within 1-2 business days.
              </>
            ) : (
              <>
                Withdrawal requests are processed manually within 2-3 business days. 
                Set up <strong>Fast Payouts</strong> above to receive funds automatically.
              </>
            )}
            <br />
            Minimum withdrawal: 10 XDK.
          </AlertDescription>
        </Alert>

        <Button 
          className="w-full" 
          onClick={handleWithdraw}
          disabled={isSubmitting || amountNum <= 0 || amountNum > balance || amountNum < 10}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Request Withdrawal {hasStripeConnect && <Zap className="h-3 w-3 ml-1 text-yellow-400" />}
            </>
          )}
        </Button>
      </CardContent>
    </Card>

      {/* Withdrawal History */}
      {withdrawals && withdrawals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <div className="font-medium">
                      {parseFloat(w.xdk_amount.toString()).toLocaleString()} XDK → ${parseFloat(w.usd_amount.toString()).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(w.created_at), { addSuffix: true })}
                      {' • '}Rate: 1 XDK = ${parseFloat(w.exchange_rate.toString()).toFixed(4)}
                    </div>
                  </div>
                  {getStatusBadge(w.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
