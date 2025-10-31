# Test Plan: Admin Panel & Access Requests

## Test Strategy
This test suite validates the complete access request flow from user submission through admin approval, ensuring security, data integrity, and proper user experience.

## Test Environment
- **Browser**: Chromium, Firefox, WebKit
- **Viewport**: Desktop (1280x720), Mobile (375x667)
- **Test Users**:
  - Admin: `admin@test.com` (role: admin)
  - Regular User: `user@test.com` (role: client_user)
  - No Auth: Unauthenticated session

## Test Data
```typescript
const validRequest = {
  fullName: "Jane Smith",
  email: "jane.smith@example.com",
  company: "Acme Corp",
  reason: "Need access for project management"
};

const minimalRequest = {
  fullName: "John Doe",
  email: "john.doe@example.com"
};

const invalidRequests = {
  missingName: { email: "test@example.com" },
  missingEmail: { fullName: "Test User" },
  invalidEmail: { fullName: "Test", email: "not-an-email" }
};
```

## Test Scenarios

### 1. Access Request Submission (Unauthenticated)
**Priority**: Critical  
**Time**: 5-10 minutes

#### Test Cases:
1. **Navigate to Request Form**
   - Given: User is on `/auth` page
   - When: User clicks "Request Access" link
   - Then: Request form is displayed

2. **Submit Valid Complete Request**
   - Given: User fills all form fields with valid data
   - When: User submits form
   - Then: Success message displayed
   - And: Request saved to database with status "pending"
   - And: Admin notification created

3. **Submit Valid Minimal Request**
   - Given: User fills only required fields (name, email)
   - When: User submits form
   - Then: Success message displayed
   - And: Request saved with null optional fields

4. **Validation: Missing Required Fields**
   - Given: User leaves name or email empty
   - When: User tries to submit
   - Then: Validation errors displayed
   - And: Form not submitted

5. **Validation: Invalid Email Format**
   - Given: User enters malformed email
   - When: User tries to submit
   - Then: Email validation error shown
   - And: Form not submitted

6. **Duplicate Email Prevention**
   - Given: Email already has pending request
   - When: User submits with same email
   - Then: Error message about duplicate request
   - Or: Request updated instead of creating duplicate

### 2. Admin Panel Access Control
**Priority**: Critical  
**Time**: 3-5 minutes

#### Test Cases:
1. **Admin Can Access Panel**
   - Given: User logged in with admin role
   - When: User navigates to `/admin`
   - Then: Admin panel loads successfully
   - And: Access request section visible

2. **Non-Admin Redirected**
   - Given: User logged in as regular user (client_user)
   - When: User navigates to `/admin`
   - Then: User redirected to `/dashboard`
   - And: Toast message: "Admin access required"

3. **Unauthenticated Redirected**
   - Given: No user session
   - When: User navigates to `/admin`
   - Then: User redirected to `/auth`

### 3. Access Request Management (Admin)
**Priority**: Critical  
**Time**: 10-15 minutes

#### Test Cases:
1. **View Pending Requests**
   - Given: Admin logged in
   - When: Admin opens Admin Panel
   - Then: All pending requests displayed
   - And: Shows name, email, company, reason, date

2. **Approve Access Request**
   - Given: Admin views pending request
   - When: Admin clicks "Approve" button
   - Then: Request status updated to "approved"
   - And: Database record updated
   - And: Success toast shown
   - And: Request removed from pending list (or moved to approved)

3. **Deny Access Request**
   - Given: Admin views pending request
   - When: Admin clicks "Deny" button
   - Then: Request status updated to "denied"
   - And: Database record updated
   - And: Success toast shown

4. **Filter by Status**
   - Given: Requests exist with different statuses
   - When: Admin filters by "pending" / "approved" / "denied"
   - Then: Only matching requests displayed

5. **Search Requests**
   - Given: Multiple requests in database
   - When: Admin searches by name or email
   - Then: Matching requests displayed
   - And: Non-matching requests hidden

### 4. Database & Security
**Priority**: Critical  
**Time**: 5-10 minutes

#### Test Cases:
1. **RLS Policy Enforcement**
   - Given: Regular user tries to query access_requests table
   - When: Query executed via Supabase client
   - Then: Query returns empty or fails with permission error

2. **Admin RLS Access**
   - Given: Admin user queries access_requests
   - When: Query executed
   - Then: All requests returned

3. **Request Record Integrity**
   - Given: Request submitted
   - When: Database queried
   - Then: created_at, updated_at timestamps present
   - And: status defaults to "pending"
   - And: id is valid UUID

4. **Email Uniqueness**
   - Given: Request with email already exists
   - When: Second request submitted with same email
   - Then: Constraint violation or handled gracefully

### 5. User Experience & Accessibility
**Priority**: High  
**Time**: 5-10 minutes

#### Test Cases:
1. **Mobile Responsive Request Form**
   - Given: Mobile viewport (375x667)
   - When: User opens request form
   - Then: Form renders correctly
   - And: All fields accessible
   - And: Submit button visible

2. **Mobile Responsive Admin Panel**
   - Given: Admin on mobile device
   - When: Admin opens panel
   - Then: Requests displayed in card/list layout
   - And: Action buttons accessible

3. **Accessibility: Keyboard Navigation**
   - Given: User on request form
   - When: User navigates via keyboard (Tab, Enter)
   - Then: All fields focusable
   - And: Form submittable via Enter

4. **Accessibility: Screen Reader**
   - Given: Screen reader active
   - When: Form rendered
   - Then: Labels announced correctly
   - And: Error messages announced
   - And: Success messages announced

5. **Loading States**
   - Given: Request being submitted
   - When: Network request in flight
   - Then: Submit button disabled
   - And: Loading spinner shown
   - And: User cannot double-submit

### 6. Edge Cases & Error Handling
**Priority**: Medium  
**Time**: 5-10 minutes

#### Test Cases:
1. **Network Failure on Submit**
   - Given: Network interrupted
   - When: User submits form
   - Then: Error message displayed
   - And: Form data preserved
   - And: User can retry

2. **Session Timeout During Admin Action**
   - Given: Admin session expires
   - When: Admin tries to approve request
   - Then: Redirected to auth
   - And: Error toast about session

3. **Concurrent Admin Actions**
   - Given: Two admins view same pending request
   - When: Both try to approve simultaneously
   - Then: First approval succeeds
   - And: Second sees "already processed" or request refreshes

4. **SQL Injection Prevention**
   - Given: User enters SQL code in form fields
   - When: Form submitted
   - Then: Input sanitized or parameterized
   - And: No SQL injection occurs

## Test Execution Order
1. Run authentication setup (create admin + regular user)
2. Run unauthenticated request submission tests
3. Run admin access control tests
4. Run admin management tests
5. Run security/RLS tests
6. Run accessibility tests
7. Cleanup test data

## Success Criteria
- ✅ All critical tests pass (100% pass rate)
- ✅ No accessibility violations (axe-core)
- ✅ Mobile viewport renders correctly
- ✅ RLS policies prevent unauthorized access
- ✅ Form validation prevents bad data
- ✅ Admin can successfully manage requests

## Test Data Cleanup
After each test run:
```sql
DELETE FROM access_requests WHERE email LIKE '%@example.com';
DELETE FROM access_requests WHERE email LIKE '%test.com' AND created_at > NOW() - INTERVAL '1 hour';
```

## Automated Test Reporting
- Generate HTML report with screenshots
- Track test duration and flakiness
- Report accessibility violations
- Log database queries for security review
