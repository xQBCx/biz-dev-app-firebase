import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, Users, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ImportStats {
  totalContactsParsed: number;
  uniqueCompanies: number;
  companiesCreated: number;
  companiesExisted: number;
  contactsCreated: number;
}

interface PDFContactImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PDFContactImport({ open, onOpenChange, onSuccess }: PDFContactImportProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'processing' | 'complete' | 'error'>('upload');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setStep('processing');
    setProgress(10);
    setStatusMessage('Reading PDF file...');

    try {
      // Read file as text - the edge function will parse it
      const text = await file.text();
      
      setProgress(30);
      setStatusMessage('Parsing contact data...');

      // For now, we'll send the raw content
      // The edge function handles the parsing
      const response = await supabase.functions.invoke('import-contacts-pdf', {
        body: {
          parsedContent: text,
          userId: user.id,
          clientId: null
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Import failed');
      }

      setProgress(100);
      setStatusMessage('Import complete!');
      setStats(response.data.stats);
      setStep('complete');
      
      toast.success(`Successfully imported ${response.data.stats.contactsCreated} contacts`);
      onSuccess?.();

    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during import');
      setStep('error');
      toast.error('Import failed');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setProgress(0);
    setStatusMessage('');
    setStats(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Contacts from PDF
          </DialogTitle>
          <DialogDescription>
            Upload a PDF containing contact information. Companies will be automatically created and contacts linked.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {step === 'upload' && (
            <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-primary/50 transition-colors">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop your PDF or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports contact lists with: Name, Company, Phone, Title, Email, State, Country
                </p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="pointer-events-none">
                Select PDF File
              </Button>
            </div>
          )}

          {step === 'processing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">{statusMessage}</p>
              <p className="text-center text-xs text-muted-foreground">
                This may take a few minutes for large files...
              </p>
            </div>
          )}

          {step === 'complete' && stats && (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.contactsCreated}</p>
                  <p className="text-sm text-muted-foreground">Contacts Imported</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.companiesCreated}</p>
                  <p className="text-sm text-muted-foreground">Companies Created</p>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p>Total parsed: {stats.totalContactsParsed} contacts</p>
                <p>Unique companies: {stats.uniqueCompanies}</p>
                <p>Existing companies matched: {stats.companiesExisted}</p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <AlertCircle className="h-16 w-16 text-destructive" />
              </div>
              <p className="text-center text-sm text-destructive">{error}</p>
              <Button onClick={() => setStep('upload')} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
