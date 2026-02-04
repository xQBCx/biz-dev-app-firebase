import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, ExternalLink, Filter } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrueOddsSignals() {
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: signals, isLoading } = useQuery({
    queryKey: ["all-trueodds-signals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trueodds_signals")
        .select(`
          *,
          trueodds_markets(label, category, status)
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  const filteredSignals = signals?.filter(signal => {
    const matchesSource = sourceFilter === "all" || signal.source === sourceFilter;
    const matchesKind = kindFilter === "all" || signal.kind === kindFilter;
    const matchesSearch = !searchTerm || 
      signal.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signal.trueodds_markets?.label.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSource && matchesKind && matchesSearch;
  });

  const uniqueSources = [...new Set(signals?.map(s => s.source) || [])];
  const uniqueKinds = [...new Set(signals?.map(s => s.kind) || [])];

  const getImpactIcon = (impact: string | number) => {
    return Number(impact) > 0 
      ? <TrendingUp className="h-5 w-5 text-green-600" />
      : <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  const getImpactColor = (impact: string | number) => {
    const num = Number(impact);
    if (num > 0) return "text-green-600";
    if (num < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getWeightBadge = (weight: string | number) => {
    const num = Number(weight);
    if (num >= 0.7) return <Badge variant="default">High</Badge>;
    if (num >= 0.4) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Live Signal Feed</h1>
        <p className="text-muted-foreground">
          Real-time data signals moving market odds across sports, stocks, crypto, and world events
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Filters</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Search</label>
            <Input
              placeholder="Search signals or markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Source</label>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Type</label>
            <Select value={kindFilter} onValueChange={setKindFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueKinds.map(kind => (
                  <SelectItem key={kind} value={kind}>{kind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Signals List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="p-6">
                <Skeleton className="h-24 w-full" />
              </Card>
            ))}
          </>
        ) : filteredSignals && filteredSignals.length > 0 ? (
          filteredSignals.map((signal) => (
            <Card key={signal.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getImpactIcon(signal.impact)}
                    <Badge>{signal.kind}</Badge>
                    {getWeightBadge(signal.weight)}
                    <span className="text-xs text-muted-foreground">{signal.source}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(signal.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-lg font-medium mb-2">{signal.summary}</p>

                  {signal.trueodds_markets && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{signal.trueodds_markets.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {signal.trueodds_markets.label}
                      </span>
                    </div>
                  )}

                  {signal.url && (
                    <a 
                      href={signal.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center gap-1 hover:underline"
                    >
                      View Source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[120px]">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Impact</div>
                    <div className={`text-3xl font-bold ${getImpactColor(signal.impact)}`}>
                      {Number(signal.impact) > 0 ? "+" : ""}{Number(signal.impact).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Weight</div>
                    <div className="text-lg font-semibold">{Number(signal.weight).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm || sourceFilter !== "all" || kindFilter !== "all"
                ? "No signals match your filters"
                : "No signals available yet"
              }
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}