
# Security Audit & Fix Plan: Impersonation Data Leakage

## Executive Summary

A critical security vulnerability has been identified where the impersonation feature does not properly isolate data or restrict access. When an admin impersonates another user (like Peter), they see the admin's own data and retain admin-level access instead of seeing only what that user would see.

---

## Issues Identified

### 1. Missing Role Isolation
The system checks the **real logged-in user's roles** instead of the **impersonated user's roles**. This means:
- Admin Panel remains accessible when viewing as Peter
- Admin-only sidebar items remain visible
- Route guards do not block admin routes

### 2. Missing Data Isolation  
Data queries filter by `user.id` (the real admin) instead of `effectiveUserId` (the impersonated user). This means:
- Initiatives shown are the admin's, not Peter's
- Proposals shown are the admin's, not Peter's
- CRM contacts, companies, deals all show admin's data

### 3. Unused Security Infrastructure
The hooks `useEffectiveUser` and `useEffectivePermissions` were created to solve this problem but are not being used in the application.

---

## Files Requiring Updates

### Phase 1: Role & Permission Isolation (Critical)

| File | Change Required |
|------|-----------------|
| `src/hooks/useUserRole.ts` | Create `useEffectiveUserRole` that returns impersonated user's roles |
| `src/components/auth/RequireRole.tsx` | Use effective roles, block admin routes during impersonation |
| `src/components/AppSidebar.tsx` | Use `useEffectivePermissions` and effective roles |

### Phase 2: Data Query Updates (46 Files)

All data-fetching components need to use `effectiveUserId` instead of `user.id`:

**High-Priority Pages:**
- `InitiativeArchitect.tsx` - Uses `user.id` for initiatives
- `ProposalGenerator.tsx` - Uses `user.id` for proposals, templates, contacts
- `Franchises.tsx` - Uses `user.id` for franchise data
- `MyBusinesses.tsx` - Uses `user.id` for spawned businesses
- `ERPDashboard.tsx` - Uses `user.id` for ERP stats
- `ThemeHarvester.tsx` - Uses `user.id` for themes
- `PartnerPortal.tsx` - Uses `user.id` for partner data

**CRM Pages:**
- `CRMContactDetail.tsx`
- `CRMCompanyDetailPage.tsx`
- Various CRM form components

**Other Pages (partial list):**
- `XCommodityNewListing.tsx`
- `LocationManager.tsx`
- Multiple component files

### Phase 3: Additional Hardening

| Item | Description |
|------|-------------|
| Create `useEffectiveUserRole` hook | New hook that returns impersonated roles when active |
| Update `RequireRole` | Block ALL admin routes during impersonation (admins testing should use a test account) |
| Add impersonation indicator | Ensure the impersonation banner is always visible on sensitive pages |

---

## Implementation Approach

### Step 1: Create `useEffectiveUserRole` Hook
```text
File: src/hooks/useEffectiveUserRole.ts

Logic:
- Import useUserRole and useImpersonation
- If impersonating, return impersonated user's roles
- Otherwise, return actual roles from useUserRole
```

### Step 2: Update RequireRole Component
```text
File: src/components/auth/RequireRole.tsx

Changes:
- Import useImpersonation
- When impersonating, ALWAYS deny admin access
- Show toast: "Admin access disabled during impersonation mode"
```

### Step 3: Update AppSidebar
```text
File: src/components/AppSidebar.tsx

Changes:
- Replace usePermissions() with useEffectivePermissions()
- Replace useUserRole() with useEffectiveUserRole()
- Admin-only items will auto-hide during impersonation
```

### Step 4: Bulk Update Data Queries
For each of the 46 affected files:
```text
Before:
const { user } = useAuth();
...
.eq("user_id", user.id)

After:
const { user } = useAuth();
const { id: effectiveUserId } = useEffectiveUser();
...
.eq("user_id", effectiveUserId || user?.id)
```

---

## Technical Details

### New Hook: useEffectiveUserRole

```text
import { useUserRole } from './useUserRole';
import { useImpersonation } from '@/contexts/ImpersonationContext';

export const useEffectiveUserRole = () => {
  const actualRoleData = useUserRole();
  const { isImpersonating, impersonatedUser } = useImpersonation();

  if (!isImpersonating || !impersonatedUser) {
    return actualRoleData;
  }

  // Return impersonated user's roles
  return {
    roles: impersonatedUser.roles as UserRole[],
    ready: true,
    hasRole: (role: UserRole) => impersonatedUser.roles.includes(role),
  };
};
```

### Updated RequireRole Logic

```text
// Inside RequireRole component
const { isImpersonating } = useImpersonation();

// Block admin routes entirely during impersonation
if (isImpersonating && role === 'admin') {
  toast.info("Admin access is disabled during impersonation");
  navigate(redirectTo, { replace: true });
  return null;
}
```

---

## Verification Checklist

After implementation, test the following:

- [ ] Start impersonation as Peter
- [ ] Verify Admin Panel link is NOT visible in sidebar
- [ ] Verify navigating to /admin-panel redirects to dashboard
- [ ] Verify Initiatives page shows Peter's initiatives (likely empty)
- [ ] Verify Proposals page shows Peter's proposals (likely empty)
- [ ] Verify CRM shows Peter's contacts
- [ ] Verify User Management is NOT accessible
- [ ] End impersonation
- [ ] Verify all admin access is restored
- [ ] Verify your data reappears

---

## Priority & Timeline

| Phase | Priority | Estimated Changes |
|-------|----------|-------------------|
| Phase 1 (Role Isolation) | CRITICAL | 3 files |
| Phase 2 (Data Queries) | HIGH | 46 files |
| Phase 3 (Hardening) | MEDIUM | Additional safeguards |

Phase 1 should be completed immediately as it blocks admin access during impersonation. Phase 2 can follow to ensure complete data isolation.
