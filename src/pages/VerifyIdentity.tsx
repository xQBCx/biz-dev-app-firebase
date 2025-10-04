import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle, Shield, Building, User } from "lucide-react";
import { toast } from "sonner";

type VerificationStep = "type" | "personal" | "business" | "biometric" | "complete";

const VerifyIdentity = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<VerificationStep>("type");
  const [userType, setUserType] = useState<"new" | "existing" | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ein: "",
    businessName: "",
  });

  const handleNext = () => {
    if (step === "type" && !userType) {
      toast.error("Please select whether you have an existing business");
      return;
    }
    
    const steps: VerificationStep[] = userType === "existing" 
      ? ["type", "business", "personal", "biometric", "complete"]
      : ["type", "personal", "biometric", "complete"];
    
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: VerificationStep[] = userType === "existing"
      ? ["type", "business", "personal", "biometric", "complete"]
      : ["type", "personal", "biometric", "complete"];
    
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    setStep("complete");
    toast.success("BD-ID™ verification complete!");
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-depth flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">BD-ID™ Verification</h1>
          <p className="text-muted-foreground">Secure your verified business identity in minutes</p>
        </div>

        <Card className="bg-card shadow-elevated border border-border p-8">
          {/* Progress Indicator */}
          <div className="flex justify-between mb-8">
            {["Type", userType === "existing" ? "Business" : null, "Personal", "Verify", "Complete"]
              .filter(Boolean)
              .map((label, idx, arr) => (
                <div key={label} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    idx <= arr.indexOf(arr.find(l => l?.toLowerCase() === step) || arr[0])
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground"
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < arr.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      idx < arr.indexOf(arr.find(l => l?.toLowerCase() === step) || arr[0])
                        ? "bg-primary"
                        : "bg-border"
                    }`} />
                  )}
                </div>
              ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {step === "type" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Do you have an existing business?</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card
                    className={`p-6 cursor-pointer transition-all hover:shadow-glow border-2 ${
                      userType === "existing" ? "border-primary bg-primary/10" : "border-border"
                    }`}
                    onClick={() => setUserType("existing")}
                  >
                    <Building className="w-12 h-12 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Yes, I have a business</h3>
                    <p className="text-muted-foreground">Verify with your EIN and get instant access</p>
                  </Card>
                  <Card
                    className={`p-6 cursor-pointer transition-all hover:shadow-glow border-2 ${
                      userType === "new" ? "border-primary bg-primary/10" : "border-border"
                    }`}
                    onClick={() => setUserType("new")}
                  >
                    <User className="w-12 h-12 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">No, I'm starting fresh</h3>
                    <p className="text-muted-foreground">We'll help you create your business entity</p>
                  </Card>
                </div>
              </div>
            )}

            {step === "business" && userType === "existing" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Business Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Your Business LLC"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ein">Employer Identification Number (EIN)</Label>
                    <Input
                      id="ein"
                      value={formData.ein}
                      onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                      placeholder="12-3456789"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === "personal" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Personal Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === "biometric" && (
              <div className="space-y-4 text-center">
                <h2 className="text-2xl font-semibold">Biometric Verification</h2>
                <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-12">
                  <Shield className="w-20 h-20 mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground mb-4">
                    Click below to start secure biometric verification
                  </p>
                  <Button variant="chrome" onClick={handleSubmit}>
                    Start Verification
                  </Button>
                </div>
              </div>
            )}

            {step === "complete" && (
              <div className="space-y-4 text-center py-8">
                <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
                <h2 className="text-2xl font-semibold">Verification Complete!</h2>
                <p className="text-muted-foreground">
                  Your BD-ID™ has been created. Redirecting to dashboard...
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          {step !== "complete" && (
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={step === "type" ? () => navigate("/") : handleBack}
              >
                <ArrowLeft className="mr-2" />
                {step === "type" ? "Back to Home" : "Back"}
              </Button>
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VerifyIdentity;
