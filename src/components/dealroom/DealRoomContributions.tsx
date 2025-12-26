import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  BarChart3, 
  Clock, 
  Cpu, 
  DollarSign, 
  Network, 
  AlertTriangle,
  Edit,
  Eye,
  EyeOff,
  Plus,
  User
} from "lucide-react";

interface Contribution {
  id: string;
  participant_id: string;
  version: number;
  is_current: boolean;
  time_hours_per_month: number | null;
  time_percentage: number | null;
  time_description: string | null;
  technical_contribution: string | null;
  technical_ip_involved: boolean;
  technical_ip_description: string | null;
  capital_amount: number | null;
  capital_resources: string | null;
  network_clients: string | null;
  network_partners: string | null;
  network_distribution: string | null;
  risk_legal: string | null;
  risk_reputational: string | null;
  risk_financial: string | null;
  expected_role: string | null;
  desired_compensations: string[];
  additional_notes: string | null;
  created_at: string;
  participant?: {
    name: string;
    email: string;
  };
}

interface DealRoomContributionsProps {
  dealRoomId: string;
  myParticipantId: string | null;
  isAdmin: boolean;
}

const roleLabels: Record<string, string> = {
  builder: "Builder",
  seller: "Seller",
  strategist: "Strategist",
  operator: "Operator",
  investor: "Investor",
  advisor: "Advisor",
};

const compensationLabels: Record<string, string> = {
  cash: "Cash",
  commission: "Commission",
  revenue_share: "Revenue Share",
  royalty: "Royalty",
  equity: "Equity",
  licensing_fee: "Licensing Fee",
};

