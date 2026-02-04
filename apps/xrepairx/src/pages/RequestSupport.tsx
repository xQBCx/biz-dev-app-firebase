import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Building2, Train, Cog, Video, Phone, FileText } from "lucide-react";
import { XRepairxLogo } from "@/components/XRepairxLogo";
import AssetAnalysis from "@/components/AssetAnalysis";

export default function RequestSupport() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{
    assetType: string;
    assetId: string;
    category: string;
    description: string;
    severity: string;
    aiAnalysis?: any;
  }>({
    assetType: "",
    assetId: "",
    category: "",
    description: "",
    severity: "normal",
  });

  const assetTypes = [
    { value: "building", label: "Building / Property", icon: Building2 },
    { value: "unit", label: "Unit / Apartment", icon: Building2 },
    { value: "railcar", label: "Railcar", icon: Train },
    { value: "equipment", label: "Equipment / Machinery", icon: Cog },
  ];

  const categories = [
    { value: "hvac", label: "HVAC / Climate Control" },
    { value: "plumbing", label: "Plumbing" },
    { value: "electrical", label: "Electrical" },
    { value: "structural", label: "Structural / Building" },
    { value: "mechanical", label: "Mechanical" },
    { value: "safety", label: "Safety Systems" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <XRepairxLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Step 1: Identify Asset */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>What needs attention?</CardTitle>
              <CardDescription>
                Select the type of asset you need help with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {assetTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setFormData({ ...formData, assetType: type.value });
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.assetType === type.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <type.icon className="h-8 w-8 mb-2 mx-auto text-primary" />
                    <span className="block text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>

              {formData.assetType && (
                <div className="pt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Asset ID or Location (optional)
                    </label>
                    <Input
                      placeholder="e.g., Building A, Unit 204, or scan QR code"
                      value={formData.assetId}
                      onChange={(e) =>
                        setFormData({ ...formData, assetId: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setStep(2)}
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Describe Problem */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Describe the issue</CardTitle>
              <CardDescription>
                Tell us what's wrong and we'll help you fix it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  What's happening?
                </label>
                <Textarea
                  placeholder="Describe the problem in detail..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Severity</label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can wait</SelectItem>
                    <SelectItem value="normal">Normal - Needs attention</SelectItem>
                    <SelectItem value="high">High - Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency - Safety risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={!formData.category || !formData.description}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Upload Media & AI Triage */}
        {step === 3 && (
          <div className="space-y-6">
            <AssetAnalysis 
              assetType={formData.assetType}
              category={formData.category}
              description={formData.description}
              onAnalysisComplete={(analysis, images) => {
                // Store analysis result and move to options
                setFormData(prev => ({ ...prev, aiAnalysis: analysis }));
                setStep(4);
              }}
            />
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => setStep(4)}>
                Skip Analysis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Options */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>What would you like to do?</CardTitle>
              <CardDescription>
                {formData.aiAnalysis 
                  ? `Based on AI analysis: ${formData.aiAnalysis.severity?.level || 'normal'} priority issue`
                  : 'Select your preferred resolution method'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                className="w-full p-4 rounded-lg border-2 border-primary bg-primary/5 text-left transition-all flex items-start gap-3"
                onClick={() => navigate("/find-technician", { state: { formData } })}
              >
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Find a Technician</h3>
                  <p className="text-sm text-muted-foreground">
                    Get remote guidance, dispatch a tech, or discover parts with AI
                  </p>
                </div>
              </button>

              <button
                className="w-full p-4 rounded-lg border-2 border-border hover:border-primary/50 text-left transition-all flex items-start gap-3"
                onClick={() => navigate("/find-technician", { state: { formData } })}
              >
                <Video className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Remote Expert Session</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with an expert via video call for guided repair
                  </p>
                </div>
              </button>

              <button
                className="w-full p-4 rounded-lg border-2 border-border hover:border-primary/50 text-left transition-all flex items-start gap-3"
                onClick={() => navigate("/find-technician", { state: { formData } })}
              >
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">AI Part Discovery</h3>
                  <p className="text-sm text-muted-foreground">
                    Identify parts and check print-on-demand availability
                  </p>
                </div>
              </button>

              <Button variant="outline" className="w-full" onClick={() => setStep(3)}>
                Back
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}