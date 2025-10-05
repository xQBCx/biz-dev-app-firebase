import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Search,
  Building2,
  MapPin,
  Globe,
  Users,
  TrendingUp,
  DollarSign,
  Shield,
  ExternalLink,
  Filter,
  Star,
  Calendar,
  Briefcase,
  CheckCircle2,
  FileText,
  Target,
  BarChart3
} from "lucide-react";

type Business = {
  id: string;
  name: string;
  ein: string;
  type: string;
  industry: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  founded: string;
  revenue: string;
  employees: string;
  verified: boolean;
  website?: string;
  description: string;
  rating?: number;
  secretary_state_link: string;
};

const mockBusinesses: Business[] = [
  {
    id: "1",
    name: "TechFlow Solutions LLC",
    ein: "12-3456789",
    type: "LLC",
    industry: "Technology",
    location: { city: "San Francisco", state: "CA", country: "USA" },
    founded: "2019",
    revenue: "$2M - $5M",
    employees: "25-50",
    verified: true,
    website: "techflow.com",
    description: "AI-powered workflow automation for enterprise clients",
    rating: 4.8,
    secretary_state_link: "https://businesssearch.sos.ca.gov"
  },
  {
    id: "2",
    name: "GreenBuild Construction Inc",
    ein: "98-7654321",
    type: "C-Corp",
    industry: "Construction",
    location: { city: "Austin", state: "TX", country: "USA" },
    founded: "2015",
    revenue: "$10M - $50M",
    employees: "100-250",
    verified: true,
    website: "greenbuild.com",
    description: "Sustainable construction and green building solutions",
    rating: 4.6,
    secretary_state_link: "https://www.sos.state.tx.us"
  },
  {
    id: "3",
    name: "Wellness Partners LLC",
    ein: "45-6789123",
    type: "LLC",
    industry: "Healthcare",
    location: { city: "Denver", state: "CO", country: "USA" },
    founded: "2020",
    revenue: "$1M - $2M",
    employees: "10-25",
    verified: true,
    website: "wellnesspartners.co",
    description: "Telehealth platform connecting patients with wellness professionals",
    rating: 4.9,
    secretary_state_link: "https://www.sos.state.co.us"
  },
  {
    id: "4",
    name: "DataViz Analytics Corp",
    ein: "78-9123456",
    type: "S-Corp",
    industry: "Analytics",
    location: { city: "Seattle", state: "WA", country: "USA" },
    founded: "2018",
    revenue: "$5M - $10M",
    employees: "50-100",
    verified: false,
    website: "dataviz.io",
    description: "Business intelligence and data visualization platform",
    secretary_state_link: "https://www.sos.wa.gov"
  },
  {
    id: "5",
    name: "EcoPackaging Solutions LLC",
    ein: "34-5678912",
    type: "LLC",
    industry: "Manufacturing",
    location: { city: "Portland", state: "OR", country: "USA" },
    founded: "2017",
    revenue: "$2M - $5M",
    employees: "25-50",
    verified: true,
    website: "ecopackaging.com",
    description: "Sustainable packaging materials for eco-conscious brands",
    rating: 4.7,
    secretary_state_link: "https://sos.oregon.gov"
  }
];

const industries = ["All Industries", "Technology", "Healthcare", "Construction", "Manufacturing", "Analytics", "Finance", "Retail"];
const states = ["All States", "CA", "TX", "CO", "WA", "OR", "NY", "FL"];
const entityTypes = ["All Types", "LLC", "S-Corp", "C-Corp", "Sole Proprietorship"];

const Directory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedType, setSelectedType] = useState("All Types");
  const [activeTab, setActiveTab] = useState("all");

  const filteredBusinesses = mockBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === "All Industries" || business.industry === selectedIndustry;
    const matchesState = selectedState === "All States" || business.location.state === selectedState;
    const matchesType = selectedType === "All Types" || business.type === selectedType;
    const matchesTab = activeTab === "all" || (activeTab === "verified" && business.verified);
    
    return matchesSearch && matchesIndustry && matchesState && matchesType && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gradient-depth">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-8 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-lg font-bold">Biz Dev Directory</h1>
                  <p className="text-xs text-muted-foreground">Global business registry</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                {filteredBusinesses.length.toLocaleString()} businesses
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-chrome to-foreground bg-clip-text text-transparent">
            Discover Businesses Worldwide
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Comprehensive database integrated with Secretary of State registries across all 50 US states
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Building2, label: "Total Businesses", value: "2.3M+", color: "text-primary" },
              { icon: CheckCircle2, label: "BD-ID Verified", value: "145K+", color: "text-green-500" },
              { icon: Globe, label: "Countries", value: "195", color: "text-blue-500" },
              { icon: TrendingUp, label: "New This Month", value: "12.4K", color: "text-purple-500" }
            ].map((stat, idx) => (
              <Card key={idx} className="p-4 shadow-elevated border border-border">
                <div className="flex items-center gap-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search businesses by name, EIN, industry, or location..."
              className="pl-12 h-14 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {entityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Businesses</TabsTrigger>
            <TabsTrigger value="verified">
              <Shield className="w-4 h-4 mr-2" />
              BD-ID Verified
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Business Listings */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Listings */}
          <div className="lg:col-span-2">
            <ScrollArea className="h-[calc(100vh-28rem)]">
              <div className="space-y-4 pr-4">
                {filteredBusinesses.map((business) => (
                  <Card key={business.id} className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 bg-gradient-chrome">
                          <div className="flex items-center justify-center w-full h-full font-bold text-navy-deep">
                            {business.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{business.name}</h3>
                            {business.verified && (
                              <Shield className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">{business.type}</Badge>
                            <span>•</span>
                            <span>EIN: {business.ein}</span>
                          </div>
                        </div>
                      </div>
                      {business.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="font-semibold">{business.rating}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{business.description}</p>

                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span>{business.industry}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{business.location.city}, {business.location.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Founded {business.founded}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{business.employees} employees</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex gap-2">
                        {business.website && (
                          <Button variant="outline" size="sm">
                            <Globe className="w-4 h-4 mr-2" />
                            Website
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          SOS Filing
                        </Button>
                      </div>
                      <Button size="sm">
                        View Profile
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Market Insights */}
            <Card className="p-6 shadow-elevated border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Market Insights
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Technology</span>
                    <span className="text-sm font-semibold">38%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '38%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Healthcare</span>
                    <span className="text-sm font-semibold">22%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '22%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Finance</span>
                    <span className="text-sm font-semibold">18%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '18%' }}></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Opportunities */}
            <Card className="p-6 shadow-elevated border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Business Opportunities
              </h3>
              <div className="space-y-3">
                {[
                  { title: "Partnership Opportunity", company: "TechFlow Solutions", type: "Partnership" },
                  { title: "Acquisition Target", company: "DataViz Analytics", type: "M&A" }
                ].map((opp, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-semibold text-sm mb-1">{opp.title}</div>
                    <div className="text-xs text-muted-foreground mb-2">{opp.company}</div>
                    <Badge variant="outline" className="text-xs">{opp.type}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Add Your Business */}
            <Card className="p-6 bg-gradient-primary border-0 shadow-glow">
              <h3 className="font-semibold mb-2 text-primary-foreground">List Your Business</h3>
              <p className="text-sm text-primary-foreground/80 mb-4">
                Get verified and join 145K+ businesses in our directory
              </p>
              <Button variant="secondary" className="w-full" onClick={() => navigate("/verify-identity")}>
                <Shield className="w-4 h-4 mr-2" />
                Get BD-ID Verified
              </Button>
            </Card>
          </div>
        </div>

        {/* Empty State */}
        {filteredBusinesses.length === 0 && (
          <Card className="p-12 text-center shadow-elevated border border-border">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No businesses found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
            <Button onClick={() => {
              setSearchQuery("");
              setSelectedIndustry("All Industries");
              setSelectedState("All States");
              setSelectedType("All Types");
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Directory;