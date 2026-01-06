import { useState, useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Save, X, Play, Zap, Brain, GitBranch, Globe, Database,
  GripVertical, ChevronRight, Settings, Trash2, Copy, Undo, Redo
} from "lucide-react";
import { toast } from "sonner";
import { nodeTypes } from "./nodes/WorkflowNodeTypes";
import { NodeConfigPanel } from "./NodeConfigPanel";

interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  category: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface VisualWorkflowBuilderProps {
  workflowId?: string;
  initialNodes?: WorkflowNode[];
  initialName?: string;
  onSave: (name: string, nodes: WorkflowNode[], edges: Edge[]) => void;
  onClose: () => void;
  nodeTypeDefinitions: Array<{
    id: string;
    slug: string;
    name: string;
    category: string;
    icon: string;
    description?: string | null;
    config_schema?: Record<string, any>;
  }>;
}

const categoryIcons: Record<string, React.ElementType> = {
  trigger: Zap,
  action: Play,
  logic: GitBranch,
  ai: Brain,
  integration: Globe,
  erp_audit: Database,
};

const categoryColors: Record<string, string> = {
  trigger: "text-amber-400 bg-amber-500/10",
  action: "text-emerald-400 bg-emerald-500/10",
  logic: "text-blue-400 bg-blue-500/10",
  ai: "text-purple-400 bg-purple-500/10",
  integration: "text-cyan-400 bg-cyan-500/10",
  erp_audit: "text-orange-400 bg-orange-500/10",
};

function convertToFlowNodes(workflowNodes: WorkflowNode[]): Node[] {
  return workflowNodes.map((node, index) => ({
    id: node.id,
    type: node.category === "trigger" ? "trigger" : 
          node.category === "logic" ? "logic" : 
          node.category === "ai" ? "ai" : "action",
    position: node.position || { x: 250, y: index * 120 + 50 },
    data: {
      label: node.name,
      category: node.category,
      type: node.type,
      config: node.config,
      isConfigured: Object.keys(node.config || {}).length > 0,
    },
  }));
}

function convertFromFlowNodes(flowNodes: Node[]): WorkflowNode[] {
  return flowNodes.map(node => ({
    id: node.id,
    type: (node.data as any).type || node.type,
    name: (node.data as any).label,
    category: (node.data as any).category,
    config: (node.data as any).config || {},
    position: node.position,
  }));
}

function VisualWorkflowBuilderInner({
  workflowId,
  initialNodes = [],
  initialName = "New Workflow",
  onSave,
  onClose,
  nodeTypeDefinitions,
}: VisualWorkflowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [workflowName, setWorkflowName] = useState(initialName);
  const [nodes, setNodes, onNodesChange] = useNodesState(convertToFlowNodes(initialNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["trigger", "action", "ai"]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeData = event.dataTransfer.getData("application/reactflow");
      if (!nodeData) return;

      const parsed = JSON.parse(nodeData);
      const position = {
        x: event.clientX - (reactFlowWrapper.current?.getBoundingClientRect().left || 0) - 90,
        y: event.clientY - (reactFlowWrapper.current?.getBoundingClientRect().top || 0) - 25,
      };

      const newNode: Node = {
        id: crypto.randomUUID(),
        type: parsed.category === "trigger" ? "trigger" : 
              parsed.category === "logic" ? "logic" : 
              parsed.category === "ai" ? "ai" : "action",
        position,
        data: {
          label: parsed.name,
          category: parsed.category,
          type: parsed.slug,
          description: parsed.description,
          config: {},
          isConfigured: false,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success(`Added ${parsed.name}`);
    },
    [setNodes]
  );

  const onDragStart = (event: React.DragEvent, nodeType: typeof nodeTypeDefinitions[0]) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleSave = () => {
    if (!workflowName.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }
    if (nodes.length === 0) {
      toast.error("Add at least one node to the workflow");
      return;
    }
    onSave(workflowName, convertFromFlowNodes(nodes), edges);
  };

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      toast.success("Node deleted");
    }
  }, [selectedNode, setNodes, setEdges]);

  const duplicateSelectedNode = useCallback(() => {
    if (selectedNode) {
      const newNode: Node = {
        ...selectedNode,
        id: crypto.randomUUID(),
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50,
        },
      };
      setNodes((nds) => nds.concat(newNode));
      toast.success("Node duplicated");
    }
  }, [selectedNode, setNodes]);

  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config, isConfigured: Object.keys(config).length > 0 } }
          : node
      )
    );
  }, [setNodes]);

  const groupedNodeTypes = useMemo(() => {
    return nodeTypeDefinitions.reduce((acc, nt) => {
      if (!acc[nt.category]) acc[nt.category] = [];
      acc[nt.category].push(nt);
      return acc;
    }, {} as Record<string, typeof nodeTypeDefinitions>);
  }, [nodeTypeDefinitions]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="flex h-[80vh] gap-4">
      {/* Node Palette */}
      <Card className="w-72 flex-shrink-0 flex flex-col">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            Node Library
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="py-2 px-3 space-y-2">
            {Object.entries(groupedNodeTypes).map(([category, types]) => {
              const Icon = categoryIcons[category] || Zap;
              const colorClass = categoryColors[category] || categoryColors.action;
              const isExpanded = expandedCategories.includes(category);
              
              return (
                <div key={category} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-1.5 rounded-md ${colorClass}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-medium uppercase flex-1 text-left">
                      {category.replace('_', ' ')}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {types.length}
                    </Badge>
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {isExpanded && (
                    <div className="space-y-1 ml-2">
                      {types.map((nt) => (
                        <div
                          key={nt.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, nt)}
                          className={`flex items-center gap-2 p-2 rounded-lg border border-transparent 
                            hover:border-border hover:bg-muted/30 cursor-grab active:cursor-grabbing 
                            transition-all ${colorClass.split(' ')[1]}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${colorClass.split(' ')[0].replace('text', 'bg')}`} />
                          <span className="text-xs truncate">{nt.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="max-w-xs h-9"
            placeholder="Workflow name..."
          />
          <div className="flex items-center gap-2">
            {selectedNode && (
              <>
                <Button size="sm" variant="ghost" onClick={duplicateSelectedNode}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={deleteSelectedNode}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" />
              Save Workflow
            </Button>
          </div>
        </div>

        <Card className="flex-1 overflow-hidden" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            className="bg-background"
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-muted/20" />
            <Controls className="!bg-card !border-border" />
            <MiniMap 
              className="!bg-card !border-border"
              nodeColor={(node) => {
                const category = (node.data as any).category;
                switch (category) {
                  case 'trigger': return '#f59e0b';
                  case 'action': return '#10b981';
                  case 'logic': return '#3b82f6';
                  case 'ai': return '#a855f7';
                  default: return '#6b7280';
                }
              }}
            />
            <Panel position="top-left" className="!m-3">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                {nodes.length} nodes · {edges.length} connections
              </Badge>
            </Panel>
          </ReactFlow>
        </Card>
      </div>

      {/* Config Panel */}
      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          nodeTypeDefinitions={nodeTypeDefinitions}
          onUpdateConfig={(config) => updateNodeConfig(selectedNode.id, config)}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}

export function VisualWorkflowBuilder(props: VisualWorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <VisualWorkflowBuilderInner {...props} />
    </ReactFlowProvider>
  );
}
