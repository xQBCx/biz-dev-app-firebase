import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  CheckCircle, 
  Info,
  Sparkles,
  DollarSign,
  Shield,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

type EntityType = "llc" | "s-corp" | "c-corp" | "sole-prop" | null;
type SetupStep = "selection" | "details" | "taxes" | "review" | "processing";

const formSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters").max(100),
  state: z.string().trim().min(2, "State is required").max(50),
  industry: z.string().trim().max(100).optional(),
  revenue: z.string().trim().optional()
});

const entityInfo = {
  llc: {
    name: "Limited Liability Company (LLC)",
    icon: Shield,
    benefits: [
      "Personal liability protection",
      "Pass-through taxation",
      "Flexible management structure",
      "Lower compliance requirements"
    ],
    bestFor: "Small to medium businesses, solo entrepreneurs, real estate",
    taxRate: "Pass-through (personal rate)",
    setup: "$50-500 state fee"
  },
  "s-corp": {
    name: "S Corporation",
    icon: Users,
    benefits: [
      "Pass-through taxation",
      "Self-employment tax savings",
      "Employee benefits",
      "Credibility with investors"
    ],
    bestFor: "Growing businesses with employees, service-based companies",
    taxRate: "Pass-through + payroll tax",
    setup: "$100-800 state fee"
  },
  "c-corp": {
    name: "C Corporation",
    icon: Building2,
    benefits: [
      "Unlimited growth potential",
      "Easier to raise capital",
      "Tax deductible benefits",
      "Perpetual existence"
    ],
    bestFor: "High-growth startups, companies seeking VC funding",
    taxRate: "21% corporate + dividend tax",
    setup: "$100-800 state fee"
  },
  "sole-prop": {
    name: "Sole Proprietorship",
    icon: DollarSign,
    benefits: [
      "Easiest to start",
      "Complete control",
      "Minimal paperwork",
      "Low startup costs"
    ],
    bestFor: "Freelancers, consultants, testing business ideas",
    taxRate: "Pass-through (personal rate)",
    setup: "$0-100 DBA filing"
  }
};

