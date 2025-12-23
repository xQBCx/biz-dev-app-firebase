import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  X, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Clock,
  Zap,
  MessageSquare,
  Plus,
  Loader2,
  Brain,
  Target,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

type Situation = {
  id: string;
  title: string;
  description: string | null;
  situation_type: string;
  severity: string;
  status: string;
  context_summary: string | null;
  recommended_action: string | null;
  urgency_score: number;
  risk_level: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

interface SituationDetailPanelProps {
  situation: Situation;
  onClose: () => void;
  onUpdate: () => void;
}

export function SituationDetailPanel({ situation, onClose, onUpdate }: SituationDetailPanelProps) {
  const [actionNote, setActionNote] = useState("");
  const [isAddingAction, setIsAddingAction] = useState(false);

  // Fetch actions for this situation
  const { data: actions = [], refetch: refetchActions } = useQuery({
    queryKey: ['situation-actions', situation.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('situation_actions')
        .select('*')
        .eq('situation_id', situation.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const updates: Record<string, any> = { status: newStatus };
      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolution_outcome = 'success';
      }
      
      const { error } = await supabase
        .from('situations')
        .update(updates)
        .eq('id', situation.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      onUpdate();
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  // Add action mutation
  const addActionMutation = useMutation({
    mutationFn: async (description: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('situation_actions').insert({
        situation_id: situation.id,
        user_id: user.id,
        action_type: 'investigate',
        description,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Action logged");
      setActionNote("");
      setIsAddingAction(false);
      refetchActions();
    },
    onError: () => {
      toast.error("Failed to log action");
    },
  });

  const handleAddAction = () => {
    if (!actionNote.trim()) return;
    addActionMutation.mutate(actionNote);
  };

  return (
    <div className="border border-border rounded-lg bg-card h-fit sticky top-4">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{situation.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs capitalize">
              {situation.situation_type}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                situation.severity === 'critical' && "border-destructive text-destructive",
                situation.severity === 'high' && "border-primary text-primary"
              )}
            >
              {situation.severity}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Context Summary */}
        {situation.context_summary && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Context
            </h4>
            <p className="text-sm">{situation.context_summary}</p>
          </div>
        )}

        {/* Recommended Action */}
        {situation.recommended_action && situation.status !== 'resolved' && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Recommended Next Step
            </h4>
            <p className="text-sm flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              {situation.recommended_action}
            </p>
          </div>
        )}

        {/* Urgency Score */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Urgency
          </h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  situation.urgency_score >= 75 && "bg-destructive",
                  situation.urgency_score >= 50 && situation.urgency_score < 75 && "bg-primary",
                  situation.urgency_score < 50 && "bg-muted-foreground"
                )}
                style={{ width: `${situation.urgency_score}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-8">{situation.urgency_score}%</span>
          </div>
        </div>

        <Separator />

        {/* Status Controls */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Status</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={situation.status === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateStatusMutation.mutate('active')}
              disabled={updateStatusMutation.isPending}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Active
            </Button>
            <Button
              variant={situation.status === 'resolving' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateStatusMutation.mutate('resolving')}
              disabled={updateStatusMutation.isPending}
            >
              <Zap className="h-3 w-3 mr-1" />
              Resolving
            </Button>
            <Button
              variant={situation.status === 'monitoring' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateStatusMutation.mutate('monitoring')}
              disabled={updateStatusMutation.isPending}
            >
              <Clock className="h-3 w-3 mr-1" />
              Monitor
            </Button>
            <Button
              variant={situation.status === 'resolved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateStatusMutation.mutate('resolved')}
              disabled={updateStatusMutation.isPending}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Resolved
            </Button>
          </div>
        </div>

        <Separator />

        {/* Actions/Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Actions Taken
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingAction(!isAddingAction)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>

          {isAddingAction && (
            <div className="mb-3 space-y-2">
              <Textarea
                placeholder="What action did you take?"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsAddingAction(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddAction} disabled={addActionMutation.isPending}>
                  {addActionMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          )}

          {actions.length > 0 ? (
            <div className="space-y-2">
              {actions.map((action: any) => (
                <div key={action.id} className="text-sm p-2 bg-muted/30 rounded">
                  <p>{action.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No actions logged yet</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Created {format(new Date(situation.created_at), 'MMM d, yyyy h:mm a')}
        </p>
      </div>
    </div>
  );
}
