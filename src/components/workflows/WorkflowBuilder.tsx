import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, Save, Plus, Trash2, Settings, 
  Zap, Brain, GitBranch, Clock, Bell,
  Mail, MessageSquare, Database, Globe
} from "lucide-react";
import { toast } from "sonner";

interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  category: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowBuilderProps {
  workflowId?: string;
  initialNodes?: WorkflowNode[];
  initialName?: string;
  onSave: (name: string, nodes: WorkflowNode[]) => void;
  onClose: () => void;
  nodeTypes: Array<{
    id: string;
    slug: string;
    name: string;
    category: string;
    icon: string;
    config_schema: Record<string, any>;
  }>;
}

const categoryIcons: Record<string, any> = {
  trigger: Zap,
  action: Play,
  logic: GitBranch,
  ai: Brain,
  integration: Globe,
  erp_audit: Database,
};

const categoryColors: Record<string, string> = {
  trigger: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  action: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  logic: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ai: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  integration: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  erp_audit: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export function WorkflowBuilder({ 
  workflowId, 
  initialNodes = [], 
  initialName = "New Workflow",
  onSave, 
  onClose,
  nodeTypes 
}: WorkflowBuilderProps) {
  const [workflowName, setWorkflowName] = useState(initialName);
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const addNode = useCallback((nodeType: typeof nodeTypes[0]) => {
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type: nodeType.slug,
      name: nodeType.name,
      category: nodeType.category,
      config: {},
      position: { x: 100, y: nodes.length * 80 + 50 },
    };
    setNodes(prev => [...prev, newNode]);
    toast.success(`Added ${nodeType.name}`);
  }, [nodes.length]);

  const removeNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  }, [selectedNode]);

  const handleSave = () => {
    if (!workflowName.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }
    if (nodes.length === 0) {
      toast.error("Add at least one node to the workflow");
      return;
    }
    onSave(workflowName, nodes);
  };

  const groupedNodeTypes = nodeTypes.reduce((acc, nt) => {
    if (!acc[nt.category]) acc[nt.category] = [];
    acc[nt.category].push(nt);
    return acc;
  }, {} as Record<string, typeof nodeTypes>);

  return (
    <div className="flex h-[70vh] gap-4">
      {/* Node Palette */}
      <Card className="w-64 flex-shrink-0">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Node Types</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(100%-60px)]">
          <CardContent className="space-y-4 py-2">
            {Object.entries(groupedNodeTypes).map(([category, types]) => {
              const Icon = categoryIcons[category] || Zap;
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      {category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {types.map(nt => (
                      <Button
                        key={nt.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-7"
                        onClick={() => addNode(nt)}
                      >
                        <Plus className="h-3 w-3 mr-1.5" />
                        {nt.name}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Canvas */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="py-3 flex-row items-center justify-between space-y-0">
          <Input
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            className="max-w-xs h-8 text-sm"
            placeholder="Workflow name..."
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Add nodes from the palette to build your workflow</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {nodes.map((node, idx) => {
                const colorClass = categoryColors[node.category] || categoryColors.action;
                return (
                  <div
                    key={node.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      selectedNode === node.id ? 'ring-2 ring-primary' : ''
                    } ${colorClass} cursor-pointer transition-all`}
                    onClick={() => setSelectedNode(node.id)}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background/50 text-xs font-medium">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{node.name}</p>
                      <p className="text-xs opacity-70">{node.type}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {node.category}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={e => {
                        e.stopPropagation();
                        removeNode(node.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Config Panel */}
      {selectedNode && (
        <Card className="w-64 flex-shrink-0">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Node Config
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Configuration options for this node type will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
