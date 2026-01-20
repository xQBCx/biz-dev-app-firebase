import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Vote, 
  BarChart3, 
  Settings,
  Sparkles,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Package,
  Zap,
  Gauge,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { DealRoomOverview } from "@/components/dealroom/DealRoomOverview";
import { DealRoomParticipants } from "@/components/dealroom/DealRoomParticipants";
import { DealRoomContributions } from "@/components/dealroom/DealRoomContributions";
import { DealRoomStructures } from "@/components/dealroom/DealRoomStructures";
import { DealRoomAIAnalysis } from "@/components/dealroom/DealRoomAIAnalysis";
import { DealRoomCredits } from "@/components/dealroom/DealRoomCredits";
import { DealRoomIngredients } from "@/components/dealroom/DealRoomIngredients";
import { DealRoomSettlement } from "@/components/dealroom/DealRoomSettlement";
import { BlenderKnowledgeHelper } from "@/components/dealroom/BlenderKnowledgeHelper";
import { ChemicalBlender } from "@/components/dealroom/ChemicalBlender";
import { BlenderAnalytics } from "@/components/dealroom/BlenderAnalytics";
import { AgentRegistrationPanel } from "@/components/dealroom/AgentRegistrationPanel";
import { AgentActivityFeed } from "@/components/dealroom/AgentActivityFeed";
import { AgentAttributionManager } from "@/components/dealroom/AgentAttributionManager";
import { AgentIntegrationGuide } from "@/components/dealroom/AgentIntegrationGuide";
import { AgentContributionViewer } from "@/components/dealroom/AgentContributionViewer";
import { DualCRMSyncStatus } from "@/components/dealroom/DualCRMSyncStatus";
import { AgentSandboxMode } from "@/components/dealroom/AgentSandboxMode";
import { ViewProAgentSetupGuide } from "@/components/deal-room/ViewProAgentSetupGuide";
import { XODIAKRelationshipView } from "@/components/xodiak/XODIAKRelationshipView";

import { PayoutCalculator } from "@/components/dealroom/PayoutCalculator";
import { DealEscrowPanel } from "@/components/deal-room/DealEscrowPanel";
import { DealRoomInviteManager } from "@/components/deal-room/DealRoomInviteManager";
import { DealRoomMessaging } from "@/components/deal-room/DealRoomMessaging";
import { DealRoomChat } from "@/components/deal-room/DealRoomChat";
import { DealRoomDescriptionEditor } from "@/components/dealroom/DealRoomDescriptionEditor";
import { SettlementAdjustmentProposal } from "@/components/dealroom/SettlementAdjustmentProposal";
import { ParticipantDeliverablesPanel } from "@/components/dealroom/ParticipantDeliverablesPanel";
import { SmartContractTermsPanel } from "@/components/dealroom/SmartContractTermsPanel";
import { ContractLockPanel } from "@/components/dealroom/ContractLockPanel";
import { VotingQuestionsPanel } from "@/components/dealroom/VotingQuestionsPanel";
import { ChangeOrderPanel } from "@/components/dealroom/ChangeOrderPanel";
import { DealRoomVoiceOverview } from "@/components/dealroom/DealRoomVoiceOverview";
import { RetainerManagementPanel } from "@/components/dealroom/RetainerManagementPanel";
import { CreditMeterPanel } from "@/components/dealroom/CreditMeterPanel";
import { SettlementContractBuilder } from "@/components/dealroom/SettlementContractBuilder";
import { EscrowDashboard } from "@/components/dealroom/EscrowDashboard";
import { Beaker, Activity, Link as LinkIcon, Calculator, MessageSquare, Mail, Shield, UserPlus, Briefcase, ScrollText, Lock, Unlock, Bot, Link } from "lucide-react";

