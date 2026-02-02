import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PriorityDomainsPanelProps {
  tldId: string;
  tldName: string;
}

// Pre-defined priority domains by category
const SUGGESTED_DOMAINS: Record<string, string[]> = {
  trades: [
    "roofing", "electrical", "plumbing", "hvac", "construction", "contracting",
    "welding", "carpentry", "masonry", "landscaping", "painting", "flooring",
    "concrete", "demolition", "excavation", "fencing", "gutters", "insulation",
    "drywall", "siding", "windows", "doors", "garage", "foundation",
    "waterproofing", "restoration", "remodeling", "handyman", "maintenance", "inspection"
  ],
  tech: [
    "nano", "quantum", "datacenter", "cloud", "ai", "robotics", "automation",
    "blockchain", "cyber", "iot", "biotech", "fintech", "proptech", "healthtech",
    "edtech", "cleantech", "agritech", "spacetech", "deeptech", "hardtech"
  ],
  health: [
    "health", "medical", "wellness", "fitness", "pharma", "biotech", "nutrition",
    "therapy", "dental", "vision", "mental", "holistic", "rehab", "surgery"
  ],
  transport: [
    "cars", "trucks", "transportation", "logistics", "fleet", "aviation",
    "maritime", "rail", "freight", "delivery", "shipping", "cargo", "dispatch",
    "routing", "telematics"
  ],
  realestate: [
    "realestate", "property", "commercial", "residential", "industrial",
    "development", "mortgage", "rentals", "apartments", "homes", "land"
  ],
  communications: [
    "telecommunications", "wireless", "broadband", "satellite", "media",
    "broadcast", "streaming", "radio", "television", "network"
  ],
  premium: [
    "nike", "google", "apple", "microsoft", "amazon", "tesla", "meta", "nvidia",
    "openai", "anthropic", "spacex", "oracle", "ibm", "intel", "cisco", "adobe",
    "salesforce", "netflix", "disney", "spotify", "uber", "airbnb", "shopify"
  ],
};

export function PriorityDomainsPanel({ tldId, tldName }: PriorityDomainsPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newDomain, setNewDomain] = useState("");
  const [activeCategory, setActiveCategory] = useState("trades");

  const { data: priorityDomains, isLoading } = useQuery({
    queryKey: ["priority-domains", tldId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tld_priority_domains")
        .select("*")
        .eq("tld_id", tldId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addPriorityDomain = useMutation({
    mutationFn: async (domainName: string) => {
      const { error } = await supabase.from("tld_priority_domains").insert({
        tld_id: tldId,
        domain_name: domainName.toLowerCase(),
        category: activeCategory,
        is_reserved: true,
        added_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priority-domains"] });
      setNewDomain("");
      toast.success("Domain added to priority list");
    },
    onError: (error: any) => {
      toast.error("Failed to add domain", { description: error.message });
    },
  });

  const bulkAddDomains = useMutation({
    mutationFn: async (domains: string[]) => {
      const existingNames = new Set(priorityDomains?.map((d) => d.domain_name) || []);
      const newDomains = domains.filter((d) => !existingNames.has(d));

      if (newDomains.length === 0) {
        throw new Error("All suggested domains already added");
      }

      const records = newDomains.map((domain) => ({
        tld_id: tldId,
        domain_name: domain,
        category: activeCategory,
        is_reserved: true,
        added_by: user?.id,
        suggested_price_usd: activeCategory === "premium" ? 10000000 : null,
      }));

      const { error } = await supabase.from("tld_priority_domains").insert(records);
      if (error) throw error;
      return newDomains.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["priority-domains"] });
      toast.success(`Added ${count} domains to priority list`);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const removeDomain = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tld_priority_domains")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priority-domains"] });
      toast.success("Domain removed from priority list");
    },
  });

  const registerFromPriority = useMutation({
    mutationFn: async (domain: { id: string; domain_name: string; category: string }) => {
      // Create the registered domain
      const { error: regError } = await supabase.from("tld_registered_domains").insert({
        tld_id: tldId,
        domain_name: domain.domain_name,
        full_domain: `${domain.domain_name}.${tldName}`,
        owner_type: "reserved",
        status: "reserved",
        category: domain.category,
        registration_date: new Date().toISOString(),
      });
      if (regError) throw regError;

      // Update priority domain status
      const { error: updateError } = await supabase
        .from("tld_priority_domains")
        .update({ is_reserved: false })
        .eq("id", domain.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priority-domains"] });
      queryClient.invalidateQueries({ queryKey: ["tld-domains"] });
      queryClient.invalidateQueries({ queryKey: ["tld-domain-stats"] });
      toast.success("Domain registered from priority list");
    },
    onError: (error: any) => {
      toast.error("Failed to register", { description: error.message });
    },
  });

  const categoryDomains = priorityDomains?.filter(
    (d) => d.category === activeCategory
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Priority Domains for .{tldName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Reserve valuable domain names before making them available for sale
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new domain */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter domain name..."
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newDomain && addPriorityDomain.mutate(newDomain)}
          />
          <Button
            onClick={() => newDomain && addPriorityDomain.mutate(newDomain)}
            disabled={!newDomain || addPriorityDomain.isPending}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Category tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="tech">Tech</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="realestate">Real Estate</TabsTrigger>
            <TabsTrigger value="communications">Comms</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>

          {Object.keys(SUGGESTED_DOMAINS).map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-4 space-y-4">
              {/* Bulk add suggestions */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Suggested Domains</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => bulkAddDomains.mutate(SUGGESTED_DOMAINS[cat])}
                    disabled={bulkAddDomains.isPending}
                  >
                    {bulkAddDomains.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_DOMAINS[cat].slice(0, 15).map((domain) => {
                    const isAdded = priorityDomains?.some((d) => d.domain_name === domain);
                    return (
                      <Badge
                        key={domain}
                        variant={isAdded ? "secondary" : "outline"}
                        className="text-xs cursor-pointer"
                        onClick={() => !isAdded && addPriorityDomain.mutate(domain)}
                      >
                        {domain}
                        {isAdded && <Check className="h-3 w-3 ml-1" />}
                      </Badge>
                    );
                  })}
                  {SUGGESTED_DOMAINS[cat].length > 15 && (
                    <Badge variant="outline" className="text-xs">
                      +{SUGGESTED_DOMAINS[cat].length - 15} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* List of added priority domains */}
              <div className="space-y-2">
                {categoryDomains && categoryDomains.length > 0 ? (
                  categoryDomains.map((domain) => (
                    <div
                      key={domain.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {domain.domain_name}.{tldName}
                        </span>
                        {domain.suggested_price_usd && (
                          <Badge variant="outline" className="text-xs">
                            ${Number(domain.suggested_price_usd).toLocaleString()}
                          </Badge>
                        )}
                        {domain.is_reserved && (
                          <Badge className="text-xs">Reserved</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {domain.is_reserved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              registerFromPriority.mutate({
                                id: domain.id,
                                domain_name: domain.domain_name,
                                category: domain.category || cat,
                              })
                            }
                          >
                            Register
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeDomain.mutate(domain.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No priority domains in this category yet
                  </p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
