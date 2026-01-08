import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface EnterpriseRisk {
  id: string;
  risk_id: string;
  category: string;
  title: string;
  description: string | null;
  likelihood_score: number | null;
  impact_score: number | null;
  inherent_risk_score: number | null;
  residual_risk_score: number | null;
  risk_owner_id: string | null;
  risk_appetite_threshold: number | null;
  status: string;
  linked_deal_rooms: string[] | null;
  linked_workflows: string[] | null;
  mitigation_strategy: string | null;
  review_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface KeyRiskIndicator {
  id: string;
  risk_id: string | null;
  kri_name: string;
  metric_source: string | null;
  current_value: number | null;
  threshold_warning: number | null;
  threshold_critical: number | null;
  unit: string | null;
  last_updated: string;
  trend: string | null;
  created_at: string;
}

export function useEnterpriseRisks() {
  const { user } = useAuth();
  const [risks, setRisks] = useState<EnterpriseRisk[]>([]);
  const [kris, setKRIs] = useState<KeyRiskIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch risks sorted by inherent score descending
      const { data: risksData, error: risksError } = await supabase
        .from('enterprise_risks')
        .select('*')
        .order('inherent_risk_score', { ascending: false, nullsFirst: false });

      if (risksError) throw risksError;
      setRisks(risksData || []);

      // Fetch KRIs
      const { data: krisData, error: krisError } = await supabase
        .from('key_risk_indicators')
        .select('*')
        .order('last_updated', { ascending: false });

      if (krisError) throw krisError;
      setKRIs(krisData || []);

    } catch (err: any) {
      console.error('Error fetching enterprise risks:', err);
      setError(err.message || 'Failed to fetch risk data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createRisk = async (risk: Partial<EnterpriseRisk>) => {
    const { data, error } = await supabase
      .from('enterprise_risks')
      .insert([{
        title: risk.title || 'Untitled Risk',
        category: risk.category || 'operational',
        risk_id: risk.risk_id || `RISK-${Date.now()}`,
        description: risk.description,
        likelihood_score: risk.likelihood_score,
        impact_score: risk.impact_score,
        status: risk.status,
        mitigation_strategy: risk.mitigation_strategy,
      }])
      .select()
      .single();

    if (error) throw error;
    setRisks(prev => [data, ...prev]);
    return data;
  };

  const updateRisk = async (id: string, updates: Partial<EnterpriseRisk>) => {
    const { data, error } = await supabase
      .from('enterprise_risks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setRisks(prev => prev.map(r => r.id === id ? data : r));
    return data;
  };

  const deleteRisk = async (id: string) => {
    const { error } = await supabase
      .from('enterprise_risks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setRisks(prev => prev.filter(r => r.id !== id));
  };

  const createKRI = async (kri: Partial<KeyRiskIndicator>) => {
    const { data, error } = await supabase
      .from('key_risk_indicators')
      .insert([{
        kri_name: kri.kri_name || 'Untitled KRI',
        risk_id: kri.risk_id,
        metric_source: kri.metric_source,
        current_value: kri.current_value,
        threshold_warning: kri.threshold_warning,
        threshold_critical: kri.threshold_critical,
        unit: kri.unit,
        trend: kri.trend,
      }])
      .select()
      .single();

    if (error) throw error;
    setKRIs(prev => [data, ...prev]);
    return data;
  };

  const updateKRI = async (id: string, updates: Partial<KeyRiskIndicator>) => {
    const { data, error } = await supabase
      .from('key_risk_indicators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setKRIs(prev => prev.map(k => k.id === id ? data : k));
    return data;
  };

  return {
    risks,
    kris,
    loading,
    error,
    refresh: fetchData,
    createRisk,
    updateRisk,
    deleteRisk,
    createKRI,
    updateKRI,
  };
}
