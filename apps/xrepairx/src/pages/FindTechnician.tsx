import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Video, Wrench, Printer, Clock, CheckCircle2 } from "lucide-react";
import { XRepairxLogo } from "@/components/XRepairxLogo";
import { PartIdentification } from "@/components/PartIdentification";

export default function FindTechnician() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPartId, setShowPartId] = useState(false);
  
  // Get any data passed from RequestSupport
  const formData = location.state?.formData;

  const options = [
    {
      id: "remote-guidance",
      icon: Video,
      title: "Remote Expert Guidance",
      description: "Connect with a remote expert who can guide you through the repair via video call",
      eta: "Available Now",
      recommended: true,
    },
    {
      id: "field-technician",
      icon: Wrench,
      title: "Dispatch Field Technician",
      description: "Have a qualified technician dispatched to your location for on-site repair",
      eta: "Within 2-4 hours",
    },
    {
      id: "part-discovery",
      icon: Printer,
      title: "AI Part Discovery & Print",
      description: "Use AI to identify the broken part and check if it can be 3D printed on-demand",
      eta: "Instant Analysis",
    },
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    
    if (optionId === "part-discovery") {
      setShowPartId(true);
    } else if (optionId === "remote-guidance") {
      // Navigate to schedule remote session
      navigate("/operator/sessions");
    } else if (optionId === "field-technician") {
      // Navigate to work order creation
      navigate("/operator/work-orders");
    }
  };

  if (showPartId) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <XRepairxLogo size="sm" />
            </Link>
            <Button variant="ghost" onClick={() => setShowPartId(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Options
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">AI Part Discovery</h1>
            <p className="text-muted-foreground">
              Upload photos of the broken part for AI analysis and print-on-demand options
            </p>
          </div>
          
          <PartIdentification />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <XRepairxLogo size="sm" />
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/request-support">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Status Card */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg mb-1">Issue Logged Successfully</h2>
                <p className="text-sm text-muted-foreground">
                  {formData?.aiAnalysis 
                    ? `AI Analysis: ${formData.aiAnalysis.severity?.level || 'Normal'} priority - ${formData.aiAnalysis.issue_category || 'General'} issue`
                    : "Your support request has been received. Choose how you'd like to proceed."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>How would you like to proceed?</CardTitle>
            <CardDescription>
              Select the best option for your repair needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-start gap-4 ${
                  option.recommended 
                    ? "border-primary bg-primary/5 hover:bg-primary/10" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`p-3 rounded-lg ${option.recommended ? "bg-primary/10" : "bg-muted"}`}>
                  <option.icon className={`h-6 w-6 ${option.recommended ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{option.title}</h3>
                    {option.recommended && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {option.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{option.eta}</span>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Your Location
          </h3>
          <p className="text-sm text-muted-foreground">
            Technicians in your area are available for dispatch. Average response time: 2-4 hours.
          </p>
        </div>
      </main>
    </div>
  );
}
