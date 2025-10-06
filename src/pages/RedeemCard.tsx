import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Gift, CheckCircle } from "lucide-react";

export default function RedeemCard() {
  const [cardCode, setCardCode] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [redemptionData, setRedemptionData] = useState<any>(null);

  const handleRedeem = async () => {
    if (!cardCode.trim() || !email.trim()) {
      toast.error("Please enter both card code and email");
      return;
    }

    setIsLoading(true);
    try {
      // Call the redemption edge function
      const { data, error } = await supabase.functions.invoke("redeem-gift-card", {
        body: { card_code: cardCode.trim(), email: email.trim() },
      });

      if (error) throw error;

      setRedemptionData(data);
      toast.success("Gift card redeemed successfully!");
    } catch (error: any) {
      console.error("Redemption error:", error);
      toast.error(error.message || "Failed to redeem gift card");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {!redemptionData ? (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl">Redeem Your AI Gift Card</CardTitle>
                <CardDescription>
                  Enter your card code and email to activate your AI credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="cardCode">Gift Card Code</Label>
                  <Input
                    id="cardCode"
                    value={cardCode}
                    onChange={(e) => setCardCode(e.target.value)}
                    placeholder="AIG-XXXXXXXXXXXX"
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll send your access details to this email
                  </p>
                </div>
                <Button
                  onClick={handleRedeem}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "Redeeming..." : "Redeem Card"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-3xl">Card Redeemed Successfully!</CardTitle>
                <CardDescription>
                  Your AI credits have been activated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Provider:</span>
                    <span>{redemptionData.provider_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Credits:</span>
                    <span className="font-bold">${redemptionData.amount}</span>
                  </div>
                  {redemptionData.redemption_url && (
                    <div className="flex justify-between">
                      <span className="font-medium">Access URL:</span>
                      <a
                        href={redemptionData.redemption_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Open Provider Site
                      </a>
                    </div>
                  )}
                  {redemptionData.provider_account_id && (
                    <div className="flex justify-between">
                      <span className="font-medium">Account ID:</span>
                      <span className="font-mono text-sm">
                        {redemptionData.provider_account_id}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Instructions have been sent to {email}
                </p>
                <Button
                  onClick={() => {
                    setRedemptionData(null);
                    setCardCode("");
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Redeem Another Card
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
