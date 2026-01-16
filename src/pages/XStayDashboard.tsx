import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  Home,
  Plus,
  Calendar,
  DollarSign,
  Users,
  Star,
  MapPin,
  Bed,
  Bath,
  Search,
  Filter,
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface Property {
  id: string;
  property_name: string;
  address: string;
  city: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  square_feet: number | null;
  nightly_rate: number;
  weekly_rate: number | null;
  monthly_rate: number | null;
  listing_status: string;
  is_featured: boolean;
  photos: string[];
  created_at: string;
}

interface Booking {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_amount: number;
  booking_status: string;
  created_at: string;
}

const XStayDashboard = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("properties");
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewProperty, setShowNewProperty] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newProperty, setNewProperty] = useState({
    property_name: "",
    address: "",
    city: "Houston",
    property_type: "luxury_home",
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    nightly_rate: 500
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
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: propertiesData, error: propError } = await supabase
        .from("xstay_properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (propError) throw propError;
      setProperties(propertiesData || []);

      const { data: bookingsData, error: bookError } = await supabase
        .from("xstay_bookings")
        .select("*")
        .order("check_in", { ascending: true });

      if (bookError) throw bookError;
      setBookings(bookingsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load property data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProperty = async () => {
    if (!user || !newProperty.property_name || !newProperty.address) {
      toast.error("Please provide property name and address");
      return;
    }

    try {
      const { error } = await supabase.from("xstay_properties").insert({
        ...newProperty,
        user_id: user.id,
        listing_status: "draft"
      });

      if (error) throw error;

      toast.success("Property created successfully!");
      setShowNewProperty(false);
      setNewProperty({
        property_name: "",
        address: "",
        city: "Houston",
        property_type: "luxury_home",
        bedrooms: 3,
        bathrooms: 2,
        max_guests: 6,
        nightly_rate: 500
      });
      loadData();
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("Failed to create property");
    }
  };

  const stats = {
    totalProperties: properties.length,
    activeListings: properties.filter(p => p.listing_status === "active").length,
    upcomingBookings: bookings.filter(b => b.booking_status === "confirmed" && new Date(b.check_in) > new Date()).length,
    totalRevenue: bookings.filter(b => b.booking_status === "confirmed").reduce((sum, b) => sum + (b.total_amount || 0), 0)
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      active: "bg-green-500/10 text-green-500",
      inactive: "bg-yellow-500/10 text-yellow-500",
      archived: "bg-red-500/10 text-red-500"
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const filteredProperties = properties.filter(p =>
    p.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Home className="w-10 h-10 text-primary" />
                xSTAYx Property Management
              </h1>
              <p className="text-muted-foreground">
                Luxury property rental management for World Cup 2026 and beyond
              </p>
            </div>
            <WhitePaperIcon moduleKey="xstay" moduleName="xSTAYx" variant="button" />
          </div>
          <Dialog open={showNewProperty} onOpenChange={setShowNewProperty}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Property Name</Label>
                  <Input
                    placeholder="e.g., River Oaks Estate"
                    value={newProperty.property_name}
                    onChange={(e) => setNewProperty({ ...newProperty, property_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    placeholder="Full street address"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={newProperty.city}
                      onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select
                      value={newProperty.property_type}
                      onValueChange={(v) => setNewProperty({ ...newProperty, property_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mansion">Mansion</SelectItem>
                        <SelectItem value="luxury_home">Luxury Home</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="estate">Estate</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Input
                      type="number"
                      value={newProperty.bedrooms}
                      onChange={(e) => setNewProperty({ ...newProperty, bedrooms: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Input
                      type="number"
                      value={newProperty.bathrooms}
                      onChange={(e) => setNewProperty({ ...newProperty, bathrooms: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Guests</Label>
                    <Input
                      type="number"
                      value={newProperty.max_guests}
                      onChange={(e) => setNewProperty({ ...newProperty, max_guests: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nightly Rate</Label>
                    <Input
                      type="number"
                      value={newProperty.nightly_rate}
                      onChange={(e) => setNewProperty({ ...newProperty, nightly_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateProperty} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Property
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Properties", value: stats.totalProperties, icon: Home, color: "text-blue-500" },
            { label: "Active Listings", value: stats.activeListings, icon: Star, color: "text-green-500" },
            { label: "Upcoming Bookings", value: stats.upcomingBookings, icon: Calendar, color: "text-purple-500" },
            { label: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-500" }
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
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="properties">
              <Home className="w-4 h-4 mr-2" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="owners">
              <Users className="w-4 h-4 mr-2" />
              Owners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading properties...</div>
            ) : filteredProperties.length === 0 ? (
              <Card className="p-8 text-center">
                <Home className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No properties yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first luxury property to get started
                </p>
                <Button onClick={() => setShowNewProperty(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden shadow-elevated border border-border cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {property.photos?.length > 0 ? (
                        <img src={property.photos[0]} alt={property.property_name} className="w-full h-full object-cover" />
                      ) : (
                        <Home className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold truncate">{property.property_name}</h3>
                        <Badge className={getStatusBadge(property.listing_status)}>
                          {property.listing_status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-3 h-3" />
                        {property.address}, {property.city}
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          {property.bedrooms}
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          {property.bathrooms}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {property.max_guests}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold">
                          ${property.nightly_rate}<span className="text-xs text-muted-foreground">/night</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Bookings Management</h3>
              <p className="text-sm text-muted-foreground">
                View and manage property bookings
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="owners" className="mt-6">
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Property Owners</h3>
              <p className="text-sm text-muted-foreground">
                Manage homeowner relationships and payouts
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default XStayDashboard;
