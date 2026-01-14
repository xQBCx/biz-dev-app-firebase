// QBC Encoder - Text to Glyph Path

import {
  LatticeAnchors2D,
  LatticeRules,
  EncodedPath,
  PathEvent,
} from './types';

/**
 * Normalize text: uppercase, strip unsupported chars (keep A-Z and space)
 */
export function normalizeText(text: string, replaceUnsupported = true): string {
  const upper = text.toUpperCase();
  if (replaceUnsupported) {
    // Replace unsupported chars with space, then collapse multiple spaces
    return upper
      .replace(/[^A-Z ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  // Strip unsupported chars entirely
  return upper.replace(/[^A-Z ]/g, '');
}

/**
 * Calculate tick direction - must stay inside the lattice boundary
 * Returns the direction as a unit vector
 */
function getTickDirection(
  x: number,
  y: number,
  prevX: number,
  prevY: number
): { dx: number; dy: number } {
  // Vector from previous point to current
  const dx = x - prevX;
  const dy = y - prevY;

  // Choose perpendicular that keeps tick inside lattice (0-1)
  // Perpendicular options: (dy, -dx) or (-dy, dx)
  const candidates = [
    { dx: dy, dy: -dx },
    { dx: -dy, dy: dx },
  ];

  // Prefer candidate that stays further inside the boundary
  const margin = (c: { dx: number; dy: number }) => {
    const ex = x + c.dx * 0.08;
    const ey = y + c.dy * 0.08;
    return Math.min(ex, 1 - ex, ey, 1 - ey);
  };

  candidates.sort((a, b) => margin(b) - margin(a));
  const best = candidates[0];

  // Normalize
  const len = Math.hypot(best.dx, best.dy) || 1;
  return { dx: best.dx / len, dy: best.dy / len };
}

/**
 * Encode text into a glyph path using the given lattice
 */
export function encodeText(
  text: string,
  anchors: LatticeAnchors2D,
  rules: LatticeRules
): EncodedPath {
  const normalized = normalizeText(text);
  const chars = normalized.split('');
  
  const events: PathEvent[] = [];
  const visitCounts: Record<string, number> = {};
  const visitedChars: string[] = [];
  
  // Track the current pen position (where the path continues from)
  let penX = 0;
  let penY = 0;

  // Track the previous pen position (used to compute "incoming direction" for ticks,
  // especially for immediate double letters where penX/penY equals the anchor)
  let prevPenX = 0;
  let prevPenY = 0;
  
  let prevChar: string | null = null;
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const anchor = anchors[char];
    
    if (!anchor) continue;
    
    const [x, y] = anchor;
    const isFirstChar = events.length === 0;
    const isRepeat = prevChar === char || visitCounts[char] > 0;
    
    // Track visits
    visitCounts[char] = (visitCounts[char] || 0) + 1;
    visitedChars.push(char);
    
    if (isFirstChar) {
      // First character: move to position (filled dot will be rendered)
      events.push({
        type: 'move',
        char,
        x,
        y,
      });
      penX = x;
      penY = y;
      prevPenX = x;
      prevPenY = y;
    } else if (isRepeat && rules.enableTick) {
      // Repeated letter (immediate double OR revisit): draw line to anchor, then tick
      // First, draw line to the anchor point
      events.push({
        type: 'line',
        char,
        x,
        y,
      });
      
       // Compute the incoming direction into this anchor.
       // For immediate doubles (e.g. ...L then L), penX/penY already equals (x,y),
       // so we must use prevPenX/prevPenY to get the true incoming vector.
       const incomingFromX = penX === x && penY === y ? prevPenX : penX;
       const incomingFromY = penX === x && penY === y ? prevPenY : penY;

       // Update pen positions to reflect we're at the anchor now
       prevPenX = incomingFromX;
       prevPenY = incomingFromY;
       penX = x;
       penY = y;

       // Calculate tick endpoint (quarter-notch) perpendicular to the incoming direction
       const tickLength = rules.tickLengthFactor || 0.08;
       const { dx, dy } = getTickDirection(x, y, incomingFromX, incomingFromY);
       const tickEndX = x + dx * tickLength;
       const tickEndY = y + dy * tickLength;

       // Add tick event - path continues FROM tick endpoint
       events.push({
         type: 'tick',
         char,
         x,
         y,
         tickEndX,
         tickEndY,
       });

       // Path continues from tick endpoint
       prevPenX = x;
       prevPenY = y;
       penX = tickEndX;
       penY = tickEndY;
    } else {
      // Normal movement: draw line to anchor
      events.push({
        type: 'line',
        char,
        x,
        y,
      });
      prevPenX = penX;
      prevPenY = penY;
      penX = x;
      penY = y;
    }
    
    prevChar = char;
  }
  
  return {
    events,
    visitedChars,
    visitCounts,
  };
}

/**
 * Decode a path back to text
 */
export function decodePath(path: EncodedPath): string {
  return path.visitedChars.join('');
}

/**
 * Generate a hash for the glyph (for metadata)
 */
export function generateGlyphHash(text: string, latticeKey: string): string {
  const str = `${text}:${latticeKey}:${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
