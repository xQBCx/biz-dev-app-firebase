// 3D Lattice Generators for QBC

import { LatticeAnchors3D } from './types3d';
import { EXTENDED_CHARS } from './encoder3d';

/**
 * Generate a 7x7x7 cubic lattice (343 anchors)
 * Distributes all extended characters strategically across 3 dimensions
 * Includes: Latin A-Z, 0-9, punctuation, Cyrillic, Greek, Hebrew, CJK, Arabic
 */
export function generate7x7x7Lattice(): LatticeAnchors3D {
  const anchors: LatticeAnchors3D = {};
  const gridSize = 7;
  const step = 1 / (gridSize - 1); // 0 to 1 range
  
  // Strategic placement for common characters to create interesting 3D paths
  const strategicPlacements: Record<string, [number, number, number]> = {
    // Latin vowels at core positions across Z levels
    'A': [3, 3, 0],  // Center front
    'E': [3, 3, 3],  // True center of cube
    'I': [3, 3, 6],  // Center back
    'O': [0, 3, 3],  // Left center
    'U': [6, 3, 3],  // Right center
    
    // Common consonants at corners (8 corners of cube)
    'T': [0, 0, 0],  // Front bottom left
    'N': [6, 6, 6],  // Back top right
    'S': [6, 0, 0],  // Front bottom right
    'R': [0, 6, 6],  // Back top left
    'H': [0, 0, 6],  // Back bottom left
    'L': [6, 6, 0],  // Front top right
    'D': [6, 0, 6],  // Back bottom right
    'C': [0, 6, 0],  // Front top left
    
    // More consonants at edge midpoints
    'M': [3, 0, 3],  // Bottom center
    'P': [3, 6, 3],  // Top center
    'B': [0, 3, 0],  // Front left
    'F': [6, 3, 6],  // Back right
    'G': [3, 0, 0],  // Front bottom
    'K': [3, 6, 6],  // Back top
    'W': [0, 3, 6],  // Back left
    'Y': [6, 3, 0],  // Front right
    
    // Space at absolute center
    ' ': [3, 3, 3],
    
    // Common punctuation at accessible positions
    '.': [1, 1, 1],
    ',': [5, 1, 1],
    '!': [1, 5, 1],
    '?': [5, 5, 1],
    '-': [1, 1, 5],
    ':': [5, 1, 5],
    ';': [1, 5, 5],
    "'": [5, 5, 5],
    
    // Numbers distributed across a diagonal
    '0': [0, 0, 3],
    '1': [1, 1, 3],
    '2': [2, 2, 3],
    '3': [3, 3, 3],
    '4': [4, 4, 3],
    '5': [5, 5, 3],
    '6': [6, 6, 3],
    '7': [0, 6, 3],
    '8': [6, 0, 3],
    '9': [3, 0, 6],
  };
  
  // Track used positions
  const usedPositions = new Set<string>();
  
  // First, place strategic characters
  for (const [char, pos] of Object.entries(strategicPlacements)) {
    if (EXTENDED_CHARS.includes(char)) {
      anchors[char] = [
        pos[0] * step,
        pos[1] * step,
        pos[2] * step,
      ];
      usedPositions.add(pos.join(','));
    }
  }
  
  // Generate all available positions in a 3D-distributed pattern
  const availablePositions: [number, number, number][] = [];
  
  // Layer by layer to ensure good Z distribution
  for (let z = 0; z < gridSize; z++) {
    // Alternate spiral direction per layer for variety
    const coords: [number, number][] = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        coords.push([x, y]);
      }
    }
    // Shuffle within layer for variety
    coords.sort((a, b) => {
      const distA = Math.abs(a[0] - 3) + Math.abs(a[1] - 3);
      const distB = Math.abs(b[0] - 3) + Math.abs(b[1] - 3);
      return distB - distA; // Place from outside in
    });
    
    for (const [x, y] of coords) {
      const key = `${x},${y},${z}`;
      if (!usedPositions.has(key)) {
        availablePositions.push([x, y, z]);
      }
    }
  }
  
  // Fill remaining characters
  const remainingChars = EXTENDED_CHARS.filter(c => !strategicPlacements[c]);
  
  for (let i = 0; i < remainingChars.length && i < availablePositions.length; i++) {
    const char = remainingChars[i];
    const [x, y, z] = availablePositions[i];
    anchors[char] = [
      x * step,
      y * step,
      z * step,
    ];
  }
  
  return anchors;
}

