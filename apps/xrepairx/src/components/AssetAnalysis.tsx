import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle, AlertCircle, X, AlertTriangle, Wrench, Clock, Phone, Video, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { Badge } from "@/components/ui/badge";

interface AssetAnalysisProps {
  onAnalysisComplete?: (analysis: AnalysisResult, images: string[]) => void;
  assetType?: string;
  category?: string;
  description?: string;
}

interface AffectedComponent {
  name: string;
  type: string;
  criticality: string;
  condition: string;
  notes: string;
}

interface RemoteStep {
  step: number;
  action: string;
  safetyNote?: string;
}

interface AnalysisResult {
  issueClassification: {
    primaryCategory: string;
    subcategory: string;
    issueType: string;
  };
  severity: {
    level: string;
    safetyRisk: boolean;
    operationalImpact: string;
    reasoning: string;
  };
  affectedComponents: AffectedComponent[];
  diagnosis: {
    likelyRootCause: string;
    confidence: string;
    additionalInformationNeeded: string[];
    differentialDiagnosis: string[];
  };
  remoteResolutionPossible: boolean;
  remoteResolutionSteps: RemoteStep[];
  fieldVisitRequired: boolean;
  fieldVisitReason?: string;
  recommendedAction: {
    immediate: string;
    shortTerm: string;
    longTerm: string;
  };
  estimatedRepair: {
    complexity: string;
    estimatedDuration: string;
    skillsRequired: string[];
    specialToolsRequired: string[];
    partsLikelyNeeded: string[];
  };
  knowledgeBaseRecommendations: string[];
  visualAssessment: {
    visibleDamage: string;
    contaminants: string;
    ageIndicators: string;
    maintenanceState: string;
  };
  summary: string;
}

