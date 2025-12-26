import React, { useRef, useEffect, useState, useCallback } from 'react';

export interface GraphNode {
  id: string;
  label: string;
  type: 'module' | 'contact' | 'company' | 'asset' | 'deal' | 'user' | 'agent' | 'product' | 'service' | 'infrastructure';
  value?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  color?: string;
  size?: number;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
  type?: string;
  color?: string;
}

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
}

const NODE_COLORS: Record<GraphNode['type'], string> = {
  module: '#f97316',      // Orange
  contact: '#3b82f6',     // Blue
  company: '#22c55e',     // Green
  asset: '#a855f7',       // Purple
  deal: '#eab308',        // Yellow
  user: '#06b6d4',        // Cyan
  agent: '#ec4899',       // Pink
  product: '#f43f5e',     // Rose
  service: '#14b8a6',     // Teal
  infrastructure: '#8b5cf6', // Violet
};

const NODE_SIZES: Record<GraphNode['type'], number> = {
  module: 24,
  company: 18,
  contact: 12,
  asset: 16,
  deal: 14,
  user: 10,
  agent: 20,
  product: 14,
  service: 14,
  infrastructure: 22,
};

export const ForceGraph: React.FC<ForceGraphProps> = ({
  nodes: initialNodes,
  edges,
  width = 1200,
  height = 800,
  onNodeClick,
  onNodeHover,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const animationRef = useRef<number>();

  // Initialize nodes with positions
  useEffect(() => {
    const initializedNodes = initialNodes.map((node, i) => ({
      ...node,
      x: node.x ?? width / 2 + (Math.random() - 0.5) * 400,
      y: node.y ?? height / 2 + (Math.random() - 0.5) * 400,
      vx: 0,
      vy: 0,
      color: node.color ?? NODE_COLORS[node.type],
      size: node.size ?? NODE_SIZES[node.type],
    }));
    setNodes(initializedNodes);
  }, [initialNodes, width, height]);

  // Force simulation
  const simulate = useCallback(() => {
    if (nodes.length === 0) return;

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const alpha = 0.3;
    const alphaDecay = 0.02;
    
    setNodes(prevNodes => {
      const newNodes = prevNodes.map(node => {
        if (node.fx !== null && node.fx !== undefined) {
          return { ...node, x: node.fx, y: node.fy };
        }

        let fx = 0, fy = 0;

        // Center gravity
        const cx = width / 2;
        const cy = height / 2;
        fx += (cx - (node.x ?? cx)) * 0.01;
        fy += (cy - (node.y ?? cy)) * 0.01;

        // Repulsion between nodes
        prevNodes.forEach(other => {
          if (other.id === node.id) return;
          const dx = (node.x ?? 0) - (other.x ?? 0);
          const dy = (node.y ?? 0) - (other.y ?? 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = ((node.size ?? 10) + (other.size ?? 10)) * 3;
          if (dist < minDist * 2) {
            const force = (minDist * 2 - dist) / dist * 2;
            fx += dx * force * 0.05;
            fy += dy * force * 0.05;
          }
        });

        // Attraction along edges
        edges.forEach(edge => {
          const sourceId = edge.source;
          const targetId = edge.target;
          
          if (sourceId !== node.id && targetId !== node.id) return;
          
          const otherId = sourceId === node.id ? targetId : sourceId;
          const other = nodeMap.get(otherId);
          if (!other) return;

          const dx = (other.x ?? 0) - (node.x ?? 0);
          const dy = (other.y ?? 0) - (node.y ?? 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = 150;
          const force = (dist - idealDist) / dist * 0.03 * (edge.weight ?? 1);
          fx += dx * force;
          fy += dy * force;
        });

        // Apply forces
        const vx = ((node.vx ?? 0) + fx) * 0.8;
        const vy = ((node.vy ?? 0) + fy) * 0.8;

        return {
          ...node,
          x: Math.max(50, Math.min(width - 50, (node.x ?? 0) + vx * alpha)),
          y: Math.max(50, Math.min(height - 50, (node.y ?? 0) + vy * alpha)),
          vx,
          vy,
        };
      });

      return newNodes;
    });
  }, [nodes.length, edges, width, height]);

  // Animation loop
  useEffect(() => {
    let running = true;
    
    const tick = () => {
      if (!running) return;
      simulate();
      animationRef.current = requestAnimationFrame(tick);
    };
    
    tick();
    
    return () => {
      running = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [simulate]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(transform.x + width / 2, transform.y + height / 2);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(-width / 2, -height / 2);

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Draw edges
    edges.forEach(edge => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) return;

      const gradient = ctx.createLinearGradient(
        source.x ?? 0, source.y ?? 0,
        target.x ?? 0, target.y ?? 0
      );
      
      const sourceColor = source.color ?? '#666';
      const targetColor = target.color ?? '#666';
      gradient.addColorStop(0, sourceColor + '40');
      gradient.addColorStop(1, targetColor + '40');

      ctx.beginPath();
      ctx.strokeStyle = edge.color ?? gradient;
      ctx.lineWidth = Math.min(3, 0.5 + (edge.weight ?? 1) * 0.5);
      ctx.moveTo(source.x ?? 0, source.y ?? 0);
      ctx.lineTo(target.x ?? 0, target.y ?? 0);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const size = node.size ?? 10;
      const isHovered = hoveredNode?.id === node.id;

      // Glow effect
      if (isHovered) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        glow.addColorStop(0, (node.color ?? '#fff') + '60');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.fillStyle = node.color ?? '#fff';
      ctx.arc(x, y, isHovered ? size * 1.3 : size, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      if (isHovered || size > 15) {
        ctx.fillStyle = '#fff';
        ctx.font = `${isHovered ? 'bold ' : ''}${Math.max(10, size * 0.6)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.label, x, y + size + 4);
      }
    });

    ctx.restore();

    // Legend
    const legendItems = Object.entries(NODE_COLORS);
    const legendY = 20;
    ctx.font = '11px Inter, system-ui, sans-serif';
    legendItems.forEach(([type, color], i) => {
      const x = 20;
      const y = legendY + i * 18;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#888';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(type.charAt(0).toUpperCase() + type.slice(1), x + 12, y);
    });

  }, [nodes, edges, hoveredNode, width, height, transform]);

  // Mouse handlers
  const getMousePos = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - transform.x - width / 2) / transform.scale + width / 2;
    const y = (e.clientY - rect.top - transform.y - height / 2) / transform.scale + height / 2;
    return { x, y };
  };

  const findNodeAt = (pos: { x: number; y: number }): GraphNode | null => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = pos.x - (node.x ?? 0);
      const dy = pos.y - (node.y ?? 0);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (node.size ?? 10) * 1.5) {
        return node;
      }
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    
    if (draggedNode) {
      setNodes(prev => prev.map(n => 
        n.id === draggedNode.id 
          ? { ...n, fx: pos.x, fy: pos.y, x: pos.x, y: pos.y }
          : n
      ));
      return;
    }

    const node = findNodeAt(pos);
    if (node !== hoveredNode) {
      setHoveredNode(node);
      onNodeHover?.(node);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const node = findNodeAt(pos);
    if (node) {
      setDraggedNode(node);
      setNodes(prev => prev.map(n => 
        n.id === node.id ? { ...n, fx: pos.x, fy: pos.y } : n
      ));
    }
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      setNodes(prev => prev.map(n => 
        n.id === draggedNode.id ? { ...n, fx: null, fy: null } : n
      ));
      setDraggedNode(null);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (draggedNode) return;
    const pos = getMousePos(e);
    const node = findNodeAt(pos);
    if (node) {
      onNodeClick?.(node);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.2, Math.min(3, prev.scale * delta)),
    }));
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height, cursor: hoveredNode ? 'pointer' : 'default' }}
      className="rounded-lg"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
    />
  );
};
