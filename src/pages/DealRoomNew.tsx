import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Handshake, ArrowLeft, Plus, X, Sparkles, Users, ChevronRight, ChevronLeft, Rocket } from "lucide-react";
import { dealRoomTemplates, DealRoomTemplateCard, DealRoomTemplate } from "@/components/dealroom/DealRoomTemplates";

interface Participant {
  name: string;
  email: string;
  is_company: boolean;
}

interface Initiative {
  id: string;
  name: string;
  description: string | null;
}

const DealRoomNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initiativeId = searchParams.get('initiative');
  
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"template" | "details">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<DealRoomTemplate | null>(null);
  const [linkedInitiative, setLinkedInitiative] = useState<Initiative | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "sales" as string,
    expected_deal_size_min: "",
    expected_deal_size_max: "",
    time_horizon: "one_time" as string,
    voting_rule: "unanimous" as string,
    ai_analysis_enabled: false,
    initiative_id: initiativeId || "",
  });

  const [participants, setParticipants] = useState<Participant[]>([
    { name: "", email: "", is_company: false }
  ]);
  
  // Load initiative if linked
  useEffect(() => {
    if (initiativeId && user) {
      loadLinkedInitiative();
    }
  }, [initiativeId, user]);
  
  const loadLinkedInitiative = async () => {
    if (!initiativeId) return;
    const { data } = await supabase
      .from("initiatives")
      .select("id, name, description")
      .eq("id", initiativeId)
      .single();
    if (data) {
      setLinkedInitiative(data);
      setFormData(prev => ({
        ...prev,
        name: `Deal Room: ${data.name}`,
        description: data.description || "",
        initiative_id: data.id
      }));
    }
  };

  const handleTemplateSelect = (template: DealRoomTemplate) => {
    setSelectedTemplate(template);
    // Auto-fill category from template
    if (template.category !== "other") {
      setFormData(prev => ({ ...prev, category: template.category }));
    }
  };

  const proceedToDetails = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      toast.error("Please enter a deal room name");
      return;
    }

    const validParticipants = participants.filter(p => p.name && p.email);
    if (validParticipants.length === 0) {
      toast.error("Please add at least one participant");
      return;
    }

    setLoading(true);

    try {
      // Create the deal room
      const { data: room, error: roomError } = await supabase
        .from("deal_rooms")
        .insert({
          category: formData.category as "sales" | "platform_build" | "joint_venture" | "licensing" | "services" | "infrastructure" | "ip_creation",
          expected_deal_size_min: formData.expected_deal_size_min ? parseFloat(formData.expected_deal_size_min) : null,
          expected_deal_size_max: formData.expected_deal_size_max ? parseFloat(formData.expected_deal_size_max) : null,
          time_horizon: formData.time_horizon as "one_time" | "recurring" | "perpetual",
          voting_rule: formData.voting_rule as "unanimous" | "majority" | "weighted" | "founder_override",
          ai_analysis_enabled: formData.ai_analysis_enabled,
          name: formData.name,
          description: formData.description || null,
          created_by: user.id,
          initiative_id: formData.initiative_id || null,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add participants
      const participantInserts = validParticipants.map(p => ({
        deal_room_id: room.id,
        name: p.name,
        email: p.email,
        is_company: p.is_company,
      }));

      const { error: participantError } = await supabase
        .from("deal_room_participants")
        .insert(participantInserts);

      if (participantError) throw participantError;

      toast.success("Deal room created successfully");
      
      // Navigate back to initiative if linked
      if (linkedInitiative) {
        navigate(`/initiatives/${linkedInitiative.id}`);
      } else {
        navigate(`/deal-rooms/${room.id}`);
      }
    } catch (error) {
      console.error("Error creating deal room:", error);
      toast.error("Failed to create deal room");
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: "", email: "", is_company: false }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string | boolean) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => linkedInitiative ? navigate(`/initiatives/${linkedInitiative.id}`) : (step === "template" ? navigate("/deal-rooms") : setStep("template"))}
        >
          <ArrowLeft className="w-4 h-4" />
          {linkedInitiative ? `Back to ${linkedInitiative.name}` : (step === "template" ? "Back to Deal Rooms" : "Back to Templates")}
        </Button>

        {/* Initiative Context Banner */}
        {linkedInitiative && (
          <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Creating deal room for: {linkedInitiative.name}</p>
                {linkedInitiative.description && (
                  <p className="text-sm text-muted-foreground">{linkedInitiative.description}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        <div className="flex items-center gap-3 mb-8">
          <Handshake className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Create Deal Room</h1>
            <p className="text-muted-foreground">
              {step === "template" 
                ? "Select a template to get started quickly"
                : "Configure your deal room details"}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          <Badge 
            variant={step === "template" ? "default" : "secondary"}
            className="gap-1"
          >
            1. Choose Template
          </Badge>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Badge 
            variant={step === "details" ? "default" : "secondary"}
            className="gap-1"
          >
            2. Configure Details
          </Badge>
        </div>

        {step === "template" ? (
          /* Template Selection Step */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dealRoomTemplates.map((template) => (
                <DealRoomTemplateCard
                  key={template.id}
                  template={template}
                  selected={selectedTemplate?.id === template.id}
                  onSelect={() => handleTemplateSelect(template)}
                />
              ))}
            </div>

            {selectedTemplate && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Selected: {selectedTemplate.name}</p>
                    {selectedTemplate.suggestedParticipantRoles.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Suggested roles: {selectedTemplate.suggestedParticipantRoles.join(", ")}
                      </p>
                    )}
                  </div>
                  <Button onClick={proceedToDetails} className="gap-2">
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* Details Configuration Step */
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Deal Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Deal Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Platform Partnership with Acme Corp"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the nature and goals of this deal..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="platform_build">Platform Build</SelectItem>
                      <SelectItem value="joint_venture">Joint Venture</SelectItem>
                      <SelectItem value="licensing">Licensing</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="ip_creation">IP Creation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Time Horizon</Label>
                  <Select
                    value={formData.time_horizon}
                    onValueChange={(v) => setFormData({ ...formData, time_horizon: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-time</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                      <SelectItem value="perpetual">Perpetual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="size_min">Deal Size Min ($)</Label>
                  <Input
                    id="size_min"
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.expected_deal_size_min}
                    onChange={(e) => setFormData({ ...formData, expected_deal_size_min: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="size_max">Deal Size Max ($)</Label>
                  <Input
                    id="size_max"
                    type="number"
                    placeholder="e.g., 100000"
                    value={formData.expected_deal_size_max}
                    onChange={(e) => setFormData({ ...formData, expected_deal_size_max: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Participants */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Participants</h2>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-4">
              {participants.map((participant, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="Name or company name"
                        value={participant.name}
                        onChange={(e) => updateParticipant(index, "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={participant.email}
                        onChange={(e) => updateParticipant(index, "email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 pt-5">
                    <Switch
                      checked={participant.is_company}
                      onCheckedChange={(v) => updateParticipant(index, "is_company", v)}
                    />
                    <span className="text-xs text-muted-foreground">Company</span>
                  </div>
                  {participants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-5"
                      onClick={() => removeParticipant(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Governance Settings</h2>
            <div className="space-y-4">
              <div>
                <Label>Voting Rule</Label>
                <Select
                  value={formData.voting_rule}
                  onValueChange={(v) => setFormData({ ...formData, voting_rule: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unanimous">Unanimous (all must agree)</SelectItem>
                    <SelectItem value="majority">Majority</SelectItem>
                    <SelectItem value="weighted">Weighted (by contribution)</SelectItem>
                    <SelectItem value="founder_override">Founder Override</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">AI Analysis</p>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered contribution mapping, fairness scoring, and deal structure generation
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.ai_analysis_enabled}
                  onCheckedChange={(v) => setFormData({ ...formData, ai_analysis_enabled: v })}
                />
              </div>
            </div>
          </Card>

            {/* Actions */}
            <div className="flex justify-between gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("template")} className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Templates
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => navigate("/deal-rooms")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Deal Room"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DealRoomNew;
