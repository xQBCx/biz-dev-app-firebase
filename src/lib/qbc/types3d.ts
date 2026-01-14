/**
 * QBC 3D Types
 * Extended type definitions for 3D lattice encoding
 */

// 3D coordinate anchor
export interface Anchor3D {
  x: number;
  y: number;
  z: number;
}

// Map of character to 3D anchor positions
export type LatticeAnchors3D = Map<string, Anchor3D>;

// 3D path event types
export type PathEventType3D = 'move' | 'line' | 'tick';

// Single 3D path event
export interface PathEvent3D {
  type: PathEventType3D;
  x: number;
  y: number;
  z: number;
  char?: string;
}

// Complete 3D encoded path
export interface EncodedPath3D {
  events: PathEvent3D[];
  visitedChars: string[];
  dimension: '3D';
}

// 3D Lattice structure
export interface Lattice3D {
  id: string;
  name: string;
  type: '7x7x7' | 'metatron3d' | 'bio-acoustic' | 'custom';
  anchors: LatticeAnchors3D;
  characterMap: Map<string, number>; // char -> anchor index
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

// Extended character sets for 3D encoding
export const EXTENDED_CHAR_SETS = {
  // Basic Latin (A-Z, 0-9, space)
  LATIN_BASIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
  
  // Extended Latin with punctuation
  LATIN_EXTENDED: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?-\'":;()[]{}@#$%&*+=/<>\\|~`^_',
  
  // Cyrillic
  CYRILLIC: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
  
  // Greek
  GREEK: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',
  
  // Hebrew
  HEBREW: 'אבגדהוזחטיכלמנסעפצקרשת',
  
  // Arabic
  ARABIC: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي',
  
  // Common CJK (simplified subset for demonstration)
  CJK_COMMON: '的一是不了在人有我他这中大来上国个到说们为子和你地出道也时年得就那要下以生会自着去之过家学对可她里后小么心多天而能好都然没日于起还发成事只作当想看文无开手十用主行方又如前所本见经头面外两三',
};

// Full character set for 343-anchor lattice (7x7x7)
export const FULL_CHAR_SET_343 = 
  EXTENDED_CHAR_SETS.LATIN_EXTENDED +
  EXTENDED_CHAR_SETS.CYRILLIC +
  EXTENDED_CHAR_SETS.GREEK;

// 3D Glyph orientation
export interface GlyphOrientation3D {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  mirror: boolean;
}

// 3D Glyph style
export interface GlyphStyle3D {
  strokeColor: string;
  strokeWidth: number;
  nodeColor: string;
  nodeSize: number;
  pathGlow: boolean;
  glowColor: string;
  glowIntensity: number;
}

// Default 3D style
export const DEFAULT_STYLE_3D: GlyphStyle3D = {
  strokeColor: '#00d4ff',
  strokeWidth: 2,
  nodeColor: '#a855f7',
  nodeSize: 4,
  pathGlow: true,
  glowColor: '#00d4ff',
  glowIntensity: 0.5,
};

// Default 3D orientation
export const DEFAULT_ORIENTATION_3D: GlyphOrientation3D = {
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  scale: 1,
  mirror: false,
};
