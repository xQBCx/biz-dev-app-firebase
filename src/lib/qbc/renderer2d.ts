// QBC 2D SVG Renderer

import {
  EncodedPath,
  GlyphStyle,
  GlyphOrientation,
  LatticeAnchors2D,
} from './types';

const SVG_SIZE = 500;
const PADDING = 40;
const CONTENT_SIZE = SVG_SIZE - PADDING * 2;

/**
 * Transform coordinates based on orientation
 */
function transformPoint(
  x: number,
  y: number,
  orientation: GlyphOrientation
): { x: number; y: number } {
  let tx = x;
  let ty = y;
  
  // Mirror horizontally
  if (orientation.mirror) {
    tx = 1 - tx;
  }
  
  // Flip vertically
  if (orientation.flipVertical) {
    ty = 1 - ty;
  }
  
  // Rotate around center (0.5, 0.5)
  const radians = (orientation.rotation * Math.PI) / 180;
  const cx = 0.5;
  const cy = 0.5;
  
  const cosR = Math.cos(radians);
  const sinR = Math.sin(radians);
  
  const dx = tx - cx;
  const dy = ty - cy;
  
  tx = cx + dx * cosR - dy * sinR;
  ty = cy + dx * sinR + dy * cosR;
  
  return { x: tx, y: ty };
}

/**
 * Convert normalized coordinates (0-1) to SVG coordinates
 */
function toSvgCoords(
  x: number,
  y: number,
  orientation: GlyphOrientation
): { sx: number; sy: number } {
  const transformed = transformPoint(x, y, orientation);
  return {
    sx: PADDING + transformed.x * CONTENT_SIZE,
    sy: PADDING + (1 - transformed.y) * CONTENT_SIZE, // Flip Y for SVG
  };
}

/**
 * Generate SVG for grid lines
 */
function renderGrid(style: GlyphStyle): string {
  if (!style.showGrid) return '';
  
  const lines: string[] = [];
  const gridSpacing = CONTENT_SIZE / 10;
  
  for (let i = 0; i <= 10; i++) {
    const pos = PADDING + i * gridSpacing;
    lines.push(
      `<line x1="${pos}" y1="${PADDING}" x2="${pos}" y2="${SVG_SIZE - PADDING}" stroke="${style.gridColor}" stroke-width="0.5" opacity="0.5"/>`
    );
    lines.push(
      `<line x1="${PADDING}" y1="${pos}" x2="${SVG_SIZE - PADDING}" y2="${pos}" stroke="${style.gridColor}" stroke-width="0.5" opacity="0.5"/>`
    );
  }
  
  return lines.join('\n');
}

/**
 * Generate SVG for anchor nodes
 */
function renderAnchors(
  anchors: LatticeAnchors2D,
  style: GlyphStyle,
  orientation: GlyphOrientation,
  startChar?: string
): string {
  if (!style.showNodes) return '';
  
  const nodes: string[] = [];
  
  for (const [char, [x, y]] of Object.entries(anchors)) {
    const { sx, sy } = toSvgCoords(x, y, orientation);
    const isStart = char === startChar;
    const fill = isStart ? style.nodeColor : style.nodeFillColor;
    
    nodes.push(
      `<circle cx="${sx}" cy="${sy}" r="${style.nodeSize / 2}" fill="${fill}" stroke="${style.nodeColor}" stroke-width="1.5"/>`
    );
    
    if (style.showLabels) {
      const label = char === ' ' ? '⣿' : char;
      nodes.push(
        `<text x="${sx}" y="${sy - style.nodeSize}" text-anchor="middle" font-size="10" font-family="monospace" fill="${style.nodeColor}">${label}</text>`
      );
    }
  }
  
  return nodes.join('\n');
}

/**
 * Generate SVG path for the glyph
 */
