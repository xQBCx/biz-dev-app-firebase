/**
 * QBC Script Context
 * Provides page-wide QBC mode transformation
 * When enabled, text throughout the app renders as geometric glyphs
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useLattices } from '@/hooks/useLattices';
import { encodeText, normalizeText } from '@/lib/qbc/encoder';
import { renderSvg } from '@/lib/qbc/renderer2d';
import { EncodedPath, DEFAULT_STYLE, DEFAULT_ORIENTATION, LatticeAnchors2D, LatticeRules, normalizeLatticeRules } from '@/lib/qbc/types';

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
  
  // Use the lattices hook to fetch from the new table
  const { lattices, loading, getDefaultLattice } = useLattices();
  
  // Get default lattice from the fetched list
  const defaultLattice = !loading ? getDefaultLattice() : null;

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
    if (!defaultLattice) return null;
    
    try {
      const anchors = defaultLattice.anchors_json as LatticeAnchors2D;
      const rules = normalizeLatticeRules(defaultLattice.rules_json);
      return encodeText(text, anchors, rules);
    } catch (error) {
      console.error('QBC encoding error:', error);
      return null;
    }
  }, [defaultLattice]);

  const getGlyphSvg = useCallback((text: string, size: number = 24): string | null => {
    if (!text || text.trim().length === 0) return null;
    if (!defaultLattice) return null;
    
    // Check cache
    const cacheKey = `${text}-${size}`;
    if (GLYPH_CACHE.has(cacheKey)) {
      return GLYPH_CACHE.get(cacheKey)!;
    }
    
    try {
      const anchors = defaultLattice.anchors_json as LatticeAnchors2D;
      const rules = normalizeLatticeRules(defaultLattice.rules_json);
      const path = encodeText(text, anchors, rules);
      
      // Generate inline SVG (smaller, no background)
      const style = {
        ...DEFAULT_STYLE,
        showNodes: false,
        showGrid: false,
        backgroundColor: 'transparent',
        strokeColor: 'currentColor',
      };
      
      const svg = renderSvg(path, anchors, style, DEFAULT_ORIENTATION);
      
      // Convert to inline SVG (strip XML declaration, adjust viewBox)
      const inlineSvg = svg
        .replace(/<\?xml[^?]*\?>\n?/, '')
        .replace(/width="\d+"/, `width="${size}"`)
        .replace(/height="\d+"/, `height="${size}"`);
      
      GLYPH_CACHE.set(cacheKey, inlineSvg);
      return inlineSvg;
    } catch (error) {
      console.error('QBC SVG generation error:', error);
      return null;
    }
  }, [defaultLattice]);

  const isReady = !loading && !!defaultLattice;
  const latticeLoaded = !loading;

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
