import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, CheckCircle, AlertCircle, Users, Building2, Sparkles, Eye, ArrowLeft, Mail, Phone, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { toast } from "sonner";

interface PreviewContact {
  firstName: string;
  lastName: string;
  companyName: string;
  businessPhone: string;
  title: string;
  email: string;
  state: string;
  country: string;
  confidence: number;
}

interface PreviewStats {
  totalContactsParsed: number;
  withEmail: number;
  withPhone: number;
  withCompany: number;
  avgConfidence: number;
}

interface ImportStats {
  totalContactsParsed: number;
  uniqueCompanies: number;
  companiesCreated: number;
  companiesExisted: number;
  contactsCreated: number;
  skippedDuplicates?: number;
  skippedNoEmail?: number;
}

interface PDFContactImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PDFContactImport({ open, onOpenChange, onSuccess }: PDFContactImportProps) {
  const { user } = useAuth();
  const { activeClientId } = useActiveClient();
  const [step, setStep] = useState<'upload' | 'processing' | 'preview' | 'importing' | 'complete' | 'error'>('upload');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewContacts, setPreviewContacts] = useState<PreviewContact[]>([]);
  const [previewStats, setPreviewStats] = useState<PreviewStats | null>(null);
  const [totalPreviewCount, setTotalPreviewCount] = useState(0);
  const [parsedContent, setParsedContent] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleStartPreview = async () => {
    if (!selectedFile || !user) return;

    setStep('processing');
    setProgress(5);
    setStatusMessage('Reading PDF file...');

    try {
      const text = await selectedFile.text();
      setParsedContent(text);
      
      setProgress(15);
      setStatusMessage(useAI ? 'Using AI to extract contacts...' : 'Parsing contact data...');

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 2;
        });
      }, 2000);

      const response = await supabase.functions.invoke('import-contacts-pdf', {
        body: {
          parsedContent: text,
          userId: user.id,
          clientId: activeClientId || null,
          useAI,
          previewOnly: true
        }
      });

      clearInterval(progressInterval);

      if (response.error) {
        throw new Error(response.error.message || 'Preview failed');
      }

      if (!response.data.success) {
        throw new Error(response.data.error || 'No contacts found');
      }

      setPreviewContacts(response.data.contacts || []);
      setPreviewStats(response.data.stats || null);
      setTotalPreviewCount(response.data.totalCount || 0);
      setProgress(100);
      setStep('preview');

    } catch (err) {
      console.error('Preview error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during preview');
      setStep('error');
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedContent || !user) return;

    setStep('importing');
    setProgress(10);
    setStatusMessage('Importing contacts...');

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
      }, 1000);

      const response = await supabase.functions.invoke('import-contacts-pdf', {
        body: {
          parsedContent,
          userId: user.id,
          clientId: activeClientId || null,
          useAI,
          previewOnly: false
        }
      });

      clearInterval(progressInterval);

      if (response.error) {
        throw new Error(response.error.message || 'Import failed');
      }

      if (!response.data.success && response.data.error) {
        throw new Error(response.data.error);
      }

      setProgress(100);
      setStatusMessage('Import complete!');
      setStats(response.data.stats);
      setStep('complete');
      
      const imported = response.data.stats.contactsCreated;
      const companies = response.data.stats.companiesCreated;
      toast.success(`Imported ${imported} contacts and ${companies} companies`);
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
    setSelectedFile(null);
    setPreviewContacts([]);
    setPreviewStats(null);
    setParsedContent('');
    onOpenChange(false);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return <Badge className="bg-green-500/20 text-green-600">High</Badge>;
    if (confidence >= 60) return <Badge className="bg-yellow-500/20 text-yellow-600">Medium</Badge>;
    return <Badge className="bg-orange-500/20 text-orange-600">Low</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={step === 'preview' ? "sm:max-w-4xl" : "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Contacts from PDF
          </DialogTitle>
          <DialogDescription>
            {step === 'preview' 
              ? 'Review the extracted contacts before importing'
              : 'Upload a PDF containing contact information'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="relative flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-primary/50 transition-colors">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedFile ? selectedFile.name : 'Drag & drop your PDF or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports contact lists with: Name, Company, Phone, Title, Email
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="pointer-events-none">
                  {selectedFile ? 'Change File' : 'Select PDF File'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="ai-mode" className="font-medium">AI-Powered Extraction</Label>
                    <p className="text-xs text-muted-foreground">
                      Use AI for better accuracy with complex documents
                    </p>
                  </div>
                </div>
                <Switch
                  id="ai-mode"
                  checked={useAI}
                  onCheckedChange={setUseAI}
                />
              </div>

              {selectedFile && (
                <Button 
                  onClick={handleStartPreview} 
                  className="w-full"
                  size="lg"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Contacts
                </Button>
              )}
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

          {step === 'preview' && (
            <div className="space-y-4">
              {/* Stats summary */}
              {previewStats && (
                <div className="grid grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalPreviewCount}</div>
                    <div className="text-xs text-muted-foreground">Total Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{previewStats.withEmail}</div>
                    <div className="text-xs text-muted-foreground">With Email</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{previewStats.withPhone}</div>
                    <div className="text-xs text-muted-foreground">With Phone</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{previewStats.withCompany}</div>
                    <div className="text-xs text-muted-foreground">With Company</div>
                  </div>
                </div>
              )}

              {/* Important note about email requirement */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-600">
                  <strong>Note:</strong> Only contacts with valid email addresses will be imported ({previewStats?.withEmail || 0} contacts).
                </p>
              </div>

              {/* Preview table */}
              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Quality</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewContacts.map((contact, idx) => (
                      <TableRow key={idx} className={!contact.email ? 'opacity-50' : ''}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                            {contact.title && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {contact.title}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.companyName || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {contact.email ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-green-600" />
                              <span className="truncate max-w-[150px]">{contact.email}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No email</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.businessPhone ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {contact.businessPhone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getConfidenceBadge(contact.confidence)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              {totalPreviewCount > 100 && (
                <p className="text-xs text-muted-foreground text-center">
                  Showing first 100 of {totalPreviewCount} contacts
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('upload')} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleConfirmImport} 
                  className="flex-1"
                  disabled={!previewStats?.withEmail}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import {previewStats?.withEmail || 0} Contacts
                </Button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">{statusMessage}</p>
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
                {stats.skippedDuplicates && stats.skippedDuplicates > 0 && (
                  <p>Skipped duplicates: {stats.skippedDuplicates}</p>
                )}
                {stats.skippedNoEmail && stats.skippedNoEmail > 0 && (
                  <p className="text-xs">Skipped (no email): {stats.skippedNoEmail}</p>
                )}
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
