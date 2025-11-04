import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = 'admin' | 'team_member' | 'client_user' | 'partner';

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    // Keep loading true until we've fetched roles
    setIsLoading(true);

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (!error && data) {
        console.log("User roles loaded:", data);
        const loadedRoles = data.map(r => r.role as UserRole);
        setRoles(loadedRoles);
        // Small delay to ensure state has fully propagated
        await new Promise(resolve => setTimeout(resolve, 50));
      } else if (error) {
        console.error("Error loading user roles:", error);
      }
      setIsLoading(false);
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
          setIsLoading(true);
          fetchRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const isTeamMember = hasRole('team_member');
  const isClientUser = hasRole('client_user');
  const isPartner = hasRole('partner');

  return {
    roles,
    isLoading,
    hasRole,
    isAdmin,
    isTeamMember,
    isClientUser,
    isPartner
  };
};
