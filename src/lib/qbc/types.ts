// QBC Simulator Types

export interface Anchor2D {
  x: number;
  y: number;
}

export interface Anchor3D {
  x: number;
  y: number;
  z: number;
}

export interface LatticeAnchors2D {
  [char: string]: [number, number];
}

export interface LatticeAnchors3D {
  [char: string]: [number, number, number];
}

// Raw rules from database may use legacy field names
export interface LatticeRulesRaw {
  enableTick?: boolean;
  tickLengthFactor?: number;
  notchLengthFactor?: number; // Legacy alias for tickLengthFactor
  enableRestartNotch?: boolean; // Legacy alias for enableTick
  enableMicroLoop?: boolean;
  loopRadiusFactor?: number;
  insideBoundaryPreference?: boolean;
  insideSquarePreference?: boolean; // Legacy alias
  nodeSpacing?: number;
  directionPriority?: string[];
}

// Normalized rules used by encoder/renderer
export interface LatticeRules {
  enableTick: boolean;
  tickLengthFactor: number;
  insideBoundaryPreference: boolean;
  nodeSpacing: number;
}

/**
 * Normalize raw lattice rules from database to standard format
 * Maps legacy field names and provides sensible defaults
 */
export function normalizeLatticeRules(raw: LatticeRulesRaw): LatticeRules {
  return {
    // enableTick: default true, also check legacy enableRestartNotch
    enableTick: raw.enableTick ?? raw.enableRestartNotch ?? true,
    // tickLengthFactor: prefer explicit, fallback to legacy notchLengthFactor, default 0.08
    tickLengthFactor: raw.tickLengthFactor ?? raw.notchLengthFactor ?? 0.08,
    // insideBoundaryPreference: also check legacy insideSquarePreference
    insideBoundaryPreference: raw.insideBoundaryPreference ?? raw.insideSquarePreference ?? true,
    // nodeSpacing: default 0.2
    nodeSpacing: raw.nodeSpacing ?? 0.2,
  };
}

export interface LatticeStyle {
  strokeWidth: number;
  nodeSize: number;
  showNodes: boolean;
  showGrid: boolean;
  theme: 'notebook' | 'gallery' | 'blueprint';
}

export interface Lattice {
  id: string;
  lattice_key: string;
  version: number;
  name: string;
  description: string | null;
  anchors_json: LatticeAnchors2D;
  anchors_3d_json: LatticeAnchors3D | null;
  rules_json: LatticeRules;
  style_json: LatticeStyle;
  is_default: boolean;
  is_active: boolean;
  is_locked: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PathEvent {
  type: 'move' | 'line' | 'tick';
  char: string;
  x: number;
  y: number;
  // For ticks - the endpoint where path continues from
  tickEndX?: number;
  tickEndY?: number;
}

export interface EncodedPath {
  events: PathEvent[];
  visitedChars: string[];
  visitCounts: Record<string, number>;
}

export interface GlyphOrientation {
  rotation: number; // 0, 90, 180, 270
  mirror: boolean;
  flipVertical?: boolean;
  // 3D orientation
  yaw?: number;
  pitch?: number;
  roll?: number;
}

export interface GlyphStyle {
  strokeWidth: number;
  strokeColor: string;
  nodeSize: number;
  nodeColor: string;
  nodeFillColor: string;
  showNodes: boolean;
  showGrid: boolean;
  showLabels: boolean;
  backgroundColor: string;
  gridColor: string;
}

export interface GlyphMetadata {
  text: string;
  latticeKey: string;
  latticeVersion: number;
  orientation: GlyphOrientation;
  style: GlyphStyle;
  timestamp: string;
  hash: string;
}

export interface GlyphPackage {
  version: '1.0';
  metadata: GlyphMetadata;
  path: EncodedPath;
  svg?: string;
}

export interface DecodeResult {
  text: string;
  confidence: number;
  path: EncodedPath;
  latticeKey: string;
  notes?: string;
}

export const DEFAULT_STYLE: GlyphStyle = {
  strokeWidth: 2,
  strokeColor: '#000000',
  nodeSize: 6,
  nodeColor: '#000000',
  nodeFillColor: '#ffffff',
  showNodes: true,
  showGrid: false,
  showLabels: false,
  backgroundColor: '#ffffff',
  gridColor: '#e5e5e5',
};

export const DEFAULT_ORIENTATION: GlyphOrientation = {
  rotation: 0,
  mirror: false,
  flipVertical: false,
  yaw: 0,
  pitch: 0,
  roll: 0,
};
