
# Plan: Fix Dashboard Access Denied Bug

## Problem Summary

When you click the Dashboard button, you get redirected to `/profile` with an "Access denied" message, even though you are an admin with full dashboard permissions.

The console logs clearly show the issue:
```
[RequirePermission] {
  "ready": true,
  "module": "dashboard",
  "allowed": false,
  "isAdmin": false,  ← Should be TRUE
  "redirectTo": "/profile"
}
```

## Root Cause

There are two issues in `src/hooks/usePermissions.tsx`:

### Issue 1: Race Condition with Loading State
The `isLoading` flag is set to `false` at the end of `fetchPermissions`, but the `isAdmin` state update happens asynchronously. This creates a window where `isLoading = false` but `isAdmin` hasn't been updated yet, causing `RequirePermission` to see `ready: true` with `isAdmin: false`.

### Issue 2: Fragile `.single()` Query
```typescript
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .eq('role', 'admin')
  .single();  // Throws error if 0 or >1 rows
```
If the query returns 0 rows, `.single()` returns an error object, not `null`. The code checks `!!roles` but doesn't check for errors, potentially causing false negatives.

## Solution

### Fix 1: Use `.maybeSingle()` Instead of `.single()`
The `.maybeSingle()` method returns `null` for 0 rows without throwing an error, making the admin check more reliable.

### Fix 2: Set Loading State Atomically
Ensure `isAdmin` is set before `isLoading` becomes `false`, or batch the state updates together to prevent the race condition.

### Fix 3: Add Error Handling
Explicitly check for query errors when determining admin status.

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/usePermissions.tsx` | Fix the admin role query and loading state synchronization |

## Code Changes

### src/hooks/usePermissions.tsx

**Before (lines 47-63):**
```typescript
const fetchPermissions = async () => {
  // Check if user is admin
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();

  const isUserAdmin = !!roles;
  setIsAdmin(isUserAdmin);

  // If admin, they have all permissions
  if (isUserAdmin) {
    setIsLoading(false);
    return;
  }

  // Fetch user permissions
  const { data, error } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', user.id);

  if (!error && data) {
    setPermissions(data as Permission[]);
  }
  setIsLoading(false);
};
```

**After:**
```typescript
const fetchPermissions = async () => {
  try {
    // Check if user is admin - use maybeSingle() to handle 0 rows gracefully
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    // Only consider admin if we got a valid result without errors
    const isUserAdmin = !roleError && !!roleData;
    
    if (isUserAdmin) {
      // Batch state updates to prevent race condition
      setIsAdmin(true);
      setIsLoading(false);
      return;
    }

    // Not admin - fetch user permissions
    const { data: permData, error: permError } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', user.id);

    // Batch all state updates together
    setIsAdmin(false);
    if (!permError && permData) {
      setPermissions(permData as Permission[]);
    }
    setIsLoading(false);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    setIsAdmin(false);
    setIsLoading(false);
  }
};
```

## Key Differences

1. **`.maybeSingle()`** instead of **`.single()`** - Returns `null` gracefully when no admin role exists instead of throwing an error

2. **Explicit error checking** - `!roleError && !!roleData` ensures we only set admin=true when the query succeeds AND returns data

3. **State batching** - `setIsAdmin()` is always called before `setIsLoading(false)` to ensure the admin status is set before the component considers permissions "ready"

4. **Try-catch wrapper** - Catches any unexpected errors and ensures loading state is cleared

## Expected Result

After this fix:
- Clicking Dashboard will load the Dashboard page correctly
- The console will show `isAdmin: true` for your account
- No more "Access denied" redirects for admin users
