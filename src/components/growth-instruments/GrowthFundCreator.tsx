import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sprout, Plus, Loader2, GraduationCap, Apple, Wrench, Scale, Users, Video } from "lucide-react";

const INSTRUMENT_TYPES = [
  { value: "training", label: "Training & Education", icon: GraduationCap, description: "Courses, certifications, coaching" },
  { value: "nutrition", label: "Nutrition & Health", icon: Apple, description: "Diet plans, supplements, fitness" },
  { value: "equipment", label: "Equipment & Tools", icon: Wrench, description: "Hardware, software, gear" },
  { value: "legal", label: "Legal Protection", icon: Scale, description: "Contracts, IP, compliance" },
  { value: "team", label: "Team Building", icon: Users, description: "Hiring, collaboration, support" },
  { value: "production", label: "Production", icon: Video, description: "Content, marketing, distribution" },
];

export const GrowthFundCreator = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instrument_type: "training",
    target_amount: "",
    upside_share_percent: 10,
  });

  const { data: instruments, isLoading } = useQuery({
    queryKey: ["growth-instruments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("human_growth_instruments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("human_growth_instruments").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        instrument_type: formData.instrument_type,
        target_amount: parseFloat(formData.target_amount) || 0,
        upside_share_percent: formData.upside_share_percent,
        status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Growth instrument created successfully");
      queryClient.invalidateQueries({ queryKey: ["growth-instruments"] });
      setFormData({ title: "", description: "", instrument_type: "training", target_amount: "", upside_share_percent: 10 });
    },
    onError: (error) => {
      toast.error("Failed to create instrument: " + error.message);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-muted text-muted-foreground";
      case "seeking_funding": return "bg-yellow-500/10 text-yellow-600";
      case "funded": return "bg-green-500/10 text-green-600";
      case "in_progress": return "bg-blue-500/10 text-blue-600";
      case "completed": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const selectedType = INSTRUMENT_TYPES.find(t => t.value === formData.instrument_type);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Growth Fund
          </CardTitle>
          <CardDescription>
            Define inputs for your personal development with performance-backed upside
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Fund Title</Label>
            <Input
              id="title"
              placeholder="e.g., Professional Certification Program"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Investment Type</Label>
            <Select value={formData.instrument_type} onValueChange={(v) => setFormData({ ...formData, instrument_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INSTRUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <p className="text-xs text-muted-foreground">{selectedType.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this investment will fund and expected outcomes..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target Amount ($)</Label>
            <Input
              id="target"
              type="number"
              placeholder="5000"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Upside Share for Backers</Label>
              <span className="text-sm font-medium">{formData.upside_share_percent}%</span>
            </div>
            <Slider
              value={[formData.upside_share_percent]}
              onValueChange={([v]) => setFormData({ ...formData, upside_share_percent: v })}
              min={5}
              max={50}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              Percentage of performance-based returns shared with investors
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={() => createMutation.mutate()}
            disabled={!formData.title || !formData.target_amount || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
            ) : (
              <><Sprout className="h-4 w-4 mr-2" /> Create Growth Fund</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Growth Instruments</CardTitle>
          <CardDescription>
            Active and pending investment vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : instruments && instruments.length > 0 ? (
            <div className="space-y-3">
              {instruments.map((inst) => {
                const TypeIcon = INSTRUMENT_TYPES.find(t => t.value === inst.instrument_type)?.icon || Sprout;
                const progress = inst.target_amount > 0 ? (Number(inst.funded_amount) / Number(inst.target_amount)) * 100 : 0;
                return (
                  <div key={inst.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{inst.title}</span>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(inst.status)}>
                        {inst.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>${Number(inst.funded_amount).toLocaleString()} / ${Number(inst.target_amount).toLocaleString()}</span>
                      <span>{inst.upside_share_percent}% upside share</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sprout className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No growth instruments yet</p>
              <p className="text-sm">Create your first fund to start attracting investment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
