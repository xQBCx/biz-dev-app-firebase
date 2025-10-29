import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Stamp, ArrowLeft, Search, Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrademarkAIResults } from "@/components/TrademarkAIResults";
import { cn } from "@/lib/utils";

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              type="button"
              variant={markType === "wordmark" ? "default" : "outline"}
              className={cn(
                "h-auto py-4 justify-start transition-all",
                markType === "wordmark" && "ring-2 ring-primary"
              )}
              onClick={() => setMarkType("wordmark")}
            >
              {markType === "wordmark" && <Check className="h-4 w-4 mr-2" />}
              Wordmark (Text Only)
            </Button>
            <Button
              type="button"
              variant={markType === "logo" ? "default" : "outline"}
              className={cn(
                "h-auto py-4 justify-start transition-all",
                markType === "logo" && "ring-2 ring-primary"
              )}
              onClick={() => setMarkType("logo")}
            >
              {markType === "logo" && <Check className="h-4 w-4 mr-2" />}
              Logo (Design Only)
            </Button>
            <Button
              type="button"
              variant={markType === "combined" ? "default" : "outline"}
              className={cn(
                "h-auto py-4 justify-start transition-all",
                markType === "combined" && "ring-2 ring-primary"
              )}
              onClick={() => setMarkType("combined")}
            >
              {markType === "combined" && <Check className="h-4 w-4 mr-2" />}
              Combined Mark (Text + Logo)
            </Button>
          </div>
        </Card>

        {/* Payment Model */}
        <Card className="p-6">
          <Label className="text-lg font-semibold mb-4 block">Payment Model</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              type="button"
              variant={paymentModel === "pay" ? "default" : "outline"}
              className={cn(
                "h-auto py-4 justify-start transition-all",
                paymentModel === "pay" && "ring-2 ring-primary"
              )}
              onClick={() => setPaymentModel("pay")}
            >
              {paymentModel === "pay" && <Check className="h-4 w-4 mr-2" />}
              Pay Filing Fee (Stripe Checkout)
            </Button>
            <Button
              type="button"
              variant={paymentModel === "equity" ? "default" : "outline"}
              className={cn(
                "h-auto py-4 justify-start transition-all",
                paymentModel === "equity" && "ring-2 ring-primary"
              )}
              onClick={() => setPaymentModel("equity")}
            >
              {paymentModel === "equity" && <Check className="h-4 w-4 mr-2" />}
              IPLaunch Covers Cost (Equity Share)
            </Button>
          </div>
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
