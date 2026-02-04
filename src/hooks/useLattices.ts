import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Lattice, LatticeAnchors2D, LatticeAnchors3D, LatticeRulesRaw, LatticeStyle } from '@/lib/qbc/types';
import { normalizeLatticeRules } from '@/lib/qbc/types';

export function useLattices() {
  const [lattices, setLattices] = useState<Lattice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLattices() {
      try {
        const { data, error: fetchError } = await supabase
          .from('lattices')
          .select('*')
          .eq('is_active', true)
          .order('is_default', { ascending: false });

        if (fetchError) throw fetchError;

        // Transform the data to match our Lattice type
        // Normalize rules_json to handle legacy field names
        const transformed: Lattice[] = (data || []).map((row) => ({
          id: row.id,
          lattice_key: row.lattice_key,
          version: row.version,
          name: row.name,
          description: row.description,
          anchors_json: row.anchors_json as unknown as LatticeAnchors2D,
          anchors_3d_json: row.anchors_3d_json as unknown as LatticeAnchors3D | null,
          // Normalize rules to standard format (handles legacy notchLengthFactor etc.)
          rules_json: normalizeLatticeRules(row.rules_json as unknown as LatticeRulesRaw),
          style_json: row.style_json as unknown as LatticeStyle,
          is_default: row.is_default,
          is_active: row.is_active,
          is_locked: row.is_locked,
          created_by: row.created_by,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));

        setLattices(transformed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lattices');
      } finally {
        setLoading(false);
      }
    }

    fetchLattices();
  }, []);

  const getDefaultLattice = () => lattices.find((l) => l.is_default) || lattices[0];

  return { lattices, loading, error, getDefaultLattice };
}
