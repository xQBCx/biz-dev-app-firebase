import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

// Types
export interface WorkforceRoleTransition {
  id: string;
  user_id: string;
  from_role: string | null;
  to_role: string;
  transition_type: string;
  trigger_source: string | null;
  trigger_entity_id: string | null;
  trigger_entity_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface WorkforceEngagement {
  id: string;
  user_id: string;
  client_id: string | null;
  engagement_type: string;
  title: string;
  description: string | null;
  status: string;
  hourly_rate: number | null;
  project_value: number | null;
  equity_percentage: number | null;
  start_date: string | null;
  end_date: string | null;
  total_hours_logged: number;
  total_earnings: number;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}

export interface WorkforceTimeEntry {
  id: string;
  user_id: string;
  engagement_id: string | null;
  entry_date: string;
  hours: number;
  description: string | null;
  billable: boolean;
  invoiced: boolean;
  invoice_id: string | null;
  created_at: string;
}

export type WorkforceRole = 'responder' | 'worker' | 'capital_participant' | 'owner';

// Role Transitions
export const useRoleTransitions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workforce-role-transitions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workforce_role_transitions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkforceRoleTransition[];
    },
    enabled: !!user,
  });
};

export const useCurrentRole = () => {
  const { data: transitions } = useRoleTransitions();

  if (!transitions || transitions.length === 0) {
    return 'worker' as WorkforceRole; // Default role
  }

  return transitions[0].to_role as WorkforceRole;
};

export const useCreateRoleTransition = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      from_role?: string;
      to_role: string;
      transition_type?: string;
      trigger_source?: string;
      trigger_entity_id?: string;
      trigger_entity_type?: string;
      metadata?: unknown;
    }) => {
      const { error } = await supabase
        .from('workforce_role_transitions')
        .insert([{
          user_id: user!.id,
          from_role: data.from_role,
          to_role: data.to_role,
          transition_type: data.transition_type || 'progression',
          trigger_source: data.trigger_source,
          trigger_entity_id: data.trigger_entity_id,
          trigger_entity_type: data.trigger_entity_type,
          metadata: (data.metadata || {}) as Json,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforce-role-transitions'] });
      toast({ title: "Role Updated", description: "Your workforce role has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Engagements
export const useEngagements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workforce-engagements', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workforce_engagements')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as WorkforceEngagement[];
    },
    enabled: !!user,
  });
};

export const useCreateEngagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      client_id?: string;
      engagement_type: string;
      title: string;
      description?: string;
      hourly_rate?: number;
      project_value?: number;
      equity_percentage?: number;
      start_date?: string;
      end_date?: string;
    }) => {
      const { error } = await supabase
        .from('workforce_engagements')
        .insert([{
          user_id: user!.id,
          ...data,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforce-engagements'] });
      toast({ title: "Engagement Created", description: "New engagement has been added." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateEngagement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, title, description, hourly_rate, project_value }: { 
      id: string; 
      status?: string;
      title?: string;
      description?: string;
      hourly_rate?: number;
      project_value?: number;
    }) => {
      const { error } = await supabase
        .from('workforce_engagements')
        .update({ 
          status, 
          title, 
          description, 
          hourly_rate, 
          project_value,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforce-engagements'] });
      toast({ title: "Engagement Updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Time Entries
export const useTimeEntries = (engagementId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workforce-time-entries', user?.id, engagementId],
    queryFn: async () => {
      let query = supabase
        .from('workforce_time_entries')
        .select('*')
        .eq('user_id', user!.id)
        .order('entry_date', { ascending: false });

      if (engagementId) {
        query = query.eq('engagement_id', engagementId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WorkforceTimeEntry[];
    },
    enabled: !!user,
  });
};

export const useCreateTimeEntry = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      engagement_id?: string;
      entry_date: string;
      hours: number;
      description?: string;
      billable?: boolean;
    }) => {
      const { error } = await supabase
        .from('workforce_time_entries')
        .insert({
          user_id: user!.id,
          ...data,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforce-time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['workforce-engagements'] });
      toast({ title: "Time Logged", description: "Time entry has been recorded." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

// Summary stats
export const useWorkforceSummary = () => {
  const { data: engagements } = useEngagements();
  const { data: timeEntries } = useTimeEntries();

  const activeEngagements = engagements?.filter(e => e.status === 'active') || [];
  const totalHoursThisMonth = timeEntries?.filter(t => {
    const entryDate = new Date(t.entry_date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  }).reduce((sum, t) => sum + t.hours, 0) || 0;

  const totalEarnings = engagements?.reduce((sum, e) => sum + e.total_earnings, 0) || 0;

  return {
    activeEngagements: activeEngagements.length,
    totalHoursThisMonth,
    totalEarnings,
    engagements,
    timeEntries,
  };
};