const AssetAnalysis = ({ onAnalysisComplete, assetType, category, description }: AssetAnalysisProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const MAX_IMAGES = 5;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (imagePreviews.length + files.length > MAX_IMAGES) {
      toast({
        title: "Too Many Images",
        description: `You can upload a maximum of ${MAX_IMAGES} images`,
        variant: "destructive",
      });
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please upload only image files",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload images smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const base64Promises = files.map(async (file) => {
        const compressedFile = await compressImage(file, 1920, 0.85);
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });
      });

      const newBase64Images = await Promise.all(base64Promises);
      setImagePreviews(prev => [...prev, ...newBase64Images]);
      
      toast({
        title: "Images Uploaded",
        description: `${files.length} image(s) added successfully`,
      });

      e.target.value = '';
    } catch (error) {
      console.error('Image processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process images",
        variant: "destructive",
      });
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setAnalysis(null);
  };

  const analyzeImages = async () => {
    if (imagePreviews.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-asset-triage', {
        body: { 
          images: imagePreviews,
          assetType,
          category,
          description
        }
      });

      if (error) throw error;

      if (data.analysis) {
        setAnalysis(data.analysis);
        onAnalysisComplete?.(data.analysis, imagePreviews);
        
        toast({
          title: "Analysis Complete",
          description: "Your asset has been analyzed successfully",
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze asset",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityStyles = (level: string) => {
    const styles: Record<string, string> = {
      low: 'bg-green-100 text-green-800 border-green-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      emergency: 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[level] || styles.normal;
  };

  const getConditionStyles = (condition: string) => {
    const styles: Record<string, string> = {
      good: 'bg-green-50 text-green-700',
      fair: 'bg-yellow-50 text-yellow-700',
      poor: 'bg-orange-50 text-orange-700',
      failed: 'bg-red-50 text-red-700'
    };
    return styles[condition] || 'bg-muted text-muted-foreground';
  };

  const getCriticalityBadge = (criticality: string) => {
    const styles: Record<string, string> = {
      non_critical: 'bg-muted text-muted-foreground',
      critical: 'bg-orange-100 text-orange-800',
      safety_critical: 'bg-red-100 text-red-800'
    };
    return styles[criticality] || styles.non_critical;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">AI Issue Triage</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload 1-5 photos of the issue for AI-powered diagnosis and recommendations
          </p>
          
          <div className="space-y-4">
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Asset ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg border-2 border-border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={analyzing}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length < MAX_IMAGES && (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="asset-images"
                  disabled={analyzing}
                />
                <label htmlFor="asset-images" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Click to upload photos</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB each • {imagePreviews.length}/{MAX_IMAGES} uploaded
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            )}

            {imagePreviews.length > 0 && !analysis && (
              <Button 
                onClick={analyzeImages} 
                disabled={analyzing}
                className="w-full"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing {imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''}...
                  </>
                ) : (
                  <>Analyze Issue</>
                )}
              </Button>
            )}
          </div>
        </div>

        {analysis && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Summary Banner */}
            <div className={`p-4 rounded-lg border-2 ${getSeverityStyles(analysis.severity.level)}`}>
              <div className="flex items-start gap-3">
                {analysis.severity.safetyRisk ? (
                  <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 flex-shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold capitalize">{analysis.severity.level} Priority</span>
                    {analysis.severity.safetyRisk && (
                      <Badge variant="destructive">Safety Risk</Badge>
                    )}
                  </div>
                  <p className="text-sm">{analysis.summary}</p>
                </div>
              </div>
            </div>

            {/* Classification & Diagnosis */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-3">Issue Classification</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium capitalize">{analysis.issueClassification.primaryCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{analysis.issueClassification.issueType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Impact:</span>
                    <span className="font-medium capitalize">{analysis.severity.operationalImpact}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-3">Diagnosis</h4>
                <p className="text-sm mb-2">{analysis.diagnosis.likelyRootCause}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <Badge variant="outline" className="text-xs capitalize">{analysis.diagnosis.confidence}</Badge>
                </div>
              </div>
            </div>

            {/* Affected Components */}
            {analysis.affectedComponents.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Affected Components
                </h4>
                <div className="space-y-2">
                  {analysis.affectedComponents.map((component, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${getConditionStyles(component.condition)}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{component.name}</span>
                        <div className="flex gap-2">
                          <Badge className={getCriticalityBadge(component.criticality)} variant="outline">
                            {component.criticality.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="capitalize">{component.condition}</Badge>
                        </div>
                      </div>
                      {component.notes && <p className="text-sm">{component.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold mb-3 text-primary">Recommended Actions</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Immediate
                  </p>
                  <p className="text-sm text-muted-foreground">{analysis.recommendedAction.immediate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Short-Term (24-48 hours)
                  </p>
                  <p className="text-sm text-muted-foreground">{analysis.recommendedAction.shortTerm}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Long-Term Prevention
                  </p>
                  <p className="text-sm text-muted-foreground">{analysis.recommendedAction.longTerm}</p>
                </div>
              </div>
            </div>

            {/* Remote Resolution Steps */}
            {analysis.remoteResolutionPossible && analysis.remoteResolutionSteps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Video className="h-5 w-5 text-green-600" />
                  Self-Help Steps
                </h4>
                <div className="space-y-2">
                  {analysis.remoteResolutionSteps.map((step) => (
                    <div key={step.step} className="p-3 rounded-lg bg-muted border">
                      <div className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {step.step}
                        </span>
                        <div>
                          <p className="text-sm">{step.action}</p>
                          {step.safetyNote && (
                            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {step.safetyNote}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repair Estimate */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-3">Repair Estimate</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Complexity:</span>
                    <span className="font-medium capitalize">{analysis.estimatedRepair.complexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{analysis.estimatedRepair.estimatedDuration}</span>
                  </div>
                </div>
                {analysis.estimatedRepair.partsLikelyNeeded.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Parts Likely Needed:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.estimatedRepair.partsLikelyNeeded.map((part, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{part}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-3">Visual Assessment</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Visible Damage:</span>
                    <p className="font-medium">{analysis.visualAssessment.visibleDamage}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Maintenance State:</span>
                    <p className="font-medium capitalize">{analysis.visualAssessment.maintenanceState}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Base */}
            {analysis.knowledgeBaseRecommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Related Guides
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.knowledgeBaseRecommendations.map((topic, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="grid sm:grid-cols-2 gap-3 pt-4">
              {analysis.remoteResolutionPossible && (
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => onAnalysisComplete?.(analysis, imagePreviews)}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Schedule Remote Session
                </Button>
              )}
              <Button 
                size="lg"
                className="w-full"
                onClick={() => onAnalysisComplete?.(analysis, imagePreviews)}
              >
                <Phone className="mr-2 h-4 w-4" />
                {analysis.fieldVisitRequired ? 'Request Field Visit' : 'Get Expert Help'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AssetAnalysis;
