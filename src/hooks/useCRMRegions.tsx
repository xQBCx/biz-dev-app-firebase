import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";
import { useActiveClient } from "@/hooks/useActiveClient";
import { toast } from "sonner";

export interface CRMRegion {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  region_type: string | null;
  country: string | null;
  state_province: string | null;
  boundaries: any;
  population: number | null;
  gdp_estimate: number | null;
  major_industries: string[];
  abundant_resources: string[];
  resource_deficits: string[];
  infrastructure_highlights: string[];
  labor_pool_characteristics: any;
  investment_climate: string | null;
  sustainability_challenges: string[];
  strategic_opportunities: any;
  research_data: any;
  tags: string[];
  potential_match_score: number;
  perplexity_last_researched: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRegionInput {
  name: string;
  region_type?: string;
  country?: string;
  state_province?: string;
  population?: number;
  gdp_estimate?: number;
  major_industries?: string[];
  investment_climate?: string;
  tags?: string[];
}

export function useCRMRegions() {
  const { user } = useAuth();
  const { id: effectiveUserId } = useEffectiveUser();
  const { activeClientId } = useActiveClient();
  const [regions, setRegions] = useState<CRMRegion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadRegions = async () => {
    if (!effectiveUserId) return;
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('crm_regions')
        .select('*')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (activeClientId) {
        query = query.eq('client_id', activeClientId);
      } else {
        query = query.is('client_id', null);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setRegions(data || []);
    } catch (err) {
      console.error('Error loading regions:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveUserId) {
      loadRegions();
    }
  }, [effectiveUserId, activeClientId]);

  const createRegion = async (input: CreateRegionInput): Promise<CRMRegion | null> => {
    if (!effectiveUserId) return null;

    try {
      const { data, error } = await supabase
        .from('crm_regions')
        .insert({
          user_id: effectiveUserId,
          client_id: activeClientId || null,
          ...input
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger research in background
      supabase.functions.invoke('research-entity', {
        body: { entityType: 'region', entityId: data.id }
      }).catch(console.error);

      setRegions(prev => [data, ...prev]);
      toast.success(`Region "${input.name}" created and research initiated`);
      return data;
    } catch (err) {
      console.error('Error creating region:', err);
      toast.error('Failed to create region');
      return null;
    }
  };

  const updateRegion = async (id: string, updates: Partial<CreateRegionInput>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('crm_regions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setRegions(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      toast.success('Region updated');
      return true;
    } catch (err) {
      console.error('Error updating region:', err);
      toast.error('Failed to update region');
      return false;
    }
  };

  const deleteRegion = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('crm_regions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRegions(prev => prev.filter(r => r.id !== id));
      toast.success('Region deleted');
      return true;
    } catch (err) {
      console.error('Error deleting region:', err);
      toast.error('Failed to delete region');
      return false;
    }
  };

  const researchRegion = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('research-entity', {
        body: { entityType: 'region', entityId: id }
      });

      if (error) throw error;

      toast.success('Research initiated');
      setTimeout(loadRegions, 3000);
      return true;
    } catch (err) {
      console.error('Error researching region:', err);
      toast.error('Failed to research region');
      return false;
    }
  };

  return {
    regions,
    isLoading,
    error,
    loadRegions,
    createRegion,
    updateRegion,
    deleteRegion,
    researchRegion
  };
}
