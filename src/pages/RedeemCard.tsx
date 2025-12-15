import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Gift, CheckCircle, CreditCard, Building2, Wallet, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

type RedemptionMethod = 'platform_credits' | 'prepaid_card' | 'bank_deposit' | 'paypal' | 'venmo';

interface PayoutDetails {
  // For prepaid card
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  // For bank deposit
  bankAccountLast4?: string;
  bankRoutingLast4?: string;
  // For PayPal/Venmo
  paypalEmail?: string;
  venmoHandle?: string;
}

export default function RedeemCard() {
  const [step, setStep] = useState<'code' | 'method' | 'details' | 'success'>('code');
  const [cardCode, setCardCode] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cardData, setCardData] = useState<any>(null);
  const [redemptionMethod, setRedemptionMethod] = useState<RedemptionMethod>('platform_credits');
  const [payoutDetails, setPayoutDetails] = useState<PayoutDetails>({});
  const [redemptionData, setRedemptionData] = useState<any>(null);

  const handleVerifyCard = async () => {
    if (!cardCode.trim() || !email.trim()) {
      toast.error("Please enter both card code and email");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-gift-card", {
        body: { card_code: cardCode.trim(), email: email.trim() },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setCardData(data.card);
      setStep('method');
    } catch (error: any) {
      console.error("Verification error:", error);
      toast.error(error.message || "Invalid card code or email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMethod = () => {
    if (redemptionMethod === 'platform_credits') {
      handleRedeem();
    } else {
      setStep('details');
    }
  };

  const handleRedeem = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-gift-card", {
        body: { 
          card_code: cardCode.trim(), 
          email: email.trim(),
          redemption_method: redemptionMethod,
          payout_details: payoutDetails
        },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setRedemptionData(data);
      setStep('success');
      toast.success("Gift card redeemed successfully!");
    } catch (error: any) {
      console.error("Redemption error:", error);
      toast.error(error.message || "Failed to redeem gift card");
    } finally {
      setIsLoading(false);
    }
  };

  const redemptionOptions = [
    {
      value: 'platform_credits' as RedemptionMethod,
      label: 'AI Platform Credits',
      description: `Redeem directly at ${cardData?.provider_name || 'the AI platform'}`,
      icon: Sparkles,
      recommended: true
    },
    {
      value: 'prepaid_card' as RedemptionMethod,
      label: 'Visa/Mastercard Prepaid',
      description: 'Receive a prepaid card by mail (3-5 business days)',
      icon: CreditCard
    },
    {
      value: 'bank_deposit' as RedemptionMethod,
      label: 'Bank Deposit',
      description: 'Direct deposit to your bank account (1-2 business days)',
      icon: Building2
    },
    {
      value: 'paypal' as RedemptionMethod,
      label: 'PayPal',
      description: 'Credit to your PayPal account (instant)',
      icon: Wallet
    },
    {
      value: 'venmo' as RedemptionMethod,
      label: 'Venmo',
      description: 'Transfer to your Venmo account (instant)',
      icon: Wallet
    }
  ];

  const renderCodeStep = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Gift className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">Redeem Your AI Gift Card</CardTitle>
        <CardDescription className="text-base">
          Enter your card code and email to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="cardCode">Gift Card Code</Label>
          <Input
            id="cardCode"
            value={cardCode}
            onChange={(e) => setCardCode(e.target.value.toUpperCase())}
            placeholder="AIG-XXXXXXXXXXXX"
            className="font-mono text-center text-lg h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="h-12"
          />
          <p className="text-sm text-muted-foreground">
            Must match the email this gift card was sent to
          </p>
        </div>
        <Button
          onClick={handleVerifyCard}
          disabled={isLoading || !cardCode.trim() || !email.trim()}
          className="w-full h-12 text-lg"
        >
          {isLoading ? "Verifying..." : "Continue"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderMethodStep = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">How would you like to use your gift?</CardTitle>
        <CardDescription className="text-base">
          Your gift card is worth <span className="font-bold text-foreground">${cardData?.face_value}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{cardData?.product_name}</p>
            <p className="text-sm text-muted-foreground">{cardData?.provider_name}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-bold">${cardData?.remaining_value}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
        </div>

        <RadioGroup 
          value={redemptionMethod} 
          onValueChange={(v) => setRedemptionMethod(v as RedemptionMethod)}
          className="space-y-3"
        >
          {redemptionOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                redemptionMethod === option.value 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={option.value} className="sr-only" />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                redemptionMethod === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <option.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{option.label}</p>
                  {option.recommended && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                redemptionMethod === option.value ? 'border-primary' : 'border-muted-foreground/30'
              }`}>
                {redemptionMethod === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
            </label>
          ))}
        </RadioGroup>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep('code')}
            className="flex-1 h-12"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleSelectMethod}
            disabled={isLoading}
            className="flex-1 h-12"
          >
            {redemptionMethod === 'platform_credits' ? 'Redeem Now' : 'Continue'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderDetailsStep = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">
          {redemptionMethod === 'prepaid_card' && 'Shipping Information'}
          {redemptionMethod === 'bank_deposit' && 'Bank Account Details'}
          {redemptionMethod === 'paypal' && 'PayPal Information'}
          {redemptionMethod === 'venmo' && 'Venmo Information'}
        </CardTitle>
        <CardDescription>
          We need a few details to process your ${cardData?.remaining_value} payout
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {redemptionMethod === 'prepaid_card' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={payoutDetails.shippingName || ''}
                onChange={(e) => setPayoutDetails({...payoutDetails, shippingName: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Textarea
                value={payoutDetails.shippingAddress || ''}
                onChange={(e) => setPayoutDetails({...payoutDetails, shippingAddress: e.target.value})}
                placeholder="123 Main St, Apt 4B"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={payoutDetails.shippingCity || ''}
                  onChange={(e) => setPayoutDetails({...payoutDetails, shippingCity: e.target.value})}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={payoutDetails.shippingState || ''}
                  onChange={(e) => setPayoutDetails({...payoutDetails, shippingState: e.target.value})}
                  placeholder="NY"
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  value={payoutDetails.shippingZip || ''}
                  onChange={(e) => setPayoutDetails({...payoutDetails, shippingZip: e.target.value})}
                  placeholder="10001"
                />
              </div>
            </div>
          </div>
        )}

        {redemptionMethod === 'bank_deposit' && (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                For security, we only need the last 4 digits. We'll verify your full account details via secure link sent to your email.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Last 4 of Account #</Label>
                <Input
                  value={payoutDetails.bankAccountLast4 || ''}
                  onChange={(e) => setPayoutDetails({...payoutDetails, bankAccountLast4: e.target.value.slice(0, 4)})}
                  placeholder="1234"
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Last 4 of Routing #</Label>
                <Input
                  value={payoutDetails.bankRoutingLast4 || ''}
                  onChange={(e) => setPayoutDetails({...payoutDetails, bankRoutingLast4: e.target.value.slice(0, 4)})}
                  placeholder="5678"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {redemptionMethod === 'paypal' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>PayPal Email</Label>
              <Input
                type="email"
                value={payoutDetails.paypalEmail || ''}
                onChange={(e) => setPayoutDetails({...payoutDetails, paypalEmail: e.target.value})}
                placeholder="your@paypal.email"
              />
              <p className="text-sm text-muted-foreground">
                Funds will be sent instantly to this PayPal account
              </p>
            </div>
          </div>
        )}

        {redemptionMethod === 'venmo' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Venmo Username</Label>
              <Input
                value={payoutDetails.venmoHandle || ''}
                onChange={(e) => setPayoutDetails({...payoutDetails, venmoHandle: e.target.value.replace('@', '')})}
                placeholder="@username"
              />
              <p className="text-sm text-muted-foreground">
                Funds will be sent instantly to this Venmo account
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setStep('method')}
            className="flex-1 h-12"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleRedeem}
            disabled={isLoading}
            className="flex-1 h-12"
          >
            {isLoading ? "Processing..." : `Redeem $${cardData?.remaining_value}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSuccessStep = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-3xl font-bold">Redemption Complete!</CardTitle>
        <CardDescription className="text-base">
          {redemptionMethod === 'platform_credits' && 'Your AI credits have been activated'}
          {redemptionMethod === 'prepaid_card' && 'Your prepaid card is being shipped'}
          {redemptionMethod === 'bank_deposit' && 'Your bank deposit is being processed'}
          {redemptionMethod === 'paypal' && 'Your PayPal transfer is complete'}
          {redemptionMethod === 'venmo' && 'Your Venmo transfer is complete'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-bold text-lg">${redemptionData?.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Method:</span>
            <span className="font-medium">
              {redemptionOptions.find(o => o.value === redemptionMethod)?.label}
            </span>
          </div>
          {redemptionMethod === 'platform_credits' && redemptionData?.redemption_url && (
            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => window.open(redemptionData.redemption_url, '_blank')}
              >
                Open {redemptionData.provider_name}
              </Button>
            </div>
          )}
          {redemptionMethod === 'prepaid_card' && (
            <div className="pt-3 border-t text-sm text-muted-foreground">
              <p>Estimated delivery: 3-5 business days</p>
              <p>Tracking details will be sent to {email}</p>
            </div>
          )}
          {(redemptionMethod === 'paypal' || redemptionMethod === 'venmo') && (
            <div className="pt-3 border-t text-sm text-muted-foreground">
              <p>Transfer should appear within minutes</p>
            </div>
          )}
          {redemptionMethod === 'bank_deposit' && (
            <div className="pt-3 border-t text-sm text-muted-foreground">
              <p>Expected in 1-2 business days</p>
              <p>Check your email to complete verification</p>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Confirmation sent to {email}
        </p>
        <Button
          onClick={() => {
            setStep('code');
            setCardCode("");
            setEmail("");
            setCardData(null);
            setRedemptionData(null);
            setPayoutDetails({});
            setRedemptionMethod('platform_credits');
          }}
          variant="outline"
          className="w-full"
        >
          Redeem Another Card
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto">
          {/* Progress indicator */}
          {step !== 'success' && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {['code', 'method', 'details'].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s 
                      ? 'bg-primary text-primary-foreground' 
                      : ['method', 'details'].indexOf(step) > ['code', 'method', 'details'].indexOf(s)
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`w-12 h-0.5 mx-1 ${
                      ['method', 'details'].indexOf(step) > i ? 'bg-primary/50' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 'code' && renderCodeStep()}
          {step === 'method' && renderMethodStep()}
          {step === 'details' && renderDetailsStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
}