function renderPath(
  path: EncodedPath,
  style: GlyphStyle,
  orientation: GlyphOrientation
): string {
  const elements: string[] = [];
  let pathD = '';
  
  // Track last position for tick continuation
  let afterTick = false;
  
  for (const event of path.events) {
    const { sx, sy } = toSvgCoords(event.x, event.y, orientation);
    
    switch (event.type) {
      case 'move':
        pathD += `M ${sx} ${sy} `;
        afterTick = false;
        break;
        
      case 'line':
        // If after a tick, we need to start from tick endpoint
        if (afterTick) {
          // Line already starts from where we left off
        }
        pathD += `L ${sx} ${sy} `;
        afterTick = false;
        break;
        
      case 'tick': {
        // Tick event: the preceding 'line' event already drew to the anchor (event.x, event.y)
        // Now draw the quarter-notch from anchor to tick endpoint
        // Path continues from tick endpoint to next character
        if (event.tickEndX !== undefined && event.tickEndY !== undefined) {
          const { sx: tsx, sy: tsy } = toSvgCoords(event.tickEndX, event.tickEndY, orientation);
          pathD += `L ${tsx} ${tsy} `;
          afterTick = true;
        }
        break;
      }
    }
  }
  
  // Main path
  if (pathD) {
    elements.unshift(
      `<path d="${pathD.trim()}" fill="none" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  }
  
  // End cap (perpendicular line at the last point)
  if (path.events.length > 1) {
    // Find the last two rendered positions for end cap direction
    const lastEvent = path.events[path.events.length - 1];
    let endX: number, endY: number;
    let prevX: number, prevY: number;
    
    // Determine the final point
    if (lastEvent.type === 'tick' && lastEvent.tickEndX !== undefined && lastEvent.tickEndY !== undefined) {
      const { sx: ex, sy: ey } = toSvgCoords(lastEvent.tickEndX, lastEvent.tickEndY, orientation);
      const { sx: ax, sy: ay } = toSvgCoords(lastEvent.x, lastEvent.y, orientation);
      endX = ex;
      endY = ey;
      prevX = ax;
      prevY = ay;
    } else {
      const { sx: lx, sy: ly } = toSvgCoords(lastEvent.x, lastEvent.y, orientation);
      endX = lx;
      endY = ly;
      
      // Find previous event for direction
      const prevEvent = path.events[path.events.length - 2];
      if (prevEvent.type === 'tick' && prevEvent.tickEndX !== undefined && prevEvent.tickEndY !== undefined) {
        const { sx: px, sy: py } = toSvgCoords(prevEvent.tickEndX, prevEvent.tickEndY, orientation);
        prevX = px;
        prevY = py;
      } else {
        const { sx: px, sy: py } = toSvgCoords(prevEvent.x, prevEvent.y, orientation);
        prevX = px;
        prevY = py;
      }
    }
    
    // Calculate perpendicular direction
    const dx = endX - prevX;
    const dy = endY - prevY;
    const len = Math.sqrt(dx * dx + dy * dy);
    
    if (len > 0) {
      const capLen = 8;
      const perpX = (-dy / len) * capLen;
      const perpY = (dx / len) * capLen;
      
      elements.push(
        `<line x1="${endX + perpX}" y1="${endY + perpY}" x2="${endX - perpX}" y2="${endY - perpY}" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" stroke-linecap="round"/>`
      );
    }
  }
  
  return elements.join('\n');
}

/**
 * Render a complete SVG for the glyph
 */
export function renderSvg(
  path: EncodedPath,
  anchors: LatticeAnchors2D,
  style: GlyphStyle,
  orientation: GlyphOrientation
): string {
  const startChar = path.visitedChars[0];
  
  const grid = renderGrid(style);
  const nodes = renderAnchors(anchors, style, orientation, startChar);
  const pathSvg = renderPath(path, style, orientation);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}" width="${SVG_SIZE}" height="${SVG_SIZE}">
  <rect width="100%" height="100%" fill="${style.backgroundColor}"/>
  ${grid}
  ${pathSvg}
  ${nodes}
</svg>`;
}

/**
 * Render SVG as a data URL for embedding
 */
export function renderSvgDataUrl(
  path: EncodedPath,
  anchors: LatticeAnchors2D,
  style: GlyphStyle,
  orientation: GlyphOrientation
): string {
  const svg = renderSvg(path, anchors, style, orientation);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Convert SVG to PNG using canvas
 */
export async function renderPng(
  path: EncodedPath,
  anchors: LatticeAnchors2D,
  style: GlyphStyle,
  orientation: GlyphOrientation,
  size: number = 1024
): Promise<Blob> {
  const svg = renderSvg(path, anchors, style, orientation);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    };
    
    img.onerror = () => reject(new Error('Failed to load SVG'));
    img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
  });
}
