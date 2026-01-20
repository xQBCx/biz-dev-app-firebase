import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Types
export type ErosIncidentType = 'natural_disaster' | 'medical' | 'security' | 'infrastructure' | 'community' | 'industrial' | 'environmental';
export type ErosSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ErosIncidentStatus = 'active' | 'resolved' | 'escalated' | 'closed' | 'standby';
export type ErosResponderStatus = 'available' | 'on_call' | 'deployed' | 'unavailable' | 'standby';
export type ErosDeploymentStatus = 'requested' | 'accepted' | 'en_route' | 'on_site' | 'completed' | 'cancelled' | 'declined';
export type ErosDeploymentRole = 'commander' | 'team_lead' | 'specialist' | 'support' | 'observer' | 'coordinator';
export type ErosMessagePriority = 'routine' | 'urgent' | 'flash' | 'emergency';

export interface ErosIncident {
  id: string;
  user_id: string;
  incident_type: ErosIncidentType;
  severity: ErosSeverity;
  status: ErosIncidentStatus;
  title: string;
  description: string | null;
  incident_code: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_radius_km: number;
  required_skills: string[];
  required_certifications: string[];
  min_responders: number;
  max_responders: number | null;
  situation_reports: unknown;
  command_structure: unknown;
  compensation_config: unknown;
  estimated_duration_hours: number | null;
  started_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ErosResponderProfile {
  id: string;
  user_id: string;
  verification_status: 'pending' | 'verified' | 'suspended' | 'expired';
  skills: string[];
  certifications: unknown;
  specializations: string[];
  availability_status: ErosResponderStatus;
  availability_schedule: unknown;
  location_lat: number | null;
  location_lng: number | null;
  travel_radius_km: number;
  response_time_minutes: number;
  equipment_available: string[];
  vehicles_available: string[];
  total_deployments: number;
  successful_deployments: number;
  average_rating: number | null;
  total_hours_served: number;
  created_at: string;
}

export interface ErosDeployment {
  id: string;
  incident_id: string;
  responder_id: string;
  role: ErosDeploymentRole;
  status: ErosDeploymentStatus;
  assigned_by: string | null;
  requested_at: string;
  accepted_at: string | null;
  en_route_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  hours_worked: number;
  compensation_earned: number;
  performance_rating: number | null;
  notes: string | null;
  responder?: ErosResponderProfile;
}

// Fetch incidents
export function useErosIncidents(status?: ErosIncidentStatus) {
  return useQuery({
    queryKey: ['eros-incidents', status],
    queryFn: async () => {
      let query = supabase
        .from('eros_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as ErosIncident[];
    },
  });
}

// Fetch single incident with deployments
export function useErosIncident(incidentId: string | undefined) {
  return useQuery({
    queryKey: ['eros-incident', incidentId],
    queryFn: async () => {
      if (!incidentId) return null;

      const { data, error } = await supabase
        .from('eros_incidents')
        .select(`
          *,
          eros_deployments (
            *,
            eros_responder_profiles (*)
          )
        `)
        .eq('id', incidentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!incidentId,
  });
}

// Create incident
export function useCreateErosIncident() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<Omit<ErosIncident, 'id' | 'created_at' | 'updated_at'>>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: incident, error } = await supabase
        .from('eros_incidents')
        .insert({
          title: data.title!,
          incident_type: data.incident_type!,
          severity: data.severity || 'medium',
          description: data.description,
          location_address: data.location_address,
          min_responders: data.min_responders || 1,
          required_skills: data.required_skills || [],
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eros-incidents'] });
      toast.success('Incident created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create incident');
      console.error(error);
    },
  });
}

// Update incident
export function useUpdateErosIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const { data: incident, error } = await supabase
        .from('eros_incidents')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return incident;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eros-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['eros-incident', variables.id] });
      toast.success('Incident updated');
    },
  });
}

// Responder profile hooks
export function useMyResponderProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['eros-responder-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('eros_responder_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as ErosResponderProfile | null;
    },
    enabled: !!user?.id,
  });
}

export function useCreateResponderProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<Omit<ErosResponderProfile, 'id' | 'created_at'>>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: profile, error } = await supabase
        .from('eros_responder_profiles')
        .insert({
          skills: data.skills || [],
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eros-responder-profile'] });
      toast.success('Responder profile created');
    },
  });
}

export function useUpdateResponderProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const { data: profile, error } = await supabase
        .from('eros_responder_profiles')
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eros-responder-profile'] });
      toast.success('Profile updated');
    },
  });
}

// Match responders for an incident
export function useMatchedResponders(incidentId: string | undefined) {
  return useQuery({
    queryKey: ['eros-matched-responders', incidentId],
    queryFn: async () => {
      if (!incidentId) return [];

      // Get incident requirements
      const { data: incident } = await supabase
        .from('eros_incidents')
        .select('required_skills, required_certifications, location_lat, location_lng, location_radius_km')
        .eq('id', incidentId)
        .single();

      if (!incident) return [];

      // Get available responders
      const { data: responders, error } = await supabase
        .from('eros_responder_profiles')
        .select('*')
        .eq('verification_status', 'verified')
        .in('availability_status', ['available', 'on_call']);

      if (error) throw error;

      // Simple matching - in production, use edge function for complex geo + skill matching
      return (responders || []).filter((r: any) => {
        // Check if responder has at least one required skill
        const hasSkill = incident.required_skills?.length === 0 || 
          incident.required_skills?.some((skill: string) => r.skills?.includes(skill));
        return hasSkill;
      });
    },
    enabled: !!incidentId,
  });
}

// Deployment hooks
export function useCreateDeployment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { incident_id: string; responder_id: string; role: ErosDeploymentRole }) => {
      const { data: deployment, error } = await supabase
        .from('eros_deployments')
        .insert({
          ...data,
          assigned_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return deployment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eros-incident', variables.incident_id] });
      toast.success('Responder deployed');
    },
  });
}

export function useUpdateDeploymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, incident_id }: { id: string; status: ErosDeploymentStatus; incident_id: string }) => {
      const updates: Record<string, unknown> = { status };
      
      // Set timestamp based on status
      if (status === 'accepted') updates.accepted_at = new Date().toISOString();
      if (status === 'en_route') updates.en_route_at = new Date().toISOString();
      if (status === 'on_site') updates.arrived_at = new Date().toISOString();
      if (status === 'completed') updates.completed_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('eros_deployments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eros-incident', variables.incident_id] });
      toast.success('Deployment status updated');
    },
  });
}

// Communication log
export function useIncidentCommunications(incidentId: string | undefined) {
  return useQuery({
    queryKey: ['eros-communications', incidentId],
    queryFn: async () => {
      if (!incidentId) return [];

      const { data, error } = await supabase
        .from('eros_communication_log')
        .select('*')
        .eq('incident_id', incidentId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!incidentId,
  });
}

export function useSendCommunication() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { incident_id: string; content: string; priority?: ErosMessagePriority; message_type?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: message, error } = await supabase
        .from('eros_communication_log')
        .insert({
          ...data,
          sender_id: user.id,
          priority: data.priority || 'routine',
          message_type: data.message_type || 'status_update',
        })
        .select()
        .single();

      if (error) throw error;
      return message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['eros-communications', variables.incident_id] });
    },
  });
}