interface DealRoom {
  id: string;
  name: string;
  description: string | null;
  category: string;
  expected_deal_size_min: number | null;
  expected_deal_size_max: number | null;
  time_horizon: string;
  status: string;
  voting_rule: string;
  ai_analysis_enabled: boolean;
  created_by: string;
  created_at: string;
  voting_enabled: boolean;
  contract_locked: boolean;
  contract_locked_at: string | null;
  contract_locked_by: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  active: { label: "Active", color: "bg-primary/20 text-primary", icon: Users },
  voting: { label: "Voting", color: "bg-amber-500/20 text-amber-600", icon: Vote },
  approved: { label: "Approved", color: "bg-emerald-500/20 text-emerald-600", icon: CheckCircle },
  executed: { label: "Executed", color: "bg-blue-500/20 text-blue-600", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive/20 text-destructive", icon: AlertCircle },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground", icon: Clock },
};

const DealRoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasRole } = useUserRole();
  const isMobile = useIsMobile();
  const isGlobalAdmin = hasRole("admin");
  const [room, setRoom] = useState<DealRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [myParticipant, setMyParticipant] = useState<any>(null);
  const [participants, setParticipants] = useState<Array<{ id: string; name: string; email: string; user_id: string | null }>>([]);

  // User is admin if they have global admin role OR if they created this deal room
  const isAdmin = isGlobalAdmin || (room?.created_by === user?.id);

  useEffect(() => {
    if (id && user) {
      fetchDealRoom();
      fetchMyParticipant();
      fetchParticipants();
    }
  }, [id, user]);

  const fetchDealRoom = async () => {
    try {
      const { data, error } = await supabase
        .from("deal_rooms")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setRoom(data);
    } catch (error) {
      console.error("Error fetching deal room:", error);
      toast.error("Failed to load deal room");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyParticipant = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("deal_room_participants")
      .select("*")
      .eq("deal_room_id", id)
      .eq("user_id", user.id)
      .single();
    setMyParticipant(data);
  };

  const fetchParticipants = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("deal_room_participants")
      .select("id, name, email, user_id")
      .eq("deal_room_id", id);
    setParticipants(data || []);
  };

  const updateStatus = async (newStatus: "draft" | "active" | "voting" | "approved" | "executed" | "cancelled" | "archived") => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from("deal_rooms")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Status updated to ${statusConfig[newStatus]?.label || newStatus}`);
      fetchDealRoom();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Deal Room Not Found</h2>
          <Button onClick={() => navigate("/deal-rooms")}>Back to Deal Rooms</Button>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusConfig[room.status]?.icon || FileText;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-24">
        {/* Header */}
        <Button
          variant="ghost"
          className="mb-4 sm:mb-6 gap-2"
          onClick={() => navigate("/deal-rooms")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Deal Rooms</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{room.name}</h1>
              {room.contract_locked ? (
                <Badge className="bg-emerald-500/20 text-emerald-600 shrink-0">
                  <Lock className="w-3 h-3 mr-1" />
                  Contract Locked
                </Badge>
              ) : (
                <Badge className="bg-amber-500/20 text-amber-600 shrink-0">
                  <Unlock className="w-3 h-3 mr-1" />
                  Draft
                </Badge>
              )}
              {room.voting_enabled && (
                <Badge className="bg-primary/20 text-primary shrink-0">
                  <Vote className="w-3 h-3 mr-1" />
                  DAO Voting Active
                </Badge>
              )}
              {room.ai_analysis_enabled && (
                <Badge variant="outline" className="gap-1 shrink-0">
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden sm:inline">AI Enabled</span>
                  <span className="sm:hidden">AI</span>
                </Badge>
              )}
            </div>
            <DealRoomDescriptionEditor
              dealRoomId={room.id}
              currentDescription={room.description}
              dealName={room.name}
              isAdmin={isAdmin}
              onUpdate={fetchDealRoom}
            />
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-muted-foreground">
                Created {format(new Date(room.created_at), "MMMM d, yyyy")}
              </p>
              <DealRoomVoiceOverview 
                variant="specific" 
                dealRoom={room} 
                participants={participants} 
              />
            </div>
          </div>

          {isAdmin && !room.contract_locked && (
            <div className="flex gap-2 shrink-0">
              <Button onClick={() => setActiveTab("governance")} variant="outline" className="gap-2" size="sm">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Governance</span>
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Mobile: Dropdown Select */}
          {isMobile ? (
            <div className="mb-4">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select tab" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50 max-h-80">
                  <SelectItem value="overview">
                    <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Overview</span>
                  </SelectItem>
                  <SelectItem value="participants">
                    <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Participants</span>
                  </SelectItem>
                  <SelectItem value="ingredients">
                    <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Ingredients</span>
                  </SelectItem>
                  <SelectItem value="contributions">
                    <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Contributions</span>
                  </SelectItem>
                  <SelectItem value="credits">
                    <span className="flex items-center gap-2"><Award className="w-4 h-4" /> Credits</span>
                  </SelectItem>
                  <SelectItem value="structures">
                    <span className="flex items-center gap-2"><Vote className="w-4 h-4" /> Structures</span>
                  </SelectItem>
                  <SelectItem value="settlement">
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Settlement</span>
                  </SelectItem>
                  <SelectItem value="formulations">
                    <span className="flex items-center gap-2"><Beaker className="w-4 h-4" /> Formulations</span>
                  </SelectItem>
                  <SelectItem value="analytics">
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Analytics</span>
                  </SelectItem>
                  <SelectItem value="payouts">
                    <span className="flex items-center gap-2"><Calculator className="w-4 h-4" /> Payouts</span>
                  </SelectItem>
                  <SelectItem value="chat">
                    <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Chat</span>
                  </SelectItem>
                  <SelectItem value="messaging">
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Messaging</span>
                  </SelectItem>
                  <SelectItem value="deliverables">
                    <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Deliverables</span>
                  </SelectItem>
                  <SelectItem value="terms">
                    <span className="flex items-center gap-2"><ScrollText className="w-4 h-4" /> Terms</span>
                  </SelectItem>
                  <SelectItem value="invites">
                    <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Invites</span>
                  </SelectItem>
                  <SelectItem value="governance">
                    <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Governance</span>
                  </SelectItem>
                  <SelectItem value="escrow">
                    <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Escrow</span>
                  </SelectItem>
                  <SelectItem value="crm">
                    <span className="flex items-center gap-2"><Link className="w-4 h-4" /> CRM</span>
                  </SelectItem>
                  <SelectItem value="agents">
                    <span className="flex items-center gap-2"><Bot className="w-4 h-4" /> Agents</span>
                  </SelectItem>
                  <SelectItem value="xodiak-anchors">
                    <span className="flex items-center gap-2"><Link className="w-4 h-4" /> XODIAK Anchors</span>
                  </SelectItem>
                  <SelectItem value="financial-rails">
                    <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Financial Rails</span>
                  </SelectItem>
                  {room.ai_analysis_enabled && (
                    <SelectItem value="ai">
                      <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Analysis</span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            /* Desktop: Wrapping tabs grid */
            <div className="mb-4">
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="overview" className="gap-1.5 text-sm px-3">
                  <FileText className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="participants" className="gap-1.5 text-sm px-3">
                  <Users className="w-4 h-4" />
                  Participants
                </TabsTrigger>
                <TabsTrigger value="ingredients" className="gap-1.5 text-sm px-3">
                  <Package className="w-4 h-4" />
                  Ingredients
                </TabsTrigger>
                <TabsTrigger value="contributions" className="gap-1.5 text-sm px-3">
                  <BarChart3 className="w-4 h-4" />
                  Contributions
                </TabsTrigger>
                <TabsTrigger value="credits" className="gap-1.5 text-sm px-3">
                  <Award className="w-4 h-4" />
                  Credits
                </TabsTrigger>
                <TabsTrigger value="structures" className="gap-1.5 text-sm px-3">
                  <Vote className="w-4 h-4" />
                  Structures
                </TabsTrigger>
                <TabsTrigger value="settlement" className="gap-1.5 text-sm px-3">
                  <Zap className="w-4 h-4" />
                  Settlement
                </TabsTrigger>
                <TabsTrigger value="formulations" className="gap-1.5 text-sm px-3">
                  <Beaker className="w-4 h-4" />
                  Formulations
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-1.5 text-sm px-3">
                  <Activity className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="payouts" className="gap-1.5 text-sm px-3">
                  <Calculator className="w-4 h-4" />
                  Payouts
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-1.5 text-sm px-3 relative">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                  {/* Bouncing cloud indicator */}
                  <span className="absolute -top-3 -right-2 animate-bounce">
                    <span className="relative flex items-center">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-primary/30 animate-ping" />
                      <span className="relative inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground whitespace-nowrap">
                        Ask AI
                      </span>
                    </span>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="messaging" className="gap-1.5 text-sm px-3">
                  <Mail className="w-4 h-4" />
                  Messaging
                </TabsTrigger>
                <TabsTrigger value="deliverables" className="gap-1.5 text-sm px-3">
                  <Briefcase className="w-4 h-4" />
                  Deliverables
                </TabsTrigger>
                <TabsTrigger value="terms" className="gap-1.5 text-sm px-3">
                  <ScrollText className="w-4 h-4" />
                  Terms
                </TabsTrigger>
                <TabsTrigger value="invites" className="gap-1.5 text-sm px-3">
                  <UserPlus className="w-4 h-4" />
                  Invites
                </TabsTrigger>
                <TabsTrigger value="governance" className="gap-1.5 text-sm px-3">
                  <Lock className="w-4 h-4" />
                  Governance
                </TabsTrigger>
                <TabsTrigger value="escrow" className="gap-1.5 text-sm px-3">
                  <Shield className="w-4 h-4" />
                  Escrow
                </TabsTrigger>
                <TabsTrigger value="agents" className="gap-1.5 text-sm px-3">
                  <Bot className="w-4 h-4" />
                  Agents
                </TabsTrigger>
                <TabsTrigger value="xodiak-anchors" className="gap-1.5 text-sm px-3">
                  <Link className="w-4 h-4" />
                  XODIAK Anchors
                </TabsTrigger>
                <TabsTrigger value="financial-rails" className="gap-1.5 text-sm px-3">
                  <DollarSign className="w-4 h-4" />
                  Financial Rails
                </TabsTrigger>
                {room.ai_analysis_enabled && (
                  <TabsTrigger value="ai" className="gap-1.5 text-sm px-3">
                    <Sparkles className="w-4 h-4" />
                    AI Analysis
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
          )}

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DealRoomOverview room={room} />
              </div>
              <div>
                <BlenderKnowledgeHelper />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="participants">
            <DealRoomParticipants dealRoomId={room.id} dealRoomName={room.name} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="ingredients">
            <DealRoomIngredients dealRoomId={room.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="contributions">
            <DealRoomContributions 
              dealRoomId={room.id} 
              myParticipantId={myParticipant?.id}
              isAdmin={isAdmin}
            />
          </TabsContent>

          <TabsContent value="credits">
            <DealRoomCredits 
              dealRoomId={room.id} 
              myParticipantId={myParticipant?.id}
              isAdmin={isAdmin}
            />
          </TabsContent>

          <TabsContent value="structures">
            <DealRoomStructures 
              dealRoomId={room.id} 
              myParticipantId={myParticipant?.id}
              isAdmin={isAdmin}
              votingRule={room.voting_rule}
            />
          </TabsContent>

          <TabsContent value="settlement">
            <div className="space-y-6">
              <DealRoomSettlement dealRoomId={room.id} isAdmin={isAdmin} />
              <SettlementAdjustmentProposal dealRoomId={room.id} isAdmin={isAdmin} />
            </div>
          </TabsContent>

          <TabsContent value="formulations">
            <ChemicalBlender dealRoomId={room.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="analytics">
            <BlenderAnalytics dealRoomId={room.id} />
          </TabsContent>

          <TabsContent value="payouts">
            <PayoutCalculator dealRoomId={room.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="chat">
            <DealRoomChat dealRoomId={room.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="messaging">
            <DealRoomMessaging dealRoomId={room.id} dealRoomName={room.name} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="deliverables">
            <ParticipantDeliverablesPanel 
              dealRoomId={room.id} 
              isAdmin={isAdmin} 
              contractLocked={room.contract_locked}
            />
          </TabsContent>

          <TabsContent value="terms">
            <SmartContractTermsPanel 
              dealRoomId={room.id} 
              dealRoomName={room.name}
              isAdmin={isAdmin} 
              participants={participants}
              dealRoom={{
                id: room.id,
                name: room.name,
                description: room.description,
                category: room.category,
                status: room.status,
                expected_deal_size_min: room.expected_deal_size_min,
                expected_deal_size_max: room.expected_deal_size_max,
                time_horizon: room.time_horizon,
                voting_rule: room.voting_rule,
                created_at: room.created_at,
              }}
            />
          </TabsContent>

          <TabsContent value="invites">
            <DealRoomInviteManager dealRoomId={room.id} dealRoomName={room.name} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="governance">
            <div className="space-y-6">
              <ContractLockPanel
                dealRoomId={room.id}
                isAdmin={isAdmin}
                participants={participants}
                votingEnabled={room.voting_enabled}
                contractLocked={room.contract_locked}
                contractLockedAt={room.contract_locked_at}
                onUpdate={fetchDealRoom}
              />
              <VotingQuestionsPanel
                dealRoomId={room.id}
                isAdmin={isAdmin}
                votingEnabled={room.voting_enabled}
                participants={participants}
                myParticipantId={myParticipant?.id}
              />
              <ChangeOrderPanel
                dealRoomId={room.id}
                isAdmin={isAdmin}
                contractLocked={room.contract_locked}
              />
            </div>
          </TabsContent>

          <TabsContent value="escrow">
            <DealEscrowPanel dealRoomId={room.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="agents">
            <div className="space-y-6">
              <AgentSandboxMode dealRoomId={room.id} />
              <AgentRegistrationPanel dealRoomId={room.id} isAdmin={isAdmin} />
              <AgentAttributionManager dealRoomId={room.id} isAdmin={isAdmin} />
              <DualCRMSyncStatus dealRoomId={room.id} />
              <AgentContributionViewer dealRoomId={room.id} />
              <AgentActivityFeed dealRoomId={room.id} />
              <ViewProAgentSetupGuide dealRoomId={room.id} />
              <AgentIntegrationGuide dealRoomId={room.id} />
            </div>
          </TabsContent>

          <TabsContent value="xodiak-anchors">
            <XODIAKRelationshipView dealRoomId={room.id} limit={50} />
          </TabsContent>

          <TabsContent value="financial-rails">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EscrowDashboard dealRoomId={room.id} isAdmin={isAdmin} />
                <div className="space-y-6">
                  <RetainerManagementPanel dealRoomId={room.id} isAdmin={isAdmin} />
                  <CreditMeterPanel dealRoomId={room.id} />
                </div>
              </div>
              {isAdmin && (
                <SettlementContractBuilder 
                  dealRoomId={room.id} 
                  onCreated={() => {
                    toast.success("Contract created - view in Settlement tab");
                  }}
                />
              )}
            </div>
          </TabsContent>

          {room.ai_analysis_enabled && (
            <TabsContent value="ai">
              <DealRoomAIAnalysis dealRoomId={room.id} isAdmin={isAdmin} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default DealRoomDetail;
