import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { History, FileText, ChevronRight, Clock, User, ArrowUpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DocumentationVersion {
  id: string;
  module_key: string;
  version: number;
  title: string;
  subtitle: string | null;
  content: unknown; // JSONB from database
  change_summary: string | null;
  changed_by: string | null;
  created_at: string;
}

interface ChangelogEntry {
  id: string;
  version_id: string | null;
  module_key: string;
  old_version: number | null;
  new_version: number;
  change_type: string;
  change_notes: string | null;
  related_feature: string | null;
  changed_by: string | null;
  created_at: string;
}

const MODULE_NAMES: Record<string, string> = {
  crm: 'CRM',
  deal_room: 'Deal Room',
  workflows: 'Workflows',
  erp: 'ERP',
  calendar: 'Calendar',
  research_studio: 'Research Studio',
  dashboard: 'Dashboard',
  broadcast: 'Broadcast',
  fleet: 'Fleet Intelligence',
  marketplace: 'Marketplace',
  tasks: 'Task Management',
  xodiak_chain: 'XDK Chain',
  xodiak: 'XODIAK',
};

export function DocumentationVersionHistory() {
  const [versions, setVersions] = useState<DocumentationVersion[]>([]);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<DocumentationVersion | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedModule]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch versions
      let versionsQuery = supabase
        .from('documentation_versions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (selectedModule !== 'all') {
        versionsQuery = versionsQuery.eq('module_key', selectedModule);
      }
      
      const { data: versionsData, error: versionsError } = await versionsQuery;
      
      if (versionsError) throw versionsError;
      setVersions(versionsData || []);

      // Fetch changelog
      let changelogQuery = supabase
        .from('documentation_changelog')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (selectedModule !== 'all') {
        changelogQuery = changelogQuery.eq('module_key', selectedModule);
      }
      
      const { data: changelogData, error: changelogError } = await changelogQuery;
      
      if (changelogError) throw changelogError;
      setChangelog(changelogData || []);
    } catch (error: any) {
      console.error('Error fetching documentation history:', error);
      toast.error('Failed to load documentation history');
    } finally {
      setLoading(false);
    }
  };

  const getChangeTypeBadge = (type: string) => {
    switch (type) {
      case 'created':
        return <Badge variant="default" className="bg-green-500/20 text-green-600">Created</Badge>;
      case 'updated':
        return <Badge variant="secondary">Updated</Badge>;
      case 'major_revision':
        return <Badge variant="destructive" className="bg-orange-500/20 text-orange-600">Major Revision</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getModuleOptions = () => {
    return Object.entries(MODULE_NAMES).map(([key, name]) => (
      <SelectItem key={key} value={key}>{name}</SelectItem>
    ));
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Documentation Version History
            </CardTitle>
            <CardDescription>
              Admin-only view of white paper version changes
            </CardDescription>
          </div>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {getModuleOptions()}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x h-[600px]">
          {/* Changelog Timeline */}
          <div className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Change Timeline
            </h3>
            <ScrollArea className="h-[520px]">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : changelog.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No changelog entries yet</p>
                  <p className="text-sm">Changes will appear here when white papers are updated</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {changelog.map((entry) => (
                    <div key={entry.id} className="relative pl-6 pb-4 border-l-2 border-muted last:border-transparent">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{MODULE_NAMES[entry.module_key] || entry.module_key}</span>
                          {getChangeTypeBadge(entry.change_type)}
                          <span className="text-sm text-muted-foreground ml-auto">
                            v{entry.old_version || 0} → v{entry.new_version}
                          </span>
                        </div>
                        {entry.change_notes && (
                          <p className="text-sm text-muted-foreground mb-2">{entry.change_notes}</p>
                        )}
                        {entry.related_feature && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <ArrowUpCircle className="h-3 w-3" />
                            Related: {entry.related_feature}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Version Archive */}
          <div className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Version Archive
            </h3>
            <ScrollArea className="h-[520px]">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No archived versions yet</p>
                  <p className="text-sm">Past versions will be stored here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {versions.map((version) => (
                    <Sheet key={version.id}>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between h-auto py-3 px-4 hover:bg-muted/50"
                          onClick={() => setSelectedVersion(version)}
                        >
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{version.title}</span>
                              <Badge variant="outline">v{version.version}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {MODULE_NAMES[version.module_key] || version.module_key}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {format(new Date(version.created_at), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[600px] sm:max-w-xl">
                        <SheetHeader>
                          <SheetTitle className="flex items-center gap-2">
                            {version.title}
                            <Badge variant="outline">v{version.version}</Badge>
                          </SheetTitle>
                          <SheetDescription>{version.subtitle}</SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-150px)] mt-4">
                          <div className="space-y-6">
                            {version.change_summary && (
                              <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="font-medium mb-2">Change Summary</h4>
                                <p className="text-sm text-muted-foreground">{version.change_summary}</p>
                              </div>
                            )}
                            {Array.isArray(version.content) && (version.content as Array<{title: string; content: string}>).map((section, idx) => (
                              <div key={idx}>
                                <h4 className="font-semibold text-lg mb-2">{section.title}</h4>
                                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {section.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </SheetContent>
                    </Sheet>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
