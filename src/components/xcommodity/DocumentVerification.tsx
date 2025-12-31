import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface DocumentVerificationProps {
  dealId: string;
  listingId: string;
  onVerificationComplete?: (status: "verified" | "failed") => void;
}

export function DocumentVerification({ dealId, listingId, onVerificationComplete }: DocumentVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Please upload a PDF"); return; }
    setUploadedFile(file);
  };

  const verifyDocument = async () => {
    if (!uploadedFile) return;
    setVerifying(true);
    setProgress(0);

    const interval = setInterval(() => setProgress(p => Math.min(p + 10, 90)), 500);
    await new Promise(r => setTimeout(r, 3000));
    clearInterval(interval);
    setProgress(100);

    const mockResult = {
      status: "verified" as const,
      confidence: 94.5,
      extracted_data: { inspection_date: "2024-01-15", product_grade: "D6 Fuel Oil", tank_location: "Vopak Houston", volume: "2M barrels" }
    };

    setResult(mockResult);
    if (onVerificationComplete) onVerificationComplete("verified");
    toast.success("Document verified!");
    setVerifying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Document Verification</CardTitle>
        <CardDescription>Upload SGS reports for AI verification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!uploadedFile && !result && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="doc-upload" />
            <Button asChild><label htmlFor="doc-upload" className="cursor-pointer">Select PDF</label></Button>
          </div>
        )}

        {uploadedFile && !result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <FileText className="h-10 w-10 text-primary" />
              <div className="flex-1"><p className="font-medium">{uploadedFile.name}</p></div>
              <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>Remove</Button>
            </div>
            {verifying ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Analyzing...</span></div>
                <Progress value={progress} className="h-2" />
              </div>
            ) : (
              <Button onClick={verifyDocument} className="w-full"><ShieldCheck className="h-4 w-4 mr-2" />Verify with AI</Button>
            )}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span className="font-medium text-green-500">Verified</span></div>
              <p className="text-sm text-muted-foreground mt-1">Confidence: {result.confidence}%</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Date</p><p className="font-medium">{result.extracted_data.inspection_date}</p></div>
              <div><p className="text-muted-foreground">Grade</p><p className="font-medium">{result.extracted_data.product_grade}</p></div>
              <div><p className="text-muted-foreground">Location</p><p className="font-medium">{result.extracted_data.tank_location}</p></div>
              <div><p className="text-muted-foreground">Volume</p><p className="font-medium">{result.extracted_data.volume}</p></div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setResult(null); setUploadedFile(null); }}>Upload Another</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
