// QBC Library - Main exports

// Core types
export * from './types';

// Core modules
export * from './encoder';
export * from './decoder';
export * from './renderer2d';
export * from './hash';

// Re-export commonly used functions
export { encodeText, normalizeText, decodePath, generateGlyphHash } from './encoder';
export { renderSvg, renderSvgDataUrl, renderPng } from './renderer2d';
export { decodeGlyphPackage, parseGlyphPackage, decodeFromSvg } from './decoder';
export { generateContentHash, canonicalizeText } from './hash';
