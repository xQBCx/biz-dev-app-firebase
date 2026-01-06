import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { 
  Zap, Play, GitBranch, Brain, Globe, Database, 
  Mail, MessageSquare, Clock, Bell, Settings, Filter,
  Calculator, FileText, Users, Webhook, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  trigger: Zap,
  action: Play,
  logic: GitBranch,
  ai: Brain,
  integration: Globe,
  erp_audit: Database,
  email: Mail,
  message: MessageSquare,
  schedule: Clock,
  notification: Bell,
  config: Settings,
  filter: Filter,
  calculate: Calculator,
  document: FileText,
  users: Users,
  webhook: Webhook,
  loop: RefreshCw,
};

const categoryStyles: Record<string, { bg: string; border: string; icon: string }> = {
  trigger: { 
    bg: "bg-amber-500/10", 
    border: "border-amber-500/50 hover:border-amber-400", 
    icon: "text-amber-400" 
  },
  action: { 
    bg: "bg-emerald-500/10", 
    border: "border-emerald-500/50 hover:border-emerald-400", 
    icon: "text-emerald-400" 
  },
  logic: { 
    bg: "bg-blue-500/10", 
    border: "border-blue-500/50 hover:border-blue-400", 
    icon: "text-blue-400" 
  },
  ai: { 
    bg: "bg-purple-500/10", 
    border: "border-purple-500/50 hover:border-purple-400", 
    icon: "text-purple-400" 
  },
  integration: { 
    bg: "bg-cyan-500/10", 
    border: "border-cyan-500/50 hover:border-cyan-400", 
    icon: "text-cyan-400" 
  },
  erp_audit: { 
    bg: "bg-orange-500/10", 
    border: "border-orange-500/50 hover:border-orange-400", 
    icon: "text-orange-400" 
  },
};

interface WorkflowNodeData {
  label: string;
  category: string;
  type: string;
  description?: string;
  config?: Record<string, any>;
  isConfigured?: boolean;
}

export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const style = categoryStyles.trigger;
  const Icon = iconMap[nodeData.type] || iconMap.trigger;

  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[180px] transition-all duration-200",
      style.bg, style.border,
      selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-background/50", style.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{nodeData.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{nodeData.description || "Trigger"}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-background"
      />
    </div>
  );
});

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const style = categoryStyles[nodeData.category] || categoryStyles.action;
  const Icon = iconMap[nodeData.type] || iconMap[nodeData.category] || iconMap.action;

  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[180px] transition-all duration-200",
      style.bg, style.border,
      selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background"
      />
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-background/50", style.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{nodeData.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{nodeData.description || nodeData.category}</p>
        </div>
        {nodeData.isConfigured && (
          <div className="w-2 h-2 rounded-full bg-emerald-400" title="Configured" />
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background"
      />
    </div>
  );
});

export const LogicNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const style = categoryStyles.logic;
  const Icon = iconMap[nodeData.type] || iconMap.logic;

  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[180px] transition-all duration-200 rotate-0",
      style.bg, style.border,
      selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-background"
      />
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-background/50", style.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{nodeData.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{nodeData.description || "Condition"}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: '30%' }}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: '70%' }}
        className="!w-3 !h-3 !bg-red-400 !border-2 !border-background"
      />
    </div>
  );
});

export const AINode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const style = categoryStyles.ai;
  const Icon = iconMap[nodeData.type] || iconMap.ai;

  return (
    <div className={cn(
      "px-4 py-3 rounded-xl border-2 min-w-[180px] transition-all duration-200",
      style.bg, style.border,
      "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
      selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-background"
      />
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-background/50 relative", style.icon)}>
          <Icon className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{nodeData.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{nodeData.description || "AI Processing"}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-background"
      />
    </div>
  );
});

TriggerNode.displayName = "TriggerNode";
ActionNode.displayName = "ActionNode";
LogicNode.displayName = "LogicNode";
AINode.displayName = "AINode";

export const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  logic: LogicNode,
  ai: AINode,
};
