/**
 * QBC 3D Encoder
 * Encodes text into 3D geometric paths using cubic lattices
 */

import { 
  Anchor3D, 
  LatticeAnchors3D, 
  PathEvent3D, 
  EncodedPath3D,
  EXTENDED_CHAR_SETS,
  FULL_CHAR_SET_343
} from './types3d';

/**
 * Normalize text for 3D encoding
 * Supports extended character sets
 */
export function normalizeText3D(text: string, charSet: string = FULL_CHAR_SET_343): string {
  let normalized = text.toUpperCase();
  
  // Filter to only supported characters
  let result = '';
  for (const char of normalized) {
    if (charSet.includes(char)) {
      result += char;
    } else if (char === '\n' || char === '\t') {
      result += ' '; // Replace whitespace with space
    }
    // Silently drop unsupported characters
  }
  
  return result;
}

/**
 * Calculate tick direction in 3D space
 * Perpendicular to the path direction
 */
function getTickDirection3D(
  from: Anchor3D,
  to: Anchor3D
): { dx: number; dy: number; dz: number } {
  // Calculate path direction
  const dirX = to.x - from.x;
  const dirY = to.y - from.y;
  const dirZ = to.z - from.z;
  
  // Calculate perpendicular vector (cross product with up vector)
  // Use (0, 1, 0) as up vector
  const perpX = dirZ;
  const perpY = 0;
  const perpZ = -dirX;
  
  // Normalize
  const length = Math.sqrt(perpX * perpX + perpY * perpY + perpZ * perpZ);
  if (length === 0) {
    return { dx: 0.05, dy: 0, dz: 0 };
  }
  
  return {
    dx: (perpX / length) * 0.05,
    dy: (perpY / length) * 0.05,
    dz: (perpZ / length) * 0.05,
  };
}

/**
 * Encode text into 3D path
 */
export function encodeText3D(
  text: string,
  anchors: LatticeAnchors3D,
  enableTick: boolean = true,
  charSet: string = FULL_CHAR_SET_343
): EncodedPath3D {
  const normalized = normalizeText3D(text, charSet);
  const events: PathEvent3D[] = [];
  const visitedChars: string[] = [];
  
  if (normalized.length === 0) {
    return { events, visitedChars, dimension: '3D' };
  }
  
  let prevChar: string | null = null;
  let prevAnchor: Anchor3D | null = null;
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const anchor = anchors.get(char);
    
    if (!anchor) {
      console.warn(`No anchor found for character: ${char}`);
      continue;
    }
    
    if (i === 0) {
      // First character - move to position
      events.push({
        type: 'move',
        x: anchor.x,
        y: anchor.y,
        z: anchor.z,
        char,
      });
    } else if (char === prevChar && enableTick && prevAnchor) {
      // Repeated character - add tick
      const tick = getTickDirection3D(prevAnchor, anchor);
      
      events.push({
        type: 'tick',
        x: anchor.x + tick.dx,
        y: anchor.y + tick.dy,
        z: anchor.z + tick.dz,
        char,
      });
    } else {
      // Draw line to new position
      events.push({
        type: 'line',
        x: anchor.x,
        y: anchor.y,
        z: anchor.z,
        char,
      });
    }
    
    visitedChars.push(char);
    prevChar = char;
    prevAnchor = anchor;
  }
  
  return { events, visitedChars, dimension: '3D' };
}

/**
 * Decode 3D path back to text
 */
export function decodePath3D(path: EncodedPath3D): string {
  return path.visitedChars.join('');
}

/**
 * Generate 3D path as line segments for rendering
 */
export function getPath3DSegments(
  path: EncodedPath3D
): Array<{ from: Anchor3D; to: Anchor3D; char: string }> {
  const segments: Array<{ from: Anchor3D; to: Anchor3D; char: string }> = [];
  
  let currentPos: Anchor3D | null = null;
  
  for (const event of path.events) {
    const targetPos: Anchor3D = { x: event.x, y: event.y, z: event.z };
    
    if (event.type === 'move') {
      currentPos = targetPos;
    } else if (event.type === 'line' && currentPos) {
      segments.push({
        from: { ...currentPos },
        to: targetPos,
        char: event.char || '',
      });
      currentPos = targetPos;
    } else if (event.type === 'tick' && currentPos) {
      // Tick is a short line from current position
      segments.push({
        from: { ...currentPos },
        to: targetPos,
        char: event.char || '',
      });
      // Don't update currentPos for ticks - return to original
    }
  }
  
  return segments;
}

/**
 * Calculate bounding box of 3D path
 */
export function getPath3DBounds(path: EncodedPath3D): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
} {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  for (const event of path.events) {
    minX = Math.min(minX, event.x);
    maxX = Math.max(maxX, event.x);
    minY = Math.min(minY, event.y);
    maxY = Math.max(maxY, event.y);
    minZ = Math.min(minZ, event.z);
    maxZ = Math.max(maxZ, event.z);
  }
  
  return { minX, maxX, minY, maxY, minZ, maxZ };
}
