import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = 'admin' | 'team_member' | 'client_user' | 'partner';

type UseUserRoleResult = {
  roles: UserRole[] | null;
  ready: boolean; // true only once roles have resolved (loaded or empty array)
  hasRole: (role: UserRole) => boolean;
};

export const useUserRole = (): UseUserRoleResult => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log("[useUserRole] No user, keeping roles as null");
      setRoles(null);
      setLoading(false);
      return;
    }

    console.log("[useUserRole] Fetching roles for user:", user.id);
    setLoading(true);

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      console.log("[useUserRole] Query result:", { data, error, userId: user.id });

      if (!error && data) {
        const loadedRoles = data.map(r => r.role as UserRole);
        console.log("[useUserRole] Roles loaded successfully:", loadedRoles);
        setRoles(loadedRoles);
      } else if (error) {
        console.error("[useUserRole] Error loading roles:", error);
        setRoles([]);
      } else {
        console.log("[useUserRole] No data returned, setting empty roles");
        setRoles([]);
      }
      setLoading(false);
    };

    fetchRoles();

    // Subscribe to role changes
    const channel = supabase
      .channel('user-roles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log("[useUserRole] Roles changed, refetching");
          fetchRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // "ready" means we've finished loading and roles is not null (could be empty array)
  const ready = useMemo(() => !loading && roles !== null, [loading, roles]);

  const hasRole = (role: UserRole): boolean => {
    if (!roles || !Array.isArray(roles)) return false;
    return roles.includes(role);
  };

  return { roles, ready, hasRole };
};
