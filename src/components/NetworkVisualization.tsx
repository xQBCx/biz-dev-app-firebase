import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ZoomIn, ZoomOut, Maximize2, Plus, Search, Filter,
  Building2, Users, Package, TrendingUp, Database, Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface NetworkNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  health: number;
  connections: number;
  metadata?: any;
}

interface NetworkLink {
  source: string;
  target: string;
  type: string;
  strength: number;
}

interface NetworkVisualizationProps {
  entities: NetworkNode[];
  relationships: NetworkLink[];
  onNodeClick?: (node: NetworkNode) => void;
  onAddEntity?: () => void;
}

export const NetworkVisualization = ({ 
  entities, 
  relationships, 
  onNodeClick,
  onAddEntity 
}: NetworkVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);

  const getNodeColor = (type: string, health: number) => {
    const healthColor = health > 70 ? '#10b981' : health > 40 ? '#f59e0b' : '#ef4444';
    
    const typeColors: Record<string, string> = {
      company: '#3b82f6',
      person: '#8b5cf6',
      tool: '#06b6d4',
      product: '#10b981',
      service: '#f59e0b',
      department: '#ec4899',
      process: '#6366f1'
    };
    
    return typeColors[type] || healthColor;
  };

  const getNodeIcon = (type: string) => {
    const icons: Record<string, any> = {
      company: Building2,
      person: Users,
      tool: Zap,
      product: Package,
      service: TrendingUp,
      department: Database
    };
    return icons[type] || Building2;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw relationships
    relationships.forEach(link => {
      const source = entities.find(e => e.id === link.source);
      const target = entities.find(e => e.id === link.target);
      
      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        
        // Line style based on relationship strength
        const alpha = 0.2 + (link.strength * 0.6);
        ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
        ctx.lineWidth = 1 + (link.strength * 2);
        ctx.stroke();

        // Draw arrow
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowSize = 8;
        ctx.fillStyle = `rgba(148, 163, 184, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(
          target.x - arrowSize * Math.cos(angle - Math.PI / 6),
          target.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(target.x, target.y);
        ctx.lineTo(
          target.x - arrowSize * Math.cos(angle + Math.PI / 6),
          target.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.fill();
      }
    });

    // Draw nodes
    entities.forEach(node => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const radius = isSelected ? 35 : isHovered ? 30 : 25;

      // Node glow for selected/hovered
      if (isSelected || isHovered) {
        const gradient = ctx.createRadialGradient(node.x, node.y, radius, node.x, node.y, radius + 15);
        gradient.addColorStop(0, getNodeColor(node.type, node.health) + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = getNodeColor(node.type, node.health);
      ctx.fill();

      // Node border
      ctx.strokeStyle = isSelected ? '#fff' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#fff';
      ctx.font = `${isSelected ? 'bold ' : ''}12px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, node.y + radius + 15);

      // Connection count badge
      if (node.connections > 0) {
        ctx.beginPath();
        ctx.arc(node.x + radius - 5, node.y - radius + 5, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(node.connections.toString(), node.x + radius - 5, node.y - radius + 8);
      }
    });

    ctx.restore();
  }, [entities, relationships, zoom, pan, selectedNode, hoveredNode]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Check if hovering over a node
    const hovered = entities.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });
    setHoveredNode(hovered || null);

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const clicked = entities.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });

    if (clicked) {
      setSelectedNode(clicked);
      onNodeClick?.(clicked);
    } else {
      setSelectedNode(null);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full">
      {/* Controls Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2">
        <Card className="flex-1 p-2 bg-card/90 backdrop-blur-sm border-border">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
        </Card>
        
        <Card className="p-2 bg-card/90 backdrop-blur-sm border-border flex gap-2">
          <Button size="icon" variant="ghost" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleReset}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          <div className="w-px bg-border" />
          <Button size="icon" variant="ghost">
            <Filter className="w-4 h-4" />
          </Button>
          {onAddEntity && (
            <Button size="icon" variant="default" onClick={onAddEntity}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </Card>
      </div>

      {/* Network Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        style={{ background: 'radial-gradient(circle at 50% 50%, hsl(var(--navy-deep)), hsl(var(--navy-deep) / 0.8))' }}
      />

      {/* Node Details Panel */}
      {selectedNode && (
        <Card className="absolute bottom-4 right-4 p-4 w-80 bg-card/95 backdrop-blur-sm border-border shadow-elevated">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{selectedNode.name}</h3>
                <Badge variant="outline" className="mt-1">
                  {selectedNode.type}
                </Badge>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setSelectedNode(null)}>
                ×
              </Button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Health Score</span>
                <span className="font-medium">{selectedNode.health}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connections</span>
                <span className="font-medium">{selectedNode.connections}</span>
              </div>
            </div>

            <Button className="w-full" size="sm">
              View Details
            </Button>
          </div>
        </Card>
      )}

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-3 bg-card/95 backdrop-blur-sm border-border">
        <div className="text-xs space-y-2">
          <div className="font-semibold mb-2">Entity Types</div>
          {['company', 'person', 'tool', 'product'].map(type => {
            const Icon = getNodeIcon(type);
            return (
              <div key={type} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getNodeColor(type, 75) }}
                />
                <Icon className="w-3 h-3" />
                <span className="capitalize">{type}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};