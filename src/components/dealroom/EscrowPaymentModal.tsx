import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Wallet, 
  Loader2, 
  CheckCircle2, 
  Shield, 
  Zap,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { bizDevStripeAppearance } from "@/lib/stripe-appearance";
import { cn } from "@/lib/utils";

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "").then((stripe) => {
  console.log("[Stripe] Initialized:", stripe ? "Success" : "Failed");
  return stripe;
});

interface EscrowPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientSecret: string;
  amount: number;
  currency: string;
  dealRoomName?: string;
  dealRoomId: string;
  xdkConversion: boolean;
  currentBalance: number;
  onSuccess: () => void;
}

function PaymentForm({ 
  amount, 
  currency, 
  dealRoomName,
  xdkConversion,
  currentBalance,
  onSuccess,
  onClose,
}: {
  amount: number;
  currency: string;
  dealRoomName?: string;
  xdkConversion: boolean;
  currentBalance: number;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elementReady, setElementReady] = useState(false);
  const queryClient = useQueryClient();

  // Debug and timeout handling
  useEffect(() => {
    console.log("[PaymentForm] Mounted with amount:", amount);
    console.log("[PaymentForm] Stripe instance:", stripe ? "Available" : "Not available");
    console.log("[PaymentForm] Elements instance:", elements ? "Available" : "Not available");
    
    // Set a timeout to detect if Payment Element never loads
    const timeout = setTimeout(() => {
      if (!elementReady) {
        console.error("[PaymentElement] Timeout: Failed to load after 10 seconds");
        setError(
          "Payment form failed to load. This may be due to: " +
          "1) Network connectivity issues, " +
          "2) Stripe service interruption, or " +
          "3) Browser blocking third-party scripts. " +
          "Please try again or contact support."
        );
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [amount, elementReady, stripe, elements]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // Fallback, but we handle success in-app
        },
        redirect: "if_required",
      });

      if (submitError) {
        setError(submitError.message || "Payment failed. Please try again.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        setIsComplete(true);
        
        // Invalidate relevant queries to refresh balances
        queryClient.invalidateQueries({ queryKey: ["deal-room"] });
        queryClient.invalidateQueries({ queryKey: ["escrow-balance"] });
        queryClient.invalidateQueries({ queryKey: ["escrow-transactions"] });
        
        toast.success("Escrow funded successfully!", {
          description: `${formatCurrency(amount)} has been added to the escrow wallet.`,
        });

        // Brief delay to show success state, then close
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        // 3D Secure or other authentication required
        // Stripe will handle this automatically
        setIsProcessing(false);
      } else {
        setError("Payment could not be completed. Please try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Payment Successful!</h3>
          <p className="text-muted-foreground">
            {formatCurrency(amount)} has been added to your escrow wallet.
          </p>
          {xdkConversion && (
            <div className="flex items-center justify-center gap-2 text-amber-500 text-sm">
              <Zap className="w-4 h-4" />
              <span>XDK tokens minted</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Summary */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Funding Amount</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(amount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current Balance</span>
          <span className="font-medium">{formatCurrency(currentBalance)}</span>
        </div>
        <div className="border-t border-border/50 pt-3 flex items-center justify-between">
          <span className="text-sm font-medium">New Balance</span>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg font-bold text-green-500">
              {formatCurrency(currentBalance + amount)}
            </span>
          </div>
        </div>
        {xdkConversion && (
          <div className="flex items-center gap-2 text-xs text-amber-500 pt-2 border-t border-border/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Will be converted to XDK for blockchain settlements</span>
          </div>
        )}
      </div>

      {/* Payment Element */}
      <div className="space-y-2">
        {!elementReady && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading payment form...</span>
          </div>
        )}
        <PaymentElement 
          options={{
            layout: {
              type: "accordion",
              defaultCollapsed: false,
              radios: true,
              spacedAccordionItems: true,
            },
            paymentMethodOrder: ["card", "us_bank_account"],
            wallets: {
              applePay: "auto",
              googlePay: "auto",
            },
          }}
          onReady={() => {
            console.log("[PaymentElement] Ready!");
            setElementReady(true);
          }}
          onLoaderStart={() => {
            console.log("[PaymentElement] Loading started");
            setElementReady(false);
          }}
          onLoadError={(error) => {
            console.error("[PaymentElement] Load error:", error);
            setError("Failed to load payment form. Please check your connection and try again.");
          }}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5" />
        <span>Secured with 256-bit SSL encryption</span>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={!stripe || !elementReady || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <DollarSign className="w-5 h-5 mr-2" />
            Pay {formatCurrency(amount)}
          </>
        )}
      </Button>
    </form>
  );
}

export function EscrowPaymentModal({
  open,
  onOpenChange,
  clientSecret,
  amount,
  currency,
  dealRoomName,
  dealRoomId,
  xdkConversion,
  currentBalance,
  onSuccess,
}: EscrowPaymentModalProps) {
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[EscrowPaymentModal] Client secret:", clientSecret ? "Present" : "Missing");
    if (clientSecret) {
      setStripeReady(true);
    }
  }, [clientSecret]);

  // Debug: Log Stripe publishable key (first 20 chars only for security)
  useEffect(() => {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    console.log("[Stripe Config] Key present:", !!key, "First chars:", key?.substring(0, 20));
    
    // Verify Stripe can load
    stripePromise.then((stripe) => {
      if (!stripe) {
        setStripeError("Failed to initialize Stripe. Please check your configuration.");
        console.error("[Stripe] Failed to load Stripe instance");
      }
    }).catch((err) => {
      setStripeError("Failed to load Stripe: " + err.message);
      console.error("[Stripe] Error loading Stripe:", err);
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" hideCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="block">Fund Escrow</span>
              {dealRoomName && (
                <span className="text-sm font-normal text-muted-foreground">
                  {dealRoomName}
                </span>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enter your payment details to fund the escrow wallet
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {stripeError && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-4">
              {stripeError}
            </div>
          )}
          {stripeReady && clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: bizDevStripeAppearance,
                loader: "auto",
              }}
            >
              <PaymentForm
                amount={amount}
                currency={currency}
                dealRoomName={dealRoomName}
                xdkConversion={xdkConversion}
                currentBalance={currentBalance}
                onSuccess={onSuccess}
                onClose={() => onOpenChange(false)}
              />
            </Elements>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
