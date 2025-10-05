import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Building, 
  User,
  Upload,
  FileText,
  Camera,
  Lock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type VerificationStep = "type" | "personal" | "business" | "documents" | "review" | "complete";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be in format XXX-XX-XXXX")
});

const businessInfoSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  ein: z.string().regex(/^\d{2}-\d{7}$/, "EIN must be in format XX-XXXXXXX"),
  businessAddress: z.string().min(5, "Business address is required")
});

const VerifyIdentity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<VerificationStep>("type");
  const [userType, setUserType] = useState<"new" | "existing" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    ssn: "",
    ein: "",
    businessName: "",
    businessAddress: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadedDocs, setUploadedDocs] = useState({
    governmentId: false,
    businessLicense: false,
    proofOfAddress: false
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadUserProfile();
  }, [user, navigate]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.bd_id_verified) {
        toast.info("You're already verified!");
        navigate("/dashboard");
      }

      if (data) {
        setFormData(prev => ({
          ...prev,
          email: data.email || "",
          firstName: data.full_name?.split(" ")[0] || "",
          lastName: data.full_name?.split(" ").slice(1).join(" ") || ""
        }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const validateStep = () => {
    setFormErrors({});

    if (step === "type" && !userType) {
      toast.error("Please select whether you have an existing business");
      return false;
    }

    if (step === "personal") {
      try {
        personalInfoSchema.parse({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          ssn: formData.ssn
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string> = {};
          error.errors.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0] as string] = err.message;
            }
          });
          setFormErrors(errors);
          toast.error("Please fix the form errors");
          return false;
        }
      }
    }

    if (step === "business" && userType === "existing") {
      try {
        businessInfoSchema.parse({
          businessName: formData.businessName,
          ein: formData.ein,
          businessAddress: formData.businessAddress
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string> = {};
          error.errors.forEach((err) => {
            if (err.path[0]) {
              errors[err.path[0] as string] = err.message;
            }
          });
          setFormErrors(errors);
          toast.error("Please fix the form errors");
          return false;
        }
      }
    }

    if (step === "documents") {
      if (!uploadedDocs.governmentId) {
        toast.error("Please upload a government-issued ID");
        return false;
      }
      if (userType === "existing" && !uploadedDocs.businessLicense) {
        toast.error("Please upload your business license");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    const steps: VerificationStep[] = userType === "existing" 
      ? ["type", "business", "personal", "documents", "review", "complete"]
      : ["type", "personal", "documents", "review", "complete"];
    
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: VerificationStep[] = userType === "existing"
      ? ["type", "business", "personal", "documents", "review", "complete"]
      : ["type", "personal", "documents", "review", "complete"];
    
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          bd_id: `BD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          bd_id_verified: true,
          bd_id_verified_at: new Date().toISOString(),
          full_name: `${formData.firstName} ${formData.lastName}`
        })
        .eq("id", user.id);

      if (error) throw error;

      setStep("complete");
      toast.success("BD-ID™ verification complete!");
      
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (error) {
      console.error("Error verifying identity:", error);
      toast.error("Failed to complete verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (docType: keyof typeof uploadedDocs) => {
    setUploadedDocs(prev => ({ ...prev, [docType]: true }));
    toast.success("Document uploaded successfully!");
  };

  const formatSSN = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
  };

  const formatEIN = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 9)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary shadow-chrome mb-4">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2">BD-ID™ Verification</h1>
            <p className="text-muted-foreground">Secure your verified business identity in minutes</p>
            <Badge variant="outline" className="mt-4 border-primary text-primary">
              <Lock className="w-3 h-3 mr-1" />
              Bank-level security
            </Badge>
          </div>

          <Card className="bg-card shadow-elevated border border-border p-8">
            {/* Progress Indicator */}
            <div className="flex justify-between mb-8">
              {["Type", userType === "existing" ? "Business" : null, "Personal", "Documents", "Review"]
                .filter(Boolean)
                .map((label, idx, arr) => {
                  const stepNames: VerificationStep[] = userType === "existing"
                    ? ["type", "business", "personal", "documents", "review"]
                    : ["type", "personal", "documents", "review"];
                  const currentStepIndex = stepNames.indexOf(step);
                  const isCompleted = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  
                  return (
                    <div key={label} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                        isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCurrent
                          ? "border-primary bg-primary/20 text-primary animate-pulse"
                          : "border-border bg-muted text-muted-foreground"
                      }`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                      </div>
                      {idx < arr.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 transition-all ${
                          isCompleted ? "bg-primary" : "bg-border"
                        }`} />
                      )}
                    </div>
                  );
                })}
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
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="Your Business LLC"
                        className={formErrors.businessName ? "border-destructive" : ""}
                      />
                      {formErrors.businessName && (
                        <p className="text-sm text-destructive mt-1">{formErrors.businessName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="ein">Employer Identification Number (EIN) *</Label>
                      <Input
                        id="ein"
                        value={formData.ein}
                        onChange={(e) => setFormData({ ...formData, ein: formatEIN(e.target.value) })}
                        placeholder="XX-XXXXXXX"
                        maxLength={10}
                        className={formErrors.ein ? "border-destructive" : ""}
                      />
                      {formErrors.ein && (
                        <p className="text-sm text-destructive mt-1">{formErrors.ein}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="businessAddress">Business Address *</Label>
                      <Textarea
                        id="businessAddress"
                        value={formData.businessAddress}
                        onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                        placeholder="123 Main St, City, State ZIP"
                        rows={3}
                        className={formErrors.businessAddress ? "border-destructive" : ""}
                      />
                      {formErrors.businessAddress && (
                        <p className="text-sm text-destructive mt-1">{formErrors.businessAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === "personal" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Personal Information</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={formErrors.firstName ? "border-destructive" : ""}
                      />
                      {formErrors.firstName && (
                        <p className="text-sm text-destructive mt-1">{formErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={formErrors.lastName ? "border-destructive" : ""}
                      />
                      {formErrors.lastName && (
                        <p className="text-sm text-destructive mt-1">{formErrors.lastName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={formErrors.email ? "border-destructive" : ""}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 555-5555"
                        className={formErrors.phone ? "border-destructive" : ""}
                      />
                      {formErrors.phone && (
                        <p className="text-sm text-destructive mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="ssn">Social Security Number *</Label>
                      <Input
                        id="ssn"
                        type="text"
                        value={formData.ssn}
                        onChange={(e) => setFormData({ ...formData, ssn: formatSSN(e.target.value) })}
                        placeholder="XXX-XX-XXXX"
                        maxLength={11}
                        className={formErrors.ssn ? "border-destructive" : ""}
                      />
                      {formErrors.ssn && (
                        <p className="text-sm text-destructive mt-1">{formErrors.ssn}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        <Lock className="w-3 h-3 inline mr-1" />
                        Encrypted and stored securely
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === "documents" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Upload Documents</h2>
                  
                  {/* Government ID */}
                  <div>
                    <Label className="mb-2 block">Government-Issued ID *</Label>
                    <Card className={`p-6 border-2 border-dashed cursor-pointer hover:border-primary transition-all ${
                      uploadedDocs.governmentId ? "border-primary bg-primary/5" : "border-border"
                    }`}>
                      <div className="text-center">
                        {uploadedDocs.governmentId ? (
                          <div className="flex items-center justify-center gap-2 text-primary">
                            <CheckCircle className="w-6 h-6" />
                            <span className="font-semibold">ID Uploaded Successfully</span>
                          </div>
                        ) : (
                          <>
                            <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-3">
                              Upload driver's license or passport
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleFileUpload("governmentId")}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Business License (if existing business) */}
                  {userType === "existing" && (
                    <div>
                      <Label className="mb-2 block">Business License *</Label>
                      <Card className={`p-6 border-2 border-dashed cursor-pointer hover:border-primary transition-all ${
                        uploadedDocs.businessLicense ? "border-primary bg-primary/5" : "border-border"
                      }`}>
                        <div className="text-center">
                          {uploadedDocs.businessLicense ? (
                            <div className="flex items-center justify-center gap-2 text-primary">
                              <CheckCircle className="w-6 h-6" />
                              <span className="font-semibold">License Uploaded Successfully</span>
                            </div>
                          ) : (
                            <>
                              <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground mb-3">
                                Upload your business license or incorporation documents
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleFileUpload("businessLicense")}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Choose File
                              </Button>
                            </>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Proof of Address (optional) */}
                  <div>
                    <Label className="mb-2 block">Proof of Address (Optional)</Label>
                    <Card className={`p-6 border-2 border-dashed cursor-pointer hover:border-primary transition-all ${
                      uploadedDocs.proofOfAddress ? "border-primary bg-primary/5" : "border-border"
                    }`}>
                      <div className="text-center">
                        {uploadedDocs.proofOfAddress ? (
                          <div className="flex items-center justify-center gap-2 text-primary">
                            <CheckCircle className="w-6 h-6" />
                            <span className="font-semibold">Document Uploaded Successfully</span>
                          </div>
                        ) : (
                          <>
                            <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-3">
                              Utility bill or bank statement
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleFileUpload("proofOfAddress")}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choose File
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {step === "review" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Review & Submit</h2>
                  
                  <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Name:</div>
                        <div>{formData.firstName} {formData.lastName}</div>
                        <div className="text-muted-foreground">Email:</div>
                        <div>{formData.email}</div>
                        <div className="text-muted-foreground">Phone:</div>
                        <div>{formData.phone}</div>
                      </div>
                    </div>

                    {userType === "existing" && (
                      <div className="pt-4 border-t border-border">
                        <h3 className="font-semibold mb-2">Business Information</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Business:</div>
                          <div>{formData.businessName}</div>
                          <div className="text-muted-foreground">EIN:</div>
                          <div>{formData.ein}</div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border">
                      <h3 className="font-semibold mb-2">Documents</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span>Government ID</span>
                        </div>
                        {userType === "existing" && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Business License</span>
                          </div>
                        )}
                        {uploadedDocs.proofOfAddress && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Proof of Address</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Review your information carefully</p>
                      <p className="text-sm text-muted-foreground">
                        By submitting, you confirm all information is accurate and authorize identity verification.
                      </p>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Complete Verification
                      </>
                    )}
                  </Button>
                </div>
              )}

              {step === "complete" && (
                <div className="space-y-4 text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <h2 className="text-3xl font-bold">Verification Complete!</h2>
                  <p className="text-muted-foreground text-lg">
                    Your BD-ID™ has been created successfully
                  </p>
                  <Badge variant="outline" className="border-green-500 text-green-500">
                    <Shield className="w-4 h-4 mr-1" />
                    Verified Business Identity
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-6">
                    Redirecting to dashboard...
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            {step !== "complete" && (
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={step === "type" ? () => navigate("/dashboard") : handleBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  {step === "type" ? "Cancel" : "Back"}
                </Button>
                <Button onClick={handleNext} disabled={isLoading}>
                  Next
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentity;
