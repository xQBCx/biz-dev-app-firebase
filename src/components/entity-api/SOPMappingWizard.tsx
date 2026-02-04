import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  FileText, 
  Sparkles, 
  Link2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useEntityApiEndpoints, useCreateSopMapping, type EntityApiEndpoint } from "@/hooks/useEntityAPIs";
import { toast } from "sonner";

const sopFormSchema = z.object({
  sop_name: z.string().min(1, "SOP name is required"),
  sop_description: z.string().optional(),
  sop_document_url: z.string().url().optional().or(z.literal("")),
});

interface TriggerPoint {
  id: string;
  name: string;
  description: string;
  stage: string;
  required_approvals: string[];
  mapped_endpoint_id?: string;
}

interface SOPMappingWizardProps {
  entityId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const WIZARD_STEPS = [
  { id: "document", label: "SOP Document", icon: FileText },
  { id: "extract", label: "Extract Triggers", icon: Sparkles },
  { id: "map", label: "Map Endpoints", icon: Link2 },
  { id: "review", label: "Review & Save", icon: CheckCircle2 },
];

const SAMPLE_TRIGGER_POINTS: TriggerPoint[] = [
  {
    id: "1",
    name: "Work Order Publication",
    description: "Initial release of work order to qualified bidders",
    stage: "initiation",
    required_approvals: ["Project Manager"],
  },
  {
    id: "2",
    name: "Bid Submission Deadline",
    description: "Cutoff for receiving contractor bids",
    stage: "bidding",
    required_approvals: [],
  },
  {
    id: "3",
    name: "Bid Acceptance",
    description: "Selection and notification of winning bidder",
    stage: "bidding",
    required_approvals: ["Procurement Lead", "Project Manager"],
  },
  {
    id: "4",
    name: "Work Completion Approval",
    description: "Final sign-off on completed work",
    stage: "completion",
    required_approvals: ["Site Supervisor", "Quality Inspector"],
  },
  {
    id: "5",
    name: "Invoice Approval",
    description: "Authorization for payment processing",
    stage: "payment",
    required_approvals: ["Finance Manager"],
  },
];

export function SOPMappingWizard({ entityId, onComplete, onCancel }: SOPMappingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [triggerPoints, setTriggerPoints] = useState<TriggerPoint[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [useAiExtraction, setUseAiExtraction] = useState(true);
  
  const { data: endpoints = [] } = useEntityApiEndpoints(entityId);
  const createSopMapping = useCreateSopMapping();
  
  const form = useForm<z.infer<typeof sopFormSchema>>({
    resolver: zodResolver(sopFormSchema),
    defaultValues: {
      sop_name: "",
      sop_description: "",
      sop_document_url: "",
    },
  });

  const handleExtractTriggers = async () => {
    setIsExtracting(true);
    
    // Simulate AI extraction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (useAiExtraction) {
      // In production, this would call an AI edge function
      setTriggerPoints(SAMPLE_TRIGGER_POINTS);
      toast.success("AI extracted 5 trigger points from your SOP");
    }
    
    setIsExtracting(false);
    setCurrentStep(2);
  };

  const handleAddTriggerPoint = () => {
    const newPoint: TriggerPoint = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      stage: "initiation",
      required_approvals: [],
    };
    setTriggerPoints([...triggerPoints, newPoint]);
  };

  const handleRemoveTriggerPoint = (id: string) => {
    setTriggerPoints(triggerPoints.filter(tp => tp.id !== id));
  };

  const handleUpdateTriggerPoint = (id: string, updates: Partial<TriggerPoint>) => {
    setTriggerPoints(triggerPoints.map(tp => 
      tp.id === id ? { ...tp, ...updates } : tp
    ));
  };

  const handleMapEndpoint = (triggerId: string, endpointId: string) => {
    handleUpdateTriggerPoint(triggerId, { mapped_endpoint_id: endpointId });
  };

