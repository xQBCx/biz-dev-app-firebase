/**
 * QBC 3D Lattice Generators
 * Creates various 3D lattice structures for encoding
 */

import { Anchor3D, LatticeAnchors3D, Lattice3D, FULL_CHAR_SET_343 } from './types3d';

/**
 * Generate a 7x7x7 cubic lattice (343 anchors)
 * Maps extended character sets to 3D positions
 */
export function generate7x7x7Lattice(charSet: string = FULL_CHAR_SET_343): Lattice3D {
  const anchors: LatticeAnchors3D = new Map();
  const characterMap = new Map<string, number>();
  
  let charIndex = 0;
  const chars = charSet.split('');
  
  // Generate 7x7x7 grid positions
  for (let z = 0; z < 7; z++) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (charIndex < chars.length) {
          const char = chars[charIndex];
          const anchor: Anchor3D = {
            x: (x - 3) * 0.15, // Center around origin, spaced 0.15 units
            y: (y - 3) * 0.15,
            z: (z - 3) * 0.15,
          };
          
          anchors.set(char, anchor);
          characterMap.set(char, charIndex);
          charIndex++;
        }
      }
    }
  }
  
  return {
    id: 'cube_343',
    name: '7×7×7 Cubic Lattice',
    type: '7x7x7',
    anchors,
    characterMap,
    dimensions: { width: 7, height: 7, depth: 7 },
  };
}

/**
 * Generate Metatron's Cube in 3D
 * Sacred geometry lattice with 13 spheres
 */
export function generateMetatronsCube3D(): Lattice3D {
  const anchors: LatticeAnchors3D = new Map();
  const characterMap = new Map<string, number>();
  
  // 13 vertices of Metatron's Cube (center + 12 surrounding)
  const vertices: Anchor3D[] = [
    { x: 0, y: 0, z: 0 },           // Center
    { x: 0.5, y: 0, z: 0 },         // Right
    { x: -0.5, y: 0, z: 0 },        // Left
    { x: 0, y: 0.5, z: 0 },         // Top
    { x: 0, y: -0.5, z: 0 },        // Bottom
    { x: 0, y: 0, z: 0.5 },         // Front
    { x: 0, y: 0, z: -0.5 },        // Back
    { x: 0.25, y: 0.433, z: 0 },    // Upper right
    { x: -0.25, y: 0.433, z: 0 },   // Upper left
    { x: 0.25, y: -0.433, z: 0 },   // Lower right
    { x: -0.25, y: -0.433, z: 0 },  // Lower left
    { x: 0.25, y: 0, z: 0.433 },    // Front right
    { x: -0.25, y: 0, z: 0.433 },   // Front left
  ];
  
  // Map basic characters to vertices
  const chars = 'ABCDEFGHIJKLM'.split('');
  
  vertices.forEach((vertex, index) => {
    if (index < chars.length) {
      anchors.set(chars[index], vertex);
      characterMap.set(chars[index], index);
    }
  });
  
  return {
    id: 'metatron_3d',
    name: "Metatron's Cube 3D",
    type: 'metatron3d',
    anchors,
    characterMap,
    dimensions: { width: 1, height: 1, depth: 1 },
  };
}

/**
 * Generate Bio-Acoustic Lattice
 * Lattice derived from audio frequency analysis
 */
export function generateBioAcousticLattice(
  spectralData: { centroid: number; flux: number; rolloff: number }[]
): Lattice3D {
  const anchors: LatticeAnchors3D = new Map();
  const characterMap = new Map<string, number>();
  
  // Normalize spectral data to 3D coordinates
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('');
  
  chars.forEach((char, index) => {
    // Use spectral features or generate default positions
    const data = spectralData[index % spectralData.length] || {
      centroid: Math.random(),
      flux: Math.random(),
      rolloff: Math.random(),
    };
    
    // Map spectral features to 3D coordinates
    const anchor: Anchor3D = {
      x: (data.centroid - 0.5) * 2,  // Normalize to [-1, 1]
      y: (data.flux - 0.5) * 2,
      z: (data.rolloff - 0.5) * 2,
    };
    
    anchors.set(char, anchor);
    characterMap.set(char, index);
  });
  
  return {
    id: 'bio_acoustic',
    name: 'Bio-Acoustic Lattice',
    type: 'bio-acoustic',
    anchors,
    characterMap,
    dimensions: { width: 2, height: 2, depth: 2 },
  };
}

/**
 * Factory function to get 3D lattice by type
 */
export function get3DLattice(type: '7x7x7' | 'metatron3d' | 'bio-acoustic'): Lattice3D {
  switch (type) {
    case '7x7x7':
      return generate7x7x7Lattice();
    case 'metatron3d':
      return generateMetatronsCube3D();
    case 'bio-acoustic':
      // Return default bio-acoustic lattice with random data
      return generateBioAcousticLattice([]);
    default:
      return generate7x7x7Lattice();
  }
}

/**
 * Get all available 3D lattice types
 */
export function getAvailable3DLattices(): Array<{ id: string; name: string; type: string }> {
  return [
    { id: 'cube_343', name: '7×7×7 Cubic Lattice (343 anchors)', type: '7x7x7' },
    { id: 'metatron_3d', name: "Metatron's Cube 3D (13 anchors)", type: 'metatron3d' },
    { id: 'bio_acoustic', name: 'Bio-Acoustic Lattice (dynamic)', type: 'bio-acoustic' },
  ];
}
