import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, DollarSign, TrendingUp, Building2, Filter, Download } from "lucide-react";
import { useState } from "react";

interface DiscoveredProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  country: string;
  propertyType: string;
  marketValue: number;
  opportunityScore: number;
  estimatedROI: number;
  aiInsights: string[];
  status: "available" | "under-review" | "high-priority";
}

const mockProperties: DiscoveredProperty[] = [
  {
    id: "1",
    address: "123 Industrial Blvd",
    city: "Austin",
    state: "TX",
    country: "USA",
    propertyType: "Industrial",
    marketValue: 8500000,
    opportunityScore: 94,
    estimatedROI: 18.5,
    aiInsights: [
      "Prime location near tech hub",
      "Strong infrastructure growth",
      "Below market pricing by 12%"
    ],
    status: "high-priority"
  },
  {
    id: "2",
    address: "456 Commerce Center",
    city: "Dubai",
    state: "Dubai",
    country: "UAE",
    propertyType: "Commercial",
    marketValue: 12300000,
    opportunityScore: 89,
    estimatedROI: 15.2,
    aiInsights: [
      "Emerging district with high demand",
      "Government incentives available",
      "Strong rental yields"
    ],
    status: "available"
  },
  {
    id: "3",
    address: "789 Residential Complex",
    city: "Singapore",
    state: "Singapore",
    country: "Singapore",
    propertyType: "Residential",
    marketValue: 6700000,
    opportunityScore: 87,
    estimatedROI: 14.8,
    aiInsights: [
      "High-growth neighborhood",
      "Excellent transportation access",
      "Strong demographic trends"
    ],
    status: "under-review"
  },
  {
    id: "4",
    address: "321 Tech Park",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    propertyType: "Industrial",
    marketValue: 4200000,
    opportunityScore: 92,
    estimatedROI: 22.3,
    aiInsights: [
      "Rapidly expanding tech corridor",
      "Infrastructure upgrades planned",
      "High appreciation potential"
    ],
    status: "high-priority"
  }
];

export default function XBuilderxDiscovery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = propertyTypeFilter === "all" || property.propertyType === propertyTypeFilter;
    const matchesCountry = countryFilter === "all" || property.country === countryFilter;
    return matchesSearch && matchesType && matchesCountry;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    return "text-yellow-600";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "high-priority": "destructive",
      "under-review": "secondary",
      "available": "default"
    };
    return variants[status] || "default";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Automated Discovery</h1>
          <p className="text-muted-foreground">
            AI-powered property discovery and market intelligence
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">+284 this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Score 90+</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Markets Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">Global reach</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg. ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16.8%</div>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location, address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Residential">Residential</SelectItem>
                </SelectContent>
              </Select>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="UAE">UAE</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("");
                setPropertyTypeFilter("all");
                setCountryFilter("all");
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {property.address}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {property.city}, {property.state}, {property.country}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadge(property.status) as any}>
                    {property.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Property Details */}
                  <div>
                    <p className="text-sm font-medium mb-1">Property Type</p>
                    <p className="text-sm text-muted-foreground">{property.propertyType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Market Value</p>
                    <p className="text-sm flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {(property.marketValue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Opportunity Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(property.opportunityScore)}`}>
                      {property.opportunityScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Est. ROI</p>
                    <p className="text-sm flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      {property.estimatedROI}%
                    </p>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">AI Insights:</p>
                  <ul className="space-y-1">
                    {property.aiInsights.map((insight, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button size="sm">View Details</Button>
                  <Button size="sm" variant="outline">Generate Report</Button>
                  <Button size="sm" variant="outline">Add to Portfolio</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No properties match your search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
