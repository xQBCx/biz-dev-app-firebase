import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  FileText, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  MapPin,
  Users,
  BarChart3
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const XodiakAssets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const assetCategories = [
    { id: "all", label: "All Assets", count: 247 },
    { id: "real-estate", label: "Real Estate", count: 89 },
    { id: "equipment", label: "Equipment", count: 67 },
    { id: "vehicles", label: "Vehicles", count: 45 },
    { id: "intellectual", label: "Intellectual Property", count: 23 },
    { id: "investments", label: "Investments", count: 23 },
  ];

  const assets = [
    {
      id: "AST-001",
      name: "Downtown Office Complex",
      category: "Real Estate",
      value: "$12,500,000",
      location: "New York, NY",
      status: "Active",
      lastValuation: "2025-09-15",
      roi: "+12.3%"
    },
    {
      id: "AST-002",
      name: "Manufacturing Equipment Suite",
      category: "Equipment",
      value: "$3,200,000",
      location: "Chicago, IL",
      status: "Active",
      lastValuation: "2025-08-20",
      roi: "+8.7%"
    },
    {
      id: "AST-003",
      name: "Fleet Vehicles (12 units)",
      category: "Vehicles",
      value: "$890,000",
      location: "Multiple Locations",
      status: "Active",
      lastValuation: "2025-10-01",
      roi: "+5.2%"
    },
    {
      id: "AST-004",
      name: "Patent Portfolio #7",
      category: "Intellectual Property",
      value: "$5,600,000",
      location: "N/A",
      status: "Active",
      lastValuation: "2025-07-10",
      roi: "+18.9%"
    },
  ];

  const portfolioMetrics = [
    {
      title: "Total Asset Value",
      value: "$127.8M",
      change: "+15.2%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Average ROI",
      value: "11.4%",
      change: "+2.1%",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Active Assets",
      value: "247",
      change: "+12",
      icon: Building2,
      trend: "up"
    },
    {
      title: "Under Review",
      value: "8",
      change: "-3",
      icon: FileText,
      trend: "down"
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Asset Management</h1>
          <p className="text-muted-foreground">Track, manage, and optimize your asset portfolio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {assetCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets by name, ID, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Portfolio</CardTitle>
              <CardDescription>Complete list of all managed assets</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Valuation</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.id}</TableCell>
                      <TableCell>{asset.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{asset.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{asset.value}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{asset.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{asset.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{asset.lastValuation}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">{asset.roi}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Analytics</CardTitle>
              <CardDescription>Performance insights and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Asset Distribution
                  </h3>
                  <div className="space-y-2">
                    {assetCategories.slice(1).map((cat) => (
                      <div key={cat.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span>{cat.label}</span>
                        <Badge>{cat.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Top Performing Assets
                  </h3>
                  <div className="space-y-2">
                    {assets.map((asset) => (
                      <div key={asset.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm text-muted-foreground">{asset.category}</div>
                        </div>
                        <div className="text-green-600 font-semibold">{asset.roi}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Valuation</CardTitle>
              <CardDescription>Schedule and track asset valuations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Valuation tools and scheduling coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Maintenance</CardTitle>
              <CardDescription>Track maintenance schedules and history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Maintenance tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default XodiakAssets;
