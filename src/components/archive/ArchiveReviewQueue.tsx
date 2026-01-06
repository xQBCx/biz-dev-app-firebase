import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  GitMerge, 
  Building2, 
  Users, 
  Lightbulb,
  Building,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReviewItem {
  id: string;
  import_id: string;
  item_type: string;
  payload_json: unknown;
  confidence: number;
  evidence_chunk_ids: string[];
  status: string;
  assigned_to_user_id: string | null;
  decision_notes: string | null;
  decided_at: string | null;
  created_at: string;
}

interface ChunkData {
  id: string;
  chunk_text: string;
  occurred_start_at: string;
}

export function ArchiveReviewQueue() {
  const { importId } = useParams<{ importId: string }>();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [chunkCache, setChunkCache] = useState<Record<string, ChunkData>>({});
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchItems = async () => {
    let query = supabase
      .from('archive_review_queue')
      .select('*')
      .eq('status', 'pending')
      .order('confidence', { ascending: false });

    if (importId) {
      query = query.eq('import_id', importId);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load review items',
        variant: 'destructive',
      });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [importId]);

  const fetchChunk = async (chunkId: string) => {
    if (chunkCache[chunkId]) return;

    const { data } = await supabase
      .from('archive_chunks')
      .select('id, chunk_text, occurred_start_at')
      .eq('id', chunkId)
      .single();

    if (data) {
      setChunkCache(prev => ({ ...prev, [chunkId]: data }));
    }
  };

  const toggleExpanded = (itemId: string, chunkIds: string[]) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
      // Fetch chunks
      chunkIds.forEach(fetchChunk);
    }
    setExpandedItems(newExpanded);
  };

  const handleAction = async (itemId: string, action: 'approve' | 'reject' | 'merge') => {
    setProcessing(prev => new Set([...prev, itemId]));

    try {
      const response = await supabase.functions.invoke('archive-review', {
        body: {
          review_item_id: itemId,
          action,
          notes: actionNotes[itemId],
        },
      });

      if (response.error) throw response.error;

      toast({
        title: 'Success',
        description: `Item ${action}ed successfully`,
      });

      // Remove from list
      setItems(prev => prev.filter(i => i.id !== itemId));

    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} item`,
        variant: 'destructive',
      });
    } finally {
      setProcessing(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'business_create':
      case 'business_update':
        return Building2;
      case 'contact_create':
        return Users;
      case 'company_create':
        return Building;
      case 'strategy_create':
        return Lightbulb;
      default:
        return Building2;
    }
  };

  const getItemLabel = (type: string) => {
    switch (type) {
      case 'business_create': return 'New Business';
      case 'business_update': return 'Update Business';
      case 'contact_create': return 'New Contact';
      case 'company_create': return 'New Company';
      case 'strategy_create': return 'New Strategy';
      case 'merge_suggestion': return 'Merge Suggestion';
      default: return type;
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    const type = item.item_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, ReviewItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-lg font-medium">All items reviewed!</p>
          <p className="text-muted-foreground">No pending items in the review queue.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review Queue</h2>
          <p className="text-muted-foreground">
            {items.length} items pending review
          </p>
        </div>
      </div>

      <Tabs defaultValue={Object.keys(groupedItems)[0]} className="space-y-4">
        <TabsList>
          {Object.entries(groupedItems).map(([type, typeItems]) => {
            const Icon = getItemIcon(type);
            return (
              <TabsTrigger key={type} value={type} className="gap-2">
                <Icon className="w-4 h-4" />
                {getItemLabel(type)} ({typeItems.length})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(groupedItems).map(([type, typeItems]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {typeItems.map(item => {
              const Icon = getItemIcon(item.item_type);
              const isExpanded = expandedItems.has(item.id);
              const isProcessing = processing.has(item.id);
              const payload = (item.payload_json || {}) as Record<string, unknown>;

              return (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">
                            {(payload.name as string) || (payload.full_name as string) || (payload.title as string) || 'Unknown'}
                          </CardTitle>
                          <CardDescription>
                            {(payload.description as string) || (payload.summary as string) || (payload.email as string) || ''}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={item.confidence >= 0.75 ? 'default' : 
                                item.confidence >= 0.5 ? 'secondary' : 'outline'}
                      >
                        {Math.round(item.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Payload details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(payload)
                          .filter(([key]) => !['name', 'full_name', 'title', 'description', 'summary', 'existing_id', 'confidence'].includes(key))
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div key={key}>
                              <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}: </span>
                              <span className="font-medium">{String(value) || 'N/A'}</span>
                            </div>
                          ))}
                      </div>

                      {/* Evidence chunks */}
                      <Collapsible open={isExpanded}>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-between"
                            onClick={() => toggleExpanded(item.id, item.evidence_chunk_ids)}
                          >
                            <span>View Evidence ({item.evidence_chunk_ids.length} chunks)</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2">
                          {item.evidence_chunk_ids.map(chunkId => {
                            const chunk = chunkCache[chunkId];
                            return (
                              <div key={chunkId} className="p-3 bg-muted rounded-lg text-sm">
                                {chunk ? (
                                  <>
                                    <p className="text-xs text-muted-foreground mb-1">
                                      {new Date(chunk.occurred_start_at).toLocaleString()}
                                    </p>
                                    <p className="whitespace-pre-wrap line-clamp-4">
                                      {chunk.chunk_text}
                                    </p>
                                  </>
                                ) : (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                              </div>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Notes input */}
                      <Textarea
                        placeholder="Add notes (optional)..."
                        value={actionNotes[item.id] || ''}
                        onChange={(e) => setActionNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="h-20"
                      />

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAction(item.id, 'approve')}
                          disabled={isProcessing}
                          className="flex-1"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAction(item.id, 'reject')}
                          disabled={isProcessing}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        {item.item_type === 'merge_suggestion' && (
                          <Button
                            variant="secondary"
                            onClick={() => handleAction(item.id, 'merge')}
                            disabled={isProcessing}
                          >
                            <GitMerge className="w-4 h-4 mr-2" />
                            Merge
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
