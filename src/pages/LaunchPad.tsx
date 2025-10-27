import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Rocket, Zap, Code, Eye, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const CATEGORIES = [
  "Productivity",
  "Wellness",
  "Education",
  "Finance",
  "Social",
  "E-Commerce",
  "Entertainment",
  "Utilities",
];

export default function LaunchPad() {
  const { session } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    appName: "",
    appSlug: "",
    description: "",
    category: "",
    basePrice: "9.99",
    whiteLabelPrice: "49.99",
    tier1Commission: "20",
    tier2Commission: "5",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === "appName" && { appSlug: value.toLowerCase().replace(/\s+/g, "-") })
    }));
  };

  const handleCreateApp = async () => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to create apps");
      return;
    }

    try {
      const { error } = await supabase.from("app_registry").insert({
        created_by: session.user.id,
        app_name: formData.appName,
        app_slug: formData.appSlug,
        description: formData.description,
        category: formData.category,
        base_price: parseFloat(formData.basePrice),
        white_label_price: parseFloat(formData.whiteLabelPrice),
        affiliate_commission_tier1: parseFloat(formData.tier1Commission),
        affiliate_commission_tier2: parseFloat(formData.tier2Commission),
        is_published: false,
        metadata: { created_via: "launchpad" }
      });

      if (error) throw error;

      toast.success("App created successfully!");
      setStep(4);
    } catch (error: any) {
      toast.error(error.message || "Failed to create app");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Rocket className="h-8 w-8 text-primary" />
          LaunchPad
        </h1>
        <p className="text-muted-foreground">
          Build and launch your mini-app in the Biz Dev Ecosystem
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-20 h-1 ${step > s ? "bg-primary" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={(step / 4) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Step 1: Basic Information
            </CardTitle>
            <CardDescription>Define your app's identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                value={formData.appName}
                onChange={(e) => handleInputChange("appName", e.target.value)}
                placeholder="My Awesome App"
              />
            </div>
            <div>
              <Label htmlFor="appSlug">App Slug (URL)</Label>
              <Input
                id="appSlug"
                value={formData.appSlug}
                onChange={(e) => handleInputChange("appSlug", e.target.value)}
                placeholder="my-awesome-app"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(v) => handleInputChange("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what your app does..."
                rows={4}
              />
            </div>
            <Button onClick={() => setStep(2)} disabled={!formData.appName || !formData.category}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Pricing */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Step 2: Pricing Strategy
            </CardTitle>
            <CardDescription>Set your monetization model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Base SaaS Price ($)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange("basePrice", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="whiteLabelPrice">White-Label License ($)</Label>
                <Input
                  id="whiteLabelPrice"
                  type="number"
                  step="0.01"
                  value={formData.whiteLabelPrice}
                  onChange={(e) => handleInputChange("whiteLabelPrice", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tier1Commission">Tier 1 Commission (%)</Label>
                <Input
                  id="tier1Commission"
                  type="number"
                  step="0.01"
                  value={formData.tier1Commission}
                  onChange={(e) => handleInputChange("tier1Commission", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tier2Commission">Tier 2 Commission (%)</Label>
                <Input
                  id="tier2Commission"
                  type="number"
                  step="0.01"
                  value={formData.tier2Commission}
                  onChange={(e) => handleInputChange("tier2Commission", e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Step 3: Review & Launch
            </CardTitle>
            <CardDescription>Confirm your app configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">App Name:</span>
                <span>{formData.appName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Category:</span>
                <Badge>{formData.category}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Base Price:</span>
                <span>${formData.basePrice}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">White-Label:</span>
                <span>${formData.whiteLabelPrice}/mo</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleCreateApp}>Create App</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              App Created Successfully!
            </CardTitle>
            <CardDescription>Your app is ready to be published</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your app "{formData.appName}" has been created and is now in draft mode. 
              You can customize it further in My Apps or publish it to the App Store.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = "/ecosystem/my-apps"}>
                Go to My Apps
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/ecosystem/app-store"}>
                View App Store
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
