import { useMemo } from 'react';
import { useEffectivePermissions } from './useEffectivePermissions';

/**
 * Returns the best "safe" landing route based on the effective user's permissions.
 * This is impersonation-aware: when impersonating, it uses the target user's permissions.
 * 
 * Priority order:
 * 1. If user can view deal_rooms → /deal-rooms
 * 2. If user can view dashboard → /dashboard
 * 3. Fallback → /profile
 */
export const useDefaultAppRoute = (): string => {
  const { hasPermission, isAdmin, isLoading } = useEffectivePermissions();

  const defaultRoute = useMemo(() => {
    // Admins can go to dashboard
    if (isAdmin) return '/dashboard';
    
    // Check permissions in priority order
    if (hasPermission('deal_rooms', 'view')) return '/deal-rooms';
    if (hasPermission('dashboard', 'view')) return '/dashboard';
    
    // Fallback for users with no standard permissions
    return '/profile';
  }, [hasPermission, isAdmin]);

  return defaultRoute;
};
