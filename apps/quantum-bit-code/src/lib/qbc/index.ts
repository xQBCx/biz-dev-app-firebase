// QBC Library - Main exports

export * from './types';
export * from './encoder';
export * from './decoder';
export * from './renderer2d';

// Re-export commonly used functions
export { encodeText, normalizeText, decodePath, generateGlyphHash } from './encoder';
export { renderSvg, renderSvgDataUrl, renderPng } from './renderer2d';
export { decodeGlyphPackage, parseGlyphPackage, decodeFromSvg } from './decoder';
