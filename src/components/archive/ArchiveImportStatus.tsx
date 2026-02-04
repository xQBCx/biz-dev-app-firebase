import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Circle, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  FileArchive,
  MessageSquare,
  Puzzle,
  Building2,
  Users,
  Lightbulb,
  GitBranch,
  ClipboardCheck,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImportData {
  id: string;
  status: string;
  stats_json: unknown;
  error: string | null;
  created_at: string;
  updated_at: string;
}

const STAGES = [
  { key: 'uploaded', label: 'Uploaded', icon: FileArchive },
  { key: 'extracting', label: 'Extracting ZIP', icon: FileArchive },
  { key: 'parsing', label: 'Parsing Conversations', icon: MessageSquare },
  { key: 'chunking', label: 'Chunking & Embedding', icon: Puzzle },
  { key: 'extracting_entities', label: 'Extracting Entities', icon: Building2 },
  { key: 'building_graph', label: 'Building Graph', icon: GitBranch },
  { key: 'review_pending', label: 'Review Pending', icon: ClipboardCheck },
  { key: 'committed', label: 'Committed', icon: CheckCircle },
];

export function ArchiveImportStatus() {
  const { importId } = useParams<{ importId: string }>();
  const [importData, setImportData] = useState<ImportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchImportData = async () => {
    if (!importId) return;

    const { data, error } = await supabase
      .from('archive_imports')
      .select('*')
      .eq('id', importId)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load import data',
        variant: 'destructive',
      });
    } else {
      setImportData(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImportData();
    
    // Poll for updates
    const interval = setInterval(fetchImportData, 5000);
    return () => clearInterval(interval);
  }, [importId]);

  const retryImport = async () => {
    if (!importId) return;
    setRetrying(true);

    try {
      const { data, error } = await supabase.functions.invoke('archive-orchestrate', {
        body: { import_id: importId },
      });

      if (error) {
        let details = error.message;
        const maybeResponse = (error as unknown as { context?: Response })?.context;
        if (maybeResponse instanceof Response) {
          try {
            const body = await maybeResponse.json();
            details = body?.details || body?.error || details;
          } catch {
            // ignore
          }
        }
        throw new Error(details);
      }

      toast({
        title: 'Pipeline started',
        description: (data as { message?: string })?.message || 'Processing has started.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not restart the import pipeline.';
      toast({
        title: 'Pipeline start failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setRetrying(false);
    }
  };

  const resetImport = async () => {
    if (!importId) return;
    setResetting(true);

    try {
      const { error } = await supabase
        .from('archive_imports')
        .update({ 
          status: 'uploaded', 
          error: null,
          stats_json: {},
          updated_at: new Date().toISOString()
        })
        .eq('id', importId);

      if (error) throw error;

      toast({
        title: 'Import reset',
        description: 'Import has been reset. You can now start processing again.',
      });

      fetchImportData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not reset import.';
      toast({
        title: 'Reset failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setResetting(false);
    }
  };

  const deleteImport = async () => {
    if (!importId) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete this import? This will remove all uploaded files and extracted data. This action cannot be undone.'
    );
    if (!confirmed) return;

    setDeleting(true);

    try {
      // Get user ID for storage path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete extracted files records
      await supabase
        .from('archive_import_files')
        .delete()
        .eq('import_id', importId);

      // Delete storage files (chunks and extracted)
      const storagePaths = [
        `raw/openai_exports/${user.id}/${importId}`,
      ];

      for (const path of storagePaths) {
        const { data: files } = await supabase.storage
          .from('vault')
          .list(path, { limit: 1000 });

        if (files && files.length > 0) {
          const filePaths = files.map(f => `${path}/${f.name}`);
          await supabase.storage.from('vault').remove(filePaths);
        }
      }

      // Delete the import record
      const { error } = await supabase
        .from('archive_imports')
        .delete()
        .eq('id', importId);

      if (error) throw error;

      toast({
        title: 'Import deleted',
        description: 'All import data has been removed. You can now upload a fresh archive.',
      });

      navigate('/archive-imports');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not delete import.';
      toast({
        title: 'Delete failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStageIndex = () => {
    return STAGES.findIndex(s => s.key === importData?.status);
  };

  const getStageStatus = (index: number): 'completed' | 'current' | 'pending' | 'failed' => {
    const currentIndex = getStageIndex();
    if (importData?.status === 'failed') {
      if (index < currentIndex) return 'completed';
      if (index === currentIndex) return 'failed';
      return 'pending';
    }
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  // Check if this is an empty committed import (extraction found 0 files)
  const isEmptyCommit = () => {
    if (importData?.status !== 'committed') return false;
    const stats = (importData?.stats_json || {}) as Record<string, unknown>;
    const extractStats = stats.extracting as Record<string, unknown>;
    const filesFound = extractStats?.files_found as number || 0;
    return filesFound === 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!importData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Import not found</p>
          <Button variant="link" onClick={() => navigate('/archive-imports')}>
            View all imports
          </Button>
        </CardContent>
      </Card>
    );
  }

  const stats = (importData?.stats_json || {}) as Record<string, unknown>;
  const currentStageIndex = getStageIndex();
  const progress = Math.round((currentStageIndex / (STAGES.length - 1)) * 100);
  const emptyCommit = isEmptyCommit();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Import Status</h2>
          <p className="text-muted-foreground">
            Created {new Date(importData.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {importData.status === 'uploaded' && (
            <Button onClick={retryImport} disabled={retrying}>
              <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Starting...' : 'Start Processing'}
            </Button>
          )}
          {(importData.status === 'failed' || emptyCommit) && (
            <>
              <Button variant="outline" onClick={resetImport} disabled={resetting}>
                <RotateCcw className={`w-4 h-4 mr-2 ${resetting ? 'animate-spin' : ''}`} />
                Reset Import
              </Button>
              <Button onClick={retryImport} disabled={retrying}>
                <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </>
          )}
          {importData.status === 'review_pending' && (
            <Button onClick={() => navigate(`/archive-review/${importId}`)}>
              Review Items
            </Button>
          )}
          <Button variant="destructive" onClick={deleteImport} disabled={deleting}>
            <Trash2 className={`w-4 h-4 mr-2 ${deleting ? 'animate-spin' : ''}`} />
            {deleting ? 'Deleting...' : 'Delete Import'}
          </Button>
        </div>
      </div>

      {emptyCommit && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Empty Import Detected</p>
                <p className="text-sm text-muted-foreground">
                  This import completed but extracted 0 files. The archive may have been empty, encrypted, or corrupted. 
                  Click "Reset Import" and try again, or check the archive file.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pipeline Progress</CardTitle>
            <Badge variant={importData.status === 'failed' ? 'destructive' : 
                          emptyCommit ? 'destructive' :
                          importData.status === 'committed' ? 'default' : 'secondary'}>
              {emptyCommit ? 'EMPTY COMMIT' : importData.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <Progress value={importData.status === 'failed' ? progress : 
                          importData.status === 'committed' ? 100 : progress} 
                    className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {STAGES.map((stage, index) => {
              const status = getStageStatus(index);
              const Icon = stage.icon;
              
              return (
                <div key={stage.key} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    status === 'completed' ? 'bg-primary text-primary-foreground' :
                    status === 'current' ? 'bg-primary/20 text-primary' :
                    status === 'failed' ? 'bg-destructive text-destructive-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : status === 'current' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : status === 'failed' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className={`font-medium ${
                        status === 'pending' ? 'text-muted-foreground' : ''
                      }`}>
                        {stage.label}
                      </span>
                    </div>
                    {status === 'failed' && importData.error && (
                      <p className="text-sm text-destructive mt-1">{importData.error}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {String((stats.conversations_parsed as number) || (stats.parsing as Record<string, unknown>)?.conversations_created || 0)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Conversations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Puzzle className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {String((stats.chunks_created as number) || (stats.chunking as Record<string, unknown>)?.chunks_created || 0)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Chunks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {String((stats.businesses_created as number) || 
                 (stats.extracting_entities as Record<string, number>)?.my_businesses_found || 0)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Your Businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {String((stats.contacts_created as number) || 
                 (stats.extracting_entities as Record<string, number>)?.contacts_extracted || 0)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {String((stats.strategies_created as number) || 
                 (stats.extracting_entities as Record<string, number>)?.strategies_extracted || 0)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Strategies</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {String((stats.pending_review_items as number) || 
                 (stats.extracting_entities as Record<string, number>)?.review_queue_items || 0)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
