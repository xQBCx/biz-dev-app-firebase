import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, ArrowLeft, ExternalLink, Zap } from 'lucide-react';
import { useSubscription, STRIPE_PRODUCTS } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Subscription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, subscribed, subscriptionTier, subscriptionEnd, isLoading, checkSubscription, isPro } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    // Handle success/cancel from Stripe checkout
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated!', {
        description: 'Welcome to Limitless Coach Pro!'
      });
      checkSubscription();
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout canceled', {
        description: 'No charges were made.'
      });
    }
  }, [searchParams, checkSubscription]);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      navigate('/auth');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: STRIPE_PRODUCTS.pro.price_id,
          mode: 'subscription'
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open subscription management');
    } finally {
      setPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Unlock your full potential with Limitless Coach Pro
          </p>
        </div>

        {isPro && (
          <Card className="mb-8 border-primary bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">You're a Pro member!</p>
                    {subscriptionEnd && (
                      <p className="text-sm text-muted-foreground">
                        Renews on {new Date(subscriptionEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <Card className={subscriptionTier === 'free' ? 'border-2 border-muted-foreground/30' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Free</CardTitle>
                {subscriptionTier === 'free' && (
                  <Badge variant="secondary">Current Plan</Badge>
                )}
              </div>
              <CardDescription>Get started with basic features</CardDescription>
              <div className="pt-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  '2 training programs',
                  'Basic workout tracking',
                  'Limited AI coach messages',
                  'Community access'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                {subscriptionTier === 'free' ? 'Your Current Plan' : 'Downgrade'}
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Tier */}
          <Card className={`relative ${isPro ? 'border-2 border-primary' : 'border-2 border-primary/50'}`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Zap className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Pro
                </CardTitle>
                {isPro && (
                  <Badge>Current Plan</Badge>
                )}
              </div>
              <CardDescription>Unlimited access to all features</CardDescription>
              <div className="pt-4">
                <span className="text-3xl font-bold">${STRIPE_PRODUCTS.pro.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {STRIPE_PRODUCTS.pro.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isPro ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Manage Subscription
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleUpgrade}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Crown className="h-4 w-4 mr-2" />
                  )}
                  Upgrade to Pro
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Cancel anytime. No questions asked.</p>
          <p className="mt-1">Secure payment powered by Stripe.</p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
