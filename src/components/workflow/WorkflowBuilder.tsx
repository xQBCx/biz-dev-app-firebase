import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  Save, 
  Plus, 
  Trash2, 
  Settings, 
  Zap, 
  Mail, 
  MessageSquare, 
  Database, 
  Clock, 
  GitBranch, 
  Bot, 
  FileText, 
  Send, 
  Filter, 
  Repeat, 
  ChevronRight,
  GripVertical,
  X,
  Copy,
  Sparkles
} from 'lucide-react';

// Node types
type NodeType = 'trigger' | 'action' | 'condition' | 'loop' | 'ai' | 'integration';

interface WorkflowNode {
  id: string;
  type: NodeType;
  category: string;
  name: string;
  icon: React.ReactNode;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[];
}

interface TemplateNode {
  type: NodeType;
  category: string;
  name: string;
  icon: React.ReactNode;
  config: Record<string, any>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: TemplateNode[];
}

const NODE_LIBRARY: { category: string; nodes: Omit<WorkflowNode, 'id' | 'position' | 'connections'>[] }[] = [
  {
    category: 'Triggers',
    nodes: [
      { type: 'trigger', category: 'trigger', name: 'Schedule', icon: <Clock className="h-4 w-4" />, config: { cron: '0 9 * * *' } },
      { type: 'trigger', category: 'trigger', name: 'Webhook', icon: <Zap className="h-4 w-4" />, config: { url: '' } },
      { type: 'trigger', category: 'trigger', name: 'Database Change', icon: <Database className="h-4 w-4" />, config: { table: '', event: 'INSERT' } },
      { type: 'trigger', category: 'trigger', name: 'Email Received', icon: <Mail className="h-4 w-4" />, config: { filter: '' } },
    ]
  },
  {
    category: 'Actions',
    nodes: [
      { type: 'action', category: 'action', name: 'Send Email', icon: <Send className="h-4 w-4" />, config: { to: '', subject: '', body: '' } },
      { type: 'action', category: 'action', name: 'Create Task', icon: <FileText className="h-4 w-4" />, config: { title: '', assignee: '' } },
      { type: 'action', category: 'action', name: 'Update Database', icon: <Database className="h-4 w-4" />, config: { table: '', data: {} } },
      { type: 'action', category: 'action', name: 'Send SMS', icon: <MessageSquare className="h-4 w-4" />, config: { to: '', message: '' } },
    ]
  },
  {
    category: 'Logic',
    nodes: [
      { type: 'condition', category: 'logic', name: 'If/Else', icon: <GitBranch className="h-4 w-4" />, config: { condition: '' } },
      { type: 'condition', category: 'logic', name: 'Filter', icon: <Filter className="h-4 w-4" />, config: { expression: '' } },
      { type: 'loop', category: 'logic', name: 'Loop', icon: <Repeat className="h-4 w-4" />, config: { items: '' } },
    ]
  },
  {
    category: 'AI & Agents',
    nodes: [
      { type: 'ai', category: 'ai', name: 'AI Analysis', icon: <Sparkles className="h-4 w-4" />, config: { prompt: '', model: 'gemini-2.5-flash' } },
      { type: 'ai', category: 'ai', name: 'Run Agent', icon: <Bot className="h-4 w-4" />, config: { agentId: '', context: {} } },
      { type: 'ai', category: 'ai', name: 'Generate Content', icon: <FileText className="h-4 w-4" />, config: { type: 'email', tone: 'professional' } },
    ]
  }
];

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'lead-nurture',
    name: 'Lead Nurturing Sequence',
    description: 'Automatically nurture leads with personalized follow-ups',
    category: 'Sales',
    nodes: [
      { type: 'trigger', category: 'trigger', name: 'New Lead', icon: <Database className="h-4 w-4" />, config: { table: 'deals', event: 'INSERT' } },
      { type: 'ai', category: 'ai', name: 'AI Analysis', icon: <Sparkles className="h-4 w-4" />, config: { prompt: 'Analyze lead profile' } },
      { type: 'action', category: 'action', name: 'Send Email', icon: <Send className="h-4 w-4" />, config: { template: 'welcome' } },
    ]
  },
  {
    id: 'deal-alert',
    name: 'Deal Stage Alerts',
    description: 'Get notified when deals move to key stages',
    category: 'Sales',
    nodes: [
      { type: 'trigger', category: 'trigger', name: 'Deal Updated', icon: <Database className="h-4 w-4" />, config: { table: 'deals', event: 'UPDATE' } },
      { type: 'condition', category: 'logic', name: 'If/Else', icon: <GitBranch className="h-4 w-4" />, config: { condition: 'stage == "proposal"' } },
      { type: 'action', category: 'action', name: 'Send SMS', icon: <MessageSquare className="h-4 w-4" />, config: { message: 'Deal moved to proposal!' } },
    ]
  },
  {
    id: 'daily-digest',
    name: 'Daily Task Digest',
    description: 'Send a daily summary of tasks and priorities',
    category: 'Productivity',
    nodes: [
      { type: 'trigger', category: 'trigger', name: 'Schedule', icon: <Clock className="h-4 w-4" />, config: { cron: '0 8 * * *' } },
      { type: 'ai', category: 'ai', name: 'Generate Content', icon: <Sparkles className="h-4 w-4" />, config: { type: 'digest' } },
      { type: 'action', category: 'action', name: 'Send Email', icon: <Send className="h-4 w-4" />, config: { subject: 'Your Daily Digest' } },
    ]
  },
  {
    id: 'agent-chain',
    name: 'Multi-Agent Analysis',
    description: 'Chain multiple AI agents for complex analysis',
    category: 'AI',
    nodes: [
      { type: 'trigger', category: 'trigger', name: 'Webhook', icon: <Zap className="h-4 w-4" />, config: {} },
      { type: 'ai', category: 'ai', name: 'Run Agent', icon: <Bot className="h-4 w-4" />, config: { agentId: 'research' } },
      { type: 'ai', category: 'ai', name: 'Run Agent', icon: <Bot className="h-4 w-4" />, config: { agentId: 'synthesis' } },
    ]
  }
];

