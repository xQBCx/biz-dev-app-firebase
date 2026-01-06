import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Wallet, Plus, Check, X, ExternalLink, Trash2,
  Shield, AlertCircle, RefreshCw, Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WalletConnection {
  id: string;
  wallet_type: string;
  wallet_address: string | null;
  wallet_chain: string | null;
  wallet_name: string | null;
  verification_status: string;
  is_primary: boolean;
  is_enabled: boolean;
  created_at: string;
}

const WALLET_TYPES = [
  { value: 'metamask', label: 'MetaMask', icon: '🦊', chains: ['ethereum', 'polygon', 'bsc', 'base'] },
  { value: 'phantom', label: 'Phantom', icon: '👻', chains: ['solana'] },
  { value: 'coinbase_wallet', label: 'Coinbase Wallet', icon: '🔵', chains: ['ethereum', 'polygon', 'base'] },
  { value: 'walletconnect', label: 'WalletConnect', icon: '🔗', chains: ['ethereum', 'polygon', 'bsc'] },
  { value: 'ledger', label: 'Ledger', icon: '🔐', chains: ['ethereum', 'solana'] },
  { value: 'trezor', label: 'Trezor', icon: '🛡️', chains: ['ethereum'] },
  { value: 'trust_wallet', label: 'Trust Wallet', icon: '💎', chains: ['ethereum', 'bsc'] },
  { value: 'rainbow', label: 'Rainbow', icon: '🌈', chains: ['ethereum'] },
  { value: 'bank_account', label: 'Bank Account', icon: '🏦', chains: [] },
  { value: 'stripe', label: 'Stripe', icon: '💳', chains: [] },
  { value: 'paypal', label: 'PayPal', icon: '🅿️', chains: [] },
];

