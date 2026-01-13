import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { toast } from "sonner";

export interface CRMGovernment {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  jurisdiction_level: string | null;
  country: string | null;
  state_province: string | null;
  locality: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  annual_budget: number | null;
  population_served: number | null;
  key_initiatives: any;
  procurement_portals: any;
  grant_programs: any;
  industry_focus: string[];
  abundant_resources: string[];
  resource_deficits: string[];
  strategic_opportunities: any;
  research_data: any;
  tags: string[];
  potential_match_score: number;
  perplexity_last_researched: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGovernmentInput {
  name: string;
  jurisdiction_level?: string;
  country?: string;
  state_province?: string;
  locality?: string;
  website?: string;
  phone?: string;
  email?: string;
  description?: string;
  annual_budget?: number;
  population_served?: number;
  industry_focus?: string[];
  tags?: string[];
}

export function useCRMGovernments() {
  const { user } = useAuth();
  const { activeClientId } = useActiveClient();
  const [governments, setGovernments] = useState<CRMGovernment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadGovernments = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('crm_governments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (activeClientId) {
        query = query.eq('client_id', activeClientId);
      } else {
        query = query.is('client_id', null);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;
      setGovernments(data || []);
    } catch (err) {
      console.error('Error loading governments:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadGovernments();
    }
  }, [user, activeClientId]);

  const createGovernment = async (input: CreateGovernmentInput): Promise<CRMGovernment | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('crm_governments')
        .insert({
          user_id: user.id,
          client_id: activeClientId || null,
          ...input
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger research in background
      supabase.functions.invoke('research-entity', {
        body: { entityType: 'government', entityId: data.id }
      }).catch(console.error);

      setGovernments(prev => [data, ...prev]);
      toast.success(`Government "${input.name}" created and research initiated`);
      return data;
    } catch (err) {
      console.error('Error creating government:', err);
      toast.error('Failed to create government');
      return null;
    }
  };

  const updateGovernment = async (id: string, updates: Partial<CreateGovernmentInput>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('crm_governments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setGovernments(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
      toast.success('Government updated');
      return true;
    } catch (err) {
      console.error('Error updating government:', err);
      toast.error('Failed to update government');
      return false;
    }
  };

  const deleteGovernment = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('crm_governments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGovernments(prev => prev.filter(g => g.id !== id));
      toast.success('Government deleted');
      return true;
    } catch (err) {
      console.error('Error deleting government:', err);
      toast.error('Failed to delete government');
      return false;
    }
  };

  const researchGovernment = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('research-entity', {
        body: { entityType: 'government', entityId: id }
      });

      if (error) throw error;

      toast.success('Research initiated');
      // Reload to get updated data
      setTimeout(loadGovernments, 3000);
      return true;
    } catch (err) {
      console.error('Error researching government:', err);
      toast.error('Failed to research government');
      return false;
    }
  };

  return {
    governments,
    isLoading,
    error,
    loadGovernments,
    createGovernment,
    updateGovernment,
    deleteGovernment,
    researchGovernment
  };
}
