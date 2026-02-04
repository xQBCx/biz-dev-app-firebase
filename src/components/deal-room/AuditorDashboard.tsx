import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, Check, X, AlertTriangle, Clock, 
  FileCheck, DollarSign, Users, Pause, Play,
  ClipboardCheck, Scale, Lock, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

interface AuditAction {
  id: string;
  deal_room_id: string;
  action_type: string;
  action_details: unknown;
  result: string | null;
  notes: string | null;
  created_at: string;
}

interface DealRoom {
  id: string;
  name: string;
  status: string;
}

interface AuditorDashboardProps {
  userId: string;
}

const AUDIT_CHECKLIST = [
  { type: 'terms_review', label: 'Terms Review', description: 'Review all deal terms and conditions', icon: FileCheck },
  { type: 'fairness_check', label: 'Fairness Check', description: 'Verify fair distribution among parties', icon: Scale },
  { type: 'risk_assessment', label: 'Risk Assessment', description: 'Identify potential risks and concerns', icon: AlertTriangle },
  { type: 'compliance_verification', label: 'Compliance Verification', description: 'Ensure regulatory compliance', icon: ClipboardCheck },
  { type: 'signature_validation', label: 'Signature Validation', description: 'Validate all required signatures', icon: Lock },
  { type: 'funds_verification', label: 'Funds Verification', description: 'Verify escrow and payment setup', icon: DollarSign },
];

