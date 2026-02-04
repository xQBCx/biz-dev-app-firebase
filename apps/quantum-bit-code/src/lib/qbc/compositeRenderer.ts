// QBC Composite Renderer
// Renders multiple glyph cells into a single SVG

import { CompositeGlyph, GlyphCell } from './compositeTypes';
import { GlyphStyle, GlyphOrientation, EncodedPath, LatticeAnchors2D } from './types';

const DEFAULT_SIZE = 800;
const PADDING = 20;

/**
 * Render a single glyph path at a specific position and size
 */
function renderCellPath(
  cell: GlyphCell,
  anchors: LatticeAnchors2D,
  style: GlyphStyle,
  containerSize: number
): string {
  const { path, x, y, width, height, opacity = 1 } = cell;
  
  // Calculate cell bounds in SVG coordinates
  const contentSize = containerSize - PADDING * 2;
  const cellX = PADDING + x * contentSize;
  const cellY = PADDING + y * contentSize;
  const cellWidth = width * contentSize;
  const cellHeight = height * contentSize;
  
  // Scale factor for this cell
  const scale = Math.min(cellWidth, cellHeight);
  const offsetX = cellX + (cellWidth - scale) / 2;
  const offsetY = cellY + (cellHeight - scale) / 2;
  
  // Build path string
  let pathD = '';
  let lastTickEndX: number | undefined;
  let lastTickEndY: number | undefined;
  
  for (const event of path.events) {
    // Transform normalized coords (0-1) to cell coords
    const px = offsetX + event.x * scale;
    const py = offsetY + (1 - event.y) * scale; // Flip Y
    
    switch (event.type) {
      case 'move':
        pathD += `M ${px.toFixed(2)} ${py.toFixed(2)} `;
        break;
      case 'line':
        pathD += `L ${px.toFixed(2)} ${py.toFixed(2)} `;
        break;
      case 'tick':
        if (event.tickEndX !== undefined && event.tickEndY !== undefined) {
          const tx = offsetX + event.tickEndX * scale;
          const ty = offsetY + (1 - event.tickEndY) * scale;
          pathD += `L ${tx.toFixed(2)} ${ty.toFixed(2)} `;
          lastTickEndX = tx;
          lastTickEndY = ty;
        }
        break;
    }
  }
  
  const strokeWidth = Math.max(1, (scale / 200) * style.strokeWidth);
  
  return `<g opacity="${opacity}">
    <path d="${pathD.trim()}" fill="none" stroke="${style.strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

/**
 * Render anchor nodes for a cell (optional, for debug/display)
 */
function renderCellAnchors(
  cell: GlyphCell,
  anchors: LatticeAnchors2D,
  style: GlyphStyle,
  containerSize: number,
  showLabels: boolean
): string {
  const { x, y, width, height, opacity = 1 } = cell;
  
  const contentSize = containerSize - PADDING * 2;
  const cellX = PADDING + x * contentSize;
  const cellY = PADDING + y * contentSize;
  const cellWidth = width * contentSize;
  const cellHeight = height * contentSize;
  
  const scale = Math.min(cellWidth, cellHeight);
  const offsetX = cellX + (cellWidth - scale) / 2;
  const offsetY = cellY + (cellHeight - scale) / 2;
  
  const nodeSize = Math.max(2, (scale / 200) * style.nodeSize);
  const nodes: string[] = [];
  
  for (const [char, [ax, ay]] of Object.entries(anchors)) {
    const px = offsetX + ax * scale;
    const py = offsetY + (1 - ay) * scale;
    
    nodes.push(
      `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${nodeSize / 2}" fill="${style.nodeFillColor}" stroke="${style.nodeColor}" stroke-width="0.5" opacity="${opacity * 0.5}"/>`
    );
  }
  
  return nodes.join('\n');
}

/**
 * Render finder patterns (corner markers for scanning)
 */
function renderFinderPatterns(containerSize: number, style: GlyphStyle): string {
  const patternSize = containerSize * 0.08;
  const inset = PADDING / 2;
  const innerSize = patternSize * 0.5;
  const innerOffset = (patternSize - innerSize) / 2;
  
  const corners = [
    { x: inset, y: inset }, // top-left
    { x: containerSize - inset - patternSize, y: inset }, // top-right
    { x: inset, y: containerSize - inset - patternSize }, // bottom-left
  ];
  
  const patterns: string[] = [];
  
  for (const corner of corners) {
    patterns.push(`
      <rect x="${corner.x}" y="${corner.y}" width="${patternSize}" height="${patternSize}" fill="none" stroke="${style.strokeColor}" stroke-width="2"/>
      <rect x="${corner.x + innerOffset}" y="${corner.y + innerOffset}" width="${innerSize}" height="${innerSize}" fill="${style.strokeColor}"/>
    `);
  }
  
  return patterns.join('\n');
}

/**
 * Render the complete composite glyph as SVG
 */
export function renderCompositeSvg(
  composite: CompositeGlyph,
  size: number = DEFAULT_SIZE,
  options: {
    showAnchors?: boolean;
    showFinderPatterns?: boolean;
    showBorder?: boolean;
    showLabels?: boolean;
  } = {}
): string {
  const { 
    showAnchors = false, 
    showFinderPatterns = true, 
    showBorder = true,
    showLabels = false 
  } = options;
  
  const { cells, anchors, style } = composite;
  
  // Sort cells by z-index for proper layering
  const sortedCells = [...cells].sort((a, b) => a.zIndex - b.zIndex);
  
  // Render all cell paths
  const cellPaths = sortedCells.map(cell => 
    renderCellPath(cell, anchors, style, size)
  ).join('\n');
  
  // Render anchors if requested
  const anchorNodes = showAnchors 
    ? sortedCells.map(cell => 
        renderCellAnchors(cell, anchors, style, size, showLabels)
      ).join('\n')
    : '';
  
  // Render finder patterns
  const finderPatterns = showFinderPatterns 
    ? renderFinderPatterns(size, style) 
    : '';
  
  // Border
  const border = showBorder 
    ? `<rect x="${PADDING/2}" y="${PADDING/2}" width="${size - PADDING}" height="${size - PADDING}" fill="none" stroke="${style.strokeColor}" stroke-width="1" opacity="0.3"/>` 
    : '';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="100%" height="100%" fill="${style.backgroundColor}"/>
  ${border}
  ${finderPatterns}
  ${cellPaths}
  ${anchorNodes}
</svg>`;
}

/**
 * Render composite as data URL
 */
export function renderCompositeDataUrl(
  composite: CompositeGlyph,
  size: number = DEFAULT_SIZE,
  options?: Parameters<typeof renderCompositeSvg>[2]
): string {
  const svg = renderCompositeSvg(composite, size, options);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Render composite as PNG blob
 */
export async function renderCompositePng(
  composite: CompositeGlyph,
  size: number = 1024,
  options?: Parameters<typeof renderCompositeSvg>[2]
): Promise<Blob> {
  const svg = renderCompositeSvg(composite, size, options);
  
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
      ctx.fillStyle = composite.style.backgroundColor;
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