export function WalletConnector() {
  const [wallets, setWallets] = useState<WalletConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWallet, setNewWallet] = useState({
    type: '',
    address: '',
    chain: '',
    name: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('external_wallet_connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wallets:', error);
      toast({
        title: "Error",
        description: "Failed to load wallets",
        variant: "destructive",
      });
    } else {
      setWallets(data || []);
    }
    setIsLoading(false);
  };

  const connectWallet = async () => {
    if (!newWallet.type) return;

    setIsConnecting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // For crypto wallets, we'd trigger the wallet connection flow
      // For now, we'll add the wallet manually
      const { data, error } = await supabase
        .from('external_wallet_connections')
        .insert({
          user_id: user.id,
          wallet_type: newWallet.type,
          wallet_address: newWallet.address || null,
          wallet_chain: newWallet.chain || null,
          wallet_name: newWallet.name || null,
          verification_status: 'unverified',
        })
        .select()
        .single();

      if (error) throw error;

      setWallets(prev => [data, ...prev]);
      setShowAddDialog(false);
      setNewWallet({ type: '', address: '', chain: '', name: '' });

      toast({
        title: "Wallet Added",
        description: "Your wallet has been added. Please verify it to enable transactions.",
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const verifyWallet = async (walletId: string) => {
    try {
      // In production, this would trigger the signature verification flow
      const { error } = await supabase.functions.invoke('verify-wallet-connection', {
        body: {
          wallet_id: walletId,
          signature: 'mock_signature_for_demo_purposes_only_replace_in_production',
          message: 'Verify wallet ownership',
          wallet_type: wallets.find(w => w.id === walletId)?.wallet_type || 'other',
        },
      });

      if (error) throw error;

      setWallets(prev => 
        prev.map(w => w.id === walletId ? { ...w, verification_status: 'verified' } : w)
      );

      toast({
        title: "Wallet Verified",
        description: "Your wallet has been successfully verified",
      });
    } catch (error) {
      console.error('Error verifying wallet:', error);
      toast({
        title: "Verification Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  };

  const setPrimaryWallet = async (walletId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Remove primary from all wallets
      await supabase
        .from('external_wallet_connections')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Set new primary
      await supabase
        .from('external_wallet_connections')
        .update({ is_primary: true })
        .eq('id', walletId);

      setWallets(prev => 
        prev.map(w => ({ ...w, is_primary: w.id === walletId }))
      );

      toast({
        title: "Primary Wallet Updated",
        description: "This wallet will be used for automatic distributions",
      });
    } catch (error) {
      console.error('Error setting primary wallet:', error);
    }
  };

  const deleteWallet = async (walletId: string) => {
    try {
      const { error } = await supabase
        .from('external_wallet_connections')
        .delete()
        .eq('id', walletId);

      if (error) throw error;

      setWallets(prev => prev.filter(w => w.id !== walletId));

      toast({
        title: "Wallet Removed",
        description: "The wallet has been disconnected",
      });
    } catch (error) {
      console.error('Error deleting wallet:', error);
      toast({
        title: "Error",
        description: "Failed to remove wallet",
        variant: "destructive",
      });
    }
  };

  const getWalletInfo = (type: string) => {
    return WALLET_TYPES.find(w => w.value === type) || { label: type, icon: '💰', chains: [] };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/10 text-green-500 gap-1"><Check className="h-3 w-3" />Verified</Badge>;
      case 'pending_verification':
        return <Badge className="bg-amber-500/10 text-amber-500 gap-1"><RefreshCw className="h-3 w-3" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 gap-1"><X className="h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" />Unverified</Badge>;
    }
  };

  const selectedWalletType = WALLET_TYPES.find(w => w.value === newWallet.type);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connected Wallets
            </CardTitle>
            <CardDescription>
              Connect your wallets to receive deal payments and distributions
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect a Wallet</DialogTitle>
                <DialogDescription>
                  Choose a wallet type to connect for receiving payments
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Wallet Type</Label>
                  <Select
                    value={newWallet.type}
                    onValueChange={(value) => setNewWallet(prev => ({ ...prev, type: value, chain: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet type" />
                    </SelectTrigger>
                    <SelectContent>
                      {WALLET_TYPES.map((wallet) => (
                        <SelectItem key={wallet.value} value={wallet.value}>
                          <span className="flex items-center gap-2">
                            <span>{wallet.icon}</span>
                            <span>{wallet.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedWalletType && selectedWalletType.chains.length > 0 && (
                  <div className="space-y-2">
                    <Label>Blockchain Network</Label>
                    <Select
                      value={newWallet.chain}
                      onValueChange={(value) => setNewWallet(prev => ({ ...prev, chain: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedWalletType.chains.map((chain) => (
                          <SelectItem key={chain} value={chain}>
                            {chain.charAt(0).toUpperCase() + chain.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <Input
                    value={newWallet.address}
                    onChange={(e) => setNewWallet(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="0x... or wallet address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nickname (Optional)</Label>
                  <Input
                    value={newWallet.name}
                    onChange={(e) => setNewWallet(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My main wallet"
                  />
                </div>

                <Button 
                  onClick={connectWallet} 
                  disabled={!newWallet.type || isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin" />
            Loading wallets...
          </div>
        ) : wallets.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No wallets connected yet</p>
            <p className="text-sm">Add a wallet to receive payments</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-3">
              {wallets.map((wallet) => {
                const info = getWalletInfo(wallet.wallet_type);
                return (
                  <div
                    key={wallet.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{info.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{wallet.wallet_name || info.label}</span>
                          {wallet.is_primary && (
                            <Badge variant="secondary" className="gap-1">
                              <Star className="h-3 w-3" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        {wallet.wallet_address && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {wallet.wallet_address.slice(0, 8)}...{wallet.wallet_address.slice(-6)}
                          </p>
                        )}
                        {wallet.wallet_chain && (
                          <p className="text-xs text-muted-foreground">
                            {wallet.wallet_chain.charAt(0).toUpperCase() + wallet.wallet_chain.slice(1)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(wallet.verification_status)}
                      
                      {wallet.verification_status === 'unverified' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verifyWallet(wallet.id)}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}

                      {wallet.verification_status === 'verified' && !wallet.is_primary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPrimaryWallet(wallet.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWallet(wallet.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
