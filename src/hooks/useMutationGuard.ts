import { useCallback } from 'react';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { toast } from 'sonner';

/**
 * Hook that provides a wrapper for mutations that respects impersonation read-only mode.
 * 
 * Usage:
 * const { guardMutation, canMutate } = useMutationGuard();
 * 
 * const handleSave = guardMutation(async () => {
 *   await supabase.from('table').insert({ ... });
 * });
 */
export const useMutationGuard = () => {
  const { isImpersonating, allowWrites } = useImpersonation();

  const canMutate = !isImpersonating || allowWrites;

  const guardMutation = useCallback(
    <T extends (...args: any[]) => Promise<any>>(mutation: T) => {
      return (async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
        if (isImpersonating && !allowWrites) {
          toast.error('Action blocked - Read-only impersonation mode', {
            description: 'Enable "Allow Writes" to perform this action.',
          });
          return undefined;
        }
        return mutation(...args);
      }) as T;
    },
    [isImpersonating, allowWrites]
  );

  return { guardMutation, canMutate };
};
