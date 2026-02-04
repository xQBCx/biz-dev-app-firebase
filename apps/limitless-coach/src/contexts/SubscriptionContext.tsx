import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type SubscriptionTier = 'free' | 'pro';

interface SubscriptionState {
  isLoading: boolean;
  subscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  productId: string | null;
}

interface SubscriptionContextType extends SubscriptionState {
  user: User | null;
  checkSubscription: () => Promise<void>;
  isPro: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Stripe product/price mapping
export const STRIPE_PRODUCTS = {
  pro: {
    product_id: 'prod_ThYyz0cu6aSdgq',
    price_id: 'price_1Sk9qMBsKRWVaqtwfwG0StVY',
    name: 'Limitless Coach Pro',
    price: 19,
    interval: 'month',
    features: [
      'Full program library access',
      'Unlimited AI coaching',
      'Advanced form analysis',
      'Priority support',
      'Exclusive content'
    ]
  }
} as const;

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    subscribed: false,
    subscriptionTier: 'free',
    subscriptionEnd: null,
    productId: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({
        isLoading: false,
        subscribed: false,
        subscriptionTier: 'free',
        subscriptionEnd: null,
        productId: null,
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setState({
        isLoading: false,
        subscribed: data.subscribed || false,
        subscriptionTier: data.subscription_tier || 'free',
        subscriptionEnd: data.subscription_end || null,
        productId: data.product_id || null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user]);

  useEffect(() => {
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh subscription status every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const value: SubscriptionContextType = {
    ...state,
    user,
    checkSubscription,
    isPro: state.subscriptionTier === 'pro',
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
