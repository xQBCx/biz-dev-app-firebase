import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, Blocks, Brain, Globe, Gamepad2, Coins, Smartphone, Shield, Glasses } from "lucide-react";

interface ServiceOffering {
  id: string;
  category: string;
  subcategory: string | null;
  name: string;
  description: string | null;
  pricing_model: string;
  base_price: number | null;
  is_active: boolean;
  is_featured: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Blockchain: <Blocks className="h-5 w-5" />,
  AI: <Brain className="h-5 w-5" />,
  Metaverse: <Globe className="h-5 w-5" />,
  NFT: <Coins className="h-5 w-5" />,
  Exchange: <Coins className="h-5 w-5" />,
  Web3: <Globe className="h-5 w-5" />,
  Games: <Gamepad2 className="h-5 w-5" />,
  DApp: <Blocks className="h-5 w-5" />,
  Mobile: <Smartphone className="h-5 w-5" />,
  Cloud: <Globe className="h-5 w-5" />,
  Cybersecurity: <Shield className="h-5 w-5" />,
  "VR/AR": <Glasses className="h-5 w-5" />,
};

const ServiceOfferings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: offerings, isLoading } = useQuery({
    queryKey: ["service-offerings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_offerings")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("category")
        .order("name");
      if (error) throw error;
      return data as ServiceOffering[];
    },
  });

  const categories = offerings
    ? ["all", ...Array.from(new Set(offerings.map((o) => o.category)))]
    : ["all"];

  const filteredOfferings = offerings?.filter((offering) => {
    const matchesSearch =
      offering.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offering.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || offering.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredOfferings = offerings?.filter((o) => o.is_featured) || [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Service Offerings</h1>
          <p className="text-muted-foreground">
            Comprehensive blockchain, AI, and Web3 development services
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Featured Services */}
      {featuredOfferings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredOfferings.slice(0, 8).map((offering) => (
              <Card key={offering.id} className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {categoryIcons[offering.category]}
                      <Badge variant="secondary" className="text-xs">
                        {offering.category}
                      </Badge>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <CardTitle className="text-base">{offering.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm line-clamp-2">
                    {offering.description}
                  </CardDescription>
                  <Button className="w-full mt-4" size="sm">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Services by Category */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex-wrap h-auto gap-2 bg-transparent">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {category === "all" ? "All Services" : category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-20" />
                    <div className="h-5 bg-muted rounded w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOfferings?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No services found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredOfferings?.map((offering) => (
                <Card key={offering.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {categoryIcons[offering.category]}
                      <Badge variant="outline" className="text-xs">
                        {offering.subcategory || offering.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{offering.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm line-clamp-2">
                      {offering.description}
                    </CardDescription>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground capitalize">
                        {offering.pricing_model} pricing
                      </span>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceOfferings;
