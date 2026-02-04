import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function MarketplaceCreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    listing_type: "product",
    category: "",
    target_market: "",
    price_range: "",
    commission_type: "percentage",
    commission_value: "",
    expected_volume: "",
    marketing_materials_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a listing");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("marketplace_listings").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        listing_type: formData.listing_type as "product" | "service",
        category: formData.category,
        target_market: formData.target_market,
        price_range: formData.price_range,
        commission_type: formData.commission_type as "percentage" | "flat_fee" | "tiered",
        commission_value: parseFloat(formData.commission_value),
        expected_volume: formData.expected_volume ? parseInt(formData.expected_volume) : null,
        marketing_materials_url: formData.marketing_materials_url || null,
        status: "active",
      });

      if (error) throw error;

      toast.success("Listing created successfully!");
      navigate("/marketplace/listings");
    } catch (error: any) {
      toast.error(error.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/marketplace/listings")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Create Product/Service Listing</CardTitle>
            <CardDescription>
              List your product or service to connect with proven marketers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Revolutionary SaaS Platform"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product/service and what makes it special"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="listing_type">Type *</Label>
                  <Select
                    value={formData.listing_type}
                    onValueChange={(value) => setFormData({ ...formData, listing_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., SaaS, E-commerce, Consulting"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_market">Target Market</Label>
                  <Input
                    id="target_market"
                    value={formData.target_market}
                    onChange={(e) => setFormData({ ...formData, target_market: e.target.value })}
                    placeholder="e.g., Small businesses, Enterprise"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_range">Price Range</Label>
                  <Input
                    id="price_range"
                    value={formData.price_range}
                    onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                    placeholder="e.g., $99-$499/month"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission_type">Commission Type *</Label>
                  <Select
                    value={formData.commission_type}
                    onValueChange={(value) => setFormData({ ...formData, commission_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="flat_fee">Flat Fee</SelectItem>
                      <SelectItem value="tiered">Tiered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission_value">
                    Commission Value * {formData.commission_type === "percentage" ? "(%)" : "($)"}
                  </Label>
                  <Input
                    id="commission_value"
                    type="number"
                    step="0.01"
                    value={formData.commission_value}
                    onChange={(e) => setFormData({ ...formData, commission_value: e.target.value })}
                    placeholder={formData.commission_type === "percentage" ? "e.g., 20" : "e.g., 500"}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_volume">Expected Monthly Volume</Label>
                <Input
                  id="expected_volume"
                  type="number"
                  value={formData.expected_volume}
                  onChange={(e) => setFormData({ ...formData, expected_volume: e.target.value })}
                  placeholder="e.g., 100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketing_materials_url">Marketing Materials URL</Label>
                <Input
                  id="marketing_materials_url"
                  type="url"
                  value={formData.marketing_materials_url}
                  onChange={(e) => setFormData({ ...formData, marketing_materials_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Listing"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/marketplace/listings")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
