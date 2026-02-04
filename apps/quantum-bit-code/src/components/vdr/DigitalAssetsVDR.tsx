import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, TrendingUp, FileText, Shield } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DigitalAssetsVDR = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch all domains
  const { data: domains, isLoading: domainsLoading } = useQuery({
    queryKey: ["domains-vdr", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("domains")
        .select("*")
        .order("estimated_value_high", { ascending: false });
      
      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch TLDs
  const { data: tlds } = useQuery({
    queryKey: ["tlds-vdr"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tlds")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch narratives
  const { data: narratives } = useQuery({
    queryKey: ["narratives-vdr"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("digital_asset_narratives")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const categories = [...new Set(domains?.map(d => d.category).filter(Boolean))];
  
  const totalValueLow = domains?.reduce((sum, d) => sum + (Number(d.estimated_value_low) || 0), 0) || 0;
  const totalValueHigh = domains?.reduce((sum, d) => sum + (Number(d.estimated_value_high) || 0), 0) || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Badge variant="secondary" className="px-4 py-2">
          <Shield className="mr-2 h-4 w-4 text-accent" />
          Confidential — NDA Protected
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Digital Asset Portfolio
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Complete domain portfolio, TLD acquisition strategy, and strategic valuation narratives 
          for the NANO IP ecosystem.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <Globe className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold text-foreground">{domains?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Total Domains</p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatCurrency(totalValueLow)} - {formatCurrency(totalValueHigh)}
          </p>
          <p className="text-sm text-muted-foreground">Portfolio Valuation</p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <FileText className="h-6 w-6" />
          </div>
          <p className="text-3xl font-bold text-foreground">{categories.length}</p>
          <p className="text-sm text-muted-foreground">Categories</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="domains" className="space-y-6">
        <TabsList>
          <TabsTrigger value="domains">Domain Portfolio</TabsTrigger>
          <TabsTrigger value="tlds">TLD Strategy</TabsTrigger>
          <TabsTrigger value="narratives">Strategic Narratives</TabsTrigger>
        </TabsList>

        {/* Domain Portfolio Tab */}
        <TabsContent value="domains" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category as string)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Domains Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Valuation Range</TableHead>
                  <TableHead>Strategic Role</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domainsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : domains?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No domains found.
                    </TableCell>
                  </TableRow>
                ) : (
                  domains?.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell className="font-semibold">{domain.domain_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{domain.category || "Uncategorized"}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatCurrency(domain.estimated_value_low)} - {formatCurrency(domain.estimated_value_high)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {domain.strategic_role || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md">
                        {domain.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* TLD Strategy Tab */}
        <TabsContent value="tlds" className="space-y-6">
          {tlds?.map((tld) => (
            <Card key={tld.id} className="p-6 space-y-4 border-accent/20">
              <div className="flex items-center gap-3">
                <Globe className="h-8 w-8 text-accent" />
                <h3 className="text-2xl font-bold text-foreground">{tld.tld_name}</h3>
                <Badge variant={tld.status === "acquired" ? "default" : "outline"}>
                  {tld.status}
                </Badge>
              </div>
              
              <p className="text-muted-foreground leading-relaxed">{tld.strategic_value}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Acquisition Cost</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(tld.estimated_cost_low)} - {formatCurrency(tld.estimated_cost_high)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Acquisition Target</p>
                  <p className="text-lg font-semibold text-foreground">
                    {tld.acquisition_target ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Strategic Narratives Tab */}
        <TabsContent value="narratives" className="space-y-6">
          {narratives?.map((narrative) => (
            <Card key={narrative.id} className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-semibold text-foreground">{narrative.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{narrative.body}</p>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DigitalAssetsVDR;
