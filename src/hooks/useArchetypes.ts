import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PlatformArchetype {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  icon_name: string;
  language_config: Record<string, string>;
  onboarding_flow: {
    steps: string[];
    messaging: Record<string, string>;
    featured_modules: string[];
  };
  incentive_config: {
    achievement_language: string;
    reward_language: string;
    progress_language: string;
    rank_system: boolean;
  };
  trust_signals: {
    primary_credentials: string[];
    verification_badges: string[];
    display_priorities: string[];
  };
  default_permissions: Record<string, unknown>;
  role_progressions: {
    pathways: Array<{
      from: string;
      to: string;
      requirements: string[];
    }>;
  };
  theme_config: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useArchetypes() {
  return useQuery({
    queryKey: ['archetypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_archetypes')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as PlatformArchetype[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUserArchetype() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-archetype', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          archetype_id,
          archetype_overrides,
          platform_archetypes (*)
        `)
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data?.platform_archetypes as PlatformArchetype | null;
    },
    enabled: !!user?.id,
  });
}

export function useSetUserArchetype() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (archetypeId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ archetype_id: archetypeId })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log to history
      await supabase
        .from('user_archetype_history')
        .insert({
          user_id: user.id,
          archetype_id: archetypeId,
        });

      return archetypeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-archetype'] });
      toast.success('Archetype updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update archetype');
      console.error('Archetype update error:', error);
    },
  });
}

export function useArchetypeHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['archetype-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_archetype_history')
        .select(`
          *,
          platform_archetypes (display_name, slug)
        `)
        .eq('user_id', user.id)
        .order('selected_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}