const getNodeColor = (type: NodeType): string => {
  switch (type) {
    case 'trigger': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
    case 'action': return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    case 'condition': return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
    case 'loop': return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
    case 'ai': return 'bg-pink-500/20 border-pink-500/50 text-pink-300';
    default: return 'bg-muted border-border text-foreground';
  }
};

export const WorkflowBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [isRunning, setIsRunning] = useState(false);
  const [draggedNode, setDraggedNode] = useState<Omit<WorkflowNode, 'id' | 'position' | 'connections'> | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleDragStart = (node: Omit<WorkflowNode, 'id' | 'position' | 'connections'>) => {
    setDraggedNode(node);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newNode: WorkflowNode = {
      ...draggedNode,
      id: generateId(),
      position: { x, y },
      connections: []
    };

    setNodes(prev => [...prev, newNode]);
    setDraggedNode(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const deleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const duplicateNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const newNode: WorkflowNode = {
      ...node,
      id: generateId(),
      position: { x: node.position.x + 20, y: node.position.y + 20 },
      connections: []
    };

    setNodes(prev => [...prev, newNode]);
  };

  const applyTemplate = (template: WorkflowTemplate) => {
    const templateNodes: WorkflowNode[] = template.nodes.map((n, idx) => ({
      ...n,
      id: generateId(),
      position: { x: 100 + idx * 200, y: 100 + (idx % 2) * 80 },
      connections: []
    }));

    // Connect nodes sequentially
    templateNodes.forEach((node, idx) => {
      if (idx < templateNodes.length - 1) {
        node.connections = [templateNodes[idx + 1].id];
      }
    });

    setNodes(templateNodes);
    setWorkflowName(template.name);
  };

  const toggleRun = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Input 
            value={workflowName} 
            onChange={(e) => setWorkflowName(e.target.value)}
            className="w-64 bg-background"
          />
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? 'Running' : 'Draft'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            size="sm" 
            onClick={toggleRun}
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Node Library */}
        <div className="w-72 border-r border-border bg-card overflow-hidden flex flex-col">
          <Tabs defaultValue="nodes" className="flex-1 flex flex-col">
            <TabsList className="m-2 grid grid-cols-2">
              <TabsTrigger value="nodes">Nodes</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="nodes" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full p-2">
                {NODE_LIBRARY.map((category) => (
                  <div key={category.category} className="mb-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                      {category.category}
                    </h4>
                    <div className="space-y-1">
                      {category.nodes.map((node, idx) => (
                        <div
                          key={idx}
                          draggable
                          onDragStart={() => handleDragStart(node)}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-colors hover:bg-accent ${getNodeColor(node.type)}`}
                        >
                          <GripVertical className="h-3 w-3 opacity-50" />
                          {node.icon}
                          <span className="text-sm">{node.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="templates" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full p-2">
                <div className="space-y-2">
                  {WORKFLOW_TEMPLATES.map((template) => (
                    <Card 
                      key={template.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => applyTemplate(template)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{template.category}</Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          {template.nodes.map((n, idx) => (
                            <React.Fragment key={idx}>
                              <div className={`p-1 rounded ${getNodeColor(n.type)}`}>
                                {n.icon}
                              </div>
                              {idx < template.nodes.length - 1 && (
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-auto bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] bg-[length:24px_24px]"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Build Your Workflow</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Drag nodes from the library or select a template to get started
                </p>
              </div>
            </div>
          )}

          {/* Render Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute cursor-pointer transition-all ${
                selectedNode === node.id ? 'ring-2 ring-primary' : ''
              }`}
              style={{ left: node.position.x, top: node.position.y }}
              onClick={() => setSelectedNode(node.id)}
            >
              <Card className={`w-48 ${getNodeColor(node.type)}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {node.icon}
                      <span className="text-sm font-medium">{node.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); duplicateNode(node.id); }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Object.keys(node.config).length > 0 && (
                      <span>Click to configure</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Connection Point */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background cursor-crosshair" />
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted border-2 border-border" />
            </div>
          ))}

          {/* Draw Connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {nodes.map(node => 
              node.connections.map(targetId => {
                const target = nodes.find(n => n.id === targetId);
                if (!target) return null;
                
                const startX = node.position.x + 192 + 8;
                const startY = node.position.y + 32;
                const endX = target.position.x - 8;
                const endY = target.position.y + 32;
                const midX = (startX + endX) / 2;

                return (
                  <path
                    key={`${node.id}-${targetId}`}
                    d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4"
                  />
                );
              })
            )}
          </svg>
        </div>

        {/* Right Sidebar - Node Config */}
        {selectedNode && (
          <div className="w-80 border-l border-border bg-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Node Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedNode(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {(() => {
              const node = nodes.find(n => n.id === selectedNode);
              if (!node) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Node Type</label>
                    <div className={`mt-1 p-2 rounded ${getNodeColor(node.type)}`}>
                      <div className="flex items-center gap-2">
                        {node.icon}
                        <span>{node.name}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Configuration</label>
                    <div className="mt-2 space-y-2">
                      {Object.entries(node.config).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}</label>
                          <Input 
                            value={typeof value === 'string' ? value : JSON.stringify(value)}
                            onChange={(e) => {
                              setNodes(prev => prev.map(n => 
                                n.id === node.id 
                                  ? { ...n, config: { ...n.config, [key]: e.target.value } }
                                  : n
                              ));
                            }}
                            className="mt-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                      onClick={() => deleteNode(node.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Node
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
