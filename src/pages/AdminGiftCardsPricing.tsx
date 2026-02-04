import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, DollarSign, Calendar } from "lucide-react";

export default function AdminGiftCardsPricing() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<any>(null);

  const { data: pricingConfig, isLoading } = useQuery({
    queryKey: ["pricing-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_pricing_config")
        .select("*")
        .eq("is_active", true)
        .single();
      
      if (error) throw error;
      setConfig(data);
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from("ai_pricing_config")
        .update(updates)
        .eq("id", config.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-config"] });
      toast.success("Pricing configuration updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update pricing");
    },
  });

  const handleSave = () => {
    updateMutation.mutate(config);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gift Cards Pricing Configuration</h1>
          <p className="text-muted-foreground">
            Manage dynamic pricing, fees, and promotional settings
          </p>
        </div>

        {/* Base Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Base Service Costs
            </CardTitle>
            <CardDescription>
              Configure payment processing and delivery costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Stripe Fee Percent (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config?.base_stripe_fee_percent || 0}
                  onChange={(e) => setConfig({ ...config, base_stripe_fee_percent: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Stripe Fixed Fee ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config?.base_stripe_fee_fixed || 0}
                  onChange={(e) => setConfig({ ...config, base_stripe_fee_fixed: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>SMS Delivery Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config?.base_sms_cost || 0}
                  onChange={(e) => setConfig({ ...config, base_sms_cost: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Print Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config?.base_print_cost || 0}
                  onChange={(e) => setConfig({ ...config, base_print_cost: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Packaging Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config?.base_packaging_cost || 0}
                  onChange={(e) => setConfig({ ...config, base_packaging_cost: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Margins */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Margins</CardTitle>
            <CardDescription>
              Set your profit margins (flat or percentage-based)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Profit Margin Percent (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={config?.profit_margin_percent || 0}
                  onChange={(e) => setConfig({ ...config, profit_margin_percent: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Profit Margin Fixed ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={config?.profit_margin_fixed || 0}
                  onChange={(e) => setConfig({ ...config, profit_margin_fixed: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Black Friday */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Black Friday Promotion
            </CardTitle>
            <CardDescription>
              Configure special promotional pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Black Friday Discount (%)</Label>
                <Input
                  type="number"
                  step="1"
                  value={config?.black_friday_discount_percent || 0}
                  onChange={(e) => setConfig({ ...config, black_friday_discount_percent: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={config?.black_friday_start || ""}
                  onChange={(e) => setConfig({ ...config, black_friday_start: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={config?.black_friday_end || ""}
                  onChange={(e) => setConfig({ ...config, black_friday_end: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={updateMutation.isPending}
            size="lg"
          >
            {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
