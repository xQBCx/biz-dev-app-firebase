import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Zap
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
import { CRMIntegrationPanel } from "@/components/dealroom/CRMIntegrationPanel";
import { PayoutCalculator } from "@/components/dealroom/PayoutCalculator";
import { DealEscrowPanel } from "@/components/deal-room/DealEscrowPanel";
import { DealRoomInviteManager } from "@/components/deal-room/DealRoomInviteManager";
import { DealRoomMessaging } from "@/components/deal-room/DealRoomMessaging";
import { DealRoomChat } from "@/components/deal-room/DealRoomChat";
import { DealRoomDescriptionEditor } from "@/components/dealroom/DealRoomDescriptionEditor";
import { SettlementAdjustmentProposal } from "@/components/dealroom/SettlementAdjustmentProposal";
import { ParticipantDeliverablesPanel } from "@/components/dealroom/ParticipantDeliverablesPanel";
import { SmartContractTermsPanel } from "@/components/dealroom/SmartContractTermsPanel";
import { Beaker, Activity, Link, Calculator, MessageSquare, Mail, Shield, UserPlus, Briefcase, ScrollText } from "lucide-react";

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
  const isAdmin = hasRole("admin");
  const [room, setRoom] = useState<DealRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [myParticipant, setMyParticipant] = useState<any>(null);
  const [participants, setParticipants] = useState<Array<{ id: string; name: string; email: string; user_id: string | null }>>([]);

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
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate("/deal-rooms")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deal Rooms
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{room.name}</h1>
              <Badge className={statusConfig[room.status]?.color || ""}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig[room.status]?.label || room.status}
              </Badge>
              {room.ai_analysis_enabled && (
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Enabled
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
            <p className="text-sm text-muted-foreground mt-2">
              Created {format(new Date(room.created_at), "MMMM d, yyyy")}
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              {room.status === "draft" && (
                <Button onClick={() => updateStatus("active")} className="gap-2">
                  <Send className="w-4 h-4" />
                  Activate Room
                </Button>
              )}
              {room.status === "active" && (
                <Button onClick={() => updateStatus("voting")} variant="secondary" className="gap-2">
                  <Vote className="w-4 h-4" />
                  Start Voting
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="participants" className="gap-2">
              <Users className="w-4 h-4" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="ingredients" className="gap-2">
              <Package className="w-4 h-4" />
              Ingredients
            </TabsTrigger>
            <TabsTrigger value="contributions" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Contributions
            </TabsTrigger>
            <TabsTrigger value="credits" className="gap-2">
              <Award className="w-4 h-4" />
              Credits
            </TabsTrigger>
            <TabsTrigger value="structures" className="gap-2">
              <Vote className="w-4 h-4" />
              Structures
            </TabsTrigger>
            <TabsTrigger value="settlement" className="gap-2">
              <Zap className="w-4 h-4" />
              Settlement
            </TabsTrigger>
            <TabsTrigger value="formulations" className="gap-2">
              <Beaker className="w-4 h-4" />
              Formulations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Activity className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="payouts" className="gap-2">
              <Calculator className="w-4 h-4" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="messaging" className="gap-2">
              <Mail className="w-4 h-4" />
              Messaging
            </TabsTrigger>
            <TabsTrigger value="deliverables" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Deliverables
            </TabsTrigger>
            <TabsTrigger value="terms" className="gap-2">
              <ScrollText className="w-4 h-4" />
              Terms
            </TabsTrigger>
            <TabsTrigger value="invites" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Invites
            </TabsTrigger>
            <TabsTrigger value="escrow" className="gap-2">
              <Shield className="w-4 h-4" />
              Escrow
            </TabsTrigger>
            <TabsTrigger value="crm" className="gap-2">
              <Link className="w-4 h-4" />
              CRM
            </TabsTrigger>
            {room.ai_analysis_enabled && (
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI Analysis
              </TabsTrigger>
            )}
          </TabsList>

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
            <DealRoomParticipants dealRoomId={room.id} isAdmin={isAdmin} />
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
            <ParticipantDeliverablesPanel dealRoomId={room.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="terms">
            <SmartContractTermsPanel dealRoomId={room.id} isAdmin={isAdmin} participants={participants} />
          </TabsContent>

          <TabsContent value="invites">
            <DealRoomInviteManager dealRoomId={room.id} dealRoomName={room.name} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="escrow">
            <DealEscrowPanel dealRoomId={room.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="crm">
            <CRMIntegrationPanel dealRoomId={room.id} isAdmin={isAdmin} />
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
