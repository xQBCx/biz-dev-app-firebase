import { useAuth } from '@/hooks/useAuth';
import { useImpersonation } from '@/contexts/ImpersonationContext';

interface EffectiveUser {
  id: string | null;
  email: string | null;
  fullName: string | null;
  isImpersonating: boolean;
  isRealAdmin: boolean;
  allowWrites: boolean;
}

/**
 * Hook that returns the "effective" user - either the impersonated user
 * when impersonation is active, or the real authenticated user otherwise.
 * 
 * This is the single source of truth for "which user's data should I show?"
 */
export const useEffectiveUser = (): EffectiveUser => {
  const { user } = useAuth();
  const { isImpersonating, impersonatedUser, allowWrites } = useImpersonation();

  if (isImpersonating && impersonatedUser) {
    return {
      id: impersonatedUser.id,
      email: impersonatedUser.email,
      fullName: impersonatedUser.full_name,
      isImpersonating: true,
      isRealAdmin: true, // The actual logged-in user is an admin
      allowWrites,
    };
  }

  return {
    id: user?.id || null,
    email: user?.email || null,
    fullName: null, // Real user's name would need separate fetch
    isImpersonating: false,
    isRealAdmin: false,
    allowWrites: true, // Not impersonating, always allow writes
  };
};
