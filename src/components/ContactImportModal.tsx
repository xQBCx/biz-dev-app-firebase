import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, Building2, Users, Target, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { PropertyMapper } from "./ImportWizard/PropertyMapper";

interface ContactImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

type ImportStep = 'type' | 'upload' | 'map' | 'details';
type EntityType = 'contacts' | 'companies' | 'deals';

export const ContactImportModal = ({ open, onOpenChange, onImportComplete }: ContactImportModalProps) => {
  const { user } = useAuth();
  const { activeClientId } = useActiveClient();
  const [currentStep, setCurrentStep] = useState<ImportStep>('type');
  const [entityType, setEntityType] = useState<EntityType>('contacts');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && user) {
      loadProperties();
    }
  }, [open, user, entityType]);

  const loadProperties = async () => {
    if (!user) return;

    const entityTypeMap: Record<EntityType, string> = {
      contacts: 'contact',
      companies: 'company',
      deals: 'deal'
    };

    const { data, error } = await supabase
      .from('crm_custom_properties')
      .select('*')
      .eq('user_id', user.id)
      .eq('entity_type', entityTypeMap[entityType])
      .order('display_order');

    if (!error && data) {
      setProperties(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = async (file: File) => {
    try {
      // Check file size first (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File is too large. Please upload a file smaller than 20MB.");
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { 
        type: 'array',
        sheetRows: 1000 // Only read first 1000 rows for preview
      });
      
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Convert to JSON with defval to handle empty cells
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
        defval: '',
        raw: false // Convert everything to strings to prevent type issues
      });
      
      if (!jsonData || jsonData.length === 0) {
        toast.error("The spreadsheet appears to be empty");
        return;
      }
      
      const allColumns = Object.keys(jsonData[0] as object);
      
      // Warn about large spreadsheets
      if (allColumns.length > 50) {
        toast.warning(`Large spreadsheet detected with ${allColumns.length} columns. The mapper will help you select the important fields.`);
      }

      if (jsonData.length > 5000) {
        toast.warning(`Large file detected (${jsonData.length} rows). Import may take a few minutes.`);
      }
      
      // Only store first 3 rows for preview to reduce memory
      setPreview(jsonData.slice(0, 3));
      setColumns(allColumns);
      
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error("Failed to read the file. Please ensure it's a valid Excel or CSV file.");
    }
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setImporting(true);
    setProgress(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
        defval: '',
        raw: false
      });

      const records = jsonData.map((row: any) => {
        const mappedRow: any = { 
          user_id: user.id,
          client_id: activeClientId || null 
        };
        
        Object.keys(mapping).forEach(column => {
          const propertyName = mapping[column];
          if (propertyName && row[column]) {
            mappedRow[propertyName] = row[column];
          }
        });

        return mappedRow;
      }).filter(r => Object.keys(r).length > 2);

      const total = records.length;
      let imported = 0;
      let failed = 0;

      const tableName = entityType === 'contacts' ? 'crm_contacts' : 
                       entityType === 'companies' ? 'crm_companies' : 'crm_deals';

      const errors: string[] = [];
      
      // Batch insert for better performance
      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        
        try {
          const { error } = await supabase.from(tableName).insert(batch);

          if (error) {
            console.error('Failed to import batch:', error);
            errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
            failed += batch.length;
          } else {
            imported += batch.length;
          }
        } catch (err) {
          console.error('Error importing batch:', err);
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          failed += batch.length;
        }

        setProgress(((i + batchSize) / total) * 100);
      }

      if (errors.length > 0 && errors.length <= 5) {
        console.error('Import errors:', errors);
        toast.error(`Import issues: ${errors.slice(0, 3).join('; ')}`);
      }

      toast.success(`Import complete! ${imported} records imported${failed > 0 ? `, ${failed} failed` : ''}`);
      onImportComplete();
      handleClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('type');
    setEntityType('contacts');
    setFile(null);
    setPreview([]);
    setColumns([]);
    setMapping({});
    setProgress(0);
    onOpenChange(false);
  };

  const canProceedFromType = entityType !== null;
  const canProceedFromUpload = file !== null;
  
  // Check if required fields are mapped
  const getRequiredFields = () => {
    if (entityType === 'contacts') {
      return ['first_name', 'last_name', 'email'];
    } else if (entityType === 'companies') {
      return ['name'];
    }
    return [];
  };
  
  const requiredFieldsMapped = getRequiredFields().every(field => 
    Object.values(mapping).includes(field)
  );
  
  const canProceedFromMap = Object.keys(mapping).filter(k => mapping[k]).length > 0 && requiredFieldsMapped;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Data to CRM
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-6">
          {(['type', 'upload', 'map', 'details'] as ImportStep[]).map((step, idx) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex flex-col items-center flex-1 ${
                currentStep === step ? 'text-primary' : 'text-muted-foreground'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${
                  currentStep === step ? 'border-primary bg-primary text-primary-foreground' :
                  'border-muted bg-background'
                }`}>
                  {idx + 1}
                </div>
                <span className="text-xs font-medium capitalize">{step}</span>
              </div>
              {idx < 3 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  ['type', 'upload', 'map', 'details'].indexOf(currentStep) > idx
                    ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Type */}
        {currentStep === 'type' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What kind of data is in your file?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select one or more of the objects you want to create and associate.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setEntityType('contacts')}
                className={`p-6 border-2 rounded-lg flex flex-col items-center gap-3 transition-all hover:border-primary ${
                  entityType === 'contacts' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <Users className="w-12 h-12 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">Contacts</div>
                  <div className="text-xs text-muted-foreground">
                    The people you work with, commonly called leads or customers
                  </div>
                </div>
              </button>

              <button
                onClick={() => setEntityType('companies')}
                className={`p-6 border-2 rounded-lg flex flex-col items-center gap-3 transition-all hover:border-primary ${
                  entityType === 'companies' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <Building2 className="w-12 h-12 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">Companies</div>
                  <div className="text-xs text-muted-foreground">
                    The businesses you work with, commonly called accounts or organizations
                  </div>
                </div>
              </button>

              <button
                onClick={() => setEntityType('deals')}
                className={`p-6 border-2 rounded-lg flex flex-col items-center gap-3 transition-all hover:border-primary ${
                  entityType === 'deals' ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <Target className="w-12 h-12 text-primary" />
                <div className="text-center">
                  <div className="font-semibold">Deals</div>
                  <div className="text-xs text-muted-foreground">
                    The revenue connected to a company, commonly called opportunities
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                onClick={() => setCurrentStep('upload')}
                disabled={!canProceedFromType}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Upload File */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload your files</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Before you upload, make sure your file is ready to be imported.
              </p>
            </div>

            <div className="border border-dashed border-border rounded-lg p-12 text-center">
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button variant="outline" asChild>
                  <span>Choose a file to upload</span>
                </Button>
              </label>
              <p className="text-sm text-muted-foreground mt-2">
                All .csv, .xlsx, and .xls file types are supported
              </p>
              {file && (
                <p className="text-sm text-primary mt-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Selected: {file.name}
                </p>
              )}
            </div>

            {preview.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Preview (First 5 rows)</h4>
                <div className="border border-border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {columns.slice(0, 6).map((col) => (
                          <th key={col} className="px-4 py-2 text-left font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, idx) => (
                        <tr key={idx} className="border-t border-border">
                          {columns.slice(0, 6).map((col) => (
                            <td key={col} className="px-4 py-2">
                              {String(row[col] || '').substring(0, 30)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('type')}>
                Back
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button 
                  onClick={() => setCurrentStep('map')}
                  disabled={!canProceedFromUpload}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Map Columns */}
        {currentStep === 'map' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Map columns to properties</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Map your file columns to {entityType} properties. You can create custom properties on the fly.
              </p>
            </div>

            <PropertyMapper
              columns={columns}
              preview={preview}
              properties={properties}
              entityType={
                entityType === 'contacts' ? 'contact' : 
                entityType === 'companies' ? 'company' : 
                'deal'
              }
              onMappingChange={setMapping}
              onPropertiesUpdate={loadProperties}
              userId={user?.id || ''}
            />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                Back
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button 
                  onClick={() => setCurrentStep('details')}
                  disabled={!canProceedFromMap}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Import */}
        {currentStep === 'details' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Review and import</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Review your settings and start the import.
              </p>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Import type:</span>
                <span className="text-sm capitalize">{entityType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total records:</span>
                <span className="text-sm">{preview.length}+ rows</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Mapped columns:</span>
                <span className="text-sm">{Object.keys(mapping).filter(k => mapping[k]).length} of {columns.length}</span>
              </div>
            </div>

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Importing... {Math.round(progress)}%
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('map')} disabled={importing}>
                Back
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} disabled={importing}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={importing}>
                  {importing ? 'Importing...' : 'Start Import'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
