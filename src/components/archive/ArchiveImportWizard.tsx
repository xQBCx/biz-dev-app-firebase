import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileArchive, Lock, Users, Building2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImportWizardProps {
  onComplete?: (importId: string) => void;
}

type WorkspaceType = 'personal' | 'org' | 'business';
type PermissionScope = 'private' | 'org_admins' | 'selected_roles';

export function ArchiveImportWizard({ onComplete }: ImportWizardProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('personal');
  const [permissionScope, setPermissionScope] = useState<PermissionScope>('private');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importId, setImportId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith('.zip')) {
      setFile(droppedFile);
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a ZIP file from OpenAI export',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.name.endsWith('.zip')) {
      setFile(selectedFile);
    }
  };

  const computeSHA256 = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const startImport = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Compute file hash
      setUploadProgress(10);
      const sha256 = await computeSHA256(file);

      // Create import record
      const newImportId = crypto.randomUUID();
      const storagePath = `raw/openai_exports/${user.id}/${newImportId}/openai_export.zip`;

      setUploadProgress(20);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(storagePath, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      setUploadProgress(60);

      // Create import record in database
      const { error: insertError } = await supabase
        .from('archive_imports')
        .insert({
          id: newImportId,
          owner_user_id: user.id,
          target_workspace_type: workspaceType,
          permission_scope: permissionScope,
          storage_zip_path: storagePath,
          zip_sha256: sha256,
          status: 'uploaded',
        });

      if (insertError) throw new Error(`Failed to create import: ${insertError.message}`);

      setUploadProgress(80);

      // Start the orchestration pipeline
      const { data: session } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('archive-orchestrate', {
        body: { import_id: newImportId },
      });

      if (response.error) {
        console.error('Orchestration error:', response.error);
      }

      setUploadProgress(100);
      setImportId(newImportId);
      setStep(4);

      toast({
        title: 'Import started',
        description: 'Your archive is being processed. This may take a few minutes.',
      });

      if (onComplete) {
        onComplete(newImportId);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Import failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {s < step ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-16 h-1 mx-2 ${s < step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Upload</span>
          <span>Workspace</span>
          <span>Permissions</span>
          <span>Complete</span>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileArchive className="w-5 h-5" />
              Upload OpenAI Export
            </CardTitle>
            <CardDescription>
              Upload your OpenAI data export ZIP file. This will be processed to extract conversations, entities, and insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {file ? (
                <div className="flex flex-col items-center gap-4">
                  <CheckCircle className="w-12 h-12 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setFile(null)}>
                    Change file
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Upload className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Drop your ZIP file here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Select file</span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!file}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Choose Workspace
            </CardTitle>
            <CardDescription>
              Select where the extracted entities should be stored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={workspaceType}
              onValueChange={(v) => setWorkspaceType(v as WorkspaceType)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="personal" id="personal" />
                <Label htmlFor="personal" className="flex-1 cursor-pointer">
                  <div className="font-medium">Personal Workspace</div>
                  <div className="text-sm text-muted-foreground">
                    Import to your personal account. Only you can see the data.
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="org" id="org" />
                <Label htmlFor="org" className="flex-1 cursor-pointer">
                  <div className="font-medium">Organization</div>
                  <div className="text-sm text-muted-foreground">
                    Import to your organization. Admins can access the data.
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business" className="flex-1 cursor-pointer">
                  <div className="font-medium">Business</div>
                  <div className="text-sm text-muted-foreground">
                    Import to a specific business entity.
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Permission Scope
            </CardTitle>
            <CardDescription>
              Control who can access the raw archive data and derived entities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={permissionScope}
              onValueChange={(v) => setPermissionScope(v as PermissionScope)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex-1 cursor-pointer">
                  <div className="font-medium">Private</div>
                  <div className="text-sm text-muted-foreground">
                    Only you can view raw files and commit changes.
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="org_admins" id="org_admins" />
                <Label htmlFor="org_admins" className="flex-1 cursor-pointer">
                  <div className="font-medium">Organization Admins</div>
                  <div className="text-sm text-muted-foreground">
                    Organization admins can review and commit changes.
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="selected_roles" id="selected_roles" />
                <Label htmlFor="selected_roles" className="flex-1 cursor-pointer">
                  <div className="font-medium">Selected Roles</div>
                  <div className="text-sm text-muted-foreground">
                    Grant specific permissions to archivists and reviewers.
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Privacy Note</p>
                  <p className="text-muted-foreground">
                    Raw archive files are never shared by default. Only extracted entities
                    (businesses, contacts, strategies) are visible based on workspace permissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={startImport} disabled={uploading}>
                {uploading ? (
                  <>Processing... {uploadProgress}%</>
                ) : (
                  <>Start Import <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>

            {uploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" />
              Import Started
            </CardTitle>
            <CardDescription>
              Your archive is being processed. This may take several minutes depending on the size.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6" />
              <p className="text-lg font-medium mb-2">Processing your archive...</p>
              <p className="text-muted-foreground mb-6">
                We're extracting conversations, identifying entities, and building relationships.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/archive-imports')}>
                  View All Imports
                </Button>
                {importId && (
                  <Button onClick={() => navigate(`/archive-imports/${importId}`)}>
                    View Progress
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
