/**
 * QBC Script Context
 * Provides page-wide QBC mode transformation
 * When enabled, text throughout the app renders as geometric glyphs
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateInlineSvg, 
  generatePathFromCharacterMap, 
  isValidDbLattice 
} from '@/lib/qbc/dbLatticeConverter';
import { EncodedPath } from '@/lib/qbc/types';

interface DbVertex {
  id: number;
  x: number;
  y: number;
  label?: string;
}

interface DbVertexConfig {
  vertices: DbVertex[];
  edges?: Array<[number, number]>;
}

interface DbCharacterMap {
  [char: string]: [number, number];
}

interface DbLattice {
  id: string;
  lattice_name: string;
  vertex_config: DbVertexConfig;
  character_map: DbCharacterMap;
}

interface QBCScriptContextValue {
  isQBCMode: boolean;
  toggleMode: () => void;
  setMode: (enabled: boolean) => void;
  getGlyphSvg: (text: string, size?: number) => string | null;
  getEncodedPath: (text: string) => EncodedPath | null;
  isReady: boolean;
  latticeLoaded: boolean;
}

const QBCScriptContext = createContext<QBCScriptContextValue | null>(null);

const STORAGE_KEY = 'qbc-script-mode';
const GLYPH_CACHE = new Map<string, string>();

interface QBCScriptProviderProps {
  children: React.ReactNode;
}

export function QBCScriptProvider({ children }: QBCScriptProviderProps) {
  const [isQBCMode, setIsQBCMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });
  
  const [lattice, setLattice] = useState<DbLattice | null>(null);
  const [latticeLoaded, setLatticeLoaded] = useState(false);

  // Fetch default lattice from database
  useEffect(() => {
    async function fetchDefaultLattice() {
      try {
        const { data, error } = await supabase
          .from('qbc_lattices')
          .select('id, lattice_name, vertex_config, character_map')
          .eq('is_default', true)
          .eq('is_private', false)
          .limit(1)
          .single();
        
        if (error) {
          console.warn('QBC: Could not fetch default lattice:', error.message);
          setLatticeLoaded(true);
          return;
        }
        
        if (data && isValidDbLattice(data as unknown as DbLattice)) {
          setLattice(data as unknown as DbLattice);
        }
        setLatticeLoaded(true);
      } catch (err) {
        console.error('QBC: Error fetching lattice:', err);
        setLatticeLoaded(true);
      }
    }
    
    fetchDefaultLattice();
  }, []);

  // Persist mode preference and update document class
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isQBCMode));
    
    if (isQBCMode) {
      document.documentElement.classList.add('qbc-script-mode');
    } else {
      document.documentElement.classList.remove('qbc-script-mode');
    }
  }, [isQBCMode]);

  const toggleMode = useCallback(() => {
    setIsQBCMode(prev => !prev);
    // Clear cache on mode toggle to force re-animation
    GLYPH_CACHE.clear();
  }, []);

  const setMode = useCallback((enabled: boolean) => {
    setIsQBCMode(enabled);
    if (enabled) {
      GLYPH_CACHE.clear();
    }
  }, []);

  const getEncodedPath = useCallback((text: string): EncodedPath | null => {
    if (!text || text.trim().length === 0) return null;
    if (!lattice) return null;
    
    try {
      return generatePathFromCharacterMap(
        text, 
        lattice.vertex_config, 
        lattice.character_map
      );
    } catch (error) {
      console.error('QBC encoding error:', error);
      return null;
    }
  }, [lattice]);

  const getGlyphSvg = useCallback((text: string, size: number = 24): string | null => {
    if (!text || text.trim().length === 0) return null;
    if (!lattice) return null;
    
    // Check cache
    const cacheKey = `${text}-${size}`;
    if (GLYPH_CACHE.has(cacheKey)) {
      return GLYPH_CACHE.get(cacheKey)!;
    }
    
    try {
      const svg = generateInlineSvg(
        text,
        lattice.vertex_config,
        lattice.character_map,
        size
      );
      
      if (svg) {
        GLYPH_CACHE.set(cacheKey, svg);
      }
      return svg || null;
    } catch (error) {
      console.error('QBC SVG generation error:', error);
      return null;
    }
  }, [lattice]);

  const isReady = latticeLoaded && !!lattice;

  const value = useMemo(() => ({
    isQBCMode,
    toggleMode,
    setMode,
    getGlyphSvg,
    getEncodedPath,
    isReady,
    latticeLoaded,
  }), [isQBCMode, toggleMode, setMode, getGlyphSvg, getEncodedPath, isReady, latticeLoaded]);

  return (
    <QBCScriptContext.Provider value={value}>
      {children}
    </QBCScriptContext.Provider>
  );
}

export function useQBCScript(): QBCScriptContextValue {
  const context = useContext(QBCScriptContext);
  if (!context) {
    throw new Error('useQBCScript must be used within a QBCScriptProvider');
  }
  return context;
}

// Safe hook that returns defaults when outside provider
export function useQBCScriptSafe(): QBCScriptContextValue {
  const context = useContext(QBCScriptContext);
  if (!context) {
    return {
      isQBCMode: false,
      toggleMode: () => {},
      setMode: () => {},
      getGlyphSvg: () => null,
      getEncodedPath: () => null,
      isReady: false,
      latticeLoaded: false,
    };
  }
  return context;
}
