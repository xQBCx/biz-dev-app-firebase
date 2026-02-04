import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import { injectAxe, checkA11y } from 'axe-core/playwright';
import path from 'path';

/**
 * @intent smartlink-intake.md
 * End-to-end tests for SmartLink Property Intake feature
 * Covers CSV upload, validation, preview, and database import
 */

test.describe('SmartLink Property Intake', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('TC1: Navigate to SmartLink Intake page as authenticated user', async ({ page }) => {
    await test.step('Sign in as property manager', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
    });

    await test.step('Navigate to SmartLink intake page', async () => {
      await page.goto('/smartlink/intake');
      await expect(page).toHaveURL(/.*smartlink\/intake/);
    });

    await test.step('Verify upload interface is displayed', async () => {
      await expect(page.getByRole('heading', { name: /SmartLink Property Intake/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Upload CSV/i })).toBeVisible();
    });
  });

  test.fixme('TC2: Upload valid CSV file (Happy Path)', async ({ page }) => {
    await test.step('Sign in and navigate to intake page', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
    });

    await test.step('Upload valid properties CSV', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'valid-properties.csv');
      await page.setInputFiles('input[type="file"]', filePath);
    });

    await test.step('Verify data preview displays all properties', async () => {
      await expect(page.getByRole('table')).toBeVisible();
      const rows = page.getByRole('row');
      await expect(rows).toHaveCount(4); // 1 header + 3 data rows
    });

    await test.step('Import properties and verify success', async () => {
      await page.getByRole('button', { name: /Import Properties/i }).click();
      await expect(page.getByText(/Successfully imported 3 properties/i)).toBeVisible();
    });

    await test.step('Verify properties exist in database', async () => {
      await page.goto('/properties');
      await expect(page.getByText('123 Main St')).toBeVisible();
      await expect(page.getByText('456 Oak Ave')).toBeVisible();
      await expect(page.getByText('789 Elm Dr')).toBeVisible();
    });
  });

  test.fixme('TC3: Reject invalid file type', async ({ page }) => {
    await test.step('Sign in and navigate', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
    });

    await test.step('Attempt to upload non-CSV file', async () => {
      const txtFilePath = path.join(__dirname, 'fixtures', 'invalid-file.txt');
      await page.setInputFiles('input[type="file"]', txtFilePath);
    });

    await test.step('Verify error message for invalid file type', async () => {
      await expect(page.getByText(/Invalid file type.*CSV/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Import Properties/i })).toBeDisabled();
    });
  });

  test.fixme('TC4: Validate required columns', async ({ page }) => {
    await test.step('Sign in and navigate', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
    });

    await test.step('Upload CSV with missing required columns', async () => {
      const filePath = path.join(__dirname, 'fixtures', 'invalid-structure.csv');
      await page.setInputFiles('input[type="file"]', filePath);
    });

    await test.step('Verify validation error for missing columns', async () => {
      await expect(page.getByText(/Missing required columns.*state.*zip/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Import Properties/i })).toBeDisabled();
    });
  });

  test.fixme('TC5: Validate data types', async ({ page }) => {
    await test.step('Sign in and upload invalid data types CSV', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'invalid-data-types.csv');
      await page.setInputFiles('input[type="file"]', filePath);
    });

    await test.step('Verify invalid rows are highlighted with errors', async () => {
      const errorRow = page.locator('tr.error-row').first();
      await expect(errorRow).toBeVisible();
      await expect(page.getByText(/bedrooms.*must be a number/i)).toBeVisible();
      await expect(page.getByText(/bathrooms.*must be a number/i)).toBeVisible();
    });

    await test.step('Verify import button is disabled', async () => {
      await expect(page.getByRole('button', { name: /Import Properties/i })).toBeDisabled();
    });
  });

  test.fixme('TC6: Handle duplicate addresses', async ({ page }) => {
    await test.step('Sign in and upload CSV with duplicates', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'duplicate-addresses.csv');
      await page.setInputFiles('input[type="file"]', filePath);
    });

    await test.step('Verify duplicate warning is shown', async () => {
      await expect(page.getByText(/1 duplicate address found/i)).toBeVisible();
    });

    await test.step('Import and verify only 1 property saved', async () => {
      await page.getByRole('button', { name: /Import Properties/i }).click();
      await expect(page.getByText(/Successfully imported 1 property.*1 duplicate skipped/i)).toBeVisible();
    });
  });

  test.fixme('TC7: Empty CSV file handling', async ({ page }) => {
    await test.step('Sign in and upload empty CSV', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'empty-file.csv');
      await page.setInputFiles('input[type="file"]', filePath);
    });

    await test.step('Verify error for empty file', async () => {
      await expect(page.getByText(/CSV file is empty.*no data rows/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Import Properties/i })).toBeDisabled();
    });
  });

  test.fixme('TC8: File size limit enforcement (5MB)', async ({ page }) => {
    await test.step('Sign in and attempt large file upload', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      // Note: Need to generate a large file programmatically or use pre-created fixture
      const largeFilePath = path.join(__dirname, 'fixtures', 'oversized-file.csv');
      await page.setInputFiles('input[type="file"]', largeFilePath);
    });

    await test.step('Verify file size error', async () => {
      await expect(page.getByText(/File size exceeds 5MB limit/i)).toBeVisible();
    });
  });

  test.fixme('TC9: Maximum row limit (1000 properties)', async ({ page }) => {
    await test.step('Sign in and upload large CSV', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const largeFilePath = path.join(__dirname, 'fixtures', 'large-file.csv');
      await page.setInputFiles('input[type="file"]', largeFilePath);
    });

    await test.step('Verify row limit warning', async () => {
      await expect(page.getByText(/File contains.*rows.*Only first 1000.*imported/i)).toBeVisible();
    });

    await test.step('Verify preview shows max 1000 rows', async () => {
      const rows = page.getByRole('row');
      await expect(rows).toHaveCount(1001); // 1 header + 1000 data rows
    });
  });

  test.fixme('TC10: Data preview table functionality', async ({ page }) => {
    await test.step('Upload valid CSV and verify preview', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'valid-properties.csv');
      await page.setInputFiles('input[type="file"]', filePath);
    });

    await test.step('Verify all columns are visible', async () => {
      await expect(page.getByRole('columnheader', { name: /address/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /city/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /state/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /zip/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /bedrooms/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /bathrooms/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /sqft/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /price/i })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
    });

    await test.step('Verify data matches CSV content', async () => {
      await expect(page.getByText('123 Main St')).toBeVisible();
      await expect(page.getByText('Springfield')).toBeVisible();
      await expect(page.getByText('250000')).toBeVisible();
    });
  });

  test.fixme('TC11: Remove invalid rows from preview', async ({ page }) => {
    await test.step('Upload CSV with invalid rows', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'mixed-valid-invalid.csv');
      await page.setInputFiles('input[type="file"]', filePath);
    });

    await test.step('Remove invalid row', async () => {
      const removeButton = page.locator('tr.error-row button[aria-label="Remove"]').first();
      await removeButton.click();
    });

    await test.step('Verify import button becomes enabled', async () => {
      await expect(page.getByRole('button', { name: /Import Properties/i })).toBeEnabled();
    });

    await test.step('Import and verify only valid rows imported', async () => {
      await page.getByRole('button', { name: /Import Properties/i }).click();
      await expect(page.getByText(/Successfully imported 2 properties/i)).toBeVisible();
    });
  });

  test.fixme('TC12: Import history tracking', async ({ page }) => {
    await test.step('Upload and import valid CSV', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'valid-properties.csv');
      await page.setInputFiles('input[type="file"]', filePath);
      await page.getByRole('button', { name: /Import Properties/i }).click();
      await expect(page.getByText(/Successfully imported/i)).toBeVisible();
    });

    await test.step('Navigate to import history', async () => {
      await page.goto('/smartlink/history');
    });

    await test.step('Verify import record exists with correct details', async () => {
      await expect(page.getByText('valid-properties.csv')).toBeVisible();
      await expect(page.getByText(/Total.*3/i)).toBeVisible();
      await expect(page.getByText(/Successful.*3/i)).toBeVisible();
      await expect(page.getByText(/Failed.*0/i)).toBeVisible();
      await expect(page.getByText(/Status.*success/i)).toBeVisible();
    });
  });

  test.fixme('TC13: Import with partial failures', async ({ page }) => {
    await test.step('Upload mixed CSV and remove invalid rows', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'mixed-valid-invalid.csv');
      await page.setInputFiles('input[type="file"]', filePath);
      const removeButton = page.locator('tr.error-row button[aria-label="Remove"]').first();
      await removeButton.click();
      await page.getByRole('button', { name: /Import Properties/i }).click();
      await expect(page.getByText(/Successfully imported/i)).toBeVisible();
    });

    await test.step('Check history for partial status', async () => {
      await page.goto('/smartlink/history');
      await expect(page.getByText(/Status.*partial/i)).toBeVisible();
      await expect(page.getByText(/Failed.*1/i)).toBeVisible();
    });
  });

  test('TC14: Unauthenticated access prevention', async ({ page }) => {
    await test.step('Navigate to intake page without authentication', async () => {
      await page.goto('/smartlink/intake');
    });

    await test.step('Verify redirect to auth page', async () => {
      await expect(page).toHaveURL(/.*auth/);
      await expect(page.getByText(/Please sign in/i)).toBeVisible();
    });
  });

  test.fixme('TC15: Performance test (1000 rows)', async ({ page }) => {
    await test.step('Upload large CSV and measure parse time', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const largeFilePath = path.join(__dirname, 'fixtures', 'large-file.csv');
      
      const parseStartTime = Date.now();
      await page.setInputFiles('input[type="file"]', largeFilePath);
      await expect(page.getByRole('table')).toBeVisible();
      const parseEndTime = Date.now();
      const parseTime = parseEndTime - parseStartTime;
      
      expect(parseTime).toBeLessThan(2000); // < 2 seconds
    });

    await test.step('Import and measure total time', async () => {
      const importStartTime = Date.now();
      await page.getByRole('button', { name: /Import Properties/i }).click();
      await expect(page.getByText(/Successfully imported/i)).toBeVisible();
      const importEndTime = Date.now();
      const importTime = importEndTime - importStartTime;
      
      expect(importTime).toBeLessThan(5000); // < 5 seconds
    });
  });

  test.fixme('TC16: Progress indicator during import', async ({ page }) => {
    await test.step('Upload large CSV and start import', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const largeFilePath = path.join(__dirname, 'fixtures', 'large-file.csv');
      await page.setInputFiles('input[type="file"]', largeFilePath);
      await page.getByRole('button', { name: /Import Properties/i }).click();
    });

    await test.step('Verify progress indicator displays', async () => {
      await expect(page.getByRole('button', { name: /Importing/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Importing/i })).toBeDisabled();
      // Check for spinner or progress bar
      await expect(page.locator('[role="progressbar"], .spinner, .loading')).toBeVisible();
    });

    await test.step('Verify success message after completion', async () => {
      await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.fixme('TC17: Network failure during import', async ({ page }) => {
    await test.step('Upload CSV and simulate network failure', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'valid-properties.csv');
      await page.setInputFiles('input[type="file"]', filePath);
      
      // Simulate offline
      await page.context().setOffline(true);
      await page.getByRole('button', { name: /Import Properties/i }).click();
    });

    await test.step('Verify error handling', async () => {
      await expect(page.getByText(/Import failed.*connection.*retry/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Retry/i })).toBeVisible();
    });

    await test.step('Verify no partial data saved', async () => {
      await page.context().setOffline(false);
      await page.goto('/properties');
      // Should not see the properties from failed import
      await expect(page.getByText('123 Main St')).not.toBeVisible();
    });
  });

  test.fixme('TC18: Concurrent upload prevention', async ({ page }) => {
    await test.step('Start first upload', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'large-file.csv');
      await page.setInputFiles('input[type="file"]', filePath);
      await page.getByRole('button', { name: /Import Properties/i }).click();
    });

    await test.step('Attempt second upload while first in progress', async () => {
      const secondFilePath = path.join(__dirname, 'fixtures', 'valid-properties.csv');
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeDisabled();
      // Or verify message
      await expect(page.getByText(/Import in progress.*wait/i)).toBeVisible();
    });
  });

  test.fixme('TC19: Property list real-time update', async ({ page, context }) => {
    await test.step('Open property list in first tab', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/properties');
      const initialCount = await page.locator('.property-card').count();
      
      // Open second tab for import
      const importPage = await context.newPage();
      await importPage.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'valid-properties.csv');
      await importPage.setInputFiles('input[type="file"]', filePath);
      await importPage.getByRole('button', { name: /Import Properties/i }).click();
      await expect(importPage.getByText(/Successfully imported/i)).toBeVisible();
    });

    await test.step('Verify property list updates without refresh', async () => {
      // Wait for real-time update
      await page.waitForTimeout(1000);
      const updatedCount = await page.locator('.property-card').count();
      expect(updatedCount).toBeGreaterThan(0);
      await expect(page.getByText('123 Main St')).toBeVisible();
    });
  });

  test.fixme('TC20: Download error report', async ({ page }) => {
    await test.step('Import CSV with failures', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      const filePath = path.join(__dirname, 'fixtures', 'mixed-valid-invalid.csv');
      await page.setInputFiles('input[type="file"]', filePath);
      const removeButton = page.locator('tr.error-row button[aria-label="Remove"]').first();
      await removeButton.click();
      await page.getByRole('button', { name: /Import Properties/i }).click();
      await expect(page.getByText(/Successfully imported/i)).toBeVisible();
    });

    await test.step('Download error report from history', async () => {
      await page.goto('/smartlink/history');
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('link', { name: /Download Error Report/i }).click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toMatch(/import-errors-.*\.csv/);
    });
  });

  test('TC21: Accessibility check on intake page', async ({ page }) => {
    await test.step('Sign in and navigate to intake page', async () => {
      await authHelper.signIn(
        process.env.TEST_USER_EMAIL || 'test-property-manager@example.com',
        process.env.TEST_USER_PASSWORD || 'TestPass123!'
      );
      await page.goto('/smartlink/intake');
      await injectAxe(page);
    });

    await test.step('Run accessibility checks', async () => {
      await checkA11y(page, undefined, {
        detailedReport: true,
        detailedReportOptions: {
          html: true,
        },
      });
    });
  });
});