export const DealRoomContributions = ({ 
  dealRoomId, 
  myParticipantId, 
  isAdmin 
}: DealRoomContributionsProps) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [myContribution, setMyContribution] = useState<Contribution | null>(null);

  const [formData, setFormData] = useState({
    time_hours_per_month: "",
    time_percentage: "",
    time_description: "",
    technical_contribution: "",
    technical_ip_involved: false,
    technical_ip_description: "",
    capital_amount: "",
    capital_resources: "",
    network_clients: "",
    network_partners: "",
    network_distribution: "",
    risk_legal: "",
    risk_reputational: "",
    risk_financial: "",
    expected_role: "",
    desired_compensations: [] as string[],
    additional_notes: "",
  });

  useEffect(() => {
    fetchContributions();
  }, [dealRoomId]);

  const fetchContributions = async () => {
    try {
      const { data, error } = await supabase
        .from("deal_contributions")
        .select(`
          *,
          participant:deal_room_participants(name, email)
        `)
        .eq("deal_room_id", dealRoomId)
        .eq("is_current", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      const flatData = data?.map(c => ({
        ...c,
        participant: Array.isArray(c.participant) ? c.participant[0] : c.participant
      })) || [];
      
      setContributions(flatData);
      
      if (myParticipantId) {
        const mine = flatData.find(c => c.participant_id === myParticipantId);
        if (mine) {
          setMyContribution(mine);
          populateForm(mine);
        }
      }
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (c: Contribution) => {
    setFormData({
      time_hours_per_month: c.time_hours_per_month?.toString() || "",
      time_percentage: c.time_percentage?.toString() || "",
      time_description: c.time_description || "",
      technical_contribution: c.technical_contribution || "",
      technical_ip_involved: c.technical_ip_involved,
      technical_ip_description: c.technical_ip_description || "",
      capital_amount: c.capital_amount?.toString() || "",
      capital_resources: c.capital_resources || "",
      network_clients: c.network_clients || "",
      network_partners: c.network_partners || "",
      network_distribution: c.network_distribution || "",
      risk_legal: c.risk_legal || "",
      risk_reputational: c.risk_reputational || "",
      risk_financial: c.risk_financial || "",
      expected_role: c.expected_role || "",
      desired_compensations: c.desired_compensations || [],
      additional_notes: c.additional_notes || "",
    });
  };

  const handleSubmit = async () => {
    if (!myParticipantId) {
      toast.error("You are not a participant in this deal room");
      return;
    }

    try {
      // Mark old version as not current
      if (myContribution) {
        await supabase
          .from("deal_contributions")
          .update({ is_current: false })
          .eq("id", myContribution.id);
      }

      // Insert new version
      const insertData = {
        deal_room_id: dealRoomId,
        participant_id: myParticipantId,
        version: (myContribution?.version || 0) + 1,
        time_hours_per_month: formData.time_hours_per_month ? parseFloat(formData.time_hours_per_month) : null,
        time_percentage: formData.time_percentage ? parseFloat(formData.time_percentage) : null,
        time_description: formData.time_description || null,
        technical_contribution: formData.technical_contribution || null,
        technical_ip_involved: formData.technical_ip_involved,
        technical_ip_description: formData.technical_ip_description || null,
        capital_amount: formData.capital_amount ? parseFloat(formData.capital_amount) : null,
        capital_resources: formData.capital_resources || null,
        network_clients: formData.network_clients || null,
        network_partners: formData.network_partners || null,
        network_distribution: formData.network_distribution || null,
        risk_legal: formData.risk_legal || null,
        risk_reputational: formData.risk_reputational || null,
        risk_financial: formData.risk_financial || null,
        expected_role: (formData.expected_role || null) as "builder" | "seller" | "strategist" | "operator" | "investor" | "advisor" | null,
        desired_compensations: formData.desired_compensations as ("cash" | "commission" | "revenue_share" | "royalty" | "equity" | "licensing_fee")[],
        additional_notes: formData.additional_notes || null,
      };
      
      const { error } = await supabase
        .from("deal_contributions")
        .insert(insertData);

      if (error) throw error;

      // Update participant status
      await supabase
        .from("deal_room_participants")
        .update({ has_submitted_contribution: true })
        .eq("id", myParticipantId);

      toast.success("Contribution submitted");
      setEditDialogOpen(false);
      fetchContributions();
    } catch (error) {
      console.error("Error saving contribution:", error);
      toast.error("Failed to save contribution");
    }
  };

  const toggleCompensation = (type: string) => {
    setFormData(prev => ({
      ...prev,
      desired_compensations: prev.desired_compensations.includes(type)
        ? prev.desired_compensations.filter(t => t !== type)
        : [...prev.desired_compensations, type]
    }));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {myParticipantId && (
        <Card className="p-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Your Contribution</h3>
            <p className="text-sm text-muted-foreground">
              {myContribution ? "Last updated: Version " + myContribution.version : "You haven't submitted yet"}
            </p>
          </div>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                {myContribution ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {myContribution ? "Edit" : "Submit"} Contribution
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Your Contribution</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Time Contribution */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Time Contribution</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Hours per month</Label>
                      <Input
                        type="number"
                        value={formData.time_hours_per_month}
                        onChange={(e) => setFormData({ ...formData, time_hours_per_month: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Percentage (%)</Label>
                      <Input
                        type="number"
                        value={formData.time_percentage}
                        onChange={(e) => setFormData({ ...formData, time_percentage: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.time_description}
                      onChange={(e) => setFormData({ ...formData, time_description: e.target.value })}
                      placeholder="Describe your time commitment..."
                    />
                  </div>
                </div>

                {/* Technical Contribution */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Technical Contribution</h4>
                  </div>
                  <div>
                    <Label>Technical assets (code, systems, agents, IP)</Label>
                    <Textarea
                      value={formData.technical_contribution}
                      onChange={(e) => setFormData({ ...formData, technical_contribution: e.target.value })}
                      placeholder="Describe technical assets you're contributing..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={formData.technical_ip_involved}
                      onCheckedChange={(v) => setFormData({ ...formData, technical_ip_involved: v })}
                    />
                    <Label>Pre-existing IP involved</Label>
                  </div>
                  {formData.technical_ip_involved && (
                    <div>
                      <Label>IP Description</Label>
                      <Textarea
                        value={formData.technical_ip_description}
                        onChange={(e) => setFormData({ ...formData, technical_ip_description: e.target.value })}
                        placeholder="Describe the IP and its status..."
                      />
                    </div>
                  )}
                </div>

                {/* Capital Contribution */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Capital Contribution</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Cash amount ($)</Label>
                      <Input
                        type="number"
                        value={formData.capital_amount}
                        onChange={(e) => setFormData({ ...formData, capital_amount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Resources/tooling</Label>
                      <Input
                        value={formData.capital_resources}
                        onChange={(e) => setFormData({ ...formData, capital_resources: e.target.value })}
                        placeholder="e.g., servers, software licenses"
                      />
                    </div>
                  </div>
                </div>

                {/* Network Contribution */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Network Contribution</h4>
                  </div>
                  <div>
                    <Label>Clients</Label>
                    <Input
                      value={formData.network_clients}
                      onChange={(e) => setFormData({ ...formData, network_clients: e.target.value })}
                      placeholder="Client relationships you're bringing..."
                    />
                  </div>
                  <div>
                    <Label>Partners</Label>
                    <Input
                      value={formData.network_partners}
                      onChange={(e) => setFormData({ ...formData, network_partners: e.target.value })}
                      placeholder="Strategic partners..."
                    />
                  </div>
                  <div>
                    <Label>Distribution</Label>
                    <Input
                      value={formData.network_distribution}
                      onChange={(e) => setFormData({ ...formData, network_distribution: e.target.value })}
                      placeholder="Distribution channels..."
                    />
                  </div>
                </div>

                {/* Risk Exposure */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h4 className="font-medium">Risk Exposure</h4>
                  </div>
                  <div>
                    <Label>Legal risk</Label>
                    <Input
                      value={formData.risk_legal}
                      onChange={(e) => setFormData({ ...formData, risk_legal: e.target.value })}
                      placeholder="Legal exposure you're taking on..."
                    />
                  </div>
                  <div>
                    <Label>Reputational risk</Label>
                    <Input
                      value={formData.risk_reputational}
                      onChange={(e) => setFormData({ ...formData, risk_reputational: e.target.value })}
                      placeholder="Brand/reputation at stake..."
                    />
                  </div>
                  <div>
                    <Label>Financial risk</Label>
                    <Input
                      value={formData.risk_financial}
                      onChange={(e) => setFormData({ ...formData, risk_financial: e.target.value })}
                      placeholder="Financial downside..."
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Your Role</h4>
                  </div>
                  <Select
                    value={formData.expected_role}
                    onValueChange={(v) => setFormData({ ...formData, expected_role: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Desired Compensation */}
                <div className="space-y-3">
                  <h4 className="font-medium">Desired Compensation (select all that apply)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(compensationLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.desired_compensations.includes(key)}
                          onCheckedChange={() => toggleCompensation(key)}
                        />
                        <Label className="cursor-pointer">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={formData.additional_notes}
                    onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                    placeholder="Any other context or considerations..."
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Submit Contribution
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      )}

      {/* Contributions List */}
      <div className="grid gap-4">
        {contributions.length === 0 ? (
          <Card className="p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No contributions submitted yet</p>
          </Card>
        ) : (
          contributions.map((c) => (
            <Card key={c.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{c.participant?.name || "Unknown"}</h3>
                  <p className="text-sm text-muted-foreground">Version {c.version}</p>
                </div>
                {c.expected_role && (
                  <Badge variant="secondary">{roleLabels[c.expected_role] || c.expected_role}</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {(c.time_hours_per_month || c.time_percentage) && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground">
                        {c.time_hours_per_month && `${c.time_hours_per_month}h/mo`}
                        {c.time_percentage && ` (${c.time_percentage}%)`}
                      </p>
                    </div>
                  </div>
                )}

                {c.capital_amount && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Capital</p>
                      <p className="text-muted-foreground">${c.capital_amount.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {c.technical_contribution && (
                  <div className="flex items-start gap-2">
                    <Cpu className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Technical</p>
                      <p className="text-muted-foreground line-clamp-2">{c.technical_contribution}</p>
                    </div>
                  </div>
                )}

                {(c.network_clients || c.network_partners) && (
                  <div className="flex items-start gap-2">
                    <Network className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Network</p>
                      <p className="text-muted-foreground line-clamp-2">
                        {[c.network_clients, c.network_partners].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {c.desired_compensations?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.desired_compensations.map(comp => (
                    <Badge key={comp} variant="outline">
                      {compensationLabels[comp] || comp}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
