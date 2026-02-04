import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [cards, setCards] = useState<any[]>([]);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!sessionId || !orderId) {
      toast.error("Invalid payment session");
      navigate("/ai-gift-cards");
      return;
    }

    verifyPayment();
  }, [sessionId, orderId]);

  const verifyPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { session_id: sessionId, order_id: orderId },
      });

      if (error) throw error;

      // Fetch order details with cards
      const { data: order, error: orderError } = await supabase
        .from("ai_orders")
        .select(`
          *,
          ai_products (
            *,
            ai_providers (*)
          )
        `)
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;
      setOrderDetails(order);

      // Fetch generated cards
      const { data: giftCards, error: cardsError } = await supabase
        .from("ai_gift_cards")
        .select("*")
        .eq("order_id", orderId);

      if (cardsError) throw cardsError;
      setCards(giftCards || []);

      toast.success("Payment successful! Your gift cards are ready.");
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error("Failed to verify payment");
    } finally {
      setIsVerifying(false);
    }
  };

  const downloadCards = () => {
    const cardsText = cards
      .map(
        (card) =>
          `Card Code: ${card.card_code}\nValue: $${card.face_value}\nExpires: ${new Date(
            card.expires_at
          ).toLocaleDateString()}\nRedeem at: ${card.redemption_url || "Check email"}\n\n`
      )
      .join("---\n\n");

    const blob = new Blob([cardsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-gift-cards-${orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold">Verifying Payment...</h2>
            <p className="text-muted-foreground mt-2">Please wait while we process your order</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl">Payment Successful!</CardTitle>
              <CardDescription>Your AI gift cards are ready to use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {orderDetails && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-lg">Order Details</h3>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Number:</span>
                      <span className="font-mono">{orderDetails.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product:</span>
                      <span>{orderDetails.ai_products.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider:</span>
                      <span>{orderDetails.ai_products.ai_providers.display_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span>{orderDetails.quantity} cards</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold">${orderDetails.total_amount}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-3">Your Gift Cards</h3>
                <div className="space-y-3">
                  {cards.map((card) => (
                    <div key={card.id} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-mono text-lg font-bold">{card.card_code}</p>
                          <p className="text-sm text-muted-foreground">
                            Value: ${card.face_value} | Expires:{" "}
                            {new Date(card.expires_at).toLocaleDateString()}
                          </p>
                          {card.redemption_url && (
                            <a
                              href={card.redemption_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Redeem Now →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={downloadCards} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Cards
                </Button>
                <Button onClick={() => navigate("/ai-gift-cards")} className="flex-1">
                  Back to Marketplace
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Gift card details have been sent to {orderDetails?.customer_email}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