  const handleSave = async () => {
    const formData = form.getValues();
    
    const mappedEndpointIds = triggerPoints
      .filter(tp => tp.mapped_endpoint_id)
      .map(tp => tp.mapped_endpoint_id as string);

    try {
      await createSopMapping.mutateAsync({
        entity_id: entityId,
        sop_name: formData.sop_name,
        sop_description: formData.sop_description || undefined,
        sop_document_url: formData.sop_document_url || undefined,
        trigger_points: triggerPoints.map(tp => ({
          name: tp.name,
          description: tp.description,
          stage: tp.stage,
          required_approvals: tp.required_approvals,
          mapped_endpoint_id: tp.mapped_endpoint_id,
        })),
        mapped_api_endpoints: mappedEndpointIds,
      });
      
      onComplete?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return form.formState.isValid && form.getValues("sop_name");
      case 1:
        return triggerPoints.length > 0 || !useAiExtraction;
      case 2:
        return triggerPoints.some(tp => tp.mapped_endpoint_id);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">SOP Mapping Wizard</h2>
          <Badge variant="outline">
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  isActive ? "text-primary font-medium" : 
                  isCompleted ? "text-muted-foreground" : "text-muted-foreground/50"
                }`}
              >
                <div className={`p-1.5 rounded-full ${
                  isActive ? "bg-primary text-primary-foreground" :
                  isCompleted ? "bg-primary/20 text-primary" : "bg-muted"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Document Info */}
          {currentStep === 0 && (
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="sop_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SOP Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Work Order Approval Process" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear name for this Standard Operating Procedure
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sop_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the purpose and scope of this SOP..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sop_document_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document URL (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="https://..." 
                            {...field} 
                          />
                          <Button type="button" variant="outline" size="icon">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Link to the SOP document for AI-assisted extraction
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {/* Step 2: Extract Triggers */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="useAi"
                  checked={useAiExtraction}
                  onCheckedChange={(checked) => setUseAiExtraction(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="useAi" className="font-medium">
                    Use AI to extract trigger points
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically identify approval gates and decision points from your SOP document
                  </p>
                </div>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>

              {isExtracting ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing SOP document...</p>
                </div>
              ) : (
                <>
                  {!useAiExtraction && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Manual Trigger Points</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddTriggerPoint}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Trigger
                        </Button>
                      </div>

                      {triggerPoints.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No trigger points added yet. Click "Add Trigger" to start.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {triggerPoints.map((tp) => (
                            <div
                              key={tp.id}
                              className="flex items-start gap-3 p-3 border rounded-lg"
                            >
                              <div className="flex-1 space-y-2">
                                <Input
                                  placeholder="Trigger name"
                                  value={tp.name}
                                  onChange={(e) =>
                                    handleUpdateTriggerPoint(tp.id, { name: e.target.value })
                                  }
                                />
                                <Input
                                  placeholder="Description"
                                  value={tp.description}
                                  onChange={(e) =>
                                    handleUpdateTriggerPoint(tp.id, { description: e.target.value })
                                  }
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveTriggerPoint(tp.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {useAiExtraction && triggerPoints.length === 0 && (
                    <div className="text-center py-8">
                      <Button onClick={handleExtractTriggers}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Extract Trigger Points
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 3: Map Endpoints */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Map each trigger point to a registered API endpoint. This creates the digital interface for your SOP.
              </p>

              {triggerPoints.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No trigger points to map. Go back and add some.
                </div>
              ) : (
                <div className="space-y-3">
                  {triggerPoints.map((tp) => (
                    <Card key={tp.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{tp.name || "Unnamed Trigger"}</CardTitle>
                            <CardDescription>{tp.description}</CardDescription>
                          </div>
                          <Badge variant="outline">{tp.stage}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          <Select
                            value={tp.mapped_endpoint_id || ""}
                            onValueChange={(value) => handleMapEndpoint(tp.id, value)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select API endpoint..." />
                            </SelectTrigger>
                            <SelectContent>
                              {endpoints.map((endpoint: EntityApiEndpoint) => (
                                <SelectItem key={endpoint.id} value={endpoint.id}>
                                  {endpoint.endpoint_name} ({endpoint.endpoint_type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {tp.required_approvals.length > 0 && (
                          <div className="mt-2 flex gap-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">Requires:</span>
                            {tp.required_approvals.map((approver) => (
                              <Badge key={approver} variant="secondary" className="text-xs">
                                {approver}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {endpoints.length === 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
                  <p className="font-medium text-yellow-600">No API endpoints registered</p>
                  <p className="text-muted-foreground">
                    Register API endpoints first to map them to SOP trigger points.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">SOP Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{form.getValues("sop_name")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trigger Points:</span>
                    <p className="font-medium">{triggerPoints.length}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mapped Endpoints:</span>
                    <p className="font-medium">
                      {triggerPoints.filter(tp => tp.mapped_endpoint_id).length}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">AI Extracted:</span>
                    <p className="font-medium">{useAiExtraction ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Trigger Point Mappings</h3>
                {triggerPoints.map((tp) => {
                  const endpoint = endpoints.find((e: EntityApiEndpoint) => e.id === tp.mapped_endpoint_id);
                  return (
                    <div
                      key={tp.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{tp.name}</p>
                        <p className="text-xs text-muted-foreground">{tp.stage}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        {endpoint ? (
                          <Badge>{endpoint.endpoint_name}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Not mapped
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
        </div>

        <div>
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button
              onClick={() => {
                if (currentStep === 1 && useAiExtraction && triggerPoints.length === 0) {
                  handleExtractTriggers();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={createSopMapping.isPending}
            >
              {createSopMapping.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save SOP Mapping
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
