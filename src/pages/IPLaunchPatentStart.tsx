import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IPLaunchPatentStart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patentType, setPatentType] = useState("provisional");
  const [paymentModel, setPaymentModel] = useState("pay");
  const [formData, setFormData] = useState({
    inventionTitle: "",
    inventorName: "",
    inventorEmail: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Patent Filing Started",
      description: "Your patent application has been saved as a draft.",
    });
    navigate("/iplaunch/dashboard");
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
          <RadioGroup value={patentType} onValueChange={setPatentType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="provisional" id="provisional" />
              <Label htmlFor="provisional">Provisional Patent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="utility" id="utility" />
              <Label htmlFor="utility">Utility Patent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="design" id="design" />
              <Label htmlFor="design">Design Patent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="software" id="software" />
              <Label htmlFor="software">Software Patent</Label>
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
              <Label htmlFor="equity">IPLaunch Covers Cost (Equity/Co-Inventorship)</Label>
            </div>
          </RadioGroup>
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

export default IPLaunchPatentStart;
