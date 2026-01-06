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
  ClipboardCheck
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
      const response = await supabase.functions.invoke('archive-orchestrate', {
        body: { import_id: importId },
      });

      if (response.error) throw response.error;

      toast({
        title: 'Retry started',
        description: 'The import pipeline has been restarted.',
      });
    } catch (error) {
      toast({
        title: 'Retry failed',
        description: 'Could not restart the import pipeline.',
        variant: 'destructive',
      });
    } finally {
      setRetrying(false);
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
          {importData.status === 'failed' && (
            <Button onClick={retryImport} disabled={retrying}>
              <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          )}
          {importData.status === 'review_pending' && (
            <Button onClick={() => navigate(`/archive-review/${importId}`)}>
              Review Items
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pipeline Progress</CardTitle>
            <Badge variant={importData.status === 'failed' ? 'destructive' : 
                          importData.status === 'committed' ? 'default' : 'secondary'}>
              {importData.status.replace('_', ' ').toUpperCase()}
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
                {(stats.businesses_created as number) || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {(stats.contacts_created as number) || 0}
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
                {(stats.strategies_created as number) || 0}
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
                {(stats.pending_review_items as number) || 0}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
