import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type PlatformModule = 
  | 'dashboard' | 'sytuation' | 'erp' | 'workflows' | 'core'
  | 'xbuilderx' | 'xbuilderx_home' | 'xbuilderx_discovery' | 'xbuilderx_engineering' | 'xbuilderx_pipeline' | 'xbuilderx_construction'
  | 'xodiak' | 'xodiak_assets' | 'xodiak_compliance'
  | 'grid_os'
  | 'directory' | 'crm' | 'portfolio' | 'clients' | 'client_portal'
  | 'business_cards' | 'franchises' | 'franchise_applications'
  | 'team' | 'team_invitations'
  | 'tasks' | 'calendar' | 'activity' | 'tools' | 'messages'
  | 'ai_gift_cards' | 'iplaunch' | 'network' | 'integrations' | 'funding' | 'theme_harvester'
  | 'launchpad' | 'app_store' | 'my_apps' | 'white_label_portal' | 'earnings'
  | 'true_odds' | 'true_odds_explore' | 'true_odds_picks' | 'true_odds_signals'
  | 'social' | 'website_builder' | 'marketplace' | 'ecosystem' | 'admin'
  | 'white_paper' | 'module_white_papers'
  | 'deal_rooms' | 'xcommodity'
  // NEW: Separate modules for pages that were bundled under deal_rooms
  | 'xevents' | 'initiatives' | 'partner_management' | 'proposal_generator';

export type PermissionType = 'view' | 'create' | 'edit' | 'delete';

interface Permission {
  module: PlatformModule;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export const usePermissions = () => {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Wait for auth to complete before checking permissions
    if (authLoading) {
      return;
    }
    
    // No user after auth completes - clear state
    if (!user) {
      setPermissions([]);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    // Reset loading state when starting fetch
    setIsLoading(true);

    const fetchPermissions = async () => {
      try {
        // Check if user is admin - use maybeSingle() to handle 0 rows gracefully
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        // Only consider admin if we got a valid result without errors
        const isUserAdmin = !roleError && !!roleData;
        
        if (isUserAdmin) {
          // Batch state updates to prevent race condition
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        // Not admin - fetch user permissions
        const { data: permData, error: permError } = await supabase
          .from('user_permissions')
          .select('*')
          .eq('user_id', user.id);

        // Batch all state updates together
        setIsAdmin(false);
        if (!permError && permData) {
          setPermissions(permData as Permission[]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    fetchPermissions();

    // Subscribe to permission changes
    const channel = supabase
      .channel('user-permissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_permissions',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchPermissions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  const hasPermission = (module: PlatformModule, type: PermissionType = 'view'): boolean => {
    if (isAdmin) return true;
    
    const perm = permissions.find(p => p.module === module);
    if (!perm) return false;

    switch (type) {
      case 'view': return perm.can_view;
      case 'create': return perm.can_create;
      case 'edit': return perm.can_edit;
      case 'delete': return perm.can_delete;
      default: return false;
    }
  };

  return {
    permissions,
    isLoading,
    isAdmin,
    hasPermission
  };
};