const CreateEntity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<SetupStep>("selection");
  const [selectedEntity, setSelectedEntity] = useState<EntityType>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    state: "",
    industry: "",
    revenue: "",
    employees: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEntitySelect = (type: EntityType) => {
    setSelectedEntity(type);
  };

  const handleNext = () => {
    setErrors({});
    
    // Validate on details step
    if (step === "details") {
      try {
        formSchema.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: Record<string, string> = {};
          error.errors.forEach((err) => {
            if (err.path[0]) {
              newErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(newErrors);
          toast.error("Please fix the form errors");
          return;
        }
      }
    }
    
    const steps: SetupStep[] = ["selection", "details", "taxes", "review", "processing"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: SetupStep[] = ["selection", "details", "taxes", "review", "processing"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async () => {
    if (!user || !selectedEntity) return;
    
    setStep("processing");
    setIsSubmitting(true);
    
    try {
      // Map frontend entity types to database enum values
      const entityTypeMap: Record<string, string> = {
        'llc': 'LLC',
        's-corp': 'S-Corp',
        'c-corp': 'C-Corp',
        'sole-prop': 'Sole Proprietorship'
      };

      const businessData = {
        user_id: user.id,
        name: formData.businessName,
        entity_type: entityTypeMap[selectedEntity],
        state: formData.state,
        industry: formData.industry || null,
        revenue: formData.revenue ? parseFloat(formData.revenue.replace(/[$,]/g, "")) : null,
        status: "active"
      };

      const { data, error } = await supabase
        .from("businesses")
        .insert(businessData as any)
        .select()
        .single();

      if (error) throw error;

      toast.success("Entity creation initiated!");
      setTimeout(() => {
        navigate("/dashboard");
        toast.success("Your business entity has been created!");
      }, 2000);
    } catch (error) {
      console.error("Error creating business:", error);
      toast.error("Failed to create business entity");
      setStep("review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto max-w-6xl py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">Create Your Business Entity</h1>
          <p className="text-muted-foreground">AI-guided setup with tax optimization</p>
        </div>

        {/* Progress */}
        <div className="flex justify-between mb-8 max-w-3xl mx-auto">
          {["Select", "Details", "Tax Setup", "Review", "Complete"].map((label, idx) => (
            <div key={label} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                idx <= ["selection", "details", "taxes", "review", "processing"].indexOf(step)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted text-muted-foreground"
              }`}>
                {idx + 1}
              </div>
              {idx < 4 && (
                <div className={`flex-1 h-1 mx-2 ${
                  idx < ["selection", "details", "taxes", "review", "processing"].indexOf(step)
                    ? "bg-primary"
                    : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <Card className="bg-card shadow-elevated border border-border p-8">
          {step === "selection" && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-lg p-4">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">AI Recommendation</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your profile, we recommend starting with an LLC for liability protection and tax flexibility.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {(Object.keys(entityInfo) as EntityType[]).filter(Boolean).map((type) => {
                  const info = entityInfo[type!];
                  const Icon = info.icon;
                  
                  return (
                    <Card
                      key={type}
                      className={`p-6 cursor-pointer transition-all hover:shadow-glow border-2 ${
                        selectedEntity === type ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => handleEntitySelect(type)}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{info.name}</h3>
                          <p className="text-sm text-muted-foreground">{info.bestFor}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {info.benefits.slice(0, 3).map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                        <span>{info.setup}</span>
                        <span>{info.taxRate}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {step === "details" && selectedEntity && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Business Details</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Your Business LLC"
                    className={errors.businessName ? "border-destructive" : ""}
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive mt-1">{errors.businessName}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="state">State of Formation *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Delaware"
                    className={errors.state ? "border-destructive" : ""}
                  />
                  {errors.state && (
                    <p className="text-sm text-destructive mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="Technology"
                  />
                </div>

                <div>
                  <Label htmlFor="revenue">Expected Annual Revenue</Label>
                  <Input
                    id="revenue"
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                    placeholder="$100,000"
                  />
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Why we need this</h4>
                    <p className="text-sm text-muted-foreground">
                      This information helps us optimize your tax structure and ensure compliance with state regulations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "taxes" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Tax Optimization</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border-2 border-primary/30 bg-primary/5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Recommended Tax Strategy
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Structure:</span>
                      <span className="font-semibold">{entityInfo[selectedEntity!]?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax Rate:</span>
                      <span className="font-semibold">{entityInfo[selectedEntity!]?.taxRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated Savings:</span>
                      <span className="font-semibold text-primary">$8,500/year</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border border-border">
                  <h3 className="font-semibold mb-4">Next Steps</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                      <span className="text-sm">Automatic EIN application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                      <span className="text-sm">State registration filing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                      <span className="text-sm">Business bank account setup</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                      <span className="text-sm">Insurance recommendations</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Review & Confirm</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Business Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entity Type:</span>
                      <span className="font-medium">{entityInfo[selectedEntity!]?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business Name:</span>
                      <span className="font-medium">{formData.businessName || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">State:</span>
                      <span className="font-medium">{formData.state || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry:</span>
                      <span className="font-medium">{formData.industry || "Not set"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Pricing</h3>
                  <div className="space-y-2 pb-4 border-b border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">State Filing Fee:</span>
                      <span>$200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biz Dev Setup:</span>
                      <span className="text-primary">Free (1% equity)</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Due Now:</span>
                    <span>$200</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-sm">
                  By proceeding, you agree to our 1% equity partnership model. This covers all setup costs, foundational tools, 
                  and ongoing support. No hidden fees.
                </p>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-primary rounded-full">
                  <Sparkles className="w-10 h-10 text-primary-foreground animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Creating Your Business...</h2>
              <p className="text-muted-foreground mb-6">This will only take a moment</p>
              <div className="max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
                <p>✓ Filing with state authorities</p>
                <p>✓ Applying for EIN</p>
                <p>✓ Setting up business profiles</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step !== "processing" && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="mr-2" />
                Back
              </Button>
              <Button 
                onClick={step === "review" ? handleSubmit : handleNext}
                disabled={(step === "selection" && !selectedEntity) || isSubmitting}
              >
                {step === "review" ? "Create Entity" : "Next"}
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateEntity;