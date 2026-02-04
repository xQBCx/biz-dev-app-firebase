import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLattices } from '@/hooks/useLattices';
import { encodeText, normalizeText } from '@/lib/qbc/encoder';
import type { EncodedPath, GlyphStyle, GlyphOrientation, LatticeAnchors2D, LatticeRules } from '@/lib/qbc/types';

interface GlyphCache {
  [text: string]: string; // text -> SVG string
}

interface QBCScriptContextValue {
  isQBCMode: boolean;
  toggleMode: () => void;
  getGlyphSvg: (text: string) => string | null;
  isReady: boolean;
}

const QBCScriptContext = createContext<QBCScriptContextValue | null>(null);

// Minimal inline style for QBC script - no nodes, no grid, just the glyph path
const INLINE_STYLE: GlyphStyle = {
  strokeWidth: 2,
  strokeColor: 'currentColor',
  nodeSize: 0,
  nodeColor: 'transparent',
  nodeFillColor: 'transparent',
  showNodes: false,
  showGrid: false,
  showLabels: false,
  backgroundColor: 'transparent',
  gridColor: 'transparent',
};

const DEFAULT_ORIENTATION: GlyphOrientation = {
  rotation: 0,
  mirror: false,
  flipVertical: false,
};

/**
 * Generate a lightweight inline SVG for text rendering
 * No background, no nodes, just the stroke path sized for inline use
 */
function generateInlineSvg(
  path: EncodedPath,
  anchors: LatticeAnchors2D,
  orientation: GlyphOrientation = DEFAULT_ORIENTATION
): string {
  const PADDING = 0.05;
  
  // Transform point with orientation
  const transformPoint = (x: number, y: number) => {
    let tx = x, ty = y;
    if (orientation.mirror) tx = 1 - tx;
    if (orientation.flipVertical) ty = 1 - ty;
    
    const radians = (orientation.rotation * Math.PI) / 180;
    const cx = 0.5, cy = 0.5;
    const cosR = Math.cos(radians), sinR = Math.sin(radians);
    const dx = tx - cx, dy = ty - cy;
    
    return {
      x: cx + dx * cosR - dy * sinR,
      y: cy + dx * sinR + dy * cosR,
    };
  };
  
  // Convert to viewBox coordinates (0-100 for simplicity)
  const toSvgCoords = (x: number, y: number) => {
    const t = transformPoint(x, y);
    return {
      sx: PADDING * 100 + t.x * (100 - PADDING * 200),
      sy: PADDING * 100 + (1 - t.y) * (100 - PADDING * 200),
    };
  };
  
  let pathD = '';
  let afterTick = false;
  
  for (const event of path.events) {
    const { sx, sy } = toSvgCoords(event.x, event.y);
    
    switch (event.type) {
      case 'move':
        pathD += `M ${sx.toFixed(2)} ${sy.toFixed(2)} `;
        afterTick = false;
        break;
      case 'line':
        pathD += `L ${sx.toFixed(2)} ${sy.toFixed(2)} `;
        afterTick = false;
        break;
      case 'tick':
        if (event.tickEndX !== undefined && event.tickEndY !== undefined) {
          const { sx: tsx, sy: tsy } = toSvgCoords(event.tickEndX, event.tickEndY);
          pathD += `L ${tsx.toFixed(2)} ${tsy.toFixed(2)} `;
          afterTick = true;
        }
        break;
    }
  }
  
  // Add end cap
  if (path.events.length > 1) {
    const lastEvent = path.events[path.events.length - 1];
    let endX: number, endY: number, prevX: number, prevY: number;
    
    if (lastEvent.type === 'tick' && lastEvent.tickEndX !== undefined && lastEvent.tickEndY !== undefined) {
      const end = toSvgCoords(lastEvent.tickEndX, lastEvent.tickEndY);
      const anchor = toSvgCoords(lastEvent.x, lastEvent.y);
      endX = end.sx; endY = end.sy;
      prevX = anchor.sx; prevY = anchor.sy;
    } else {
      const last = toSvgCoords(lastEvent.x, lastEvent.y);
      endX = last.sx; endY = last.sy;
      
      const prevEvent = path.events[path.events.length - 2];
      if (prevEvent.type === 'tick' && prevEvent.tickEndX !== undefined && prevEvent.tickEndY !== undefined) {
        const prev = toSvgCoords(prevEvent.tickEndX, prevEvent.tickEndY);
        prevX = prev.sx; prevY = prev.sy;
      } else {
        const prev = toSvgCoords(prevEvent.x, prevEvent.y);
        prevX = prev.sx; prevY = prev.sy;
      }
    }
    
    const dx = endX - prevX;
    const dy = endY - prevY;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len > 0) {
      const capLen = 4;
      const perpX = (-dy / len) * capLen;
      const perpY = (dx / len) * capLen;
      
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><path d="${pathD.trim()}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><line x1="${(endX + perpX).toFixed(2)}" y1="${(endY + perpY).toFixed(2)}" x2="${(endX - perpX).toFixed(2)}" y2="${(endY - perpY).toFixed(2)}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`;
    }
  }
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><path d="${pathD.trim()}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function QBCScriptProvider({ children }: { children: React.ReactNode }) {
  const [isQBCMode, setIsQBCMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('qbc-script-mode') === 'true';
    }
    return false;
  });
  
  const [glyphCache, setGlyphCache] = useState<GlyphCache>({});
  const { lattices, loading: latticesLoading, getDefaultLattice } = useLattices();
  
  const lattice = useMemo(() => getDefaultLattice(), [lattices]);
  const isReady = !latticesLoading && !!lattice;
  
  // Persist preference
  useEffect(() => {
    localStorage.setItem('qbc-script-mode', isQBCMode.toString());
  }, [isQBCMode]);
  
  const toggleMode = useCallback(() => {
    setIsQBCMode(prev => !prev);
  }, []);
  
  // Generate and cache glyph SVG for text
  const getGlyphSvg = useCallback((text: string): string | null => {
    if (!lattice) return null;
    
    const normalized = normalizeText(text);
    if (!normalized) return null;
    
    // Check cache
    if (glyphCache[normalized]) {
      return glyphCache[normalized];
    }
    
    // Generate new glyph
    try {
      const path = encodeText(normalized, lattice.anchors_json, lattice.rules_json);
      if (path.events.length === 0) return null;
      
      const svg = generateInlineSvg(path, lattice.anchors_json, DEFAULT_ORIENTATION);
      
      // Cache it
      setGlyphCache(prev => ({ ...prev, [normalized]: svg }));
      
      return svg;
    } catch (err) {
      console.error('Failed to generate glyph for:', text, err);
      return null;
    }
  }, [lattice, glyphCache]);
  
  const value = useMemo(() => ({
    isQBCMode,
    toggleMode,
    getGlyphSvg,
    isReady,
  }), [isQBCMode, toggleMode, getGlyphSvg, isReady]);
  
  return (
    <QBCScriptContext.Provider value={value}>
      {children}
    </QBCScriptContext.Provider>
  );
}

export function useQBCScript() {
  const context = useContext(QBCScriptContext);
  if (!context) {
    throw new Error('useQBCScript must be used within a QBCScriptProvider');
  }
  return context;
}
