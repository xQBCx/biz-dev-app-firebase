# Test Plan: Billing & Subscription Management (Stripe)

## Test Scope
Verify Stripe integration for subscription purchase, upgrades, downgrades, and billing management.

## Test Environment
- Base URL: Staging environment with test Stripe keys
- Stripe: Test mode with test cards
- Webhooks: Configured to staging endpoint (if used)

## Test Data Setup

### Stripe Test Products/Prices
```
Free Tier:
- Price: $0/month
- Features: Basic access
- ID: price_free (or no subscription)

Pro Tier:
- Price: $29/month
- Features: Advanced features
- Stripe Price ID: price_test_pro_monthly

Enterprise Tier:
- Price: $99/month
- Features: All features
- Stripe Price ID: price_test_enterprise_monthly
```

### Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

### Test User Accounts
```
Free User:
- Email: free-user@bizdev.app
- Subscription: None
- Expected: Can access basic features only

Pro User:
- Email: pro-user@bizdev.app
- Subscription: Pro tier
- Expected: Can access advanced features

Admin User:
- Email: admin@bizdev.app
- Role: admin
- Expected: Can view all subscriptions
```

## Prerequisites
- Stripe integration enabled in project
- Test Stripe keys configured in secrets
- Edge function for checkout creation deployed
- Edge function for payment verification deployed (optional)
- Database tables for subscriptions exist

## Test Cases

### TC1: View Pricing/Plans Page
**Priority:** High  
**Steps:**
1. Navigate to pricing page
2. Verify all plan tiers displayed
3. Verify pricing information correct
4. Verify feature lists shown
5. Verify "Subscribe" buttons visible

### TC2: Create Checkout Session (Pro Plan)
**Priority:** Critical  
**Steps:**
1. Sign in as free user
2. Navigate to pricing page
3. Click "Subscribe" on Pro plan
4. Wait for checkout session creation
5. Verify new tab opens with Stripe Checkout
6. Verify Checkout URL contains `checkout.stripe.com`
7. Verify email pre-filled in Stripe form
8. Verify plan details correct (Pro - $29/month)

### TC3: Complete Successful Payment
**Priority:** Critical  
**Steps:**
1. Create checkout session for Pro plan
2. In Stripe Checkout, enter test card 4242...
3. Enter future expiry date (12/34)
4. Enter any 3-digit CVC (123)
5. Enter billing details (zip code, etc.)
6. Click "Subscribe" in Stripe form
7. Wait for redirect to success URL
8. Verify success message displayed
9. Query database: verify subscription record created
10. Verify user.subscription_tier = 'pro'
11. Navigate to billing page
12. Verify Pro plan shows as active

### TC4: Payment Declined
**Priority:** High  
**Steps:**
1. Create checkout session
2. Enter decline test card (4000 0000 0000 0002)
3. Complete form and submit
4. Verify error message from Stripe
5. Verify no subscription created in database
6. Verify user still on free tier

### TC5: Cancel During Checkout
**Priority:** Medium  
**Steps:**
1. Create checkout session
2. Click "Back" or close Stripe Checkout tab
3. Return to app
4. Verify no subscription created
5. Verify user still on free tier
6. Verify can retry checkout

### TC6: Upgrade from Pro to Enterprise
**Priority:** High  
**Steps:**
1. Sign in as user with active Pro subscription
2. Navigate to billing/pricing page
3. Click "Upgrade" on Enterprise plan
4. Verify prorated amount shown (if applicable)
5. Complete Stripe Checkout with test card
6. Verify success message
7. Query database: verify subscription_tier = 'enterprise'
8. Verify can access enterprise-only features
9. Verify billing shows Enterprise plan

### TC7: Downgrade from Enterprise to Pro
**Priority:** High  
**Steps:**
1. Sign in as user with Enterprise subscription
2. Navigate to billing settings
3. Click "Change Plan" or "Downgrade"
4. Select Pro plan
5. Verify message about downgrade at period end
6. Confirm downgrade
7. Verify confirmation message
8. Verify still have Enterprise access until period end
9. Verify "Scheduled to change to Pro on [date]" message

### TC8: Feature Access Control
**Priority:** Critical  
**Steps:**
1. Sign in as free user
2. Attempt to access Pro feature
3. Verify blocked or see upgrade prompt
4. Sign in as Pro user
5. Verify can access Pro feature
6. Attempt to access Enterprise feature
7. Verify blocked or see upgrade prompt
8. Sign in as Enterprise user
9. Verify can access all features

### TC9: View Subscription Details
**Priority:** Medium  
**Steps:**
1. Sign in as user with active subscription
2. Navigate to billing/account settings
3. Verify current plan tier displayed
4. Verify billing amount shown
5. Verify next billing date shown
6. Verify payment method shown (last 4 digits)
7. Verify "Manage Subscription" link present

### TC10: Expired Checkout Session
**Priority:** Medium  
**Steps:**
1. Create checkout session
2. Wait for session to expire (or mock expiration)
3. Attempt to use expired session URL
4. Verify Stripe shows "session expired" error
5. Return to app and create new session
6. Verify new session works

### TC11: Duplicate Subscription Prevention
**Priority:** High  
**Steps:**
1. User with active Pro subscription
2. Attempt to subscribe to Pro again
3. Verify system handles gracefully (updates existing vs error)
4. Verify no duplicate charges
5. Verify subscription remains active

### TC12: Network Error During Checkout Creation
**Priority:** Medium  
**Steps:**
1. Mock network failure
2. Attempt to create checkout session
3. Verify error message displayed
4. Verify retry option available
5. Restore network
6. Retry and verify success

### TC13: Payment Success but Redirect Fails
**Priority:** High  
**Steps:**
1. Complete payment successfully
2. Mock redirect failure (close tab before redirect)
3. Return to app manually
4. Navigate to billing page
5. Verify subscription shows as active (webhook or manual check)
6. Verify access to paid features granted

### TC14: Webhook Event Processing (if configured)
**Priority:** Medium  
**Steps:**
1. Trigger Stripe webhook event (payment succeeded)
2. Verify edge function receives event
3. Verify database updated correctly
4. Trigger subscription canceled event
5. Verify database updated
6. Verify user access revoked

### TC15: Mobile Checkout Flow
**Priority:** Medium  
**Device:** Mobile Chrome  
**Steps:**
1. Sign in on mobile device
2. Navigate to pricing page
3. Select plan and initiate checkout
4. Complete payment on Stripe mobile checkout
5. Verify mobile-friendly success page
6. Verify subscription active

## Success Criteria
- All Critical tests pass
- Payment processing is secure (no secret key exposure)
- No double-charging possible
- Subscription status accurately reflects Stripe state
- Feature access properly gated by subscription tier

## Test Data Cleanup
After test runs:
- Delete test subscriptions from Stripe dashboard
- Remove test subscription records from database
- Reset test users to free tier

## Known Limitations
- Test mode payments are not real charges
- Some Stripe features may behave differently in test vs live
- Webhook timing may be unpredictable in test environment

## Monitoring & Logging
During tests, verify:
- No sensitive data logged to console
- Stripe API calls logged for debugging
- Payment failures logged with error codes
- User actions tracked in activity logs
