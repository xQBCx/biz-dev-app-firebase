import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";

interface ERPMindMapProps {
  folderStructure: Record<string, any>;
}

interface MindMapNode {
  name: string;
  children: MindMapNode[];
  x: number;
  y: number;
  level: number;
}

const ERPMindMap = ({ folderStructure }: ERPMindMapProps) => {
  const buildTree = (obj: Record<string, any>, level = 0): MindMapNode[] => {
    return Object.entries(obj).map(([name, children]) => ({
      name,
      children: typeof children === "object" && children !== null 
        ? buildTree(children as Record<string, any>, level + 1) 
        : [],
      x: 0,
      y: 0,
      level,
    }));
  };

  const tree = useMemo(() => {
    if (!folderStructure.root) return [];
    return buildTree(folderStructure.root);
  }, [folderStructure]);

  const calculatePositions = (nodes: MindMapNode[], centerX: number, startY: number, level: number): { nodes: MindMapNode[]; lines: { x1: number; y1: number; x2: number; y2: number }[] } => {
    const nodeWidth = 120;
    const nodeHeight = 40;
    const verticalGap = 60;
    const horizontalGap = 20;
    
    const totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * horizontalGap;
    let currentX = centerX - totalWidth / 2;
    
    const positionedNodes: MindMapNode[] = [];
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    
    nodes.forEach((node) => {
      const nodeX = currentX + nodeWidth / 2;
      const nodeY = startY;
      
      positionedNodes.push({
        ...node,
        x: nodeX,
        y: nodeY,
      });
      
      if (node.children.length > 0) {
        const childResult = calculatePositions(
          node.children,
          nodeX,
          nodeY + verticalGap + nodeHeight,
          level + 1
        );
        
        childResult.nodes.forEach((child) => {
          positionedNodes.push(child);
          lines.push({
            x1: nodeX,
            y1: nodeY + nodeHeight / 2,
            x2: child.x,
            y2: child.y - nodeHeight / 2,
          });
        });
        
        lines.push(...childResult.lines);
      }
      
      currentX += nodeWidth + horizontalGap;
    });
    
    return { nodes: positionedNodes, lines };
  };

  const { nodes: positionedNodes, lines } = useMemo(() => {
    if (tree.length === 0) return { nodes: [], lines: [] };
    return calculatePositions(tree, 400, 40, 0);
  }, [tree]);

  const svgWidth = 800;
  const svgHeight = Math.max(400, positionedNodes.reduce((max, n) => Math.max(max, n.y + 60), 0));

  const levelColors = [
    "hsl(var(--primary))",
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  if (tree.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            ERP Mind Map
          </CardTitle>
          <CardDescription>Visual representation of your ERP structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No structure to visualize
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          ERP Mind Map
        </CardTitle>
        <CardDescription>Visual representation of your ERP structure</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto border rounded-lg bg-muted/30">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            {/* Lines */}
            {lines.map((line, idx) => (
              <path
                key={idx}
                d={`M ${line.x1} ${line.y1} C ${line.x1} ${(line.y1 + line.y2) / 2}, ${line.x2} ${(line.y1 + line.y2) / 2}, ${line.x2} ${line.y2}`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />
            ))}
            
            {/* Nodes */}
            {positionedNodes.map((node, idx) => (
              <g key={idx} transform={`translate(${node.x - 55}, ${node.y - 15})`}>
                <rect
                  width="110"
                  height="30"
                  rx="6"
                  fill={levelColors[node.level % levelColors.length]}
                  opacity="0.9"
                />
                <text
                  x="55"
                  y="20"
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="500"
                >
                  {node.name.length > 14 ? node.name.substring(0, 12) + "..." : node.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default ERPMindMap;
