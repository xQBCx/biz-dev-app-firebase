import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileArchive, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Import {
  id: string;
  status: string;
  stats_json: unknown;
  error: string | null;
  created_at: string;
  updated_at: string;
  target_workspace_type: string;
  permission_scope: string;
}

export function ArchiveImportHistory() {
  const [imports, setImports] = useState<Import[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImports = async () => {
      const { data, error } = await supabase
        .from('archive_imports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setImports(data);
      }
      setLoading(false);
    };

    fetchImports();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'committed':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'review_pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'committed':
        return <Badge>Committed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'review_pending':
        return <Badge variant="secondary">Review Pending</Badge>;
      default:
        return <Badge variant="outline">Processing</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Archive Imports</h2>
          <p className="text-muted-foreground">
            View and manage your OpenAI archive imports
          </p>
        </div>
        <Button onClick={() => navigate('/archive-imports/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Import
        </Button>
      </div>

      {imports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileArchive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No imports yet</p>
            <p className="text-muted-foreground mb-6">
              Upload your OpenAI data export to get started
            </p>
            <Button onClick={() => navigate('/archive-imports/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Import
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {imports.map(importData => {
            const stats = (importData.stats_json || {}) as Record<string, unknown>;
            
            return (
              <Card key={importData.id} className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/archive-imports/${importData.id}`)}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(importData.status)}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Import {importData.id.slice(0, 8)}
                        </span>
                        {getStatusBadge(importData.status)}
                        <Badge variant="outline" className="capitalize">
                          {importData.target_workspace_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Created {new Date(importData.created_at).toLocaleString()}
                        {importData.error && (
                          <span className="text-destructive ml-2">• {importData.error}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      {(stats.conversations_parsed || stats.parsing) && (
                        <div className="text-center">
                          <div className="font-semibold">
                            {(stats.conversations_parsed as number) || 
                             (stats.parsing as Record<string, unknown>)?.conversations_created || 0}
                          </div>
                          <div className="text-muted-foreground text-xs">Conversations</div>
                        </div>
                      )}
                      {(stats.businesses_created !== undefined) && (
                        <div className="text-center">
                          <div className="font-semibold">{String(stats.businesses_created)}</div>
                          <div className="text-muted-foreground text-xs">Businesses</div>
                        </div>
                      )}
                      {(stats.contacts_created !== undefined) && (
                        <div className="text-center">
                          <div className="font-semibold">{String(stats.contacts_created)}</div>
                          <div className="text-muted-foreground text-xs">Contacts</div>
                        </div>
                      )}
                      {(stats.pending_review_items as number) > 0 && (
                        <div className="text-center">
                          <div className="font-semibold text-amber-500">
                            {stats.pending_review_items as number}
                          </div>
                          <div className="text-muted-foreground text-xs">To Review</div>
                        </div>
                      )}
                    </div>

                    <Button variant="ghost" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
