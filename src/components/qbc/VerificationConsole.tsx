import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, Shield, AlertTriangle, XCircle } from "lucide-react";

export const VerificationConsole = () => {
  const [gioInput, setGioInput] = useState("");
  const [expectedText, setExpectedText] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!gioInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste a GIO payload to verify",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const gio = JSON.parse(gioInput);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("qbc-verify", {
        body: { 
          gio, 
          expectedText: expectedText || undefined,
          sourceContext: "qbc_studio" 
        },
      });

      if (response.error) throw response.error;

      setResult(response.data);

      toast({
        title: response.data.verified ? "Verification Passed" : "Verification Issues",
        description: response.data.tamperingDetected 
          ? "Potential tampering detected!" 
          : "GIO integrity check complete",
        variant: response.data.tamperingDetected ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid GIO format",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="verify-input">GIO Payload</Label>
        <Textarea
          id="verify-input"
          placeholder='Paste GIO JSON to verify integrity...'
          value={gioInput}
          onChange={(e) => setGioInput(e.target.value)}
          className="mt-2 min-h-[120px] font-mono text-xs"
        />
      </div>

      <div>
        <Label htmlFor="expected-text">Expected Text (Optional)</Label>
        <Input
          id="expected-text"
          placeholder="Enter expected decoded text for additional verification"
          value={expectedText}
          onChange={(e) => setExpectedText(e.target.value)}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          If provided, will verify that the GIO decodes to this exact text
        </p>
      </div>

      <Button
        onClick={handleVerify}
        disabled={isVerifying || !gioInput.trim()}
        className="w-full"
      >
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            Verify GIO Integrity
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-4">
          {/* Main Status */}
          <div className={`p-4 rounded-lg border ${
            result.verified 
              ? "bg-green-500/10 border-green-500/20" 
              : result.tamperingDetected 
                ? "bg-red-500/10 border-red-500/20"
                : "bg-amber-500/10 border-amber-500/20"
          }`}>
            <div className="flex items-center gap-3">
              {result.verified ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : result.tamperingDetected ? (
                <XCircle className="h-8 w-8 text-red-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              )}
              <div>
                <h4 className="font-semibold text-lg">
                  {result.verified 
                    ? "Verification Passed" 
                    : result.tamperingDetected 
                      ? "Tampering Detected!" 
                      : "Verification Incomplete"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {result.verified 
                    ? "GIO integrity confirmed - no tampering detected"
                    : result.tamperingDetected
                      ? "The GIO may have been modified since creation"
                      : "Some verification checks could not be completed"}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h5 className="font-semibold">Verification Details</h5>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">GIO Structure:</span>
                <span className={`flex items-center gap-1 ${result.gioIntegrity ? "text-green-600" : "text-red-600"}`}>
                  {result.gioIntegrity ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {result.gioIntegrity ? "Valid" : "Invalid"}
                </span>
              </div>
              
              {result.hashMatch !== undefined && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hash Match:</span>
                  <span className={`flex items-center gap-1 ${result.hashMatch ? "text-green-600" : "text-red-600"}`}>
                    {result.hashMatch ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {result.hashMatch ? "Matched" : "Mismatch"}
                  </span>
                </div>
              )}

              {result.textMatch !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Text Match:</span>
                  <span className={`flex items-center gap-1 ${result.textMatch ? "text-green-600" : "text-red-600"}`}>
                    {result.textMatch ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {result.textMatch ? "Matched" : "Mismatch"}
                  </span>
                </div>
              )}
            </div>

            {/* Details List */}
            {result.details && result.details.length > 0 && (
              <div className="mt-4">
                <Label className="text-muted-foreground">Audit Log</Label>
                <ul className="mt-2 space-y-1">
                  {result.details.map((detail: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
