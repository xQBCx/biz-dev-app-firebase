import { useState, useCallback, useMemo } from "react";
import { ChevronRight, ChevronDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MindMapNode {
  id: string;
  topic: string;
  subtopics?: MindMapNode[];
  description?: string;
  connections?: string[];
}

interface InteractiveMindMapProps {
  data: {
    central: string;
    branches?: Array<{
      topic: string;
      subtopics?: (string | { topic: string; subtopics?: string[]; description?: string })[];
      connections?: string[];
      description?: string;
    }>;
  };
  onAskQuestion?: (topic: string) => void;
}

// Color palette for different levels
const levelColors = [
  { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary" },
  { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600" },
  { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600" },
  { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-600" },
];

function MindMapNodeComponent({
  node,
  level = 0,
  onAskQuestion,
  expandedNodes,
  toggleNode,
}: {
  node: MindMapNode;
  level: number;
  onAskQuestion?: (topic: string) => void;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
}) {
  const hasChildren = node.subtopics && node.subtopics.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const colors = levelColors[Math.min(level, levelColors.length - 1)];

  return (
    <div className="relative">
      {/* Connecting line */}
      {level > 0 && (
        <div
          className="absolute left-0 top-4 w-4 border-t border-muted-foreground/20"
          style={{ marginLeft: "-1rem" }}
        />
      )}

      {/* Node */}
      <div
        className={cn(
          "group relative rounded-lg border-2 transition-all duration-200",
          colors.bg,
          colors.border,
          hasChildren && "cursor-pointer hover:shadow-md",
          level === 0 && "px-6 py-4" ,
          level > 0 && "px-4 py-2"
        )}
        onClick={() => hasChildren && toggleNode(node.id)}
      >
        <div className="flex items-center gap-2">
          {hasChildren && (
            <span className={cn("transition-transform", colors.text)}>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
          <span
            className={cn(
              "font-medium",
              level === 0 && "text-lg",
              level > 0 && "text-sm",
              colors.text
            )}
          >
            {node.topic}
          </span>
          
          {onAskQuestion && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onAskQuestion(node.topic);
              }}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          )}
        </div>

        {node.description && (
          <p className="text-xs text-muted-foreground mt-1 ml-6">
            {node.description}
          </p>
        )}

        {node.connections && node.connections.length > 0 && (
          <div className="flex gap-1 mt-2 ml-6 flex-wrap">
            {node.connections.map((conn, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground"
              >
                → {conn}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-6 mt-2 space-y-2 pl-4 border-l border-muted-foreground/20">
          {node.subtopics!.map((child, index) => (
            <MindMapNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onAskQuestion={onAskQuestion}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function InteractiveMindMap({ data, onAskQuestion }: InteractiveMindMapProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["root"]) // Root is expanded by default
  );

  const toggleNode = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allIds = new Set<string>(["root"]);
    const collectIds = (nodes: MindMapNode[]) => {
      nodes.forEach((node) => {
        allIds.add(node.id);
        if (node.subtopics) collectIds(node.subtopics);
      });
    };
    if (treeData.subtopics) collectIds(treeData.subtopics);
    setExpandedNodes(allIds);
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set(["root"]));
  }, []);

  // Transform the data into a tree structure with IDs
  const treeData = useMemo((): MindMapNode => {
    let idCounter = 0;
    const generateId = () => `node-${idCounter++}`;

    const transformBranches = (
      branches: typeof data.branches
    ): MindMapNode[] => {
      if (!branches) return [];

      return branches.map((branch) => ({
        id: generateId(),
        topic: branch.topic,
        description: branch.description,
        connections: branch.connections,
        subtopics: branch.subtopics?.map((sub) => {
          if (typeof sub === "string") {
            return { id: generateId(), topic: sub };
          }
          return {
            id: generateId(),
            topic: sub.topic,
            description: sub.description,
            subtopics: sub.subtopics?.map((s) => ({
              id: generateId(),
              topic: typeof s === "string" ? s : s,
            })),
          };
        }),
      }));
    };

    return {
      id: "root",
      topic: data.central,
      subtopics: transformBranches(data.branches),
    };
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={expandAll}>
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          Collapse All
        </Button>
      </div>

      {/* Mind Map */}
      <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
        <MindMapNodeComponent
          node={treeData}
          level={0}
          onAskQuestion={onAskQuestion}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
        />
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>• Click nodes with arrows to expand/collapse</span>
        <span>• Hover and click 💬 to ask questions about a topic</span>
      </div>
    </div>
  );
}
