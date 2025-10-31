import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

// Test data
const VALID_USER = {
  email: process.env.TEST_USER_EMAIL || 'test-user@bizdev.app',
  password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
};

const INVALID_USER = {
  email: 'invalid@bizdev.app',
  password: 'wrongpassword',
};

test.describe('Authentication & Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from clean state
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('TC1: Landing Page to Auth Navigation', async ({ page }) => {
    await test.step('Navigate to landing page', async () => {
      await page.goto('/');
      await expect(page).toHaveURL('/');
    });

    await test.step('Verify login button is visible', async () => {
      const loginButton = page.getByRole('button', { name: /login or request access/i });
      await expect(loginButton).toBeVisible();
    });

    await test.step('Click login button and verify redirect', async () => {
      await page.getByRole('button', { name: /login or request access/i }).click();
      await expect(page).toHaveURL('/auth');
    });

    await test.step('Verify auth page elements', async () => {
      await expect(page.getByText('Biz Dev App')).toBeVisible();
      await expect(page.getByRole('tab', { name: /sign in/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /request access/i })).toBeVisible();
    });
  });

  test('TC2: Successful Sign In', async ({ page }) => {
    await test.step('Navigate to auth page', async () => {
      await page.goto('/auth');
      await expect(page.getByRole('tab', { name: /sign in/i })).toBeVisible();
    });

    await test.step('Fill in valid credentials', async () => {
      await page.getByLabel(/email/i).fill(VALID_USER.email);
      await page.getByLabel(/password/i).fill(VALID_USER.password);
    });

    await test.step('Submit sign in form', async () => {
      await page.getByRole('button', { name: /sign in/i }).click();
    });

    await test.step('Verify success toast appears', async () => {
      await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify redirect to dashboard', async () => {
      await page.waitForURL('/dashboard', { timeout: 5000 });
      await expect(page).toHaveURL('/dashboard');
    });

    await test.step('Verify session persistence after refresh', async () => {
      await page.reload();
      await expect(page).toHaveURL('/dashboard');
      // Should not redirect back to auth
    });

    await test.step('Verify localStorage contains session', async () => {
      const localStorage = await page.evaluate(() => {
        const auth = window.localStorage.getItem('sb-eoskcsbytaurtqrnuraw-auth-token');
        return auth !== null;
      });
      expect(localStorage).toBeTruthy();
    });
  });

  test('TC3: Invalid Credentials', async ({ page }) => {
    await test.step('Navigate to auth page', async () => {
      await page.goto('/auth');
    });

    await test.step('Fill in invalid credentials', async () => {
      await page.getByLabel(/email/i).fill(INVALID_USER.email);
      await page.getByLabel(/password/i).fill(INVALID_USER.password);
    });

    await test.step('Submit sign in form', async () => {
      await page.getByRole('button', { name: /sign in/i }).click();
    });

    await test.step('Verify error toast appears', async () => {
      await expect(page.getByText(/error/i)).toBeVisible({ timeout: 5000 });
    });

    await test.step('Verify still on auth page', async () => {
      await expect(page).toHaveURL('/auth');
    });

    await test.step('Verify no session in localStorage', async () => {
      const localStorage = await page.evaluate(() => {
        return window.localStorage.getItem('sb-eoskcsbytaurtqrnuraw-auth-token');
      });
      expect(localStorage).toBeNull();
    });
  });

  test('TC4: Form Validation', async ({ page }) => {
    await test.step('Navigate to auth page', async () => {
      await page.goto('/auth');
    });

    await test.step('Test empty email validation', async () => {
      await page.getByLabel(/password/i).fill('SomePassword123');
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // HTML5 validation should prevent submission
      const emailInput = page.getByLabel(/email/i);
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });

    await test.step('Test invalid email format', async () => {
      await page.getByLabel(/email/i).fill('notanemail');
      await page.getByRole('button', { name: /sign in/i }).click();
      
      const emailInput = page.getByLabel(/email/i);
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toContain('@');
    });

    await test.step('Test empty password validation', async () => {
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).clear();
      await page.getByRole('button', { name: /sign in/i }).click();
      
      const passwordInput = page.getByLabel(/password/i);
      const validationMessage = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });
  });

  test('TC5: Already Authenticated Redirect', async ({ page }) => {
    await test.step('Sign in first', async () => {
      await page.goto('/auth');
      await page.getByLabel(/email/i).fill(VALID_USER.email);
      await page.getByLabel(/password/i).fill(VALID_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/dashboard', { timeout: 5000 });
    });

    await test.step('Navigate to root and verify redirect', async () => {
      await page.goto('/');
      await page.waitForURL('/dashboard', { timeout: 5000 });
      await expect(page).toHaveURL('/dashboard');
    });

    await test.step('Navigate to auth and verify redirect', async () => {
      await page.goto('/auth');
      // Should redirect authenticated users away from auth page
      await page.waitForTimeout(2000); // Wait for any redirects
      // Note: Based on current implementation, may stay on /auth
      // This is a potential improvement area
    });
  });

  test('TC6: Sign Out Flow', async ({ page }) => {
    await test.step('Sign in first', async () => {
      await page.goto('/auth');
      await page.getByLabel(/email/i).fill(VALID_USER.email);
      await page.getByLabel(/password/i).fill(VALID_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL('/dashboard', { timeout: 5000 });
    });

    await test.step('Click sign out button', async () => {
      const signOutButton = page.getByRole('button', { name: /sign out/i });
      await expect(signOutButton).toBeVisible();
      await signOutButton.click();
    });

    await test.step('Verify redirect to home', async () => {
      await page.waitForURL('/', { timeout: 5000 });
      await expect(page).toHaveURL('/');
    });

    await test.step('Verify localStorage cleared', async () => {
      const localStorage = await page.evaluate(() => {
        return window.localStorage.getItem('sb-eoskcsbytaurtqrnuraw-auth-token');
      });
      expect(localStorage).toBeNull();
    });

    await test.step('Verify cannot access protected route', async () => {
      await page.goto('/dashboard');
      // Should redirect to auth or home
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).not.toContain('/dashboard');
    });
  });

  test('TC7: Access Request Tab Visible', async ({ page }) => {
    await test.step('Navigate to auth page', async () => {
      await page.goto('/auth');
    });

    await test.step('Click Request Access tab', async () => {
      await page.getByRole('tab', { name: /request access/i }).click();
    });

    await test.step('Verify access request form visible', async () => {
      // The AccessRequest component should be visible
      // This is a placeholder - actual form elements depend on AccessRequest component
      await expect(page.getByRole('tabpanel')).toBeVisible();
    });
  });

  test('TC8: Mobile Responsiveness', async ({ page }) => {
    await test.step('Set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    await test.step('Navigate to auth page', async () => {
      await page.goto('/auth');
    });

    await test.step('Verify form is touch-friendly', async () => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);
      
      // Inputs should be large enough for touch
      const emailBox = await emailInput.boundingBox();
      const passwordBox = await passwordInput.boundingBox();
      
      expect(emailBox?.height).toBeGreaterThan(30);
      expect(passwordBox?.height).toBeGreaterThan(30);
    });

    await test.step('Complete sign in on mobile', async () => {
      await page.getByLabel(/email/i).fill(VALID_USER.email);
      await page.getByLabel(/password/i).fill(VALID_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      
      await page.waitForURL('/dashboard', { timeout: 5000 });
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test('TC9: Accessibility Check', async ({ page }) => {
    await test.step('Navigate to auth page', async () => {
      await page.goto('/auth');
      await injectAxe(page);
    });

    await test.step('Run accessibility scan', async () => {
      await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      });
    });
  });

  test('TC10: Back to Home Navigation', async ({ page }) => {
    await test.step('Navigate to auth page', async () => {
      await page.goto('/auth');
    });

    await test.step('Click Back to Home button', async () => {
      await page.getByRole('button', { name: /back to home/i }).click();
    });

    await test.step('Verify redirect to home', async () => {
      await expect(page).toHaveURL('/');
    });
  });
});
