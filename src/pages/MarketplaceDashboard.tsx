import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Package, Users } from "lucide-react";
import { toast } from "sonner";

interface Connection {
  id: string;
  status: string;
  commission_agreed: number;
  commission_type: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    listing_type: string;
    category: string;
  };
  marketer_profile: {
    id: string;
    business_name: string;
  };
}

interface Listing {
  id: string;
  title: string;
  listing_type: string;
  category: string;
  status: string;
  created_at: string;
  _count?: {
    connections: number;
  };
}

export default function MarketplaceDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [marketerProfile, setMarketerProfile] = useState<any>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myConnections, setMyConnections] = useState<Connection[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Connection[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Check if user has a marketer profile
      const { data: marketerData } = await supabase
        .from("marketer_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      setMarketerProfile(marketerData);

      // Fetch user's listings (as product owner)
      const { data: listingsData, error: listingsError } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (listingsError) throw listingsError;
      setMyListings(listingsData || []);

      // Fetch connections where user is the marketer
      if (marketerData) {
        const { data: connectionsData, error: connectionsError } = await supabase
          .from("marketplace_connections")
          .select(`
            *,
            listing:marketplace_listings!marketplace_connections_listing_id_fkey(id, title, listing_type, category),
            marketer_profile:marketer_profiles!marketplace_connections_marketer_id_fkey(id, business_name)
          `)
          .eq("marketer_id", marketerData.id)
          .order("created_at", { ascending: false });

        if (connectionsError) throw connectionsError;
        setMyConnections(connectionsData || []);
      }

      // Fetch incoming requests for user's listings
      if (listingsData && listingsData.length > 0) {
        const listingIds = listingsData.map(l => l.id);
        const { data: requestsData, error: requestsError } = await supabase
          .from("marketplace_connections")
          .select(`
            *,
            listing:marketplace_listings!marketplace_connections_listing_id_fkey(id, title, listing_type, category),
            marketer_profile:marketer_profiles!marketplace_connections_marketer_id_fkey(id, business_name)
          `)
          .in("listing_id", listingIds)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (requestsError) throw requestsError;
        setIncomingRequests(requestsData || []);
      }
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("marketplace_connections")
        .update({ status: "active" })
        .eq("id", connectionId);

      if (error) throw error;
      toast.success("Partnership approved!");
      fetchDashboardData();
    } catch (error: any) {
      toast.error("Failed to approve request");
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("marketplace_connections")
        .update({ status: "cancelled" })
        .eq("id", connectionId);

      if (error) throw error;
      toast.success("Request rejected");
      fetchDashboardData();
    } catch (error: any) {
      toast.error("Failed to reject request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Marketplace Dashboard</h1>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/marketplace/listings/create")}>
              <Plus className="h-4 w-4 mr-2" />
              New Listing
            </Button>
            {!marketerProfile && (
              <Button variant="outline" onClick={() => navigate("/marketplace/marketer/create")}>
                <Users className="h-4 w-4 mr-2" />
                Create Marketer Profile
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                My Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{myListings.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Active Partnerships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {myConnections.filter(c => c.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{incomingRequests.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="partnerships">My Partnerships</TabsTrigger>
            <TabsTrigger value="requests">Incoming Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            {myListings.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">You haven't created any listings yet</p>
                  <Button onClick={() => navigate("/marketplace/listings/create")}>
                    Create Your First Listing
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myListings.map((listing) => (
                <Card key={listing.id} className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/marketplace/listings/${listing.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">{listing.title}</h3>
                          <Badge variant={listing.listing_type === "product" ? "default" : "secondary"}>
                            {listing.listing_type}
                          </Badge>
                          <Badge variant="outline">{listing.category}</Badge>
                          <Badge>{listing.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(listing.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="partnerships" className="space-y-4">
            {myConnections.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No partnerships yet</p>
                  <Button onClick={() => navigate("/marketplace/listings")}>
                    Browse Listings
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myConnections.map((connection) => (
                <Card key={connection.id} className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/marketplace/connections/${connection.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">{connection.listing.title}</h3>
                          <Badge>{connection.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Commission: {connection.commission_agreed}
                          {connection.commission_type === "percentage" ? "%" : " USD"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Started {new Date(connection.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {incomingRequests.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              incomingRequests.map((request) => (
                <Card key={request.id} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">
                            {request.marketer_profile.business_name}
                          </h3>
                          <Badge>Pending</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Wants to promote: {request.listing.title}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Requested {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button onClick={() => handleApproveRequest(request.id)}>
                            Approve
                          </Button>
                          <Button variant="outline" onClick={() => handleRejectRequest(request.id)}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
