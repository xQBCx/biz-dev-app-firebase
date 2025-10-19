import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type UserRole = 'admin' | 'team_member' | 'client_user' | 'partner';

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } else {
        setRoles(data.map(r => r.role as UserRole));
      }
      setIsLoading(false);
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = hasRole('admin');
  const isTeamMember = hasRole('team_member');
  const isClientUser = hasRole('client_user');
  const isPartner = hasRole('partner');

  return {
    roles,
    hasRole,
    isAdmin,
    isTeamMember,
    isClientUser,
    isPartner,
    isLoading,
  };
};
