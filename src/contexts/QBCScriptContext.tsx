/**
 * QBC Script Context
 * Provides page-wide QBC mode transformation
 * When enabled, text throughout the app renders as geometric glyphs
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { encodeText } from '@/lib/qbc/encoder';
import { renderPathToSVG } from '@/lib/qbc/renderer2d';
import { LatticeAnchors2D, LatticeRules, EncodedPath } from '@/lib/qbc/types';

// Default Metatron's Cube anchors for inline rendering
const DEFAULT_ANCHORS: LatticeAnchors2D = new Map([
  ['A', { x: 0.5, y: 0 }],
  ['B', { x: 0.75, y: 0.125 }],
  ['C', { x: 0.875, y: 0.375 }],
  ['D', { x: 0.875, y: 0.625 }],
  ['E', { x: 0.75, y: 0.875 }],
  ['F', { x: 0.5, y: 1 }],
  ['G', { x: 0.25, y: 0.875 }],
  ['H', { x: 0.125, y: 0.625 }],
  ['I', { x: 0.125, y: 0.375 }],
  ['J', { x: 0.25, y: 0.125 }],
  ['K', { x: 0.5, y: 0.25 }],
  ['L', { x: 0.625, y: 0.5 }],
  ['M', { x: 0.5, y: 0.75 }],
  ['N', { x: 0.375, y: 0.5 }],
  ['O', { x: 0.5, y: 0.5 }],
  ['P', { x: 0.35, y: 0.25 }],
  ['Q', { x: 0.65, y: 0.25 }],
  ['R', { x: 0.75, y: 0.5 }],
  ['S', { x: 0.65, y: 0.75 }],
  ['T', { x: 0.35, y: 0.75 }],
  ['U', { x: 0.25, y: 0.5 }],
  ['V', { x: 0.4, y: 0.35 }],
  ['W', { x: 0.6, y: 0.35 }],
  ['X', { x: 0.6, y: 0.65 }],
  ['Y', { x: 0.4, y: 0.65 }],
  ['Z', { x: 0.5, y: 0.4 }],
  ['0', { x: 0.45, y: 0.45 }],
  ['1', { x: 0.55, y: 0.45 }],
  ['2', { x: 0.55, y: 0.55 }],
  ['3', { x: 0.45, y: 0.55 }],
  ['4', { x: 0.3, y: 0.35 }],
  ['5', { x: 0.7, y: 0.35 }],
  ['6', { x: 0.7, y: 0.65 }],
  ['7', { x: 0.3, y: 0.65 }],
  ['8', { x: 0.4, y: 0.5 }],
  ['9', { x: 0.6, y: 0.5 }],
  [' ', { x: 0.5, y: 0.5 }],
]);

const DEFAULT_RULES: LatticeRules = {
  enableTick: true,
  tickLengthFactor: 0.08,
  insideBoundaryPreference: true,
  nodeSpacing: 0.2,
};

interface QBCScriptContextValue {
  isQBCMode: boolean;
  toggleMode: () => void;
  setMode: (enabled: boolean) => void;
  getGlyphSvg: (text: string, size?: number) => string | null;
  getEncodedPath: (text: string) => EncodedPath | null;
  isReady: boolean;
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
  
  const [isReady] = useState(true); // Always ready with default lattice

  // Persist mode preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isQBCMode));
    
    // Add/remove class on document for global styling
    if (isQBCMode) {
      document.documentElement.classList.add('qbc-script-mode');
    } else {
      document.documentElement.classList.remove('qbc-script-mode');
    }
  }, [isQBCMode]);

  const toggleMode = useCallback(() => {
    setIsQBCMode(prev => !prev);
  }, []);

  const setMode = useCallback((enabled: boolean) => {
    setIsQBCMode(enabled);
  }, []);

  const getEncodedPath = useCallback((text: string): EncodedPath | null => {
    if (!text || text.trim().length === 0) return null;
    
    try {
      return encodeText(text, DEFAULT_ANCHORS, DEFAULT_RULES);
    } catch (error) {
      console.error('QBC encoding error:', error);
      return null;
    }
  }, []);

  const getGlyphSvg = useCallback((text: string, size: number = 24): string | null => {
    if (!text || text.trim().length === 0) return null;
    
    // Check cache
    const cacheKey = `${text}-${size}`;
    if (GLYPH_CACHE.has(cacheKey)) {
      return GLYPH_CACHE.get(cacheKey)!;
    }
    
    try {
      const path = encodeText(text, DEFAULT_ANCHORS, DEFAULT_RULES);
      
      // Generate lightweight inline SVG
      const svg = renderPathToSVG(path, DEFAULT_ANCHORS, {
        width: size,
        height: size,
        strokeColor: 'currentColor',
        strokeWidth: 1.5,
        showNodes: false,
        showBackground: false,
        padding: 2,
      });
      
      GLYPH_CACHE.set(cacheKey, svg);
      return svg;
    } catch (error) {
      console.error('QBC SVG generation error:', error);
      return null;
    }
  }, []);

  const value = useMemo(() => ({
    isQBCMode,
    toggleMode,
    setMode,
    getGlyphSvg,
    getEncodedPath,
    isReady,
  }), [isQBCMode, toggleMode, setMode, getGlyphSvg, getEncodedPath, isReady]);

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
    };
  }
  return context;
}
