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
import { Award, Plus, Loader2, DollarSign, Globe, Calendar } from "lucide-react";
import { format } from "date-fns";

const BRAND_CATEGORIES = [
  { value: "personal", label: "Personal Brand" },
  { value: "product", label: "Product Line" },
  { value: "service", label: "Service Offering" },
  { value: "media", label: "Media/Content" },
];

const LICENSE_TYPES = [
  { value: "exclusive", label: "Exclusive", description: "One licensee only" },
  { value: "non-exclusive", label: "Non-Exclusive", description: "Multiple licensees allowed" },
  { value: "limited", label: "Limited", description: "Restricted use cases" },
];

export const BrandLicensingEngine = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    brand_name: "",
    brand_category: "personal",
    license_type: "exclusive",
    royalty_percent: 10,
    minimum_guarantee: "",
    territory: "worldwide",
    terms_summary: "",
  });

  const { data: licenses, isLoading } = useQuery({
    queryKey: ["brand-licenses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("creator_brand_licenses")
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
      const { error } = await supabase.from("creator_brand_licenses").insert({
        user_id: user.id,
        brand_name: formData.brand_name,
        brand_category: formData.brand_category,
        license_type: formData.license_type,
        royalty_percent: formData.royalty_percent,
        minimum_guarantee: parseFloat(formData.minimum_guarantee) || 0,
        territory: formData.territory,
        terms_summary: formData.terms_summary,
        status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Brand license created successfully");
      queryClient.invalidateQueries({ queryKey: ["brand-licenses"] });
      setFormData({
        brand_name: "",
        brand_category: "personal",
        license_type: "exclusive",
        royalty_percent: 10,
        minimum_guarantee: "",
        territory: "worldwide",
        terms_summary: "",
      });
    },
    onError: (error) => {
      toast.error("Failed to create license: " + error.message);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600";
      case "draft": return "bg-muted text-muted-foreground";
      case "paused": return "bg-yellow-500/10 text-yellow-600";
      case "expired": return "bg-red-500/10 text-red-600";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const totalEarned = licenses?.reduce((sum, l) => sum + Number(l.total_earned || 0), 0) || 0;
  const activeLicenses = licenses?.filter(l => l.status === "active").length || 0;

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
                <p className="text-sm text-muted-foreground">Total Royalties Earned</p>
                <p className="text-2xl font-bold">${totalEarned.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Licenses</p>
                <p className="text-2xl font-bold">{activeLicenses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Brands</p>
                <p className="text-2xl font-bold">{licenses?.length || 0}</p>
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
              Create Brand License
            </CardTitle>
            <CardDescription>
              License your brand for automated royalty collection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                placeholder="e.g., Your Personal Brand"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.brand_category} onValueChange={(v) => setFormData({ ...formData, brand_category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BRAND_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>License Type</Label>
                <Select value={formData.license_type} onValueChange={(v) => setFormData({ ...formData, license_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LICENSE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Royalty Rate</Label>
                <span className="text-sm font-medium">{formData.royalty_percent}%</span>
              </div>
              <Slider
                value={[formData.royalty_percent]}
                onValueChange={([v]) => setFormData({ ...formData, royalty_percent: v })}
                min={1}
                max={50}
                step={1}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-guarantee">Min Guarantee ($)</Label>
                <Input
                  id="min-guarantee"
                  type="number"
                  placeholder="0"
                  value={formData.minimum_guarantee}
                  onChange={(e) => setFormData({ ...formData, minimum_guarantee: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="territory">Territory</Label>
                <Input
                  id="territory"
                  placeholder="worldwide"
                  value={formData.territory}
                  onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms Summary</Label>
              <Textarea
                id="terms"
                placeholder="Brief description of licensing terms..."
                value={formData.terms_summary}
                onChange={(e) => setFormData({ ...formData, terms_summary: e.target.value })}
                rows={2}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => createMutation.mutate()}
              disabled={!formData.brand_name || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                <><Award className="h-4 w-4 mr-2" /> Create License</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Brand Licenses</CardTitle>
            <CardDescription>Manage your licensing portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : licenses && licenses.length > 0 ? (
              <div className="space-y-3">
                {licenses.map((license) => (
                  <div key={license.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{license.brand_name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {license.brand_category} • {license.license_type}
                        </p>
                      </div>
                      <Badge variant="secondary" className={getStatusColor(license.status)}>
                        {license.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {license.territory}
                      </span>
                      <span>{license.royalty_percent}% royalty</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(license.start_date), "MMM d, yyyy")}
                      </span>
                      <span className="font-medium text-green-600">
                        ${Number(license.total_earned || 0).toLocaleString()} earned
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No brand licenses yet</p>
                <p className="text-sm">Create your first license to start earning royalties</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
