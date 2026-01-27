import { Navigate } from "react-router-dom";
import { useDefaultAppRoute } from "@/hooks/useDefaultAppRoute";
import { useEffectivePermissions } from "@/hooks/useEffectivePermissions";
import { LoaderFullScreen } from "@/components/ui/loader";

/**
 * Component that redirects to the appropriate landing page based on effective permissions.
 * This is impersonation-aware: when impersonating a user with only deal_rooms access,
 * it will redirect to /deal-rooms instead of /dashboard.
 */
export const DefaultLanding = () => {
  const defaultRoute = useDefaultAppRoute();
  const { isLoading } = useEffectivePermissions();
  
  if (isLoading) {
    return <LoaderFullScreen />;
  }
  
  return <Navigate to={defaultRoute} replace />;
};

export default DefaultLanding;
