// QBC Decoder - Glyph/Image to Text

import {
  GlyphPackage,
  DecodeResult,
  LatticeAnchors2D,
  EncodedPath,
} from './types';

/**
 * Decode from a glyph package JSON (guaranteed accuracy)
 */
export function decodeGlyphPackage(pkg: GlyphPackage): DecodeResult {
  const text = pkg.path.visitedChars.join('');
  
  return {
    text,
    confidence: 1.0,
    path: pkg.path,
    latticeKey: pkg.metadata.latticeKey,
  };
}

/**
 * Parse a glyph package from JSON string
 */
export function parseGlyphPackage(json: string): GlyphPackage | null {
  try {
    const parsed = JSON.parse(json);
    
    // Validate structure
    if (
      parsed.version !== '1.0' ||
      !parsed.metadata ||
      !parsed.path ||
      !parsed.path.visitedChars
    ) {
      return null;
    }
    
    return parsed as GlyphPackage;
  } catch {
    return null;
  }
}

/**
 * Attempt to decode from SVG exported by our system
 * Looks for embedded metadata in the SVG
 */
export function decodeFromSvg(
  svgString: string,
  _anchors?: LatticeAnchors2D
): DecodeResult | null {
  try {
    // Look for embedded data comment in SVG
    const dataMatch = svgString.match(/<!--QBC-DATA:(.*?)-->/);
    
    if (dataMatch) {
      const base64Data = dataMatch[1];
      const json = atob(base64Data);
      const pkg = parseGlyphPackage(json);
      
      if (pkg) {
        return decodeGlyphPackage(pkg);
      }
    }
    
    // If no embedded data, attempt path parsing (less reliable)
    return null;
  } catch {
    return null;
  }
}

/**
 * Attempt to decode from image (probabilistic)
 * This is a placeholder for future ML-based decoding
 */
export function decodeFromImage(
  _imageData: ImageData,
  _anchors: LatticeAnchors2D
): DecodeResult | null {
  // This would require computer vision/ML to implement properly
  // For now, return null indicating we can't decode from raw images
  return null;
}

/**
 * Find the closest anchor to a point
 */
export function findClosestAnchor(
  x: number,
  y: number,
  anchors: LatticeAnchors2D,
  threshold: number = 0.1
): string | null {
  let closest: string | null = null;
  let minDist = Infinity;
  
  for (const [char, [ax, ay]] of Object.entries(anchors)) {
    const dist = Math.sqrt((x - ax) ** 2 + (y - ay) ** 2);
    
    if (dist < minDist && dist < threshold) {
      minDist = dist;
      closest = char;
    }
  }
  
  return closest;
}

/**
 * Validate that a decoded text matches the expected format
 */
export function validateDecodedText(text: string): boolean {
  // Text should only contain A-Z and spaces
  return /^[A-Z ]+$/.test(text);
}
