import { PropsWithChildren, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole, UserRole } from "@/hooks/useUserRole";
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
  const { ready, hasRole } = useUserRole();

  // Compute allowed without conditional hooks
  const allowed = useMemo(() => (ready ? hasRole(role) : false), [ready, hasRole, role]);

  // Log for verification
  console.log("[RequireRole]", {
    ready,
    roleRequired: role,
    allowed,
    timestamp: new Date().toISOString()
  });

  // Effect is declared on every render; internal logic is conditional
  useEffect(() => {
    if (ready && !allowed) {
      console.log("[RequireRole] Access denied - redirecting to", redirectTo);
      toast.error(`Access denied. ${role} role required.`);
      navigate(redirectTo, { replace: true });
    }
  }, [ready, allowed, navigate, redirectTo, role]);

  // Rendering can branch; that's fine
  if (!ready) return <>{loadingFallback}</>;
  if (!allowed) return null;
  
  return <>{children}</>;
}
