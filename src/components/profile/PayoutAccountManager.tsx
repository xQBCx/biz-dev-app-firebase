import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Star,
  CheckCircle2,
  Wallet,
  Building2,
  Smartphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";

type PayoutMethod = 
  | 'bank_ach'
  | 'paypal'
  | 'venmo'
  | 'cashapp'
  | 'zelle'
  | 'apple_cash'
  | 'crypto_btc'
  | 'crypto_eth'
  | 'crypto_xrp'
  | 'manual';

interface PayoutAccount {
  id: string;
  method: PayoutMethod;
  account_name: string;
  account_details: Record<string, string>;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
}

const methodConfig: Record<PayoutMethod, { label: string; icon: React.ReactNode; fields: { key: string; label: string; placeholder: string }[] }> = {
  bank_ach: {
    label: "Bank Account (ACH)",
    icon: <Building2 className="h-4 w-4" />,
    fields: [
      { key: "bank_name", label: "Bank Name", placeholder: "Chase, Wells Fargo, etc." },
      { key: "account_last4", label: "Last 4 Digits", placeholder: "1234" }
    ]
  },
  paypal: {
    label: "PayPal",
    icon: <Wallet className="h-4 w-4" />,
    fields: [
      { key: "email", label: "PayPal Email", placeholder: "your@email.com" }
    ]
  },
  venmo: {
    label: "Venmo",
    icon: <Smartphone className="h-4 w-4" />,
    fields: [
      { key: "handle", label: "Venmo Handle", placeholder: "@yourhandle" }
    ]
  },
  cashapp: {
    label: "Cash App",
    icon: <Smartphone className="h-4 w-4" />,
    fields: [
      { key: "cashtag", label: "Cash Tag", placeholder: "$yourcashtag" }
    ]
  },
  zelle: {
    label: "Zelle",
    icon: <Smartphone className="h-4 w-4" />,
    fields: [
      { key: "email_or_phone", label: "Email or Phone", placeholder: "your@email.com or (555) 123-4567" }
    ]
  },
  apple_cash: {
    label: "Apple Cash",
    icon: <Smartphone className="h-4 w-4" />,
    fields: [
      { key: "phone", label: "Apple ID Phone", placeholder: "(555) 123-4567" }
    ]
  },
  crypto_btc: {
    label: "Bitcoin (BTC)",
    icon: <Wallet className="h-4 w-4" />,
    fields: [
      { key: "wallet_address", label: "BTC Wallet Address", placeholder: "bc1q..." }
    ]
  },
  crypto_eth: {
    label: "Ethereum (ETH)",
    icon: <Wallet className="h-4 w-4" />,
    fields: [
      { key: "wallet_address", label: "ETH Wallet Address", placeholder: "0x..." }
    ]
  },
  crypto_xrp: {
    label: "XRP",
    icon: <Wallet className="h-4 w-4" />,
    fields: [
      { key: "wallet_address", label: "XRP Wallet Address", placeholder: "r..." },
      { key: "destination_tag", label: "Destination Tag (if required)", placeholder: "Optional" }
    ]
  },
  manual: {
    label: "Manual Processing",
    icon: <Wallet className="h-4 w-4" />,
    fields: [
      { key: "instructions", label: "Instructions", placeholder: "How should we contact you?" }
    ]
  }
};

export function PayoutAccountManager() {
  const effectiveUser = useEffectiveUser();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod | "">("");
  const [accountName, setAccountName] = useState("");
  const [accountDetails, setAccountDetails] = useState<Record<string, string>>({});

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['payout-accounts', effectiveUser.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_payout_accounts')
        .select('*')
        .eq('user_id', effectiveUser.id)
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data as PayoutAccount[];
    },
    enabled: !!effectiveUser.id
  });

  const addAccountMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMethod || !accountName) {
        throw new Error("Please fill in all required fields");
      }

      const { error } = await supabase
        .from('user_payout_accounts')
        .insert({
          user_id: effectiveUser.id,
          method: selectedMethod,
          account_name: accountName,
          account_details: accountDetails,
          is_primary: !accounts?.length // First account is primary
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-accounts'] });
      toast.success("Payout account added");
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add account");
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('user_payout_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-accounts'] });
      toast.success("Payout account removed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove account");
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (accountId: string) => {
      // First, unset all primary flags
      await supabase
        .from('user_payout_accounts')
        .update({ is_primary: false })
        .eq('user_id', effectiveUser.id);

      // Then set the new primary
      const { error } = await supabase
        .from('user_payout_accounts')
        .update({ is_primary: true })
        .eq('id', accountId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-accounts'] });
      toast.success("Primary payout method updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update primary method");
    }
  });

  const resetForm = () => {
    setSelectedMethod("");
    setAccountName("");
    setAccountDetails({});
  };

  const getDisplayValue = (account: PayoutAccount) => {
    const details = account.account_details;
    if (details.email) return details.email;
    if (details.handle) return details.handle;
    if (details.cashtag) return details.cashtag;
    if (details.wallet_address) return `${details.wallet_address.slice(0, 8)}...${details.wallet_address.slice(-6)}`;
    if (details.account_last4) return `****${details.account_last4}`;
    return "Configured";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Alternative Payout Methods</CardTitle>
            <CardDescription>Add backup withdrawal destinations</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payout Account</DialogTitle>
                <DialogDescription>
                  Add an alternative method to receive your XDK withdrawals
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Payout Method</Label>
                  <Select value={selectedMethod} onValueChange={(v) => {
                    setSelectedMethod(v as PayoutMethod);
                    setAccountDetails({});
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a method" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(methodConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {config.icon}
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMethod && (
                  <>
                    <div className="space-y-2">
                      <Label>Account Nickname</Label>
                      <Input
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="e.g., My Personal PayPal"
                      />
                    </div>

                    {methodConfig[selectedMethod].fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label>{field.label}</Label>
                        <Input
                          value={accountDetails[field.key] || ""}
                          onChange={(e) => setAccountDetails({
                            ...accountDetails,
                            [field.key]: e.target.value
                          })}
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => addAccountMutation.mutate()}
                  disabled={addAccountMutation.isPending || !selectedMethod || !accountName}
                >
                  {addAccountMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : accounts?.length ? (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div 
                key={account.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-background">
                    {methodConfig[account.method]?.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.account_name}</span>
                      {account.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1 fill-current" /> Primary
                        </Badge>
                      )}
                      {account.is_verified && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {methodConfig[account.method]?.label} • {getDisplayValue(account)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!account.is_primary && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPrimaryMutation.mutate(account.id)}
                      disabled={setPrimaryMutation.isPending}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteAccountMutation.mutate(account.id)}
                    disabled={deleteAccountMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alternative payout methods configured</p>
            <p className="text-xs mt-1">Add PayPal, Venmo, crypto wallets, or other options</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
