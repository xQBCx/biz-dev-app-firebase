# Feature: Authentication & Onboarding

## Intent
Enable users to securely access the Biz Dev App platform through email/password authentication and request access if they don't have an account. This delivers secure access control and user identity management for all platform features.

## Happy Path

### Sign In Flow
1. User navigates to landing page (/)
2. User clicks "Login or Request Access" button
3. User is redirected to /auth page
4. User selects "Sign In" tab
5. User enters valid email and password
6. User clicks "Sign In" button
7. System validates credentials via Supabase Auth
8. User sees success toast: "Welcome back! Redirecting to dashboard..."
9. User is redirected to /dashboard within 1 second
10. User remains authenticated across sessions (localStorage persistence)

### Access Request Flow
1. User navigates to /auth page
2. User selects "Request Access" tab
3. User fills out access request form
4. User submits request
5. System records request in database
6. User sees confirmation message
7. Admin is notified of new access request

## Acceptance Criteria

### AC1: Successful Sign In
- Valid credentials authenticate user and redirect to /dashboard
- Invalid credentials show error toast with message
- Loading state displays during authentication
- Session persists on page refresh

### AC2: Form Validation
- Email field requires valid email format
- Password field is required and masked
- Submit button disabled during loading
- Error messages are user-friendly

### AC3: Navigation
- "Back to Home" button returns to /
- Authenticated users auto-redirect from / to /dashboard
- Unauthenticated users can access / and /auth only

### AC4: Security
- Passwords are never logged to console
- Auth tokens stored securely in localStorage
- Session auto-refreshes before expiration
- Sign out clears all auth state

### AC5: Access Request
- Request form captures necessary user information
- Admins receive notification of new requests
- Users see confirmation after submission

## Edge Cases

### Network Failures
- Show "Network error, please try again" on connection loss
- Retry logic for transient failures
- Graceful degradation of UI

### Invalid Credentials
- "Invalid email or password" for wrong credentials
- Account lockout after repeated failures (Supabase handles)
- Clear password field on error

### Already Authenticated
- Redirect authenticated users from /auth to /dashboard
- Show current user info in navigation
- Allow sign out from any page

### Browser Compatibility
- Works in Chrome, Firefox, Safari, Edge
- Mobile responsive design
- Touch-friendly form inputs

### Session Expiration
- Auto-refresh tokens before expiry
- Graceful re-authentication prompt if expired
- No data loss on session timeout

## Technical Notes
- Uses Supabase Auth with email/password provider
- Session stored in localStorage with auto-refresh enabled
- Auth state managed via useAuth hook
- Protected routes check authentication before rendering
