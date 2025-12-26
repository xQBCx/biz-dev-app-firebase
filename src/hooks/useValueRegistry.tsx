import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ValueRegistryAsset {
  id: string;
  asset_type: string;
  name: string;
  description: string | null;
  hs_code: string | null;
  gpc_code: string | null;
  naics_code: string | null;
  custom_category: string | null;
  external_id: string | null;
  serial_number: string | null;
  owner_type: string | null;
  owner_id: string | null;
  location_geo: any;
  jurisdiction: string | null;
  parent_asset_id: string | null;
  is_composite: boolean;
  component_count: number;
  current_value: number | null;
  value_currency: string;
  value_confidence: number | null;
  valuation_method: string | null;
  last_valued_at: string | null;
  metadata: any;
  tags: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface ValueHistoryEntry {
  id: string;
  asset_id: string;
  value: number;
  currency: string;
  confidence_score: number | null;
  valuation_method: string;
  data_source: string | null;
  source_reference: string | null;
  context: any;
  notes: string | null;
  valued_at: string;
  valued_by: string | null;
  created_at: string;
}

export interface ValueEvent {
  id: string;
  asset_id: string;
  event_type: string;
  event_data: any;
  value_before: number | null;
  value_after: number | null;
  value_change: number | null;
  from_owner_id: string | null;
  to_owner_id: string | null;
  verified: boolean;
  verified_by: string | null;
  verification_hash: string | null;
  event_at: string;
  created_at: string;
}

export const ASSET_TYPES = [
  { value: 'physical', label: 'Physical Asset', icon: '📦' },
  { value: 'digital', label: 'Digital Asset', icon: '💾' },
  { value: 'financial', label: 'Financial Instrument', icon: '💰' },
  { value: 'service', label: 'Service', icon: '🔧' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'ip', label: 'Intellectual Property', icon: '💡' },
];

export const VALUATION_METHODS = [
  { value: 'market', label: 'Market Price' },
  { value: 'replacement', label: 'Replacement Cost' },
  { value: 'hedonic', label: 'Hedonic/Attribute' },
  { value: 'dcf', label: 'Discounted Cash Flow' },
  { value: 'cost', label: 'Cost Basis' },
  { value: 'appraisal', label: 'Professional Appraisal' },
];

export function useValueRegistry() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<ValueRegistryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('value_registry_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAssets((data as ValueRegistryAsset[]) || []);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const createAsset = async (asset: Partial<ValueRegistryAsset>) => {
    try {
      const insertData = {
        name: asset.name!,
        asset_type: asset.asset_type!,
        description: asset.description,
        external_id: asset.external_id,
        serial_number: asset.serial_number,
        custom_category: asset.custom_category,
        current_value: asset.current_value,
        value_currency: asset.value_currency,
        valuation_method: asset.valuation_method,
        jurisdiction: asset.jurisdiction,
        tags: asset.tags,
        parent_asset_id: asset.parent_asset_id,
        status: asset.status,
        created_by: user?.id,
      };

      const { data, error: createError } = await supabase
        .from('value_registry_assets')
        .insert(insertData)
        .select()
        .single();

      if (createError) throw createError;

      // Create initial event
      await supabase.from('value_registry_events').insert({
        asset_id: data.id,
        event_type: 'created',
        event_data: { initial_value: asset.current_value },
        value_after: asset.current_value,
      });

      // If has initial value, create history entry
      if (asset.current_value) {
        await supabase.from('value_registry_history').insert({
          asset_id: data.id,
          value: asset.current_value,
          currency: asset.value_currency || 'USD',
          valuation_method: asset.valuation_method || 'manual',
          data_source: 'manual',
          valued_by: user?.id,
        });
      }

      setAssets(prev => [data as ValueRegistryAsset, ...prev]);
      toast.success('Asset registered');
      return data;
    } catch (err: any) {
      toast.error('Failed to create asset: ' + err.message);
      throw err;
    }
  };

  const updateAsset = async (id: string, updates: Partial<ValueRegistryAsset>) => {
    try {
      const oldAsset = assets.find(a => a.id === id);
      
      const { data, error: updateError } = await supabase
        .from('value_registry_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Track value change
      if (updates.current_value !== undefined && oldAsset?.current_value !== updates.current_value) {
        await supabase.from('value_registry_events').insert({
          asset_id: id,
          event_type: 'valued',
          event_data: { method: updates.valuation_method },
          value_before: oldAsset?.current_value,
          value_after: updates.current_value,
          value_change: (updates.current_value || 0) - (oldAsset?.current_value || 0),
        });

        await supabase.from('value_registry_history').insert({
          asset_id: id,
          value: updates.current_value,
          currency: updates.value_currency || 'USD',
          valuation_method: updates.valuation_method || 'manual',
          data_source: 'manual',
          valued_by: user?.id,
        });
      }

      setAssets(prev => prev.map(a => a.id === id ? data as ValueRegistryAsset : a));
      toast.success('Asset updated');
      return data;
    } catch (err: any) {
      toast.error('Failed to update asset: ' + err.message);
      throw err;
    }
  };

  const getAssetHistory = async (assetId: string): Promise<ValueHistoryEntry[]> => {
    const { data, error } = await supabase
      .from('value_registry_history')
      .select('*')
      .eq('asset_id', assetId)
      .order('valued_at', { ascending: false });

    if (error) throw error;
    return (data as ValueHistoryEntry[]) || [];
  };

  const getAssetEvents = async (assetId: string): Promise<ValueEvent[]> => {
    const { data, error } = await supabase
      .from('value_registry_events')
      .select('*')
      .eq('asset_id', assetId)
      .order('event_at', { ascending: false });

    if (error) throw error;
    return (data as ValueEvent[]) || [];
  };

  const getStats = () => {
    const totalValue = assets.reduce((sum, a) => sum + (a.current_value || 0), 0);
    const byType = assets.reduce((acc, a) => {
      acc[a.asset_type] = (acc[a.asset_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalAssets: assets.length,
      totalValue,
      byType,
      activeAssets: assets.filter(a => a.status === 'active').length,
    };
  };

  useEffect(() => {
    fetchAssets();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('value-registry-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'value_registry_assets' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAssets(prev => [payload.new as ValueRegistryAsset, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setAssets(prev => prev.map(a => 
              a.id === payload.new.id ? payload.new as ValueRegistryAsset : a
            ));
          } else if (payload.eventType === 'DELETE') {
            setAssets(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    assets,
    loading,
    error,
    createAsset,
    updateAsset,
    getAssetHistory,
    getAssetEvents,
    getStats,
    refresh: fetchAssets,
  };
}
