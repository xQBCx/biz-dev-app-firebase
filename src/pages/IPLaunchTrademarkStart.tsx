import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { Stamp, ArrowLeft, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IPLaunchTrademarkStart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [markType, setMarkType] = useState("wordmark");
  const [paymentModel, setPaymentModel] = useState("pay");
  const [formData, setFormData] = useState({
    markText: "",
    applicantName: "",
    applicantEmail: "",
    description: "",
    classes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Trademark Filing Started",
      description: "Your trademark application has been saved as a draft.",
    });
    navigate("/iplaunch/dashboard");
  };

  const handleSearch = () => {
    toast({
      title: "Searching USPTO Database",
      description: "Checking for similar trademarks...",
    });
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
              <Button type="button" onClick={handleSearch}>
                <Search className="h-4 w-4" />
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

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Continue to AI Assistant
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
