
# Plan: Fix Dashboard Permission Race Condition (Complete Fix)

## Problem

The Dashboard still redirects to Profile with "Access denied" because of a **timing race condition** between authentication and permission loading.

### What's Happening

Looking at your console logs:
```
[RequirePermission] ready: true, isAdmin: false → Access denied!
...
[useUserRole] Roles loaded successfully: ["admin"]  ← Too late!
```

The permission check runs BEFORE the admin role query completes.

### Why My Previous Fix Wasn't Enough

I fixed `.single()` → `.maybeSingle()` and batched state updates, but the **real problem** is that `isLoading` starts as `true` but gets evaluated as `false` too early because of React's batching behavior and the async nature of Supabase queries.

## Root Cause

In `usePermissions.tsx`:
```typescript
const [isLoading, setIsLoading] = useState(true);  // Starts true

useEffect(() => {
  if (!user) {
    setIsLoading(false);  // ← Problem: This fires IMMEDIATELY on first render
    return;                //   before user is populated
  }
  // ...async permission fetch
}, [user]);
```

When the component first mounts, `user` is `null`, so `isLoading` becomes `false` right away. Then when `user` becomes available, the effect runs again but there's a brief window where `isLoading` is still `false` from the previous run.

## Solution

### 1. Keep `isLoading: true` Until We Actually Have Permissions

Only set `isLoading: false` AFTER the permission fetch completes, not when user is null.

### 2. Add a "Fetching" Guard

Track whether we're actively fetching so we don't flash stale state.

## File Changes

| File | Change |
|------|--------|
| `src/hooks/usePermissions.tsx` | Fix loading state logic to wait for actual permission data |

## Code Changes

### `src/hooks/usePermissions.tsx`

The key changes:
1. Don't set `isLoading: false` when user is null - keep it `true` until auth completes
2. Set `isLoading: true` at the START of `fetchPermissions` to ensure we're seen as loading during the async query
3. Only set `isLoading: false` after we have a definitive answer

```typescript
export const usePermissions = () => {
  const { user, loading: authLoading } = useAuth();  // Add authLoading
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) {
      return;
    }
    
    // If no user after auth completes, clear state
    if (!user) {
      setPermissions([]);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    // Reset loading state when starting fetch
    setIsLoading(true);
    
    const fetchPermissions = async () => {
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        const isUserAdmin = !roleError && !!roleData;
        
        if (isUserAdmin) {
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        const { data: permData, error: permError } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', user.id);

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

    fetchPermissions();
    // ... rest of subscription code
  }, [user, authLoading]);  // Add authLoading dependency
  
  // ... rest of hook
};
```

## Key Fixes

| Issue | Fix |
|-------|-----|
| `isLoading` set false before user exists | Only set false when auth is complete AND we have checked permissions |
| Race between auth and permission fetch | Add `authLoading` dependency - don't start until auth is done |
| Stale `isLoading: false` from previous render | Set `isLoading: true` at start of each fetch |

## Expected Console Output After Fix

```
[RequirePermission] { ready: false, ... }  ← Waits properly
[RequirePermission] { ready: false, ... }  ← Still waiting
[RequirePermission] { ready: true, isAdmin: true, allowed: true }  ← Success!
```

## Note on XDK Wallets

To be clear: **No XDK wallet changes have been made yet.** We were only planning. This permission bug existed before our conversation today - it just became more visible when you tried to access the Dashboard.
