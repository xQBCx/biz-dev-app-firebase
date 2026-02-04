# E2E Tests for Biz Dev App

## Overview
Intent-driven end-to-end tests using Playwright to verify that all features work as specified.

## Setup

### Install Dependencies
```bash
npm install
npx playwright install --with-deps
```

### Environment Variables
Create a `.env.test` file:
```
TEST_USER_EMAIL=test-user@bizdev.app
TEST_USER_PASSWORD=TestPass123!
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

## Running Tests

### All Tests
```bash
npx playwright test
```

### Specific Suite
```bash
npx playwright test auth.spec.ts
```

### Debug Mode
```bash
npx playwright test --debug
```

### UI Mode
```bash
npx playwright test --ui
```

### Headed Mode
```bash
npx playwright test --headed
```

## Viewing Reports
```bash
npx playwright show-report
```

## Test Structure

```
tests/e2e/
├── auth.spec.ts              # Authentication tests
├── helpers/
│   └── auth.helper.ts        # Reusable auth utilities
├── reports/                  # Generated reports
│   ├── html/                # HTML reports
│   └── summary-*.md         # Markdown summaries
└── README.md                # This file
```

## Writing Tests

### Intent-Driven Style
Use `test.step()` to describe the PURPOSE of each action:

```typescript
test('User can complete checkout', async ({ page }) => {
  await test.step('Navigate to product page', async () => {
    await page.goto('/products/123');
  });
  
  await test.step('Add product to cart', async () => {
    await page.getByRole('button', { name: /add to cart/i }).click();
    // Assert cart count increased
    await expect(page.getByTestId('cart-count')).toHaveText('1');
  });
});
```

### Assertions
Assert INTENT, not just presence:

```typescript
// ❌ Bad - just checks element exists
await expect(page.locator('.confirmation')).toBeVisible();

// ✅ Good - verifies business outcome
await expect(page.getByText(/order confirmed/i)).toBeVisible();
// AND verify database state if critical
const order = await db.orders.findOne({ userId: testUser.id });
expect(order.status).toBe('confirmed');
```

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests
- Manual workflow dispatch

Critical test failures block deployment.

## Test Data

### Creating Test Users
Test users should be created in Supabase with known credentials:
```sql
-- Example: Create test user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test-user@bizdev.app', crypt('TestPass123!', gen_salt('bf')), now());
```

### Seeding Test Data
Use database migrations or seed scripts to populate test data before running tests.

## Troubleshooting

### Tests Fail Locally
1. Ensure dev server is running: `npm run dev`
2. Check environment variables
3. Verify test user exists in database
4. Clear browser state: `rm -rf playwright/.auth`

### Screenshots Not Captured
Screenshots are only taken on failures. Check `test-results/` folder.

### Timeout Issues
Increase timeout for slow operations:
```typescript
await page.waitForURL('/dashboard', { timeout: 10000 });
```

## Best Practices

1. **Keep tests independent** - Each test should run in isolation
2. **Clean up after tests** - Reset state between tests
3. **Use data-testid sparingly** - Prefer semantic selectors
4. **Test real user flows** - Not implementation details
5. **Screenshot failures** - Already configured automatically
6. **Run tests before commits** - Use pre-commit hooks

## Coverage Goals

- **Auth**: 100% critical flows
- **Core Features**: 90% happy paths + edge cases
- **Forms**: 80% validation coverage
- **API Integrations**: Key success/failure paths

## Next Steps

- [ ] Add tests for CRM features
- [ ] Add tests for IP Launch flows
- [ ] Add tests for Billing/Stripe integration
- [ ] Add tests for franchise management
- [ ] Add visual regression testing
- [ ] Add performance budgets
