import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import AxeBuilder from '@axe-core/playwright';

test.describe('Admin Panel & Access Requests', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.clearAuth();
  });

  test.describe('Access Request Submission (Unauthenticated)', () => {
    test('should navigate to request form from auth page', async ({ page }) => {
      await test.step('Navigate to auth page', async () => {
        await page.goto('/auth');
        await expect(page).toHaveURL('/auth');
      });

      await test.step('Find and click Request Access link', async () => {
        const requestLink = page.getByRole('link', { name: /request access/i });
        await expect(requestLink).toBeVisible();
        await requestLink.click();
      });

      await test.step('Verify request form displayed', async () => {
        await expect(page.getByLabel(/full name/i)).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
      });
    });

    test('should submit valid complete access request', async ({ page }) => {
      await test.step('Navigate to request form', async () => {
        await page.goto('/auth');
        // Assuming form is on auth page or accessible via button
        const requestButton = page.getByRole('button', { name: /request access/i });
        if (await requestButton.isVisible().catch(() => false)) {
          await requestButton.click();
        }
      });

      await test.step('Fill complete request form', async () => {
        await page.getByLabel(/full name/i).fill('Jane Smith');
        await page.getByLabel(/email/i).fill(`jane.smith.${Date.now()}@example.com`);
        const companyField = page.getByLabel(/company/i);
        if (await companyField.isVisible().catch(() => false)) {
          await companyField.fill('Acme Corp');
        }
        const reasonField = page.getByLabel(/reason/i);
        if (await reasonField.isVisible().catch(() => false)) {
          await reasonField.fill('Need access for project management');
        }
      });

      await test.step('Submit form', async () => {
        await page.getByRole('button', { name: /submit/i }).click();
      });

      await test.step('Verify success confirmation', async () => {
        await expect(page.getByText(/request submitted|thank you|success/i)).toBeVisible({ timeout: 10000 });
      });
    });

    test('should submit minimal valid request (required fields only)', async ({ page }) => {
      await test.step('Navigate to request form', async () => {
        await page.goto('/auth');
      });

      await test.step('Fill only required fields', async () => {
        await page.getByLabel(/full name/i).fill('John Doe');
        await page.getByLabel(/email/i).fill(`john.doe.${Date.now()}@example.com`);
      });

      await test.step('Submit form', async () => {
        await page.getByRole('button', { name: /submit/i }).click();
      });

      await test.step('Verify success', async () => {
        await expect(page.getByText(/request submitted|thank you|success/i)).toBeVisible({ timeout: 10000 });
      });
    });

    test('should show validation error for missing name', async ({ page }) => {
      await page.goto('/auth');

      await test.step('Fill only email field', async () => {
        await page.getByLabel(/email/i).fill('test@example.com');
      });

      await test.step('Try to submit', async () => {
        await page.getByRole('button', { name: /submit/i }).click();
      });

      await test.step('Verify validation error shown', async () => {
        await expect(page.getByText(/name.*required|please enter.*name/i)).toBeVisible();
      });
    });

    test('should show validation error for missing email', async ({ page }) => {
      await page.goto('/auth');

      await test.step('Fill only name field', async () => {
        await page.getByLabel(/full name/i).fill('Test User');
      });

      await test.step('Try to submit', async () => {
        await page.getByRole('button', { name: /submit/i }).click();
      });

      await test.step('Verify validation error shown', async () => {
        await expect(page.getByText(/email.*required|please enter.*email/i)).toBeVisible();
      });
    });

    test('should show validation error for invalid email format', async ({ page }) => {
      await page.goto('/auth');

      await test.step('Fill fields with invalid email', async () => {
        await page.getByLabel(/full name/i).fill('Test User');
        await page.getByLabel(/email/i).fill('not-an-email');
      });

      await test.step('Try to submit', async () => {
        await page.getByRole('button', { name: /submit/i }).click();
      });

      await test.step('Verify email validation error', async () => {
        await expect(page.getByText(/invalid.*email|valid email address/i)).toBeVisible();
      });
    });

    test.fixme('should handle duplicate email request gracefully', async ({ page }) => {
      // TODO: Submit request twice with same email and verify behavior
      // Expected: Error message or request updated instead of duplicate
    });
  });

  test.describe('Admin Panel Access Control', () => {
    test('should allow admin to access admin panel', async ({ page }) => {
      await test.step('Sign in as admin', async () => {
        await authHelper.signIn('admin@test.com', 'testpassword123');
      });

      await test.step('Navigate to admin panel', async () => {
        await page.goto('/admin');
        await expect(page).toHaveURL('/admin');
      });

      await test.step('Verify admin panel content visible', async () => {
        await expect(page.getByText(/admin panel|administration/i)).toBeVisible();
      });
    });

    test('should redirect non-admin users from admin panel', async ({ page }) => {
      await test.step('Sign in as regular user', async () => {
        await authHelper.signIn('user@test.com', 'testpassword123');
      });

      await test.step('Try to access admin panel', async () => {
        await page.goto('/admin');
      });

      await test.step('Verify redirected to dashboard', async () => {
        await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
      });

      await test.step('Verify access denied message', async () => {
        await expect(page.getByText(/not authorized|admin.*required|access denied/i)).toBeVisible();
      });
    });

    test('should redirect unauthenticated users to auth page', async ({ page }) => {
      await test.step('Navigate to admin panel without auth', async () => {
        await page.goto('/admin');
      });

      await test.step('Verify redirected to auth', async () => {
        await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
      });
    });
  });

  test.describe('Access Request Management (Admin)', () => {
    test.fixme('should display all pending access requests', async ({ page }) => {
      await test.step('Sign in as admin', async () => {
        await authHelper.signIn('admin@test.com', 'testpassword123');
      });

      await test.step('Navigate to admin panel', async () => {
        await page.goto('/admin');
      });

      await test.step('Verify access request section visible', async () => {
        await expect(page.getByText(/access requests|pending requests/i)).toBeVisible();
      });

      await test.step('Verify request details shown', async () => {
        // Should show name, email, company, reason, date
        await expect(page.getByText(/name|email/i)).toBeVisible();
      });
    });

    test.fixme('should approve access request successfully', async ({ page }) => {
      await test.step('Sign in as admin', async () => {
        await authHelper.signIn('admin@test.com', 'testpassword123');
      });

      await test.step('Navigate to admin panel', async () => {
        await page.goto('/admin');
      });

      await test.step('Find pending request', async () => {
        // Locate first pending request
      });

      await test.step('Click approve button', async () => {
        await page.getByRole('button', { name: /approve/i }).first().click();
      });

      await test.step('Verify success message', async () => {
        await expect(page.getByText(/approved|success/i)).toBeVisible();
      });

      await test.step('Verify request removed from pending list', async () => {
        // Request should no longer appear in pending section
      });
    });

    test.fixme('should deny access request successfully', async ({ page }) => {
      await test.step('Sign in as admin', async () => {
        await authHelper.signIn('admin@test.com', 'testpassword123');
      });

      await test.step('Navigate to admin panel', async () => {
        await page.goto('/admin');
      });

      await test.step('Find pending request', async () => {
        // Locate first pending request
      });

      await test.step('Click deny button', async () => {
        await page.getByRole('button', { name: /deny|reject/i }).first().click();
      });

      await test.step('Verify success message', async () => {
        await expect(page.getByText(/denied|rejected|success/i)).toBeVisible();
      });
    });

    test.fixme('should filter requests by status', async ({ page }) => {
      // TODO: Test filtering by pending/approved/denied
    });

    test.fixme('should search requests by name or email', async ({ page }) => {
      // TODO: Test search functionality
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should render request form correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await test.step('Navigate to request form', async () => {
        await page.goto('/auth');
      });

      await test.step('Verify form elements visible and accessible', async () => {
        await expect(page.getByLabel(/full name/i)).toBeVisible();
        await expect(page.getByLabel(/email/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /submit/i })).toBeVisible();
      });

      await test.step('Verify form is usable on mobile', async () => {
        await page.getByLabel(/full name/i).fill('Mobile User');
        await page.getByLabel(/email/i).fill('mobile@example.com');
        // Form should be fillable without horizontal scrolling
      });
    });

    test.fixme('should render admin panel correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await test.step('Sign in as admin', async () => {
        await authHelper.signIn('admin@test.com', 'testpassword123');
      });

      await test.step('Navigate to admin panel', async () => {
        await page.goto('/admin');
      });

      await test.step('Verify responsive layout', async () => {
        // Requests should be in card/list format
        // Action buttons should be accessible
      });
    });
  });

  test.describe('Accessibility', () => {
    test('request form should have no accessibility violations', async ({ page }) => {
      await page.goto('/auth');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test.fixme('admin panel should have no accessibility violations', async ({ page }) => {
      await authHelper.signIn('admin@test.com', 'testpassword123');
      await page.goto('/admin');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should support keyboard navigation on request form', async ({ page }) => {
      await page.goto('/auth');

      await test.step('Tab through form fields', async () => {
        await page.keyboard.press('Tab');
        await expect(page.getByLabel(/full name/i)).toBeFocused();
        
        await page.keyboard.press('Tab');
        await expect(page.getByLabel(/email/i)).toBeFocused();
      });

      await test.step('Fill and submit via keyboard', async () => {
        await page.getByLabel(/full name/i).fill('Keyboard User');
        await page.keyboard.press('Tab');
        await page.getByLabel(/email/i).fill('keyboard@example.com');
        await page.keyboard.press('Enter');
      });
    });
  });

  test.describe('Error Handling', () => {
    test.fixme('should handle network failure gracefully', async ({ page }) => {
      // TODO: Simulate network failure during request submission
      // Expected: Error message shown, form data preserved, user can retry
    });

    test.fixme('should prevent SQL injection in form fields', async ({ page }) => {
      await page.goto('/auth');

      await test.step('Enter SQL injection attempt', async () => {
        await page.getByLabel(/full name/i).fill("'; DROP TABLE access_requests; --");
        await page.getByLabel(/email/i).fill('hacker@example.com');
      });

      await test.step('Submit form', async () => {
        await page.getByRole('button', { name: /submit/i }).click();
      });

      await test.step('Verify request handled safely', async () => {
        // Should either be sanitized or rejected, but not execute SQL
        // Table should still exist and be queryable
      });
    });

    test.fixme('should handle admin session timeout', async ({ page }) => {
      // TODO: Test admin session expiring during action
      // Expected: Redirect to auth with error message
    });
  });
});
