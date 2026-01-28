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
  Receipt, 
  Loader2, 
  CheckCircle2, 
  Shield, 
  Zap,
  Calendar,
} from "lucide-react";
import { bizDevStripeAppearance } from "@/lib/stripe-appearance";
import { supabase } from "@/integrations/supabase/client";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface InvoicePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  amount: number;
  currency: string;
  description: string;
  dueDate?: string;
  onSuccess: () => void;
}

function PaymentForm({ 
  amount, 
  currency, 
  description,
  dueDate,
  onSuccess,
  onClose,
  invoiceId,
}: {
  amount: number;
  currency: string;
  description: string;
  dueDate?: string;
  onSuccess: () => void;
  onClose: () => void;
  invoiceId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elementReady, setElementReady] = useState(false);
  const queryClient = useQueryClient();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(value);

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
          return_url: window.location.href,
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
        
        // Update local invoice status
        await supabase
          .from("platform_invoices")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", invoiceId);
        
        queryClient.invalidateQueries({ queryKey: ["platform-invoices"] });
        queryClient.invalidateQueries({ queryKey: ["client-invoices"] });
        queryClient.invalidateQueries({ queryKey: ["xdk-balance"] });
        
        toast.success("Payment successful!", {
          description: `${formatCurrency(amount)} has been paid. XDK will be credited shortly.`,
        });

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
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
            {formatCurrency(amount)} has been paid.
          </p>
          <div className="flex items-center justify-center gap-2 text-amber-500 text-sm">
            <Zap className="w-4 h-4" />
            <span>XDK tokens being minted...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Summary */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Invoice Amount</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(amount)}</span>
        </div>
        <div className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </div>
        {dueDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
            <Calendar className="w-3.5 h-3.5" />
            <span>Due: {new Date(dueDate).toLocaleDateString()}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-amber-500 pt-2 border-t border-border/30">
          <Zap className="w-3.5 h-3.5" />
          <span>Payment settles via XDK for instant availability</span>
        </div>
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
          onReady={() => setElementReady(true)}
          onLoaderStart={() => setElementReady(false)}
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
            <Receipt className="w-5 h-5 mr-2" />
            Pay {formatCurrency(amount)}
          </>
        )}
      </Button>
    </form>
  );
}

export function InvoicePaymentModal({
  open,
  onOpenChange,
  invoiceId,
  amount,
  currency,
  description,
  dueDate,
  onSuccess,
}: InvoicePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !invoiceId) return;

    const fetchPaymentSecret = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Please sign in to pay this invoice");
          setLoading(false);
          return;
        }

        const response = await supabase.functions.invoke("get-invoice-payment-secret", {
          body: { invoice_id: invoiceId },
        });

        if (response.error) {
          throw new Error(response.error.message || "Failed to load payment information");
        }

        if (response.data?.status === "paid") {
          setError("This invoice has already been paid");
          setLoading(false);
          return;
        }

        if (response.data?.client_secret) {
          setClientSecret(response.data.client_secret);
        } else {
          throw new Error("Unable to retrieve payment information");
        }
      } catch (err) {
        console.error("Error fetching payment secret:", err);
        setError(err instanceof Error ? err.message : "Failed to load payment information");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentSecret();
  }, [open, invoiceId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="block">Pay Invoice</span>
              <span className="text-sm font-normal text-muted-foreground">
                Secure in-app payment
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Enter your payment details to pay this invoice
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          {!loading && !error && clientSecret && (
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
                description={description}
                dueDate={dueDate}
                onSuccess={onSuccess}
                onClose={() => onOpenChange(false)}
                invoiceId={invoiceId}
              />
            </Elements>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
