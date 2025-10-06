import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface ContactImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export const ContactImportModal = ({ open, onOpenChange, onImportComplete }: ContactImportModalProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      previewFile(selectedFile);
    }
  };

  const previewFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      setPreview(jsonData.slice(0, 5)); // Show first 5 rows
    };
    reader.readAsBinaryString(file);
  };

  const normalizeContact = (row: any) => {
    return {
      first_name: row['First Name'] || row['first_name'] || row['FirstName'] || '',
      last_name: row['Last Name'] || row['last_name'] || row['LastName'] || '',
      email: row['Email'] || row['email'] || row['E-mail'] || '',
      phone: row['Phone'] || row['phone'] || row['Mobile'] || row['mobile'] || '',
      title: row['Title'] || row['title'] || row['Job Title'] || '',
      department: row['Department'] || row['department'] || '',
      company_id: null,
      lead_status: 'new',
      lead_source: 'import',
      user_id: user?.id,
    };
  };

  const handleImport = async () => {
    if (!file || !user) return;

    setImporting(true);
    setProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const contacts = jsonData.map(normalizeContact).filter(c => c.email);
        const total = contacts.length;
        let imported = 0;
        let failed = 0;

        for (let i = 0; i < contacts.length; i++) {
          try {
            const { error } = await supabase
              .from('crm_contacts')
              .insert(contacts[i]);

            if (error) {
              console.error('Failed to import contact:', error);
              failed++;
            } else {
              imported++;
            }
          } catch (err) {
            console.error('Error importing contact:', err);
            failed++;
          }

          setProgress(((i + 1) / total) * 100);
        }

        toast.success(`Import complete! ${imported} contacts imported${failed > 0 ? `, ${failed} failed` : ''}`);
        onImportComplete();
        onOpenChange(false);
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import contacts');
    } finally {
      setImporting(false);
      setProgress(0);
      setFile(null);
      setPreview([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import Contacts from Excel/CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>Select Excel or CSV File</span>
              </Button>
            </Label>
            {file && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {file.name}
              </p>
            )}
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Preview (First 5 rows)</h3>
              <div className="border border-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(preview[0]).slice(0, 5).map((key) => (
                        <th key={key} className="px-4 py-2 text-left">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-t border-border">
                        {Object.values(row).slice(0, 5).map((val: any, i) => (
                          <td key={i} className="px-4 py-2">
                            {String(val).substring(0, 30)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Expected Columns</p>
                <p className="text-blue-700 dark:text-blue-300">
                  First Name, Last Name, Email (required), Phone, Title, Department
                </p>
              </div>
            </div>
          </div>

          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Importing contacts... {Math.round(progress)}%
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1"
            >
              {importing ? 'Importing...' : 'Import Contacts'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={importing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
