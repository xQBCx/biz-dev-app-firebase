// QBC 3D Encoder - Text to 3D Glyph Path

import {
  LatticeAnchors3D,
  EncodedPath3D,
  PathEvent3D,
} from './types3d';
import { LatticeRules } from './types';

/**
 * Extended character set for 3D lattices (343 positions in 7x7x7)
 * Supports:
 * - A-Z Latin uppercase (26)
 * - 0-9 digits (10)
 * - Space (1)
 * - Punctuation and special characters (~50)
 * - Cyrillic uppercase (33)
 * - Greek uppercase (24)
 * - Hebrew (22)
 * - Common CJK/Mandarin radicals (50+)
 * - Arabic numerals extended
 */

// Latin A-Z
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Digits
const DIGITS = '0123456789';

// Punctuation and special characters
const PUNCTUATION = ' !@#$%^&*()-_=+[]{}|\\:;\'"<>,.?/`~';

// Cyrillic uppercase (Russian, Ukrainian, etc.)
const CYRILLIC = 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

// Greek uppercase
const GREEK = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ';

// Hebrew
const HEBREW = 'אבגדהוזחטיכלמנסעפצקרשת';

// Common CJK radicals and characters (simplified for encoding)
const CJK = '一二三四五六七八九十人大中小上下左右天地日月火水木金土心手口';

// Arabic letters (basic)
const ARABIC = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي';

// Combined extended character set
export const EXTENDED_CHARS = (
  LATIN +
  DIGITS +
  PUNCTUATION +
  CYRILLIC +
  GREEK +
  HEBREW +
  CJK +
  ARABIC
).split('');

// Character set lookup for fast checking
const EXTENDED_CHARS_SET = new Set(EXTENDED_CHARS);

/**
 * Normalize text for extended character set
 * Converts Latin to uppercase, preserves other scripts
 */
export function normalizeText3D(text: string): string {
  return text
    .split('')
    .map(char => {
      // Uppercase Latin characters
      const upper = char.toUpperCase();
      if (EXTENDED_CHARS_SET.has(upper)) return upper;
      // Keep original if it's in extended set
      if (EXTENDED_CHARS_SET.has(char)) return char;
      // Filter out unsupported chars
      return '';
    })
    .filter(Boolean)
    .join('');
}

/**
 * Calculate tick direction in 3D space
 */
function getTickDirection3D(
  x: number, y: number, z: number,
  prevX: number, prevY: number, prevZ: number
): { dx: number; dy: number; dz: number } {
  // Vector from previous to current
  const vx = x - prevX;
  const vy = y - prevY;
  const vz = z - prevZ;

  // Find a perpendicular vector
  // Use cross product with up vector (0,1,0) or right (1,0,0) if parallel
  let px, py, pz;
  if (Math.abs(vy) > 0.9) {
    // Mostly vertical, use right vector
    px = vz;
    py = 0;
    pz = -vx;
  } else {
    // Cross with up vector
    px = vy * 1 - vz * 0;
    py = vz * 0 - vx * 1;
    pz = vx * 0 - vy * 0;
  }

  // Normalize
  const len = Math.hypot(px, py, pz) || 1;
  return { dx: px / len, dy: py / len, dz: pz / len };
}

/**
 * Encode text into a 3D glyph path
 */
export function encodeText3D(
  text: string,
  anchors: LatticeAnchors3D,
  rules: LatticeRules
): EncodedPath3D {
  const normalized = normalizeText3D(text);
  const chars = normalized.split('');

  const events: PathEvent3D[] = [];
  const visitCounts: Record<string, number> = {};
  const visitedChars: string[] = [];

  let penX = 0, penY = 0, penZ = 0;
  let prevPenX = 0, prevPenY = 0, prevPenZ = 0;
  let prevChar: string | null = null;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const anchor = anchors[char];

    if (!anchor) continue;

    const [x, y, z] = anchor;
    const isFirstChar = events.length === 0;
    const isRepeat = prevChar === char || visitCounts[char] > 0;

    visitCounts[char] = (visitCounts[char] || 0) + 1;
    visitedChars.push(char);

    if (isFirstChar) {
      events.push({ type: 'move', char, x, y, z });
      penX = x; penY = y; penZ = z;
      prevPenX = x; prevPenY = y; prevPenZ = z;
    } else if (isRepeat && rules.enableTick) {
      // Draw line to anchor
      events.push({ type: 'line', char, x, y, z });

      // Calculate incoming direction
      const inFromX = (penX === x && penY === y && penZ === z) ? prevPenX : penX;
      const inFromY = (penX === x && penY === y && penZ === z) ? prevPenY : penY;
      const inFromZ = (penX === x && penY === y && penZ === z) ? prevPenZ : penZ;

      prevPenX = inFromX; prevPenY = inFromY; prevPenZ = inFromZ;
      penX = x; penY = y; penZ = z;

      // Calculate tick
      const tickLength = rules.tickLengthFactor || 0.08;
      const { dx, dy, dz } = getTickDirection3D(x, y, z, inFromX, inFromY, inFromZ);
      const tickEndX = x + dx * tickLength;
      const tickEndY = y + dy * tickLength;
      const tickEndZ = z + dz * tickLength;

      events.push({
        type: 'tick',
        char,
        x, y, z,
        tickEndX, tickEndY, tickEndZ,
      });

      prevPenX = x; prevPenY = y; prevPenZ = z;
      penX = tickEndX; penY = tickEndY; penZ = tickEndZ;
    } else {
      events.push({ type: 'line', char, x, y, z });
      prevPenX = penX; prevPenY = penY; prevPenZ = penZ;
      penX = x; penY = y; penZ = z;
    }

    prevChar = char;
  }

  return { events, visitedChars, visitCounts };
}
