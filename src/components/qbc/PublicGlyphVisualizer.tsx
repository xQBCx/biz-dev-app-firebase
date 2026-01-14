import { useMemo } from 'react';
import { EncodedPath } from '@/lib/qbc/types';

interface Vertex {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface PublicGlyphVisualizerProps {
  path?: EncodedPath;
  size?: number;
  showLabels?: boolean;
  animated?: boolean;
}

// Metatron's Cube vertices (13 points)
const VERTICES: Vertex[] = [
  { id: 'center', x: 200, y: 200, label: ' ' },
  { id: 'top', x: 200, y: 60, label: 'A' },
  { id: 'top-right', x: 321, y: 130, label: 'B' },
  { id: 'bottom-right', x: 321, y: 270, label: 'C' },
  { id: 'bottom', x: 200, y: 340, label: 'D' },
  { id: 'bottom-left', x: 79, y: 270, label: 'E' },
  { id: 'top-left', x: 79, y: 130, label: 'F' },
  { id: 'inner-top', x: 200, y: 120, label: 'G' },
  { id: 'inner-right', x: 269, y: 160, label: 'H' },
  { id: 'inner-bottom-right', x: 269, y: 240, label: 'I' },
  { id: 'inner-bottom', x: 200, y: 280, label: 'J' },
  { id: 'inner-bottom-left', x: 131, y: 240, label: 'K' },
  { id: 'inner-top-left', x: 131, y: 160, label: 'L' },
];

// All edges in Metatron's Cube
const EDGES: [number, number][] = [
  // Outer hexagon
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1],
  // Inner hexagon
  [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 7],
  // Spokes to center
  [0, 7], [0, 8], [0, 9], [0, 10], [0, 11], [0, 12],
  // Outer to inner connections
  [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12],
  // Cross connections
  [1, 8], [2, 9], [3, 10], [4, 11], [5, 12], [6, 7],
  [1, 12], [2, 7], [3, 8], [4, 9], [5, 10], [6, 11],
];

export function PublicGlyphVisualizer({ 
  path, 
  size = 400,
  showLabels = true,
  animated = true 
}: PublicGlyphVisualizerProps) {
  const scale = size / 400;

  const activeVertices = useMemo(() => {
    if (!path?.visitedChars) return new Set<string>();
    return new Set(path.visitedChars.filter(c => c !== ' '));
  }, [path]);

  const pathString = useMemo(() => {
    if (!path?.events || path.events.length === 0) return '';
    
    let d = '';
    for (const event of path.events) {
      if (event.type === 'move') {
        d += `M ${event.x * 400} ${event.y * 400} `;
      } else if (event.type === 'line') {
        d += `L ${event.x * 400} ${event.y * 400} `;
      }
    }
    return d;
  }, [path]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {/* Background glow */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(185 100% 50% / 0.1)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="200" cy="200" r="180" fill="url(#bgGlow)" />

        {/* Base lattice edges */}
        {EDGES.map(([from, to], idx) => (
          <line
            key={`edge-${idx}`}
            x1={VERTICES[from].x}
            y1={VERTICES[from].y}
            x2={VERTICES[to].x}
            y2={VERTICES[to].y}
            stroke="hsl(185 100% 50% / 0.15)"
            strokeWidth="1"
          />
        ))}

        {/* Encoded path */}
        {pathString && (
          <path
            d={pathString}
            fill="none"
            stroke="hsl(185 100% 50%)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowFilter)"
            className={animated ? "animate-qbc-pulse" : ""}
          />
        )}

        {/* Vertices */}
        {VERTICES.map((vertex, idx) => {
          const isActive = activeVertices.has(vertex.label);
          const isCenter = idx === 0;
          
          return (
            <g key={vertex.id}>
              {/* Outer glow for active vertices */}
              {isActive && (
                <circle
                  cx={vertex.x}
                  cy={vertex.y}
                  r="16"
                  fill="hsl(185 100% 50% / 0.2)"
                  className={animated ? "animate-qbc-pulse" : ""}
                />
              )}
              
              {/* Vertex circle */}
              <circle
                cx={vertex.x}
                cy={vertex.y}
                r={isCenter ? 10 : 8}
                fill={isActive ? "hsl(185 100% 50%)" : "hsl(230 25% 15%)"}
                stroke={isActive ? "hsl(185 100% 60%)" : "hsl(185 100% 50% / 0.3)"}
                strokeWidth="2"
                className="transition-all duration-300"
              />

              {/* Label */}
              {showLabels && !isCenter && (
                <text
                  x={vertex.x}
                  y={vertex.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isActive ? "hsl(230 25% 7%)" : "hsl(185 100% 50% / 0.7)"}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {vertex.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Path legend */}
      {path?.visitedChars && path.visitedChars.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm rounded-lg p-2 border border-border/30">
          <p className="text-xs text-muted-foreground mb-1">Encoded:</p>
          <p className="text-sm font-mono text-primary tracking-wide">
            {path.visitedChars.join('')}
          </p>
        </div>
      )}
    </div>
  );
}
