import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface BroadcastSegment {
  id: string;
  segment_type: string;
  title: string;
  summary: string | null;
  content: string | null;
  source_urls: string[] | null;
  source_data: Json | null;
  video_url: string | null;
  video_status: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  achievement_id: string | null;
  sector: string | null;
  tags: string[] | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface BDAchievement {
  id: string;
  user_id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  achievement_type: string;
  risk_tolerance: number | null;
  execution_speed: number | null;
  metrics: Json | null;
  verified: boolean;
  visibility: string;
  created_at: string;
}

export function useBroadcast() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<BroadcastSegment[]>([]);
  const [achievements, setAchievements] = useState<BDAchievement[]>([]);

  const fetchSegments = useCallback(async (sector?: string, limit = 20) => {
    setLoading(true);
    try {
      let query = supabase
        .from('broadcast_segments')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (sector) {
        query = query.eq('sector', sector);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSegments((data || []) as BroadcastSegment[]);
    } catch (error) {
      console.error('Error fetching segments:', error);
      toast.error('Failed to load broadcast segments');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAchievements = useCallback(async (limit = 10) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bd_achievements')
        .select('*')
        .eq('visibility', 'public')
        .eq('verified', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setAchievements((data || []) as BDAchievement[]);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const curateNews = useCallback(async (sector?: string, topic?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('broadcast-curate-news', {
        body: { sector, topic, limit: 5 },
      });

      if (error) throw error;
      
      toast.success(`Generated ${data.count} news segments`);
      await fetchSegments(sector);
      return data.segments;
    } catch (error) {
      console.error('Error curating news:', error);
      toast.error('Failed to curate news');
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchSegments]);

  const askQuestion = useCallback(async (segmentId: string, question: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('broadcast-qa', {
        body: { segmentId, question },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error asking question:', error);
      toast.error('Failed to get answer');
      return null;
    }
  }, []);

  const logInteraction = useCallback(async (
    segmentId: string,
    interactionType: string,
    metadata?: Json
  ) => {
    if (!user?.id) return;

    try {
      await supabase.from('broadcast_interactions').insert([{
        user_id: user.id,
        segment_id: segmentId,
        interaction_type: interactionType,
        metadata: metadata || {},
      }]);
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }, [user?.id]);

  const createAchievement = useCallback(async (achievement: {
    title: string;
    description?: string;
    achievement_type?: string;
    company_id?: string;
    risk_tolerance?: number;
    execution_speed?: number;
    metrics?: Json;
    visibility?: string;
  }) => {
    if (!user?.id) {
      toast.error('You must be logged in');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('bd_achievements')
        .insert([{
          title: achievement.title,
          description: achievement.description,
          achievement_type: achievement.achievement_type || 'milestone',
          company_id: achievement.company_id,
          risk_tolerance: achievement.risk_tolerance,
          execution_speed: achievement.execution_speed,
          metrics: achievement.metrics || {},
          visibility: achievement.visibility || 'public',
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Achievement created');
      return data;
    } catch (error) {
      console.error('Error creating achievement:', error);
      toast.error('Failed to create achievement');
      return null;
    }
  }, [user?.id]);

  return {
    loading,
    segments,
    achievements,
    fetchSegments,
    fetchAchievements,
    curateNews,
    askQuestion,
    logInteraction,
    createAchievement,
  };
}