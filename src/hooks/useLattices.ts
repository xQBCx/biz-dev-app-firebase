/**
 * useLattices Hook
 * Fetches and manages lattices from the database
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LatticeAnchors2D } from '@/lib/qbc/types';
import { Json } from '@/integrations/supabase/types';

// Database lattice structure matching qbc_lattices table
export interface DatabaseLattice {
  id: string;
  lattice_name: string;
  lattice_type: string;
  vertex_config: Json;
  character_map: Json;
  created_at: string;
  updated_at: string;
  is_private: boolean;
  is_default: boolean;
  owner_user_id: string | null;
}

/**
 * Fetch all available lattices
 */
export function useLattices() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['qbc-lattices', user?.id],
    queryFn: async () => {
      // Fetch public lattices and user's private lattices
      let query = supabase
        .from('qbc_lattices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (user?.id) {
        query = query.or(`is_private.eq.false,owner_user_id.eq.${user.id}`);
      } else {
        query = query.eq('is_private', false);
      }
      
      const { data, error } = await query;
      
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
        .eq('is_default', true)
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
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
    mutationFn: async (lattice: { 
      lattice_name: string; 
      lattice_type?: string;
      vertex_config?: Json;
      character_map?: Json;
      is_private?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('qbc_lattices')
        .insert({
          lattice_name: lattice.lattice_name,
          lattice_type: lattice.lattice_type || 'custom',
          vertex_config: lattice.vertex_config || {},
          character_map: lattice.character_map || {},
          is_private: lattice.is_private ?? true,
          owner_user_id: user?.id,
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
  const anchors: LatticeAnchors2D = {};
  
  const vertexConfig = lattice.vertex_config as Array<{ x: number; y: number; label?: string }> | null;
  const characterMap = lattice.character_map as Record<string, { from: number; to: number }> | null;
  
  if (!vertexConfig || !characterMap) {
    return anchors;
  }
  
  // Build character -> vertex position map
  Object.entries(characterMap).forEach(([char, mapping]) => {
    const vertexIndex = mapping.from;
    const vertex = vertexConfig[vertexIndex];
    
    if (vertex) {
      anchors[char] = [vertex.x, vertex.y];
    }
  });
  
  return anchors;
}
