// QBC Composite Encoder
// Splits long text into chunks and creates positioned glyph cells

import { encodeText, normalizeText } from './encoder';
import { LatticeAnchors2D, LatticeRules, EncodedPath } from './types';
import { 
  GlyphCell, 
  CompositeGlyph, 
  CompositeMetadata, 
  ChunkConfig, 
  CompositeLayout,
  DEFAULT_CHUNK_CONFIG 
} from './compositeTypes';

/**
 * Generate a simple hash for the composite
 */
function generateCompositeHash(text: string): string {
  let hash = 0;
  const str = `${text}:${Date.now()}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Split text into chunks of specified size
 */
export function chunkText(text: string, chunkSize: number): string[] {
  const normalized = normalizeText(text);
  const chunks: string[] = [];
  
  // Try to split on word boundaries when possible
  const words = normalized.split(' ');
  let currentChunk = '';
  
  for (const word of words) {
    if (word.length > chunkSize) {
      // Word is longer than chunk size, split it
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      for (let i = 0; i < word.length; i += chunkSize) {
        chunks.push(word.slice(i, i + chunkSize));
      }
    } else if ((currentChunk + ' ' + word).trim().length <= chunkSize) {
      currentChunk = (currentChunk + ' ' + word).trim();
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = word;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks.filter(c => c.length > 0);
}

/**
 * Calculate grid layout positions
 */
function calculateGridLayout(
  count: number, 
  columns: number
): { x: number; y: number; width: number; height: number }[] {
  const rows = Math.ceil(count / columns);
  const cellWidth = 1 / columns;
  const cellHeight = 1 / rows;
  const padding = 0.02;
  
  const positions: { x: number; y: number; width: number; height: number }[] = [];
  
  for (let i = 0; i < count; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    
    positions.push({
      x: col * cellWidth + padding,
      y: row * cellHeight + padding,
      width: cellWidth - padding * 2,
      height: cellHeight - padding * 2,
    });
  }
  
  return positions;
}

/**
 * Calculate hierarchical layout - large center, smaller around
 */
function calculateHierarchicalLayout(
  count: number,
  primaryScale: number
): { x: number; y: number; width: number; height: number }[] {
  const positions: { x: number; y: number; width: number; height: number }[] = [];
  
  if (count === 0) return positions;
  
  // Primary glyph in center
  positions.push({
    x: (1 - primaryScale) / 2,
    y: (1 - primaryScale) / 2,
    width: primaryScale,
    height: primaryScale,
  });
  
  if (count === 1) return positions;
  
  // Secondary glyphs around the edges
  const secondaryCount = count - 1;
  const secondaryScale = (1 - primaryScale) / 2 * 0.9;
  
  // Distribute around the primary
  const corners = [
    { x: 0, y: 0 }, // top-left
    { x: 1 - secondaryScale, y: 0 }, // top-right
    { x: 0, y: 1 - secondaryScale }, // bottom-left
    { x: 1 - secondaryScale, y: 1 - secondaryScale }, // bottom-right
  ];
  
  const edges = [
    { x: 0.5 - secondaryScale / 2, y: 0 }, // top
    { x: 0.5 - secondaryScale / 2, y: 1 - secondaryScale }, // bottom
    { x: 0, y: 0.5 - secondaryScale / 2 }, // left
    { x: 1 - secondaryScale, y: 0.5 - secondaryScale / 2 }, // right
  ];
  
  const allPositions = [...corners, ...edges];
  
  for (let i = 0; i < secondaryCount && i < allPositions.length; i++) {
    positions.push({
      x: allPositions[i].x,
      y: allPositions[i].y,
      width: secondaryScale,
      height: secondaryScale,
    });
  }
  
  return positions;
}

/**
 * Calculate mosaic layout with overlapping glyphs
 */
function calculateMosaicLayout(
  count: number,
  overlapFactor: number
): { x: number; y: number; width: number; height: number }[] {
  const positions: { x: number; y: number; width: number; height: number }[] = [];
  
  // Create a semi-random mosaic pattern
  const baseSize = Math.min(0.4, 1 / Math.sqrt(count));
  const sizeVariation = 0.15;
  
  // Seed for deterministic pseudo-random
  let seed = count * 12345;
  const pseudoRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  
  for (let i = 0; i < count; i++) {
    const sizeMult = 0.8 + pseudoRandom() * sizeVariation * 2;
    const size = baseSize * sizeMult;
    
    positions.push({
      x: pseudoRandom() * (1 - size),
      y: pseudoRandom() * (1 - size),
      width: size,
      height: size,
    });
  }
  
  return positions;
}

/**
 * Create glyph cells from chunks with layout positions
 */
export function createGlyphCells(
  chunks: string[],
  anchors: LatticeAnchors2D,
  rules: LatticeRules,
  config: ChunkConfig
): GlyphCell[] {
  const { layout, gridColumns = 3, primaryScale = 0.5, overlapFactor = 0.1 } = config;
  
  // Calculate positions based on layout
  let positions: { x: number; y: number; width: number; height: number }[];
  
  switch (layout) {
    case 'hierarchical':
      positions = calculateHierarchicalLayout(chunks.length, primaryScale);
      break;
    case 'mosaic':
      positions = calculateMosaicLayout(chunks.length, overlapFactor);
      break;
    case 'grid':
    default:
      positions = calculateGridLayout(chunks.length, gridColumns);
      break;
  }
  
  // Create cells with encoded paths
  return chunks.map((text, i) => {
    const path = encodeText(text, anchors, rules);
    const pos = positions[i] || { x: 0, y: 0, width: 0.2, height: 0.2 };
    
    return {
      id: `cell-${i}`,
      text,
      path,
      x: pos.x,
      y: pos.y,
      width: pos.width,
      height: pos.height,
      rotation: 0,
      zIndex: layout === 'mosaic' ? chunks.length - i : i,
      opacity: layout === 'mosaic' ? 0.85 + (i / chunks.length) * 0.15 : 1,
    };
  });
}

/**
 * Encode long text into a composite glyph structure
 */
export function encodeComposite(
  text: string,
  anchors: LatticeAnchors2D,
  rules: LatticeRules,
  style: any,
  latticeKey: string,
  config: Partial<ChunkConfig> = {}
): CompositeGlyph {
  const fullConfig = { ...DEFAULT_CHUNK_CONFIG, ...config };
  const chunks = chunkText(text, fullConfig.chunkSize);
  const cells = createGlyphCells(chunks, anchors, rules, fullConfig);
  
  const metadata: CompositeMetadata = {
    fullText: normalizeText(text),
    totalChunks: chunks.length,
    chunkSize: fullConfig.chunkSize,
    layout: fullConfig.layout,
    latticeKey,
    timestamp: new Date().toISOString(),
    hash: generateCompositeHash(text),
  };
  
  return {
    version: '1.0',
    metadata,
    cells,
    anchors,
    style,
  };
}