export function AuditorDashboard({ userId }: AuditorDashboardProps) {
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([]);
  const [selectedDealRoom, setSelectedDealRoom] = useState<string | null>(null);
  const [auditActions, setAuditActions] = useState<AuditAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchDealRooms();
  }, [userId]);

  useEffect(() => {
    if (selectedDealRoom) {
      fetchAuditActions();
    }
  }, [selectedDealRoom]);

  const fetchDealRooms = async () => {
    setIsLoading(true);
    // Fetch deal rooms where user has auditor role
    const { data: roles, error: rolesError } = await supabase
      .from('deal_room_roles')
      .select('deal_room_id')
      .eq('user_id', userId)
      .eq('role_type', 'smart_contract_auditor')
      .eq('is_active', true);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      setIsLoading(false);
      return;
    }

    if (roles && roles.length > 0) {
      const dealRoomIds = roles.map(r => r.deal_room_id);
      const { data: rooms } = await supabase
        .from('deal_rooms')
        .select('id, name, status')
        .in('id', dealRoomIds);

      setDealRooms(rooms || []);
      if (rooms && rooms.length > 0) {
        setSelectedDealRoom(rooms[0].id);
      }
    }
    setIsLoading(false);
  };

  const fetchAuditActions = async () => {
    if (!selectedDealRoom) return;

    const { data, error } = await supabase
      .from('deal_audit_actions')
      .select('*')
      .eq('deal_room_id', selectedDealRoom)
      .eq('auditor_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit actions:', error);
    } else {
      setAuditActions(data || []);
    }
  };

  const performAuditAction = async (actionType: string, result: 'passed' | 'failed' | 'needs_attention') => {
    if (!selectedDealRoom) return;

    try {
      const { data, error } = await supabase
        .from('deal_audit_actions')
        .insert({
          deal_room_id: selectedDealRoom,
          auditor_user_id: userId,
          action_type: actionType,
          action_details: { performed_at: new Date().toISOString() },
          result,
          notes: actionNotes[actionType] || null,
        })
        .select()
        .single();

      if (error) throw error;

      setAuditActions(prev => [data, ...prev]);
      setActionNotes(prev => ({ ...prev, [actionType]: '' }));

      toast({
        title: "Audit Action Recorded",
        description: `${actionType.replace(/_/g, ' ')} marked as ${result}`,
      });
    } catch (error) {
      console.error('Error performing audit action:', error);
      toast({
        title: "Error",
        description: "Failed to record audit action",
        variant: "destructive",
      });
    }
  };

  const placeHold = async () => {
    if (!selectedDealRoom) return;

    try {
      await supabase
        .from('deal_audit_actions')
        .insert({
          deal_room_id: selectedDealRoom,
          auditor_user_id: userId,
          action_type: 'hold_placed',
          action_details: { reason: 'Auditor review pending' },
          result: 'pending',
        });

      toast({
        title: "Hold Placed",
        description: "Deal is now on hold pending further review",
      });
      fetchAuditActions();
    } catch (error) {
      console.error('Error placing hold:', error);
    }
  };

  const releaseHold = async () => {
    if (!selectedDealRoom) return;

    try {
      await supabase
        .from('deal_audit_actions')
        .insert({
          deal_room_id: selectedDealRoom,
          auditor_user_id: userId,
          action_type: 'hold_released',
          action_details: { reason: 'Audit complete' },
          result: 'passed',
        });

      toast({
        title: "Hold Released",
        description: "Deal can now proceed",
      });
      fetchAuditActions();
    } catch (error) {
      console.error('Error releasing hold:', error);
    }
  };

  const finalApproval = async () => {
    if (!selectedDealRoom) return;

    try {
      await supabase
        .from('deal_audit_actions')
        .insert({
          deal_room_id: selectedDealRoom,
          auditor_user_id: userId,
          action_type: 'final_approval',
          action_details: { approved_at: new Date().toISOString() },
          result: 'passed',
        });

      toast({
        title: "Final Approval Granted",
        description: "The deal has been fully approved by the auditor",
      });
      fetchAuditActions();
    } catch (error) {
      console.error('Error granting approval:', error);
    }
  };

  const getActionStatus = (actionType: string): AuditAction | null => {
    return auditActions.find(a => a.action_type === actionType) || null;
  };

  const getResultBadge = (result: string | null) => {
    switch (result) {
      case 'passed':
        return <Badge className="bg-green-500/10 text-green-500 gap-1"><Check className="h-3 w-3" />Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 gap-1"><X className="h-3 w-3" />Failed</Badge>;
      case 'needs_attention':
        return <Badge className="bg-amber-500/10 text-amber-500 gap-1"><AlertTriangle className="h-3 w-3" />Needs Attention</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  const completedChecks = AUDIT_CHECKLIST.filter(item => getActionStatus(item.type)?.result === 'passed').length;
  const progress = (completedChecks / AUDIT_CHECKLIST.length) * 100;

  const hasHold = auditActions.some(a => 
    a.action_type === 'hold_placed' && 
    !auditActions.some(b => b.action_type === 'hold_released' && new Date(b.created_at) > new Date(a.created_at))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Smart Contract Auditor Dashboard
              </CardTitle>
              <CardDescription>
                Review, audit, and approve deals
              </CardDescription>
            </div>
            {dealRooms.length > 1 && (
              <select 
                value={selectedDealRoom || ''} 
                onChange={(e) => setSelectedDealRoom(e.target.value)}
                className="border rounded p-2"
              >
                {dealRooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading...
            </div>
          ) : dealRooms.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No deals assigned to you for auditing</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Audit Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedChecks} / {AUDIT_CHECKLIST.length} checks complete
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 flex-wrap">
                {hasHold ? (
                  <Button onClick={releaseHold} variant="outline" className="gap-2">
                    <Play className="h-4 w-4" />
                    Release Hold
                  </Button>
                ) : (
                  <Button onClick={placeHold} variant="outline" className="gap-2">
                    <Pause className="h-4 w-4" />
                    Place Hold
                  </Button>
                )}
                <Button 
                  onClick={finalApproval}
                  disabled={completedChecks < AUDIT_CHECKLIST.length}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  Grant Final Approval
                </Button>
              </div>

              {/* Audit Checklist */}
              <div>
                <h3 className="text-sm font-medium mb-3">Audit Checklist</h3>
                <div className="space-y-3">
                  {AUDIT_CHECKLIST.map((item) => {
                    const action = getActionStatus(item.type);
                    const Icon = item.icon;
                    
                    return (
                      <div
                        key={item.type}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{item.label}</span>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          {action && getResultBadge(action.result)}
                        </div>

                        {!action && (
                          <>
                            <Textarea
                              value={actionNotes[item.type] || ''}
                              onChange={(e) => setActionNotes(prev => ({ ...prev, [item.type]: e.target.value }))}
                              placeholder="Add notes for this check..."
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => performAuditAction(item.type, 'passed')}
                                className="gap-1"
                              >
                                <Check className="h-4 w-4" />
                                Pass
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => performAuditAction(item.type, 'needs_attention')}
                                className="gap-1"
                              >
                                <AlertTriangle className="h-4 w-4" />
                                Flag
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => performAuditAction(item.type, 'failed')}
                                className="gap-1"
                              >
                                <X className="h-4 w-4" />
                                Fail
                              </Button>
                            </div>
                          </>
                        )}

                        {action?.notes && (
                          <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                            {action.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit History</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <ScrollArea className="h-[200px]">
            <div className="p-4 space-y-2">
              {auditActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {action.action_type.replace(/_/g, ' ')}
                    </span>
                    {getResultBadge(action.result)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(action.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              ))}
              {auditActions.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No audit actions yet</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
