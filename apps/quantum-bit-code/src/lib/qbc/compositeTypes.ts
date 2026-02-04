// QBC Composite Glyph Types
// For encoding multiple glyphs into a single QR-code-like structure

import { EncodedPath, GlyphStyle, GlyphOrientation, LatticeAnchors2D } from './types';

export type CompositeLayout = 'grid' | 'hierarchical' | 'mosaic';

export interface GlyphCell {
  id: string;
  text: string;
  path: EncodedPath;
  // Position in normalized coordinates (0-1)
  x: number;
  y: number;
  // Size as fraction of container (0-1)
  width: number;
  height: number;
  // Optional rotation in degrees
  rotation?: number;
  // Z-index for layering
  zIndex: number;
  // Opacity for overlapping glyphs
  opacity?: number;
}

export interface CompositeMetadata {
  fullText: string;
  totalChunks: number;
  chunkSize: number;
  layout: CompositeLayout;
  latticeKey: string;
  timestamp: string;
  hash: string;
}

export interface CompositeGlyph {
  version: '1.0';
  metadata: CompositeMetadata;
  cells: GlyphCell[];
  anchors: LatticeAnchors2D;
  style: GlyphStyle;
}

export interface ChunkConfig {
  chunkSize: number; // Characters per chunk
  layout: CompositeLayout;
  gridColumns?: number; // For grid layout
  primaryScale?: number; // For hierarchical layout (0-1)
  overlapFactor?: number; // For mosaic layout (0-1)
}

export const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  chunkSize: 8,
  layout: 'grid',
  gridColumns: 3,
  primaryScale: 0.5,
  overlapFactor: 0.1,
};
