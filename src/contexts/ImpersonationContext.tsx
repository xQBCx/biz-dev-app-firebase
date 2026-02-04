import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useActiveClient } from '@/hooks/useActiveClient';

interface ImpersonatedUser {
  id: string;
  email: string;
  full_name: string | null;
  roles: string[];
  permissions: Array<{
    module: string;
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  }>;
}

interface ImpersonationContextType {
  isImpersonating: boolean;
  impersonatedUser: ImpersonatedUser | null;
  startImpersonation: (userId: string) => Promise<void>;
  endImpersonation: () => void;
  getEffectiveUserId: () => string | null;
  loading: boolean;
  allowWrites: boolean;
  setAllowWrites: (value: boolean) => void;
  // Store admin's workspace to restore on end
  adminWorkspace: { clientId: string | null; clientName: string | null } | null;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

// Session timeout: 30 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export const ImpersonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [impersonatedUser, setImpersonatedUser] = useState<ImpersonatedUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [allowWrites, setAllowWrites] = useState(false);
  const [adminWorkspace, setAdminWorkspace] = useState<{ clientId: string | null; clientName: string | null } | null>(null);
  
  // Get workspace functions - use ref to avoid dependency issues
  const { activeClientId, activeClientName, clearActiveClient } = useActiveClient();
  const workspaceRef = useRef({ activeClientId, activeClientName });
  
  // Keep ref updated
  useEffect(() => {
    workspaceRef.current = { activeClientId, activeClientName };
  }, [activeClientId, activeClientName]);

  // Auto-end session after timeout
  useEffect(() => {
    if (!sessionStartTime) return;

    const timeoutId = setTimeout(() => {
      toast.warning("Impersonation session expired");
      endImpersonationInternal();
    }, SESSION_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [sessionStartTime]);

  const logImpersonationAction = async (action: 'start' | 'end', targetUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('admin_impersonation_logs').insert({
        admin_user_id: user.id,
        target_user_id: targetUserId,
        action,
        ip_address: null, // Could fetch from edge function
        user_agent: navigator.userAgent,
        context: 'user_management',
        started_at: action === 'start' ? new Date().toISOString() : undefined,
        ended_at: action === 'end' ? new Date().toISOString() : undefined,
      });
    } catch (error) {
      console.error('Failed to log impersonation action:', error);
    }
  };

  const startImpersonation = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // Store current admin workspace before clearing
      setAdminWorkspace({
        clientId: workspaceRef.current.activeClientId,
        clientName: workspaceRef.current.activeClientName,
      });

      // Clear workspace to avoid data mixing
      clearActiveClient();

      // Fetch target user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('User not found');
      }

      // Fetch target user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      // Fetch target user permissions
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('module, can_view, can_create, can_edit, can_delete')
        .eq('user_id', userId);

      const targetUser: ImpersonatedUser = {
        id: profile.id,
        email: profile.email || '',
        full_name: profile.full_name,
        roles: roles?.map(r => r.role) || [],
        permissions: permissions || [],
      };

      // Log the impersonation start
      await logImpersonationAction('start', userId);

      setImpersonatedUser(targetUser);
      setSessionStartTime(Date.now());
      setAllowWrites(false); // Default to read-only
      
      toast.success(`Now viewing as ${profile.full_name || profile.email}`);
    } catch (error: any) {
      console.error('Failed to start impersonation:', error);
      toast.error(error.message || 'Failed to start impersonation');
      // Restore admin workspace on failure
      setAdminWorkspace(null);
    } finally {
      setLoading(false);
    }
  }, [clearActiveClient]);

  const endImpersonationInternal = useCallback(() => {
    if (impersonatedUser) {
      logImpersonationAction('end', impersonatedUser.id);
    }
    
    // Clear impersonation state
    setImpersonatedUser(null);
    setSessionStartTime(null);
    setAllowWrites(false);
    
    // Clear workspace (admin will need to re-select their workspace)
    clearActiveClient();
    setAdminWorkspace(null);
    
    toast.info('Returned to admin view');
  }, [impersonatedUser, clearActiveClient]);

  const endImpersonation = useCallback(() => {
    endImpersonationInternal();
  }, [endImpersonationInternal]);

  const getEffectiveUserId = useCallback(() => {
    return impersonatedUser?.id || null;
  }, [impersonatedUser]);

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating: !!impersonatedUser,
        impersonatedUser,
        startImpersonation,
        endImpersonation,
        getEffectiveUserId,
        loading,
        allowWrites,
        setAllowWrites,
        adminWorkspace,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
};

export const useImpersonation = (): ImpersonationContextType => {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};