/**
 * Metatron's Cube lattice
 * Sacred geometry with 13 circles and connecting lines
 * Contains Platonic solid vertices arranged in sacred proportions
 * Extended to support full character set
 */
export function generateMetatronsCubeLattice(): LatticeAnchors3D {
  const anchors: LatticeAnchors3D = {};
  const center = 0.5;
  const radius = 0.4;
  
  // Track character index
  let charIndex = 0;
  const placeChar = (x: number, y: number, z: number) => {
    if (charIndex < EXTENDED_CHARS.length) {
      anchors[EXTENDED_CHARS[charIndex]] = [x, y, z];
      charIndex++;
    }
  };
  
  // Central point
  placeChar(center, center, center);
  
  // Inner hexagon (xy plane at center z)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    placeChar(
      center + radius * 0.5 * Math.cos(angle),
      center + radius * 0.5 * Math.sin(angle),
      center
    );
  }
  
  // Outer hexagon (rotated)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6 + Math.PI / 6;
    placeChar(
      center + radius * Math.cos(angle),
      center + radius * Math.sin(angle),
      center
    );
  }
  
  // Top and bottom caps
  placeChar(center, center, center + radius * 0.866);
  placeChar(center, center, center - radius * 0.866);
  
  // Upper hexagons (multiple layers)
  for (let layer = 1; layer <= 3; layer++) {
    const zOffset = (layer / 3) * radius * 0.8;
    const layerRadius = radius * (1 - layer * 0.15);
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 + (layer * Math.PI / 12);
      placeChar(
        center + layerRadius * Math.cos(angle),
        center + layerRadius * Math.sin(angle),
        center + zOffset
      );
    }
  }
  
  // Lower hexagons (multiple layers)
  for (let layer = 1; layer <= 3; layer++) {
    const zOffset = (layer / 3) * radius * 0.8;
    const layerRadius = radius * (1 - layer * 0.15);
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6 + (layer * Math.PI / 12);
      placeChar(
        center + layerRadius * Math.cos(angle),
        center + layerRadius * Math.sin(angle),
        center - zOffset
      );
    }
  }
  
  // Dodecahedron vertices for remaining characters
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  const dodecaScale = radius * 0.3;
  
  // Generate dodecahedron vertices
  const dodecaVertices: [number, number, number][] = [];
  
  // Cube vertices
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        dodecaVertices.push([sx, sy, sz]);
      }
    }
  }
  
  // Rectangular faces
  for (const s1 of [-1, 1]) {
    for (const s2 of [-1, 1]) {
      dodecaVertices.push([0, s1 / phi, s2 * phi]);
      dodecaVertices.push([s1 / phi, s2 * phi, 0]);
      dodecaVertices.push([s1 * phi, 0, s2 / phi]);
    }
  }
  
  for (const [vx, vy, vz] of dodecaVertices) {
    placeChar(
      center + vx * dodecaScale,
      center + vy * dodecaScale,
      center + vz * dodecaScale
    );
  }
  
  // Fill remaining with spiral pattern
  let spiralAngle = 0;
  let spiralZ = center - radius;
  const spiralStep = 0.05;
  
  while (charIndex < EXTENDED_CHARS.length && spiralZ <= center + radius) {
    const spiralR = radius * 0.8 * Math.abs(Math.sin((spiralZ - center) * 5));
    placeChar(
      center + spiralR * Math.cos(spiralAngle),
      center + spiralR * Math.sin(spiralAngle),
      spiralZ
    );
    spiralAngle += 0.5;
    spiralZ += spiralStep;
  }
  
  // Fill any remaining with random distribution
  while (charIndex < EXTENDED_CHARS.length) {
    placeChar(
      center + (Math.random() - 0.5) * radius * 2,
      center + (Math.random() - 0.5) * radius * 2,
      center + (Math.random() - 0.5) * radius * 2
    );
  }
  
  return anchors;
}

/**
 * Get lattice by type
 */
export function get3DLattice(type: '7x7x7' | 'metatron'): LatticeAnchors3D {
  switch (type) {
    case 'metatron':
      return generateMetatronsCubeLattice();
    case '7x7x7':
    default:
      return generate7x7x7Lattice();
  }
}
