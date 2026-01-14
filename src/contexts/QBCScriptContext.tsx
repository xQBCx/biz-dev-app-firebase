/**
 * QBC Script Context
 * Provides page-wide QBC mode transformation
 * When enabled, text throughout the app renders as geometric glyphs
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { encodeText } from '@/lib/qbc/encoder';
import { renderSvg } from '@/lib/qbc/renderer2d';
import { LatticeAnchors2D, LatticeRules, EncodedPath, DEFAULT_STYLE, DEFAULT_ORIENTATION } from '@/lib/qbc/types';

// Default Metatron's Cube anchors for inline rendering
const DEFAULT_ANCHORS: LatticeAnchors2D = {
  'A': [0.5, 0],
  'B': [0.75, 0.125],
  'C': [0.875, 0.375],
  'D': [0.875, 0.625],
  'E': [0.75, 0.875],
  'F': [0.5, 1],
  'G': [0.25, 0.875],
  'H': [0.125, 0.625],
  'I': [0.125, 0.375],
  'J': [0.25, 0.125],
  'K': [0.5, 0.25],
  'L': [0.625, 0.5],
  'M': [0.5, 0.75],
  'N': [0.375, 0.5],
  'O': [0.5, 0.5],
  'P': [0.35, 0.25],
  'Q': [0.65, 0.25],
  'R': [0.75, 0.5],
  'S': [0.65, 0.75],
  'T': [0.35, 0.75],
  'U': [0.25, 0.5],
  'V': [0.4, 0.35],
  'W': [0.6, 0.35],
  'X': [0.6, 0.65],
  'Y': [0.4, 0.65],
  'Z': [0.5, 0.4],
  '0': [0.45, 0.45],
  '1': [0.55, 0.45],
  '2': [0.55, 0.55],
  '3': [0.45, 0.55],
  '4': [0.3, 0.35],
  '5': [0.7, 0.35],
  '6': [0.7, 0.65],
  '7': [0.3, 0.65],
  '8': [0.4, 0.5],
  '9': [0.6, 0.5],
  ' ': [0.5, 0.5],
};

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
      const inlineStyle = {
        ...DEFAULT_STYLE,
        strokeColor: 'currentColor',
        strokeWidth: 1.5,
        showNodes: false,
        showGrid: false,
        backgroundColor: 'transparent',
      };
      
      const svg = renderSvg(path, DEFAULT_ANCHORS, inlineStyle, DEFAULT_ORIENTATION);
      
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
