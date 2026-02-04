import { PropsWithChildren, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEffectivePermissions } from "@/hooks/useEffectivePermissions";
import { PlatformModule } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { LoaderFullScreen } from "@/components/ui/loader";
import { toast } from "sonner";

type RequirePermissionProps = {
  module: PlatformModule;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
};

/**
 * Compute a safe redirect route based on effective permissions.
 * Used when access is denied to avoid redirect loops.
 */
const useSafeRedirect = (): string => {
  const { hasPermission, isAdmin } = useEffectivePermissions();
  
  return useMemo(() => {
    if (isAdmin) return '/dashboard';
    if (hasPermission('deal_rooms', 'view')) return '/deal-rooms';
    if (hasPermission('dashboard', 'view')) return '/dashboard';
    return '/profile';
  }, [hasPermission, isAdmin]);
};

/**
 * Route guard that checks if the effective user (real or impersonated)
 * has view permission for the specified module.
 * Redirects to a safe route if access is denied.
 */
export default function RequirePermission({
  module,
  redirectTo,
  loadingFallback = <LoaderFullScreen />,
  children,
}: PropsWithChildren<RequirePermissionProps>) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasPermission, isAdmin, isLoading: permissionsLoading } = useEffectivePermissions();
  const safeRedirect = useSafeRedirect();
  
  // Use provided redirectTo or fall back to computed safe route
  const finalRedirect = redirectTo || safeRedirect;
  
  // Wait for both auth and permissions to be ready
  const ready = useMemo(
    () => !authLoading && !permissionsLoading && !!user,
    [authLoading, permissionsLoading, user]
  );

  // Check if user can VIEW this module
  const allowed = useMemo(() => {
    if (!ready) return false;
    if (isAdmin) return true;
    return hasPermission(module, 'view');
  }, [ready, isAdmin, hasPermission, module]);

  // Log for debugging
  console.log("[RequirePermission]", {
    ready,
    module,
    allowed,
    isAdmin,
    redirectTo: finalRedirect,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    if (ready && !allowed) {
      console.log("[RequirePermission] Access denied to", module, "- redirecting to", finalRedirect);
      toast.error(`Access denied`, {
        description: `You don't have permission to view ${module.replace(/_/g, ' ')}.`
      });
      navigate(finalRedirect, { replace: true });
    }
  }, [ready, allowed, navigate, finalRedirect, module]);

  if (!ready) return <>{loadingFallback}</>;
  if (!allowed) return null;
  
  return <>{children}</>;
}
