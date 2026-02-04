import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader, Sparkles, Building2, ArrowRight, FolderTree, Zap, RefreshCw } from "lucide-react";

interface ERPTemplate {
  id: string;
  name: string;
  industry: string;
  strategy_type: string;
  description: string;
  folder_structure: Record<string, any>;
  recommended_integrations: string[];
  recommended_workflows: string[];
}

const ERPGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [strategy, setStrategy] = useState("");
  const [customDetails, setCustomDetails] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ERPTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["erp-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("erp_templates")
        .select("*")
        .eq("is_default", true);
      if (error) throw error;
      return data as ERPTemplate[];
    },
  });

  const { data: companies } = useQuery({
    queryKey: ["crm-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_companies")
        .select("id, name, industry")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke("erp-generate", {
        body: {
          companyName,
          industry,
          strategy,
          customDetails,
          templateId: selectedTemplate?.id,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("ERP structure generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["erp-configs"] });
      navigate(`/erp-viewer/${data.configId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setIsGenerating(false);
    },
  });

  const handleTemplateSelect = (template: ERPTemplate) => {
    setSelectedTemplate(template);
    setIndustry(template.industry);
    setStrategy(template.strategy_type || "");
  };

  const industries = [
    "technology", "consulting", "retail", "construction", "healthcare",
    "manufacturing", "finance", "real_estate", "education", "hospitality"
  ];

  const strategies = [
    "growth", "client-focused", "omnichannel", "project-based", "compliance",
    "cost-leadership", "innovation", "market-expansion"
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 border rounded-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Intelligent ERP Generator</h1>
            <p className="text-muted-foreground">
              AI-powered ERP structure tailored to your industry and strategy
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {s}
              </div>
              {s < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
          <span className="ml-4 text-sm text-muted-foreground">
            {step === 1 && "Select Industry Template"}
            {step === 2 && "Customize Details"}
            {step === 3 && "Generate & Review"}
          </span>
        </div>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Select Industry Template
                </CardTitle>
                <CardDescription>
                  Choose a pre-built template or start from scratch
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates?.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:border-primary ${
                          selectedTemplate?.id === template.id ? "border-primary border-2" : ""
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.recommended_integrations?.slice(0, 3).map((int) => (
                              <span key={int} className="text-xs bg-muted px-2 py-0.5 rounded">
                                {int}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Card
                      className={`cursor-pointer transition-all hover:border-primary ${
                        selectedTemplate === null && industry ? "border-primary border-2" : ""
                      }`}
                      onClick={() => setSelectedTemplate(null)}
                    >
                      <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="h-8 w-8 mb-2 text-muted-foreground" />
                        <h3 className="font-semibold">AI Custom Generation</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Generate a unique ERP based on your specific needs
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedTemplate && !industry}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Company Details */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  Company Details
                </CardTitle>
                <CardDescription>
                  Provide details to customize your ERP structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind.charAt(0).toUpperCase() + ind.slice(1).replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Business Strategy</Label>
                    <Select value={strategy} onValueChange={setStrategy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        {strategies.map((strat) => (
                          <SelectItem key={strat} value={strat}>
                            {strat.charAt(0).toUpperCase() + strat.slice(1).replace("-", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Details (Optional)</Label>
                  <Textarea
                    placeholder="Describe any specific requirements, departments, workflows, or integrations you need..."
                    value={customDetails}
                    onChange={(e) => setCustomDetails(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!companyName || !industry}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Generate */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Generate ERP Structure
                </CardTitle>
                <CardDescription>
                  Review your settings and generate the ERP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium capitalize">{industry.replace("_", " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Strategy</p>
                    <p className="font-medium capitalize">{strategy.replace("-", " ") || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Template</p>
                    <p className="font-medium">{selectedTemplate?.name || "AI Generated"}</p>
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Template Includes:</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Integrations:</strong> {selectedTemplate.recommended_integrations?.join(", ")}</p>
                      <p><strong>Workflows:</strong> {selectedTemplate.recommended_workflows?.join(", ")}</p>
                    </div>
                  </div>
                )}

                {customDetails && (
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Custom Requirements:</h4>
                    <p className="text-sm text-muted-foreground">{customDetails}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                onClick={() => generateMutation.mutate()} 
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate ERP Structure
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ERPGenerator;
