
# Plan: Add Sytuation as an Independent Permission Module

## Problem Summary

The "Sytuation" feature currently has no dedicated permission toggle in User Management. It's incorrectly tied to the `'dashboard'` module in the sidebar, meaning:
- If a user has Dashboard access, they automatically see Sytuation
- You cannot turn off Sytuation access for George without also turning off his Dashboard access
- There's no way to grant Sytuation-only access

## Root Cause (3 places need updating)

| File | Current State | Issue |
|------|---------------|-------|
| `src/hooks/usePermissions.tsx` | `sytuation` NOT in `PlatformModule` type | TypeScript doesn't know this module exists |
| `src/components/PermissionManager.tsx` | `sytuation` NOT in `MODULE_CATEGORIES` | No toggle appears in User Management |
| `src/components/AppSidebar.tsx` | Line 35: `module: 'dashboard'` | Sytuation inherits Dashboard permissions |

## Solution

### 1. Add `sytuation` to the PlatformModule type

**File:** `src/hooks/usePermissions.tsx`

Add `'sytuation'` to the union type alongside other modules:

```typescript
export type PlatformModule = 
  | 'dashboard' | 'sytuation' | 'erp' | 'workflows' | 'core'
  // ... rest of modules
```

### 2. Add Sytuation toggle to PermissionManager

**File:** `src/components/PermissionManager.tsx`

Add Sytuation to the "Main Platform" category so it appears as a toggleable permission:

```typescript
"Main Platform": [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'sytuation', label: 'Sytuation' },  // NEW
  { value: 'erp', label: 'ERP' },
  { value: 'workflows', label: 'Workflows' },
  { value: 'core', label: 'Core Features' },
],
```

### 3. Update AppSidebar to use the correct module

**File:** `src/components/AppSidebar.tsx`

Change line 35 from:
```typescript
{ path: "/sytuation", label: "Sytuation", icon: Brain, module: 'dashboard' },
```

To:
```typescript
{ path: "/sytuation", label: "Sytuation", icon: Brain, module: 'sytuation' },
```

### 4. Add route guard in App.tsx (optional but recommended)

**File:** `src/App.tsx`

Wrap the `/sytuation` route with `RequirePermission` to prevent URL bypass:

```tsx
<Route path="/sytuation" element={
  <RequirePermission module="sytuation">
    <Sytuation />
  </RequirePermission>
} />
```

## After Implementation

1. Go to User Management → Select George → Manage Permissions
2. You will now see a "Sytuation" toggle under "Main Platform"
3. Turn it OFF for George
4. George will no longer see Sytuation in his sidebar or be able to access it via URL

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/usePermissions.tsx` | Add `'sytuation'` to `PlatformModule` type |
| `src/components/PermissionManager.tsx` | Add Sytuation to `MODULE_CATEGORIES` |
| `src/components/AppSidebar.tsx` | Change Sytuation's `module` from `'dashboard'` to `'sytuation'` |
| `src/App.tsx` | Add `RequirePermission` wrapper around `/sytuation` route |
