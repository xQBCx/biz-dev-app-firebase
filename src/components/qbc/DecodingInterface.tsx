import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Unlock, Loader2, CheckCircle, XCircle } from "lucide-react";

export const DecodingInterface = () => {
  const [gioInput, setGioInput] = useState("");
  const [isDecoding, setIsDecoding] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleDecode = async () => {
    if (!gioInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please paste a GIO payload to decode",
        variant: "destructive",
      });
      return;
    }

    setIsDecoding(true);
    try {
      const gio = JSON.parse(gioInput);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("qbc-decode", {
        body: { gio, sourceContext: "qbc_studio" },
      });

      if (response.error) throw response.error;

      setResult(response.data);

      toast({
        title: "Decoding Complete",
        description: response.data.verified 
          ? "GIO decoded and verified successfully" 
          : "GIO decoded (verification not available)",
      });
    } catch (error) {
      console.error("Decoding error:", error);
      toast({
        title: "Decoding Failed",
        description: error instanceof Error ? error.message : "Invalid GIO format",
        variant: "destructive",
      });
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="decode-input">GIO Payload</Label>
        <Textarea
          id="decode-input"
          placeholder='Paste GIO JSON here (e.g., {"paths": [...], "vertices": [...], ...})'
          value={gioInput}
          onChange={(e) => setGioInput(e.target.value)}
          className="mt-2 min-h-[150px] font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Paste the complete GIO payload from an encoding operation
        </p>
      </div>

      <Button
        onClick={handleDecode}
        disabled={isDecoding || !gioInput.trim()}
        className="w-full"
      >
        {isDecoding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Decoding...
          </>
        ) : (
          <>
            <Unlock className="mr-2 h-4 w-4" />
            Decode GIO
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Decoding Result</h4>
            <div className="flex items-center gap-2">
              {result.verified ? (
                <span className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center text-amber-600 text-sm">
                  <XCircle className="h-4 w-4 mr-1" />
                  Unverified
                </span>
              )}
            </div>
          </div>

          {/* Decoded Text */}
          <div className="p-4 bg-background rounded-lg border">
            <Label className="text-muted-foreground">Decoded Text</Label>
            <p className="mt-2 text-xl font-semibold break-all">
              {result.text}
            </p>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Content Hash:</span>
              <code className="font-mono text-xs bg-background px-2 py-1 rounded">
                {result.contentHash?.slice(0, 16)}...
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lattice Type:</span>
              <span className="font-semibold">{result.latticeType || "metatron_cube"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Decoded At:</span>
              <span className="font-semibold">
                {new Date(result.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
