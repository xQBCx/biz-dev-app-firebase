import { PropsWithChildren, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEffectiveUserRole } from "@/hooks/useEffectiveUserRole";
import { UserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { LoaderFullScreen } from "@/components/ui/loader";
import { toast } from "sonner";

type RequireRoleProps = {
  role: UserRole;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
};

export default function RequireRole({
  role,
  redirectTo = "/dashboard",
  loadingFallback = <LoaderFullScreen />,
  children,
}: PropsWithChildren<RequireRoleProps>) {
  const navigate = useNavigate();
  
  // Hooks must always run in the same order on every render
  const { user, loading: authLoading } = useAuth();
  const { ready: rolesReady, hasRole } = useEffectiveUserRole();
  const { isImpersonating } = useImpersonation();
  
  // Wait for BOTH auth and roles to be ready
  const ready = useMemo(() => !authLoading && rolesReady && !!user, [authLoading, rolesReady, user]);

  // CRITICAL: Block admin access entirely during impersonation
  // This prevents impersonated users from accessing admin routes
  const blockedByImpersonation = useMemo(() => {
    return isImpersonating && role === 'admin';
  }, [isImpersonating, role]);

  // Compute allowed without conditional hooks
  const allowed = useMemo(() => {
    if (blockedByImpersonation) return false;
    return ready ? hasRole(role) : false;
  }, [ready, hasRole, role, blockedByImpersonation]);

  // Log for verification
  console.log("[RequireRole]", {
    ready,
    roleRequired: role,
    allowed,
    isImpersonating,
    blockedByImpersonation,
    timestamp: new Date().toISOString()
  });

  // Effect is declared on every render; internal logic is conditional
  useEffect(() => {
    if (ready && blockedByImpersonation) {
      console.log("[RequireRole] Admin access blocked during impersonation - redirecting to", redirectTo);
      toast.info("Admin access is disabled during impersonation mode");
      navigate(redirectTo, { replace: true });
      return;
    }
    
    if (ready && !allowed) {
      console.log("[RequireRole] Access denied - redirecting to", redirectTo);
      toast.error(`Access denied. ${role} role required.`);
      navigate(redirectTo, { replace: true });
    }
  }, [ready, allowed, navigate, redirectTo, role, blockedByImpersonation]);

  // Rendering can branch; that's fine
  if (!ready) return <>{loadingFallback}</>;
  if (!allowed) return null;
  
  return <>{children}</>;
}
