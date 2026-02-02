import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Plus, Globe, Search } from "lucide-react";
import { TLDCard } from "@/components/tld/TLDCard";
import { AddTLDDialog } from "@/components/tld/AddTLDDialog";
import { PriorityDomainsPanel } from "@/components/tld/PriorityDomainsPanel";
import { TLDDomainList } from "@/components/tld/TLDDomainList";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TLDRegistry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [addTLDOpen, setAddTLDOpen] = useState(false);
  const [selectedTLD, setSelectedTLD] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch owned TLDs
  const { data: tlds, isLoading: tldsLoading } = useQuery({
    queryKey: ["owned-tlds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owned_tlds")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch domain stats for each TLD
  const { data: domainStats } = useQuery({
    queryKey: ["tld-domain-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tld_registered_domains")
        .select("tld_id, status");
      if (error) throw error;
      
      const stats: Record<string, { total: number; available: number; allocated: number; sold: number }> = {};
      data.forEach((d) => {
        if (!stats[d.tld_id]) {
          stats[d.tld_id] = { total: 0, available: 0, allocated: 0, sold: 0 };
        }
        stats[d.tld_id].total++;
        if (d.status === "available") stats[d.tld_id].available++;
        if (d.status === "allocated") stats[d.tld_id].allocated++;
        if (d.status === "sold") stats[d.tld_id].sold++;
      });
      return stats;
    },
  });

  // Fetch sales revenue
  const { data: salesRevenue } = useQuery({
    queryKey: ["tld-sales-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tld_domain_sales")
        .select("sale_price_usd, payment_status")
        .eq("payment_status", "completed");
      if (error) throw error;
      return data.reduce((sum, s) => sum + Number(s.sale_price_usd || 0), 0);
    },
  });

  const activeTLD = tlds?.find((t) => t.id === selectedTLD) || tlds?.[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            TLD Registry
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your owned Top-Level Domains and create premium domain names
          </p>
        </div>
        <Button onClick={() => setAddTLDOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add TLD
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total TLDs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tlds?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registered Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(domainStats || {}).reduce((s, d) => s + d.total, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Domains Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(domainStats || {}).reduce((s, d) => s + d.sold, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(salesRevenue || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TLD Cards */}
      {tldsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : tlds && tlds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tlds.map((tld) => (
            <TLDCard
              key={tld.id}
              tld={tld}
              stats={domainStats?.[tld.id]}
              isSelected={activeTLD?.id === tld.id}
              onSelect={() => setSelectedTLD(tld.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No TLDs Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first Top-Level Domain to start managing domains
          </p>
          <Button onClick={() => setAddTLDOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First TLD
          </Button>
        </Card>
      )}

      {/* Domain Management Tabs */}
      {activeTLD && (
        <Tabs defaultValue="domains" className="mt-6">
          <TabsList>
            <TabsTrigger value="domains">Registered Domains</TabsTrigger>
            <TabsTrigger value="priority">Priority List</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Tiers</TabsTrigger>
          </TabsList>

          <TabsContent value="domains" className="mt-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <TLDDomainList tldId={activeTLD.id} searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="priority" className="mt-4">
            <PriorityDomainsPanel tldId={activeTLD.id} tldName={activeTLD.tld_name} />
          </TabsContent>

          <TabsContent value="pricing" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Tiers for .{activeTLD.tld_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configure pricing tiers for domain sales. Coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <AddTLDDialog open={addTLDOpen} onOpenChange={setAddTLDOpen} />
    </div>
  );
}
