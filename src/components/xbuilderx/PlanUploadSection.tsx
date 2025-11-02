import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, Zap, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlanUploadSectionProps {
  projectId: string;
  onExtractionComplete: (data: any) => void;
}

export function PlanUploadSection({ projectId, onExtractionComplete }: PlanUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to Supabase Storage
      const fileName = `${projectId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("construction-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      setProgress(30);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("construction-documents")
        .getPublicUrl(fileName);

      // Create document record
      const { data: document, error: docError } = await supabase
        .from("construction_documents")
        .insert({
          project_id: projectId,
          user_id: user.id,
          title: file.name,
          file_type: file.type,
          file_url: publicUrl,
          version: 1
        })
        .select()
        .single();

      if (docError) throw docError;
      setProgress(50);

      // Extract data with AI
      setExtracting(true);
      const { data: extractData, error: extractError } = await supabase.functions.invoke(
        "extract-plan-data",
        {
          body: {
            documentId: document.id,
            documentUrl: publicUrl,
            extractionType: "full"
          }
        }
      );

      if (extractError) throw extractError;
      setProgress(100);

      toast({
        title: "Success!",
        description: `Extracted ${extractData.extractedData?.systems?.length || 0} systems from plans`
      });

      onExtractionComplete(extractData.extractedData);

    } catch (error) {
      console.error("Upload/extraction error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setExtracting(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Plans
        </CardTitle>
        <CardDescription>
          Upload construction plans for AI-powered takeoff extraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(uploading || extracting) ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {extracting ? (
                  <>
                    <Zap className="h-4 w-4 animate-pulse text-primary" />
                    AI extracting quantities...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 animate-pulse text-primary" />
                    Uploading...
                  </>
                )}
              </span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">Drop plans here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DWG, DXF formats
              </p>
            </div>
            <input
              type="file"
              accept=".pdf,.dwg,.dxf"
              onChange={handleFileUpload}
              className="hidden"
              id="plan-upload"
            />
            <Button
              onClick={() => document.getElementById("plan-upload")?.click()}
              className="cursor-pointer"
            >
              Select Files
            </Button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Plans Uploaded</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Systems Detected</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Items Extracted</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
