import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WhitePaperIcon } from "@/components/whitepaper/WhitePaperIcon";
import {
  Search,
  Plus,
  Target,
  Globe,
  Building2,
  Calendar,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  Radar,
  Zap,
  Filter,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface WatchlistItem {
  id: string;
  name: string;
  target_type: string;
  target_value: string;
  keywords: string[];
  priority: string;
  scan_frequency: string;
  is_active: boolean;
  last_scanned_at: string | null;
  created_at: string;
}

interface Opportunity {
  id: string;
  headline: string;
  summary: string;
  source_type: string;
  source_url: string | null;
  relevance_score: number;
  opportunity_type: string | null;
  estimated_value: number | null;
  status: string;
  entities_mentioned: any;
  created_at: string;
}

const OpportunityDiscovery = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { activeClientId } = useActiveClient();
  const [activeTab, setActiveTab] = useState("opportunities");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showAddWatchlist, setShowAddWatchlist] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Form state for new watchlist item
  const [newWatchlist, setNewWatchlist] = useState({
    name: "",
    target_type: "company",
    target_value: "",
    keywords: "",
    priority: "medium",
    scan_frequency: "daily"
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeClientId]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [watchlistRes, opportunitiesRes] = await Promise.all([
        supabase
          .from("opportunity_watchlist")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("discovered_opportunities")
          .select("*")
          .eq("user_id", user.id)
          .order("relevance_score", { ascending: false })
      ]);

      if (watchlistRes.error) throw watchlistRes.error;
      if (opportunitiesRes.error) throw opportunitiesRes.error;

      setWatchlist(watchlistRes.data || []);
      setOpportunities(opportunitiesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load opportunity data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWatchlist = async () => {
    if (!user || !newWatchlist.name || !newWatchlist.target_value) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const { error } = await supabase.from("opportunity_watchlist").insert({
        user_id: user.id,
        client_id: activeClientId || null,
        name: newWatchlist.name,
        target_type: newWatchlist.target_type,
        target_value: newWatchlist.target_value,
        keywords: newWatchlist.keywords.split(",").map(k => k.trim()).filter(Boolean),
        priority: newWatchlist.priority,
        scan_frequency: newWatchlist.scan_frequency
      });

      if (error) throw error;
      
      toast.success("Watchlist item added successfully");
      setShowAddWatchlist(false);
      setNewWatchlist({
        name: "",
        target_type: "company",
        target_value: "",
        keywords: "",
        priority: "medium",
        scan_frequency: "daily"
      });
      loadData();
    } catch (error) {
      console.error("Error adding watchlist:", error);
      toast.error("Failed to add watchlist item");
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const { error } = await supabase.functions.invoke("opportunity-scanner", {
        body: { user_id: user?.id }
      });
      
      if (error) throw error;
      toast.success("Opportunity scan completed");
      loadData();
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Scan feature coming soon - edge function not yet deployed");
    } finally {
      setIsScanning(false);
    }
  };

  const updateOpportunityStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("discovered_opportunities")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Opportunity marked as ${status}`);
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const convertToCRM = async (opportunity: Opportunity) => {
    // Navigate to CRM with pre-filled data
    const entities = opportunity.entities_mentioned || {};
    if (entities.companies?.length > 0) {
      navigate("/crm/companies/new", { 
        state: { prefill: { name: entities.companies[0], notes: opportunity.summary } }
      });
    } else {
      navigate("/crm/contacts/new", {
        state: { prefill: { notes: `From opportunity: ${opportunity.headline}` } }
      });
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || opp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "reviewing": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "qualified": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "converted": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "dismissed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const stats = {
    totalWatchlist: watchlist.length,
    activeWatchlist: watchlist.filter(w => w.is_active).length,
    newOpportunities: opportunities.filter(o => o.status === "new").length,
    qualifiedOpportunities: opportunities.filter(o => o.status === "qualified").length,
    totalValue: opportunities.reduce((sum, o) => sum + (o.estimated_value || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Radar className="w-10 h-10 text-primary" />
                Opportunity Discovery Engine
              </h1>
              <p className="text-muted-foreground">
                Proactive AI-powered opportunity scanning and lead generation
              </p>
            </div>
            <WhitePaperIcon moduleKey="opportunity-discovery" moduleName="Opportunity Discovery" variant="button" />
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleScan}
              disabled={isScanning}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? "Scanning..." : "Run Scan"}
            </Button>
            <Dialog open={showAddWatchlist} onOpenChange={setShowAddWatchlist}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Watchlist
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Watchlist Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g., World Cup 2026 Companies"
                      value={newWatchlist.name}
                      onChange={(e) => setNewWatchlist({ ...newWatchlist, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Type</Label>
                      <Select
                        value={newWatchlist.target_type}
                        onValueChange={(v) => setNewWatchlist({ ...newWatchlist, target_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">Company</SelectItem>
                          <SelectItem value="country">Country</SelectItem>
                          <SelectItem value="industry">Industry</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="person">Person</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Value</Label>
                      <Input
                        placeholder="e.g., Oil & Gas, Brazil, FIFA"
                        value={newWatchlist.target_value}
                        onChange={(e) => setNewWatchlist({ ...newWatchlist, target_value: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Keywords (comma-separated)</Label>
                    <Textarea
                      placeholder="e.g., investment, partnership, Houston, expansion"
                      value={newWatchlist.keywords}
                      onChange={(e) => setNewWatchlist({ ...newWatchlist, keywords: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={newWatchlist.priority}
                        onValueChange={(v) => setNewWatchlist({ ...newWatchlist, priority: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Scan Frequency</Label>
                      <Select
                        value={newWatchlist.scan_frequency}
                        onValueChange={(v) => setNewWatchlist({ ...newWatchlist, scan_frequency: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleAddWatchlist} className="w-full">
                    Add to Watchlist
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Active Watchlist", value: stats.activeWatchlist, icon: Eye, color: "text-blue-500" },
            { label: "New Opportunities", value: stats.newOpportunities, icon: Zap, color: "text-yellow-500" },
            { label: "Qualified", value: stats.qualifiedOpportunities, icon: CheckCircle, color: "text-green-500" },
            { label: "Total Tracked", value: opportunities.length, icon: Target, color: "text-purple-500" },
            { label: "Est. Value", value: `$${(stats.totalValue / 1000000).toFixed(1)}M`, icon: TrendingUp, color: "text-emerald-500" }
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 shadow-elevated border border-border">
              <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="opportunities">
              <Target className="w-4 h-4 mr-2" />
              Opportunities ({filteredOpportunities.length})
            </TabsTrigger>
            <TabsTrigger value="watchlist">
              <Eye className="w-4 h-4 mr-2" />
              Watchlist ({watchlist.length})
            </TabsTrigger>
          </TabsList>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="mt-6">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredOpportunities.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Radar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Opportunities Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Add items to your watchlist and run a scan to discover opportunities
                </p>
                <Button onClick={() => setShowAddWatchlist(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Watchlist Item
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOpportunities.map((opp) => (
                  <Card key={opp.id} className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(opp.status)}>{opp.status}</Badge>
                          <Badge variant="outline">{opp.source_type}</Badge>
                          {opp.opportunity_type && (
                            <Badge variant="outline">{opp.opportunity_type}</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{opp.headline}</h3>
                        <p className="text-muted-foreground text-sm">{opp.summary}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary mb-1">
                          {opp.relevance_score}%
                        </div>
                        <div className="text-xs text-muted-foreground">Relevance</div>
                        {opp.estimated_value && (
                          <div className="mt-2 text-sm font-medium text-green-500">
                            ${(opp.estimated_value / 1000).toFixed(0)}K est.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        Discovered {new Date(opp.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        {opp.source_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={opp.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Source
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateOpportunityStatus(opp.id, "qualified")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Qualify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => convertToCRM(opp)}
                        >
                          <Building2 className="w-4 h-4 mr-1" />
                          Add to CRM
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateOpportunityStatus(opp.id, "dismissed")}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="mt-6">
            {watchlist.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Watchlist Items</h3>
                <p className="text-muted-foreground mb-6">
                  Add companies, countries, or industries to monitor for opportunities
                </p>
                <Button onClick={() => setShowAddWatchlist(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlist.map((item) => (
                  <Card key={item.id} className="p-6 shadow-elevated border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <Badge variant="outline" className="mr-2">{item.target_type}</Badge>
                        <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-muted'}`} />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span>{item.target_value}</span>
                      </div>
                      {item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.keywords.slice(0, 3).map((kw, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{kw}</Badge>
                          ))}
                          {item.keywords.length > 3 && (
                            <Badge variant="secondary" className="text-xs">+{item.keywords.length - 3}</Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground pt-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">
                          {item.last_scanned_at 
                            ? `Last scan: ${new Date(item.last_scanned_at).toLocaleDateString()}`
                            : "Never scanned"
                          }
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OpportunityDiscovery;
