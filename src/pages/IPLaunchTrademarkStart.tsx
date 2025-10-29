import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { Stamp, ArrowLeft, Search, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrademarkAIResults } from "@/components/TrademarkAIResults";

const IPLaunchTrademarkStart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [markType, setMarkType] = useState("wordmark");
  const [paymentModel, setPaymentModel] = useState("pay");
  const [aiResults, setAiResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    markText: "",
    applicantName: "",
    applicantEmail: "",
    description: "",
    classes: "",
  });

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
          application_type: "trademark",
          sub_type: markType,
          payment_model: paymentModel,
          applicant_name: formData.applicantName,
          applicant_email: formData.applicantEmail,
          mark_text: formData.markText,
          mark_type: markType,
          tm_classes: formData.classes,
          goods_services_description: formData.description,
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
              applicationType: "trademark",
              subType: markType,
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
          description: "Your trademark application is under review for equity financing.",
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

  const handleSearch = async () => {
    if (!formData.markText || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please provide trademark text and description first.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("iplaunch-trademark-search", {
        body: {
          markText: formData.markText,
          description: formData.description,
          classes: formData.classes,
        },
      });

      if (error) throw error;

      setAiResults(data);
      toast({
        title: "Trademark Analysis Complete",
        description: "Review your trademark search results below.",
      });
    } catch (error: any) {
      console.error("Trademark search error:", error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search trademark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
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
        <Stamp className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Trademark Filing Wizard</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trademark Type */}
        <Card className="p-6">
          <Label className="text-lg font-semibold mb-4 block">Trademark Type</Label>
          <RadioGroup value={markType} onValueChange={setMarkType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="wordmark" id="wordmark" />
              <Label htmlFor="wordmark">Wordmark (Text Only)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="logo" id="logo" />
              <Label htmlFor="logo">Logo (Design Only)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="combined" id="combined" />
              <Label htmlFor="combined">Combined Mark (Text + Logo)</Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Payment Model */}
        <Card className="p-6">
          <Label className="text-lg font-semibold mb-4 block">Payment Model</Label>
          <RadioGroup value={paymentModel} onValueChange={setPaymentModel}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pay" id="pay" />
              <Label htmlFor="pay">Pay Filing Fee (Stripe Checkout)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="equity" id="equity" />
              <Label htmlFor="equity">IPLaunch Covers Cost (Equity Share)</Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Applicant Information */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Applicant Information</h2>
          
          <div className="space-y-2">
            <Label htmlFor="applicantName">Full Name or Business Name</Label>
            <Input
              id="applicantName"
              value={formData.applicantName}
              onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicantEmail">Email</Label>
            <Input
              id="applicantEmail"
              type="email"
              value={formData.applicantEmail}
              onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* Trademark Details */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Trademark Details</h2>
          
          <div className="space-y-2">
            <Label htmlFor="markText">Trademark Text</Label>
            <div className="flex gap-2">
              <Input
                id="markText"
                value={formData.markText}
                onChange={(e) => setFormData({ ...formData, markText: e.target.value })}
              placeholder="Enter your trademark"
              required
            />
            <Button 
              type="button" 
              onClick={handleSearch}
              disabled={isSearching || !formData.markText || !formData.description}
            >
              {isSearching ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classes">TM Classes (comma-separated)</Label>
            <Input
              id="classes"
              value={formData.classes}
              onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
              placeholder="e.g., 25, 35, 42"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Goods/Services Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the goods or services associated with this trademark..."
              rows={6}
              required
            />
          </div>
        </Card>

        {/* AI Results */}
        {aiResults && (
          <TrademarkAIResults 
            results={aiResults} 
            onRegenerate={handleSearch}
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

export default IPLaunchTrademarkStart;
