import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tag, Palette, DollarSign, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WhiteLabelConfig {
  id: string;
  brand_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  custom_domain: string | null;
  custom_pricing: number | null;
  is_active: boolean;
  app_id: string;
  app_registry: {
    app_name: string;
    app_slug: string;
  };
}

interface WhiteLabelLicense {
  id: string;
  app_id: string;
  app_registry: {
    id: string;
    app_name: string;
    app_slug: string;
    white_label_price: number;
  };
}

export default function WhiteLabelPortal() {
  const { session } = useAuth();
  const [licenses, setLicenses] = useState<WhiteLabelLicense[]>([]);
  const [configs, setConfigs] = useState<WhiteLabelConfig[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<WhiteLabelLicense | null>(null);
  const [formData, setFormData] = useState({
    brandName: "",
    logoUrl: "",
    primaryColor: "#4A90E2",
    secondaryColor: "#6B7280",
    customDomain: "",
    customPricing: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchWhiteLabelLicenses();
    }
  }, [session]);

  const fetchWhiteLabelLicenses = async () => {
    try {
      const { data: licensesData, error: licensesError } = await supabase
        .from("app_licenses")
        .select(`
          id,
          app_id,
          app_registry (
            id,
            app_name,
            app_slug,
            white_label_price
          )
        `)
        .eq("user_id", session?.user?.id)
        .eq("license_type", "white_label");

      if (licensesError) throw licensesError;
      setLicenses(licensesData || []);

      const { data: configsData, error: configsError } = await supabase
        .from("white_label_configs")
        .select(`
          *,
          app_registry (
            app_name,
            app_slug
          )
        `)
        .eq("user_id", session?.user?.id);

      if (configsError) throw configsError;
      setConfigs(configsData || []);
    } catch (error: any) {
      toast.error("Failed to load white-label licenses");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedLicense || !session?.user?.id) return;

    try {
      const { error } = await supabase.from("white_label_configs").upsert({
        license_id: selectedLicense.id,
        user_id: session.user.id,
        app_id: selectedLicense.app_id,
        brand_name: formData.brandName,
        logo_url: formData.logoUrl || null,
        primary_color: formData.primaryColor,
        secondary_color: formData.secondaryColor,
        custom_domain: formData.customDomain || null,
        custom_pricing: formData.customPricing ? parseFloat(formData.customPricing) : null,
        is_active: true,
      });

      if (error) throw error;
      toast.success("White-label configuration saved!");
      fetchWhiteLabelLicenses();
      setSelectedLicense(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to save configuration");
    }
  };

  const handleEditConfig = (config: WhiteLabelConfig) => {
    setFormData({
      brandName: config.brand_name,
      logoUrl: config.logo_url || "",
      primaryColor: config.primary_color,
      secondaryColor: config.secondary_color,
      customDomain: config.custom_domain || "",
      customPricing: config.custom_pricing?.toString() || "",
    });
    const license = licenses.find(l => l.app_id === config.app_id);
    if (license) setSelectedLicense(license);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Tag className="h-8 w-8 text-primary" />
          White-Label Portal
        </h1>
        <p className="text-muted-foreground">
          Customize and manage your white-label applications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Licenses List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your White-Label Licenses</CardTitle>
              <CardDescription>Select an app to customize</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : licenses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No white-label licenses yet</p>
                  <Button size="sm" onClick={() => window.location.href = "/ecosystem/app-store"}>
                    Browse Apps
                  </Button>
                </div>
              ) : (
                licenses.map((license) => (
                  <Button
                    key={license.id}
                    variant={selectedLicense?.id === license.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedLicense(license)}
                  >
                    {license.app_registry.app_name}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Existing Configs */}
          <Card>
            <CardHeader>
              <CardTitle>Active Configurations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {configs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No configurations yet</p>
              ) : (
                configs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-2 border rounded cursor-pointer transition-all"
                    onClick={() => handleEditConfig(config)}
                  >
                    <span className="text-sm">{config.brand_name}</span>
                    <Badge variant={config.is_active ? "default" : "secondary"}>
                      {config.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-2">
          {selectedLicense ? (
            <Card>
              <CardHeader>
                <CardTitle>Customize {selectedLicense.app_registry.app_name}</CardTitle>
                <CardDescription>
                  Set your branding and pricing for this white-label app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Brand Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Palette className="h-5 w-5" />
                    Brand Identity
                  </div>
                  <div>
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      value={formData.brandName}
                      onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                      placeholder="Your Brand Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Domain & Pricing */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Globe className="h-5 w-5" />
                    Domain & Pricing
                  </div>
                  <div>
                    <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                    <Input
                      id="customDomain"
                      value={formData.customDomain}
                      onChange={(e) => setFormData(prev => ({ ...prev, customDomain: e.target.value }))}
                      placeholder="app.yourbrand.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customPricing">Your Customer Price ($/month)</Label>
                    <Input
                      id="customPricing"
                      type="number"
                      step="0.01"
                      value={formData.customPricing}
                      onChange={(e) => setFormData(prev => ({ ...prev, customPricing: e.target.value }))}
                      placeholder="29.99"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Base cost: ${selectedLicense.app_registry.white_label_price}/mo
                    </p>
                  </div>
                </div>

                <Button onClick={handleSaveConfig} className="w-full">
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-24 text-center">
                <Tag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a white-label license to customize
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
