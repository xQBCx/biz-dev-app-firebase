import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload, FileText, Loader2, Brain } from "lucide-react";

interface BillUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const BILL_TYPES = [
  { value: "utility", label: "Utility (Electric, Gas, Water)" },
  { value: "telecom", label: "Telecom (Phone, Internet)" },
  { value: "saas", label: "SaaS / Software" },
  { value: "materials", label: "Materials / Supplies" },
  { value: "ingredients", label: "Ingredients / Food" },
  { value: "construction", label: "Construction" },
  { value: "other", label: "Other" },
];

const AI_MODELS = [
  { value: "gemini-flash", label: "Gemini Flash (Fast)", description: "Quick analysis, low cost" },
  { value: "gemini-pro", label: "Gemini Pro", description: "Deep analysis, higher accuracy" },
  { value: "gpt-5", label: "GPT-5", description: "Most powerful, best reasoning" },
  { value: "gpt-5-mini", label: "GPT-5 Mini", description: "Balanced speed & quality" },
];

export function BillUploadDialog({ open, onOpenChange, userId }: BillUploadDialogProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [billName, setBillName] = useState("");
  const [billType, setBillType] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(["gemini-flash"]);
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !billName || !billType) {
        throw new Error("Please fill in all required fields");
      }

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("bills")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("bills")
        .getPublicUrl(filePath);

      // Create bill record
      const { data: bill, error: insertError } = await supabase
        .from("company_bills")
        .insert({
          user_id: userId,
          bill_name: billName,
          bill_type: billType,
          vendor_name: vendorName || null,
          amount: amount ? parseFloat(amount) : null,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          status: autoAnalyze ? "analyzing" : "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Trigger AI analysis if enabled
      if (autoAnalyze && bill) {
        const { error: analyzeError } = await supabase.functions.invoke("analyze-bill", {
          body: {
            billId: bill.id,
            analysisType: "extraction",
            models: selectedModels,
          },
        });

        if (analyzeError) {
          console.error("Analysis error:", analyzeError);
          toast.error("Bill uploaded but analysis failed");
        }
      }

      return bill;
    },
    onSuccess: () => {
      toast.success("Bill uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["company-bills"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    },
  });

  const resetForm = () => {
    setFile(null);
    setBillName("");
    setBillType("");
    setVendorName("");
    setAmount("");
    setSelectedModels(["gemini-flash"]);
    setAutoAnalyze(true);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!billName) {
        setBillName(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  }, [billName]);

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model)
        ? prev.filter((m) => m !== model)
        : [...prev, model]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Bill</DialogTitle>
          <DialogDescription>
            Upload a bill for AI-powered analysis and optimization recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop a file or click to browse
                </p>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      if (!billName) setBillName(f.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="max-w-xs mx-auto"
                />
              </>
            )}
          </div>

          {/* Bill Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="billName">Bill Name *</Label>
              <Input
                id="billName"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                placeholder="e.g., Electric Bill - January 2024"
              />
            </div>

            <div>
              <Label htmlFor="billType">Bill Type *</Label>
              <Select value={billType} onValueChange={setBillType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {BILL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="vendor">Vendor Name</Label>
              <Input
                id="vendor"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g., Duke Energy"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* AI Analysis Options */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Checkbox
                id="autoAnalyze"
                checked={autoAnalyze}
                onCheckedChange={(checked) => setAutoAnalyze(!!checked)}
              />
              <Label htmlFor="autoAnalyze" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Auto-analyze with AI
              </Label>
            </div>

            {autoAnalyze && (
              <div className="space-y-2 pl-6">
                <Label className="text-sm text-muted-foreground">Select AI Models</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AI_MODELS.map((model) => (
                    <div
                      key={model.value}
                      onClick={() => toggleModel(model.value)}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedModels.includes(model.value)
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <p className="text-sm font-medium">{model.label}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={!file || !billName || !billType || uploadMutation.isPending}
            className="w-full"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {autoAnalyze ? "& Analyze" : "Bill"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
