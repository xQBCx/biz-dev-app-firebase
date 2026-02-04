import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Link2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  Sparkles,
  Filter,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

interface CrossModuleLink {
  id: string;
  source_module: string;
  source_entity_id: string;
  target_module: string;
  target_entity_id: string;
  link_type: string;
  confidence_score: number | null;
  verified: boolean | null;
  verified_by: string | null;
  discovered_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const MODULE_COLORS: Record<string, string> = {
  crm: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  tasks: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  workflows: "bg-green-500/20 text-green-400 border-green-500/30",
  fleet: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  marketplace: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  earnings: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  agents: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  credits: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const LINK_TYPE_LABELS: Record<string, string> = {
  related_to: "Related To",
  derived_from: "Derived From",
  depends_on: "Depends On",
  generates: "Generates",
  references: "References",
  similar_to: "Similar To",
  parent_of: "Parent Of",
  child_of: "Child Of",
};

export function CrossModuleLinksManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLink, setSelectedLink] = useState<CrossModuleLink | null>(null);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["cross-module-links", moduleFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("ai_cross_module_links")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (moduleFilter !== "all") {
        query = query.or(`source_module.eq.${moduleFilter},target_module.eq.${moduleFilter}`);
      }

      if (statusFilter === "verified") {
        query = query.eq("verified", true);
      } else if (statusFilter === "pending") {
        query = query.is("verified", null);
      } else if (statusFilter === "rejected") {
        query = query.eq("verified", false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrossModuleLink[];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ linkId, verified }: { linkId: string; verified: boolean }) => {
      const { error } = await supabase
        .from("ai_cross_module_links")
        .update({ 
          verified, 
          verified_by: "user" 
        })
        .eq("id", linkId);
      if (error) throw error;
    },
    onSuccess: (_, { verified }) => {
      toast.success(verified ? "Link verified" : "Link rejected");
      queryClient.invalidateQueries({ queryKey: ["cross-module-links"] });
      setSelectedLink(null);
    },
    onError: () => {
      toast.error("Failed to update link");
    },
  });

  const filteredLinks = links.filter(link => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      link.source_module.toLowerCase().includes(query) ||
      link.target_module.toLowerCase().includes(query) ||
      link.link_type.toLowerCase().includes(query) ||
      link.source_entity_id.toLowerCase().includes(query) ||
      link.target_entity_id.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: links.length,
    verified: links.filter(l => l.verified === true).length,
    pending: links.filter(l => l.verified === null).length,
    rejected: links.filter(l => l.verified === false).length,
    highConfidence: links.filter(l => (l.confidence_score || 0) >= 0.8).length,
  };

  const moduleStats = links.reduce((acc, link) => {
    acc[link.source_module] = (acc[link.source_module] || 0) + 1;
    acc[link.target_module] = (acc[link.target_module] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getModuleBadge = (module: string) => (
    <Badge variant="outline" className={MODULE_COLORS[module] || "bg-muted"}>
      {module}
    </Badge>
  );

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-400";
    if (score >= 0.5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Link2 className="h-8 w-8 text-primary" />
            Cross-Module Links
          </h1>
          <p className="text-muted-foreground mt-1">
            View and verify AI-discovered connections between entities across modules
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Links</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Link2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-400">{stats.verified}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Confidence</p>
                <p className="text-2xl font-bold text-primary">{stats.highConfidence}</p>
              </div>
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">Link List</TabsTrigger>
            <TabsTrigger value="graph">Module Graph</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search links..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {Object.keys(MODULE_COLORS).map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading links...
              </CardContent>
            </Card>
          ) : filteredLinks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No links found
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredLinks.map((link) => (
                <Card 
                  key={link.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedLink?.id === link.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedLink(link)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getModuleBadge(link.source_module)}
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">
                            {LINK_TYPE_LABELS[link.link_type] || link.link_type}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {getModuleBadge(link.target_module)}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <p className={`font-mono ${getConfidenceColor(link.confidence_score || 0)}`}>
                            {((link.confidence_score || 0) * 100).toFixed(0)}%
                          </p>
                        </div>
                        <Progress 
                          value={(link.confidence_score || 0) * 100} 
                          className="w-20 h-2"
                        />
                        {link.verified === true && (
                          <Badge variant="outline" className="bg-green-500/20 text-green-400">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {link.verified === false && (
                          <Badge variant="outline" className="bg-red-500/20 text-red-400">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                        {link.verified === null && (
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>

                    {selectedLink?.id === link.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Source Entity ID</p>
                            <p className="font-mono text-sm truncate">{link.source_entity_id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Target Entity ID</p>
                            <p className="font-mono text-sm truncate">{link.target_entity_id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Discovered By</p>
                            <p className="text-sm">{link.discovered_by || "AI Agent"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Created</p>
                            <p className="text-sm">
                              {new Date(link.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {link.verified === null && (
                          <div className="flex items-center gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                verifyMutation.mutate({ linkId: link.id, verified: true });
                              }}
                              disabled={verifyMutation.isPending}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                verifyMutation.mutate({ linkId: link.id, verified: false });
                              }}
                              disabled={verifyMutation.isPending}
                            >
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info("Opening entity details...");
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Entities
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="graph" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Connection Graph</CardTitle>
              <CardDescription>
                Visual representation of cross-module relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center border border-dashed border-border rounded-lg">
                <div className="text-center space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(moduleStats).slice(0, 8).map(([module, count]) => (
                      <div key={module} className="flex flex-col items-center gap-2">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          MODULE_COLORS[module]?.split(" ")[0] || "bg-muted"
                        }`}>
                          <span className="text-xl font-bold">{count}</span>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">{module}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Interactive graph visualization coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
