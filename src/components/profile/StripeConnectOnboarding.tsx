import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  CreditCard, 
  CheckCircle2, 
  ExternalLink,
  AlertCircle,
  Zap,
  Building2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface StripeConnectStatus {
  connected: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  account_id: string | null;
  error?: string;
}

export function StripeConnectOnboarding() {
  const [isConnecting, setIsConnecting] = useState(false);

  // Check for return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeConnect = params.get("stripe_connect");
    
    if (stripeConnect === "complete") {
      toast.success("Stripe Connect setup completed!", {
        description: "Your bank account is now linked for fast payouts."
      });
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      // Refetch status
      refetchStatus();
    } else if (stripeConnect === "refresh") {
      toast.info("Please complete your Stripe Connect setup.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const { data: status, isLoading, refetch: refetchStatus } = useQuery<StripeConnectStatus>({
    queryKey: ['stripe-connect-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-stripe-connect-status');
      if (error) throw error;
      return data;
    },
    refetchOnWindowFocus: true
  });

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      const { data, error } = await supabase.functions.invoke('create-stripe-connect', {
        body: { origin: window.location.origin }
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No onboarding URL returned");
      }
    } catch (error: any) {
      console.error('Stripe Connect error:', error);
      toast.error(error.message || 'Failed to start Stripe Connect setup');
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const isFullyConnected = status?.connected && status?.payouts_enabled;
  const needsCompletion = status?.connected && !status?.payouts_enabled;

  return (
    <Card className={isFullyConnected ? "border-emerald-500/50" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle className="text-base">Fast Payouts (Bank Transfer)</CardTitle>
          </div>
          {isFullyConnected && (
            <Badge className="bg-emerald-500">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
            </Badge>
          )}
          {needsCompletion && (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" /> Setup Incomplete
            </Badge>
          )}
        </div>
        <CardDescription>
          Connect your bank account for instant USD withdrawals via Stripe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFullyConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Zap className="h-4 w-4" />
              <span>Ready to receive instant payouts</span>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account ID</span>
                <span className="font-mono text-xs">{status?.account_id?.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-emerald-600 font-medium">Active</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Manage Account
            </Button>
          </div>
        ) : needsCompletion ? (
          <div className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your Stripe account setup is incomplete. Please finish verification to enable payouts.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Set up Stripe Connect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Receive instant USD payouts to your bank</li>
                <li>Withdraw XDK earnings automatically</li>
                <li>Track all payouts in one place</li>
              </ul>
            </div>
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Set Up Fast Payouts
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Takes about 5 minutes. Powered by Stripe.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
