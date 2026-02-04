// QBC 3D Types

export interface LatticeAnchors3D {
  [char: string]: [number, number, number];
}

export interface PathEvent3D {
  type: 'move' | 'line' | 'tick';
  char: string;
  x: number;
  y: number;
  z: number;
  tickEndX?: number;
  tickEndY?: number;
  tickEndZ?: number;
}

export interface EncodedPath3D {
  events: PathEvent3D[];
  visitedChars: string[];
  visitCounts: Record<string, number>;
}
