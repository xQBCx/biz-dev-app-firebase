/**
 * useLattices Hook
 * Fetches and manages lattices from the database
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LatticeAnchors2D } from '@/lib/qbc/types';

export interface DatabaseLattice {
  id: string;
  name: string;
  type: string;
  vertices: any[];
  edges: any[];
  character_map: Record<string, { from: number; to: number }>;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  user_id: string | null;
}

/**
 * Fetch all available lattices
 */
export function useLattices() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['qbc-lattices', user?.id],
    queryFn: async () => {
      const query = supabase
        .from('qbc_lattices')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fetch public lattices and user's private lattices
      const { data, error } = await query.or(
        `is_public.eq.true,user_id.eq.${user?.id || 'null'}`
      );
      
      if (error) throw error;
      return data as DatabaseLattice[];
    },
    enabled: true,
  });
}

/**
 * Get the default lattice
 */
export function useDefaultLattice() {
  return useQuery({
    queryKey: ['qbc-default-lattice'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qbc_lattices')
        .select('*')
        .eq('is_public', true)
        .eq('type', 'metatron')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as DatabaseLattice | null;
    },
  });
}

/**
 * Get a specific lattice by ID
 */
export function useLattice(id: string | undefined) {
  return useQuery({
    queryKey: ['qbc-lattice', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('qbc_lattices')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as DatabaseLattice;
    },
    enabled: !!id,
  });
}

/**
 * Create a new lattice
 */
export function useCreateLattice() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (lattice: Partial<DatabaseLattice>) => {
      const { data, error } = await supabase
        .from('qbc_lattices')
        .insert({
          ...lattice,
          user_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qbc-lattices'] });
    },
  });
}

/**
 * Update an existing lattice
 */
export function useUpdateLattice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DatabaseLattice> & { id: string }) => {
      const { data, error } = await supabase
        .from('qbc_lattices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['qbc-lattices'] });
      queryClient.invalidateQueries({ queryKey: ['qbc-lattice', data.id] });
    },
  });
}

/**
 * Delete a lattice
 */
export function useDeleteLattice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('qbc_lattices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qbc-lattices'] });
    },
  });
}

/**
 * Convert database lattice to LatticeAnchors2D format
 */
export function toLatticeAnchors2D(lattice: DatabaseLattice): LatticeAnchors2D {
  const anchors: LatticeAnchors2D = new Map();
  
  if (!lattice.vertices || !lattice.character_map) {
    return anchors;
  }
  
  // Build character -> vertex position map
  Object.entries(lattice.character_map).forEach(([char, mapping]) => {
    const vertexIndex = mapping.from;
    const vertex = lattice.vertices[vertexIndex];
    
    if (vertex) {
      anchors.set(char, { x: vertex.x, y: vertex.y });
    }
  });
  
  return anchors;
}
