import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  GitMerge, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  ArrowRight,
  FileCode,
  History
} from "lucide-react";

interface Operation {
  id: string;
  operation_type: string;
  status: string;
  progress: number;
  files_involved: string[];
  result_data: any;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  source_project: {
    external_project_name: string;
  } | null;
}

interface MergeCenterProps {
  userId: string;
}

export function MergeCenter({ userId }: MergeCenterProps) {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperations();
  }, [userId]);

  const loadOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('code_integration_operations')
        .select(`
          *,
          source_project:platform_project_imports(external_project_name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOperations(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getOperationLabel = (type: string) => {
    switch (type) {
      case 'fetch':
        return 'Code Fetch';
      case 'analyze':
        return 'Analysis';
      case 'compare':
        return 'Comparison';
      case 'merge':
        return 'Merge';
      case 'import':
        return 'Import';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5" />
              Merge Center
            </CardTitle>
            <CardDescription>
              Track code integration operations and history
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadOperations}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No integration operations yet. Fetch code from a project to get started.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {operations.map(operation => (
                <Card key={operation.id} className="border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(operation.status)}
                        <div>
                          <div className="font-medium">
                            {getOperationLabel(operation.operation_type)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {operation.source_project?.external_project_name || 'Unknown project'}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(operation.status)}
                    </div>

                    {operation.status === 'in_progress' && (
                      <div className="mb-3">
                        <Progress value={operation.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {operation.progress}% complete
                        </p>
                      </div>
                    )}

                    {operation.files_involved && operation.files_involved.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <FileCode className="h-4 w-4" />
                          <span>{operation.files_involved.length} files</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {operation.files_involved.slice(0, 3).map((file, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {file.split('/').pop()}
                            </Badge>
                          ))}
                          {operation.files_involved.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{operation.files_involved.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {operation.result_data && (
                      <div className="bg-muted/30 rounded p-2 mb-3 text-sm">
                        {operation.result_data.filesStored && (
                          <span className="text-green-600">
                            ✓ {operation.result_data.filesStored} files stored
                          </span>
                        )}
                        {operation.result_data.errors && operation.result_data.errors.length > 0 && (
                          <span className="text-destructive ml-2">
                            ⚠ {operation.result_data.errors.length} errors
                          </span>
                        )}
                      </div>
                    )}

                    {operation.error_message && (
                      <div className="bg-destructive/10 rounded p-2 mb-3 text-sm text-destructive">
                        {operation.error_message}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Started: {formatDate(operation.created_at)}</span>
                      {operation.completed_at && (
                        <span>Completed: {formatDate(operation.completed_at)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
