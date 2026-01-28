import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight,
  Copy,
  CheckCircle2,
  Loader2,
  Plus,
  TrendingUp,
  Coins,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { XdkWithdrawalPanel } from "./XdkWithdrawalPanel";
import { PendingSettlementsTab } from "./PendingSettlementsTab";

interface XdkAccount {
  address: string;
  user_id: string | null;
  balance: number;
  staked_amount: number;
  nonce: number;
  account_type: string;
  created_at: string;
}

interface Transaction {
  id: string;
  tx_hash: string;
  from_address: string;
  to_address: string | null;
  amount: number;
  tx_type: string;
  status: string;
  created_at: string;
}

interface ExchangeRate {
  base_currency: string;
  xdk_rate: number;
}

export function ProfileWalletPanel() {
  const { user } = useAuth();
  const [account, setAccount] = useState<XdkAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user's XDK account
      const { data: accountData, error: accountError } = await supabase
        .from('xodiak_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_type', 'user')
        .maybeSingle();

      if (accountError) throw accountError;
      setAccount(accountData as XdkAccount | null);

      // Fetch exchange rate
      const { data: rateData } = await supabase
        .from('xdk_exchange_rates')
        .select('base_currency, xdk_rate')
        .eq('base_currency', 'USD')
        .order('effective_from', { ascending: false })
        .limit(1)
        .maybeSingle();

      setExchangeRate(rateData as ExchangeRate | null);

      // Fetch recent transactions if account exists
      if (accountData?.address) {
        const { data: txData } = await supabase
          .from('xodiak_transactions')
          .select('*')
          .or(`from_address.eq.${accountData.address},to_address.eq.${accountData.address}`)
          .order('created_at', { ascending: false })
          .limit(10);

        setTransactions(txData as Transaction[] || []);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  const createWallet = async () => {
    if (!user) {
      toast.error('Please log in to create a wallet');
      return;
    }

    try {
      setCreating(true);
      
      const { data, error } = await supabase.functions.invoke('xodiak-chain-core', {
        body: { 
          action: 'create-account',
          userId: user.id 
        }
      });

      if (error) throw error;

      toast.success('XDK Wallet created successfully!');
      await fetchWalletData();
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast.error('Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied!');
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 12)}...${address.slice(-8)}`;
  };

  const usdValue = account && exchangeRate 
    ? (parseFloat(account.balance.toString()) * parseFloat(exchangeRate.xdk_rate.toString())).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Create Your XDK Wallet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Set up your XODIAK blockchain wallet to receive payouts from Deal Rooms, 
            mint assets, and participate in the platform economy.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <Button onClick={createWallet} disabled={creating} size="lg">
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Wallet...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create XDK Wallet
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Free • Instant • Blockchain-verified
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Wallet Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">XDK Wallet</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs text-muted-foreground font-mono">
                    {truncateAddress(account.address)}
                  </code>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={copyAddress}>
                    {copied ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-5 w-5" asChild>
                    <a href={`/xodiak-chain?tab=explorer&address=${account.address}`} target="_blank">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchWalletData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Coins className="h-3 w-3" />
                Available Balance
              </div>
              <div className="text-3xl font-bold">
                {parseFloat(account.balance.toString()).toLocaleString()}
                <span className="text-lg text-primary ml-1">XDK</span>
              </div>
              <div className="text-sm text-muted-foreground">
                ≈ ${usdValue} USD
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Staked Amount
              </div>
              <div className="text-2xl font-semibold">
                {parseFloat(account.staked_amount.toString()).toLocaleString()}
                <span className="text-sm text-muted-foreground ml-1">XDK</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Account Created</div>
              <div className="text-sm">
                {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
              </div>
              <Badge variant="outline" className="text-xs">
                Nonce: {account.nonce}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Wallet Actions */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Your latest XDK transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Receive XDK from Deal Room settlements</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => {
                    const isOutgoing = tx.from_address === account.address;
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isOutgoing ? 'bg-destructive/10' : 'bg-emerald-500/10'
                          }`}>
                            {isOutgoing ? (
                              <ArrowUpRight className="h-4 w-4 text-destructive" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {isOutgoing ? 'Sent' : 'Received'} • {tx.tx_type}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${isOutgoing ? 'text-destructive' : 'text-emerald-500'}`}>
                            {isOutgoing ? '-' : '+'}{parseFloat(tx.amount.toString()).toLocaleString()} XDK
                          </div>
                          <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <PendingSettlementsTab userId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="withdraw" className="mt-4">
          <XdkWithdrawalPanel 
            account={account} 
            exchangeRate={exchangeRate} 
            onWithdrawComplete={fetchWalletData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
