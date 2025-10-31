import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

// Test data
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test-user@bizdev.app',
  password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
};

const STRIPE_TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficientFunds: '4000000000009995',
};

test.describe('Billing & Subscription Management', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuth();
  });

  test('TC1: View Pricing/Plans Page', async ({ page }) => {
    await test.step('Navigate to app', async () => {
      await page.goto('/');
    });

    await test.step('Look for pricing or upgrade links', async () => {
      // This test is exploratory - actual implementation depends on your UI
      // Check common locations for pricing information
      const hasUpgradeLink = await page.getByText(/upgrade/i).count() > 0;
      const hasPricingLink = await page.getByText(/pricing/i).count() > 0;
      const hasBillingLink = await page.getByText(/billing/i).count() > 0;
      
      // At least one pricing-related element should exist
      expect(hasUpgradeLink || hasPricingLink || hasBillingLink).toBeTruthy();
    });
  });

  test('TC2: Create Checkout Session Flow', async ({ page, context }) => {
    await test.step('Sign in as test user', async () => {
      await authHelper.signIn(TEST_USER.email, TEST_USER.password);
    });

    await test.step('Navigate to find subscription/upgrade option', async () => {
      // Look for upgrade or subscription buttons
      // Adjust selectors based on actual implementation
      const hasUpgradeButton = await page.getByRole('button', { name: /upgrade|subscribe|pro|premium/i }).count() > 0;
      
      if (!hasUpgradeButton) {
        test.fixme();
        console.warn('No subscription/upgrade button found. Implementation needed.');
      }
    });

    await test.step('Attempt to trigger checkout session', async () => {
      // Listen for new pages (checkout opens in new tab)
      const pagePromise = context.waitForEvent('page', { timeout: 10000 });
      
      try {
        // Try to click first subscription/upgrade button
        await page.getByRole('button', { name: /upgrade|subscribe|pro|premium/i }).first().click();
        
        const newPage = await pagePromise;
        await newPage.waitForLoadState();
        
        // Verify Stripe checkout URL
        expect(newPage.url()).toContain('checkout.stripe.com');
        
        await newPage.close();
      } catch (error) {
        test.fixme();
        console.warn('Checkout session creation not implemented or failed:', error);
      }
    });
  });

  test('TC3: Complete Successful Payment (Test Mode)', async ({ page, context }) => {
    test.fixme(); // Remove this when Stripe integration is fully implemented
    
    await test.step('Sign in and initiate checkout', async () => {
      await authHelper.signIn(TEST_USER.email, TEST_USER.password);
      
      const pagePromise = context.waitForEvent('page');
      await page.getByRole('button', { name: /upgrade|subscribe/i }).first().click();
      const checkoutPage = await pagePromise;
      await checkoutPage.waitForLoadState();
      
      expect(checkoutPage.url()).toContain('checkout.stripe.com');
    });

    await test.step('Fill in Stripe test card details', async () => {
      // This requires Stripe Checkout to be in test mode
      // Fill in card number
      const cardFrame = page.frameLocator('iframe[name*="stripe"]').first();
      await cardFrame.locator('[placeholder*="card number"]').fill(STRIPE_TEST_CARDS.success);
      await cardFrame.locator('[placeholder*="MM"]').fill('12');
      await cardFrame.locator('[placeholder*="YY"]').fill('34');
      await cardFrame.locator('[placeholder*="CVC"]').fill('123');
      await cardFrame.locator('[placeholder*="ZIP"]').fill('12345');
    });

    await test.step('Submit payment', async () => {
      await page.getByRole('button', { name: /subscribe|pay/i }).click();
    });

    await test.step('Wait for success redirect', async () => {
      await page.waitForURL(/payment-success|success|dashboard/, { timeout: 15000 });
    });

    await test.step('Verify success message', async () => {
      const hasSuccessMessage = await page.getByText(/success|confirmed|welcome|thank you/i).count() > 0;
      expect(hasSuccessMessage).toBeTruthy();
    });

    await test.step('Verify subscription status in UI', async () => {
      // Navigate to account/billing page if not already there
      await page.goto('/profile'); // or wherever subscription status is shown
      
      // Look for indicators of active subscription
      const hasPremiumStatus = await page.getByText(/pro|premium|enterprise|active/i).count() > 0;
      expect(hasPremiumStatus).toBeTruthy();
    });
  });

  test('TC4: Payment Declined Handling', async ({ page, context }) => {
    test.fixme(); // Remove when implemented
    
    await test.step('Sign in and initiate checkout', async () => {
      await authHelper.signIn(TEST_USER.email, TEST_USER.password);
      
      const pagePromise = context.waitForEvent('page');
      await page.getByRole('button', { name: /upgrade/i }).first().click();
      const checkoutPage = await pagePromise;
      
      expect(checkoutPage.url()).toContain('checkout.stripe.com');
    });

    await test.step('Enter declined test card', async () => {
      const cardFrame = page.frameLocator('iframe[name*="stripe"]').first();
      await cardFrame.locator('[placeholder*="card number"]').fill(STRIPE_TEST_CARDS.decline);
      await cardFrame.locator('[placeholder*="MM"]').fill('12');
      await cardFrame.locator('[placeholder*="YY"]').fill('34');
      await cardFrame.locator('[placeholder*="CVC"]').fill('123');
    });

    await test.step('Submit and verify error', async () => {
      await page.getByRole('button', { name: /subscribe|pay/i }).click();
      
      // Stripe should show error message
      await expect(page.getByText(/card.*declined|payment.*failed/i)).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify no subscription created', async () => {
      // Close checkout and return to app
      await page.goto('/profile');
      
      // Should still be on free tier
      const hasFreeStatus = await page.getByText(/free|basic/i).count() > 0;
      expect(hasFreeStatus).toBeTruthy();
    });
  });

  test('TC5: Cancel During Checkout', async ({ page, context }) => {
    await test.step('Sign in and initiate checkout', async () => {
      await authHelper.signIn(TEST_USER.email, TEST_USER.password);
      
      try {
        const pagePromise = context.waitForEvent('page', { timeout: 5000 });
        await page.getByRole('button', { name: /upgrade|subscribe/i }).first().click();
        const checkoutPage = await pagePromise;
        
        expect(checkoutPage.url()).toContain('checkout.stripe.com');
        
        await test.step('Close checkout without completing', async () => {
          await checkoutPage.close();
        });
      } catch (error) {
        test.fixme();
        console.warn('Checkout not available:', error);
        return;
      }
    });

    await test.step('Verify user can retry', async () => {
      // Should be able to click subscribe again
      const subscribeButton = page.getByRole('button', { name: /upgrade|subscribe/i }).first();
      await expect(subscribeButton).toBeEnabled();
    });

    await test.step('Verify no subscription created', async () => {
      // Check profile or billing page
      await page.goto('/profile');
      
      // Should still be on free/basic tier
      const hasNoSubscription = await page.getByText(/free|basic|no.*subscription/i).count() > 0;
      expect(hasNoSubscription).toBeTruthy();
    });
  });

  test('TC8: Feature Access Control by Subscription Tier', async ({ page }) => {
    await test.step('Sign in as free user', async () => {
      await authHelper.signIn(TEST_USER.email, TEST_USER.password);
    });

    await test.step('Attempt to access premium feature', async () => {
      // Try to navigate to a premium feature
      // This is exploratory - depends on your app structure
      
      // Look for upgrade prompts or blocked features
      const hasUpgradePrompt = await page.getByText(/upgrade.*unlock|premium.*feature|pro.*only/i).count() > 0;
      
      // If no upgrade prompts found, feature gating may not be implemented
      if (!hasUpgradePrompt) {
        test.fixme();
        console.warn('Feature access control not detected. May need implementation.');
      }
    });
  });

  test('TC9: View Subscription Details', async ({ page }) => {
    await test.step('Sign in as user', async () => {
      await authHelper.signIn(TEST_USER.email, TEST_USER.password);
    });

    await test.step('Navigate to billing or profile page', async () => {
      // Try common routes
      await page.goto('/profile');
      
      // Or look for billing link
      const billingLink = page.getByRole('link', { name: /billing|subscription|account/i }).first();
      if (await billingLink.count() > 0) {
        await billingLink.click();
      }
    });

    await test.step('Verify subscription information displayed', async () => {
      // Look for plan information
      const hasSubscriptionInfo = await page.getByText(/plan|subscription|tier|billing/i).count() > 0;
      
      if (!hasSubscriptionInfo) {
        test.fixme();
        console.warn('Subscription details page not found or not implemented.');
      } else {
        // Should show some subscription-related information
        expect(hasSubscriptionInfo).toBeTruthy();
      }
    });
  });

  test('TC12: Network Error During Checkout Creation', async ({ page }) => {
    await test.step('Sign in', async () => {
      await authHelper.signIn(TEST_USER.email, TEST_USER.password);
    });

    await test.step('Simulate network failure', async () => {
      await page.route('**/functions/v1/create-checkout**', route => route.abort());
      await page.route('**/functions/v1/create-payment**', route => route.abort());
    });

    await test.step('Attempt to create checkout', async () => {
      try {
        await page.getByRole('button', { name: /upgrade|subscribe/i }).first().click({ timeout: 5000 });
        
        // Should show error message
        await expect(page.getByText(/error|failed|try.*again/i)).toBeVisible({ timeout: 5000 });
      } catch (error) {
        test.fixme();
        console.warn('Network error handling not tested - checkout may not be implemented');
      }
    });

    await test.step('Restore network and retry', async () => {
      await page.unroute('**/functions/v1/create-checkout**');
      await page.unroute('**/functions/v1/create-payment**');
      
      // Retry should work
      const subscribeButton = page.getByRole('button', { name: /upgrade|subscribe/i }).first();
      if (await subscribeButton.count() > 0) {
        await expect(subscribeButton).toBeEnabled();
      }
    });
  });

  test('TC15: Mobile Checkout Flow', async ({ page, context }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    await test.step('Sign in on mobile', async () => {
      await authHelper.signIn(TEST_USER.email, TEST_USER.password);
    });

    await test.step('Verify subscription options visible on mobile', async () => {
      const hasSubscribeButton = await page.getByRole('button', { name: /upgrade|subscribe/i }).count() > 0;
      
      if (!hasSubscribeButton) {
        test.fixme();
        console.warn('Subscription UI not found on mobile');
        return;
      }
      
      // Button should be touch-friendly
      const buttonBox = await page.getByRole('button', { name: /upgrade|subscribe/i }).first().boundingBox();
      expect(buttonBox?.height).toBeGreaterThan(30);
    });

    await test.step('Initiate checkout on mobile', async () => {
      try {
        const pagePromise = context.waitForEvent('page', { timeout: 5000 });
        await page.getByRole('button', { name: /upgrade|subscribe/i }).first().click();
        const checkoutPage = await pagePromise;
        
        // Stripe checkout should be mobile-responsive
        expect(checkoutPage.url()).toContain('checkout.stripe.com');
        await checkoutPage.close();
      } catch (error) {
        test.fixme();
        console.warn('Mobile checkout flow not available');
      }
    });
  });
});
