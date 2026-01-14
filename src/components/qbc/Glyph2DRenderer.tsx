import { useMemo } from 'react';
import { EncodedPath, GlyphStyle, GlyphOrientation, LatticeAnchors2D } from '@/lib/qbc/types';

interface Glyph2DRendererProps {
  path: EncodedPath;
  anchors: LatticeAnchors2D;
  style: GlyphStyle;
  orientation: GlyphOrientation;
  className?: string;
  size?: number;
}

const PADDING = 40;

function transformPoint(
  x: number,
  y: number,
  orientation: GlyphOrientation
): { x: number; y: number } {
  let tx = x;
  let ty = y;

  if (orientation.mirror) {
    tx = 1 - tx;
  }

  if (orientation.flipVertical) {
    ty = 1 - ty;
  }

  const radians = (orientation.rotation * Math.PI) / 180;
  const cx = 0.5;
  const cy = 0.5;

  const cosR = Math.cos(radians);
  const sinR = Math.sin(radians);

  const dx = tx - cx;
  const dy = ty - cy;

  tx = cx + dx * cosR - dy * sinR;
  ty = cy + dx * sinR + dy * cosR;

  return { x: tx, y: ty };
}

export function Glyph2DRenderer({
  path,
  anchors,
  style,
  orientation,
  className = '',
  size = 400,
}: Glyph2DRendererProps) {
  const contentSize = size - PADDING * 2;

  const toSvgCoords = (x: number, y: number) => {
    const transformed = transformPoint(x, y, orientation);
    return {
      sx: PADDING + transformed.x * contentSize,
      sy: PADDING + (1 - transformed.y) * contentSize,
    };
  };

  const gridLines = useMemo(() => {
    if (!style.showGrid) return null;

    const lines = [];
    const gridSpacing = contentSize / 10;

    for (let i = 0; i <= 10; i++) {
      const pos = PADDING + i * gridSpacing;
      lines.push(
        <line
          key={`v-${i}`}
          x1={pos}
          y1={PADDING}
          x2={pos}
          y2={size - PADDING}
          stroke={style.gridColor}
          strokeWidth={0.5}
          opacity={0.5}
        />
      );
      lines.push(
        <line
          key={`h-${i}`}
          x1={PADDING}
          y1={pos}
          x2={size - PADDING}
          y2={pos}
          stroke={style.gridColor}
          strokeWidth={0.5}
          opacity={0.5}
        />
      );
    }

    return lines;
  }, [style.showGrid, style.gridColor, contentSize, size]);

  const anchorNodes = useMemo(() => {
    if (!style.showNodes) return null;

    return Object.entries(anchors).map(([char, [x, y]]) => {
      const { sx, sy } = toSvgCoords(x, y);
      const isStart = char === path.visitedChars[0];
      const fill = isStart ? style.nodeColor : style.nodeFillColor;

      return (
        <g key={char}>
          <circle
            cx={sx}
            cy={sy}
            r={style.nodeSize / 2}
            fill={fill}
            stroke={style.nodeColor}
            strokeWidth={1.5}
          />
          {style.showLabels && (
            <text
              x={sx}
              y={sy - style.nodeSize}
              textAnchor="middle"
              fontSize="10"
              fontFamily="monospace"
              fill={style.nodeColor}
            >
              {char === ' ' ? '␣' : char}
            </text>
          )}
        </g>
      );
    });
  }, [anchors, style, path.visitedChars, orientation]);

  const pathElements = useMemo(() => {
    const elements: JSX.Element[] = [];
    let pathD = '';
    
    // Track if we're continuing from a tick endpoint
    let afterTick = false;

    path.events.forEach((event, idx) => {
      const { sx, sy } = toSvgCoords(event.x, event.y);

      switch (event.type) {
        case 'move':
          pathD += `M ${sx} ${sy} `;
          afterTick = false;
          break;

        case 'line':
          pathD += `L ${sx} ${sy} `;
          afterTick = false;
          break;

        case 'tick': {
          // Tick event: the preceding 'line' event already drew to the anchor (event.x, event.y)
          // Now draw the quarter-notch from anchor to tick endpoint
          // Path continues from tick endpoint to next character
          if (event.tickEndX !== undefined && event.tickEndY !== undefined) {
            const { sx: tsx, sy: tsy } = toSvgCoords(event.tickEndX, event.tickEndY);
            pathD += `L ${tsx} ${tsy} `;
            afterTick = true;
          }
          break;
        }
      }
    });

    // Main path
    if (pathD) {
      elements.unshift(
        <path
          key="main-path"
          d={pathD.trim()}
          fill="none"
          stroke={style.strokeColor}
          strokeWidth={style.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }

    // End cap
    if (path.events.length > 1) {
      const lastEvent = path.events[path.events.length - 1];
      let endX: number, endY: number;
      let prevX: number, prevY: number;

      // Determine the final point
      if (lastEvent.type === 'tick' && lastEvent.tickEndX !== undefined && lastEvent.tickEndY !== undefined) {
        const { sx: ex, sy: ey } = toSvgCoords(lastEvent.tickEndX, lastEvent.tickEndY);
        const { sx: ax, sy: ay } = toSvgCoords(lastEvent.x, lastEvent.y);
        endX = ex;
        endY = ey;
        prevX = ax;
        prevY = ay;
      } else {
        const { sx: lx, sy: ly } = toSvgCoords(lastEvent.x, lastEvent.y);
        endX = lx;
        endY = ly;

        // Find previous event for direction
        const prevEvent = path.events[path.events.length - 2];
        if (prevEvent.type === 'tick' && prevEvent.tickEndX !== undefined && prevEvent.tickEndY !== undefined) {
          const { sx: px, sy: py } = toSvgCoords(prevEvent.tickEndX, prevEvent.tickEndY);
          prevX = px;
          prevY = py;
        } else {
          const { sx: px, sy: py } = toSvgCoords(prevEvent.x, prevEvent.y);
          prevX = px;
          prevY = py;
        }
      }

      const dx = endX - prevX;
      const dy = endY - prevY;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len > 0) {
        const capLen = 8;
        const perpX = (-dy / len) * capLen;
        const perpY = (dx / len) * capLen;

        elements.push(
          <line
            key="end-cap"
            x1={endX + perpX}
            y1={endY + perpY}
            x2={endX - perpX}
            y2={endY - perpY}
            stroke={style.strokeColor}
            strokeWidth={style.strokeWidth}
            strokeLinecap="round"
          />
        );
      }
    }

    return elements;
  }, [path, style, orientation, contentSize]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
    >
      <rect width="100%" height="100%" fill={style.backgroundColor} />
      {gridLines}
      {pathElements}
      {anchorNodes}
    </svg>
  );
}
