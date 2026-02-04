import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

const PortfolioCompanyNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    logo_url: "",
    primary_color: "#4A90E2",
    company_type: "owned",
    email_domains: "",
    commission_rate: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("portfolio_companies")
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          website: formData.website || null,
          logo_url: formData.logo_url || null,
          primary_color: formData.primary_color,
          company_type: formData.company_type,
          email_domains: formData.email_domains
            ? formData.email_domains.split(",").map(d => d.trim())
            : [],
          commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : null
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success("Company added successfully");
      navigate(`/portfolio/companies/${data.id}`);
    } catch (error: any) {
      console.error("Error creating company:", error);
      toast.error(error.message || "Failed to create company");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Add Portfolio Company</h1>
            <p className="text-muted-foreground">Add a company to your portfolio</p>
          </div>
        </div>

        <Card className="p-8 shadow-elevated border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Sinelabs, Sandler Partners"
              />
            </div>

            <div>
              <Label htmlFor="company_type">Company Type *</Label>
              <Select
                value={formData.company_type}
                onValueChange={(value) => setFormData({ ...formData, company_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owned">Owned - I own this company</SelectItem>
                  <SelectItem value="affiliate">Affiliate - I earn commissions</SelectItem>
                  <SelectItem value="strategic_advisor">Strategic Advisor - Advisory role</SelectItem>
                  <SelectItem value="partner">Partner - Partnership agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="What does this company do?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    placeholder="#4A90E2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                <Input
                  id="commission_rate"
                  type="number"
                  step="0.01"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                  placeholder="e.g., 10.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email_domains">Email Domains (comma-separated)</Label>
              <Input
                id="email_domains"
                value={formData.email_domains}
                onChange={(e) => setFormData({ ...formData, email_domains: e.target.value })}
                placeholder="e.g., sinelabs.net, bdsrvs.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Domains you use to send emails for this company
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/portfolio")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Company"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioCompanyNew;