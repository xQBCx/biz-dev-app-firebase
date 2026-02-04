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
  Loader2,
  Rocket,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const RELATIONSHIP_TYPES = [
  { value: 'client', label: 'Client' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'partner', label: 'Partner' },
  { value: 'associate', label: 'Associate' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'investor', label: 'Investor' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'competitor', label: 'Competitor' },
  { value: 'unknown', label: 'Unknown' },
];

export function ArchiveReviewQueue() {
  const { importId } = useParams<{ importId: string }>();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [chunkCache, setChunkCache] = useState<Record<string, ChunkData>>({});
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [selectedRelationship, setSelectedRelationship] = useState<Record<string, string>>({});
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
      chunkIds.forEach(fetchChunk);
    }
    setExpandedItems(newExpanded);
  };

  const handleAction = async (
    itemId: string, 
    action: 'approve' | 'reject' | 'merge' | 'spawn_my_business' | 'add_as_external'
  ) => {
    setProcessing(prev => new Set([...prev, itemId]));

    try {
      const response = await supabase.functions.invoke('archive-review', {
        body: {
          review_item_id: itemId,
          action,
          notes: actionNotes[itemId],
          selected_relationship_type: selectedRelationship[itemId],
        },
      });

      if (response.error) throw response.error;

      const actionLabel = action === 'spawn_my_business' ? 'spawned' : 
                          action === 'add_as_external' ? 'added to CRM' : 
                          `${action}ed`;

      toast({
        title: 'Success',
        description: `Item ${actionLabel} successfully`,
      });

      setItems(prev => prev.filter(i => i.id !== itemId));

    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to process item`,
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
      case 'my_business_spawn':
        return Rocket;
      case 'business_create':
      case 'business_update':
        return Building2;
      case 'contact_create':
      case 'crm_contact_create':
        return Users;
      case 'company_create':
      case 'external_company_create':
        return Building;
      case 'strategy_create':
        return Lightbulb;
      default:
        return Briefcase;
    }
  };

  const getItemLabel = (type: string) => {
    switch (type) {
      case 'my_business_spawn': return 'Your Business';
      case 'business_create': return 'New Business';
      case 'business_update': return 'Update Business';
      case 'contact_create': 
      case 'crm_contact_create': return 'New Contact';
      case 'company_create':
      case 'external_company_create': return 'External Company';
      case 'strategy_create': return 'New Strategy';
      case 'merge_suggestion': return 'Merge Suggestion';
      default: return type;
    }
  };

  const isMyBusinessItem = (type: string) => type === 'my_business_spawn';
  const isExternalEntity = (type: string) => 
    ['external_company_create', 'company_create', 'contact_create', 'crm_contact_create'].includes(type);

  const groupedItems = items.reduce((acc, item) => {
    const type = item.item_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, ReviewItem[]>);

  // Sort to show my_business_spawn first
  const sortedTypes = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'my_business_spawn') return -1;
    if (b === 'my_business_spawn') return 1;
    return 0;
  });

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

      <Tabs defaultValue={sortedTypes[0]} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          {sortedTypes.map((type) => {
            const typeItems = groupedItems[type];
            const Icon = getItemIcon(type);
            return (
              <TabsTrigger key={type} value={type} className="gap-2">
                <Icon className="w-4 h-4" />
                {getItemLabel(type)} ({typeItems.length})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {sortedTypes.map((type) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {groupedItems[type].map(item => {
              const Icon = getItemIcon(item.item_type);
              const isExpanded = expandedItems.has(item.id);
              const isProcessing = processing.has(item.id);
              const payload = (item.payload_json || {}) as Record<string, unknown>;
              const isMyBiz = isMyBusinessItem(item.item_type);
              const isExternal = isExternalEntity(item.item_type);

              return (
                <Card key={item.id} className={isMyBiz ? 'border-primary/50 bg-primary/5' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isMyBiz ? 'bg-primary/20' : 'bg-muted'}`}>
                          <Icon className={`w-5 h-5 ${isMyBiz ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {(payload.name as string) || (payload.full_name as string) || (payload.title as string) || 'Unknown'}
                            {isMyBiz && (
                              <Badge variant="default" className="text-xs">
                                Your Business
                              </Badge>
                            )}
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
                      {/* Ownership signals for my businesses */}
                      {isMyBiz && (payload.ownership_signals as string[])?.length > 0 && (
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <p className="text-sm font-medium text-primary mb-1">Why we think this is yours:</p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside">
                            {(payload.ownership_signals as string[]).map((signal, i) => (
                              <li key={i}>{signal}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Payload details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(payload)
                          .filter(([key]) => !['name', 'full_name', 'title', 'description', 'summary', 'existing_id', 'confidence', 'ownership_signals', 'suggested_action'].includes(key))
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div key={key}>
                              <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}: </span>
                              <span className="font-medium">{String(value) || 'N/A'}</span>
                            </div>
                          ))}
                      </div>

                      {/* Relationship type selector for external entities */}
                      {isExternal && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Relationship Type</label>
                          <Select
                            value={selectedRelationship[item.id] || (payload.relationship_type as string) || 'unknown'}
                            onValueChange={(value) => setSelectedRelationship(prev => ({ ...prev, [item.id]: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              {RELATIONSHIP_TYPES.map(rt => (
                                <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

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

                      {/* Action buttons - different for my businesses vs external */}
                      <div className="flex gap-2">
                        {isMyBiz ? (
                          <>
                            <Button
                              onClick={() => handleAction(item.id, 'spawn_my_business')}
                              disabled={isProcessing}
                              className="flex-1"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Rocket className="w-4 h-4 mr-2" />
                              )}
                              Spawn as My Business
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleAction(item.id, 'add_as_external')}
                              disabled={isProcessing}
                              className="flex-1"
                            >
                              <Building className="w-4 h-4 mr-2" />
                              Add as External
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleAction(item.id, 'reject')}
                              disabled={isProcessing}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
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
                              {isExternal ? 'Add to CRM' : 'Approve'}
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
                          </>
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
