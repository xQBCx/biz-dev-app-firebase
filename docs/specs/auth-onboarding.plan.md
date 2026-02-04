# Test Plan: Authentication & Onboarding

## Test Scope
Verify all authentication flows work as specified in auth-onboarding.md

## Test Environment
- Base URL: http://localhost:5173 (dev) or staging URL
- Browsers: Chrome, Firefox, Safari, Mobile Chrome
- Test Data: Seeded test accounts in Supabase

## Test Data Setup

### Required Test Accounts
```
Valid User:
- Email: test-user@bizdev.app
- Password: TestPass123!
- Role: user
- Status: active

Admin User:
- Email: admin@bizdev.app  
- Password: AdminPass123!
- Role: admin
- Status: active

Invalid User:
- Email: invalid@bizdev.app
- Password: wrong
- Expected: Authentication failure
```

## Test Cases

### TC1: Landing Page to Auth Navigation
**Priority:** Critical  
**Steps:**
1. Navigate to /
2. Verify "Login or Request Access" button visible
3. Click button
4. Assert URL is /auth

### TC2: Successful Sign In
**Priority:** Critical  
**Steps:**
1. Navigate to /auth
2. Select "Sign In" tab
3. Enter valid email and password
4. Click "Sign In"
5. Wait for toast notification
6. Assert redirected to /dashboard
7. Verify auth state in localStorage
8. Refresh page
9. Assert still on /dashboard (session persisted)

### TC3: Invalid Credentials
**Priority:** Critical  
**Steps:**
1. Navigate to /auth
2. Enter invalid email/password
3. Click "Sign In"
4. Assert error toast displays
5. Assert still on /auth page
6. Assert password field cleared

### TC4: Form Validation
**Priority:** High  
**Steps:**
1. Navigate to /auth
2. Test empty email → assert error
3. Test invalid email format → assert error
4. Test empty password → assert error
5. Verify submit button disabled during validation

### TC5: Already Authenticated Redirect
**Priority:** High  
**Steps:**
1. Sign in successfully
2. Navigate to /auth directly
3. Assert auto-redirected to /dashboard
4. Navigate to /
5. Assert auto-redirected to /dashboard

### TC6: Sign Out Flow
**Priority:** Critical  
**Steps:**
1. Sign in successfully
2. Navigate to /dashboard
3. Click "Sign Out" button
4. Assert redirected to /
5. Assert localStorage cleared
6. Attempt to access /dashboard
7. Assert redirected to /auth

### TC7: Access Request Submission
**Priority:** High  
**Steps:**
1. Navigate to /auth
2. Select "Request Access" tab
3. Fill out access request form
4. Submit form
5. Assert confirmation message
6. Verify request saved in database

### TC8: Mobile Responsiveness
**Priority:** Medium  
**Device:** Mobile Chrome (Pixel 5)  
**Steps:**
1. Navigate to /auth on mobile
2. Verify form inputs are touch-friendly
3. Complete sign in flow
4. Assert UI renders correctly

### TC9: Network Error Handling
**Priority:** High  
**Steps:**
1. Navigate to /auth
2. Disable network
3. Attempt sign in
4. Assert error message displays
5. Re-enable network
6. Retry sign in
7. Assert success

### TC10: Session Auto-Refresh
**Priority:** Medium  
**Steps:**
1. Sign in successfully
2. Wait for token near expiration (mock time if needed)
3. Trigger API call
4. Assert token auto-refreshed
5. Assert user remains authenticated

## Success Criteria
- All Critical and High priority tests pass
- No console errors during flows
- Response times < 3 seconds
- Mobile experience matches desktop functionality

## Failure Reporting
For each failure:
- Screenshot at failure point
- Browser console logs
- Network request logs
- Actual vs Expected behavior
- Suggested fix with file paths
