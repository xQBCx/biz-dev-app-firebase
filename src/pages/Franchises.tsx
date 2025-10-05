import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, TrendingUp, DollarSign, Users, Store, Award, Plus } from "lucide-react";
import { FranchiseCard } from "@/components/FranchiseCard";
import { FranchiseDetailsModal } from "@/components/FranchiseDetailsModal";
import { CreateFranchiseModal } from "@/components/CreateFranchiseModal";
import { FranchiseDataGenerator } from "@/components/FranchiseDataGenerator";
import { useAuth } from "@/hooks/useAuth";

export default function Franchises() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedFranchise, setSelectedFranchise] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [investmentRange, setInvestmentRange] = useState<string>("all");

  const { data: franchises = [], isLoading, refetch } = useQuery({
    queryKey: ["franchises", searchQuery, selectedIndustry, investmentRange],
    queryFn: async () => {
      let query = supabase
        .from("franchises")
        .select("*")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,brand_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedIndustry !== "all") {
        query = query.eq("industry", selectedIndustry);
      }

      if (investmentRange !== "all") {
        const ranges: Record<string, [number, number]> = {
          low: [0, 50000],
          medium: [50000, 150000],
          high: [150000, 500000],
          premium: [500000, 10000000],
        };
        const [min, max] = ranges[investmentRange] || [0, 10000000];
        query = query.gte("investment_min", min).lte("investment_max", max);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: myFranchises = [] } = useQuery({
    queryKey: ["my-franchises", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("franchises")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: myApplications = [] } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("franchise_applications")
        .select("*, franchises(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const industries = [
    "Food & Beverage",
    "Retail",
    "Health & Fitness",
    "Education & Training",
    "Home Services",
    "Automotive",
    "Real Estate",
    "Technology",
    "Hospitality",
    "Professional Services",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Franchise Marketplace
              </h1>
              <p className="text-muted-foreground">
                Discover proven business models across all industries
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowGenerator(true)} size="lg" variant="outline" className="gap-2">
                <Store className="w-5 h-5" />
                Generate Sample Data
              </Button>
              <Button onClick={() => setShowCreateModal(true)} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                List Your Franchise
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{franchises.length}</p>
                <p className="text-sm text-muted-foreground">Available Franchises</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{industries.length}</p>
                <p className="text-sm text-muted-foreground">Industries</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myApplications.length}</p>
                <p className="text-sm text-muted-foreground">My Applications</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myFranchises.length}</p>
                <p className="text-sm text-muted-foreground">My Franchises</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="my-franchises">My Franchises</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search franchises..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={investmentRange} onValueChange={setInvestmentRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Investment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranges</SelectItem>
                    <SelectItem value="low">Under $50K</SelectItem>
                    <SelectItem value="medium">$50K - $150K</SelectItem>
                    <SelectItem value="high">$150K - $500K</SelectItem>
                    <SelectItem value="premium">$500K+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Franchise Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse bg-muted" />
                ))}
              </div>
            ) : franchises.length === 0 ? (
              showGenerator ? (
                <FranchiseDataGenerator onComplete={() => {
                  setShowGenerator(false);
                  refetch();
                }} />
              ) : (
                <Card className="p-12 text-center">
                  <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No franchises found</h3>
                  <p className="text-muted-foreground mb-4">Get started by generating sample data</p>
                  <Button onClick={() => setShowGenerator(true)}>
                    <Store className="w-4 h-4 mr-2" />
                    Generate Sample Data
                  </Button>
                </Card>
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {franchises.map((franchise) => (
                  <FranchiseCard
                    key={franchise.id}
                    franchise={franchise}
                    onClick={() => setSelectedFranchise(franchise)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-franchises" className="space-y-6">
            {myFranchises.length === 0 ? (
              <Card className="p-12 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No franchises yet</h3>
                <p className="text-muted-foreground mb-4">Start by creating your first franchise listing</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Franchise
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFranchises.map((franchise) => (
                  <FranchiseCard
                    key={franchise.id}
                    franchise={franchise}
                    onClick={() => setSelectedFranchise(franchise)}
                    isOwner
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {myApplications.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground">Browse franchises and apply to get started</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {myApplications.map((application: any) => (
                  <Card key={application.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {application.franchises?.logo_url && (
                          <img
                            src={application.franchises.logo_url}
                            alt={application.franchises.brand_name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {application.franchises?.brand_name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Applied {new Date(application.created_at).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            <Badge variant={
                              application.status === "approved" ? "default" :
                              application.status === "rejected" ? "destructive" :
                              "secondary"
                            }>
                              {application.status}
                            </Badge>
                            {application.desired_location && (
                              <Badge variant="outline">{application.desired_location}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedFranchise(application.franchises)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <FranchiseDetailsModal
        franchise={selectedFranchise}
        open={!!selectedFranchise}
        onOpenChange={(open) => !open && setSelectedFranchise(null)}
        onUpdate={refetch}
      />

      <CreateFranchiseModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={refetch}
      />
    </div>
  );
}
