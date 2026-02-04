import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import VenueFilters from "@/components/VenueFilters";
import VenueCard from "@/components/VenueCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Venue {
  id: string;
  name: string;
  type: string;
  current_genre: string | null;
  crowd_level: string | null;
  image_url: string | null;
  address: string | null;
  open_until: string | null;
}

const Index = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [crowdFilter, setCrowdFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [venues, searchQuery, typeFilter, crowdFilter, locationFilter]);

  const fetchVenues = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load venues");
      setLoading(false);
      return;
    }

    setVenues(data || []);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...venues];

    // Search filter (name or genre)
    if (searchQuery) {
      filtered = filtered.filter(
        (venue) =>
          venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          venue.current_genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (venue) => venue.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Crowd level filter
    if (crowdFilter !== "all") {
      filtered = filtered.filter(
        (venue) => venue.crowd_level?.toLowerCase() === crowdFilter.toLowerCase()
      );
    }

    // Location filter (address)
    if (locationFilter) {
      filtered = filtered.filter((venue) =>
        venue.address?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredVenues(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <VenueFilters
        onSearchChange={setSearchQuery}
        onTypeChange={setTypeFilter}
        onCrowdLevelChange={setCrowdFilter}
        onLocationChange={setLocationFilter}
        totalVenues={filteredVenues.length}
      />
      
      <section id="venues-section" className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading venues...
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No venues found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  id={venue.id}
                  name={venue.name}
                  type={venue.type}
                  genre={venue.current_genre || "No genre"}
                  crowdLevel={
                    (venue.crowd_level as "low" | "medium" | "high" | "packed") || "low"
                  }
                  image={
                    venue.image_url ||
                    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
                  }
                  distance="--"
                  openUntil={venue.open_until || "Unknown"}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
