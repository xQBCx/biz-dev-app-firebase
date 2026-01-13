import { useMemo, useEffect, useState } from "react";

interface Vertex {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface GIO {
  paths: { from: number; to: number; char: string }[];
  vertices: Vertex[];
}

interface MetatronsCubeVisualizerProps {
  gio?: GIO | null;
  animate?: boolean;
}

// Default Metatron's Cube vertices
const defaultVertices: Vertex[] = [
  { id: 0, x: 0, y: -100, label: "Crown" },
  { id: 1, x: 86.6, y: -50, label: "Wisdom" },
  { id: 2, x: 86.6, y: 50, label: "Understanding" },
  { id: 3, x: 0, y: 100, label: "Foundation" },
  { id: 4, x: -86.6, y: 50, label: "Mercy" },
  { id: 5, x: -86.6, y: -50, label: "Severity" },
  { id: 6, x: 0, y: 0, label: "Beauty" },
  { id: 7, x: 43.3, y: -25, label: "Victory" },
  { id: 8, x: 43.3, y: 25, label: "Splendor" },
  { id: 9, x: -43.3, y: 25, label: "Kingdom" },
  { id: 10, x: -43.3, y: -25, label: "Eternity" },
  { id: 11, x: 0, y: -50, label: "Knowledge" },
  { id: 12, x: 0, y: 50, label: "Manifestation" },
];

// Default edges for Metatron's Cube
const defaultEdges: [number, number][] = [
  [0, 1], [0, 5], [0, 6], [0, 11],
  [1, 2], [1, 6], [1, 7], [1, 11],
  [2, 3], [2, 6], [2, 8], [2, 12],
  [3, 4], [3, 6], [3, 9], [3, 12],
  [4, 5], [4, 6], [4, 10], [4, 12],
  [5, 6], [5, 10], [5, 11],
  [6, 7], [6, 8], [6, 9], [6, 10], [6, 11], [6, 12],
  [7, 8], [7, 11],
  [8, 9], [8, 12],
  [9, 10], [9, 12],
  [10, 11],
];

const pathColors = [
  "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", 
  "#ffeaa7", "#dfe6e9", "#fd79a8", "#a29bfe",
  "#00b894", "#e17055", "#0984e3", "#6c5ce7"
];

export const MetatronsCubeVisualizer = ({ gio, animate = true }: MetatronsCubeVisualizerProps) => {
  const [animatedPathIndex, setAnimatedPathIndex] = useState(0);
  const vertices = gio?.vertices || defaultVertices;
  const paths = gio?.paths || [];

  // Animation effect
  useEffect(() => {
    if (!animate || paths.length === 0) return;
    
    const interval = setInterval(() => {
      setAnimatedPathIndex((prev) => (prev + 1) % paths.length);
    }, 500);

    return () => clearInterval(interval);
  }, [animate, paths.length]);

  const activeVertices = useMemo(() => {
    const active = new Set<number>();
    paths.forEach((p) => {
      active.add(p.from);
      active.add(p.to);
    });
    return active;
  }, [paths]);

  const width = 300;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 1.2;

  return (
    <div className="relative">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto max-h-[300px]"
      >
        {/* Background with gradient */}
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="1" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <rect width={width} height={height} fill="url(#bgGradient)" rx="8" />

        {/* Draw base edges (lattice structure) */}
        {defaultEdges.map(([from, to], index) => {
          const fromVertex = vertices.find((v) => v.id === from);
          const toVertex = vertices.find((v) => v.id === to);
          if (!fromVertex || !toVertex) return null;

          const x1 = centerX + fromVertex.x * scale;
          const y1 = centerY + fromVertex.y * scale;
          const x2 = centerX + toVertex.x * scale;
          const y2 = centerY + toVertex.y * scale;

          return (
            <line
              key={`edge-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.5"
              opacity="0.2"
            />
          );
        })}

        {/* Draw encoded paths */}
        {paths.map((path, index) => {
          const fromVertex = vertices.find((v) => v.id === path.from);
          const toVertex = vertices.find((v) => v.id === path.to);
          if (!fromVertex || !toVertex) return null;

          const x1 = centerX + fromVertex.x * scale;
          const y1 = centerY + fromVertex.y * scale;
          const x2 = centerX + toVertex.x * scale;
          const y2 = centerY + toVertex.y * scale;
          const color = pathColors[index % pathColors.length];
          const isAnimated = animate && index === animatedPathIndex;

          return (
            <g key={`path-${index}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={isAnimated ? 3 : 2}
                opacity={isAnimated ? 1 : 0.7}
                filter={isAnimated ? "url(#glow)" : undefined}
                className={isAnimated ? "animate-pulse" : ""}
              />
              {/* Character label at midpoint */}
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2}
                fill={color}
                fontSize="10"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono font-bold"
              >
                {path.char}
              </text>
            </g>
          );
        })}

        {/* Draw vertices */}
        {vertices.map((vertex) => {
          const x = centerX + vertex.x * scale;
          const y = centerY + vertex.y * scale;
          const isActive = activeVertices.has(vertex.id);

          return (
            <g key={`vertex-${vertex.id}`}>
              {/* Outer ring for active vertices */}
              {isActive && (
                <circle
                  cx={x}
                  cy={y}
                  r="12"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1"
                  opacity="0.5"
                  className="animate-pulse"
                />
              )}
              {/* Main vertex circle */}
              <circle
                cx={x}
                cy={y}
                r="8"
                fill={isActive ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                stroke={isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--border))"}
                strokeWidth="1.5"
              />
              {/* Vertex ID */}
              <text
                x={x}
                y={y}
                fill={isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))"}
                fontSize="8"
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono"
              >
                {vertex.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {paths.length > 0 && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Encoded Path:</p>
          <div className="flex flex-wrap gap-1">
            {paths.map((path, index) => (
              <span
                key={index}
                className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-mono font-bold"
                style={{ 
                  backgroundColor: pathColors[index % pathColors.length] + "20",
                  color: pathColors[index % pathColors.length]
                }}
              >
                {path.char}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
