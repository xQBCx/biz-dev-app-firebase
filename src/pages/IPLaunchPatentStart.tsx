import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PatentAIResults } from "@/components/PatentAIResults";
import { cn } from "@/lib/utils";

const IPLaunchPatentStart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patentType, setPatentType] = useState("provisional");
  const [paymentModel, setPaymentModel] = useState("pay");
  const [aiResults, setAiResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    inventionTitle: "",
    inventorName: "",
    inventorEmail: "",
    description: "",
  });

  const handleAIAnalysis = async () => {
    if (!formData.inventionTitle || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please provide invention title and description first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("iplaunch-patent-assist", {
        body: {
          inventionTitle: formData.inventionTitle,
          description: formData.description,
          patentType,
        },
      });

      if (error) throw error;

      setAiResults(data);
      toast({
        title: "AI Analysis Complete",
        description: "Review your patent analysis below.",
      });
    } catch (error: any) {
      console.error("AI analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze patent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create application record
      const { data: application, error: appError } = await supabase
        .from("ip_applications")
        .insert({
          user_id: user.id,
          application_type: "patent",
          sub_type: patentType,
          payment_model: paymentModel,
          applicant_name: formData.inventorName,
          applicant_email: formData.inventorEmail,
          invention_title: formData.inventionTitle,
          invention_description: formData.description,
          ai_analysis: aiResults,
          status: paymentModel === "pay" ? "pending_payment" : "pending_review",
        })
        .select()
        .single();

      if (appError) throw appError;

      if (paymentModel === "pay") {
        // Redirect to Stripe checkout
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
          "iplaunch-create-checkout",
          {
            body: {
              applicationId: application.id,
              applicationType: "patent",
              subType: patentType,
            },
          }
        );

        if (checkoutError) throw checkoutError;

        window.open(checkoutData.url, "_blank");
        toast({
          title: "Redirecting to Payment",
          description: "Opening Stripe checkout in a new tab...",
        });
      } else {
        // Equity model - update with pending review
        toast({
          title: "Application Submitted",
          description: "Your patent application is under review for equity financing.",
        });
      }

      navigate("/iplaunch/dashboard");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/iplaunch')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to IPLaunch
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Patent Filing Wizard</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patent Type */}
        <Card className="p-6">
          <Label className="text-lg font-semibold mb-4 block">Patent Type</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant={patentType === "provisional" ? "default" : "outline"}
                className={cn(
                  "w-10 h-10 p-0 transition-all",
                  patentType === "provisional" && "ring-2 ring-primary"
                )}
                onClick={() => setPatentType("provisional")}
              >
                {patentType === "provisional" && <Check className="h-4 w-4" />}
              </Button>
              <Label 
                htmlFor="provisional" 
                className="cursor-pointer text-base"
                onClick={() => setPatentType("provisional")}
              >
                Provisional Patent
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant={patentType === "utility" ? "default" : "outline"}
                className={cn(
                  "w-10 h-10 p-0 transition-all",
                  patentType === "utility" && "ring-2 ring-primary"
                )}
                onClick={() => setPatentType("utility")}
              >
                {patentType === "utility" && <Check className="h-4 w-4" />}
              </Button>
              <Label 
                htmlFor="utility" 
                className="cursor-pointer text-base"
                onClick={() => setPatentType("utility")}
              >
                Utility Patent
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant={patentType === "design" ? "default" : "outline"}
                className={cn(
                  "w-10 h-10 p-0 transition-all",
                  patentType === "design" && "ring-2 ring-primary"
                )}
                onClick={() => setPatentType("design")}
              >
                {patentType === "design" && <Check className="h-4 w-4" />}
              </Button>
              <Label 
                htmlFor="design" 
                className="cursor-pointer text-base"
                onClick={() => setPatentType("design")}
              >
                Design Patent
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant={patentType === "software" ? "default" : "outline"}
                className={cn(
                  "w-10 h-10 p-0 transition-all",
                  patentType === "software" && "ring-2 ring-primary"
                )}
                onClick={() => setPatentType("software")}
              >
                {patentType === "software" && <Check className="h-4 w-4" />}
              </Button>
              <Label 
                htmlFor="software" 
                className="cursor-pointer text-base"
                onClick={() => setPatentType("software")}
              >
                Software Patent
              </Label>
            </div>
          </div>
        </Card>

        {/* Payment Model */}
        <Card className="p-6">
          <Label className="text-lg font-semibold mb-4 block">Payment Model</Label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant={paymentModel === "pay" ? "default" : "outline"}
                className={cn(
                  "w-10 h-10 p-0 transition-all",
                  paymentModel === "pay" && "ring-2 ring-primary"
                )}
                onClick={() => setPaymentModel("pay")}
              >
                {paymentModel === "pay" && <Check className="h-4 w-4" />}
              </Button>
              <Label 
                htmlFor="pay" 
                className="cursor-pointer text-base"
                onClick={() => setPaymentModel("pay")}
              >
                Pay Filing Fee (Stripe Checkout)
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                variant={paymentModel === "equity" ? "default" : "outline"}
                className={cn(
                  "w-10 h-10 p-0 transition-all",
                  paymentModel === "equity" && "ring-2 ring-primary"
                )}
                onClick={() => setPaymentModel("equity")}
              >
                {paymentModel === "equity" && <Check className="h-4 w-4" />}
              </Button>
              <Label 
                htmlFor="equity" 
                className="cursor-pointer text-base"
                onClick={() => setPaymentModel("equity")}
              >
                IPLaunch Covers Cost (Equity/Co-Inventorship)
              </Label>
            </div>
          </div>
        </Card>

        {/* Inventor Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Inventor Information</h2>
          
          <div className="space-y-2">
            <Label htmlFor="inventorName">Full Name</Label>
            <Input
              id="inventorName"
              value={formData.inventorName}
              onChange={(e) => setFormData({ ...formData, inventorName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inventorEmail">Email</Label>
            <Input
              id="inventorEmail"
              type="email"
              value={formData.inventorEmail}
              onChange={(e) => setFormData({ ...formData, inventorEmail: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* Invention Details */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Invention Details</h2>
          
          <div className="space-y-2">
            <Label htmlFor="inventionTitle">Invention Title</Label>
            <Input
              id="inventionTitle"
              value={formData.inventionTitle}
              onChange={(e) => setFormData({ ...formData, inventionTitle: e.target.value })}
              placeholder="Brief, descriptive title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Invention Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your invention in detail..."
              rows={8}
              required
            />
          </div>
        </Card>

        {/* AI Analysis Button */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">AI Patent Assistant</h2>
              <p className="text-sm text-muted-foreground">
                Generate patent claims, abstract, and novelty analysis
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAIAnalysis}
              disabled={isAnalyzing || !formData.inventionTitle || !formData.description}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
            </Button>
          </div>
        </Card>

        {/* AI Results */}
        {aiResults && (
          <PatentAIResults 
            results={aiResults} 
            onRegenerate={handleAIAnalysis}
          />
        )}

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Save & Continue
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/iplaunch')}
          >
            Save Draft
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IPLaunchPatentStart;
