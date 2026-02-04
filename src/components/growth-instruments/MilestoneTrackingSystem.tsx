import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, Plus, Loader2, CheckCircle2, Clock, Shield, Link2 } from "lucide-react";
import { format } from "date-fns";

const VERIFICATION_METHODS = [
  { value: "self", label: "Self-Verification", icon: CheckCircle2 },
  { value: "peer", label: "Peer Verification", icon: Link2 },
  { value: "system", label: "System Verification", icon: Shield },
  { value: "xodiak", label: "XODIAK Anchored", icon: Shield },
];

export const MilestoneTrackingSystem = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedInstrument, setSelectedInstrument] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_date: "",
    release_percent: "25",
    verification_method: "self",
  });

  const { data: instruments } = useQuery({
    queryKey: ["growth-instruments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("human_growth_instruments")
        .select("id, title, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: milestones, isLoading } = useQuery({
    queryKey: ["milestones", selectedInstrument],
    queryFn: async () => {
      if (!selectedInstrument) return [];
      const { data, error } = await supabase
        .from("growth_instrument_milestones")
        .select("*")
        .eq("instrument_id", selectedInstrument)
        .order("target_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedInstrument,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedInstrument) throw new Error("No instrument selected");
      const { error } = await supabase.from("growth_instrument_milestones").insert({
        instrument_id: selectedInstrument,
        title: formData.title,
        description: formData.description,
        target_date: formData.target_date || null,
        release_percent: parseFloat(formData.release_percent) || 0,
        verification_method: formData.verification_method,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Milestone created successfully");
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
      setFormData({ title: "", description: "", target_date: "", release_percent: "25", verification_method: "self" });
    },
    onError: (error) => {
      toast.error("Failed to create milestone: " + error.message);
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase
        .from("growth_instrument_milestones")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", milestoneId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Milestone marked as completed");
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
    onError: (error) => {
      toast.error("Failed to complete milestone: " + error.message);
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Milestone
          </CardTitle>
          <CardDescription>
            Define progress checkpoints with fund release triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Instrument</Label>
            <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a growth instrument" />
              </SelectTrigger>
              <SelectContent>
                {instruments?.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {inst.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone-title">Milestone Title</Label>
            <Input
              id="milestone-title"
              placeholder="e.g., Complete Module 1 Certification"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone-desc">Description</Label>
            <Textarea
              id="milestone-desc"
              placeholder="Describe what completing this milestone entails..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-date">Target Date</Label>
              <Input
                id="target-date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="release">Fund Release %</Label>
              <Input
                id="release"
                type="number"
                value={formData.release_percent}
                onChange={(e) => setFormData({ ...formData, release_percent: e.target.value })}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Verification Method</Label>
            <Select value={formData.verification_method} onValueChange={(v) => setFormData({ ...formData, verification_method: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERIFICATION_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      <method.icon className="h-4 w-4" />
                      {method.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            onClick={() => createMutation.mutate()}
            disabled={!selectedInstrument || !formData.title || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><Target className="h-4 w-4 mr-2" /> Add Milestone</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Milestone Progress</CardTitle>
          <CardDescription>
            {selectedInstrument
              ? `Tracking milestones for ${instruments?.find(i => i.id === selectedInstrument)?.title}`
              : "Select an instrument to view milestones"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedInstrument ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select an instrument to view milestones</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : milestones && milestones.length > 0 ? (
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(milestone.status)}
                      <span className="font-medium text-sm">{milestone.title}</span>
                    </div>
                    <Badge variant="secondary" className={
                      milestone.status === "completed" || milestone.status === "verified"
                        ? "bg-green-500/10 text-green-600"
                        : milestone.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-muted"
                    }>
                      {milestone.status}
                    </Badge>
                  </div>
                  {milestone.description && (
                    <p className="text-xs text-muted-foreground">{milestone.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {milestone.target_date
                        ? `Due: ${format(new Date(milestone.target_date), "MMM d, yyyy")}`
                        : "No due date"}
                    </span>
                    <span>{milestone.release_percent}% release</span>
                  </div>
                  {milestone.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => completeMutation.mutate(milestone.id)}
                      disabled={completeMutation.isPending}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Complete
                    </Button>
                  )}
                  {milestone.xodiak_anchor_hash && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Shield className="h-3 w-3" />
                      XODIAK Anchored
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No milestones yet</p>
              <p className="text-sm">Add milestones to track progress and trigger fund releases</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
