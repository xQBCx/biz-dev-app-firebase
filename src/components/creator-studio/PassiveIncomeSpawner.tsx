import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Loader2, BookOpen, Package, Monitor, Users, Link2, DollarSign } from "lucide-react";

const BUSINESS_TYPES = [
  { value: "course", label: "Online Course", icon: BookOpen },
  { value: "ebook", label: "Digital Product", icon: BookOpen },
  { value: "merchandise", label: "Merchandise", icon: Package },
  { value: "saas", label: "SaaS Tool", icon: Monitor },
  { value: "subscription", label: "Subscription", icon: Users },
  { value: "affiliate", label: "Affiliate Network", icon: Link2 },
];

const STATUS_STAGES = ["idea", "planning", "building", "launched", "scaling"];

export const PassiveIncomeSpawner = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "course",
    description: "",
    setup_cost: "",
  });

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["passive-businesses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("creator_passive_businesses")
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
      const { error } = await supabase.from("creator_passive_businesses").insert({
        user_id: user.id,
        business_name: formData.business_name,
        business_type: formData.business_type,
        description: formData.description,
        setup_cost: parseFloat(formData.setup_cost) || 0,
        status: "idea",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Passive business idea added!");
      queryClient.invalidateQueries({ queryKey: ["passive-businesses"] });
      setFormData({ business_name: "", business_type: "course", description: "", setup_cost: "" });
    },
    onError: (error) => {
      toast.error("Failed to create business: " + error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === "launched") {
        updates.launch_date = new Date().toISOString();
      }
      const { error } = await supabase
        .from("creator_passive_businesses")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated!");
      queryClient.invalidateQueries({ queryKey: ["passive-businesses"] });
    },
  });

  const getStatusIndex = (status: string) => STATUS_STAGES.indexOf(status);
  const getStatusProgress = (status: string) => ((getStatusIndex(status) + 1) / STATUS_STAGES.length) * 100;

  const totalMonthlyRevenue = businesses?.reduce((sum, b) => sum + Number(b.monthly_revenue || 0), 0) || 0;
  const totalMonthlyExpenses = businesses?.reduce((sum, b) => sum + Number(b.monthly_expenses || 0), 0) || 0;
  const launchedCount = businesses?.filter(b => b.status === "launched" || b.status === "scaling").length || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">${totalMonthlyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Launched Businesses</p>
                <p className="text-2xl font-bold">{launchedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Monthly Profit</p>
                <p className={`text-2xl font-bold ${totalMonthlyRevenue - totalMonthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(totalMonthlyRevenue - totalMonthlyExpenses).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Spawn Passive Business
            </CardTitle>
            <CardDescription>
              Launch off-camera income streams that work while you create
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="biz-name">Business Name</Label>
              <Input
                id="biz-name"
                placeholder="e.g., Creator Masterclass"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select value={formData.business_type} onValueChange={(v) => setFormData({ ...formData, business_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="biz-desc">Description</Label>
              <Textarea
                id="biz-desc"
                placeholder="What will this business offer?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="setup-cost">Estimated Setup Cost ($)</Label>
              <Input
                id="setup-cost"
                type="number"
                placeholder="500"
                value={formData.setup_cost}
                onChange={(e) => setFormData({ ...formData, setup_cost: e.target.value })}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => createMutation.mutate()}
              disabled={!formData.business_name || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                <><Zap className="h-4 w-4 mr-2" /> Spawn Business</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Passive Businesses</CardTitle>
            <CardDescription>Track progress from idea to scaling</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : businesses && businesses.length > 0 ? (
              <div className="space-y-4">
                {businesses.map((biz) => {
                  const TypeIcon = BUSINESS_TYPES.find(t => t.value === biz.business_type)?.icon || Zap;
                  const currentIndex = getStatusIndex(biz.status);
                  const nextStatus = STATUS_STAGES[currentIndex + 1];
                  
                  return (
                    <div key={biz.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium text-sm">{biz.business_name}</h4>
                            <p className="text-xs text-muted-foreground capitalize">{biz.business_type}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className={
                          biz.status === "scaling" ? "bg-green-500/10 text-green-600" :
                          biz.status === "launched" ? "bg-blue-500/10 text-blue-600" :
                          "bg-muted"
                        }>
                          {biz.status}
                        </Badge>
                      </div>
                      
                      <Progress value={getStatusProgress(biz.status)} className="h-2" />
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Setup: ${Number(biz.setup_cost || 0).toLocaleString()}</span>
                        {biz.monthly_revenue > 0 && (
                          <span className="text-green-600">${Number(biz.monthly_revenue).toLocaleString()}/mo</span>
                        )}
                      </div>

                      {nextStatus && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => updateStatusMutation.mutate({ id: biz.id, status: nextStatus })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Move to {nextStatus}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No passive businesses yet</p>
                <p className="text-sm">Spawn your first off-camera income stream</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
