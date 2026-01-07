import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  HelpCircle,
  Calendar,
  User,
  Target,
  Pencil,
  Trash2,
  Lock
} from "lucide-react";

interface Deliverable {
  id: string;
  deal_room_id: string;
  participant_id: string;
  deliverable_name: string;
  description: string | null;
  due_date: string | null;
  status: string;
  verification_criteria: string | null;
  value_attribution: number | null;
  category: string;
  priority: string;
  completed_at: string | null;
  created_at: string;
  participant?: {
    name: string;
    email: string;
  };
}

interface Participant {
  id: string;
  name: string;
  email: string;
}

interface ParticipantDeliverablesPanelProps {
  dealRoomId: string;
  isAdmin: boolean;
  contractLocked?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-400", icon: Target },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  blocked: { label: "Blocked", color: "bg-destructive/20 text-destructive", icon: AlertTriangle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", color: "bg-yellow-500/20 text-yellow-400" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-400" },
  critical: { label: "Critical", color: "bg-destructive/20 text-destructive" },
};

const categoryConfig: Record<string, { label: string }> = {
  general: { label: "General" },
  technical: { label: "Technical" },
  financial: { label: "Financial" },
  legal: { label: "Legal" },
  operational: { label: "Operational" },
};

export const ParticipantDeliverablesPanel = ({ dealRoomId, isAdmin, contractLocked = false }: ParticipantDeliverablesPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  
  // Form state
  const [newDeliverable, setNewDeliverable] = useState({
    participant_id: "",
    deliverable_name: "",
    description: "",
    due_date: "",
    verification_criteria: "",
    category: "general",
    priority: "medium",
  });
  
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("clarification");

  useEffect(() => {
    fetchData();
  }, [dealRoomId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch participants
      const { data: participantsData } = await supabase
        .from("deal_room_participants")
        .select("id, name, email")
        .eq("deal_room_id", dealRoomId);
      
      setParticipants(participantsData || []);
      
      // Fetch deliverables
      const { data: deliverablesData, error } = await supabase
        .from("deal_room_participant_deliverables")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Map participant info
      const mappedDeliverables = (deliverablesData || []).map(d => {
        const participant = participantsData?.find(p => p.id === d.participant_id);
        return {
          ...d,
          participant: participant ? { name: participant.name, email: participant.email } : undefined
        };
      });
      
      setDeliverables(mappedDeliverables as Deliverable[]);
    } catch (error) {
      console.error("Error fetching deliverables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeliverable = async () => {
    if (!newDeliverable.participant_id || !newDeliverable.deliverable_name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a participant and enter a deliverable name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("deal_room_participant_deliverables")
        .insert({
          deal_room_id: dealRoomId,
          participant_id: newDeliverable.participant_id,
          deliverable_name: newDeliverable.deliverable_name.trim(),
          description: newDeliverable.description.trim() || null,
          due_date: newDeliverable.due_date || null,
          verification_criteria: newDeliverable.verification_criteria.trim() || null,
          category: newDeliverable.category,
          priority: newDeliverable.priority,
        });

      if (error) throw error;

      toast({
        title: "Deliverable Added",
        description: "The deliverable has been assigned to the participant.",
      });

      setShowAddDialog(false);
      setNewDeliverable({
        participant_id: "",
        deliverable_name: "",
        description: "",
        due_date: "",
        verification_criteria: "",
        category: "general",
        priority: "medium",
      });
      fetchData();
    } catch (error) {
      console.error("Error adding deliverable:", error);
      toast({
        title: "Error",
        description: "Failed to add deliverable. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (deliverableId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("deal_room_participant_deliverables")
        .update(updateData)
        .eq("id", deliverableId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Deliverable marked as ${statusConfig[newStatus].label}.`,
      });
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleEditDeliverable = async () => {
    if (!editingDeliverable) return;

    try {
      const { error } = await supabase
        .from("deal_room_participant_deliverables")
        .update({
          deliverable_name: editingDeliverable.deliverable_name,
          description: editingDeliverable.description,
          due_date: editingDeliverable.due_date,
          verification_criteria: editingDeliverable.verification_criteria,
          category: editingDeliverable.category,
          priority: editingDeliverable.priority,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingDeliverable.id);

      if (error) throw error;

      toast({
        title: "Deliverable Updated",
        description: "The deliverable has been updated successfully.",
      });

      setShowEditDialog(false);
      setEditingDeliverable(null);
      fetchData();
    } catch (error) {
      console.error("Error updating deliverable:", error);
      toast({
        title: "Error",
        description: "Failed to update deliverable.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDeliverable = async (deliverableId: string) => {
    if (!confirm("Are you sure you want to delete this deliverable?")) return;

    try {
      const { error } = await supabase
        .from("deal_room_participant_deliverables")
        .delete()
        .eq("id", deliverableId);

      if (error) throw error;

      toast({
        title: "Deliverable Deleted",
        description: "The deliverable has been removed.",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting deliverable:", error);
      toast({
        title: "Error",
        description: "Failed to delete deliverable.",
        variant: "destructive",
      });
    }
  };

  const handleAskQuestion = async () => {
    if (!selectedDeliverable || !questionText.trim()) return;

    try {
      // Get current user's participant ID
      const { data: myParticipant } = await supabase
        .from("deal_room_participants")
        .select("id")
        .eq("deal_room_id", dealRoomId)
        .eq("user_id", user?.id)
        .single();

      if (!myParticipant) {
        toast({
          title: "Error",
          description: "You must be a participant to ask questions.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("deal_room_participant_questions")
        .insert({
          deal_room_id: dealRoomId,
          participant_id: myParticipant.id,
          related_deliverable_id: selectedDeliverable.id,
          question: questionText.trim(),
          question_type: questionType,
        });

      if (error) throw error;

      toast({
        title: "Question Submitted",
        description: "Your question has been sent to the deal room admin.",
      });

      setShowQuestionDialog(false);
      setQuestionText("");
      setSelectedDeliverable(null);
    } catch (error) {
      console.error("Error submitting question:", error);
      toast({
        title: "Error",
        description: "Failed to submit question.",
        variant: "destructive",
      });
    }
  };

  // Group deliverables by participant
  const deliverablesByParticipant = deliverables.reduce((acc, d) => {
    const key = d.participant_id;
    if (!acc[key]) {
      acc[key] = {
        participant: d.participant || { name: "Unknown", email: "" },
        items: [],
      };
    }
    acc[key].items.push(d);
    return acc;
  }, {} as Record<string, { participant: { name: string; email: string }; items: Deliverable[] }>);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Package className="w-5 h-5 text-primary shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold">Participant Deliverables</h3>
          <Badge variant="secondary" className="text-xs">{deliverables.length}</Badge>
          {contractLocked && (
            <Badge className="bg-amber-500/20 text-amber-600 gap-1 text-xs">
              <Lock className="w-3 h-3" />
              Locked
            </Badge>
          )}
        </div>
        
        {isAdmin && !contractLocked && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 text-xs sm:text-sm w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Assign Deliverable
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assign New Deliverable</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Assign To</label>
                  <Select
                    value={newDeliverable.participant_id}
                    onValueChange={(v) => setNewDeliverable({ ...newDeliverable, participant_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select participant" />
                    </SelectTrigger>
                    <SelectContent>
                      {participants.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Deliverable Name</label>
                  <Input
                    placeholder="e.g., Build sales qualification AI agents"
                    value={newDeliverable.deliverable_name}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, deliverable_name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea
                    placeholder="Detailed description of what needs to be delivered..."
                    value={newDeliverable.description}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select
                      value={newDeliverable.category}
                      onValueChange={(v) => setNewDeliverable({ ...newDeliverable, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Priority</label>
                    <Select
                      value={newDeliverable.priority}
                      onValueChange={(v) => setNewDeliverable({ ...newDeliverable, priority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Due Date</label>
                  <Input
                    type="date"
                    value={newDeliverable.due_date}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, due_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Verification Criteria</label>
                  <Textarea
                    placeholder="How will completion be verified? e.g., 'Agents successfully deployed and handling 10+ calls'"
                    value={newDeliverable.verification_criteria}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, verification_criteria: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddDeliverable}>Assign Deliverable</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {deliverables.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No deliverables assigned yet.</p>
          {isAdmin && <p className="text-sm mt-1">Click "Assign Deliverable" to define what each participant needs to contribute.</p>}
        </div>
      ) : (
        <div className="space-y-6">
            {Object.entries(deliverablesByParticipant).map(([participantId, { participant, items }]) => (
              <div key={participantId} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{participant.name}</span>
                  <span className="text-sm text-muted-foreground">({participant.email})</span>
                  <Badge variant="outline" className="ml-auto">{items.length} deliverable(s)</Badge>
                </div>
                
                <div className="space-y-3">
                  {items.map((deliverable) => {
                    const StatusIcon = statusConfig[deliverable.status].icon;
                    return (
                      <div key={deliverable.id} className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h4 className="font-medium">{deliverable.deliverable_name}</h4>
                              <Badge className={priorityConfig[deliverable.priority].color}>
                                {priorityConfig[deliverable.priority].label}
                              </Badge>
                              <Badge variant="outline">{categoryConfig[deliverable.category]?.label}</Badge>
                            </div>
                            
                            {deliverable.description && (
                              <p className="text-sm text-muted-foreground mb-2">{deliverable.description}</p>
                            )}
                            
                            {deliverable.verification_criteria && (
                              <div className="text-xs text-muted-foreground mb-2">
                                <span className="font-medium">Verification:</span> {deliverable.verification_criteria}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {deliverable.due_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due: {new Date(deliverable.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={statusConfig[deliverable.status].color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[deliverable.status].label}
                            </Badge>
                            
                            <div className="flex gap-1 flex-wrap justify-end">
                              {deliverable.status !== "completed" && (
                                <Select
                                  value={deliverable.status}
                                  onValueChange={(v) => handleUpdateStatus(deliverable.id, v)}
                                >
                                  <SelectTrigger className="h-7 text-xs w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="blocked">Blocked</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              
                              {/* Edit/Delete buttons - only when not locked */}
                              {isAdmin && !contractLocked && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs gap-1"
                                    onClick={() => {
                                      setEditingDeliverable(deliverable);
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Pencil className="w-3 h-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteDeliverable(deliverable.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => {
                                  setSelectedDeliverable(deliverable);
                                  setShowQuestionDialog(true);
                                }}
                              >
                                <HelpCircle className="w-3 h-3" />
                                Ask
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask About This Deliverable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDeliverable && (
              <div className="bg-muted/30 p-3 rounded-lg text-sm">
                <span className="font-medium">{selectedDeliverable.deliverable_name}</span>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-1 block">Question Type</label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clarification">Clarification</SelectItem>
                  <SelectItem value="concern">Concern</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Your Question</label>
              <Textarea
                placeholder="What would you like to know about this deliverable?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>Cancel</Button>
              <Button onClick={handleAskQuestion}>Submit Question</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Deliverable Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Deliverable</DialogTitle>
          </DialogHeader>
          {editingDeliverable && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Deliverable Name</label>
                <Input
                  value={editingDeliverable.deliverable_name}
                  onChange={(e) => setEditingDeliverable({ 
                    ...editingDeliverable, 
                    deliverable_name: e.target.value 
                  })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={editingDeliverable.description || ''}
                  onChange={(e) => setEditingDeliverable({ 
                    ...editingDeliverable, 
                    description: e.target.value 
                  })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Select
                    value={editingDeliverable.category}
                    onValueChange={(v) => setEditingDeliverable({ 
                      ...editingDeliverable, 
                      category: v 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <Select
                    value={editingDeliverable.priority}
                    onValueChange={(v) => setEditingDeliverable({ 
                      ...editingDeliverable, 
                      priority: v 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Due Date</label>
                <Input
                  type="date"
                  value={editingDeliverable.due_date ? new Date(editingDeliverable.due_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingDeliverable({ 
                    ...editingDeliverable, 
                    due_date: e.target.value || null 
                  })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Verification Criteria</label>
                <Textarea
                  value={editingDeliverable.verification_criteria || ''}
                  onChange={(e) => setEditingDeliverable({ 
                    ...editingDeliverable, 
                    verification_criteria: e.target.value 
                  })}
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setShowEditDialog(false);
                  setEditingDeliverable(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleEditDeliverable}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
