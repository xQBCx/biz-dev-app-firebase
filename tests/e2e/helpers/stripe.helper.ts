import { Page } from '@playwright/test';

export const STRIPE_TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficientFunds: '4000000000009995',
  requiresAuth: '4000002500003155',
  expired: '4000000000000069',
};

export class StripeHelper {
  constructor(private page: Page) {}

  /**
   * Fill in Stripe Checkout form with test card details
   */
  async fillCheckoutForm(
    cardNumber: string = STRIPE_TEST_CARDS.success,
    options: {
      expMonth?: string;
      expYear?: string;
      cvc?: string;
      zip?: string;
      email?: string;
    } = {}
  ) {
    const {
      expMonth = '12',
      expYear = '34',
      cvc = '123',
      zip = '12345',
      email,
    } = options;

    // Wait for Stripe iframe to load
    await this.page.waitForTimeout(2000);

    const cardFrame = this.page.frameLocator('iframe[name*="stripe"]').first();

    if (email) {
      await cardFrame.locator('input[type="email"]').fill(email);
    }

    await cardFrame.locator('[placeholder*="card number"]').fill(cardNumber);
    await cardFrame.locator('[placeholder*="MM"]').fill(expMonth);
    await cardFrame.locator('[placeholder*="YY"]').fill(expYear);
    await cardFrame.locator('[placeholder*="CVC"]').fill(cvc);
    
    const zipField = cardFrame.locator('[placeholder*="ZIP"], [placeholder*="postal"]');
    if (await zipField.count() > 0) {
      await zipField.fill(zip);
    }
  }

  /**
   * Submit Stripe Checkout form
   */
  async submitCheckout() {
    await this.page.getByRole('button', { name: /subscribe|pay|confirm/i }).click();
  }

  /**
   * Wait for Stripe Checkout to load
   */
  async waitForCheckoutLoad(url: string) {
    await this.page.waitForURL(url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify checkout session URL is valid Stripe URL
   */
  async verifyStripeCheckoutURL(url: string): Promise<boolean> {
    return url.includes('checkout.stripe.com');
  }

  /**
   * Mock Stripe webhook event
   * Useful for testing webhook handlers without actual Stripe calls
   */
  async mockWebhookEvent(eventType: string, data: any) {
    return await this.page.evaluate(
      async ({ eventType, data }) => {
        const response = await fetch('/api/webhooks/stripe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'stripe-signature': 'test-signature',
          },
          body: JSON.stringify({
            type: eventType,
            data,
          }),
        });
        return response.json();
      },
      { eventType, data }
    );
  }

  /**
   * Get checkout session status from test database
   * Requires direct database access or API endpoint
   */
  async getSubscriptionStatus(userId: string): Promise<any> {
    // This would need to be implemented based on your backend
    // Example using Supabase:
    return await this.page.evaluate(
      async (userId) => {
        const { supabase } = window as any;
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        return error ? null : data;
      },
      userId
    );
  }
}
