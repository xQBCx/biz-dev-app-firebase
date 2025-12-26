import React, { useState, useRef, useEffect } from 'react';
import { ForceGraph, GraphNode } from '@/components/visualization/ForceGraph';
import { useSystemGraph } from '@/hooks/useSystemGraph';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RefreshCw, 
  Maximize2, 
  ZoomIn, 
  ZoomOut,
  Network,
  Layers,
  Activity,
  Database,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const SystemVisualization: React.FC = () => {
  const navigate = useNavigate();
  const { nodes, edges, stats, loading, error, refresh } = useSystemGraph();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(600, rect.width - 32),
          height: isFullscreen ? window.innerHeight - 120 : Math.max(500, window.innerHeight - 350),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isFullscreen]);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    
    // Navigate to entity detail if applicable
    if (node.metadata?.entityId) {
      const routes: Record<string, string> = {
        contact: `/crm/contacts/${node.metadata.entityId}`,
        company: `/crm`,
        deal: `/crm/deals/${node.metadata.entityId}`,
      };
      if (routes[node.type]) {
        toast.info(`Opening ${node.label}...`);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const navigateToNode = (node: GraphNode) => {
    if (node.type === 'module' || node.type === 'infrastructure') {
      const moduleRoutes: Record<string, string> = {
        'mod-dashboard': '/dashboard',
        'mod-crm': '/crm',
        'mod-erp': '/erp',
        'mod-xodiak': '/xodiak',
        'mod-xbuilderx': '/xbuilderx',
        'mod-grid-os': '/grid-os',
        'mod-iplaunch': '/iplaunch',
        'mod-marketplace': '/marketplace',
        'mod-trueodds': '/trueodds',
        'mod-broadcast': '/broadcast',
        'mod-research': '/research-studio',
        'mod-social': '/social',
        'mod-workflows': '/workflows',
        'mod-ecosystem': '/ecosystem',
        'mod-fleet': '/fleet-intelligence',
        'mod-driveby': '/driveby',
      };
      const route = moduleRoutes[node.id];
      if (route) navigate(route);
    } else if (node.metadata?.entityId) {
      if (node.type === 'contact') navigate(`/crm/contacts/${node.metadata.entityId}`);
      if (node.type === 'deal') navigate(`/crm/deals/${node.metadata.entityId}`);
    }
  };

  const getConnectedNodes = (nodeId: string): GraphNode[] => {
    const connectedIds = new Set<string>();
    edges.forEach(edge => {
      if (edge.source === nodeId) connectedIds.add(edge.target);
      if (edge.target === nodeId) connectedIds.add(edge.source);
    });
    return nodes.filter(n => connectedIds.has(n.id));
  };

  return (
    <div className={`p-4 md:p-6 space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            System Visualization
          </h1>
          <p className="text-sm text-muted-foreground">
            Neural network view of platform modules, entities, and their relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Modules</span>
          </div>
          <p className="text-xl font-bold">{stats.moduleCount}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Entities</span>
          </div>
          <p className="text-xl font-bold">{stats.entityCount}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Total Nodes</span>
          </div>
          <p className="text-xl font-bold">{stats.totalNodes}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Connections</span>
          </div>
          <p className="text-xl font-bold">{stats.totalEdges}</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Graph Canvas */}
        <div 
          ref={containerRef} 
          className={`${isFullscreen ? 'col-span-4' : 'lg:col-span-3'} bg-[#0a0a0f] rounded-lg border border-border overflow-hidden`}
        >
          {error ? (
            <div className="flex items-center justify-center h-[500px] text-destructive">
              {error}
            </div>
          ) : (
            <ForceGraph
              nodes={nodes}
              edges={edges}
              width={dimensions.width}
              height={dimensions.height}
              onNodeClick={handleNodeClick}
              onNodeHover={setHoveredNode}
            />
          )}
        </div>

        {/* Sidebar */}
        {!isFullscreen && (
          <div className="space-y-4">
            {/* Selected/Hovered Node Info */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">
                  {selectedNode ? 'Selected Node' : hoveredNode ? 'Hovered Node' : 'Node Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                {(selectedNode || hoveredNode) ? (
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{(selectedNode || hoveredNode)?.label}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {(selectedNode || hoveredNode)?.type}
                      </Badge>
                    </div>
                    {(selectedNode || hoveredNode) && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Connected to:</p>
                        <ScrollArea className="h-32">
                          <div className="space-y-1">
                            {getConnectedNodes((selectedNode || hoveredNode)!.id).map(n => (
                              <button
                                key={n.id}
                                className="flex items-center gap-1 text-xs hover:text-primary w-full text-left"
                                onClick={() => setSelectedNode(n)}
                              >
                                <span 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: n.color }}
                                />
                                {n.label}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                    {selectedNode && (
                      <Button 
                        size="sm" 
                        className="w-full" 
                        onClick={() => navigateToNode(selectedNode)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Go to {selectedNode.type}
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click or hover on a node to see details
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Module Quick Links */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Quick Navigation</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <Tabs defaultValue="modules">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="modules" className="text-xs">Modules</TabsTrigger>
                    <TabsTrigger value="entities" className="text-xs">Entities</TabsTrigger>
                  </TabsList>
                  <TabsContent value="modules">
                    <ScrollArea className="h-48">
                      <div className="space-y-1 pt-2">
                        {nodes
                          .filter(n => n.type === 'module' || n.type === 'infrastructure')
                          .map(n => (
                            <button
                              key={n.id}
                              className="flex items-center gap-2 text-xs hover:text-primary w-full text-left py-1"
                              onClick={() => {
                                setSelectedNode(n);
                                navigateToNode(n);
                              }}
                            >
                              <span 
                                className="w-2 h-2 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: n.color }}
                              />
                              {n.label}
                            </button>
                          ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="entities">
                    <ScrollArea className="h-48">
                      <div className="space-y-1 pt-2">
                        {nodes
                          .filter(n => n.type !== 'module' && n.type !== 'infrastructure')
                          .slice(0, 50)
                          .map(n => (
                            <button
                              key={n.id}
                              className="flex items-center gap-2 text-xs hover:text-primary w-full text-left py-1"
                              onClick={() => setSelectedNode(n)}
                            >
                              <span 
                                className="w-2 h-2 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: n.color }}
                              />
                              <span className="truncate">{n.label}</span>
                              <Badge variant="outline" className="text-[10px] ml-auto">
                                {n.type}
                              </Badge>
                            </button>
                          ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Controls</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4 text-xs text-muted-foreground space-y-1">
                <p>• Scroll to zoom</p>
                <p>• Drag nodes to reposition</p>
                <p>• Click node to select</p>
                <p>• Hover for quick info</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemVisualization;
