# Feature: Admin Panel & Access Requests

## Intent

Enable administrators to manage user access requests, approve/deny requests, and control platform permissions. This ensures only authorized users gain access to sensitive features while maintaining a clear audit trail.

**Value Delivered:**
- **Admins**: Centralized dashboard to review and manage incoming access requests
- **Users**: Clear process for requesting platform access with status visibility
- **Organization**: Security and compliance through controlled access management

## Happy Path

### User Request Flow
1. Unauthenticated user navigates to `/auth`
2. User clicks "Request Access" link/button
3. User fills out access request form:
   - Full Name (required)
   - Email (required)
   - Company (optional)
   - Reason for access (optional)
4. User submits form
5. System validates input
6. Request is saved to database with status "pending"
7. Admin notification is triggered
8. User sees confirmation message

### Admin Review Flow
1. Admin logs into platform
2. Admin navigates to Admin Panel (`/admin`)
3. Admin sees list of pending access requests
4. Admin reviews request details
5. Admin approves or denies request
6. System updates request status
7. If approved, user account is created/activated
8. User receives email notification of decision

## Acceptance Criteria

### AC1: Access Request Submission
- ✅ Unauthenticated users can access request form
- ✅ Form validates required fields (name, email)
- ✅ Form accepts optional fields (company, reason)
- ✅ Valid submission creates database record with status "pending"
- ✅ Submission triggers admin notification
- ✅ User sees success confirmation

### AC2: Admin Panel Access Control
- ✅ Only users with 'admin' role can access `/admin`
- ✅ Non-admin users are redirected to dashboard
- ✅ Unauthenticated users are redirected to auth page

### AC3: Access Request Management
- ✅ Admin sees all pending requests
- ✅ Admin can view request details (name, email, company, reason, date)
- ✅ Admin can approve request (status → "approved")
- ✅ Admin can deny request (status → "denied")
- ✅ Status changes are persisted to database
- ✅ Status updates trigger user notification

### AC4: Data Persistence & Security
- ✅ Access requests stored in database with RLS policies
- ✅ Only admins can read/update access requests
- ✅ Audit trail maintained (created_at, updated_at)
- ✅ Email addresses are unique per request

### AC5: User Experience
- ✅ Request form has clear validation messages
- ✅ Admin panel shows request count
- ✅ Admin can filter/search requests
- ✅ UI responsive on mobile and desktop
- ✅ Loading states during form submission
- ✅ Toast notifications for success/error

## Edge Cases

### Request Submission
- **Duplicate Email**: User submits request with email that already has pending request
- **Invalid Email**: User enters malformed email address
- **Network Failure**: Request fails during submission
- **Missing Required Fields**: User tries to submit incomplete form
- **SQL Injection**: User attempts malicious input in form fields

### Admin Actions
- **Concurrent Approvals**: Two admins try to approve same request simultaneously
- **Deleted User**: Admin tries to approve request for deleted/banned email
- **Session Timeout**: Admin session expires during approval process
- **Permission Revoked**: User's admin role is removed while viewing panel
- **Database Constraint Violation**: System fails to create user account on approval

### System Failures
- **Database Connection Lost**: Request cannot be saved
- **Email Service Down**: Notification emails fail to send
- **RLS Policy Failure**: Security policies prevent legitimate admin access
- **Browser Cache**: Stale data shown after status update

## Database Schema

### Table: access_requests
```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## API Integration

### Edge Functions
- `notify-access-request` - Sends notification to admins when new request is submitted

### Database Functions
- `notify_access_request()` - Trigger function that creates notification record

## Related Components
- `src/components/AccessRequest.tsx` - Request form component
- `src/components/AccessRequestManager.tsx` - Admin management UI
- `src/pages/AdminPanel.tsx` - Main admin dashboard
- `src/pages/Auth.tsx` - Authentication page with request link

## Security Considerations
- RLS policies enforce admin-only access to requests table
- Input sanitization prevents SQL injection
- Rate limiting on request submission (future enhancement)
- Email verification before account activation (future enhancement)
- CAPTCHA to prevent spam requests (future enhancement)
