# Feature: Billing & Subscription Management (Stripe)

## Intent
Enable users to purchase subscriptions, upgrade/downgrade plans, and manage their billing information through Stripe. This delivers monetization capabilities and allows users to access premium features based on their subscription tier.

## Happy Path

### Initial Subscription Purchase
1. User navigates to pricing or upgrade page
2. User selects a subscription plan (e.g., Pro, Enterprise)
3. User clicks "Subscribe" or "Upgrade" button
4. System creates Stripe Checkout session
5. User is redirected to Stripe Checkout (new tab)
6. User enters payment information in Stripe's secure form
7. User completes payment
8. Stripe redirects user to success URL (/payment-success)
9. System verifies payment with Stripe
10. System updates user's subscription status in database
11. User sees confirmation message
12. User can now access premium features

### Viewing Current Subscription
1. Authenticated user navigates to billing/account settings
2. User sees current plan details (name, price, renewal date)
3. User sees payment method on file
4. User sees option to upgrade/downgrade or cancel

### Plan Upgrade
1. User with active subscription views available plans
2. User selects higher-tier plan
3. System calculates prorated amount
4. User confirms upgrade
5. Stripe processes payment for prorated difference
6. System updates subscription immediately
7. User gains access to new tier features

### Plan Downgrade
1. User selects lower-tier plan
2. System schedules downgrade for end of current billing period
3. User sees confirmation of scheduled change
4. At period end, system updates subscription
5. User's access adjusts to new tier

## Acceptance Criteria

### AC1: Checkout Session Creation
- System creates valid Stripe Checkout session with correct price
- Session includes customer email from authenticated user
- Session has proper success/cancel URLs
- Session opens in new tab (default behavior)

### AC2: Payment Verification
- System verifies payment status using Checkout Session ID
- Only successful payments update subscription status
- Failed/canceled payments do not grant access
- System handles webhook events from Stripe (if configured)

### AC3: Subscription Status Tracking
- Database stores current subscription tier
- Database stores Stripe customer ID
- Database stores subscription status (active/canceled/past_due)
- Database stores current period end date

### AC4: Feature Access Control
- Users can only access features for their current tier
- Downgraded users lose access to higher-tier features
- Upgraded users immediately gain new features
- Free users see upgrade prompts on premium features

### AC5: Error Handling
- Network errors show retry option
- Payment failures show clear error message
- Stripe API errors are logged and handled gracefully
- Users are never double-charged

### AC6: Security
- Stripe secret key never exposed to frontend
- All payment processing through Stripe Checkout (PCI compliant)
- Customer IDs validated against authenticated user
- Subscription changes require authentication

## Edge Cases

### Duplicate Payment Attempts
- Prevent double-charging if user clicks multiple times
- Show loading state during checkout session creation
- Disable button after first click

### Session Expiration
- Checkout sessions expire after 24 hours (Stripe default)
- Handle expired session gracefully with new session creation
- Don't assume payment completed without verification

### Network Interruptions
- User completes payment but success redirect fails
- System polls or uses webhooks to catch completed payments
- User can verify subscription status on return to app

### Subscription Conflicts
- User has active subscription and tries to subscribe again
- System updates existing subscription instead of creating duplicate
- Clear messaging about what will happen

### Failed Payments
- Credit card declined or insufficient funds
- System updates status to 'past_due'
- User sees clear message to update payment method
- Grace period before access revoked (configurable)

### Cancellation During Trial
- User cancels during free trial
- System cancels immediately (no charge)
- User sees confirmation

### Refund Requests
- Admin can issue refunds through Stripe dashboard
- System receives webhook and updates subscription status
- User access adjusted based on refund

## Technical Notes
- Uses Stripe Checkout for PCI compliance
- Edge function creates checkout sessions securely
- Success page verifies payment before showing confirmation
- Supabase stores subscription metadata
- Optional: Stripe webhooks for real-time updates
- Mode: 'subscription' for recurring billing
- Mode: 'payment' for one-time purchases (if supported)

## Database Schema Requirements
- Table: subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan_tier, status, current_period_end)
- Table: payments (optional, for payment history tracking)
