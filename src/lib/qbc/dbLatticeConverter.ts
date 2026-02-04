/**
 * DB Lattice Converter
 * Converts database lattice format (vertex_config + character_map) 
 * to rendering format for QBC glyphs
 */

import { LatticeAnchors2D, EncodedPath, PathEvent } from './types';

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
  [char: string]: [number, number]; // [fromVertexId, toVertexId]
}

interface DbLattice {
  vertex_config?: DbVertexConfig;
  character_map?: DbCharacterMap;
}

/**
 * Normalize vertex coordinates from DB format to 0-1 range
 * DB vertices might use different coordinate systems (e.g., -100 to 100)
 */
function normalizeVertexCoordinates(vertices: DbVertex[]): Map<number, [number, number]> {
  if (vertices.length === 0) return new Map();
  
  // Find bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  for (const v of vertices) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
  }
  
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  
  // Add padding to keep glyphs from touching edges
  const padding = 0.1;
  const scale = 1 - padding * 2;
  
  const normalized = new Map<number, [number, number]>();
  
  for (const v of vertices) {
    const nx = padding + ((v.x - minX) / rangeX) * scale;
    const ny = padding + ((v.y - minY) / rangeY) * scale;
    normalized.set(v.id, [nx, ny]);
  }
  
  return normalized;
}

/**
 * Convert DB lattice to LatticeAnchors2D format
 * Maps each character to its "destination" vertex position
 */
export function convertDbLatticeToAnchors(
  vertexConfig: DbVertexConfig,
  characterMap: DbCharacterMap
): LatticeAnchors2D {
  const normalizedVertices = normalizeVertexCoordinates(vertexConfig.vertices);
  const anchors: LatticeAnchors2D = {};
  
  for (const [char, [_fromId, toId]] of Object.entries(characterMap)) {
    const coords = normalizedVertices.get(toId);
    if (coords) {
      anchors[char] = coords;
    }
  }
  
  return anchors;
}

/**
 * Generate path from text using DB character map
 * This creates line segments between vertex pairs for each character
 */
export function generatePathFromCharacterMap(
  text: string,
  vertexConfig: DbVertexConfig,
  characterMap: DbCharacterMap
): EncodedPath {
  const normalizedVertices = normalizeVertexCoordinates(vertexConfig.vertices);
  const events: PathEvent[] = [];
  const visitedChars: string[] = [];
  const visitCounts: Record<string, number> = {};
  const normalizedText = text.toUpperCase();
  
  let isFirst = true;
  let lastX = 0;
  let lastY = 0;
  
  for (const char of normalizedText) {
    const mapping = characterMap[char];
    if (!mapping) {
      // Skip unmapped characters but still track them
      if (char !== ' ') {
        visitedChars.push(char);
      }
      continue;
    }
    
    const [fromId, toId] = mapping;
    const fromCoords = normalizedVertices.get(fromId);
    const toCoords = normalizedVertices.get(toId);
    
    if (!fromCoords || !toCoords) continue;
    
    const [fromX, fromY] = fromCoords;
    const [toX, toY] = toCoords;
    
    visitedChars.push(char);
    visitCounts[char] = (visitCounts[char] || 0) + 1;
    
    if (isFirst) {
      // Move to the start of first character's edge
      events.push({ type: 'move', x: fromX, y: fromY, char });
      events.push({ type: 'line', x: toX, y: toY, char });
      lastX = toX;
      lastY = toY;
      isFirst = false;
    } else {
      // Check if we need to move (if not continuing from last position)
      const distToFrom = Math.sqrt((lastX - fromX) ** 2 + (lastY - fromY) ** 2);
      
      if (distToFrom > 0.01) {
        // Draw connecting line to the start of this edge
        events.push({ type: 'line', x: fromX, y: fromY, char });
      }
      
      // Draw the character edge
      events.push({ type: 'line', x: toX, y: toY, char });
      lastX = toX;
      lastY = toY;
    }
  }
  
  return { events, visitedChars, visitCounts };
}

/**
 * Check if a database lattice has valid vertex config and character map
 */
export function isValidDbLattice(lattice: DbLattice | null | undefined): boolean {
  if (!lattice) return false;
  if (!lattice.vertex_config?.vertices?.length) return false;
  if (!lattice.character_map || Object.keys(lattice.character_map).length === 0) return false;
  return true;
}

/**
 * Generate inline SVG for text using DB lattice
 * Optimized for inline display (no grid, no nodes, currentColor stroke)
 */
export function generateInlineSvg(
  text: string,
  vertexConfig: DbVertexConfig,
  characterMap: DbCharacterMap,
  size: number = 24
): string {
  const path = generatePathFromCharacterMap(text, vertexConfig, characterMap);
  
  if (path.events.length === 0) {
    return '';
  }
  
  // Build SVG path string
  let pathD = '';
  
  for (const event of path.events) {
    // Scale to viewBox (0-100)
    const x = event.x * 100;
    const y = (1 - event.y) * 100; // Flip Y for SVG coordinate system
    
    switch (event.type) {
      case 'move':
        pathD += `M${x.toFixed(1)} ${y.toFixed(1)} `;
        break;
      case 'line':
        pathD += `L${x.toFixed(1)} ${y.toFixed(1)} `;
        break;
    }
  }
  
  // Generate compact inline SVG
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" class="qbc-glyph-svg">
  <path d="${pathD.trim()}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="qbc-glyph-path"/>
</svg>`;
}
