import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Check, X } from "lucide-react";
import { toast } from "sonner";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: Record<string, string>[]) => Promise<void>;
  requiredFields: { key: string; label: string }[];
  optionalFields?: { key: string; label: string }[];
  title: string;
  description: string;
}

export function CSVImportDialog({
  open,
  onOpenChange,
  onImport,
  requiredFields,
  optionalFields = [],
  title,
  description,
}: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "map">("upload");

  const parseCSV = useCallback((text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const data = lines.slice(1).map((line) => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });

    return { headers, data };
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Please upload a CSV file");
        return;
      }

      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const { headers, data } = parseCSV(text);
        setCsvHeaders(headers);
        setCsvData(data);
        setStep("map");

        // Auto-map matching columns
        const autoMappings: Record<string, string> = {};
        [...requiredFields, ...optionalFields].forEach((field) => {
          const match = headers.find(
            (h) =>
              h.toLowerCase() === field.key.toLowerCase() ||
              h.toLowerCase().replace(/[_\s]/g, "") ===
                field.key.toLowerCase().replace(/[_\s]/g, "")
          );
          if (match) {
            autoMappings[field.key] = match;
          }
        });
        setMappings(autoMappings);
      };
      reader.readAsText(selectedFile);
    },
    [parseCSV, requiredFields, optionalFields]
  );

  const handleImport = async () => {
    const missingRequired = requiredFields.filter((f) => !mappings[f.key]);
    if (missingRequired.length > 0) {
      toast.error(`Missing required mappings: ${missingRequired.map((f) => f.label).join(", ")}`);
      return;
    }

    setIsImporting(true);
    try {
      const importData = csvData.map((row) => {
        const record: Record<string, string> = {};
        [...requiredFields, ...optionalFields].forEach((field) => {
          const headerIndex = csvHeaders.indexOf(mappings[field.key]);
          if (headerIndex !== -1) {
            record[field.key] = row[headerIndex] || "";
          }
        });
        return record;
      });

      await onImport(importData);
      toast.success(`Successfully imported ${importData.length} records`);
      handleClose();
    } catch (error) {
      toast.error("Failed to import data");
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setMappings({});
    setStep("upload");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("csv-upload")?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your CSV file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">Supports .csv files</p>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{file?.name}</span>
              <span className="text-xs text-muted-foreground">
                ({csvData.length} rows)
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 w-6 p-0"
                onClick={() => setStep("upload")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              <p className="text-sm font-medium">Map CSV columns to fields</p>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Required Fields</p>
                {requiredFields.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <Label className="w-32 text-sm flex items-center gap-1">
                      {field.label}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={mappings[field.key] || ""}
                      onValueChange={(value) =>
                        setMappings((prev) => ({ ...prev, [field.key]: value }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvHeaders.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {mappings[field.key] && (
                      <Check className="h-4 w-4 text-success" />
                    )}
                  </div>
                ))}
              </div>

              {optionalFields.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground font-medium">Optional Fields</p>
                  {optionalFields.map((field) => (
                    <div key={field.key} className="flex items-center gap-3">
                      <Label className="w-32 text-sm">{field.label}</Label>
                      <Select
                        value={mappings[field.key] || ""}
                        onValueChange={(value) =>
                          setMappings((prev) => ({ ...prev, [field.key]: value }))
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {csvHeaders.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mappings[field.key] && (
                        <Check className="h-4 w-4 text-success" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? "Importing..." : `Import ${csvData.length} Records`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
