import { usePermissions, PlatformModule, PermissionType } from './usePermissions';
import { useImpersonation } from '@/contexts/ImpersonationContext';

/**
 * Hook that returns effective permissions, considering impersonation state.
 * When impersonating, returns the impersonated user's permissions.
 * Otherwise, returns the current user's actual permissions.
 */
export const useEffectivePermissions = () => {
  const actualPermissions = usePermissions();
  const { isImpersonating, impersonatedUser } = useImpersonation();

  // If not impersonating, return actual permissions
  if (!isImpersonating || !impersonatedUser) {
    return actualPermissions;
  }

  // Check if impersonated user is admin
  const isImpersonatedAdmin = impersonatedUser.roles.includes('admin');

  // Create permission check for impersonated user
  const hasPermission = (module: PlatformModule, type: PermissionType = 'view'): boolean => {
    if (isImpersonatedAdmin) return true;

    const perm = impersonatedUser.permissions.find(p => p.module === module);
    if (!perm) return false;

    switch (type) {
      case 'view': return perm.can_view;
      case 'create': return perm.can_create;
      case 'edit': return perm.can_edit;
      case 'delete': return perm.can_delete;
      default: return false;
    }
  };

  return {
    permissions: impersonatedUser.permissions,
    isLoading: false,
    isAdmin: isImpersonatedAdmin,
    hasPermission,
  };
};
