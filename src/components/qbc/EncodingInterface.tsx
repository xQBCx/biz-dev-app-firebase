import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Copy, Download, Loader2 } from "lucide-react";

interface EncodingInterfaceProps {
  onEncode?: (gio: any) => void;
}

export const EncodingInterface = ({ onEncode }: EncodingInterfaceProps) => {
  const [inputText, setInputText] = useState("");
  const [isEncoding, setIsEncoding] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleEncode = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text to encode",
        variant: "destructive",
      });
      return;
    }

    setIsEncoding(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("qbc-encode", {
        body: { text: inputText, sourceContext: "qbc_studio" },
      });

      if (response.error) throw response.error;

      setResult(response.data);
      onEncode?.(response.data.gio);

      toast({
        title: "Encoding Complete",
        description: `Text encoded to ${response.data.gio.paths.length} geometric paths`,
      });
    } catch (error) {
      console.error("Encoding error:", error);
      toast({
        title: "Encoding Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsEncoding(false);
    }
  };

  const copyGIO = () => {
    if (result?.gio) {
      navigator.clipboard.writeText(JSON.stringify(result.gio, null, 2));
      toast({ title: "Copied", description: "GIO copied to clipboard" });
    }
  };

  const downloadSVG = () => {
    if (result?.svg) {
      const blob = new Blob([result.svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qbc-encoded-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="encode-input">Text to Encode</Label>
        <Textarea
          id="encode-input"
          placeholder="Enter text to encode using Metatron's Cube lattice..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="mt-2 min-h-[100px] font-mono"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Characters will be mapped to geometric paths through the lattice
        </p>
      </div>

      <Button
        onClick={handleEncode}
        disabled={isEncoding || !inputText.trim()}
        className="w-full"
      >
        {isEncoding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Encoding...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Encode to GIO
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Encoding Result</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyGIO}>
                <Copy className="h-4 w-4 mr-1" />
                Copy GIO
              </Button>
              <Button size="sm" variant="outline" onClick={downloadSVG}>
                <Download className="h-4 w-4 mr-1" />
                SVG
              </Button>
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Content Hash:</span>
              <code className="font-mono text-xs bg-background px-2 py-1 rounded">
                {result.contentHash?.slice(0, 16)}...
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paths Generated:</span>
              <span className="font-semibold">{result.gio?.paths?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lattice Type:</span>
              <span className="font-semibold">{result.gio?.latticeType || "metatron_cube"}</span>
            </div>
          </div>

          {/* GIO Preview */}
          <div>
            <Label>GIO Payload (JSON)</Label>
            <pre className="mt-2 p-3 bg-background rounded text-xs overflow-x-auto max-h-[200px]">
              {JSON.stringify(result.gio, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
