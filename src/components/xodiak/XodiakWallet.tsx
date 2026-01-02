import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Wallet, 
  Send, 
  ArrowDownLeft, 
  ArrowUpRight,
  Copy,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Droplets,
  History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Account {
  address: string;
  user_id: string | null;
  balance: number;
  staked_amount: number;
  nonce: number;
  account_type: string;
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

export function XodiakWallet() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  // Transfer form
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user's accounts
      const { data: accountsData, error } = await supabase
        .from('xodiak_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const typedAccounts = accountsData as Account[] || [];
      setAccounts(typedAccounts);
      
      if (typedAccounts.length > 0 && !selectedAccount) {
        setSelectedAccount(typedAccounts[0]);
        fetchTransactions(typedAccounts[0].address);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (address: string) => {
    const { data } = await supabase
      .from('xodiak_transactions')
      .select('*')
      .or(`from_address.eq.${address},to_address.eq.${address}`)
      .order('created_at', { ascending: false })
      .limit(50);

    setTransactions(data as Transaction[] || []);
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions(selectedAccount.address);
    }
  }, [selectedAccount]);

  const createAccount = async () => {
    if (!user) {
      toast.error('Please log in to create an account');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('xodiak-chain-core', {
        body: { 
          action: 'create-account',
          userId: user.id 
        }
      });

      if (error) throw error;

      toast.success('Account created successfully!');
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const requestFaucet = async () => {
    if (!selectedAccount) {
      toast.error('Please select an account first');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('xodiak-chain-core', {
        body: { 
          action: 'faucet',
          address: selectedAccount.address,
          amount: 1000
        }
      });

      if (error) throw error;

      toast.success('Received 1,000 XDK from faucet!');
      fetchAccounts();
      fetchTransactions(selectedAccount.address);
    } catch (error: any) {
      console.error('Error requesting faucet:', error);
      toast.error(error.message || 'Faucet request failed. Initialize chain first.');
    } finally {
      setLoading(false);
    }
  };

  const sendTransaction = async () => {
    if (!selectedAccount || !toAddress || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid amount');
      return;
    }

    if (amountNum > parseFloat(selectedAccount.balance.toString())) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setSending(true);
      
      const { data, error } = await supabase.functions.invoke('xodiak-chain-core', {
        body: { 
          action: 'submit-transaction',
          from: selectedAccount.address,
          to: toAddress,
          amount: amountNum,
          txType: 'transfer'
        }
      });

      if (error) throw error;

      toast.success('Transaction submitted!');
      setToAddress("");
      setAmount("");
      fetchAccounts();
      fetchTransactions(selectedAccount.address);
    } catch (error: any) {
      console.error('Error sending transaction:', error);
      toast.error(error.message || 'Failed to send transaction');
    } finally {
      setSending(false);
    }
  };

  const copyAddress = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied!');
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 12)}...${address.slice(-8)}`;
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Header */}
      {selectedAccount ? (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>XDK Wallet</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm text-muted-foreground">
                      {truncateAddress(selectedAccount.address)}
                    </code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                      {copied ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchAccounts}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={requestFaucet} disabled={loading}>
                  <Droplets className="h-4 w-4 mr-2" />
                  Faucet
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">Available Balance</div>
                <div className="text-3xl font-bold">
                  {parseFloat(selectedAccount.balance.toString()).toLocaleString()} <span className="text-lg text-primary">XDK</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Staked Amount</div>
                <div className="text-3xl font-bold">
                  {parseFloat(selectedAccount.staked_amount.toString()).toLocaleString()} <span className="text-lg text-muted-foreground">XDK</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Account Nonce</div>
                <div className="text-3xl font-bold">{selectedAccount.nonce}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No XDK Account</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first XDK account to start using the blockchain
            </p>
            <Button onClick={createAccount} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Account Selector (if multiple accounts) */}
      {accounts.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {accounts.map((account) => (
            <Button
              key={account.address}
              variant={selectedAccount?.address === account.address ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedAccount(account)}
            >
              {truncateAddress(account.address)}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={createAccount}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}

      {selectedAccount && (
        <Tabs defaultValue="send">
          <TabsList>
            <TabsTrigger value="send" className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Send XDK</CardTitle>
                <CardDescription>Transfer tokens to another address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient Address</Label>
                  <Input
                    placeholder="xdk1..."
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (XDK)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Available: {parseFloat(selectedAccount.balance.toString()).toLocaleString()} XDK</span>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0"
                      onClick={() => setAmount(selectedAccount.balance.toString())}
                    >
                      Max
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={sendTransaction} 
                  disabled={sending || !toAddress || !amount}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Transaction
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Recent transactions for this account</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {transactions.map((tx) => {
                      const isOutgoing = tx.from_address === selectedAccount.address;
                      return (
                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isOutgoing ? 'bg-red-500/10' : 'bg-green-500/10'
                            }`}>
                              {isOutgoing ? (
                                <ArrowUpRight className="h-5 w-5 text-red-500" />
                              ) : (
                                <ArrowDownLeft className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">
                                {isOutgoing ? 'Sent' : 'Received'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {isOutgoing 
                                  ? `To: ${truncateAddress(tx.to_address || '')}`
                                  : `From: ${truncateAddress(tx.from_address)}`
                                }
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${isOutgoing ? 'text-red-500' : 'text-green-500'}`}>
                              {isOutgoing ? '-' : '+'}{parseFloat(tx.amount.toString()).toLocaleString()} XDK
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                              <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                                {tx.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {transactions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
