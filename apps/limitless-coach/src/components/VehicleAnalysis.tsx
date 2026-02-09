import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "packages/supabase-client/src";
import { compressImage } from "@/lib/imageCompression";

interface VehicleAnalysisProps {
  onAnalysisComplete?: (analysis: any, images: string[]) => void;
  requireAuth?: boolean;
}

interface AnalysisResult {
  vehicleType: string;
  vehicleCondition: string;
  cleanlinesScore: number;
  recommendedServices: Array<{
    service: string;
    reason: string;
    priority: string;
  }>;
  estimatedDuration: number;
  specialProducts: string[];
  recommendedAddOns?: Array<{
    name: string;
    price: number;
    reason: string;
    priority: string;
  }>;
  longTermBenefits?: {
    resaleValue: string;
    maintenanceSavings: string;
    longevity: string;
  };
  detailedAssessment: {
    exterior: string;
    interior: string;
    concerns: string[];
  };
}

const VehicleAnalysis = ({ onAnalysisComplete, requireAuth = false }: VehicleAnalysisProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { toast } = useToast();
  const MAX_IMAGES = 5;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check total number of images
    if (imagePreviews.length + files.length > MAX_IMAGES) {
      toast({
        title: "Too Many Images",
        description: `You can upload a maximum of ${MAX_IMAGES} images`,
        variant: "destructive",
      });
      return;
    }

    // Validate files
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
      // Process all files
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

      // Clear the input
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
      const { data, error } = await supabase.functions.invoke('analyze-vehicle', {
        body: { images: imagePreviews }
      });

      if (error) throw error;

      if (data.analysis) {
        setAnalysis(data.analysis);
        onAnalysisComplete?.(data.analysis, imagePreviews);
        
        toast({
          title: "Analysis Complete",
          description: "Your vehicle has been analyzed successfully",
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze vehicle",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getServiceLabel = (serviceType: string) => {
    const labels: Record<string, string> = {
      'basic-wash': 'Basic Wash',
      'standard-detail': 'Standard Detail',
      'premium-detail': 'Premium Detail',
      'full-detail': 'Full Detail'
    };
    return labels[serviceType] || serviceType;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200'
    };
    return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">AI Vehicle Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload 1-5 photos of your vehicle (exterior, interior, engine, etc.) for comprehensive service recommendations. No account required!
          </p>
          
          <div className="space-y-4">
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Vehicle ${index + 1}`} 
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
                  id="vehicle-images"
                  disabled={analyzing}
                />
                <label htmlFor="vehicle-images" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Click to upload vehicle photos</p>
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
                  <>Analyze {imagePreviews.length} Image{imagePreviews.length > 1 ? 's' : ''}</>
                )}
              </Button>
            )}
          </div>
        </div>

        {analysis && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Vehicle Type</p>
                <p className="text-lg font-semibold capitalize">{analysis.vehicleType}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Condition</p>
                <p className="text-lg font-semibold capitalize">{analysis.vehicleCondition}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Cleanliness Score</p>
                <p className="text-lg font-semibold">{analysis.cleanlinesScore}/10</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Est. Duration</p>
                <p className="text-lg font-semibold">{analysis.estimatedDuration} mins</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recommended Services
              </h4>
              <div className="space-y-2">
                {analysis.recommendedServices.map((service, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${getPriorityColor(service.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{getServiceLabel(service.service)}</p>
                        <p className="text-sm mt-1">{service.reason}</p>
                      </div>
                      <span className="text-xs font-semibold uppercase px-2 py-1 rounded">
                        {service.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {analysis.specialProducts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Special Products Needed</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.specialProducts.map((product, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                    >
                      {product}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.longTermBenefits && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h4 className="font-semibold mb-3 text-primary">Long-Term Investment Benefits</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">💰 Resale Value Protection</p>
                    <p className="text-sm text-muted-foreground">{analysis.longTermBenefits.resaleValue}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">🔧 Maintenance Cost Savings</p>
                    <p className="text-sm text-muted-foreground">{analysis.longTermBenefits.maintenanceSavings}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">⏱️ Extended Vehicle Longevity</p>
                    <p className="text-sm text-muted-foreground">{analysis.longTermBenefits.longevity}</p>
                  </div>
                </div>
              </div>
            )}

            {analysis.recommendedAddOns && analysis.recommendedAddOns.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Recommended Add-Ons</h4>
                <div className="space-y-2">
                  {analysis.recommendedAddOns.map((addon, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        addon.priority === 'recommended' 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-muted border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{addon.name}</p>
                            <span className="text-lg font-semibold text-primary">${addon.price}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{addon.reason}</p>
                        </div>
                        {addon.priority === 'recommended' && (
                          <span className="text-xs font-semibold uppercase px-2 py-1 rounded bg-primary/10 text-primary ml-2">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Detailed Assessment</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Exterior</p>
                  <p className="text-sm">{analysis.detailedAssessment.exterior}</p>
                </div>
                {analysis.detailedAssessment.interior && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Interior</p>
                    <p className="text-sm">{analysis.detailedAssessment.interior}</p>
                  </div>
                )}
                {analysis.detailedAssessment.concerns.length > 0 && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Areas of Concern
                    </p>
                    <ul className="text-sm space-y-1">
                      {analysis.detailedAssessment.concerns.map((concern, idx) => (
                        <li key={idx} className="text-destructive">• {concern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={() => onAnalysisComplete?.(analysis, imagePreviews)}
              size="lg"
              className="w-full"
            >
              Book Service Now
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VehicleAnalysis;
