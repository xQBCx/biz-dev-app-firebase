// QBC Library - Main exports

// Core types (2D)
export * from './types';

// 2D modules
export * from './encoder';
export * from './decoder';
export * from './renderer2d';
export * from './hash';

// 3D types (selective to avoid conflicts)
export type { 
  Anchor3D as Anchor3DType,
  LatticeAnchors3D as LatticeAnchors3DType,
  PathEvent3D,
  EncodedPath3D,
  Lattice3D,
  GlyphOrientation3D,
  GlyphStyle3D,
} from './types3d';
export { 
  EXTENDED_CHAR_SETS,
  FULL_CHAR_SET_343,
  DEFAULT_STYLE_3D,
  DEFAULT_ORIENTATION_3D,
} from './types3d';

// 3D modules
export * from './encoder3d';
export * from './lattices3d';

// Re-export commonly used functions
export { encodeText, normalizeText, decodePath, generateGlyphHash } from './encoder';
export { renderSvg, renderSvgDataUrl, renderPng } from './renderer2d';
export { decodeGlyphPackage, parseGlyphPackage, decodeFromSvg } from './decoder';
export { generateContentHash, canonicalizeText } from './hash';

// 3D exports
export { 
  encodeText3D, 
  decodePath3D, 
  normalizeText3D,
  getPath3DSegments,
  getPath3DBounds 
} from './encoder3d';

export {
  generate7x7x7Lattice,
  generateMetatronsCube3D,
  generateBioAcousticLattice,
  get3DLattice,
  getAvailable3DLattices
} from './lattices3d';
