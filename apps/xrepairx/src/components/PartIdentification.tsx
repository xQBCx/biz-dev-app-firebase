import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Camera, 
  Loader2, 
  Scan, 
  Printer, 
  Package, 
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  Layers
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressImage } from "@/lib/imageCompression";

interface PrintSpecifications {
  recommendedMaterial: string;
  infillPercent: number;
  layerHeight: number;
  supportsNeeded: boolean;
  estimatedPrintTimeMinutes: number;
  estimatedMaterialGrams: number;
}

interface IdentifiedPart {
  partName: string;
  partType: string;
  manufacturer: string | null;
  modelNumber: string | null;
  confidenceScore: number;
  description: string;
  dimensions: {
    estimatedWidth: string;
    estimatedHeight: string;
    estimatedDepth: string;
  };
  material: string;
  condition: string;
  failureMode: string;
  canPrintInField: boolean;
  printComplexity: 'low' | 'medium' | 'high';
  recommendedAction: 'print_now' | 'order_oem' | 'custom_design_needed' | 'repair_existing';
  actionRationale: string;
  matchedCadIds: string[];
  printSpecifications: PrintSpecifications | null;
  alternativeParts: Array<{
    name: string;
    source: string;
    estimatedCost: string;
    leadTime: string;
  }>;
  safetyConsiderations: string[];
  installationNotes: string;
}

interface PartIdentificationProps {
  onIdentificationComplete?: (result: IdentifiedPart) => void;
  onRequestPrint?: (result: IdentifiedPart) => void;
  assetType?: string;
  componentType?: string;
  workOrderId?: string;
}

export const PartIdentification = ({
  onIdentificationComplete,
  onRequestPrint,
  assetType,
  componentType,
  workOrderId
}: PartIdentificationProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IdentifiedPart | null>(null);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 4 - images.length); i++) {
      try {
        const compressed = await compressImage(files[i]);
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = () => {
            newImages.push(reader.result as string);
            resolve();
          };
          reader.readAsDataURL(compressed);
        });
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }
    setImages(prev => [...prev, ...newImages].slice(0, 4));
  }, [images.length]);

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const analyzePart = async () => {
    if (images.length === 0) {
      toast.error("Please upload at least one image of the part");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('identify-part', {
        body: {
          imageUrls: images,
          description,
          assetType,
          componentType
        }
      });

      if (error) throw error;

      if (data.success && data.identification) {
        setResult(data.identification);
        onIdentificationComplete?.(data.identification);
        toast.success(`Identified: ${data.identification.partName}`);
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Part identification error:", error);
      toast.error("Failed to identify part. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'print_now': return <Printer className="h-5 w-5" />;
      case 'order_oem': return <Package className="h-5 w-5" />;
      case 'custom_design_needed': return <Cpu className="h-5 w-5" />;
      case 'repair_existing': return <Wrench className="h-5 w-5" />;
      default: return <Scan className="h-5 w-5" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'print_now': return 'Ready to Print';
      case 'order_oem': return 'Order OEM Part';
      case 'custom_design_needed': return 'Custom Design Needed';
      case 'repair_existing': return 'Repair Existing';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'print_now': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'order_oem': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'custom_design_needed': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'repair_existing': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-500/10 text-green-500';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500';
      case 'high': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            AI Part Identification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                <img src={img} alt={`Part ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          {/* Description */}
          <Textarea
            placeholder="Describe the problem or what you're looking at... (optional but helps accuracy)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          {/* Analyze Button */}
          <Button 
            onClick={analyzePart} 
            disabled={images.length === 0 || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing Part...
              </>
            ) : (
              <>
                <Scan className="mr-2 h-5 w-5" />
                Identify Part
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {/* Main Identification Card */}
          <Card className="border-primary/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{result.partName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                </div>
                <Badge variant="outline" className={getActionColor(result.recommendedAction)}>
                  {getActionIcon(result.recommendedAction)}
                  <span className="ml-2">{getActionLabel(result.recommendedAction)}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Confidence Score */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Identification Confidence</span>
                  <span className="font-medium">{result.confidenceScore}%</span>
                </div>
                <Progress value={result.confidenceScore} className="h-2" />
              </div>

              {/* Part Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Part Type</span>
                  <p className="font-medium capitalize">{result.partType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Material</span>
                  <p className="font-medium">{result.material}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Condition</span>
                  <p className="font-medium">{result.condition}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Dimensions</span>
                  <p className="font-medium text-sm">
                    {result.dimensions.estimatedWidth} × {result.dimensions.estimatedHeight} × {result.dimensions.estimatedDepth}
                  </p>
                </div>
              </div>

              {/* Manufacturer Info */}
              {(result.manufacturer || result.modelNumber) && (
                <div className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                  {result.manufacturer && (
                    <div>
                      <span className="text-xs text-muted-foreground">Manufacturer</span>
                      <p className="font-medium">{result.manufacturer}</p>
                    </div>
                  )}
                  {result.modelNumber && (
                    <div>
                      <span className="text-xs text-muted-foreground">Model/Part #</span>
                      <p className="font-medium font-mono">{result.modelNumber}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Failure Analysis */}
              <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <span className="text-xs font-medium text-destructive">Failure Analysis</span>
                <p className="text-sm mt-1">{result.failureMode}</p>
              </div>

              {/* Action Rationale */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <span className="text-xs font-medium text-primary">Recommended Action</span>
                <p className="text-sm mt-1">{result.actionRationale}</p>
              </div>
            </CardContent>
          </Card>

          {/* Print Specifications Card */}
          {result.canPrintInField && result.printSpecifications && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <Printer className="h-5 w-5" />
                  3D Print Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getComplexityColor(result.printComplexity)}>
                    <Layers className="h-3 w-3 mr-1" />
                    {result.printComplexity.toUpperCase()} Complexity
                  </Badge>
                  {result.printSpecifications.supportsNeeded && (
                    <Badge variant="outline">Supports Required</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Material</span>
                    <p className="font-medium">{result.printSpecifications.recommendedMaterial}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Infill</span>
                    <p className="font-medium">{result.printSpecifications.infillPercent}%</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Layer Height</span>
                    <p className="font-medium">{result.printSpecifications.layerHeight}mm</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Est. Print Time
                    </span>
                    <p className="font-medium">
                      {Math.floor(result.printSpecifications.estimatedPrintTimeMinutes / 60)}h {result.printSpecifications.estimatedPrintTimeMinutes % 60}m
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Material Usage</span>
                    <p className="font-medium">{result.printSpecifications.estimatedMaterialGrams}g</p>
                  </div>
                </div>

                <Button 
                  onClick={() => onRequestPrint?.(result)} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Request Print Job
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Safety Considerations */}
          {result.safetyConsiderations.length > 0 && (
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  Safety Considerations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.safetyConsiderations.map((note, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      {note}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Alternative Parts */}
          {result.alternativeParts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Alternative Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.alternativeParts.map((alt, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{alt.name}</p>
                        <p className="text-sm text-muted-foreground">{alt.source}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{alt.estimatedCost}</p>
                        <p className="text-sm text-muted-foreground">{alt.leadTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Installation Notes */}
          {result.installationNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Installation Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{result.installationNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
