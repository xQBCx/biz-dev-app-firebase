import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Recommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  title: string;
  description: string | null;
  reason: string | null;
  priority_score: number;
  metadata: Record<string, any>;
  entity_type: string | null;
  entity_id: string | null;
  action_path: string | null;
  is_dismissed: boolean;
  is_completed: boolean;
  created_at: string;
}

export function useRecommendations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('instincts_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .eq('is_completed', false)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('priority_score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }

      return data as Recommendation[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const dismissMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from('instincts_recommendations')
        .update({ 
          is_dismissed: true, 
          dismissed_at: new Date().toISOString() 
        })
        .eq('id', recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from('instincts_recommendations')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  const refreshRecommendations = async () => {
    if (!user?.id) return;

    try {
      await supabase.functions.invoke('generate-recommendations', {
        body: { user_id: user.id },
      });
      await refetch();
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    }
  };

  return {
    recommendations: recommendations || [],
    isLoading,
    dismiss: dismissMutation.mutate,
    complete: completeMutation.mutate,
    refresh: refreshRecommendations,
    isDismissing: dismissMutation.isPending,
    isCompleting: completeMutation.isPending,
  };
}
