import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Zap,
  Brain,
  Activity,
  Target,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SituationCard } from "@/components/sytuation/SituationCard";
import { CreateSituationDialog } from "@/components/sytuation/CreateSituationDialog";
import { SituationDetailPanel } from "@/components/sytuation/SituationDetailPanel";
import { SignalFeed } from "@/components/sytuation/SignalFeed";
import { QuickActions } from "@/components/sytuation/QuickActions";
import { SituationStats } from "@/components/sytuation/SituationStats";

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

export default function Sytuation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);

  // Fetch situations
  const { data: situations = [], isLoading, refetch } = useQuery({
    queryKey: ['situations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('situations')
        .select('*')
        .eq('user_id', user.id)
        .order('urgency_score', { ascending: false });
      
      if (error) throw error;
      return data as Situation[];
    },
    enabled: !!user?.id,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('situations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'situations',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  // Group situations by status
  const activeSituations = situations.filter(s => s.status === 'active');
  const monitoringSituations = situations.filter(s => s.status === 'monitoring');
  const resolvingSituations = situations.filter(s => s.status === 'resolving');
  const resolvedSituations = situations.filter(s => s.status === 'resolved');

  const criticalCount = situations.filter(s => s.severity === 'critical' && s.status !== 'resolved').length;
  const highCount = situations.filter(s => s.severity === 'high' && s.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Brain className="h-6 w-6" />
                Sytuation
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                What's happening. What matters. What's next.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Situation
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <SituationStats 
            total={situations.length}
            active={activeSituations.length}
            critical={criticalCount}
            high={highCount}
            resolved={resolvedSituations.length}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Signal Feed */}
          <div className="col-span-12 lg:col-span-3">
            <SignalFeed userId={user?.id} />
          </div>

          {/* Center - Situation Cards */}
          <div className="col-span-12 lg:col-span-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : situations.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-12 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Situations</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Create your first situation to start tracking what matters.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Situation
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Critical/Active */}
                {activeSituations.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Active ({activeSituations.length})
                    </h2>
                    <div className="space-y-3">
                      {activeSituations.map(situation => (
                        <SituationCard
                          key={situation.id}
                          situation={situation}
                          onClick={() => setSelectedSituation(situation)}
                          isSelected={selectedSituation?.id === situation.id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolving */}
                {resolvingSituations.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Resolving ({resolvingSituations.length})
                    </h2>
                    <div className="space-y-3">
                      {resolvingSituations.map(situation => (
                        <SituationCard
                          key={situation.id}
                          situation={situation}
                          onClick={() => setSelectedSituation(situation)}
                          isSelected={selectedSituation?.id === situation.id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Monitoring */}
                {monitoringSituations.length > 0 && (
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Monitoring ({monitoringSituations.length})
                    </h2>
                    <div className="space-y-3">
                      {monitoringSituations.map(situation => (
                        <SituationCard
                          key={situation.id}
                          situation={situation}
                          onClick={() => setSelectedSituation(situation)}
                          isSelected={selectedSituation?.id === situation.id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Resolved (collapsed) */}
                {resolvedSituations.length > 0 && (
                  <details className="group">
                    <summary className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2 cursor-pointer list-none">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Resolved ({resolvedSituations.length})
                      <ArrowRight className="h-3 w-3 ml-auto transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="space-y-3 mt-3">
                      {resolvedSituations.slice(0, 5).map(situation => (
                        <SituationCard
                          key={situation.id}
                          situation={situation}
                          onClick={() => setSelectedSituation(situation)}
                          isSelected={selectedSituation?.id === situation.id}
                        />
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Detail/Actions */}
          <div className="col-span-12 lg:col-span-3">
            {selectedSituation ? (
              <SituationDetailPanel 
                situation={selectedSituation}
                onClose={() => setSelectedSituation(null)}
                onUpdate={() => refetch()}
              />
            ) : (
              <QuickActions 
                userId={user?.id}
                onCreateSituation={() => setCreateDialogOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <CreateSituationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        userId={user?.id}
        onSuccess={() => {
          refetch();
          toast.success("Situation created");
        }}
      />
    </div>
  );
}
