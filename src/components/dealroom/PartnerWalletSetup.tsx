import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wallet, CheckCircle2, Loader2, Copy, ExternalLink } from "lucide-react";

interface PartnerWalletSetupProps {
  dealRoomId: string;
  participantId: string;
  userId: string;
  participantName?: string;
}

export function PartnerWalletSetup({
  dealRoomId,
  participantId,
  userId,
  participantName,
}: PartnerWalletSetupProps) {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Check if participant has a wallet linked via deal_room_participants
  const { data: participant, isLoading } = useQuery({
    queryKey: ["participant-wallet", participantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_room_participants")
        .select("*, wallets(*)")
        .eq("id", participantId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  // Check for existing XDK account
  const { data: xdkAccount } = useQuery({
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
    },
  });

  const createWalletMutation = useMutation({
    mutationFn: async () => {
      setIsCreating(true);

      // Create XDK account if doesn't exist
      let xdkAddress = xdkAccount?.address;

      if (!xdkAddress) {
        // Generate XDK address
        const { data: addressData } = await supabase.rpc("generate_xdk_address");
        xdkAddress = addressData || `xdk1user${userId.replace(/-/g, "").slice(0, 32)}`;

        // Create XODIAK account
        const { error: xdkError } = await supabase.from("xodiak_accounts").insert({
          address: xdkAddress,
          user_id: userId,
          balance: 0,
          account_type: "user",
          metadata: {
            created_for: "deal_room_participant",
            deal_room_id: dealRoomId,
            participant_id: participantId,
          },
        });

        if (xdkError) throw xdkError;
      }

      // Create internal wallet for payouts
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .insert({
          user_id: userId,
          balance: 0,
          currency: "XDK",
        })
        .select()
        .single();

      if (walletError) throw walletError;

      // Link wallet to participant using participant_wallet_connections
      const { error: linkError } = await supabase
        .from("participant_wallet_connections")
        .insert({
          user_id: userId,
          wallet_id: wallet.id,
          deal_room_id: dealRoomId,
        });

      if (linkError) throw linkError;

      // Update participant with wallet address
      await supabase
        .from("deal_room_participants")
        .update({ wallet_address: xdkAddress })
        .eq("id", participantId);

      return { wallet, xdkAddress };
    },
    onSuccess: (data) => {
      toast.success("XDK Wallet Created", {
        description: `Your wallet address: ${data.xdkAddress.slice(0, 12)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ["participant-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["user-xdk-account"] });
    },
    onError: (error) => {
      console.error("Wallet creation error:", error);
      toast.error("Failed to create wallet", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    },
    onSettled: () => {
      setIsCreating(false);
    },
  });

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const linkedAddress = participant?.wallet_address || xdkAccount?.address;
  const walletBalance = xdkAccount?.balance || 0;

  if (linkedAddress) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-emerald-600" />
              XDK Wallet Connected
            </CardTitle>
            <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          <CardDescription>
            {participantName ? `${participantName}'s` : "Your"} settlement wallet is ready to receive XDK payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background border">
            <code className="flex-1 text-sm font-mono truncate">{linkedAddress}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => copyAddress(linkedAddress)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              asChild
            >
              <a href={`/xodiak-chain?tab=explorer&address=${linkedAddress}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          {walletBalance !== undefined && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Balance</span>
              <span className="font-semibold">
                {new Intl.NumberFormat("en-US").format(Number(walletBalance))} XDK
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-muted-foreground" />
          Set Up XDK Wallet
        </CardTitle>
        <CardDescription>
          Create an XDK wallet to receive settlement payouts on the XODIAK blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <h4 className="font-medium text-sm">Why XDK Wallet?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Receive instant payouts from Deal Room settlements</li>
            <li>• Full transparency with blockchain-verified transactions</li>
            <li>• Convert XDK to USD or keep as platform credits</li>
            <li>• Sync to QuickBooks for accounting (coming soon)</li>
          </ul>
        </div>

        <Button
          className="w-full gap-2"
          onClick={() => createWalletMutation.mutate()}
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Wallet...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              Create Platform Wallet
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
