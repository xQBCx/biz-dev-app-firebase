import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sliders, Search, Users, MapPin } from "lucide-react";

interface VenueFiltersProps {
  onSearchChange: (search: string) => void;
  onTypeChange: (type: string) => void;
  onCrowdLevelChange: (level: string) => void;
  onLocationChange: (location: string) => void;
  totalVenues: number;
}

const VenueFilters = ({
  onSearchChange,
  onTypeChange,
  onCrowdLevelChange,
  onLocationChange,
  totalVenues,
}: VenueFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCrowdLevel, setSelectedCrowdLevel] = useState("all");
  const [locationSearch, setLocationSearch] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    onTypeChange(value);
  };

  const handleCrowdLevelChange = (value: string) => {
    setSelectedCrowdLevel(value);
    onCrowdLevelChange(value);
  };

  const handleLocationChange = (value: string) => {
    setLocationSearch(value);
    onLocationChange(value);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedCrowdLevel("all");
    setLocationSearch("");
    onSearchChange("");
    onTypeChange("all");
    onCrowdLevelChange("all");
    onLocationChange("");
  };

  return (
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border py-4">
      <div className="container mx-auto px-4">
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Sliders className="w-4 h-4 mr-2" />
                Filters & Search
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filter Venues</SheetTitle>
                <SheetDescription>
                  Find the perfect venue for your vibe
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search venues..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    placeholder="City or address..."
                    value={locationSearch}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Venue Type</label>
                  <Select value={selectedType} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="nightclub">Nightclub</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="cafe">Cafe</SelectItem>
                      <SelectItem value="lounge">Lounge</SelectItem>
                      <SelectItem value="sports venue">Sports Venue</SelectItem>
                      <SelectItem value="concert venue">Concert Venue</SelectItem>
                      <SelectItem value="theater">Theater</SelectItem>
                      <SelectItem value="park">Park</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Crowd Level</label>
                  <Select value={selectedCrowdLevel} onValueChange={handleCrowdLevelChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any crowd" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Crowd</SelectItem>
                      <SelectItem value="low">Low - Quiet & Relaxed</SelectItem>
                      <SelectItem value="medium">Medium - Moderate Activity</SelectItem>
                      <SelectItem value="high">High - Busy & Energetic</SelectItem>
                      <SelectItem value="packed">Packed - Full Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={resetFilters} variant="outline" className="w-full">
                  Reset Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search venues by name or genre..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                placeholder="Location..."
                value={locationSearch}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="pl-10 w-48"
              />
            </div>

            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Venue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="nightclub">Nightclub</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="cafe">Cafe</SelectItem>
                <SelectItem value="lounge">Lounge</SelectItem>
                <SelectItem value="sports venue">Sports Venue</SelectItem>
                <SelectItem value="concert venue">Concert Venue</SelectItem>
                <SelectItem value="theater">Theater</SelectItem>
                <SelectItem value="park">Park</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCrowdLevel} onValueChange={handleCrowdLevelChange}>
              <SelectTrigger className="w-48">
                <Users className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Crowd level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Crowd</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={resetFilters} variant="outline" size="sm">
              Reset
            </Button>
          </div>

          <Badge variant="secondary" className="ml-auto">
            {totalVenues} venues
          </Badge>
        </div>

        {/* Mobile venue count */}
        <div className="md:hidden flex justify-center mt-2">
          <Badge variant="secondary">{totalVenues} venues found</Badge>
        </div>
      </div>
    </div>
  );
};

export default VenueFilters;
