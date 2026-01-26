import { useUserRole, UserRole } from './useUserRole';
import { useImpersonation } from '@/contexts/ImpersonationContext';

/**
 * Hook that returns the "effective" user roles - either the impersonated user's roles
 * when impersonation is active, or the real authenticated user's roles otherwise.
 * 
 * This is the single source of truth for "what roles does the current view have?"
 */
export const useEffectiveUserRole = () => {
  const actualRoleData = useUserRole();
  const { isImpersonating, impersonatedUser } = useImpersonation();

  // If not impersonating, return actual roles
  if (!isImpersonating || !impersonatedUser) {
    return actualRoleData;
  }

  // Return impersonated user's roles
  const impersonatedRoles = (impersonatedUser.roles || []) as UserRole[];
  
  return {
    roles: impersonatedRoles,
    ready: true,
    hasRole: (role: UserRole): boolean => impersonatedRoles.includes(role),
  };
};
