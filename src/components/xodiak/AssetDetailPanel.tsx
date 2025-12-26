import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ValueRegistryAsset, 
  ValueHistoryEntry, 
  ValueEvent, 
  useValueRegistry,
  ASSET_TYPES,
  VALUATION_METHODS
} from '@/hooks/useValueRegistry';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  History, 
  Activity,
  Edit2,
  Save,
  X,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  Link,
  Layers
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AssetDetailPanelProps {
  asset: ValueRegistryAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetDetailPanel({ asset, open, onOpenChange }: AssetDetailPanelProps) {
  const { getAssetHistory, getAssetEvents, updateAsset } = useValueRegistry();
  const [history, setHistory] = useState<ValueHistoryEntry[]>([]);
  const [events, setEvents] = useState<ValueEvent[]>([]);
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (asset) {
      loadData();
    }
  }, [asset?.id]);

  const loadData = async () => {
    if (!asset) return;
    try {
      const [historyData, eventsData] = await Promise.all([
        getAssetHistory(asset.id),
        getAssetEvents(asset.id),
      ]);
      setHistory(historyData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load asset data:', err);
    }
  };

  const handleUpdateValue = async () => {
    if (!asset || !newValue) return;
    setLoading(true);
    try {
      await updateAsset(asset.id, {
        current_value: parseFloat(newValue),
        last_valued_at: new Date().toISOString(),
      });
      setEditing(false);
      setNewValue('');
      loadData();
    } catch (err) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  if (!asset) return null;

  const typeInfo = ASSET_TYPES.find(t => t.value === asset.asset_type);
  const chartData = [...history].reverse().map(h => ({
    date: format(new Date(h.valued_at), 'MMM d'),
    value: h.value,
  }));

  const formatValue = (value: number | null, currency: string = 'USD') => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{asset.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge>{typeInfo?.label || asset.asset_type}</Badge>
                <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                  {asset.status}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Value History</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Current Value Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Current Valuation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="New value"
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleUpdateValue} disabled={loading}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-primary">
                          {formatValue(asset.current_value, asset.value_currency)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {asset.valuation_method && `Via ${asset.valuation_method}`}
                          {asset.last_valued_at && ` • ${formatDistanceToNow(new Date(asset.last_valued_at), { addSuffix: true })}`}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {
                        setNewValue(asset.current_value?.toString() || '');
                        setEditing(true);
                      }}>
                        <Edit2 className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mini Chart */}
              {chartData.length > 1 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Value Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={60} />
                          <Tooltip 
                            formatter={(value: number) => formatValue(value, asset.value_currency)}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                {asset.description && (
                  <Card className="col-span-2">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{asset.description}</p>
                    </CardContent>
                  </Card>
                )}

                {asset.external_id && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Link className="h-3 w-3" />
                        External ID
                      </div>
                      <p className="text-sm font-mono">{asset.external_id}</p>
                    </CardContent>
                  </Card>
                )}

                {asset.serial_number && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Tag className="h-3 w-3" />
                        Serial Number
                      </div>
                      <p className="text-sm font-mono">{asset.serial_number}</p>
                    </CardContent>
                  </Card>
                )}

                {asset.jurisdiction && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3" />
                        Jurisdiction
                      </div>
                      <p className="text-sm">{asset.jurisdiction}</p>
                    </CardContent>
                  </Card>
                )}

                {asset.custom_category && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Layers className="h-3 w-3" />
                        Category
                      </div>
                      <p className="text-sm">{asset.custom_category}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Tags */}
              {asset.tags && asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No valuation history yet
                  </p>
                ) : (
                  history.map((entry, idx) => {
                    const prevValue = history[idx + 1]?.value;
                    const change = prevValue ? entry.value - prevValue : 0;
                    const isPositive = change > 0;

                    return (
                      <Card key={entry.id}>
                        <CardContent className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">
                                {formatValue(entry.value, entry.currency)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(entry.valued_at), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                            <div className="text-right">
                              {change !== 0 && (
                                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                  <span className="text-sm font-medium">
                                    {isPositive ? '+' : ''}{formatValue(change, entry.currency)}
                                  </span>
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs mt-1">
                                {entry.valuation_method}
                              </Badge>
                            </div>
                          </div>
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                              {entry.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="events" className="mt-4">
              <div className="space-y-3">
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No events recorded
                  </p>
                ) : (
                  events.map(event => (
                    <Card key={event.id}>
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium capitalize">{event.event_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(event.event_at), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                          {event.value_change !== null && event.value_change !== 0 && (
                            <Badge variant={event.value_change > 0 ? 'default' : 'destructive'}>
                              {event.value_change > 0 ? '+' : ''}{formatValue(event.value_change)}
                            </Badge>
                          )}
                        </div>
                        {event.verified && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Verified
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
