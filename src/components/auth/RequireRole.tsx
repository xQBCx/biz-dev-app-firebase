import { PropsWithChildren, useEffect } from "react";
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
  const { ready, hasRole } = useUserRole();

  // While roles are loading, render loading fallback
  if (!ready) {
    console.log("[RequireRole] Waiting for roles to load...");
    return <>{loadingFallback}</>;
  }

  // Once ready, decide based on the **roles array**, not a derived boolean
  const allowed = hasRole(role);

  // Log for verification
  console.log("[RequireRole]", {
    ready,
    roleRequired: role,
    allowed,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    if (ready && !allowed) {
      console.log("[RequireRole] Access denied - redirecting to", redirectTo);
      toast.error(`Access denied. ${role} role required.`);
      navigate(redirectTo, { replace: true });
    }
  }, [ready, allowed, navigate, redirectTo, role]);

  if (!allowed) return null;
  
  return <>{children}</>;
}
