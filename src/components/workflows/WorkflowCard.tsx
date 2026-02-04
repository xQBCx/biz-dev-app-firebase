import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Play, Pause, Settings, Trash2, Copy, 
  Clock, CheckCircle2, XCircle, Loader2 
} from "lucide-react";

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
    trigger_type: string;
    run_count: number;
    last_run_at?: string;
    created_at: string;
  };
  onToggle: (id: string, active: boolean) => void;
  onRun: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isRunning?: boolean;
}

const triggerLabels: Record<string, string> = {
  manual: "Manual",
  schedule: "Scheduled",
  event: "Event-based",
  webhook: "Webhook",
};

export function WorkflowCard({
  workflow,
  onToggle,
  onRun,
  onEdit,
  onDelete,
  onDuplicate,
  isRunning,
}: WorkflowCardProps) {
  return (
    <Card className={`transition-all ${workflow.is_active ? '' : 'opacity-60'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{workflow.name}</h3>
            {workflow.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {workflow.description}
              </p>
            )}
          </div>
          <Switch
            checked={workflow.is_active}
            onCheckedChange={(checked) => onToggle(workflow.id, checked)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {triggerLabels[workflow.trigger_type] || workflow.trigger_type}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {workflow.run_count} runs
          </Badge>
        </div>

        {workflow.last_run_at && (
          <p className="text-xs text-muted-foreground">
            Last run: {new Date(workflow.last_run_at).toLocaleDateString()}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="default"
            className="flex-1"
            onClick={() => onRun(workflow.id)}
            disabled={isRunning || !workflow.is_active}
          >
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 mr-1.5" />
            )}
            Run
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(workflow.id)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDuplicate(workflow.id)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(workflow.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
